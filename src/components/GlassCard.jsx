import { useCallback, useEffect, useRef } from 'react';

/**
 * The single owner of the four-layer liquid-glass markup.
 *
 *   01 effect  — blur + SVG refraction (the physics)
 *   02 tint    — one translucent colour; the ONLY thing a variant changes
 *   03 shine   — ten stacked inset shadows (the thickness) + cursor-following edge light
 *   04 content — never filtered, never blurred
 *
 * variant:    'frost' (nav, cards, forms) · 'clear' (captions, HUD) · 'tint' (dark scenes, veil)
 * refraction: 'chip' 120 · 'nav' 90 · 'card' 70 · 'veil' 40  — matches the surface size
 * radius:     'pill' (nav, buttons, tags) · 'small' (everything else). Nothing in between.
 */

const clamp1 = (v) => (v < -1 ? -1 : v > 1 ? 1 : v);
const readNum = (cs, name, fallback) => {
  const v = parseFloat(cs.getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
};

export default function GlassCard({
  as: Tag = 'div',
  variant = 'frost',
  refraction = 'card',
  radius = 'small',
  className = '',
  contentClassName = '',
  children,
  ...rest
}) {
  const ref = useRef(null);
  // Per-instance motion state, never in React state: this runs at frame rate.
  const st = useRef({
    raf: 0, last: 0,
    ptr: null, dirty: false, inside: false,
    amp: 0, k: 200, c: 17,          // swim amplitude (px) + spring constants, read on enter
    x: 0, y: 0, vx: 0, vy: 0,       // refraction-layer offset + velocity
    tx: 0, ty: 0,                   // its target (pointer-relative), 0,0 once the pointer leaves
  });

  // Glass breathing. One rAF loop owns every per-frame write on the surface:
  //   • the light-spot / edge-highlight position (--mx/--my) — 1:1 with the pointer, one
  //     rect read per frame and only on frames where the pointer actually moved;
  //   • the liquid swim (--lq-x/--lq-y) — the effect layer, whose displacement map lives
  //     in its own local space, is dragged toward the pointer on a damped spring, so the
  //     page seen through the glass flows after the cursor with inertia and sloshes back
  //     when it stops or leaves. That lag-and-settle (not the pointer-locked highlight) is
  //     what reads as liquid. The loop stops itself the moment the spring is at rest, so a
  //     surface the pointer merely rests on costs nothing per frame, and the inline vars
  //     are removed once it has settled back home — no stuck state after a fast leave.
  // Runtime CSS vars only — nothing is styled inline in markup.
  const tick = useCallback((t) => {
    const s = st.current;
    const el = ref.current;
    s.raf = 0;
    if (!el) return;
    const dt = Math.min(0.032, s.last ? (t - s.last) / 1000 : 0.016);
    s.last = t;

    if (s.dirty && s.ptr) {
      s.dirty = false;
      const r = el.getBoundingClientRect();
      const nx = (s.ptr.x - r.left) / r.width;
      const ny = (s.ptr.y - r.top) / r.height;
      el.style.setProperty('--mx', `${nx * 100}%`);
      el.style.setProperty('--my', `${ny * 100}%`);
      if (s.amp) {
        s.tx = clamp1(nx * 2 - 1) * s.amp;
        s.ty = clamp1(ny * 2 - 1) * s.amp * 0.6;
      }
    }
    if (!s.amp) { s.last = 0; return; }

    // damped spring toward the target (semi-implicit Euler; dt is clamped so a dropped
    // frame can never fling it)
    s.vx += (s.k * (s.tx - s.x) - s.c * s.vx) * dt;
    s.vy += (s.k * (s.ty - s.y) - s.c * s.vy) * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    const settled =
      Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05 &&
      Math.abs(s.vx) < 1 && Math.abs(s.vy) < 1;
    if (settled) {
      s.x = s.tx; s.y = s.ty; s.vx = 0; s.vy = 0; s.last = 0;
      if (!s.inside && !s.tx && !s.ty) {
        el.style.removeProperty('--lq-x');
        el.style.removeProperty('--lq-y');
        return;
      }
    }
    el.style.setProperty('--lq-x', `${s.x.toFixed(2)}px`);
    el.style.setProperty('--lq-y', `${s.y.toFixed(2)}px`);
    if (!settled) s.raf = requestAnimationFrame(tick);
  }, []);

  const schedule = useCallback(() => {
    if (!st.current.raf) st.current.raf = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerEnter = useCallback((e) => {
    if (e.pointerType !== 'mouse') return;
    const s = st.current;
    const el = ref.current;
    if (!el) return;
    s.inside = true;
    // The swim only exists where the refraction does (svg mode) and never under
    // reduced motion; amplitude + spring are the surface's own custom properties, read
    // once per entry so a consumer can retune (or zero) them per instance.
    const svg = document.documentElement.getAttribute('data-glass') === 'svg';
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (svg && !rm) {
      const cs = getComputedStyle(el);
      s.amp = Math.max(0, readNum(cs, '--glass-swim', 0));
      s.k = Math.max(1, readNum(cs, '--glass-swim-k', 200));
      const damp = readNum(cs, '--glass-swim-damp', 0.6);
      s.c = 2 * damp * Math.sqrt(s.k);
    } else {
      s.amp = 0;
    }
    s.ptr = { x: e.clientX, y: e.clientY };
    s.dirty = true;
    schedule();
  }, [schedule]);

  const onPointerMove = useCallback((e) => {
    if (e.pointerType !== 'mouse') return;
    const s = st.current;
    s.ptr = { x: e.clientX, y: e.clientY };
    s.dirty = true;
    schedule();
  }, [schedule]);

  const onPointerLeave = useCallback((e) => {
    if (e.pointerType !== 'mouse') return;
    const s = st.current;
    s.inside = false;
    s.tx = 0; s.ty = 0;
    if (s.amp) schedule();
  }, [schedule]);

  useEffect(() => () => { if (st.current.raf) cancelAnimationFrame(st.current.raf); }, []);

  return (
    <Tag
      ref={ref}
      className={`lg lg--${variant} lg--r-${refraction} lg--${radius} ${className}`.trim()}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      <span className="lg__effect" aria-hidden="true" />
      <span className="lg__tint" aria-hidden="true" />
      <span className="lg__shine" aria-hidden="true" />
      <div className={`lg__content ${contentClassName}`.trim()}>{children}</div>
    </Tag>
  );
}
