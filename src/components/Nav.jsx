import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import GlassCard from './GlassCard';
import Logo from './Logo';
import useNavInvert from '../lib/useNavInvert';
import { getLenis } from '../lib/useSmoothScroll';
import { NAV } from '../lib/site';

const LAND_LOWER = 0.2;   // desktop: extra scroll, as a share of the band below's height

/**
 * Scrolls to an in-page section, clearing the floating bar: through Lenis where it runs
 * (fine pointers — same easing as every other scroll on the site), the native smooth
 * scroll elsewhere. `immediate` lands without motion (a page swap behind PageVeil, or
 * reduced motion).
 */
function scrollToSection(id, { immediate = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
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
  const calm = immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = getLenis();
  if (lenis) {
    // Lenis clamps to its cached limit, which is stale right after a page swap (the new
    // page's height is not measured yet) — re-measure or the landing stops short. It may
    // also be stopped by the hero's settle-hold; start it, and tag the scroll so the hero
    // lets it pass (TopplingPhysics reads `passHero`; Lenis clears userData on completion).
    lenis.resize();
    lenis.start();
    lenis.scrollTo(top, { immediate: calm, force: true, userData: { passHero: true } });
  } else {
    window.scrollTo({ top, behavior: calm ? 'instant' : 'smooth' });
  }
  return true;
}

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

  // A section link is never "the current page".
  const isActive = (href) => !href.includes('#') && (router.asPath === href || router.asPath.startsWith(href));

  const onItemClick = (item) => (e) => {
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
    } else {
      // Other page: let the veiled navigation run (PageVeil pushes the hash URL); the
      // landing happens in the routeChangeComplete handler below.
      pending.current = item.scroll;
    }
  };

  // Close on route change, on Escape, and lock scroll while open.
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  // Cross-page section landing. routeChangeComplete fires once the new page has rendered;
  // PageVeil (registered after this, so its reveal is queued behind this) is still holding
  // it invisible, and the app-level scroll-to-top has run — so land here, without motion,
  // and the section is what fades in.
  useEffect(() => {
    const done = () => {
      const id = pending.current;
      if (!id) return;
      pending.current = null;
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id, { immediate: true })));
    };
    const fail = () => { pending.current = null; };
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', fail);
    return () => {
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', fail);
    };
  }, [router.events]);

  // A section URL opened directly (`/#hizmetler`): the browser's own hash jump happens
  // before the fonts and the hero's pin have their final height, so the section drifts
  // away from the top — land on it again, without motion, once the layout has settled.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !NAV.some((item) => item.scroll === id)) return undefined;
    let alive = true;
    let raf = 0;
    const land = () => {
      if (!alive) return;
      raf = requestAnimationFrame(() => requestAnimationFrame(() => { if (alive) scrollToSection(id, { immediate: true }); }));
    };
    (document.fonts?.ready ?? Promise.resolve()).then(land, land);
    return () => { alive = false; cancelAnimationFrame(raf); };
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
    <header ref={navRef} className={`nav nav--${navTheme} ${open ? 'is-open' : ''}`.trim()}>
      <a href="#main" className="skip-link">İçeriğe atla</a>

      <GlassCard as="div" variant="frost" refraction="nav" radius="pill" className="nav__bar" contentClassName="nav__inner">
        <Link href="/" className="nav__brand" aria-label="Soft Tension Lab — ana sayfa">
          <Logo variant="ana" className="nav__ana" decorative />
        </Link>

        <nav className="nav__links" aria-label="Ana menü">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav__link ${isActive(item.href) ? 'is-active' : ''}`.trim()}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={onItemClick(item)}
                >
                  {item.label}
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
                  className={`nav__sheet-link ${isActive(item.href) ? 'is-active' : ''}`.trim()}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={onItemClick(item)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </GlassCard>
    </header>
  );
}
