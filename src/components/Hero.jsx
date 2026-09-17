import GlassCard from './GlassCard';
import TopplingPhysics from './TopplingPhysics';
import { HERO_LINES } from '../lib/site';

/**
 * Massive typographic manifesto over the ambient background, behind a full-hero glass
 * panel. Once the section has scrolled a quarter of the way out, the headline's letters
 * become physics bodies and topple into a pile at the foot of the glass (TopplingPhysics).
 *
 * Background: until the TouchDesigner loop exists, a pre-blurred still from the studio's
 * own archive drifts very slowly (transform only). Swap `<img>` for a muted <video> of
 * the same box when the asset arrives — nothing else changes.
 */
export default function Hero() {
  return (
    // The spacer is the pin: on desktop it is one viewport taller than the hero, and the
    // hero sticks inside it while the scroll through that extra height drives the fall.
    <div className="hero-pin" data-topple-pin>
    <section className="hero" data-topple-scope aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <picture>
          <source
            media="(orientation: portrait)"
            srcSet="/images/archive/hero-bg-portrait-480.webp 480w, /images/archive/hero-bg-portrait.webp 800w"
            sizes="100vw"
          />
          <img src="/images/archive/hero-bg.webp" width="1600" height="1000" alt="" fetchPriority="high" decoding="async" />
        </picture>
      </div>

      <GlassCard variant="frost" refraction="veil" radius="small" className="hero__glass" contentClassName="hero__content">
        <h1 id="hero-title" className="hero__title">
          <TopplingPhysics lines={HERO_LINES} />
        </h1>
      </GlassCard>
    </section>
    </div>
  );
}
