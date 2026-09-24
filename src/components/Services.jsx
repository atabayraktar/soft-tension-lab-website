import { useEffect, useId, useRef, useState } from 'react';
import ScrambleText from './ScrambleText';
import { SERVICES, SERVICE_DETAILS, SERVICES_ID } from '../lib/site';

// The vertical (stacked-rows) accordion runs below this; the seven-column horizontal
// accordion from it up. Keep in step with $bp-xl in Services.scss.
const WIDE = '(min-width: 1280px)';
const REDUCED = '(prefers-reduced-motion: reduce)';

const upper = (s) => s.toLocaleUpperCase('tr-TR');

/**
 * Home services — #hizmetler, the nav's "Hizmetler" target. Full-bleed, on Paper, no
 * heading of its own (the section is named for assistive tech only) and no vertical
 * padding: the band sits directly between its neighbouring bands.
 *
 * Wide (≥ 1280px): seven equal Ink-ruled columns under one top rule, title only. Hovering
 * (mouse), focusing (keyboard) or tapping (touch tablets) one grows it and squeezes the
 * other six. Inside the grown column, in order: the title slides up out of its mask, the
 * big title arrives with one glyph wave (ScrambleText `once`, mounted on open so it runs
 * exactly while the column grows) and settles into Signal, the lines drop in one after
 * another (last line first), the copy fades in at the foot, and two short ticks mark the
 * column's base corners. The mouse leaving the list closes every column, softly.
 *
 * Narrow: a vertical accordion — full-width rows, tap toggles, one open at a time, the
 * open title turning Signal and the lines + copy folding out under it with the same
 * choreography. No hover dependence on touch. Under reduced motion the first entry
 * starts open.
 *
 * The list's own class never changes after mount: useReveal adds `is-in` to the wrapper
 * around it, and React overwriting a className would wipe that class (the section then
 * sat at opacity 0 — the "disappears on hover" bug). State lives on each <li> only.
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
    // data-land-with: the nav lands on this section together with the two marquee bands
    // around it (Nav.jsx scrollToSection), so both bands are on screen on arrival.
    <section id={SERVICES_ID} className="services" aria-label="Hizmetler" data-land-with="siblings">
      <div className="services__reveal" data-reveal>
        <ul ref={listRef} className="services__list" onPointerLeave={onLeave} onBlur={onBlur}>
          {SERVICES.map((title, i) => {
            const isOpen = open === i;
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
                  {/* Capitalised in the data, not by CSS text-transform (unreliable for İ/Ü on some engines — see Nav). */}
                  <span className="svc__title"><span className="svc__title-in">{upper(title)}</span></span>
                </button>

                <div id={panelId} className="svc__panel" role="region" aria-labelledby={headId} aria-hidden={!isOpen}>
                  <div className="svc__panel-in">
                    <div className="svc__body">
                      {/* Wide only: the open state's big title, waved in once (the title itself is the button above). */}
                      {isOpen && wide ? (
                        <ScrambleText as="p" className="svc__code" text={upper(title)} firstDelay={0} once aria-hidden="true" />
                      ) : null}
                      <ul className="svc__items">
                        {items.map((item) => (
                          <li key={item} className="svc__item"><span className="svc__item-in">{item}</span></li>
                        ))}
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
