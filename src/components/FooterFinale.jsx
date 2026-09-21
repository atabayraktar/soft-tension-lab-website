import Link from 'next/link';
import ScrambleText from './ScrambleText';
import NotifyForm from './NotifyForm';
import { FINALE_LINES } from '../lib/site';

// Home's big final CTA. Full-bleed black. The stacked lines and the notify copy run the
// glyph-wave ("codepen") effect on their own; the one big "Proje Başlat" link runs the
// orange glitch loop. No mail line, no button — the link is the call to action.
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
              />
            </li>
          ))}
        </ul>

        <div className="finale__start" data-reveal>
          <Link href="/contact/" className="glitch glitch--loop finale__go" data-text="Proje Başlat">Proje Başlat</Link>
        </div>

        <div className="finale__notify" data-reveal>
          <NotifyForm topic="news" variant="finale" />
        </div>
      </div>
    </section>
  );
}
