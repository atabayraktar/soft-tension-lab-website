// The document canvas per route: the colour the browser paints beyond the page and, on iOS
// 26 Safari, what tints its status bar / bottom toolbar when the page's own content is not
// behind them (Safari reads the <body> colour there and ignores <meta theme-color>). It is
// the colour of the page's two ENDS — the section under the status bar at the top and the
// one under the toolbar at the bottom — so the bars never show a seam against the page:
//   black  Home (black hero · black FooterFinale + footer), the holding / coming-soon screens
//   dark   Works (the logo wall's ground, top to footer)
//   light  everything else (Paper)
// Applied as <html data-canvas> (globals.scss maps it to --canvas) plus the theme-color meta
// for the browsers that still honour it (Chrome on Android). _document.jsx inlines the same
// mapping so the very first paint of a direct visit is already right — keep CANVAS and that
// script in step.
export const CANVAS = {
  '/': 'black',
  '/holding': 'black',
  '/comingsoon': 'black',
  '/work': 'dark',
};

export const CANVAS_COLOR = {
  light: '#F0EEE9',
  dark: '#020A1C',
  black: '#000000',
};

export function canvasFor(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/';
  return CANVAS[p] || 'light';
}

export function applyCanvas(pathname) {
  const canvas = canvasFor(pathname);
  const html = document.documentElement;
  if (html.getAttribute('data-canvas') !== canvas) html.setAttribute('data-canvas', canvas);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', CANVAS_COLOR[canvas]);
}

// iOS 26 Safari paints its (opaque) bars with the LIVE <body> colour, so on a page whose ends
// differ from its middle (Home: black hero → Paper sections → black finale) the canvas must
// follow the scroll, or the bars show a black band over the Paper sections. Samples the
// element under the status bar and writes the matching canvas. Only Home has mixed grounds;
// every other route is uniform and keeps its static CANVAS value. Throttled (the colour only
// changes at section boundaries). Returns a disposer.
const CANVAS_FOR_RGB = { '0,0,0': 'black', '2,10,28': 'dark' };
const SAMPLE_MS = 100;

function sampledCanvas() {
  let el = document.elementFromPoint(window.innerWidth / 2, 1);
  while (el && el !== document.body && el !== document.documentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (m && m[4] !== '0') return CANVAS_FOR_RGB[`${m[1]},${m[2]},${m[3]}`] || 'light';
    el = el.parentElement;
  }
  return null;   // nothing opaque under the bar: keep what we have
}

export function watchCanvas(pathname) {
  if ((pathname.replace(/\/+$/, '') || '/') !== '/') return undefined;
  const html = document.documentElement;
  let timer = 0;
  let last = 0;
  const sample = () => {
    timer = 0;
    last = performance.now();
    if (html.classList.contains('is-menu-open')) return;   // body pinned: scrollY lies
    const c = sampledCanvas();
    if (!c || html.getAttribute('data-canvas') === c) return;
    html.setAttribute('data-canvas', c);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', CANVAS_COLOR[c]);
  };
  const onScroll = () => {
    if (timer) return;
    timer = setTimeout(sample, Math.max(0, SAMPLE_MS - (performance.now() - last)));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  return () => {
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
