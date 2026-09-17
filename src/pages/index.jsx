import Seo from '../components/Seo';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import ShowcaseGrid from '../components/ShowcaseGrid';
import FooterFinale from '../components/FooterFinale';

// Home: Liquid nav → typographic hero → marquee band → asymmetric showcase → footer finale.
export default function Home() {
  return (
    <main id="main" className="home">
      <Seo path="/" />
      <Hero />
      <Marquee />
      <ShowcaseGrid />
      <FooterFinale />
    </main>
  );
}
// The global Footer sits directly under FooterFinale's true #000 — match it exactly.
Home.footerTheme = 'black';
