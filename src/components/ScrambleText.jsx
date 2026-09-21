import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const POOL = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>%&@!#$^*()-_+={}[]|\\:;"?/~`');
// The pen's own palette — the one place the site steps outside Paper/Ink/Signal,
// on the studio's request ("renk renk olsun"). Never used anywhere else.
const COLORS = ['#85AF00', '#FFCC00', '#FB9CFD', '#A19BFF', '#FF4C00'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const WAVE_STEP = 0.06;   // s of delay per glyph of distance from the line's centre (the pen uses .03 on hover; slower here, it runs by itself)
const HALF = 500;         // ms — colour in; the same again going back (yoyo). Keep in step with the CSS transition in ScrambleText.scss
const TICK = 3400;        // ms between waves; each wave takes the next line
const FIRST = 1200;       // ms before the first wave
const RESIZE_WAIT = 150;  // ms debounce before lines are re-measured

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Per-line "glyph wave": from a line's centre outward, each glyph flips to a random
 * colour, half of them swap to a random character, a third get a 1px box plus a
 * "△x = Npx" measure tag — then everything settles back. Same recipe as the Andrea
 * Catanzaro "Stack Overflow Instagram Effect" pen, but always running (no hover
 * needed) and written without GSAP: the lines take turns, one wave per tick.
 *
 * Like the pen, a swapped glyph takes its natural width, so the line grows and
 * shrinks around its centre. What the pen gets from SplitText's line wrapping we do
 * by hand: the copy is first laid out naturally, the rendered line breaks are
 * measured, and each line is then rendered as its own nowrap, centred block — so a
 * wider glyph can never re-wrap the paragraph. Re-measured on resize / font load.
 * Off under reduced motion (plain, static copy).
 */
export default function ScrambleText({ text, as: Tag = 'p', className = '', startDelay = 0, ...rest }) {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const words = useMemo(() => text.split(' '), [text]);
  // null → natural flow (measuring); otherwise { text, groups: [[wordIndex, …], …] }
  const [lines, setLines] = useState(null);
  const frozen = lines && lines.text === text ? lines.groups : null;

  const stopEngine = useCallback(() => {
    if (engineRef.current) { engineRef.current(); engineRef.current = null; }
  }, []);

  // 1 · Measure the natural line breaks, then freeze them.
  useLayoutEffect(() => {
    if (frozen || reduced()) return;
    const root = rootRef.current;
    if (!root) return;
    const groups = [];
    let lastTop = null;
    root.querySelectorAll('.scr__w').forEach((w, i) => {
      const r = w.getBoundingClientRect();
      if (lastTop === null || Math.abs(r.top - lastTop) > r.height / 2) { groups.push([]); lastTop = r.top; }
      groups[groups.length - 1].push(i);
    });
    setLines({ text, groups });
  }, [frozen, text]);

  // 2 · Re-measure when the viewport or the fonts change. Glyphs are restored first so
  //     React never reconciles against a swapped character.
  useEffect(() => {
    if (reduced()) return undefined;
    let timer = null;
    let last = `${window.innerWidth}x${window.innerHeight}`;
    const rebuild = () => { stopEngine(); setLines(null); };
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const now = `${window.innerWidth}x${window.innerHeight}`;
        if (now !== last) { last = now; rebuild(); }
      }, RESIZE_WAIT);
    };
    window.addEventListener('resize', onResize);
    const fonts = document.fonts;
    fonts?.addEventListener?.('loadingdone', rebuild);
    let alive = true;
    fonts?.ready?.then(() => { if (alive) rebuild(); });
    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      fonts?.removeEventListener?.('loadingdone', rebuild);
    };
  }, [stopEngine]);

  // 3 · Run the waves over the frozen lines.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !frozen || reduced()) return undefined;

    const lineEls = Array.from(root.querySelectorAll('.scr__l'));
    const lineChars = lineEls.map((l) => Array.from(l.querySelectorAll('.scr__c')));
    const chars = lineChars.flat();
    chars.forEach((c) => { c.dataset.orig = c.textContent; });

    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
    };

    const reset = (c) => {
      c.textContent = c.dataset.orig;
      c.classList.remove('is-boxed');
      c.style.color = '';
      c.style.borderColor = '';
      delete c.dataset.busy;
    };

    const glitch = (c, delayS) => {
      if (c.dataset.busy) return;
      c.dataset.busy = '1';
      later(() => {
        c.style.color = pick(COLORS);
        if (Math.random() < 0.5) c.textContent = pick(POOL);
        if (Math.floor(Math.random() * 3) === 1) {
          const tag = document.createElement('span');
          tag.className = 'scr__detail';
          tag.textContent = `△x = ${Math.round(c.getBoundingClientRect().width)}px`;
          c.appendChild(tag);
          c.style.borderColor = pick(COLORS);
          c.classList.add('is-boxed');
        }
        later(() => { c.style.color = ''; }, HALF);
        later(() => reset(c), HALF * 2);
      }, delayS * 1000);
    };

    let cursor = 0;
    const wave = () => {
      if (document.hidden || !lineChars.length) return;
      const line = lineChars[cursor % lineChars.length];
      cursor += 1;
      const mid = (line.length - 1) / 2;
      line.forEach((c, i) => glitch(c, Math.abs(i - mid) * WAVE_STEP));
    };

    // `startDelay` staggers several instances on one screen so their waves cascade
    // instead of firing in unison.
    let loop = 0;
    const first = setTimeout(() => { wave(); loop = setInterval(wave, TICK); }, FIRST + startDelay);
    const stop = () => {
      clearTimeout(first);
      clearInterval(loop);
      timers.forEach(clearTimeout);
      timers.clear();
      chars.forEach(reset);
    };
    engineRef.current = stop;
    return () => { stop(); if (engineRef.current === stop) engineRef.current = null; };
  }, [frozen, startDelay]);

  const renderWord = (wi) => (
    <span key={wi}>
      <span className="scr__w">
        {Array.from(words[wi]).map((ch, ci) => (
          <span key={ci} className="scr__c">{ch}</span>
        ))}
      </span>
      {wi < words.length - 1 ? ' ' : null}
    </span>
  );

  return (
    <Tag ref={rootRef} className={`scr ${className}`.trim()} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={`scr__vis${frozen ? ' scr__vis--frozen' : ''}`}>
        {frozen
          ? frozen.map((group, li) => <span key={li} className="scr__l">{group.map(renderWord)}</span>)
          : <span className="scr__l">{words.map((_, wi) => renderWord(wi))}</span>}
      </span>
    </Tag>
  );
}
