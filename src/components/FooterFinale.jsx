import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ScrambleText from './ScrambleText';
import NotifyForm from './NotifyForm';
import { FINALE_LINES, SITE } from '../lib/site';

const COPY_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);
const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 12.5l5 5L20 7" />
  </svg>
);

// The mail line under the notify form: click the address to open a mail client, or the
// small icon beside it to copy it instead — one or the other, never both from one tap.
function MailLine() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (no permission, no secure context) — the mailto link still works.
    }
  };

  return (
    <p className="finale__mail">
      <span className="finale__mail-wrap">
        <a href={`mailto:${SITE.email}`} className="finale__mail-link">{SITE.email}</a>
        <button type="button" className="finale__mail-copy" onClick={onCopy} aria-label={copied ? 'Kopyalandı' : 'E-postayı kopyala'} title="Kopyala">
          {copied ? CHECK_ICON : COPY_ICON}
        </button>
      </span>
      <span className="sr-only" role="status" aria-live="polite">{copied ? 'E-posta adresi kopyalandı.' : ''}</span>
    </p>
  );
}

// Home's big final CTA. Full-bleed black. The stacked lines run the glyph-wave ("codepen")
// effect via `hoverGate` (desktop: hover only, no autoplay; touch: autoplay wave-then-rest).
// The one big "Proje Başlat" link runs the orange glitch loop; a plain mailto line with a
// copy-to-clipboard icon sits under the notify form.
export default function FooterFinale() {
  return (
    <section className="finale grain on-dark" data-nav-invert aria-labelledby="finale-title">
      <div className="wrap finale__inner">
        <ul className="finale__lines">
          {FINALE_LINES.map((l, i) => (
            <li key={l.text} className={`finale__line finale__line--${l.size}`} data-reveal>
              <ScrambleText
                as={i === 0 ? 'h2' : 'p'}
                id={i === 0 ? 'finale-title' : undefined}
                text={l.text}
                startDelay={i * 350}
                hoverGate
              />
            </li>
          ))}
        </ul>

        <div className="finale__start" data-reveal>
          <Link href="/contact/" className="glitch glitch--loop finale__go" data-text="Proje Başlat">Proje Başlat</Link>
        </div>

        <div className="finale__notify" data-reveal>
          <NotifyForm topic="news" variant="finale" />
          <MailLine />
        </div>
      </div>
    </section>
  );
}
