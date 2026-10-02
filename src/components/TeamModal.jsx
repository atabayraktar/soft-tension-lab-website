import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from './GlassCard';
import { lockScroll } from '../lib/scrollLock';

/**
 * The About team card, expanded: the clicked card lifts off the grid, spins a few
 * degrees as it grows, glides to the centre and settles — then the bio reads inside the
 * same glass. Closing is the mirror: the content fades, the card lifts a touch, then
 * spins back down into its slot in the grid and melts into the real card there.
 *
 * It is a FLIP: the modal is laid out at its final size and position (CSS), the source
 * card's rect is measured, and the wrapper animates between the pose matching that rect
 * and identity (Web Animations API, transform + opacity only — never layout). The pose is
 * three separate animations on the individual `translate` / `rotate` / `scale`
 * properties (which always compose as translate·rotate·scale, so the spin never shears
 * the non-uniform scale) — the spin runs on its own bell curve and is 0deg at BOTH ends,
 * so the glass sits flat and pixel-exact on the small card at take-off and at landing.
 *
 * The hand-off is a dissolve the eye can't catch, timed on the animation clock (every
 * animation here is created in one task, so they share a start frame — never
 * setTimeout, which drifts from the compositor under load):
 *   • open: the glass starts clear (effect + tint at 0) over the still-visible source,
 *     darkens as it lifts; the source fades out under it (80→200ms).
 *   • close: the content goes first (0→30%), the glass melts clear (45→90%) while the
 *     source card fades back in beneath it (55→92%), then the last 12% dissolves the
 *     empty rim into the real card. At every frame the two cards share one rect.
 * The source card is measured as the glass root inside its <li> (about.scss pauses its
 * idle float and parks it at near-zero — not zero — opacity while `data-lifted`, so it
 * keeps its compositor layer and painting it back costs no frame at the landing).
 *
 * Mounted only while open; `onClose` fires once the close animation has landed, and the
 * parent unmounts it. Scroll lock, Escape, focus and `inert` on the page root follow the
 * nav sheet's pattern (Nav.jsx). Reduced motion: an opacity swap, no choreography.
 */

