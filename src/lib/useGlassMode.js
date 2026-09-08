import { useEffect } from 'react';

/**
 * Decides how much glass the device can afford and stamps it on <html data-glass>:
 *   'svg'   — full refraction (filter: url(#stl-glass-*)) — Chromium, fine pointer or capable mobile
 *   'flat'  — backdrop-filter blur(20px) saturate(150%) — still on-brand
 *   'solid' — 92% opaque Paper/Ink surface — no backdrop-filter support at all
 *
 * After the first scroll, a short frame-rate sample downgrades 'svg' → 'flat' if the
 * page cannot hold ~55fps. The surface is never removed, only simplified.
 */
export default function useGlassMode() {
  useEffect(() => {
    const root = document.documentElement;
    const supportsBackdrop =
      (window.CSS && (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')));
    if (!supportsBackdrop) { root.setAttribute('data-glass', 'solid'); return undefined; }

    // The displacement map only bends a *backdrop* in Chromium engines; Safari and
    // Firefox apply it to the (transparent) element itself and render nothing useful.
    const ua = navigator.userAgent;
    const chromium = /Chrome\/|Chromium\/|CriOS\//.test(ua) && !/Firefox|FxiOS/.test(ua);
    const saveData = navigator.connection && navigator.connection.saveData;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    let mode = chromium && !saveData && !lowMemory ? 'svg' : 'flat';
    root.setAttribute('data-glass', mode);
    if (mode !== 'svg') return undefined;

    // Frame-rate check: sample ~1.2s of frames after the first scroll.
    let sampling = false, frames = 0, start = 0, raf = 0;
    const tick = (t) => {
      if (!start) start = t;
      frames += 1;
      if (t - start < 1200) { raf = requestAnimationFrame(tick); return; }
      const fps = (frames / (t - start)) * 1000;
      if (fps < 55) root.setAttribute('data-glass', 'flat');
      window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (sampling) return;
      sampling = true;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
