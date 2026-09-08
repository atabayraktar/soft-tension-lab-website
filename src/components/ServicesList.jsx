import { useState } from 'react';
import GlassCard from './GlassCard';
import { SERVICES } from '../lib/site';

// Each service surfaces a related archive piece behind glass on hover/focus (desktop).
const PREVIEW = [
  { slug: 'gift-cardlar-5', alt: 'GAM Collective hediye kartı tasarımı' },
  { slug: 'our-studio-space-insta-w', alt: '“Our studio space” tipografik post' },
  { slug: 'calisma-yuzeyi-1', alt: '“Which God?” metin afişi' },
  { slug: 'x1', alt: 'Cemre’nin tuval resmi' },
  { slug: 'calisma-yuzeyi-1-kopya', alt: '“Which God?” portre afişi' },
  { slug: 'pretend-theres-art-inside', alt: '“Pretend there’s art inside” poşeti' },
  { slug: '1png', alt: 'Saksofon çalan iki iskeletin resmi' },
];

export default function ServicesList() {
  const [active, setActive] = useState(0);
  const p = PREVIEW[active];

  return (
    <div className="services__layout">
      <ol className="services__list">
        {SERVICES.map((name, i) => (
          <li key={name} className={`services__row ${i === active ? 'is-active' : ''}`.trim()} data-reveal>
            <button
              type="button"
              className="services__btn"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
            >
              <span className="services__idx label">{String(i + 1).padStart(2, '0')}</span>
              <span className="services__name">{name}</span>
            </button>
          </li>
        ))}
      </ol>

      <aside className="services__preview" aria-live="polite">
        <div className="services__frame">
          {PREVIEW.map((item, i) => (
            <img
              key={item.slug}
              className={`services__img ${i === active ? 'is-active' : ''}`.trim()}
              src={`/images/archive/${item.slug}-thumb.webp`}
              srcSet={`/images/archive/${item.slug}-thumb.webp 480w, /images/archive/${item.slug}-800.webp 800w`}
              sizes="(min-width: 1024px) 30vw, 0px"
              width="480"
              height="600"
              alt={i === active ? item.alt : ''}
              loading="lazy"
              decoding="async"
            />
          ))}
          <GlassCard variant="clear" refraction="chip" radius="small" className="services__hud" contentClassName="services__hud-inner">
            <span className="label">{String(active + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}</span>
            <span className="services__hud-name">{SERVICES[active]}</span>
          </GlassCard>
        </div>
      </aside>
    </div>
  );
}