const OPEN_MS = 640;
const CLOSE_MS = 560;
const RM_MS = 180;
const SPIN = 7;                  // degrees, at the peak of the flight
const DRIFT_Y = -8;              // px, the small lift the card settles from / takes off with
const DRIFT_S = 1.012;
const EASE_OUT_EXPO = 'cubic-bezier(.16, 1, .3, 1)';
const EASE_OUT_CUBIC = 'cubic-bezier(.33, 1, .68, 1)';
const EASE_IN_OUT = 'cubic-bezier(.45, 0, .22, 1)';   // close flight: no dead stop, no kick
const EASE_BELL = 'cubic-bezier(.4, 0, .6, 1)';       // the spin, symmetric
const NAME_ID = 'team-modal-name';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TeamModal({ person, index, sourceEl, onClose }) {
  const cardRef = useRef(null);    // the animated wrapper (the dialog)
  const bodyRef = useRef(null);    // the content inside the glass (fades separately)
  const scrimRef = useRef(null);
  const closeRef = useRef(null);
  const st = useRef({ closing: false, anims: [], unlock: null });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // The source card is the glass root in the <li> (the <li> owns the scroll-reveal; the
  // card owns the idle float + hover lift, and it is what the eye lines the modal up with).
  const sourceCard = () => sourceEl?.firstElementChild ?? null;
  // The source card's four layers, faded individually. Fading the card root instead would
  // make it a Backdrop Root (opacity < 1): its backdrop-filter would sample only its own
  // empty content, then jump to the real page (the "2026" numeral behind it) in one frame
  // when the animation is cancelled — a blink. A layer's own opacity scales its blur output,
  // so the blur ramps in smoothly.
  const sourceLayers = () => {
    const src = sourceCard();
    return src ? [...src.querySelectorAll(':scope > .lg__effect, :scope > .lg__tint, :scope > .lg__shine, :scope > .lg__content')] : [];
  };
  const glassLayers = () => {
    const card = cardRef.current;
    return card ? [card.querySelector('.lg__effect'), card.querySelector('.lg__tint')] : [];
  };

  // The wrapper's pose at the source card's rect. Rotation leans away from the viewport
  // centre (a card on the left spins counter-clockwise, on the right clockwise).
  const pose = () => {
    const card = cardRef.current;
    const src = sourceCard();
    if (!src || !card) return null;
    const s = src.getBoundingClientRect();
    const d = card.getBoundingClientRect();
    if (!s.width || !d.width) return null;
    const dir = s.left + s.width / 2 < window.innerWidth / 2 ? -1 : 1;
    const dx = s.left + s.width / 2 - (d.left + d.width / 2);
    const dy = s.top + s.height / 2 - (d.top + d.height / 2);
    return {
      translate: `${dx.toFixed(2)}px ${dy.toFixed(2)}px`,
      scale: `${(s.width / d.width).toFixed(5)} ${(s.height / d.height).toFixed(5)}`,
      spin: `${SPIN * dir}deg`,
    };
  };

  const run = (el, keyframes, opts) => {
    if (!el) return null;
    const a = el.animate(keyframes, { fill: 'both', ...opts });
    st.current.anims.push(a);
    return a;
  };

  // Open — before first paint, so the first frame is already the source-sized pose.
  useLayoutEffect(() => {
    const s = st.current;
    const card = cardRef.current;
    s.unlock = lockScroll();
    const root = document.getElementById('__next');
    root?.setAttribute('inert', '');
    // Pauses the float and parks the card (about.scss) — set before measuring.
    sourceEl?.setAttribute('data-lifted', '');

    const p = reducedMotion() ? null : pose();
    if (p) {
      const drift = `0px ${DRIFT_Y}px`;
      run(card, [
        { translate: p.translate, easing: EASE_OUT_EXPO },
        { translate: drift, offset: 0.72, easing: EASE_OUT_CUBIC },
        { translate: '0px 0px' },
      ], { duration: OPEN_MS });
      run(card, [
        { scale: p.scale, easing: EASE_OUT_EXPO },
        { scale: String(DRIFT_S), offset: 0.72, easing: EASE_OUT_CUBIC },
        { scale: '1' },
      ], { duration: OPEN_MS });
      run(card, [
        { rotate: '0deg', easing: EASE_OUT_CUBIC },
        { rotate: p.spin, offset: 0.14, easing: EASE_OUT_EXPO },
        { rotate: `${-parseFloat(p.spin) * 0.17}deg`, offset: 0.72, easing: EASE_OUT_CUBIC },
        { rotate: '0deg' },
      ], { duration: OPEN_MS });
      // The glass darkens as it lifts off the (still visible) source card.
      glassLayers().forEach((el) => run(el, [
        { opacity: 0, easing: EASE_OUT_CUBIC },
        { opacity: 1, offset: 0.3 },
        { opacity: 1 },
      ], { duration: OPEN_MS }));
      sourceLayers().forEach((el) => run(el, [
        { opacity: 1 },
        { opacity: 1, offset: 0.125, easing: EASE_OUT_CUBIC },
        { opacity: 0.001, offset: 0.31 },
        { opacity: 0.001 },
      ], { duration: OPEN_MS }));
      run(bodyRef.current, [
        { opacity: 0 },
        { opacity: 0, offset: 0.2, easing: EASE_OUT_CUBIC },
        { opacity: 1, offset: 0.7 },
        { opacity: 1 },
      ], { duration: OPEN_MS });
      run(closeRef.current, [
        { opacity: 0 },
        { opacity: 0, offset: 0.2, easing: EASE_OUT_CUBIC },
        { opacity: 1, offset: 0.7 },
        { opacity: 1 },
      ], { duration: OPEN_MS });
      run(scrimRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: EASE_OUT_CUBIC });
    } else {
      run(card, [{ opacity: 0 }, { opacity: 1 }], { duration: RM_MS, easing: EASE_OUT_CUBIC });
      run(scrimRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: RM_MS, easing: EASE_OUT_CUBIC });
    }
    card?.focus({ preventScroll: true });

    return () => {
      s.anims.forEach((a) => a.cancel());
      s.anims = [];
      root?.removeAttribute('inert');
      s.unlock?.();
      s.unlock = null;
      if (sourceEl) {
        // Back in the grid, at full opacity, float resumed. The pointer is often still
        // parked over the slot (Escape / close badge): hover stays off the landed card
        // until the pointer actually moves, so the landing is not followed by a hover
        // lift (and a tap's sticky hover never sets in).
        sourceEl.removeAttribute('data-lifted');
        sourceEl.setAttribute('data-settled', '');
        const settle = () => {
          sourceEl.removeAttribute('data-settled');
          document.removeEventListener('pointermove', settle);
          document.removeEventListener('pointerdown', settle);
        };
        document.addEventListener('pointermove', settle, { passive: true });
        document.addEventListener('pointerdown', settle, { passive: true });
        // Focus goes back to the card that opened it (no-op if the page has moved on).
        sourceEl.querySelector('button')?.focus({ preventScroll: true });
      }
    };
    // Mount/unmount only: the parent remounts (new key) for a different person.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = () => {
    const s = st.current;
    if (s.closing) return;
    s.closing = true;
    const card = cardRef.current;
    // Escape is a key press, so Chrome would paint the dialog's :focus-visible ring on
    // the card for the whole flight down. Focus leaves now; cleanup hands it to the
    // source card's button.
    if (card?.contains(document.activeElement)) document.activeElement.blur();
    const p = reducedMotion() ? null : pose();
    let a;
    if (p) {
      const drift = `0px ${DRIFT_Y}px`;
      a = run(card, [
        { translate: '0px 0px', easing: EASE_OUT_CUBIC },
        { translate: drift, offset: 0.2, easing: EASE_IN_OUT },
        { translate: p.translate },
      ], { duration: CLOSE_MS });
      run(card, [
        { scale: '1', easing: EASE_OUT_CUBIC },
        { scale: String(DRIFT_S), offset: 0.2, easing: EASE_IN_OUT },
        { scale: p.scale },
      ], { duration: CLOSE_MS });
      run(card, [
        { rotate: '0deg', easing: EASE_BELL },
        { rotate: p.spin, offset: 0.58, easing: EASE_BELL },
        { rotate: '0deg' },
      ], { duration: CLOSE_MS });
      // Content first, then the glass melts clear while the real card fades in beneath
      // it, and the last stretch dissolves what is left (the rim) into that card.
      [bodyRef.current, closeRef.current].forEach((el) => run(el, [
        { opacity: 1, easing: EASE_OUT_CUBIC },
        { opacity: 0, offset: 0.3 },
        { opacity: 0 },
      ], { duration: CLOSE_MS }));
      glassLayers().forEach((el) => run(el, [
        { opacity: 1 },
        { opacity: 1, offset: 0.45, easing: EASE_BELL },
        { opacity: 0, offset: 0.9 },
        { opacity: 0 },
      ], { duration: CLOSE_MS }));
      sourceLayers().forEach((el) => run(el, [
        { opacity: 0.001 },
        { opacity: 0.001, offset: 0.55, easing: EASE_OUT_CUBIC },
        { opacity: 1, offset: 0.92 },
        { opacity: 1 },
      ], { duration: CLOSE_MS }));
      run(card, [{ opacity: 1 }, { opacity: 1, offset: 0.88 }, { opacity: 0 }], { duration: CLOSE_MS, easing: 'linear' });
      // The scrim is visually gone well before the landing; reaching 0 early lets the
      // compositor drop its full-screen blur for the frames that matter most.
      run(scrimRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.7, easing: EASE_OUT_CUBIC });
    } else {
      sourceEl?.removeAttribute('data-lifted');
      a = run(card, [{ opacity: 1 }, { opacity: 0 }], { duration: RM_MS, easing: EASE_OUT_CUBIC });
      run(scrimRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: RM_MS, easing: EASE_OUT_CUBIC });
    }
    if (a) a.onfinish = () => onCloseRef.current?.();
    else onCloseRef.current?.();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); requestClose(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLayerClick = (e) => { if (e.target === e.currentTarget) requestClose(); };
  const n = String(index + 1).padStart(2, '0');

  return createPortal(
    <div className="team-modal">
      <div ref={scrimRef} className="team-modal__scrim" aria-hidden="true" />
      <div className="team-modal__layer" onClick={onLayerClick}>
        <div
          ref={cardRef}
          className="team-modal__card"
          role="dialog"
          aria-modal="true"
          aria-labelledby={NAME_ID}
          tabIndex={-1}
        >
          <GlassCard radius="small" variant="tint" refraction="card" className="team-modal__glass" contentClassName="team-modal__content">
            <div ref={bodyRef} className="team-modal__body">
              <span className="team-modal__slot">
                <span className="team-modal__label">Avatar · {n}</span>
                <span className="team-modal__note">Yer tutucu</span>
              </span>
              <div className="team-modal__text">
                <div className="team-modal__caps">
                  <h2 id={NAME_ID} className="team-modal__name">{person.name}</h2>
                  <p className="team-modal__role">
                    {person.role.split(' / ').map((line) => (
                      <span key={line} className="team-modal__role-line">{line}</span>
                    ))}
                  </p>
                </div>
                <p className="team-modal__bio">{person.bio}</p>
              </div>
            </div>
          </GlassCard>
          <button ref={closeRef} type="button" className="team-modal__close" aria-label="Kapat" onClick={requestClose}>
            <span className="team-modal__close-icon" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
