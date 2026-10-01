import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import GlassCard from './GlassCard';
import Logo from './Logo';
import useNavInvert from '../lib/useNavInvert';
import { getLenis } from '../lib/useSmoothScroll';
import { NAV } from '../lib/site';

const LAND_LOWER = 0.2;   // desktop: extra scroll, as a share of the band below's height
const HOLD_MS = 1600;     // how long a cross-page / direct-URL landing keeps re-asserting itself

/**
 * Where the page has to scroll to for the section to sit under the floating bar — a
 * document offset, clamped to what the page can actually scroll. null if the section
 * isn't on the page.
 */
function sectionTarget(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const bar = document.querySelector('.nav__bar');
  const offset = bar ? Math.round(bar.getBoundingClientRect().bottom) : 0;
  // What is landed on: the section, or (data-land-with="siblings") the section with the
  // bands around it. The span from the middle of the band above to the middle of the band
  // below is centred in the area under the bar — so both bands show at least their inner
  // halves (more when there is room). If even that span is taller than the area, the band
  // above keeps its lower half under the bar and the section's head with it; the band
  // below shows what is left.
  let { top: spanTop, bottom: spanBottom } = el.getBoundingClientRect();
  if (el.dataset.landWith === 'siblings') {
    const prev = el.previousElementSibling, nextEl = el.nextElementSibling;
    if (prev) { const r = prev.getBoundingClientRect(); spanTop = Math.min(spanTop, r.top + r.height / 2); }
    if (nextEl) { const r = nextEl.getBoundingClientRect(); spanBottom = Math.max(spanBottom, r.bottom - r.height / 2); }
  }
  const avail = window.innerHeight - offset;
  const spanH = spanBottom - spanTop;
  const centre0 = spanH <= avail ? (avail - spanH) / 2 : 0;
  // Desktop only: sits a touch lower than centred so the band below shows more of itself.
  const below = el.dataset.landWith === 'siblings' && el.nextElementSibling
    ? el.nextElementSibling.getBoundingClientRect().height : 0;
  const centre = window.innerWidth >= 1280 ? centre0 - below * LAND_LOWER : centre0;
  // A number, not the element: Lenis would resolve an element against its own animated
  // position (stale right after a native jump) and subtract scroll-margin-top on top of
  // the offset.
  const top = Math.round(spanTop + window.scrollY - offset - centre);
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, top), max);
}

/**
 * Scrolls to an in-page section, clearing the floating bar: through Lenis where it runs
 * (fine pointers — same easing as every other scroll on the site), the native smooth
 * scroll elsewhere. `immediate` lands without motion (a page swap behind PageVeil, or
 * reduced motion).
 */
function scrollToSection(id, { immediate = false } = {}) {
  const top = sectionTarget(id);
  if (top == null) return false;
  const calm = immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = getLenis();
  if (lenis) {
    // Lenis clamps to its cached limit, which is stale right after a page swap (the new
    // page's height is not measured yet) — re-measure or the landing stops short.
    lenis.resize();
    lenis.scrollTo(top, { immediate: calm, force: true });
  } else {
    window.scrollTo({ top, behavior: calm ? 'instant' : 'smooth' });
  }
  return true;
}

/**
 * Lands on a section without motion and then HOLDS it there for a while: every frame the
 * target is recomputed against the live layout and, if the page has drifted off it, put
 * back — until it has sat still for HOLD_MS, the user scrolls themselves, or `stop()` is
 * called (next navigation, unmount).
 *
 * A one-shot landing was not enough on a phone, because the position keeps being moved
 * out from under it after the page swap, by things this component doesn't control:
 *   - Next's own hash handling: Container#componentDidUpdate calls scrollIntoView() in a
 *     setTimeout(0) with no smooth-scroll guard, so under html { scroll-behavior: smooth }
 *     it animated across the whole page for ~1s — native smooth scrolling is switched off
 *     for the hold so that (and anything else) lands instantly and is corrected next frame;
 *   - the menu sheet's scroll-lock restore (a passive-effect cleanup from the close);
 *   - the layout settling: the hero's display face swapping in, the pin's svh height, the
 *     footer publishing --footer-h — each moves the section's offset after the first land.
 * (The browser's scroll anchoring, which sent the page to its very end on the swap, is
 * switched off in globals.scss rather than fought here.)
 * Only instant, idempotent scrolls are issued, so the user never sees it work.
 */
