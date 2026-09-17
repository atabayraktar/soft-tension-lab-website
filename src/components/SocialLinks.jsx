import { SITE } from '../lib/site';

// Minimal single-stroke glyphs matching the site's own line-icon language
// (same currentColor/thin-stroke register as Select's chevron) — not an
// imported icon pack, hand-drawn to brand.
const ICONS = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  behance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5h6.3a2.9 2.9 0 0 1 0 5.8H3z" />
      <path d="M3 12.3h6.9a3.2 3.2 0 0 1 0 6.4H3z" />
      <path d="M14.5 7.8h5.2" />
      <path d="M14 14.2a3.6 3.6 0 0 1 7.1.6v.3h-7.1a3.4 3.4 0 0 0 3.55 3.35c1.15 0 1.95-.4 2.65-1.15" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="4" />
      <path d="M10.5 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3.5v11.2a2.9 2.9 0 1 1-2.9-2.9c.33 0 .64.05.94.14" />
      <path d="M13 3.5a5 5 0 0 0 5 5" />
    </svg>
  ),
};

// mail · instagram · behance · youtube · tiktok — fixed order per studio feedback.
const ITEMS = [
  { key: 'mail', label: 'E-posta', href: `mailto:${SITE.email}`, external: false },
  { key: 'instagram', label: 'Instagram', href: SITE.instagram, external: true },
  { key: 'behance', label: 'Behance', href: SITE.behance, external: true },
  { key: 'youtube', label: 'YouTube', href: SITE.youtube, external: true },
  { key: 'tiktok', label: 'TikTok', href: SITE.tiktok, external: true },
];

export default function SocialLinks({ className = '' }) {
  return (
    <ul className={`social ${className}`.trim()} aria-label="Sosyal medya">
      {ITEMS.map((item) => (
        <li key={item.key}>
          <a
            className="social__link"
            href={item.href}
            aria-label={item.label}
            title={item.label}
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {ICONS[item.key]}
          </a>
        </li>
      ))}
    </ul>
  );
}
