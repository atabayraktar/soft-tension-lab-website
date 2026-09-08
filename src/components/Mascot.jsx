
// The studio's playful face. Multi-colour artwork, so it ships as its own SVG file
// (not currentColor). Its colours live only inside this artwork — never in the UI.
// Max one per screen; only at Shop (coming soon) and 404.
const ART = {
  a: { src: '/logos/mascot-a.svg', w: 469, h: 878, alt: 'Soft Tension Lab maskotu: yeşil, uzun boylu, kanatlı bir yaratık' },
  b: { src: '/logos/mascot-b.svg', w: 646, h: 721, alt: 'Soft Tension Lab maskotu: iki gözlü, kalem gövdeli bir yaratık' },
};

export default function Mascot({ variant = 'b', className = '', decorative = false, eager = false }) {
  const m = ART[variant] || ART.b;
  return (
    <img
      className={`mascot mascot--${variant} ${className}`.trim()}
      src={m.src}
      width={m.w}
      height={m.h}
      alt={decorative ? '' : m.alt}
      aria-hidden={decorative ? 'true' : undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
