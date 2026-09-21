import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';
import GlassScrollbar from '../components/GlassScrollbar';
import PageVeil from '../components/PageVeil';
import ToTop from '../components/ToTop';
import HoldingPage from '../components/HoldingPage';
import useReveal from '../lib/useReveal';
import useGlassMode from '../lib/useGlassMode';
import useSmoothScroll from '../lib/useSmoothScroll';
import { IS_HOLDING } from '../lib/site';
import 'lenis/dist/lenis.css';
import '../styles/main.scss';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useGlassMode();
  useReveal(router.asPath);
  useSmoothScroll();

  // Pre-launch: NEXT_PUBLIC_HOLDING=1 serves the holding page for every route.
  // The real site stays in the codebase; flip the flag off at launch.
  if (IS_HOLDING && router.pathname !== '/404') {
    return (
      <>
        <Cursor />
        <HoldingPage />
      </>
    );
  }

  // Pages opt out of the chrome (holding page route) or ask for the dark theme
  // (Works logo wall) via static properties. The footer's theme defaults to
  // the page's, but can be overridden separately (Component.footerTheme) for
  // a page that's mostly light except for a dark final section right above
  // the footer (Home's near-black FooterFinale) — the footer must always
  // read as a continuation of whatever comes immediately before it, not the
  // page as a whole.
  const bare = Component.bare === true;
  const theme = Component.theme || 'light';
  const footerTheme = Component.footerTheme || theme;

  return (
    <>
      <Cursor />
      <GlassScrollbar />
      {!bare ? <Nav theme={theme} /> : null}
      {/* Page + footer fade together on route change; the fixed chrome above stays put. */}
      <PageVeil>
        <Component {...pageProps} />
        {!bare ? <Footer theme={footerTheme} /> : null}
      </PageVeil>
      <ToTop />
    </>
  );
}
