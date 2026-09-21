import { useEffect, useMemo, useRef, useState } from 'react';
import { getLenis } from '../lib/useSmoothScroll';

/**
 * "Yıkılan harfler" — the Home hero headline as a scroll-driven physics scene.
 *
 * The text is real DOM (line → word → letter spans): crisp, selectable, indexable.
 * Once the fonts are in, every letter is measured, pinned to its own coordinates
 * (pixel-identical to the flowed layout) and given a Matter.js body sized to the
 * glyph's *ink* — measured with a canvas in the page's own computed font — so
 * letters stack like type, not like boxes.
 *
 * The hero sits in a pin wrapper (`[data-topple-pin]`, see Hero.scss): on desktop the
 * wrapper is one viewport taller than the hero and the hero sticks inside it. Scrolling
 * through that extra height is the *progress* of the fall:
 *
 *   progress  = scroll into the wrapper / (wrapper height − hero height), 0..1
 *   letter k  releases once progress ≥ its threshold (reading order, top line first)
 *             and returns home (a short transform tween) once progress drops below
 *             threshold − hysteresis — so scrolling up gathers the headline in reverse.
 *
 * When progress reaches 1 before the pile has come to rest, the page is held there
 * (Lenis stopped) until every letter is asleep; the next wheel then carries the page on.
 * Scrolling up during the hold releases it at once, and a hard cap guarantees nobody
 * is ever stuck. Tablets without Lenis simply un-stick at the wrapper's end.
 *
 * Once free, letters can be stirred (a small static circle rides the pointer) or
 * grabbed and thrown (MouseConstraint). Off entirely under prefers-reduced-motion and
 * below 768px (plain static text, no pin), paused while the hero is off-screen, and
 * Matter is only downloaded when it will run.
 */

const LETTER_BUDGET = 120;   // above this the scene stops reading and the frame budget goes
const RETURN_MS = 620;       // per-letter home tween
const RESIZE_MS = 200;       // resize debounce
const STEP_MS = 1000 / 60;   // fixed physics step
const REPULSE_R = 30;        // pointer body radius
const STIR_MAX_SPEED = 7;    // px per step — ceiling for what a cursor pass can impart
const RELEASE_FROM = 0.04;   // progress at which the first letter lets go
const RELEASE_TO = 0.88;     // … and the last
const HYSTERESIS = 0.06;     // progress a letter must lose before it returns
const SETTLE_SPEED = 0.08;   // px/step — below this (or asleep) a body counts as at rest
const SETTLE_SPIN = 0.004;
const SETTLE_FRAMES = 12;    // consecutive quiet frames before the hold lets go
const HOLD_MAX_MS = 5000;    // never hold the page longer than this
const FLOOR_INSET = 3;       // px above the glass edge — absorbs the solver's residual overlap in a deep pile
const PARK = { x: -9999, y: -9999 };

