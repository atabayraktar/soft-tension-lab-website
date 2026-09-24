import { useEffect, useMemo, useRef, useState } from 'react';

// Deterministic per-glyph parameters — the same letter always falls the same way.
const hash = (n) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ---- scroll mode (after olhalazarieva.com "2/5", whose matter-js scene this mirrors)
// The pin progress (0..1 through `[data-topple-pin]`) at which the sentence lets go on
// the way down, and below which it gathers again on the way up. A hair of hysteresis so
// a wheel resting exactly on the line can't flicker between the two.
const RELEASE_AT = 0.15;
const REFORM_AT = 0.10;
// The reference's scene constants, verbatim: 3× matter's default gravity (the fall reads
// snappy, not floaty), the 40ms beat between freezing the sentence at home and letting
// go, and the per-frame lerp of the return flight.
const GRAVITY_Y = 3;
const RELEASE_DELAY_MS = 40;
const REFORM_LERP = 0.18;
const REFORM_SNAP_PX = 0.3;
const REFORM_SNAP_RAD = 0.005;
// The "blow": every pointer move pushes the free letters within BLOW_RADIUS away from it,
// the push fading linearly to zero at BLOW_FALLOFF. The reference applies one raw force
// to every letter — 0.4 on desktop, 0.05 on narrow screens — so a thin I flies faster than
// a wide M. The same force here would be far hotter: our glyphs are lighter (76px Whyte
// vs its 127px Sofia Sans, mass ~3.3 desktop / ~0.56 mobile) and a given px of travel
// looks bigger on smaller type. So the raw force is rescaled once per scene by our
// average letter mass over theirs and by our font size over theirs (build()), and stays
// uniform across letters — the reference's feel, at our scale.
const BLOW_RADIUS = 120;
const BLOW_RADIUS_SQ = BLOW_RADIUS * BLOW_RADIUS;
const BLOW_FALLOFF = 400;
// (Forces trimmed from the reference's 0.4 / 0.05 after review: at our scale the literal
// values read frantic on desktop and threw letters a whole screen high on a phone.)
const BLOW_REF = { fine: { force: 0.3, mass: 3.3, font: 127 }, coarse: { force: 0.03, mass: 0.56, font: 47 } };
// The release kick: a small random shove and spin per letter (reference: 0.02 / 0.003 raw
// force, scaled by mass here) so the lines don't drop as one rigid slab and every letter
// is already turning when it lands — the tumble starts in the air, not on the floor.
const KICK_X = 0.012;
const KICK_Y = 0.0009;
const KICK_SPIN = 0.12;           // rad per step, ± — ≈ ±410°/s
// Bodies are taller than the ink (the reference's are line-height tall, ~2:1): a squat
// near-square box lands flat and stays upright; a tall one tips, rolls and stacks.
const BODY_TALL = 1.45;
// Terminal speed, px per 60Hz step (≈ 2700px/s). The fall never gets near it (a screen
// of fall tops out around 35px/step); it only stops a chain of pushes from throwing a
// letter a viewport or two above the fold. See contain().
const MAX_SPEED = 45;
const TOUCH_SLACK = 6;            // px around a letter's body that still counts as touching it
const TOUCH_DECIDE_PX = 8;        // travel before a touch's direction is read
const RESIZE_MS = 200;
const STEP_MS = 1000 / 60;

const gate = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * "Yıkılan harfler" — the headline splits into real glyph spans (crisp, selectable,
 * indexable) and only `transform` is ever written on them.
 *
 * mode="load"   — the glyphs stand up once on mount (404, holding page): each tips over
 *                 its bottom corner and drops, then springs upright. A per-frame spring,
 *                 no physics engine.
 * mode="scroll" — the Home hero (after the reference at olhalazarieva.com, "2/5"): a real
 *                 matter-js scene. Every glyph is a rigid body, frozen in place while the
 *                 sentence stands. The scroll through the pin wrapper (`[data-topple-pin]`,
 *                 Hero.scss) is the trigger, not a scrub: once it passes RELEASE_AT the
 *                 bodies are let go and gravity + collisions do the rest in real time —
 *                 they drop, tumble, slide off each other and come to rest on the floor of
 *                 the section, some on top of others. While they lie there the pointer
 *                 (mouse, or a finger on touch) blows them around. Scrolling back above the
 *                 line freezes them and flies each one home along a lerp, and the sentence
 *                 reforms exactly. The bodies live in the engine; the DOM only mirrors
 *                 their position/angle relative to each glyph's home, so the text stays
 *                 text (no canvas).
 *
 * `text` flows as one line; `lines` forces block-level line breaks (never re-wrapped by
 * CSS — only the font-size scales). Off entirely under prefers-reduced-motion.
 */
