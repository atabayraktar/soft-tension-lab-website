import { useEffect, useRef } from 'react';
import { MARQUEE } from '../lib/site';

const Dot = () => <span className="marquee__dot" aria-hidden="true" />;

// Continuous horizontal band of the services, Home only, right after the hero.
// Linear, constant speed, transform only. Pauses (and drops will-change) off-screen.
export default function Marquee() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = MARQUEE.map((s, i) => (
    <li key={i} className="marquee__item"><span>{s}</span><Dot /></li>
  ));

  return (
    <section className="marquee" ref={ref} aria-label="Hizmetler">
      <ul className="sr-only">{MARQUEE.map((s) => <li key={s}>{s}</li>)}</ul>
      <div className="marquee__track" aria-hidden="true">
        <ul className="marquee__group">{items}</ul>
        <ul className="marquee__group">{items}</ul>
      </div>
    </section>
  );
}
