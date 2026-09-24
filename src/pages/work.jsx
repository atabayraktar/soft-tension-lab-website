import Seo, { WEBSITE_ID } from '../components/Seo';
import LogoWall from '../components/LogoWall';
import { SITE } from '../lib/site';

// Metadata-only CollectionPage: no ItemList members until real client logos exist
// (the wall is placeholders; inventing client names is forbidden by the brief).
const WORK_URL = `${SITE.url}/work/`;
const WORK_JSON_LD = [
  {
    '@type': 'CollectionPage',
    '@id': `${WORK_URL}#collectionpage`,
    url: WORK_URL,
    name: `Selected Works — ${SITE.name}`,
    inLanguage: 'tr',
    isPartOf: { '@id': WEBSITE_ID },
  },
];

// Works: full-bleed dark logo wall. The quiet power-move.
export default function Work() {
  return (
    <main id="main" className="page page--dark work grain" data-nav-invert>
      <Seo title="Works" description="Selected works — Soft Tension Lab ile çalışan markalar ve sanatçılar." path="/work/" jsonLd={WORK_JSON_LD} />
      <section className="work__inner wrap" aria-labelledby="work-title">
        <h1 id="work-title" className="sr-only">Selected Works</h1>
        <LogoWall />
      </section>
    </main>
  );
}
Work.theme = 'dark';