function holdLanding(id) {
  const html = document.documentElement;
  const lenis = getLenis();
  let alive = true;
  let raf = 0;
  let timer = 0;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';

  const stop = () => {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    html.style.scrollBehavior = prevBehavior;
    STOP_ON.forEach((ev) => window.removeEventListener(ev, stop));
  };
  const land = () => {
    if (!alive) return;
    const top = sectionTarget(id);
    if (top == null) { stop(); return; }
    if (Math.abs(window.scrollY - top) <= 1) return;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(top, { immediate: true, force: true });
    } else {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };
  const tick = () => { if (!alive) return; land(); raf = requestAnimationFrame(tick); };

  land();
  // Queued after Next's own setTimeout(0) scrollIntoView (registered during the commit,
  // before routeChangeComplete) — so the first thing after it is the correction.
  setTimeout(land, 0);
  // Fonts: the hero runs Whyte Inktrap Heavy at display size; the fallback-font layout it
  // paints with first is a different height, so the offset moves when the face arrives.
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(land), () => {});
  raf = requestAnimationFrame(tick);
  timer = setTimeout(stop, HOLD_MS);
  // The user taking over ends the hold at once — it must never fight a real scroll.
  STOP_ON.forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
  return stop;
}
const STOP_ON = ['touchstart', 'wheel', 'keydown', 'pointerdown'];

/**
 * The floating liquid-glass pill bar. Logotype left (Ana mark on compact widths),
 * SERVICES · WORKS · SHOP · ABOUT · CONTACT right. Always visible, never hides on scroll.
 * Below the lg breakpoint the items collapse into a glass menu sheet.
 *
 * Services is an in-page target (Home's #hizmetler, `scroll` in NAV): on Home it scrolls
 * there; from any other page the usual veiled navigation loads Home and the section is
 * landed on while the page is still hidden, so it fades in already in place.
 *
 * Colour isn't fixed per page: it tracks whatever's actually scrolled behind
 * the bar (see useNavInvert) so it stays legible over a mixed-theme page like
 * Home (light hero/showcase, then a black FooterFinale + footer at the
 * bottom) — `theme` is only the pre-hydration fallback for pages that are
 * dark from the very top (Works).
 */
