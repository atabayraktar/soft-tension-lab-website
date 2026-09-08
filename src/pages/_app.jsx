import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';
import PageVeil from '../components/PageVeil';
import HoldingPage from '../components/HoldingPage';
import useReveal from '../lib/useReveal';
import useGlassMode from '../lib/useGlassMode';
import { IS_HOLDING } from '../lib/site';
import '../styles/main.scss';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useGlassMode();
  useReveal(router.asPath);

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
  // (Works logo wall) via static properties.
  const bare = Component.bare === true;
  const theme = Component.theme || 'light';

  return (
    <>
      <Cursor />
      {!bare ? <Nav theme={theme} /> : null}
      <Component {...pageProps} />
      {!bare ? <Footer theme={theme} /> : null}
      <PageVeil />
    </>
  );
}
