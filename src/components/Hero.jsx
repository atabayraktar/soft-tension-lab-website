import GlassCard from './GlassCard';
import TopplingText from './TopplingText';
import { HERO_LINE } from '../lib/site';

/**
 * Massive typographic manifesto over the ambient background, behind a full-hero glass
 * panel. The headline topples letter by letter as the visitor scrolls.
 *
 * Background: until the TouchDesigner loop exists, a pre-blurred still from the studio's
 * own archive drifts very slowly (transform only). Swap `<img>` for a muted <video> of
 * the same box when the asset arrives — nothing else changes.
 */
export default function Hero() {
  return (
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
          <TopplingText text={HERO_LINE} mode="scroll" range={0.7} />
        </h1>
        <p className="hero__hint label" aria-hidden="true">Kaydır</p>
      </GlassCard>
    </section>
  );
}
