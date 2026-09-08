import Seo from '../components/Seo';
import Mascot from '../components/Mascot';
import { SITE } from '../lib/site';

// Shop: coming-soon empty state. Circular illustration slot + "Coming Soon."
export default function Shop() {
  return (
    <main id="main" className="page shop">
      <Seo title="Shop" description="Soft Tension Lab shop — coming soon." path="/shop/" />
      <section className="shop__inner wrap" aria-labelledby="shop-title">
        <div className="shop__illo" data-reveal>
          <Mascot variant="b" eager />
        </div>
        <h1 id="shop-title" className="shop__title">
          <span className="mask mask--1"><span>Coming Soon.</span></span>
        </h1>
        <p className="shop__note mask mask--2"><span>Shop henüz açılmadı. Haber vermemizi isterseniz: <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a></span></p>
      </section>
    </main>
  );
}
