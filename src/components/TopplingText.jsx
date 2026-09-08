import { useEffect, useMemo, useRef } from 'react';

// Deterministic per-glyph parameters — the same letter always falls the same way.
const hash = (n) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * "Yıkılan harfler" — the headline splits into glyphs that topple with the scroll.
 * Physically consistent: each glyph tips over its bottom corner (rotation grows with a
 * gravity curve), then drops. Values are spring-smoothed so scrolling back up lets the
 * word stand again with a small settle. Only `transform` is written.
 *
 * mode="scroll"  — progress follows the scroll through the parent section (Home hero)
 * mode="load"    — the glyphs settle in once on mount (404, holding page)
 * Disabled under prefers-reduced-motion: the text simply stands.
 */
export default function TopplingText({ text, as: Tag = 'span', mode = 'scroll', className = '', range = 0.6 }) {
  const rootRef = useRef(null);

  const words = useMemo(() => text.split(' '), [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const glyphs = Array.from(root.querySelectorAll('.tt__g'));
    const n = glyphs.length;
    const params = glyphs.map((_, i) => {
      const r1 = hash(i + 1), r2 = hash(i + 101), r3 = hash(i + 211);
      const dir = r3 > 0.5 ? 1 : -1;
      return {
        start: r1 * 0.45,                     // when this glyph begins to give way
        rot: dir * (22 + r2 * 60),            // deg
        drop: 0.55 + r2 * 0.9,                // × section height
        drift: dir * (8 + r1 * 26),           // px
      };
    });
    glyphs.forEach((g, i) => { g.style.transformOrigin = params[i].rot > 0 ? '100% 100%' : '0% 100%'; });

    const cur = new Float32Array(n);      // smoothed progress per glyph
    const vel = new Float32Array(n);
    let target = 0, raf = 0, running = false, section = root.closest('[data-topple-scope]') || root.parentElement;

    const apply = () => {
      let settled = true;
      for (let i = 0; i < n; i += 1) {
        const p = params[i];
        const local = Math.min(1, Math.max(0, (target - p.start) / (1 - p.start)));
        const goal = local * local;                 // gravity: slow start, fast end
        // spring toward goal (k = .12, damping .74) — settles with a small bounce
        vel[i] = (vel[i] + (goal - cur[i]) * 0.12) * 0.74;
        cur[i] += vel[i];
        if (Math.abs(goal - cur[i]) > 0.0008 || Math.abs(vel[i]) > 0.0008) settled = false;
        const q = cur[i];
        if (q <= 0.0005) { glyphs[i].style.transform = ''; continue; }
        const h = section ? section.offsetHeight : 600;
        glyphs[i].style.transform =
          `translate3d(${(q * p.drift).toFixed(2)}px, ${(q * q * p.drop * h).toFixed(1)}px, 0) rotate(${(q * p.rot).toFixed(2)}deg)`;
      }
      if (settled) { running = false; return; }
      raf = requestAnimationFrame(apply);
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(apply); } };

    if (mode === 'load') {
      // Stand the word up from a toppled state: start collapsed, spring to upright.
      for (let i = 0; i < n; i += 1) cur[i] = 1;
      target = 0;
      kick();
      return () => cancelAnimationFrame(raf);
    }

    const onScroll = () => {
      const h = section ? section.offsetHeight : window.innerHeight;
      target = Math.min(1, Math.max(0, window.scrollY / (h * range)));
      kick();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [mode, range, text]);

  let idx = 0;
  return (
    <Tag ref={rootRef} className={`tt ${className}`.trim()}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="tt__line">
        {words.map((word, wi) => (
          <span key={wi} className="tt__w">
            {Array.from(word).map((ch) => {
              idx += 1;
              return (
                <span key={idx} className="tt__g">{ch}</span>
              );
            })}
            {wi < words.length - 1 ? <span className="tt__space"> </span> : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
