import { useEffect, useRef } from 'react';
import Seo, { ORG_ID, WEBSITE_ID } from '../components/Seo';
import Logo from '../components/Logo';
import GlassCard from '../components/GlassCard';
import ScrollCut from '../components/ScrollCut';
import { SITE, MANIFESTO } from '../lib/site';

const AVATARS = Array.from({ length: 5 }, (_, i) => String(i + 1).padStart(2, '0'));

// Page-level structured data: the About page + the two founders (first names only —
// that is all the studio has published; see the `founder` array in Seo.jsx).
const ABOUT_URL = `${SITE.url}/about/`;
const ABOUT_JSON_LD = [
  {
    '@type': 'AboutPage',
    '@id': `${ABOUT_URL}#aboutpage`,
    url: ABOUT_URL,
    name: `About — ${SITE.name}`,
    inLanguage: 'tr',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  },
  { '@type': 'Person', '@id': `${SITE.url}/#omer`, name: 'Ömer', worksFor: { '@id': ORG_ID } },
  { '@type': 'Person', '@id': `${SITE.url}/#cemre`, name: 'Cemre', worksFor: { '@id': ORG_ID } },
];

// MANIFESTO is stored verbatim in uppercase (site.js); it is displayed in sentence case.
// Turkish-locale casing: İ/i and I/ı are distinct letters. The studio name is English and a
// proper noun, so it is restored after the Turkish pass (which would give "tensıon").
function toSentenceCase(str) {
  const lower = str.toLocaleLowerCase('tr-TR');
  return lower
    .replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toLocaleUpperCase('tr-TR'))
    .replace(/soft tens[ıi]on lab/gi, 'Soft Tension Lab');
}

export default function About() {
  const clusterRef = useRef(null);

  // The cards' idle float is paused while the page is actually scrolling (a moving
  // backdrop-filter re-samples every frame, and that plus scroll cost frames) and resumes
  // 150ms after the last scroll event — see .about__cluster[data-scrolling] in about.scss.
  useEffect(() => {
    const el = clusterRef.current;
    if (!el) return undefined;
    let timer = 0;
    const onScroll = () => {
      if (!timer) el.setAttribute('data-scrolling', '');
      clearTimeout(timer);
      timer = setTimeout(() => { timer = 0; el.removeAttribute('data-scrolling'); }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <main id="main" className="page about">
      <Seo
        title="About"
        description="Soft Tension Lab; sanat, tasarım ve kültürün kesişiminde yer alan bağımsız bir kreatif stüdyodur. Sistematik tasarım ile sanatsal sezgi arasındaki gerilimden besleniyoruz."
        path="/about/"
        jsonLd={ABOUT_JSON_LD}
      />

      <h1 className="sr-only">Hakkımızda</h1>

      {/* The lower part of the year is progressively cut away as the reader scrolls into the team. */}
      {/* finishAbove: on phones the cut is done before the band slides under the nav bar (its bottom sits ~56px down). */}
      <ScrollCut className="about__year" finishAbove={56}>
        <p className="about__year-text mask">
          <span>2026</span>
        </p>
      </ScrollCut>

      <section className="about__team wrap" aria-label="Ekip">
        {/* Five full-refraction glass cards + the nav: intentionally over the glass-surface budget (4 per screen, 2 on mobile) — a page-specific exception per explicit client direction for /about. GlassCard still degrades on its own (data-glass). */}
        <ul ref={clusterRef} className="about__cluster" aria-label="İllüstrasyon avatarlar (yer tutucu)">
          {AVATARS.map((n) => (
            <li key={n} className="about__avatar" data-reveal>
              <GlassCard radius="small" variant="frost" refraction="card" className="about__avatar-card" contentClassName="about__avatar-card-content">
                <span className="about__avatar-slot">
                  <span className="about__avatar-label">Avatar · {n}</span>
                  <span className="about__avatar-note">Yer tutucu</span>
                </span>
                <span className="about__avatar-caps" lang="en">
                  <span className="about__avatar-cap about__avatar-cap--left">info text</span>
                  <span className="about__avatar-cap about__avatar-cap--right">info text</span>
                </span>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="about__manifesto wrap" aria-label="Manifesto">
        {MANIFESTO.map((para, i) => (
          <p key={i} className={`about__para about__para--${i + 1} mask mask--${i + 1}`}>
            <span>{toSentenceCase(para)}</span>
          </p>
        ))}
      </section>

      {/* Signal-coloured mark: an intentional, page-specific exception to the ink/paper-only logo rule, per explicit client direction for /about.
          Same for the variant — the monogram is normally the compact/sub-32px mark; here it is the client-directed closing mark at display size. */}
      <div className="about__mark" data-reveal>
        <Logo variant="monogram" decorative />
      </div>
    </main>
  );
}
