import { useEffect } from 'react';

/**
 * Scroll reveal for every [data-reveal] and .mask element on the current page.
 * Rises 24px from below (or slides out of its mask), once, no exit animation.
 * Re-runs on every route change so newly mounted pages get observed.
 */
export default function useReveal(routeKey) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal], .mask'));
    if (!els.length) return undefined;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [routeKey]);
}