export default function Nav({ theme = 'light' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef(null);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const invert = useNavInvert(navRef, theme !== 'light', router.asPath);
  const navTheme = invert ? 'dark' : 'light';
  const pending = useRef(null);   // section to land on once the Home page has mounted
  const holding = useRef(null);   // stop() of the landing currently being held (see holdLanding)
  // The item just tapped/clicked: its underline grows immediately, before the page
  // transition even starts, and holds through it — `isActive` below then keeps it lit if
  // this turns out to be the landed-on page, so there's no gap between "pressed" and "active".
  const [pressedHref, setPressedHref] = useState(null);

  // A section link is never "the current page".
  const isActive = (href) => !href.includes('#') && (router.asPath === href || router.asPath.startsWith(href));
  const isLit = (item) => isActive(item.href) || pressedHref === item.href;

  // iOS WebKit (Safari and, since it's the same engine, Chrome-for-iOS too) spends a tap
  // outside a focused text field just dismissing the keyboard — it does not also deliver a
  // click to whatever was tapped. On Contact, where a form field is often still focused,
  // that ate the first tap on the toggle (and any nav link): open the menu, then tap it
  // again and nothing happens. Blurring on the physical touch-down, ahead of that, lets the
  // same tap's click go through once the field lets go.
  const onNavPointerDown = () => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable)) {
      active.blur();
    }
  };

  const onItemClick = (item) => (e) => {
    setPressedHref(item.href);
    if (!item.scroll) return;
    if (router.pathname === '/') {
      // Same page. PageVeil leaves in-page anchors alone, but Lenis's own anchor handler
      // (on window, bubble) would also scroll — with no bar offset — so this owns the click.
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      // Two frames: the menu sheet's close (if it was open) has unpinned the page and put
      // the scroll offset back by then, so the section is measured against the real page.
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(item.scroll)));
      // Services never becomes "the current page" (see isActive), so nothing else clears
      // its underline the way a real navigation does — fade it back out once the scroll lands.
      setTimeout(() => setPressedHref((h) => (h === item.href ? null : h)), 900);
    } else {
      // Other page: let the veiled navigation run (PageVeil pushes the hash URL); the
      // landing happens in the routeChangeComplete handler below.
      pending.current = item.scroll;
    }
  };

  // Once a navigation actually lands (or fails), `isActive` has taken over the underline
  // for whichever item that turned out to be — the temporary "pressed" one can let go.
  useEffect(() => {
    const clear = () => setPressedHref(null);
    router.events.on('routeChangeComplete', clear);
    router.events.on('routeChangeError', clear);
    return () => {
      router.events.off('routeChangeComplete', clear);
      router.events.off('routeChangeError', clear);
    };
  }, [router.events]);

  // Close on route change, on Escape, and lock scroll while open.
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  // Cross-page section landing. routeChangeComplete fires synchronously once the new page
  // has been committed, before it is painted; PageVeil (registered after this, so its
  // reveal is queued behind this) is still holding it invisible and — for a section URL —
  // neither it nor Next (pushed with scroll: false) moves the page. So the landing starts
  // here, under the veil, and is then held while the page settles (see holdLanding): the
  // section is what fades in, and it stays.
  useEffect(() => {
    const done = () => {
      const id = pending.current;
      if (!id) return;
      pending.current = null;
      holding.current?.();
      holding.current = holdLanding(id);
    };
    const start = () => { holding.current?.(); holding.current = null; };
    const fail = () => { pending.current = null; };
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', fail);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', fail);
      holding.current?.();
      holding.current = null;
    };
  }, [router.events]);

  // A section URL opened directly (`/#hizmetler`): the browser's own hash jump (and
  // Next's repeat of it on mount) happen before the fonts and the hero's pin have their
  // final height, so the section drifts away from the top — land on it and hold it while
  // the layout settles. Without JS the native jump + scroll-margin-top stands on its own.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !NAV.some((item) => item.scroll === id)) return undefined;
    holding.current?.();
    holding.current = holdLanding(id);
    return () => { holding.current?.(); holding.current = null; };
    // Once, on mount: the in-app navigations are handled by the handlers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);

    // Scroll lock: pin the body at the current offset (html.is-menu-open, see Nav.scss —
    // overflow: hidden alone is ignored by iOS), pause Lenis where it runs, and put the
    // page back at exactly the same offset on close so nothing jumps.
    const html = document.documentElement;
    const y = window.scrollY;
    const lenis = getLenis();
    lenis?.stop();
    html.style.setProperty('--lock-y', `${-y}px`);
    html.classList.add('is-menu-open');

    const first = sheetRef.current?.querySelector('a');
    first?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
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
  }, [open]);

  return (
    <header ref={navRef} className={`nav nav--${navTheme} ${open ? 'is-open' : ''}`.trim()} onPointerDown={onNavPointerDown}>
      <a href="#main" className="skip-link">İçeriğe atla</a>

      <GlassCard as="div" variant="frost" refraction="nav" radius="pill" className="nav__bar" contentClassName="nav__inner">
        <Link href="/" className="nav__brand" aria-label="SOFT TENSION LAB — ana sayfa">
          <Logo variant="ana" className="nav__ana" decorative />
        </Link>

        <nav className="nav__links" aria-label="Ana menü">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  // A section link lands itself (holdLanding): Next must neither reset to
                  // the top nor do its own hash scroll — this covers the reduced-motion
                  // path, where the Link navigates by itself; PageVeil's push does the same.
                  scroll={item.scroll ? false : undefined}
                  className={`nav__link ${isLit(item) ? 'is-active' : ''}`.trim()}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={onItemClick(item)}
                >
                  {item.labelUpper}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-sheet"
          aria-label={open ? 'Kapat' : 'Menü'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav__toggle-icon" aria-hidden="true"><i /><i /></span>
        </button>
      </GlassCard>

      {/* Glass menu sheet (mobile / tablet). Rendered always so the pill→sheet morph
          (a clip-path transition, see Nav.scss) can run both ways; when closed it is
          `visibility: hidden` after the shrink settles — inert, unfocusable, unpainted. */}
      <GlassCard
        as="div"
        id="nav-sheet"
        variant="tint"
        refraction="veil"
        radius="small"
        className="nav__sheet"
        contentClassName="nav__sheet-inner"
      >
        <nav aria-label="Mobil menü" ref={sheetRef}>
          <ul className="nav__sheet-list">
            {NAV.map((item, i) => (
              <li key={item.href} className={`nav__sheet-item nav__sheet-item--${i + 1}`}>
                <Link
                  href={item.href}
                  scroll={item.scroll ? false : undefined}
                  className={`nav__sheet-link ${isLit(item) ? 'is-active' : ''}`.trim()}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={onItemClick(item)}
                >
                  {item.labelUpper}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </GlassCard>
    </header>
  );
}
