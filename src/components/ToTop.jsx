import { useEffect, useState } from 'react';
import GlassCard from './GlassCard';

/**
 * "Back to top" — a small round glass button in the bottom-right corner, every breakpoint.
 * It is not even in the DOM until the reader is at the very bottom of a page that scrolls,
 * and it then sits just ABOVE the footer (see ToTop.scss), never over its content.
 *
 * `theme` mirrors the footer it sits on (light/dark/black — see Footer.jsx) so the glass
 * stays genuinely transparent (the `clear` tint, not a solid ink fill) while the arrow
 * still reads: ink on the usual light footer, paper on a dark/black one.
 */
export default function ToTop({ theme = 'light' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const root = document.documentElement;
      const scrolls = root.scrollHeight > window.innerHeight + 120;
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 24;
      setShow(scrolls && atBottom);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Page swaps and late images change the document height without any scroll event.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    check();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, []);

  if (!show) return null;

  const onClick = () => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  };

  return (
    <GlassCard
      as="button"
      type="button"
      variant="clear"
      refraction="chip"
      radius="pill"
      className={`totop totop--${theme}`}
      contentClassName="totop__inner"
      aria-label="Sayfanın başına dön"
      onClick={onClick}
    >
      <svg className="totop__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </GlassCard>
  );
}
