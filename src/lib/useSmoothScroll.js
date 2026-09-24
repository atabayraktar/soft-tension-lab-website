import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Eased (inertia) scroll on fine-pointer desktops only — mouse/trackpad wheel input is
 * smoothed instead of jumping straight to it. Touch devices keep native momentum
 * scrolling untouched (Lenis's own `syncTouch` stays off).
 *
 * Backed by Lenis rather than a hand-rolled rAF loop: it drives the real
 * document scroll position (window.scrollY / native 'scroll' events keep firing, so
 * useReveal, useGlassMode and TopplingText need no changes), and it already handles the
 * edge cases a custom implementation kept getting wrong — trackpad momentum tails,
 * resize, and not fighting non-wheel scrolls (keyboard, scrollbar, browser scroll
 * restoration). PageVeil resets scroll itself at the moment the page is invisible; the
 * routeChangeComplete reset below is the reduced-motion / no-veil fallback.
 *
 * Lenis (~33 KB) is code-split and imported here, after hydration and only on fine
 * pointers: touch devices never download it, and on desktop it stays off the scripts a
 * first paint waits on. Until it lands (a few ms after mount) scrolling is simply native.
 */
let instance = null;

/** The live Lenis instance, or null where smooth scroll is off (touch, SSR, not yet loaded). */
export const getLenis = () => instance;

export default function useSmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return undefined;

    let lenis = null;
    let alive = true;
    import('lenis').then(({ default: Lenis }) => {
      if (!alive) return;
      lenis = new Lenis({ autoRaf: true, anchors: true });
      instance = lenis;
    });
    // Not for a section URL (Nav.jsx lands on the section itself) and not for the shallow
    // hydration replace Next runs on an auto-exported page (`/#hizmetler` opened directly
    // would otherwise be pulled back to the top right after the browser's hash jump).
    const onRouteChange = (url, { shallow } = {}) => {
      if (shallow || String(url).includes('#')) return;
      if (lenis) lenis.scrollTo(0, { immediate: true });
    };
    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      alive = false;
      router.events.off('routeChangeComplete', onRouteChange);
      if (lenis) {
        if (instance === lenis) instance = null;
        lenis.destroy();
      }
    };
  }, [router.events]);
}