// Collision categories — the pointer body and walls must never be grabbable.
const CAT_LETTER = 0x0001;
const CAT_POINTER = 0x0002;
const CAT_WALL = 0x0004;
// A standing letter touches nothing: released letters drop straight past the lines that
// still stand (as in the reference) and the pile can never be wedged between a standing
// line and the floor. The mask is switched on with the release.
const MASK_FREE = CAT_LETTER | CAT_POINTER | CAT_WALL;
const MASK_HOME = 0;

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function TopplingPhysics({ lines, as: Tag = 'span', className = '' }) {
  const rootRef = useRef(null);
  // Forced line breaks: each entry is its own block-level line (`.tp__line`,
  // display:block — see TopplingPhysics.scss), never re-wrapped by CSS. Only
  // the font-size scales the whole thing down responsively.
  const linesOfWords = useMemo(() => lines.map((line) => line.split(' ')), [lines]);
  const text = useMemo(() => lines.join(' '), [lines]);
  const [enabled, setEnabled] = useState(false);

  // Live-updated gates: desktop widths only, and never under reduced motion.
  // (Hero.scss gates the pin wrapper on the same two queries.)
  useEffect(() => {
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqWide = window.matchMedia('(min-width: 768px)');
    const evaluate = () => setEnabled(mqWide.matches && !mqReduce.matches);
    evaluate();
    mqReduce.addEventListener('change', evaluate);
    mqWide.addEventListener('change', evaluate);
    return () => {
      mqReduce.removeEventListener('change', evaluate);
      mqWide.removeEventListener('change', evaluate);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return undefined;

    const section = root.closest('[data-topple-scope]') || root.parentElement;
    const pinEl = section ? section.closest('[data-topple-pin]') : null;
    const boundsEl = root.closest('[data-topple-bounds]') || root.offsetParent || root.parentElement;
    const glyphs = Array.from(root.querySelectorAll('.tp__g'));
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (glyphs.length > LETTER_BUDGET) {
      console.warn(
        `[TopplingPhysics] ${glyphs.length} letters exceed the ${LETTER_BUDGET}-letter budget — shorten the headline; the scene will not stay at 60fps.`,
      );
    }

    let alive = true;
    let M = null;                       // matter-js module
    let engine = null, world = null, mouse = null, mouseConstraint = null, pointerBody = null;
    let letters = [];                   // { el, x, y, w, h, cx, cy, iw, ih, line, threshold, mode, body, from, returnStart, wasSleeping }
    let walls = [];
    let ready = false;
    let pinDistance = 0;
    let raf = 0, running = false, visible = true, last = 0, acc = 0;
    let resizeTimer = 0;
    let holding = false, holdArmed = false, holdTimer = 0, settleFrames = 0;
    let pointerActive = false;
    let pointerClient = { x: 0, y: 0 };   // last known viewport position of the pointer
    let prevPointer = { x: PARK.x, y: PARK.y };
    let mouseTargetEl = null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // ------------------------------------------------------------------ measure
    const measure = () => {
      root.classList.remove('is-measured', 'is-live');
      root.style.height = '';
      glyphs.forEach((g) => { g.style.cssText = ''; });

      const rr = root.getBoundingClientRect();
      const cs = getComputedStyle(glyphs[0]);
      // Canvas font shorthand from the *rendered* computed style: Whyte Inktrap at the
      // real weight and size — the ink boxes must be the ones on screen.
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      let inkCapable = false;
      let fontAsc = 0, fontDesc = 0;
      if (ctx) {
        ctx.font = font;
        if (!document.fonts.check(font)) {
          console.warn(`[TopplingPhysics] canvas could not resolve "${font}" — falling back to layout boxes.`);
        } else {
          const probe = ctx.measureText('H');
          fontAsc = probe.fontBoundingBoxAscent;
          fontDesc = probe.fontBoundingBoxDescent;
          inkCapable = Number.isFinite(probe.actualBoundingBoxAscent) && Number.isFinite(fontAsc) && fontAsc > 0;
        }
      }

      const items = glyphs.map((el) => {
        const r = el.getBoundingClientRect();
        const x = r.left - rr.left, y = r.top - rr.top, w = r.width, h = r.height;
        // Ink box in span-local coordinates. Default: the layout box.
        let ix = 0, iy = 0, iw = w, ih = h;
        if (inkCapable) {
          const m = ctx.measureText(el.textContent);
          const baseline = (h - (fontAsc + fontDesc)) / 2 + fontAsc;   // half-leading + ascent
          const left = -m.actualBoundingBoxLeft, right = m.actualBoundingBoxRight;
          const top = baseline - m.actualBoundingBoxAscent, bottom = baseline + m.actualBoundingBoxDescent;
          ix = left; iy = top; iw = Math.max(6, right - left); ih = Math.max(6, bottom - top);
        }
        return {
          el, x, y, w, h, ix, iy, iw, ih, cx: x + ix + iw / 2, cy: y + iy + ih / 2,
          line: 0, threshold: 1, returnAt: 1, mode: 'home', body: null, from: null, returnStart: 0, wasSleeping: false,
        };
      });

      // Lines from measured tops — the CSS wrapping (max-width / balance) stays in charge.
      const lineH = items[0]?.h || 1;
      const y0 = Math.min(...items.map((i) => i.y));
      items.forEach((i) => { i.line = Math.round((i.y - y0) / lineH); });

      // Release order: top line to bottom, left to right — spread across the progress range.
      const order = [...items].sort((a, b) => a.line - b.line || a.cx - b.cx);
      order.forEach((L, k) => {
        L.threshold = RELEASE_FROM + (RELEASE_TO - RELEASE_FROM) * (order.length > 1 ? k / (order.length - 1) : 0);
        // Return point: a little above 0 for the first letters, so a scroll back to the
        // very top always gathers every one of them.
        L.returnAt = Math.max(L.threshold - HYSTERESIS, RELEASE_FROM / 2);
      });

      // Pin: same box, same place, absolutely positioned. Reserve the block's height so
      // nothing around the headline moves.
      root.style.height = `${rr.height}px`;
      root.classList.add('is-measured');
      items.forEach((i) => {
        i.el.style.left = `${i.x}px`;
        i.el.style.top = `${i.y}px`;
        i.el.style.width = `${i.w}px`;
        i.el.style.height = `${i.h}px`;
        i.el.style.transformOrigin = `${i.ix + i.iw / 2}px ${i.iy + i.ih / 2}px`;
      });
      letters = items;
    };

    // -------------------------------------------------------------------- world
    const destroyBodies = () => {
      if (!world) return;
      M.Composite.clear(world, false, true);
      walls = [];
      pointerBody = null;
      letters.forEach((L) => { L.body = null; });
    };

    const build = () => {
      destroyBodies();
      const { Bodies, Body, Composite, Mouse } = M;
      const br = boundsEl.getBoundingClientRect();
      const bcs = getComputedStyle(boundsEl);
      const rr = root.getBoundingClientRect();
      // Side walls follow the text gutter so the pile stays flush with the headline's
      // left edge; the floor is the glass's own bottom edge, as in the reference.
      const left = br.left + parseFloat(bcs.paddingLeft) - rr.left;
      const right = br.right - parseFloat(bcs.paddingRight) - rr.left;
      const floor = br.bottom - rr.top - FLOOR_INSET;
      const T = 240, H = 8000;
      const wallOpts = { isStatic: true, collisionFilter: { category: CAT_WALL, mask: CAT_LETTER } };
      walls = [
        Bodies.rectangle((left + right) / 2, floor + T / 2, right - left + T * 2, T, { ...wallOpts, label: 'floor' }),
        Bodies.rectangle(left - T / 2, floor - H / 2, T, H, { ...wallOpts, label: 'wall-left' }),
        Bodies.rectangle(right + T / 2, floor - H / 2, T, H, { ...wallOpts, label: 'wall-right' }),
      ];
      letters.forEach((L) => {
        // Created dynamic, *then* frozen: Body.setStatic only snapshots the real mass and
        // inertia (to restore on release) when the body was not already static.
        L.body = Bodies.rectangle(L.cx, L.cy, L.iw, L.ih, {
          restitution: 0.25,
          friction: 0.35,
          frictionAir: 0.01,
          label: `glyph:${L.el.textContent}`,
          collisionFilter: { category: CAT_LETTER, mask: MASK_HOME },
        });
        Body.setStatic(L.body, true);
        L.wasSleeping = false;
      });
      pointerBody = Bodies.circle(PARK.x, PARK.y, REPULSE_R, {
        isStatic: true,
        label: 'pointer',
        collisionFilter: { category: CAT_POINTER, mask: CAT_LETTER },
      });
      Composite.add(world, [...walls, ...letters.map((L) => L.body), pointerBody]);
      if (mouse) Mouse.setOffset(mouse, { x: br.left - rr.left, y: br.top - rr.top });
      if (mouseConstraint) Composite.add(world, mouseConstraint);
      // The pin length is whatever the stylesheet gave the wrapper beyond the hero itself.
      pinDistance = pinEl && section ? Math.max(0, pinEl.offsetHeight - section.offsetHeight) : 0;
    };

    // ------------------------------------------------------------------ progress
    const readProgress = () => {
      if (!section) return 0;
      if (pinEl && pinDistance > 0) {
        return clamp01(-pinEl.getBoundingClientRect().top / pinDistance);
      }
      // No pin (stylesheet gate off): fall as the hero scrolls out, from a quarter to
      // three quarters of its height.
      const r = section.getBoundingClientRect();
      return r.height > 0 ? clamp01((-r.top / r.height - 0.25) / 0.5) : 0;
    };

    const isDragging = () => !!(mouseConstraint && mouseConstraint.body);

    const dropGrab = () => {
      if (!mouseConstraint) return;
      mouseConstraint.body = null;
      mouseConstraint.constraint.bodyB = null;
      mouseConstraint.constraint.pointB = null;
      root.classList.remove('is-dragging');
    };

    const releaseLetter = (L) => {
      const { Body, Sleeping } = M;
      if (!L.body) return;
      L.mode = 'free';
      L.from = null;
      L.wasSleeping = false;
      L.body.collisionFilter.mask = MASK_FREE;
      Body.setStatic(L.body, false);
      L.body.restitution = 0.25;
      L.body.friction = 0.35;
      Sleeping.set(L.body, false);
      Body.setAngularVelocity(L.body, (Math.random() - 0.5) * 0.14);
      Body.setVelocity(L.body, { x: (Math.random() - 0.5) * 1.2, y: 0 });
    };

    const returnLetter = (L, now) => {
      const { Body } = M;
      const b = L.body;
      if (!b) return;
      if (mouseConstraint && mouseConstraint.body === b) dropGrab();
      // The DOM tweens home; the body is already there, static, so letters still
      // falling meet it where the headline stands.
      L.from = { x: b.position.x - L.cx, y: b.position.y - L.cy, a: wrapAngle(b.angle) };
      b.collisionFilter.mask = MASK_HOME;
      Body.setStatic(b, true);
      Body.setPosition(b, { x: L.cx, y: L.cy });
      Body.setAngle(b, 0);
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, 0);
      L.mode = 'returning';
      L.returnStart = now;
    };

    const applyProgress = (p) => {
      const now = performance.now();
      let changed = false;
      for (let i = 0; i < letters.length; i += 1) {
        const L = letters[i];
        if (L.mode === 'home' && p >= L.threshold) { releaseLetter(L); changed = true; }
        else if (L.mode === 'free' && p < L.returnAt) { returnLetter(L, now); changed = true; }
      }
      if (changed) startLoop();
    };

    // --------------------------------------------------------------------- hold
    const releaseHold = () => {
      if (!holding) return;
      holding = false;
      clearTimeout(holdTimer);
      const lenis = getLenis();
      if (lenis) lenis.start();
    };

    const engageHold = () => {
      const lenis = getLenis();
      if (!lenis || holding || !pinEl) return;
      const pinEnd = window.scrollY + pinEl.getBoundingClientRect().top + pinDistance;
      holding = true;
      holdArmed = false;
      settleFrames = 0;
      lenis.stop();
      lenis.scrollTo(pinEnd, { immediate: true, force: true });   // square up on the pin's end
      holdTimer = setTimeout(releaseHold, HOLD_MAX_MS);
    };

    const isSettledNow = () => {
      if (isDragging()) return false;
      for (let i = 0; i < letters.length; i += 1) {
        const L = letters[i];
        if (L.mode !== 'free' || !L.body) return false;
        const b = L.body;
        if (!b.isSleeping && (b.speed > SETTLE_SPEED || b.angularSpeed > SETTLE_SPIN)) return false;
      }
      return true;
    };

    // ---------------------------------------------------------------------- loop
    const stopLoop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const startLoop = () => {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(tick);
    };

    const stirPile = () => {
      if (!mouse || !pointerBody) return;
      const { Body, Sleeping } = M;
      // Root-relative from the viewport position, resolved every frame — so the stirrer
      // stays under the cursor while the page scrolls beneath a still pointer.
      let p = PARK;
      if (pointerActive) {
        const rr = root.getBoundingClientRect();
        p = { x: pointerClient.x - rr.left, y: pointerClient.y - rr.top };
      }
      const vx = p.x - prevPointer.x, vy = p.y - prevPointer.y;
      prevPointer = { x: p.x, y: p.y };
      Body.setPosition(pointerBody, p);
      if (!pointerActive) return;
      // Matter skips static-vs-sleeping pairs, so a settled pile would ignore the pointer:
      // wake anything the pointer body touches and hand it a little of the pointer's motion.
      const moving = Math.abs(vx) + Math.abs(vy) > 0.5 && Math.abs(vx) + Math.abs(vy) < 400;
      for (let i = 0; i < letters.length; i += 1) {
        const b = letters[i].body;
        if (!b || b.isStatic) continue;
        const bb = b.bounds;
        if (p.x < bb.min.x - REPULSE_R || p.x > bb.max.x + REPULSE_R || p.y < bb.min.y - REPULSE_R || p.y > bb.max.y + REPULSE_R) continue;
        if (b.isSleeping) Sleeping.set(b, false);
        if (moving) {
          // A nudge, capped: a pass churns the pile locally rather than flinging it.
          let nx = b.velocity.x + vx * 0.18, ny = b.velocity.y + vy * 0.18;
          const s = Math.hypot(nx, ny);
          if (s > STIR_MAX_SPEED) { nx *= STIR_MAX_SPEED / s; ny *= STIR_MAX_SPEED / s; }
          Body.setVelocity(b, { x: nx, y: ny });
        }
      }
    };

    const writeTransforms = () => {
      for (let i = 0; i < letters.length; i += 1) {
        const L = letters[i];
        const b = L.body;
        if (L.mode !== 'free' || !b) continue;
        if (b.isSleeping && L.wasSleeping) continue;
        L.wasSleeping = b.isSleeping;
        L.el.style.transform =
          `translate3d(${(b.position.x - L.cx).toFixed(2)}px, ${(b.position.y - L.cy).toFixed(2)}px, 0) rotate(${b.angle.toFixed(4)}rad)`;
      }
    };

    const tweenReturns = (now) => {
      let active = 0;
      for (let i = 0; i < letters.length; i += 1) {
        const L = letters[i];
        if (L.mode !== 'returning' || !L.from) continue;
        const k = easeOutExpo((now - L.returnStart) / RETURN_MS);
        if (k >= 1) {
          L.el.style.transform = '';
          L.from = null;
          L.mode = 'home';
          continue;
        }
        const inv = 1 - k;
        L.el.style.transform =
          `translate3d(${(L.from.x * inv).toFixed(2)}px, ${(L.from.y * inv).toFixed(2)}px, 0) rotate(${(L.from.a * inv).toFixed(4)}rad)`;
        active += 1;
      }
      return active;
    };

    const tick = (now) => {
      raf = 0;
      if (!running || !alive) return;
      const returning = tweenReturns(now);
      let free = 0;
      for (let i = 0; i < letters.length; i += 1) if (letters[i].mode === 'free') free += 1;

      if (free > 0) {
        const dt = Math.min(now - last, 100);
        acc += dt;
        stirPile();
        let steps = 0;
        while (acc >= STEP_MS && steps < 3) {
          M.Engine.update(engine, STEP_MS);
          acc -= STEP_MS;
          steps += 1;
        }
        if (steps === 3) acc = 0;
        writeTransforms();
      }
      last = now;
      root.classList.toggle('is-live', free > 0);

      if (holding) {
        settleFrames = isSettledNow() ? settleFrames + 1 : 0;
        if (settleFrames >= SETTLE_FRAMES) releaseHold();
      }

      if ((free > 0 || returning > 0) && visible) raf = requestAnimationFrame(tick);
      else running = false;
    };

    // ------------------------------------------------------------------- events
    const onScroll = () => {
      if (!ready) return;
      const p = readProgress();
      // A section jump from the nav (Nav.jsx tags its Lenis scroll with `passHero`) runs
      // straight through the pin — it is never held. Lenis drops the tag when it lands.
      const passing = !!getLenis()?.userData?.passHero;
      if (passing) holdArmed = false;
      else if (p < 0.999) holdArmed = true;       // only a descent into the pin's end can hold
      applyProgress(p);
      if (p >= 0.999 && holdArmed && !holding && !isSettledNow()) engageHold();
    };

    // Scrolling up during the hold means "gather them": let go at once.
    const onWheelCapture = (e) => { if (holding && e.deltaY < 0) releaseHold(); };

    const restoreImmediate = () => {
      dropGrab();
      stopLoop();
      letters.forEach((L) => { L.el.style.transform = ''; L.from = null; L.mode = 'home'; });
      root.classList.remove('is-live');
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!alive) return;
        restoreImmediate();
        measure();
        build();
        onScroll();
      }, RESIZE_MS);
    };

    const onPointerMove = (e) => {
      pointerClient = { x: e.clientX, y: e.clientY };
      pointerActive = true;
    };
    const onPointerLeave = () => { pointerActive = false; };
    const onWindowUp = () => {
      if (mouse) mouse.button = -1;
      root.classList.remove('is-dragging');
    };

    const bindMouse = () => {
      const { Mouse, MouseConstraint, Events } = M;
      mouseTargetEl = boundsEl;
      mouse = Mouse.create(mouseTargetEl);
      // There is no canvas: strip everything Matter attaches that would preventDefault
      // the page's own scroll/touch. Only mousemove/down/up (passive) stay.
      ['wheel', 'mousewheel', 'DOMMouseScroll'].forEach((t) => mouseTargetEl.removeEventListener(t, mouse.mousewheel));
      mouseTargetEl.removeEventListener('touchmove', mouse.mousemove);
      mouseTargetEl.removeEventListener('touchstart', mouse.mousedown);
      mouseTargetEl.removeEventListener('touchend', mouse.mouseup);
      mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        collisionFilter: { category: CAT_LETTER, mask: CAT_LETTER },
        constraint: { stiffness: 0.1, damping: 0.02, render: { visible: false } },
      });
      Events.on(mouseConstraint, 'startdrag', () => root.classList.add('is-dragging'));
      Events.on(mouseConstraint, 'enddrag', () => root.classList.remove('is-dragging'));
      mouseTargetEl.addEventListener('mousemove', onPointerMove, { passive: true });
      mouseTargetEl.addEventListener('mouseleave', onPointerLeave, { passive: true });
      window.addEventListener('mouseup', onWindowUp, { passive: true });
    };

    // ------------------------------------------------------------------ setup
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) startLoop();
      else stopLoop();
    }, { threshold: 0 });

    (async () => {
      const mod = await import('matter-js');
      await document.fonts.ready;
      if (!alive) return;
      M = mod.default || mod;
      // Extra position iterations keep a 60-body stack from sinking into the floor.
      engine = M.Engine.create({ enableSleeping: true, gravity: { x: 0, y: 1 }, positionIterations: 10, velocityIterations: 6 });
      world = engine.world;
      if (finePointer) bindMouse();
      measure();
      build();
      ready = true;
      if (section) io.observe(section);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', onWheelCapture, { capture: true, passive: true });
      window.addEventListener('resize', onResize);
      onScroll();
    })();

    return () => {
      alive = false;
      releaseHold();
      clearTimeout(resizeTimer);
      stopLoop();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheelCapture, { capture: true });
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onWindowUp);
      if (mouseTargetEl) {
        mouseTargetEl.removeEventListener('mousemove', onPointerMove);
        mouseTargetEl.removeEventListener('mouseleave', onPointerLeave);
      }
      if (M) {
        if (mouseConstraint) M.Events.off(mouseConstraint);
        if (mouse) M.Mouse.clearSourceEvents(mouse);
        if (world) M.Composite.clear(world, false, true);
        if (engine) M.Engine.clear(engine);
      }
      glyphs.forEach((g) => { g.style.cssText = ''; });
      root.style.height = '';
      root.classList.remove('is-measured', 'is-live', 'is-dragging');
    };
  }, [enabled, text]);

  let idx = 0;
  return (
    <Tag ref={rootRef} className={`tp ${className}`.trim()}>
      <span className="sr-only">{text}</span>
      {linesOfWords.map((words, li) => (
        <span key={li} aria-hidden="true" className="tp__line">
          {words.map((word, wi) => (
            <span key={wi} className="tp__w">
              {Array.from(word).map((ch) => {
                idx += 1;
                return (
                  <span key={idx} className="tp__g">{ch}</span>
                );
              })}
              {wi < words.length - 1 ? <span className="tp__space"> </span> : null}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
