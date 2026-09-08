import Seo from '../components/Seo';
import LogoWall from '../components/LogoWall';

// Works: full-bleed dark logo wall. The quiet power-move.
export default function Work() {
  return (
    <main id="main" className="page page--dark work grain">
      <Seo title="Works" description="Selected works — Soft Tension Lab ile çalışan markalar ve sanatçılar." path="/work/" />
      <section className="work__inner wrap" aria-labelledby="work-title">
        <h1 id="work-title" className="sr-only">Selected Works</h1>
        <LogoWall />
      </section>
    </main>
  );
}
Work.theme = 'dark';
