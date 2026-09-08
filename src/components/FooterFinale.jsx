import Button from './Button';
import { FINALE_LINES, SITE } from '../lib/site';

// Home's big final CTA. Full-bleed black, stacked lines that glitch on hover (the
// hovered line only), one liquid-glass pill button. Nothing else.
export default function FooterFinale() {
  return (
    <section className="finale grain on-dark" aria-labelledby="finale-title">
      <div className="wrap finale__inner">
        <ul className="finale__lines">
          {FINALE_LINES.map((l, i) => (
            <li key={l.text} className={`finale__line finale__line--${l.size}`} data-reveal>
              {i === 0 ? (
                <h2 id="finale-title" className="glitch" data-text={l.text}>{l.text}</h2>
              ) : (
                <p className="glitch" data-text={l.text}>{l.text}</p>
              )}
            </li>
          ))}
          <li className="finale__line finale__line--sm" data-reveal>
            <a className="glitch finale__mail" data-text={SITE.email} href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </li>
        </ul>

        <div className="finale__cta" data-reveal>
          <Button href="/contact/" surface="glass">Proje Başlat</Button>
        </div>
      </div>
    </section>
  );
}
