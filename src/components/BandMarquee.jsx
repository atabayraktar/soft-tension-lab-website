import { useEffect, useRef } from 'react';

// Two items per group so one group is always wider than the widest screen; the track holds
// two identical groups and slides half its width, then loops seamlessly.
const PER_GROUP = 2;

/**
 * A huge single-phrase marquee band. The phrase is written in capitals in the data (not via
 * CSS text-transform, which would turn the Turkish-locale "I" into "İ").
 *   tone="dark"  — black band, Paper type
 *   tone="light" — Paper band, black type
 *   reverse      — runs the other way, so a dark and a light band pull against each other
 * Linear, constant speed, transform only; pauses (and drops will-change) off-screen.
 */
export default function BandMarquee({ text, tone = 'dark', reverse = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const group = (key) => (
    <ul className="band__group" key={key}>
      {Array.from({ length: PER_GROUP }, (_, i) => <li key={i} className="band__item">{text}</li>)}
    </ul>
  );

  return (
    <section
      ref={ref}
      className={`band band--${tone}${reverse ? ' band--reverse' : ''}`}
      data-nav-invert={tone === 'dark' ? true : undefined}
      aria-label={text}
    >
      <p className="sr-only">{text}</p>
      <div className="band__track" aria-hidden="true">
        {group('a')}
        {group('b')}
      </div>
    </section>
  );
}
