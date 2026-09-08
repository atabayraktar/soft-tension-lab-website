import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import GlassCard from './GlassCard';

const COVER_MS = 520;

/**
 * Perceptually multi-page, technically one app: a glass-tint veil sweeps up over the
 * old page, the content swaps behind it, and it sweeps off the new one.
 * The blur is the veil's own backdrop-filter — only `transform` animates.
 * Under prefers-reduced-motion the veil never mounts (the swap is instant).
 */
export default function PageVeil() {
  const router = useRouter();
  const [phase, setPhase] = useState('idle'); // idle | cover | uncover
  const startedAt = useRef(0);
  const timer = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const onStart = (url, { shallow }) => {
      if (shallow) return;
      startedAt.current = performance.now();
      clearTimeout(timer.current);
      setPhase('cover');
    };
    const onDone = () => {
      const elapsed = performance.now() - startedAt.current;
      const wait = Math.max(0, COVER_MS - elapsed);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setPhase('uncover');
        timer.current = setTimeout(() => setPhase('idle'), COVER_MS);
      }, wait);
    };
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);
    return () => {
      clearTimeout(timer.current);
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
    };
  }, [router.events]);

  return (
    <GlassCard
      variant="tint"
      refraction="veil"
      radius="small"
      className={`veil veil--${phase}`}
      aria-hidden="true"
    />
  );
}
