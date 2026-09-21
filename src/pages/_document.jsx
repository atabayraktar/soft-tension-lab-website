import { Html, Head, Main, NextScript } from 'next/document';

// The refraction filter family. One definition per refraction budget tier — the
// displacement `scale` drops as the surface grows (chip 120 · nav 90 · card 70 · veil 40)
// so distortion reads on a button and does not turn to mud on a full-screen veil.
//
// Each filter is consumed as `backdrop-filter: url(#…)` (see GlassCard.scss), so the map
// bends the real page behind the surface. The map pulls pixels up to scale/2 px in any
// direction, and everything it reaches for must lie INSIDE the filter region — with a tight
// 0–100% box the edge rows displaced into nothing and the surface rendered as a washed,
// near-opaque smear (measured 2026-09: interior pixel change vs. no-filter 2.4 → 8.9 once
// the region was grown). The region per tier is therefore sized to the surface's typical
// box: a 56px nav pill needs ±45px vertically (≈ ±100% of its height), a 48px chip ±60px.
const TIERS = [
  ['chip', 120, ['-40%', '-150%', '180%', '400%']],
  ['nav', 90, ['-6%', '-100%', '112%', '300%']],
  ['card', 70, ['-20%', '-20%', '140%', '140%']],
  ['veil', 40, ['-6%', '-6%', '112%', '112%']],
];

function GlassFilter({ id, scale, region: [x, y, width, height] }) {
  return (
    <filter id={id} x={x} y={y} width={width} height={height} filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="1" seed="17" result="turb" />
      <feComponentTransfer in="turb" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turb" stdDeviation="3" result="softMap" />
      <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Archivo only dresses small labels, so its stylesheet must never block first paint:
            injected after parse, with a <noscript> fallback. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap';document.head.appendChild(l)})()",
          }}
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap"
            rel="stylesheet"
          />
        </noscript>
        <link rel="preload" href="/fonts/WhyteInktrap-Heavy.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/WhyteInktrap-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#F0EEE9" />
        {/* Marks the document as JS-capable before first paint so reveal/mask styles only
            apply when something will actually reveal them. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','1')" }} />
        {/* Fine-pointer desktops get the glass scrollbar, so the native one is hidden before first
            paint (no layout shift). Touch devices never get the flag and keep their own bars. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "if(matchMedia('(hover: hover) and (pointer: fine)').matches)document.documentElement.setAttribute('data-sbar','1')",
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Defined once for the whole app. Never duplicated per component. */}
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
          <defs>
            {TIERS.map(([tier, scale, region]) => (
              <GlassFilter key={tier} id={`stl-glass-${tier}`} scale={scale} region={region} />
            ))}
          </defs>
        </svg>
      </body>
    </Html>
  );
}
