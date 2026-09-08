import Link from 'next/link';
import Logo from './Logo';
import { SITE } from '../lib/site';

// The quiet footer. Ana mark, contact, socials, the secondary /services link.
export default function Footer({ theme = 'light' }) {
  const year = new Date().getFullYear();
  return (
    <footer className={`footer footer--${theme}`}>
      <div className="wrap footer__inner">
        <Link href="/" className="footer__brand" aria-label="Soft Tension Lab — ana sayfa">
          <Logo variant="ana" className="footer__mark" decorative />
        </Link>

        <ul className="footer__links" aria-label="İletişim">
          <li><a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          <li><a className="link" href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram <span className="link__arrow" aria-hidden="true">↗</span></a></li>
          <li><a className="link" href={SITE.behance} target="_blank" rel="noopener noreferrer">Behance <span className="link__arrow" aria-hidden="true">↗</span></a></li>
        </ul>

        <ul className="footer__meta">
          <li><Link href="/services/" className="footer__label link">Tüm hizmetler <span className="link__arrow" aria-hidden="true">→</span></Link></li>
          <li className="footer__label">© {year} {SITE.name}</li>
          <li className="footer__label">{SITE.tagline}</li>
        </ul>
      </div>
    </footer>
  );
}
