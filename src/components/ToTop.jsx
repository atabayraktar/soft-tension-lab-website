import { useEffect, useState } from 'react';
import GlassCard from './GlassCard';

// Phones and tablets: any narrow viewport, any touch device (an iPad Pro held sideways is
// wider than 1280px), and phones held sideways.
const SMALL_SCREEN = '(max-width: 1279px), (hover: none) and (pointer: coarse), (max-height: 480px) and (orientation: landscape)';

/**
 * "Back to top" — a small round glass button in the bottom-right corner, phones and tablets
 * only. It is not even in the DOM until the reader is at the very bottom of a page that
 * scrolls, and it then sits just ABOVE the footer (see ToTop.scss), never over its content.
 */
export default function ToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(SMALL_SCREEN);
    let raf = 0;
    const check = () => {
      raf = 0;
      const root = document.documentElement;
      const scrolls = root.scrollHeight > window.innerHeight + 120;
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 24;
      setShow(mq.matches && scrolls && atBottom);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    mq.addEventListener?.('change', schedule);
    // Page swaps and late images change the document height without any scroll event.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    check();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mq.removeEventListener?.('change', schedule);
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
      variant="tint"
      refraction="chip"
      radius="pill"
      className="totop"
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
