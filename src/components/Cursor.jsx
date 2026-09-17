import { useEffect, useRef } from 'react';

// A small Signal dot on fine pointers only, plus a hairline crosshair (full-height
// vertical + full-width horizontal guide) that tracks it — a coordinate-readout
// feel, kept barely-there ($ink-15). All three track the pointer 1:1 (no lag —
// only the dot's hover ring eases, via CSS transition on `::after`). Never mounts
// on touch or under prefers-reduced-motion.
export default function Cursor() {
  const dot = useRef(null);
  const lineX = useRef(null);
  const lineY = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;

    const el = dot.current;
    const elX = lineX.current;
    const elY = lineY.current;
    const root = document.documentElement;
    let visible = false;

    const onMove = (e) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      elX.style.transform = `translate3d(${e.clientX}px, 0, 0)`;
      elY.style.transform = `translate3d(0, ${e.clientY}px, 0)`;
      if (!visible) {
        visible = true;
        root.setAttribute('data-cursor', 'on');
        el.classList.add('is-visible');
        elX.classList.add('is-visible');
        elY.classList.add('is-visible');
      }
      const t = e.target.closest('a, button, [data-cursor="grow"], input, select, textarea, label, [role="option"]');
      el.classList.toggle('is-grow', !!t);
      el.classList.toggle('is-text', !!(t && t.matches('input, textarea')));
    };
    const onLeave = () => {
      visible = false;
      root.removeAttribute('data-cursor');
      el.classList.remove('is-visible');
      elX.classList.remove('is-visible');
      elY.classList.remove('is-visible');
    };
    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeAttribute('data-cursor');
    };
  }, []);

  return (
    <>
      <div ref={lineX} className="cursor-line cursor-line--v" aria-hidden="true" />
      <div ref={lineY} className="cursor-line cursor-line--h" aria-hidden="true" />
      <div ref={dot} className="cursor" aria-hidden="true" />
    </>
  );
}
