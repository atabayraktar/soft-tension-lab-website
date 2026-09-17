import Link from 'next/link';
import Logo from './Logo';
import SocialLinks from './SocialLinks';
import { SITE } from '../lib/site';

// The quiet footer. Ana mark, contact, socials, the secondary /services link.
export default function Footer({ theme = 'light' }) {
  const year = new Date().getFullYear();
  // The preceding dark sections (LogoWall, FooterFinale) carry the same subtle
  // grain texture — without it here the footer reads as a flatter, slightly
  // different surface even though the base colour matches exactly.
  const grain = theme !== 'light' ? 'grain' : '';
  return (
    <footer className={`footer footer--${theme} ${grain}`.trim()}>
      <div className="wrap footer__inner">
        <Link href="/" className="footer__brand" aria-label="Soft Tension Lab — ana sayfa">
          <Logo variant="ana" className="footer__mark" decorative />
        </Link>

        <SocialLinks className="footer__social" />

        <ul className="footer__meta">
          <li><Link href="/services/" className="footer__label link">Tüm hizmetler <span className="link__arrow" aria-hidden="true">→</span></Link></li>
          <li className="footer__label">© {year} {SITE.name}</li>
          <li className="footer__label">{SITE.tagline}</li>
        </ul>
      </div>
    </footer>
  );
}
