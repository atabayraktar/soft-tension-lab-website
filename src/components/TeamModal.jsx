import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from './GlassCard';
import { lockScroll } from '../lib/scrollLock';

/**
 * The About team card, expanded: the clicked card lifts off the grid, spins a few
 * degrees as it grows, glides to the centre and settles — then the bio reads inside the
 * same glass. Closing is the mirror: the content fades, the card lifts a touch, then
 * spins back down into its slot in the grid, which fades back in under it.
 *
 * It is a FLIP: the modal is laid out at its final size and position (CSS), the source
 * card's rect is measured, and the wrapper animates from `translate·rotate·scale`
 * matching that rect to `none` (Web Animations API, transform + opacity only — never
 * layout). The source card is hidden (`data-lifted` on its <li>, about.scss) 80ms in, so
 * for the first frames the growing glass sits over the real card, blurring it through
 * its own backdrop — the content then sharpens into the new one. Same in reverse.
 *
 * Mounted only while open; `onClose` fires once the close animation has landed, and the
 * parent unmounts it. Scroll lock, Escape, focus and `inert` on the page root follow the
 * nav sheet's pattern (Nav.jsx). Reduced motion: an opacity swap, no choreography.
 */

const OPEN_MS = 640;
const CLOSE_MS = 520;
const RM_MS = 180;
const LIFT_AT = 80;              // ms into the open before the source card hides
const LAND_AT = 0.7;             // share of the close after which the source card returns
const SPIN = 7;                  // degrees, at the source rect
const EASE_OUT_EXPO = 'cubic-bezier(.16, 1, .3, 1)';
const EASE_OUT_CUBIC = 'cubic-bezier(.33, 1, .68, 1)';
const EASE_IN_OUT = 'cubic-bezier(.64, 0, .36, 1)';
const NAME_ID = 'team-modal-name';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TeamModal({ person, index, sourceEl, onClose }) {
  const cardRef = useRef(null);    // the animated wrapper (the dialog)
  const bodyRef = useRef(null);    // the content inside the glass (fades separately)
  const scrimRef = useRef(null);
  const closeRef = useRef(null);
  const st = useRef({ closing: false, anims: [], timers: [], unlock: null });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // The wrapper's transform at the source card's rect: rotation leans away from the
  // viewport centre (a card on the left spins in counter-clockwise, on the right
  // clockwise), the drift pose is the small overshoot it settles back from.
  const pose = () => {
    const card = cardRef.current;
    if (!sourceEl || !card) return null;
    const s = sourceEl.getBoundingClientRect();
    const d = card.getBoundingClientRect();
    if (!s.width || !d.width) return null;
    const dir = s.left + s.width / 2 < window.innerWidth / 2 ? -1 : 1;
    const dx = s.left + s.width / 2 - (d.left + d.width / 2);
    const dy = s.top + s.height / 2 - (d.top + d.height / 2);
    return {
      from: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${SPIN * dir}deg) scale(${(s.width / d.width).toFixed(4)}, ${(s.height / d.height).toFixed(4)})`,
      drift: `translate(0px, -8px) rotate(${(-SPIN * dir * 0.17).toFixed(2)}deg) scale(1.012)`,
    };
  };

  const run = (el, keyframes, opts) => {
    if (!el) return null;
    const a = el.animate(keyframes, { fill: 'both', ...opts });
    st.current.anims.push(a);
    return a;
  };
  const later = (fn, ms) => { st.current.timers.push(setTimeout(fn, ms)); };

  // Open — before first paint, so the first frame is already the source-sized pose.
  useLayoutEffect(() => {
    const s = st.current;
    const card = cardRef.current;
    s.unlock = lockScroll();
    const root = document.getElementById('__next');
    root?.setAttribute('inert', '');

    const p = reducedMotion() ? null : pose();
    if (p) {
      run(card, [
        { transform: p.from, easing: EASE_OUT_EXPO },
        { transform: p.drift, offset: 0.72, easing: EASE_OUT_CUBIC },
        { transform: 'none' },
      ], { duration: OPEN_MS });
      run(bodyRef.current, [
        { opacity: 0 },
        { opacity: 0, offset: 0.2, easing: EASE_OUT_CUBIC },
        { opacity: 1, offset: 0.7 },
        { opacity: 1 },
      ], { duration: OPEN_MS });
      run(scrimRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: EASE_OUT_CUBIC });
      later(() => sourceEl?.setAttribute('data-lifted', ''), LIFT_AT);
    } else {
      sourceEl?.setAttribute('data-lifted', '');
      run(card, [{ opacity: 0 }, { opacity: 1 }], { duration: RM_MS, easing: EASE_OUT_CUBIC });
      run(scrimRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: RM_MS, easing: EASE_OUT_CUBIC });
    }
    card?.focus({ preventScroll: true });

    return () => {
      s.anims.forEach((a) => a.cancel());
      s.timers.forEach(clearTimeout);
      s.anims = []; s.timers = [];
      root?.removeAttribute('inert');
      s.unlock?.();
      s.unlock = null;
      sourceEl?.removeAttribute('data-lifted');
      // Focus goes back to the card that opened it (no-op if the page has moved on).
      sourceEl?.querySelector('button')?.focus({ preventScroll: true });
    };
    // Mount/unmount only: the parent remounts (new key) for a different person.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = () => {
    const s = st.current;
    if (s.closing) return;
    s.closing = true;
    const card = cardRef.current;
    const p = reducedMotion() ? null : pose();
    let a;
    if (p) {
      a = run(card, [
        { transform: 'none', easing: EASE_OUT_CUBIC },
        { transform: p.drift, offset: 0.25, easing: EASE_IN_OUT },
        { transform: p.from },
      ], { duration: CLOSE_MS });
      run(bodyRef.current, [{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }], { duration: CLOSE_MS, easing: EASE_OUT_CUBIC });
      run(scrimRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS, easing: EASE_OUT_CUBIC });
      later(() => sourceEl?.removeAttribute('data-lifted'), CLOSE_MS * LAND_AT);
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
