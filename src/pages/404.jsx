import Seo from '../components/Seo';
import TopplingText from '../components/TopplingText';
import ScrambleText from '../components/ScrambleText';
import Button from '../components/Button';

// 404: the numerals settle in (toppling treatment), then the orange glitch loops on them;
// the line below runs the per-line glyph wave. One liquid-glass pill button home.
const COPY = 'Görünüşe göre bu sayfa tasarım sürecinde kayboldu.';

export default function NotFound() {
  return (
    <main id="main" className="page nf">
      <Seo title="404" description={COPY} path="/404/" noindex />
      <section className="nf__inner wrap" data-topple-scope>
        <h1 className="nf__code">
          <span className="glitch glitch--loop" data-text="404"><TopplingText text="404" mode="load" /></span>
        </h1>
        <ScrambleText text={COPY} className="nf__copy" />
        <Button href="/" surface="glass" arrow={null}>Ana Sayfaya Dön</Button>
      </section>
    </main>
  );
}