export default function TopplingText({ text, lines, as: Tag = 'span', mode = 'scroll', className = '' }) {
  const rootRef = useRef(null);
  const linesOfWords = useMemo(() => (lines || [text]).map((line) => line.split(' ')), [lines, text]);
  const plain = useMemo(() => (lines || [text]).join(' '), [lines, text]);
  // Resolved synchronously on the client so the mount effect runs in the first pass (the
  // load-in must start from the toppled state, not flash upright for a frame).
  const [enabled, setEnabled] = useState(() => typeof window !== 'undefined' && gate());

  // Live-updated gate. (Hero.scss gates the pin wrapper on the same query.)
  useEffect(() => {
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evaluate = () => setEnabled(gate());
    evaluate();
    mqReduce.addEventListener('change', evaluate);
    return () => mqReduce.removeEventListener('change', evaluate);
  }, [mode]);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return undefined;
    const glyphs = Array.from(root.querySelectorAll('.tt__g'));
    const n = glyphs.length;
    const section = root.closest('[data-topple-scope]') || root.parentElement;
    const cur = new Float32Array(n);      // smoothed progress per glyph
    const vel = new Float32Array(n);
    let target = 0, raf = 0, running = false;

    // ------------------------------------------------------------------ load
    if (mode === 'load') {
      // Drop distance scales with each glyph's own rendered size, not the section — the
      // glass panel clips overflow, so a fall pegged to section height never reads as
      // motion, it just vanishes past the card edge the instant it starts.
      // Drift direction/magnitude is driven by each glyph's own position in the line — the
      // left half flies left, the right half flies right, scaling with distance from
      // center — so the whole headline reads as one word breaking apart, not letters
      // scattering at random.
      const rootRect = root.getBoundingClientRect();
      const centerX = rootRect.left + rootRect.width / 2;
      const halfW = rootRect.width / 2 || 1;
      const params = glyphs.map((g, i) => {
        const r1 = hash(i + 1), r2 = hash(i + 101);
        const gr = g.getBoundingClientRect();
        const gh = gr.height || 60;
        const rel = (gr.left + gr.width / 2 - centerX) / halfW; // -1 (far left) .. 1 (far right)
        const dir = rel >= 0 ? 1 : -1;
        return {
          start: r1 * 0.3,                                    // when this glyph begins to give way
          rot: dir * (22 + r2 * 60),                          // deg
          drop: (0.55 + r2 * 0.9) * gh,                        // px — × the glyph's own height
          drift: dir * (40 + Math.abs(rel) * 160 + r1 * 40),  // px — explodes outward from center
        };
      });
      glyphs.forEach((g, i) => { g.style.transformOrigin = params[i].rot > 0 ? '100% 100%' : '0% 100%'; });

      const apply = () => {
        let settled = true;
        for (let i = 0; i < n; i += 1) {
          const p = params[i];
          const local = Math.min(1, Math.max(0, (target - p.start) / (1 - p.start)));
          const goal = local * local;                 // gravity: slow start, fast end
          // spring toward goal (k = .12, damping .74) — settles with a small bounce
          vel[i] = (vel[i] + (goal - cur[i]) * 0.12) * 0.74;
          cur[i] += vel[i];
          if (Math.abs(goal - cur[i]) > 0.0008 || Math.abs(vel[i]) > 0.0008) settled = false;
          const q = cur[i];
          if (q <= 0.0005) { glyphs[i].style.transform = ''; continue; }
          glyphs[i].style.transform =
            `translate3d(${(q * p.drift).toFixed(2)}px, ${(q * q * p.drop).toFixed(1)}px, 0) rotate(${(q * p.rot).toFixed(2)}deg)`;
        }
        if (settled) { running = false; return; }
        raf = requestAnimationFrame(apply);
      };
      // Stand the word up from a toppled state: start collapsed, spring to upright.
      for (let i = 0; i < n; i += 1) cur[i] = 1;
      target = 0;
      running = true;
      raf = requestAnimationFrame(apply);
      return () => {
        cancelAnimationFrame(raf);
        glyphs.forEach((g) => { g.style.cssText = ''; });
      };
    }

    // ---------------------------------------------------------------- scroll
    const pinEl = section ? section.closest('[data-topple-pin]') : null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    let blowForce = 0;                  // the reference's raw force, rescaled to this scene (build())
    let M = null;                       // the matter-js module (code-split: only Home pays for it)
    let engine = null, world = null;
    let bodies = [];                    // one rigid body per glyph, in section coordinates
    let homes = [];                     // each body's home centre — the intact sentence
    let boxes = [];
    let arenaW = 0, floorY = 0;         // the scene's right wall and floor (left wall at 0)
    let pinDistance = 0;
    let resizeTimer = 0, releaseTimer = 0;
    let alive = true;
    let blowing = false;                // pointer listeners attached
    let touchClaimed = false;           // this touch is a sideways stir on the pile: it blows, it doesn't scroll
    let touchOnLetter = false;          // it began on a free letter (a claim is only ever considered then)
    let touchDecided = false;           // its direction has been read (after TOUCH_DECIDE_PX of travel)
    let touchX0 = 0, touchY0 = 0;
    let lastW = window.innerWidth, lastH = window.innerHeight;
    // 'intact' — frozen at home · 'live' — free under gravity + the blow · 'reform' — flying home
    let state = 'intact';
    let last = 0, acc = 0;

    const measure = () => {
      glyphs.forEach((g) => { g.style.transform = ''; });
      const sr = section.getBoundingClientRect();
      const cs = getComputedStyle(glyphs[0]);
      // Ink boxes from a canvas in the page's own computed font (Whyte Inktrap at the
      // rendered weight and size), so letters rest on the floor by their ink, not by the
      // line box's leading. Falls back to the layout box if the font can't be resolved.
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      let inkCapable = false, fontAsc = 0, fontDesc = 0;
      if (ctx) {
        ctx.font = font;
        if (document.fonts.check(font)) {
          const probe = ctx.measureText('H');
          fontAsc = probe.fontBoundingBoxAscent;
          fontDesc = probe.fontBoundingBoxDescent;
          inkCapable = Number.isFinite(probe.actualBoundingBoxAscent) && Number.isFinite(fontAsc) && fontAsc > 0;
        }
      }
      boxes = glyphs.map((el) => {
        const r = el.getBoundingClientRect();
        let ix = 0, iy = 0, iw = r.width, ih = r.height;
        if (inkCapable) {
          const m = ctx.measureText(el.textContent);
          const baseline = (r.height - (fontAsc + fontDesc)) / 2 + fontAsc;   // half-leading + ascent
          ix = -m.actualBoundingBoxLeft;
          iy = baseline - m.actualBoundingBoxAscent;
          iw = Math.max(6, m.actualBoundingBoxRight + m.actualBoundingBoxLeft);
          ih = Math.max(6, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
        }
        // Ink centre in section coordinates — the point every glyph rotates about and flies by.
        return { el, ix, iy, iw, ih, cx: r.left - sr.left + ix + iw / 2, cy: r.top - sr.top + iy + ih / 2 };
      });
      boxes.forEach((b) => { b.el.style.transformOrigin = `${b.ix + b.iw / 2}px ${b.iy + b.ih / 2}px`; });
      pinDistance = pinEl ? Math.max(0, pinEl.offsetHeight - section.offsetHeight) : 0;
    };

    // The scene: the section's own edges are the side walls and the floor (the glass runs
    // edge to edge, and the reference lets letters hit the viewport's edges). No ceiling.
    const build = () => {
      if (engine) { M.Composite.clear(world, false, true); M.Engine.clear(engine); }
      engine = M.Engine.create({ positionIterations: 8, velocityIterations: 6, enableSleeping: true });
      engine.gravity.y = GRAVITY_Y;
      world = engine.world;
      const sr = section.getBoundingClientRect();
      const W = sr.width, H = sr.height;
      arenaW = W;
      floorY = H - 4;
      // Thick statics: matter-js has no continuous collision, and a full stop or a comma
      // (a few px of ink) arriving at 3× gravity would pass straight through a thin floor.
      // (MAX_SPEED and the arena clamp in tick() keep every letter inside them.)
      const WALL = 2000;
      M.Composite.add(world, [
        M.Bodies.rectangle(W / 2, floorY + WALL / 2, W * 3, WALL, { isStatic: true, restitution: 0, friction: 1, frictionStatic: 1 }),
        M.Bodies.rectangle(-WALL / 2, 0, WALL, H * 6, { isStatic: true }),
        M.Bodies.rectangle(W + WALL / 2, 0, WALL, H * 6, { isStatic: true }),
      ]);
      // The smallest ink (punctuation) still gets a body a letter can't tunnel through.
      const avgInk = boxes.reduce((s, b) => s + b.ih, 0) / n;
      const minH = Math.max(4, avgInk * 0.3);
      let massSum = 0;
      bodies = boxes.map((b) => {
        // A hair inside the ink so neighbouring letters (tight tracking, kerned pairs)
        // never start overlapping — the solver would fling them apart on release. Tall
        // (BODY_TALL), centred on the ink centre so the glyph sits where its body is.
        const body = M.Bodies.rectangle(b.cx, b.cy, Math.max(4, b.iw - 3), Math.max(minH, b.ih * BODY_TALL - 2), {
          restitution: 0.1, friction: 0.01, frictionAir: 0.01, density: 5e-4,
        });
        massSum += body.mass;           // read before setStatic — a static body's mass is Infinity
        M.Body.setStatic(body, true);
        return body;
      });
      homes = boxes.map((b) => ({ x: b.cx, y: b.cy }));
      M.Composite.add(world, bodies);
      const avgMass = massSum / n;
      const fontPx = parseFloat(getComputedStyle(glyphs[0]).fontSize) || 16;
      const ref = coarse ? BLOW_REF.coarse : BLOW_REF.fine;
      blowForce = ref.force * (avgMass / ref.mass) * (fontPx / ref.font);
    };

    const readProgress = () => {
      if (pinEl && pinDistance > 0) return clamp01(-pinEl.getBoundingClientRect().top / pinDistance);
      // No pin (stylesheet gate off): fly as the section scrolls out.
      const r = section.getBoundingClientRect();
      return r.height > 0 ? clamp01((-r.top / r.height - 0.25) / 0.5) : 0;
    };

    // The DOM mirror: each glyph is offset from its own home by its body's travel.
    const write = () => {
      for (let i = 0; i < n; i += 1) {
        const b = bodies[i], h = homes[i];
        const dx = b.position.x - h.x, dy = b.position.y - h.y, a = b.angle;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(a) < 0.0001) { glyphs[i].style.transform = ''; continue; }
        glyphs[i].style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${a.toFixed(4)}rad)`;
      }
    };

    // Safety net, not feel — run either side of every engine step. matter-js has no
    // continuous collision, so (1) no letter may travel further per step than the walls
    // are thick, and (2) a thin letter (a comma, an I on its side) that pointer events
    // piling up between steps drove deeper into a wall than it is thick would be resolved
    // by the solver along the wrong axis — down into the floor slab and out of the scene.
    // Shallow contact is left to the solver; deep penetration is put back on the face
    // with that velocity component dropped.
    const contain = () => {
      for (let i = 0; i < n; i += 1) {
        const b = bodies[i];
        if (b.speed > MAX_SPEED) M.Body.setVelocity(b, { x: b.velocity.x * MAX_SPEED / b.speed, y: b.velocity.y * MAX_SPEED / b.speed });
        // True extent from the vertices — `body.bounds` is padded by the velocity.
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let v = 0; v < b.vertices.length; v += 1) {
          const p = b.vertices[v];
          if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
        }
        const deep = Math.min(maxX - minX, maxY - minY) * 0.4;
        let dx = 0, dy = 0;
        if (minX < -deep) dx = -minX;
        else if (maxX > arenaW + deep) dx = arenaW - maxX;
        if (maxY > floorY + deep) dy = floorY - maxY;
        if (dx || dy) {
          M.Body.setPosition(b, { x: b.position.x + dx, y: b.position.y + dy });
          M.Body.setVelocity(b, { x: dx ? 0 : b.velocity.x, y: dy ? 0 : b.velocity.y });
        }
      }
    };

    const stop = () => { running = false; last = 0; acc = 0; };
    const tick = (now) => {
      // Fixed 60Hz steps out of the time the frame actually took (capped), so 144Hz, 30Hz
      // and a throttled tab all get the same fall and the same return.
      acc += last ? Math.min(now - last, STEP_MS * 4) : STEP_MS;
      last = now;
      const steps = Math.floor(acc / STEP_MS);
      acc -= steps * STEP_MS;

      if (state === 'live') {
        // A sample that lands in a frame with no step to spend it on waits for the next.
        const push = ptr.fresh && steps > 0;
        if (push) ptr.fresh = false;
        for (let s = 0; s < steps; s += 1) {
          contain();
          if (push) applyBlow();
          M.Engine.update(engine, STEP_MS);
          contain();
        }
        write();
        // The pile has come to rest: nothing to step until the pointer stirs it again.
        if (bodies.every((b) => b.isSleeping)) { stop(); return; }
      } else if (state === 'reform') {
        // Frozen bodies lerped home (position and angle alike) at a fixed factor per step —
        // the reference's own return flight — then snapped exactly onto the sentence.
        let done = false;
        for (let s = 0; s < steps && !done; s += 1) {
          done = true;
          for (let i = 0; i < n; i += 1) {
            const b = bodies[i], h = homes[i];
            const x = b.position.x + (h.x - b.position.x) * REFORM_LERP;
            const y = b.position.y + (h.y - b.position.y) * REFORM_LERP;
            const a = b.angle + (0 - b.angle) * REFORM_LERP;
            M.Body.setPosition(b, { x, y });
            M.Body.setAngle(b, a);
            if (Math.abs(x - h.x) > REFORM_SNAP_PX || Math.abs(y - h.y) > REFORM_SNAP_PX || Math.abs(a) > REFORM_SNAP_RAD) done = false;
          }
        }
        if (done) {
          bodies.forEach((b, i) => {
            M.Body.setPosition(b, homes[i]);
            M.Body.setAngle(b, 0);
            M.Body.setVelocity(b, { x: 0, y: 0 });
            M.Body.setAngularVelocity(b, 0);
          });
          state = 'intact';
          root.classList.remove('is-live');
          write();
          stop();
          return;
        }
        write();
      } else { stop(); return; }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(tick); } };

    // ---- the blow. Only while the letters are free: every free body within BLOW_RADIUS
    // of the pointer is pushed straight away from it. Pointer moves only *record* the
    // position; the push is applied by tick(), once per physics step of the frame the
    // move landed in — so a slow frame (or a driver firing faster than the display) can't
    // stack several pushes into one step, and the feel is the same at any frame rate.
    const ptr = { x: 0, y: 0, fresh: false };
    const blow = (clientX, clientY) => {
      if (state !== 'live') return;
      ptr.x = clientX; ptr.y = clientY; ptr.fresh = true;
      kick();   // a sleeping pile wakes on the force; the loop has to be running to apply it
    };
    const applyBlow = () => {
      const sr = section.getBoundingClientRect();
      const px = ptr.x - sr.left, py = ptr.y - sr.top;
      for (let i = 0; i < n; i += 1) {
        const b = bodies[i];
        if (b.isStatic) continue;
        const dx = b.position.x - px, dy = b.position.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < BLOW_RADIUS_SQ) {
          const d = Math.sqrt(d2) || 1;
          const s = blowForce * (1 - d / BLOW_FALLOFF);
          M.Body.applyForce(b, b.position, { x: (dx / d) * s, y: (dy / d) * s });
        }
      }
    };
    // Is the point on a free letter itself (its body, plus a thumb's worth of slack)?
    // Deliberately much tighter than the blow radius, so a swipe that merely starts near
    // the pile still scrolls the page.
    const onLetter = (clientX, clientY) => {
      const sr = section.getBoundingClientRect();
      const px = clientX - sr.left, py = clientY - sr.top;
      return bodies.some((b) => !b.isStatic
        && px >= b.bounds.min.x - TOUCH_SLACK && px <= b.bounds.max.x + TOUCH_SLACK
        && py >= b.bounds.min.y - TOUCH_SLACK && py <= b.bounds.max.y + TOUCH_SLACK);
    };
    const onMouseMove = (e) => { blow(e.clientX, e.clientY); };
    // Touch: the pile fills the bottom of a phone screen, exactly where a thumb starts a
    // scroll, so landing on a letter is not enough to own the gesture. The direction of
    // the first TOUCH_DECIDE_PX of travel decides: a sideways stir that began on a letter
    // is claimed (the page doesn't scroll under it, the letters get blown); a mostly
    // vertical swipe scrolls as usual — and still stirs whatever it happens to cross.
    const onTouchStart = (e) => {
      const t = e.touches[0];
      touchClaimed = false;
      touchDecided = false;
      touchOnLetter = !!t && state === 'live' && onLetter(t.clientX, t.clientY);
      if (t) { touchX0 = t.clientX; touchY0 = t.clientY; }
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      if (!touchDecided) {
        const dx = t.clientX - touchX0, dy = t.clientY - touchY0;
        if (Math.abs(dx) >= TOUCH_DECIDE_PX || Math.abs(dy) >= TOUCH_DECIDE_PX) {
          touchDecided = true;
          touchClaimed = touchOnLetter && Math.abs(dx) > Math.abs(dy);
        }
      }
      if (touchClaimed && e.cancelable) e.preventDefault();
      blow(t.clientX, t.clientY);
    };
    const onTouchEnd = () => { touchClaimed = false; touchDecided = false; touchOnLetter = false; };
    const attachBlow = () => {
      if (blowing) return;
      blowing = true;
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    };
    const detachBlow = () => {
      if (!blowing) return;
      blowing = false;
      touchClaimed = false; touchDecided = false; touchOnLetter = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };

    // ---- the trigger. Scrolling down past the line: freeze the sentence at home, and a
    // beat later let every letter go with a tiny random shove. Scrolling back up past it:
    // freeze wherever they lie and fly them home.
    const release = () => {
      clearTimeout(releaseTimer);
      state = 'live';
      root.classList.add('is-live');
      bodies.forEach((b, i) => {
        M.Body.setStatic(b, true);
        M.Body.setPosition(b, homes[i]);
        M.Body.setAngle(b, 0);
        M.Body.setVelocity(b, { x: 0, y: 0 });
        M.Body.setAngularVelocity(b, 0);
      });
      write();
      releaseTimer = setTimeout(() => {
        if (!alive || state !== 'live') return;
        bodies.forEach((b) => {
          M.Body.setStatic(b, false);
          M.Sleeping.set(b, false);
          M.Body.applyForce(b, b.position, {
            x: KICK_X * (Math.random() - 0.5) * b.mass,
            y: KICK_Y * Math.random() * b.mass,
          });
          M.Body.setAngularVelocity(b, KICK_SPIN * (Math.random() - 0.5) * 2);
        });
        kick();
      }, RELEASE_DELAY_MS);
      attachBlow();
    };
    const reform = () => {
      clearTimeout(releaseTimer);
      detachBlow();
      state = 'reform';
      bodies.forEach((b) => {
        M.Body.setStatic(b, true);
        M.Body.setVelocity(b, { x: 0, y: 0 });
        M.Body.setAngularVelocity(b, 0);
      });
      kick();
    };
    const reset = () => {
      clearTimeout(releaseTimer);
      detachBlow();
      cancelAnimationFrame(raf);
      stop();
      state = 'intact';
      root.classList.remove('is-live');
      glyphs.forEach((g) => { g.style.transform = ''; });
    };

    const onScroll = () => {
      const p = readProgress();
      if (p >= RELEASE_AT) { if (state !== 'live') release(); }
      else if (p < REFORM_AT) { if (state === 'live') reform(); }
    };
    const onResize = () => {
      // A phone's address bar collapsing is a resize too; the layout (svh units) doesn't
      // move for it, so only a width change or a real height change rebuilds the scene.
      const w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!alive) return;
        reset();
        measure();
        build();
        onScroll();
      }, RESIZE_MS);
    };

    Promise.all([import('matter-js'), document.fonts.ready]).then(([mod]) => {
      if (!alive) return;
      M = mod.default || mod;
      measure();
      build();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      onScroll();
    });

    return () => {
      alive = false;
      clearTimeout(resizeTimer);
      clearTimeout(releaseTimer);
      cancelAnimationFrame(raf);
      detachBlow();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (M && engine) { M.Composite.clear(world, false, true); M.Engine.clear(engine); }
      glyphs.forEach((g) => { g.style.cssText = ''; });
      root.classList.remove('is-live');
    };
  }, [enabled, mode, plain]);

  let idx = 0;
  return (
    <Tag ref={rootRef} className={`tt ${lines ? 'tt--lines' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
      <span className="sr-only">{plain}</span>
      {linesOfWords.map((words, li) => (
        <span key={li} aria-hidden="true" className="tt__line">
          {words.map((word, wi) => (
            <span key={wi} className="tt__w">
              {Array.from(word).map((ch) => {
                idx += 1;
                return (
                  <span key={idx} className="tt__g">{ch}</span>
                );
              })}
              {wi < words.length - 1 ? <span className="tt__space"> </span> : null}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
