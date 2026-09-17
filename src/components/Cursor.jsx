import { useEffect, useRef } from 'react';

// A small Signal dot on fine pointers only. Tracks the pointer 1:1 (no lag —
// only the hover ring eases, via CSS transition on `::after`). Never mounts
// on touch or under prefers-reduced-motion.
export default function Cursor() {
  const dot = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;

    const el = dot.current;
    const root = document.documentElement;
    let visible = false;

    const onMove = (e) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      if (!visible) { visible = true; root.setAttribute('data-cursor', 'on'); el.classList.add('is-visible'); }
      const t = e.target.closest('a, button, [data-cursor="grow"], input, select, textarea, label, [role="option"]');
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

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeAttribute('data-cursor');
    };
  }, []);

  return <div ref={dot} className="cursor" aria-hidden="true" />;
}
