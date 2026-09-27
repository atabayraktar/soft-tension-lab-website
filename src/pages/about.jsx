import { useEffect, useRef, useState } from 'react';
import Seo, { ORG_ID, WEBSITE_ID } from '../components/Seo';
import Logo from '../components/Logo';
import GlassCard from '../components/GlassCard';
import ScrollCut from '../components/ScrollCut';
import TeamModal from '../components/TeamModal';
import { SITE, MANIFESTO, TEAM } from '../lib/site';

// Page-level structured data: the About page + the two founders (first names only —
// that is all the studio has published; see the `founder` array in Seo.jsx).
const ABOUT_URL = `${SITE.url}/about/`;
const ABOUT_JSON_LD = [
  {
    '@type': 'AboutPage',
    '@id': `${ABOUT_URL}#aboutpage`,
    url: ABOUT_URL,
    name: `Hakkında — ${SITE.name}`,
    inLanguage: 'tr',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  },
  { '@type': 'Person', '@id': `${SITE.url}/#omer`, name: 'Ömer', worksFor: { '@id': ORG_ID } },
  { '@type': 'Person', '@id': `${SITE.url}/#cemre`, name: 'Cemre', worksFor: { '@id': ORG_ID } },
];

// MANIFESTO is stored verbatim in uppercase (site.js); it is displayed in sentence case.
// Turkish-locale casing: İ/i and I/ı are distinct letters. The studio name stays full-caps
// everywhere on the site, so it is restored after the Turkish pass (which would otherwise
// give "tensıon" — plus the site never uses "Soft Tension Lab", only "SOFT TENSION LAB").
function toSentenceCase(str) {
  const lower = str.toLocaleLowerCase('tr-TR');
  return lower
    .replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toLocaleUpperCase('tr-TR'))
    .replace(/soft tens[ıi]on lab/gi, 'SOFT TENSION LAB');
}

export default function About() {
  const clusterRef = useRef(null);
  // The expanded card: index into TEAM while one is open. The modal owns its own close
  // choreography and only reports back once it has landed (then it unmounts here); the
  // <li> refs are what it measures to lift off from / land back on.
  const [active, setActive] = useState(null);
  const itemRefs = useRef([]);

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
        title="Hakkında"
        description="SOFT TENSION LAB; sanat, tasarım ve kültürün kesişiminde yer alan bağımsız bir kreatif stüdyodur. Sistematik tasarım ile sanatsal sezgi arasındaki gerilimden besleniyoruz."
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
        {/* Five full-refraction glass cards + the nav: intentionally over the glass-surface budget (4 per screen, 2 on mobile) — a page-specific exception per explicit client direction for /about. GlassCard still degrades on its own (data-glass). The circle illustration itself is still a placeholder (no real portraits yet); the name/role caption underneath is real. */}
        <ul ref={clusterRef} className="about__cluster" aria-label="Ekip üyeleri">
          {TEAM.map((person, i) => {
            const n = String(i + 1).padStart(2, '0');
            return (
              <li key={person.name} ref={(el) => { itemRefs.current[i] = el; }} className="about__avatar" data-reveal>
                <GlassCard radius="small" variant="frost" refraction="card" className="about__avatar-card" contentClassName="about__avatar-card-content">
                  {/* The whole card is the button (phrasing content only inside, so the markup stays valid); the expanded view is TeamModal. */}
                  <button
                    type="button"
                    className="about__avatar-btn"
                    aria-haspopup="dialog"
                    aria-expanded={active === i}
                    onClick={() => setActive(i)}
                  >
                    <span className="about__avatar-slot">
                      <span className="about__avatar-label">Avatar · {n}</span>
                      <span className="about__avatar-note">Yer tutucu</span>
                    </span>
                    <span className="about__avatar-caps">
                      <span className="about__avatar-cap about__avatar-cap--name">{person.name}</span>
                      <span className="about__avatar-cap about__avatar-cap--role">
                        {person.role.split(' / ').map((line) => (
                          <span key={line} className="about__avatar-cap-line" style={{ '--chars': line.length }}>{line}</span>
                        ))}
                      </span>
                    </span>
                    <span className="sr-only"> — detayları göster</span>
                  </button>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      </section>

      {active !== null && (
        <TeamModal
          key={active}
          person={TEAM[active]}
          index={active}
          sourceEl={itemRefs.current[active]}
          onClose={() => setActive(null)}
        />
      )}

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
