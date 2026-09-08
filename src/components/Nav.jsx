import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import GlassCard from './GlassCard';
import Logo from './Logo';
import { NAV, SITE } from '../lib/site';

/**
 * The floating liquid-glass pill bar. Logotype left (Ana mark on compact widths),
 * ABOUT · WORKS · CONTACT · SHOP right. Always visible, never hides on scroll.
 * Below the lg breakpoint the items collapse into a glass menu sheet.
 */
export default function Nav({ theme = 'light' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef(null);
  const toggleRef = useRef(null);

  const isActive = (href) => router.asPath === href || router.asPath.startsWith(href);

  // Close on route change, on Escape, and lock scroll while open.
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = sheetRef.current?.querySelector('a');
    first?.focus({ preventScroll: true });
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header className={`nav nav--${theme} ${open ? 'is-open' : ''}`.trim()}>
      <a href="#main" className="skip-link">İçeriğe atla</a>

      <GlassCard as="div" variant="frost" refraction="nav" radius="pill" className="nav__bar" contentClassName="nav__inner">
        <Link href="/" className="nav__brand" aria-label="Soft Tension Lab — ana sayfa">
          <Logo variant="logotype" className="nav__logotype" decorative />
          <Logo variant="ana" className="nav__ana" decorative />
        </Link>

        <nav className="nav__links" aria-label="Ana menü">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`nav__link ${isActive(item.href) ? 'is-active' : ''}`.trim()} aria-current={isActive(item.href) ? 'page' : undefined}>
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
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav__toggle-label">{open ? 'Kapat' : 'Menü'}</span>
          <span className="nav__toggle-icon" aria-hidden="true"><i /><i /></span>
        </button>
      </GlassCard>

      {/* Glass menu sheet (mobile / tablet). Rendered always for a11y tree stability,
          hidden with the `hidden` attribute when closed. */}
      <GlassCard
        as="div"
        id="nav-sheet"
        variant="tint"
        refraction="veil"
        radius="small"
        className="nav__sheet"
        contentClassName="nav__sheet-inner"
        hidden={!open}
      >
        <nav aria-label="Mobil menü" ref={sheetRef}>
          <ul className="nav__sheet-list">
            {NAV.map((item, i) => (
              <li key={item.href} className={`nav__sheet-item nav__sheet-item--${i + 1}`}>
                <Link href={item.href} className={`nav__sheet-link ${isActive(item.href) ? 'is-active' : ''}`.trim()} aria-current={isActive(item.href) ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__sheet-foot">
          <a className="nav__sheet-mail link" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <a className="nav__sheet-ig" href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
        </div>
      </GlassCard>
    </header>
  );
}
