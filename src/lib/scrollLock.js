import { getLenis } from './useSmoothScroll';

/**
 * Pin the page while a full-screen overlay is open (the nav's menu sheet pattern, shared
 * so a second overlay never re-implements it). `overflow: hidden` alone is ignored by
 * iOS Safari, so the body is fixed at the negative scroll offset (html.is-menu-open +
 * --lock-y, see Nav.scss); Lenis is paused where it runs. Returns the unlock function,
 * which puts the page back at exactly the same offset so nothing jumps.
 */
export function lockScroll() {
  const html = document.documentElement;
  const y = window.scrollY;
  const lenis = getLenis();
  lenis?.stop();
  html.style.setProperty('--lock-y', `${-y}px`);
  html.classList.add('is-menu-open');

  return () => {
    html.classList.remove('is-menu-open');
    html.style.removeProperty('--lock-y');
    window.scrollTo({ top: y, behavior: 'instant' });
    if (lenis) {
      lenis.start();
      // Lenis clamps scrollTo() to its cached limit, which read as 0 while the body was
      // pinned — re-measure first or the restore snaps to the top.
      lenis.resize();
      lenis.scrollTo(y, { immediate: true, force: true });
    }
  };
}
