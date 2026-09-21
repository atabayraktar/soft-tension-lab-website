import { useEffect, useRef, useState } from 'react';
import GlassCard from './GlassCard';

const MIN_THUMB = 56;   // px — the thumb never gets smaller than this
const PAD = 6;          // px — breathing room above/below the travel
const IDLE_MS = 1400;   // after the last scroll the thumb settles to its resting opacity

/**
 * Liquid-glass scrollbar — fine-pointer desktops only. The native bar is hidden by the
 * `data-sbar` flag (stamped before first paint in _document, so nothing shifts); this thumb
 * is a GlassCard mirroring the document scroll. Wheel, trackpad, keyboard and Lenis keep
 * driving the real scroll, so nothing else changes — the thumb only *reads* the scroll
 * position, and writes it when dragged. Touch devices never mount it and keep their native
 * overlay bars.
 *
 * Perf: the thumb moves with a single `transform`, layout is recomputed at most once per
 * frame and only while something scrolls/resizes. Refraction is off on purpose (an 8px pill
 * has nothing to bend) — it is blur + tint + shine, one backdrop pass.
 *
 * Markup: `.sbar__slide` is the thing that moves and is the (constant, 16px) hit zone; the
 * GlassCard inside is the visible glass rod, which breathes wider on hover/drag with a
 * `scale` — so the target never shrinks with the rod at rest.
 */
export default function GlassScrollbar() {
  const [enabled, setEnabled] = useState(false);
  const barRef = useRef(null);
  const slideRef = useRef(null);

  useEffect(() => {
    setEnabled(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const bar = barRef.current;
    const slide = slideRef.current;
    if (!bar || !slide) return undefined;

    const root = document.documentElement;
    let raf = 0;
    let idleTimer = 0;
    let dragging = false;
    let thumbH = 0;
    let drag = null;

    const metrics = () => {
      const vh = window.innerHeight;
      const sh = root.scrollHeight;
      return { vh, max: sh - vh, sh };
    };

    const paint = () => {
      raf = 0;
      const { vh, max, sh } = metrics();
      if (max <= 1) { bar.dataset.hidden = 'true'; return; }
      bar.dataset.hidden = 'false';

      const track = vh - PAD * 2;
      thumbH = Math.max(MIN_THUMB, Math.round((track * vh) / sh));
      const travel = track - thumbH;
      const y = PAD + Math.min(1, Math.max(0, window.scrollY / max)) * travel;
      slide.style.height = `${thumbH}px`;
      slide.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;

      // Tone: a dark full-bleed section behind the thumb (Works, footer finale) gets the
      // light frost tint, everything else the Ink tint — glass needs something to read on.
      const behind = document.elementsFromPoint(window.innerWidth - 8, y + thumbH / 2).find((el) => !bar.contains(el));
      const tone = behind && behind.closest('[data-nav-invert]') ? 'dark' : 'light';
      if (bar.dataset.tone !== tone) bar.dataset.tone = tone;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    const wake = () => {
      bar.dataset.idle = 'false';
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { if (!dragging) bar.dataset.idle = 'true'; }, IDLE_MS);
    };
    const onScroll = () => { wake(); schedule(); };

    // A plain native scroll: Lenis picks it up from the scroll event (it only smooths wheel
    // input), and unlike lenis.scrollTo it can't be clamped by a stale cached limit.
    const setScroll = (y) => window.scrollTo(0, y);

    const onDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      slide.setPointerCapture(e.pointerId);
      dragging = true;
      drag = { startY: e.clientY, startScroll: window.scrollY };
      bar.dataset.drag = 'true';
      root.setAttribute('data-sbar-drag', '1');
      wake();
    };
    const onMove = (e) => {
      if (!dragging || !drag) return;
      const { vh, max } = metrics();
      const travel = vh - PAD * 2 - thumbH;
      if (travel <= 0) return;
      const target = drag.startScroll + ((e.clientY - drag.startY) * max) / travel;
      setScroll(Math.min(max, Math.max(0, target)));
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      drag = null;
      bar.dataset.drag = 'false';
      root.removeAttribute('data-sbar-drag');
      if (slide.hasPointerCapture(e.pointerId)) slide.releasePointerCapture(e.pointerId);
      wake();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    slide.addEventListener('pointerdown', onDown);
    slide.addEventListener('pointermove', onMove);
    slide.addEventListener('pointerup', onUp);
    slide.addEventListener('pointercancel', onUp);
    // Page swaps, images and fonts change the document height without any scroll event.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    schedule();
    wake();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      slide.removeEventListener('pointerdown', onDown);
      slide.removeEventListener('pointermove', onMove);
      slide.removeEventListener('pointerup', onUp);
      slide.removeEventListener('pointercancel', onUp);
      ro.disconnect();
      root.removeAttribute('data-sbar-drag');
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={barRef} className="sbar" data-hidden="true" data-idle="false" data-tone="light" data-drag="false" aria-hidden="true">
      <div ref={slideRef} className="sbar__slide">
        <GlassCard variant="tint" refraction="chip" radius="pill" className="sbar__thumb" />
        <span className="sbar__signal" aria-hidden="true" />
      </div>
    </div>
  );
}
