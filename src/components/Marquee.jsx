import { useEffect, useRef } from 'react';
import { MARQUEE } from '../lib/site';

const Star = () => (
  <svg className="marquee__star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="currentColor" />
  </svg>
);

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
    <li key={i} className="marquee__item"><span>{s}</span><Star /></li>
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
