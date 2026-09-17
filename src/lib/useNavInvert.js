import { useEffect, useState } from 'react';

/**
 * Watches every [data-nav-invert] section (dark/black full-bleed surfaces —
 * FooterFinale, the Works logo wall, a dark/black Footer) and reports whether
 * one currently sits directly behind the fixed nav bar, so the nav can flip
 * navy <-> paper to stay legible regardless of what's scrolled underneath it —
 * a page's static theme is only the pre-hydration fallback.
 */
export default function useNavInvert(navRef, initial, routeKey) {
  const [invert, setInvert] = useState(initial);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const targets = Array.from(document.querySelectorAll('[data-nav-invert]'));
    if (!targets.length) { setInvert(false); return undefined; }

    const active = new Set();
    let io;

    const build = () => {
      if (io) io.disconnect();
      active.clear();
      const rect = nav.getBoundingClientRect();
      const bottomMargin = window.innerHeight - rect.bottom;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) active.add(entry.target);
            else active.delete(entry.target);
          });
          setInvert(active.size > 0);
        },
        { rootMargin: `${-rect.top}px 0px ${-bottomMargin}px 0px`, threshold: 0 }
      );
      targets.forEach((el) => io.observe(el));
    };

    build();
    window.addEventListener('resize', build);
    return () => {
      window.removeEventListener('resize', build);
      if (io) io.disconnect();
    };
  }, [navRef, routeKey]);

  return invert;
}
