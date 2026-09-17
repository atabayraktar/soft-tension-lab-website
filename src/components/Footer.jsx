import Link from 'next/link';
import Logo from './Logo';
import SocialLinks from './SocialLinks';
import { SITE } from '../lib/site';

// Single-line footer: monogram + logotype (same size/colour, side by side) ·
// copyright · social + KVKK.
export default function Footer({ theme = 'light' }) {
  const year = new Date().getFullYear();
  // The preceding dark sections (LogoWall, FooterFinale) carry the same subtle
  // grain texture — without it here the footer reads as a flatter, slightly
  // different surface even though the base colour matches exactly.
  const grain = theme !== 'light' ? 'grain' : '';
  return (
    <footer className={`footer footer--${theme} ${grain}`.trim()} data-nav-invert={theme !== 'light' ? true : undefined}>
      <div className="wrap footer__row">
        <Link href="/" className="footer__brand" aria-label="Soft Tension Lab — ana sayfa">
          <Logo variant="monogram" className="footer__mark" decorative />
          <Logo variant="logotype" className="footer__mark" decorative />
        </Link>

        <div className="footer__copy">
          <p className="footer__label">© {year} {SITE.name} | Tüm hakları saklıdır.</p>
        </div>

        <div className="footer__actions">
          <SocialLinks className="footer__social" />
          <a href="/kvkk/" target="_blank" rel="noopener noreferrer" className="footer__label link">KVKK</a>
        </div>
      </div>
    </footer>
  );
}
