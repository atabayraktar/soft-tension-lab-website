import { useEffect, useRef, useState } from 'react';
import ArchiveImage from './ArchiveImage';
import BannerPattern from './BannerPattern';

// The statement banner between the showcase and the black finale: one wide, low frame
// running edge to edge, the two-line statement set straight onto it in the studio's own
// type (each sentence its own line on wide screens, wrapping on phones). It butts against
// the black finale below — no Paper gap. The field drifts a touch with the scroll.
// NOTE: the type sits directly on the field (the pattern is a flat Ink ground). When a
// busy photo replaces it, put a glass layer under the text again.
//
// BACKGROUND — swap here, one line. The studio has not supplied the real photo yet, so
// the frame is filled by BannerPattern (a generative Ink/Paper pattern, see that file).
// To use a photo: BANNER_IMAGE = { slug: 'x1', tone: 'auto' } — `slug` is any key of
// public/images/archive/manifest.json; `tone` picks the glass for the photo:
// 'dark' → ink-tinted glass + paper type · 'light' → frosted glass + ink type ·
// 'auto' → sampled from the image once it loads. `null` → the pattern.
const BANNER_IMAGE = null;

const MOTION_OK = '(prefers-reduced-motion: no-preference)';

// Mean relative luminance of the loaded image, sampled on a tiny canvas (same-origin,
// so no CORS taint). Returns null when sampling is impossible — the caller keeps 'dark'.
function sampleTone(img) {
  try {
    const c = document.createElement('canvas');
    c.width = 24;
    c.height = 24;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, 24, 24);
    const { data } = ctx.getImageData(0, 0, 24, 24);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (data.length / 4) / 255 > 0.5 ? 'light' : 'dark';
  } catch {
    return null;
  }
}

export default function Banner() {
  const ref = useRef(null);
  const [tone, setTone] = useState(BANNER_IMAGE?.tone === 'light' ? 'light' : 'dark');

  // Tone detection (photo + 'auto' only): read the photo once it has decoded.
  useEffect(() => {
    if (BANNER_IMAGE?.tone !== 'auto') return undefined;
    const img = ref.current?.querySelector('img');
    if (!img) return undefined;
    let alive = true;
    const run = () => {
      const t = sampleTone(img);
      if (alive && t) setTone(t);
    };
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
    return () => { alive = false; img.removeEventListener('load', run); };
  }, []);

  // Scroll drift. One CSS var (--p, −1 … 1 = frame entering … leaving) written per frame
  // while the frame is on screen; the SCSS maps it onto the field's transform. Off under
  // reduced motion.
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(MOTION_OK).matches) return undefined;
    let raf = 0;
    let active = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(-1, Math.min(1, ((vh - r.top) / (vh + r.height)) * 2 - 1));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => { if (active && !raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      if (active) onScroll();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="banner" aria-label="Stüdyo notu">
      <div ref={ref} className={`banner__frame banner__frame--${tone}`}>
        <div className="banner__field">
          {BANNER_IMAGE ? (
            <ArchiveImage slug={BANNER_IMAGE.slug} alt="" ratio="16 / 9" sizes="100vw" className="banner__img" />
          ) : (
            <BannerPattern />
          )}
        </div>

        <p className="banner__copy" data-reveal>
          <span className="banner__line banner__line--lead">Sistematik tasarım ile sanatsal sezgi arasındaki gerilimden besleniyor,</span>
          <span className="banner__line banner__line--punch">markalar için samimi görsel hikayeler yaratıyoruz.</span>
        </p>
      </div>
    </section>
  );
}
