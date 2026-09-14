import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Lenis from 'lenis';

/**
 * Eased (inertia) scroll on fine-pointer desktops only — mouse/trackpad wheel input is
 * smoothed instead of jumping straight to it. Touch devices keep native momentum
 * scrolling untouched (Lenis's own `syncTouch` stays off).
 *
 * Backed by Lenis rather than a hand-rolled rAF loop: it drives the real
 * document scroll position (window.scrollY / native 'scroll' events keep firing, so
 * useReveal, useGlassMode and TopplingText need no changes), and it already handles the
 * edge cases a custom implementation kept getting wrong — trackpad momentum tails,
 * resize, and not fighting non-wheel scrolls (keyboard, scrollbar, PageVeil's
 * scroll-to-top, browser scroll restoration).
 */
let instance = null;

/** The live Lenis instance, or null where smooth scroll is off (touch, SSR). */
export const getLenis = () => instance;

export default function useSmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return undefined;

    const lenis = new Lenis({ autoRaf: true, anchors: true });
    instance = lenis;
    const onRouteChange = () => lenis.scrollTo(0, { immediate: true });
    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
      if (instance === lenis) instance = null;
      lenis.destroy();
    };
  }, [router.events]);
}
