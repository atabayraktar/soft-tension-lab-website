// Generative stand-in for the banner photo (the studio has not supplied one yet).
// Brand colours only: an Ink field with a systematic Paper hairline grid (CSS, in
// Banner.scss), a drifting set of organic contour rings and a whisper of grain, all
// drawn once in inline SVG — the grid is "sistematik tasarım", the contours are
// "sanatsal sezgi", and the glass panel refracts both. No files, no JS, one paint.
// Removed entirely once BANNER_IMAGE is set in Banner.jsx.

// One organic ring, re-used at ten scales. Each copy's centre slides down-left and
// rotates a little further, so the set reads as contour lines, not a target.
const RING = 'M1010 90C1220 60 1350 210 1295 360C1250 485 1110 625 940 585C790 550 675 470 715 315C750 175 840 115 1010 90Z';
const RINGS = Array.from({ length: 10 }, (_, i) => ({
  s: (0.14 + i * 0.2).toFixed(2),
  r: -10 + i * 4.5,
  dx: -i * 26,
  dy: i * 9,
  o: (0.40 - i * 0.031).toFixed(3),
}));

export default function BannerPattern() {
  return (
    <div className="banner__pattern" aria-hidden="true">
      <svg className="banner__rings" viewBox="0 0 1600 640" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <path id="banner-ring" d={RING} />
          <filter id="banner-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect className="banner__grain" width="100%" height="100%" filter="url(#banner-grain)" />
        {RINGS.map(({ s, r, dx, dy, o }) => (
          <use
            key={s}
            href="#banner-ring"
            transform={`translate(${1000 + dx} ${340 + dy}) rotate(${r}) scale(${s}) translate(-1000 -340)`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeOpacity={o}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
