import { useEffect, useId, useRef, useState } from 'react';
import ScrambleText from './ScrambleText';
import { SERVICES, SERVICE_DETAILS, SERVICES_ID } from '../lib/site';

// The vertical (stacked-rows) accordion runs below this; the seven-column horizontal
// accordion from it up. Keep in step with $bp-xl in Services.scss.
const WIDE = '(min-width: 1280px)';
const REDUCED = '(prefers-reduced-motion: reduce)';

const upper = (s) => s.toLocaleUpperCase('tr-TR');

/**
 * Home services — #hizmetler, the nav's "Hizmetler" target.
 *
 * Wide (≥ 1280px): seven equal hairline columns, index + title only. Hovering (mouse),
 * focusing (keyboard) or tapping (touch tablets) one grows it and squeezes the other six
 * to narrow strips; the grown column shows the big index with its "// TITLE" running the
 * glyph wave (ScrambleText, mounted on open so the wave fires on reveal), the "/ " lines
 * and the one-sentence copy. Leaving the list with the mouse puts every column back.
 *
 * Narrow: a vertical accordion — full-width rows, tap toggles, one open at a time, the
 * index + title always visible and the lines + copy folding out under the title. No
 * hover dependence on touch. Under reduced motion the first entry starts open.
 */
export default function Services() {
  const [open, setOpen] = useState(null);
  const [wide, setWide] = useState(false);
  const listRef = useRef(null);
  const uid = useId();

  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    if (window.matchMedia(REDUCED).matches) setOpen(0);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  const toggle = (i) => setOpen((o) => (o === i ? null : i));

  // Wide: hover / focus / tap all open a column (a tap focuses first, so a toggle would
  // shut it again); the mouse leaving or focus leaving the list puts every column back.
  // Narrow: a tap toggles its row, one open at a time.
  const onClick = (i) => () => { if (wide) setOpen(i); else toggle(i); };
  const onFocus = (i) => () => { if (wide) setOpen(i); };
  const onEnter = (i) => (e) => { if (wide && e.pointerType === 'mouse') setOpen(i); };
  const onLeave = (e) => { if (wide && e.pointerType === 'mouse') setOpen(null); };
  const onBlur = (e) => {
    if (wide && !listRef.current?.contains(e.relatedTarget)) setOpen(null);
  };

  return (
    <section id={SERVICES_ID} className="services" aria-labelledby="services-title">
      <div className="wrap">
        <h2 id="services-title" className="eyebrow services__eyebrow" data-reveal>HİZMETLER</h2>

        <ul
          ref={listRef}
          className={`services__list${open !== null ? ' has-open' : ''}`}
          onPointerLeave={onLeave}
          onBlur={onBlur}
          data-reveal
        >
          {SERVICES.map((title, i) => {
            const isOpen = open === i;
            const index = `00-${i + 1}`;
            const headId = `${uid}-h${i}`;
            const panelId = `${uid}-p${i}`;
            const { items, copy } = SERVICE_DETAILS[i];
            return (
              <li key={title} className={`svc${isOpen ? ' is-open' : ''}`} onPointerEnter={onEnter(i)}>
                <button
                  type="button"
                  id={headId}
                  className="svc__head"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={onClick(i)}
                  onFocus={onFocus(i)}
                >
                  <span className="svc__index">{index}</span>
                  <span className="svc__title">{title}</span>
                  <span className="svc__plus" aria-hidden="true"><i /><i /></span>
                </button>

                <div id={panelId} className="svc__panel" role="region" aria-labelledby={headId} aria-hidden={!isOpen}>
                  <div className="svc__panel-in">
                    <div className="svc__body">
                      {/* Wide only: the big index and the decoded "// TITLE" (the title itself is the button above). */}
                      <p className="svc__lead" aria-hidden="true">
                        <span className="svc__num">{index}</span>
                        {isOpen && wide ? (
                          <ScrambleText as="span" className="svc__code" text={`// ${upper(title)}`} firstDelay={180} />
                        ) : null}
                      </p>
                      <ul className="svc__items">
                        {items.map((item) => <li key={item} className="svc__item">{item}</li>)}
                      </ul>
                      <p className="svc__copy">{copy}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
