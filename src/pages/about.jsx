import Link from 'next/link';
import Seo from '../components/Seo';
import ArchiveImage from '../components/ArchiveImage';
import { MANIFESTO, SERVICE_TAGS } from '../lib/site';

// About: manifesto (inherited copy, verbatim) → studio visuals → minimal service row.
export default function About() {
  return (
    <main id="main" className="page about">
      <Seo
        title="About"
        description="Soft Tension Lab; sanat, tasarım ve kültürün kesişiminde yer alan bağımsız bir kreatif stüdyodur. Sistematik tasarım ile sanatsal sezgi arasındaki gerilimden besleniyoruz."
        path="/about/"
      />

      <section className="about__manifesto wrap" aria-labelledby="about-title">
        <h1 id="about-title" className="sr-only">Hakkımızda</h1>
        <div className="about__copy">
          {MANIFESTO.map((para, i) => (
            <p key={i} className={`about__para mask mask--${i + 1}`}>
              <span>{para}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="about__studio wrap" aria-label="Stüdyo görselleri">
        <figure className="about__fig" data-reveal>
          <ArchiveImage slug="our-studio-space-insta" alt="“Our studio space” yazısı, açık zemin üzerinde bir Game Boy ile" ratio="4 / 5" sizes="(min-width: 768px) 45vw, 100vw" />
          <figcaption className="label">Stüdyo — 01</figcaption>
        </figure>
        <figure className="about__fig about__fig--offset" data-reveal>
          <ArchiveImage slug="our-studio-space-insta-w" alt="“Our studio space” yazısı, koyu zemin üzerinde bir Game Boy ile" ratio="4 / 5" sizes="(min-width: 768px) 45vw, 100vw" />
          <figcaption className="label">Stüdyo — 02</figcaption>
        </figure>
      </section>

      <section className="about__services wrap" aria-label="Hizmetler">
        <ul className="about__tags" data-reveal>
          {SERVICE_TAGS.map((t) => (
            <li key={t} className="about__tag">{t}</li>
          ))}
        </ul>
        <Link href="/services/" className="link about__all" data-reveal>
          Tüm hizmetler <span className="link__arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
