import Seo from '../components/Seo';
import Logo from '../components/Logo';
import ScrambleText from '../components/ScrambleText';
import NotifyForm from '../components/NotifyForm';

// Standalone "yakında" teaser — black, no nav/footer, single screen. The top mark is a
// one-off supplied asset (public/images/burgu.webp), not a Soft Tension Lab logo variant,
// so it sits outside the brand's controlled palette by design.
export default function ComingSoon() {
  return (
    <main className="comingsoon grain on-dark" id="main">
      <Seo title="Yakında" description="Soft Tension Lab — yakında." path="/comingsoon/" noindex />

      <header className="comingsoon__top">
        <img src="/images/burgu.webp" alt="" className="comingsoon__mark" width={841} height={497} decoding="async" />
      </header>

      <div className="comingsoon__center">
        <ScrambleText as="p" text="Biz de sabırsızlanıyoruz." className="comingsoon__line" />
        <ScrambleText as="p" text="Tam şu an üzerinde çalışıyoruz." className="comingsoon__line" startDelay={700} />
        <h1 className="comingsoon__headline">
          <span className="glitch glitch--loop" data-text="YAKINDA GÖRÜŞMEK ÜZERE!">YAKINDA GÖRÜŞMEK ÜZERE!</span>
        </h1>

        <div className="comingsoon__notify">
          <NotifyForm topic="comingsoon" variant="finale" />
        </div>
      </div>

      <Logo variant="monogram" className="comingsoon__stamp" decorative />
    </main>
  );
}
ComingSoon.bare = true;
