import { Html, Head, Main, NextScript } from 'next/document';

// The refraction filter family. One definition per refraction budget tier — the
// displacement `scale` drops as the surface grows (chip 120 · nav 90 · card 70 · veil 40)
// so distortion reads on a button and does not turn to mud on a full-screen veil.
const TIERS = [
  ['chip', 120],
  ['nav', 90],
  ['card', 70],
  ['veil', 40],
];

function GlassFilter({ id, scale }) {
  return (
    <filter id={id} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
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
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Defined once for the whole app. Never duplicated per component. */}
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
          <defs>
            {TIERS.map(([tier, scale]) => (
              <GlassFilter key={tier} id={`stl-glass-${tier}`} scale={scale} />
            ))}
          </defs>
        </svg>
      </body>
    </Html>
  );
}
