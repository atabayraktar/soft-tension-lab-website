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
