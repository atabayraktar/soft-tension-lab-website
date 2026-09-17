import Seo from '../components/Seo';
import TopplingText from '../components/TopplingText';
import Button from '../components/Button';

// 404: the numerals settle in (toppling treatment), one liquid-glass pill button home.
export default function NotFound() {
  return (
    <main id="main" className="page nf">
      <Seo title="404" description="Görünüşe göre bu sayfa tasarım sürecinde kayboldu." path="/404/" noindex />
      <section className="nf__inner wrap" data-topple-scope>
        <h1 className="nf__code"><TopplingText text="404" mode="load" /></h1>
        <p className="nf__copy">Görünüşe göre bu sayfa tasarım sürecinde kayboldu.</p>
        <Button href="/" surface="glass" arrow={null}>Ana Sayfaya Dön</Button>
      </section>
    </main>
  );
}
