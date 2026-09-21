import Seo from '../components/Seo';
import Mascot from '../components/Mascot';
import NotifyForm from '../components/NotifyForm';

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
          <span className="mask mask--1"><span className="glitch glitch--loop" data-text="Coming Soon." lang="en">Coming Soon.</span></span>
        </h1>
        <div className="shop__notify" data-reveal>
          <NotifyForm />
        </div>
      </section>
    </main>
  );
}
