import Seo from '../components/Seo';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Showcase from '../components/Showcase';
import BandMarquee from '../components/BandMarquee';
import Services from '../components/Services';
import Banner from '../components/Banner';
import FooterFinale from '../components/FooterFinale';

// Home: Liquid nav → typographic hero → marquee band → silent gallery wall → big phrase band →
// services accordion (#hizmetler) → second phrase band → statement banner → footer finale.
//
// NB (perf, 2026-09): wrapping the below-the-fold sections in <Suspense> to chunk hydration
// was tried and reverted — the static renderer outlines boundaries this large into hidden
// segments swapped in by inline `$RC` scripts, so the sections vanished without JS and
// mobile TBT got worse (220 → 320 ms), not better.
export default function Home() {
  return (
    <main id="main" className="home">
      <Seo path="/" />
      <Hero />
      <Marquee />
      <Showcase />
      <BandMarquee text="BRANDING DESIGN" tone="dark" />
      <Services />
      <BandMarquee text="LOGO DESIGN" tone="light" reverse />
      <Banner />
      <FooterFinale />
    </main>
  );
}
// The global Footer sits directly under FooterFinale's true #000 — match it exactly.
Home.footerTheme = 'black';
