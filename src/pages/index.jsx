import Seo from '../components/Seo';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Showcase from '../components/Showcase';
import BandMarquee from '../components/BandMarquee';
import Banner from '../components/Banner';
import FooterFinale from '../components/FooterFinale';

// Home: Liquid nav → typographic hero → marquee band → silent gallery wall → two big phrase bands → statement banner → footer finale.
export default function Home() {
  return (
    <main id="main" className="home">
      <Seo path="/" />
      <Hero />
      <Marquee />
      <Showcase />
      <BandMarquee text="BRANDING DESIGN" tone="dark" />
      <BandMarquee text="LOGO DESIGN" tone="light" reverse />
      <Banner />
      <FooterFinale />
    </main>
  );
}
// The global Footer sits directly under FooterFinale's true #000 — match it exactly.
Home.footerTheme = 'black';
