import { useEffect, useState } from 'react';

// Archive photos are not uniformly light or dark, so each is sampled into a small luma
// grid once it has decoded (N × N, gamma-encoded Rec.709 luma, 0–1). A nav item is painted
// Paper when the photo region right behind IT averages under DARK_REGION — about where
// navy and Paper text meet in contrast.
const N = 24;
const DARK_REGION = 0.45;
const PAPER_LUMA = 0.94;   // what the uncovered part of an item sits on

function lumaGrid(img) {
  try {
    const c = document.createElement('canvas');
    c.width = N;
    c.height = N;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, N, N);
    const d = g.getImageData(0, 0, N, N).data;
    const out = new Float32Array(N * N);
    for (let i = 0; i < N * N; i += 1) {
      out[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    }
    return out;
  } catch {
    return null; // tainted / undecodable — treated as light
  }
}

// Mean luma of the part of `img` that lies under the viewport rect `r` and the size of that
// part in px², or null when they do not overlap. The photo is laid out `object-fit: cover`, centred.
function lumaUnder(img, grid, r) {
  const R = img.getBoundingClientRect();
  const ix0 = Math.max(r.left, R.left), ix1 = Math.min(r.right, R.right);
  const iy0 = Math.max(r.top, R.top), iy1 = Math.min(r.bottom, R.bottom);
  if (ix1 <= ix0 || iy1 <= iy0 || !img.naturalWidth) return null;
  const s = Math.max(R.width / img.naturalWidth, R.height / img.naturalHeight);
  const offX = (R.width - img.naturalWidth * s) / 2;
  const offY = (R.height - img.naturalHeight * s) / 2;
  const u0 = Math.floor((((ix0 - R.left - offX) / s) / img.naturalWidth) * N);
  const u1 = Math.ceil((((ix1 - R.left - offX) / s) / img.naturalWidth) * N);
  const v0 = Math.floor((((iy0 - R.top - offY) / s) / img.naturalHeight) * N);
  const v1 = Math.ceil((((iy1 - R.top - offY) / s) / img.naturalHeight) * N);
  let sum = 0, n = 0;
  for (let v = Math.max(0, v0); v < Math.min(N, v1); v += 1) {
    for (let u = Math.max(0, u0); u < Math.min(N, u1); u += 1) { sum += grid[v * N + u]; n += 1; }
  }
  return n ? { luma: sum / n, area: (ix1 - ix0) * (iy1 - iy0) } : null;
}

/**
 * Watches every [data-nav-invert] surface (dark/black full-bleed sections — FooterFinale,
 * the Works logo wall, the dark band, the banner, a dark/black Footer) and reports whether
 * one currently sits directly behind the fixed nav bar, so the whole bar can flip navy <->
 * paper to stay legible regardless of what's scrolled underneath it — a page's static
 * theme is only the pre-hydration fallback.
 *
 * Photos are narrower than the bar, so they never flip it: each nav item instead follows
 * the photo directly behind IT (`data-on-dark`, painted Paper in Nav.scss).
 */
export default function useNavInvert(navRef, initial, routeKey) {
  const [invert, setInvert] = useState(initial);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const active = new Set();
    let io;

    const build = () => {
      if (io) io.disconnect();
      active.clear();
      const targets = Array.from(document.querySelectorAll('[data-nav-invert]'));
      if (!targets.length) { setInvert(false); return; }
      const rect = nav.getBoundingClientRect();
      const bottomMargin = window.innerHeight - rect.bottom;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) active.add(entry.target);
            else active.delete(entry.target);
          });
          setInvert(active.size > 0);
        },
        { rootMargin: `${-rect.top}px 0px ${-bottomMargin}px 0px`, threshold: 0 }
      );
      targets.forEach((el) => io.observe(el));
    };

    // Photo grids, measured as each one decodes. (`load` does not bubble, so it is caught
    // on the way down — photos that mount or finish decoding after this effect ran are
    // picked up too.)
    const grids = new Map();
    let raf = 0;
    const paint = () => {
      raf = 0;
      const near = [];
      grids.forEach((grid, img) => {
        const r = img.getBoundingClientRect();
        const li = img.closest('[data-reveal]');
        // Skip photos scrolled away, or not yet revealed (still transparent).
        if (r.bottom > 0 && r.top < 200 && (!li || Number(getComputedStyle(li).opacity) > 0.5)) near.push([img, grid]);
      });
      nav.querySelectorAll('.nav__brand, .nav__link, .nav__toggle').forEach((it) => {
        const r = it.getBoundingClientRect();
        // Area-weighted: the part of the item that no photo covers sits on Paper.
        const total = r.width * r.height;
        let covered = 0, weighted = 0;
        for (const [img, grid] of near) {
          const hit = lumaUnder(img, grid, r);
          if (hit) { covered += hit.area; weighted += hit.luma * hit.area; }
        }
        const mean = covered ? (weighted + Math.max(0, total - covered) * PAPER_LUMA) / Math.max(total, covered) : 1;
        it.toggleAttribute('data-on-dark', mean < DARK_REGION);
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const measure = (img) => {
      if (grids.has(img)) return;
      const grid = lumaGrid(img);
      if (grid) { grids.set(img, grid); schedule(); }
    };
    const onLoad = (e) => {
      if (e.target instanceof HTMLImageElement && e.target.classList.contains('archive-img')) measure(e.target);
    };
    document.addEventListener('load', onLoad, true);
    document.querySelectorAll('img.archive-img').forEach((img) => {
      if (img.complete && img.naturalWidth) measure(img);
    });

    build();
    window.addEventListener('resize', build);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      window.removeEventListener('resize', build);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('load', onLoad, true);
      if (raf) cancelAnimationFrame(raf);
      nav.querySelectorAll('[data-on-dark]').forEach((it) => it.removeAttribute('data-on-dark'));
      if (io) io.disconnect();
    };
  }, [navRef, routeKey]);

  return invert;
}
