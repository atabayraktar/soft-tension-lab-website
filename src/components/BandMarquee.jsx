import { useEffect, useRef } from 'react';

// Items per group. One phrase is already wider than any viewport up to ~2300px, so the
// second item is hidden by BandMarquee.scss below that width and the loop is one phrase
// long — the track used to carry four phrases, which on a phone was a ~7800×195 CSS px
// (×9 at 3×) raster that iOS Safari tiled lazily: letters popped in at tile edges as the
// band slid (the "takılma" in the client's recording).
const PER_GROUP = 2;
const SPLIT_OVER = 6;   // letters — longer words render as two layers (see `pieces` below)

/**
 * A huge single-phrase marquee band. The phrase is written in capitals in the data (not via
 * CSS text-transform, which would turn the Turkish-locale "I" into "İ").
 *   tone="dark"  — black band, Paper type
 *   tone="light" — Paper band, black type
 *   reverse      — runs the other way, so a dark and a light band pull against each other
 * Linear, constant speed, transform only; pauses off-screen.
 *
 * Each word is its own small composited layer (see .band__word): WebKit tiles any layer
 * wider than ~1280 CSS px and paints those tiles lazily, which is what tore the glyphs on
 * mobile. A word stays under that limit, is painted once in full, and the moving track
 * itself has nothing to paint. Layer promotion is permanent — promoting on the fly (the old
 * `.is-live` will-change toggle) re-rasterised the whole band exactly as it entered view.
 */
export default function BandMarquee({ text, tone = 'dark', reverse = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    // The observer can hand over several queued entries at once (mount off-screen, then a
    // section landing that jumps the band on-screen in the same frame): the LAST one is the
    // current state. `.is-live` only flips animation-play-state now, so firing it early
    // (rootMargin) just means the band is already moving when it scrolls into view.
    const io = new IntersectionObserver((entries) => {
      el.classList.toggle('is-live', entries[entries.length - 1].isIntersecting);
    }, { threshold: 0, rootMargin: '35% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The word space stays inside the preceding span (white-space: pre), so letter-spacing
  // and the space advance land exactly as they did in the single text run. A word longer
  // than SPLIT_OVER letters is cut at its midpoint too ("BRANDING" → "BRAN" + "DING"): at
  // the phone size it alone is ~1060px, over WebKit's low-memory tiling limit (1024px).
  // Kerning does not cross an element boundary — Whyte Inktrap has no pair at N|D (or
  // across the word space), checked in the browser; re-check if a phrase changes.
  const pieces = text.split(' ').flatMap((w, i, all) => {
    const word = i < all.length - 1 ? `${w} ` : w;
    if (w.length <= SPLIT_OVER) return [word];
    const mid = Math.ceil(w.length / 2);
    return [word.slice(0, mid), word.slice(mid)];
  });
  const item = (key) => (
    <li key={key} className="band__item">
      {pieces.map((p, i) => <span key={i} className="band__word">{p}</span>)}
      <span className="band__dot" aria-hidden="true" />
    </li>
  );
  const group = (key) => (
    <ul className="band__group" key={key}>
      {Array.from({ length: PER_GROUP }, (_, i) => item(i))}
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
