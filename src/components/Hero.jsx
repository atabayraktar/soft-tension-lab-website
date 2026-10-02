import { useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import TopplingText from './TopplingText';
import { HERO_LINES } from '../lib/site';

/**
 * Massive typographic manifesto over the ambient background, behind a full-hero glass
 * panel. The scroll through the pin bursts the headline's letters apart and drops them
 * onto the floor of the glass; scrolling back flies them home (TopplingText, scroll mode).
 *
 * Background: a plain near-black slot until the TouchDesigner loop exists. Drop a muted
 * <video autoPlay loop playsInline> into `.hero__bg` when the asset arrives — the slot's
 * own colour stays as its poster, nothing else changes.
 */
export default function Hero() {
  const pinRef = useRef(null);
  // iOS 26 Safari keeps the LAST fixed/sticky element it sampled as the source of its bar
  // colour for as long as that element has a visible renderer (WebKit
  // Page::updateFixedContainerEdges), so once the sticky black hero has been sampled both
  // bars stay black for the rest of the page. Hiding it while it is well out of view ends the
  // carry-over; the bars follow the page again. Visually inert: nothing of the hero is on
  // screen while it is hidden, and it is restored a little before the pin re-enters.
  useEffect(() => {
    const pin = pinRef.current;
    const hero = pin && pin.firstElementChild;
    if (!hero || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { hero.style.visibility = e.isIntersecting ? '' : 'hidden'; },
      { rootMargin: '200px 0px' },
    );
    io.observe(pin);
    return () => { io.disconnect(); hero.style.visibility = ''; };
  }, []);
  return (
    // The spacer is the pin: on desktop it is `--hero-pin` taller than the hero, and the
    // hero sticks inside it while the scroll through that extra height drives the burst.
    <div ref={pinRef} className="hero-pin" data-topple-pin>
    <section className="hero" data-topple-scope data-nav-invert aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true" />

      {/* `clear` is the lightest wash: over the black slot it reads as neutral near-black (`frost`
          turned it warm grey, `tint` navy). */}
      <GlassCard variant="clear" refraction="veil" radius="small" className="hero__glass" contentClassName="hero__content">
        <h1 id="hero-title" className="hero__title">
          <TopplingText lines={HERO_LINES} mode="scroll" />
        </h1>
      </GlassCard>
    </section>
    </div>
  );
}
