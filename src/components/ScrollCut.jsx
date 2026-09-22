import { useEffect, useRef } from 'react';

/**
 * Scroll-tied "cut": a Paper-coloured panel grows down over the lower part of the
 * children as the page scrolls, and shrinks back on the way up. The consumer sets where
 * the cut starts with `--cut-from` (see ScrollCut.scss). One smoothed progress value
 * driven from a passive scroll listener into rAF — the same loop shape as TopplingText,
 * minus the per-glyph physics — and only `transform` is written.
 * `range` is the share of the viewport height over which the cut completes. On viewports
 * narrower than 768px, `finishAbove` (px) additionally caps that run so the cut is complete
 * by the time the cut line has risen to that distance from the top — i.e. before the band
 * being cut slides under the fixed nav. On a phone the year leaves the screen within a
 * couple of hundred px of scroll, so a run tied to the viewport height would mostly play
 * out of view; tying it to the band's own visible travel is what makes it readable.
 * Disabled under prefers-reduced-motion: the panel is never shown.
 */
export default function ScrollCut({ as: Tag = 'section', className = '', range = 0.35, finishAbove = 0, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let target = 0, cur = 0, raf = 0, running = false;

    const apply = () => {
      cur += (target - cur) * 0.18;
      if (Math.abs(target - cur) < 0.0015) cur = target;
      panel.style.transform = `scaleY(${cur.toFixed(4)})`;
      if (cur === target) { running = false; return; }
      raf = requestAnimationFrame(apply);
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(apply); } };
    const onScroll = () => {
      // Never ask for more scroll than the page has (tall tablets): the cut always completes.
      const room = document.documentElement.scrollHeight - window.innerHeight;
      let span = Math.min(window.innerHeight * range, room);
      if (finishAbove && window.innerWidth < 768) {
        // scaleY keeps the panel's top edge where it is, so its rect top is the cut line
        const cutLine = panel.getBoundingClientRect().top + window.scrollY;
        span = Math.min(span, cutLine - finishAbove);
      }
      target = Math.min(1, Math.max(0, window.scrollY / Math.max(1, span)));
      kick();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [range, finishAbove]);

  return (
    <Tag className={`cut ${className}`.trim()}>
      {children}
      <div ref={panelRef} className="cut__panel" aria-hidden="true" />
    </Tag>
  );
}
