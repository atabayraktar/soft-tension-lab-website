import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getLenis } from '../lib/useSmoothScroll';

const OUT_MS = 280;      // old page fades to the Paper ground
const IN_MS = 380;       // new page fades up from it
const SETTLE_MS = 30;    // buffer after the fade-out before the route is pushed
const STUCK_MS = 4000;   // safety: never leave the page hidden longer than this

/**
 * Perceptually multi-page, technically one app: the current page fades out, the URL
 * changes behind an invisible page, the new page fades in. Only `opacity` animates, and
 * only on this wrapper (page + footer) — the nav, cursor, scrollbar and to-top button are
 * siblings, so the fixed glass chrome never moves, blurs or fades.
 *
 * Internal link clicks are intercepted (capture phase, before next/link sees them) so the
 * navigation is pushed only once the old page is fully invisible — that is what keeps the
 * swap and the scroll-to-top from ever showing. A navigation not started by a click
 * (back/forward, programmatic push) cuts to the ground instantly and fades the new page in.
 * Under prefers-reduced-motion nothing is intercepted and nothing animates.
 */
export default function PageVeil({ children }) {
  const router = useRouter();
  const el = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const node = el.current;
    let timer = 0;
    let stuck = 0;
    let target = null;       // URL waiting to be pushed once the fade-out has finished
    let pushed = false;      // true between our router.push and its complete/error

    const setPhase = (phase) => {
      if (phase) node.dataset.phase = phase;
      else delete node.dataset.phase;
    };
    const clear = () => { clearTimeout(timer); clearTimeout(stuck); };

    const reveal = () => {
      clear();
      pushed = false;
      target = null;
      // Two frames so the freshly mounted page is painted at opacity 0 before it transitions.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setPhase('in');
        timer = setTimeout(() => setPhase(null), IN_MS);
      }));
    };

    const push = () => {
      const url = target;
      target = null;
      pushed = true;
      router.push(url).catch(() => {});
      clearTimeout(stuck);
      stuck = setTimeout(reveal, STUCK_MS);
    };

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      const samePage = url.pathname === location.pathname && url.search === location.search;
      if (url.hash && samePage) return;   // in-page anchor (skip link etc.)

      e.preventDefault();
      target = url.pathname + url.search + url.hash;
      router.prefetch(url.pathname).catch(() => {});

      if (pushed) { push(); return; }     // already navigating: retarget immediately
      if (node.dataset.phase === 'out') return;   // fade-out in flight: it will push `target`
      clear();
      setPhase('out');
      timer = setTimeout(push, OUT_MS + SETTLE_MS);
    };

    // A navigation we did not start (popstate, programmatic push): hide instantly.
    const onStart = (url, { shallow }) => {
      if (shallow || pushed) return;
      clear();
      setPhase('cut');
      stuck = setTimeout(reveal, STUCK_MS);
    };
    const onDone = (url) => {
      if (!url.includes('#')) {
        getLenis()?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      reveal();
    };
    const onError = (err) => {
      if (err?.cancelled) return;         // superseded by a newer push — that one will settle
      reveal();
    };

    document.addEventListener('click', onClick, true);
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onError);
    return () => {
      clear();
      document.removeEventListener('click', onClick, true);
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onError);
    };
    // `router.events` is the stable singleton; the public router object is recreated on
    // every navigation and would tear the in-flight timers down mid-fade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events]);

  return <div ref={el} className="veil">{children}</div>;
}
