import { useEffect } from 'react';

/**
 * Decides how much glass the device can afford and stamps it on <html data-glass>:
 *   'svg'   — full refraction (backdrop-filter: url(#stl-glass-*) blur() …) — Chromium only
 *   'flat'  — backdrop-filter blur(20px) saturate(150%) — still on-brand; every WebKit
 *             browser (all of iOS), Firefox, and every in-app browser land here
 *   'solid' — 92% opaque Paper/Ink surface + shine + hairline — only when backdrop-filter
 *             is genuinely unsupported, or the user asked for reduced transparency
 *
 * After the first scroll, a short frame-rate sample downgrades 'svg' → 'flat' if the
 * page cannot hold ~55fps. The surface is never removed, only simplified.
 *
 * In-app browsers (Instagram / Facebook / Messenger / TikTok / LINE / X / Snapchat /
 * LinkedIn / Pinterest / Threads, plus any iOS WKWebView and Android WebView) are matched
 * by UA and pinned to 'flat' UP FRONT: the plain blur is the one path every mobile engine
 * has shipped for years (-webkit-backdrop-filter: iOS 9+; Chromium WebView 76+), while
 * url() maps inside backdrop-filter and the refraction's cost are not something to gamble
 * on in a browser the user cannot even switch tabs in. They are NOT sent to 'solid': that
 * tier was what Instagram's in-app browser got until 2026-10 and it rendered the nav,
 * every glass button and the ToTop as flat white slabs — the "glass is broken on
 * Instagram" report. (The earlier claim that Meta's webview no-ops backdrop-filter was
 * measured in Playwright's headless WebKit, whose Windows port does not paint
 * backdrop-filter at all; real WKWebView is the same engine as Safari.)
 */

const IN_APP_RE =
  /\bInstagram\b|\bFBAN\/|\bFBAV\/|\bFB_IAB\/|\bFB4A\b|\bMessenger\b|\bBarcelona\b|\bTikTok\b|\bBytedanceWebview\b|\bmusical_ly\b|\bLine\/|\bTwitter\b|\bSnapchat\b|\bLinkedInApp\b|\bPinterest\b|; ?wv\)/i;

export function detectInAppBrowser(ua) {
  if (IN_APP_RE.test(ua)) return true;
  // Any iOS WKWebView: Safari itself (and every App-Store browser skin: CriOS, FxiOS, EdgiOS)
  // carries a "Safari/" token; an in-app webview never does.
  if (/iPhone|iPad|iPod/.test(ua) && /\bMobile\//.test(ua) && !/\bSafari\//.test(ua)) return true;
  return false;
}

// Does this engine take an SVG map inside backdrop-filter? Parsing is checked for real
// (an unsupported url() makes the whole declaration invalid and the computed value falls
// back to 'none'), and the filter element itself must be in the document. Pixels cannot
// be read back from the DOM, so paint is covered by the engine gate (Chromium) + the
// frame-rate sample below, not by this probe.
function svgBackdropApplies() {
  if (!document.getElementById('stl-glass-chip')) return false;
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;pointer-events:none;' +
    '-webkit-backdrop-filter:url(#stl-glass-chip) blur(1px);backdrop-filter:url(#stl-glass-chip) blur(1px)';
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  const v = cs.backdropFilter || cs.webkitBackdropFilter || '';
  el.remove();
  return v.includes('url(');
}

export default function useGlassMode() {
  useEffect(() => {
    const root = document.documentElement;
    const ua = navigator.userAgent;
    const set = (mode) => root.setAttribute('data-glass', mode);

    const supportsBackdrop = !!(window.CSS && CSS.supports &&
      (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')));
    const reducedTransparency = window.matchMedia && window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    if (!supportsBackdrop || reducedTransparency) { set('solid'); return undefined; }

    if (detectInAppBrowser(ua)) { set('flat'); return undefined; }

    // The displacement map only bends a *backdrop* in Chromium engines; Safari and
    // Firefox apply it to the (transparent) element itself and render nothing useful.
    // Every browser on iOS is WebKit under the hood (App Store rule) — Chrome for iOS
    // ("CriOS/") included — so no iOS device may ever be classified as Chromium.
    // iPadOS 13+ reports itself as a Mac; the touch-point check catches that.
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const chromium = !ios && /Chrome\/|Chromium\//.test(ua) && !/Firefox|FxiOS/.test(ua);
    const saveData = navigator.connection && navigator.connection.saveData;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    const mode = chromium && !saveData && !lowMemory && svgBackdropApplies() ? 'svg' : 'flat';
    set(mode);
    if (mode !== 'svg') return undefined;

    // Frame-rate check: sample ~1.2s of frames after the first scroll.
    let sampling = false, frames = 0, start = 0, raf = 0;
    const tick = (t) => {
      if (!start) start = t;
      frames += 1;
      if (t - start < 1200) { raf = requestAnimationFrame(tick); return; }
      const fps = (frames / (t - start)) * 1000;
      if (fps < 55) set('flat');
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
