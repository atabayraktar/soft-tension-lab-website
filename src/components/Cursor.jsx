import { useEffect, useRef } from 'react';

// A small Signal dot on fine pointers only. Grows over hoverable/preview content,
// lerp-smoothed (.14). Never mounts on touch or under prefers-reduced-motion.
export default function Cursor() {
  const dot = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;

    const el = dot.current;
    const root = document.documentElement;
    let tx = -100, ty = -100, x = -100, y = -100, raf = 0, visible = false;

    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!visible) { visible = true; root.setAttribute('data-cursor', 'on'); el.classList.add('is-visible'); }
      const t = e.target.closest('a, button, [data-cursor="grow"], input, select, textarea, label');
      el.classList.toggle('is-grow', !!t);
      el.classList.toggle('is-text', !!(t && t.matches('input, textarea')));
    };
    const onLeave = () => { visible = false; root.removeAttribute('data-cursor'); el.classList.remove('is-visible'); };
    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeAttribute('data-cursor');
    };
  }, []);

  return <div ref={dot} className="cursor" aria-hidden="true" />;
}
