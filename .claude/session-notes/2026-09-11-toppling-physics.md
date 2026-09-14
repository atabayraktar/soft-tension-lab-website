# Session note — Hero "yıkılan harfler" (Matter.js physics) — 2026-09-11

Session: https://claude.ai/code/session_01TDiDJxHZ3uvBxgJkCYMs9D
Status: implemented + verified, **not committed**. User will continue with feedback.

## What exists now

Home hero headline (`HERO_LINE`) is a real Matter.js 0.20 physics scene, scroll-driven and pinned.

- `src/components/TopplingPhysics.jsx` — the whole mechanic (new). Headless Matter, DOM `<span>` letters,
  no canvas, no `Runner` (own fixed-step rAF). Matter is `import()`-ed lazily only when enabled.
- `src/styles/components/TopplingPhysics.scss` — idle/measured/live/dragging states. Registered in `src/styles/main.scss`.
- `src/components/Hero.jsx` — `<div class="hero-pin" data-topple-pin>` wraps the section; `<TopplingPhysics text={HERO_LINE} />`.
- `src/styles/components/Hero.scss` — `.hero-pin` block (sticky pin, `--hero-pin: 100svh`) and
  `.hero__content { justify-content: center }` (was `flex-end`; user asked for the full drop).
- `src/lib/useSmoothScroll.js` — added module-level `getLenis()` accessor (Lenis instance for the hold).
- `package.json` — `matter-js ^0.20.0` (no `@types`, repo is plain JS).
- `src/components/TopplingText.jsx` — untouched; still serves 404 + holding page (`mode="load"`). Its `scroll` branch is now dead code.

## Behaviour (as approved by the user)

1. Hero fills the viewport → pinned (`position: sticky` inside the spacer; spacer = hero + 100svh).
2. Scroll through the spacer = fall progress. Letter k releases at threshold `t_k` in `[0.04, 0.88]`
   (reading order: top line → bottom, left → right). Scroll-up returns a letter at `p < max(t_k − 0.06, 0.02)`
   (620 ms transform tween, body re-homed + static) → reverse gather, per letter.
3. At `p = 1` with the pile still moving → **hold**: `lenis.stop()` + `scrollTo(pinEnd, {force})`.
   Released when all bodies asleep / below speed threshold for 12 frames (~3–4 s in practice), on any
   wheel-up (capture listener), or at a 5 s cap. Then the page flows to the marquee.
4. Coming back from below re-pins automatically (sticky) and gathers letters as `p` drops.
5. Free letters: stir (30 px static circle follows pointer, wakes touched bodies, capped velocity nudge)
   and grab/throw (`MouseConstraint` stiffness 0.1). Walls at the text gutter, floor = glass bottom edge − 3 px.
6. Off (plain static text, no pin) below 768 px and under `prefers-reduced-motion` — CSS + JS gates match.
7. A11y: full text in the existing `sr-only` node, glyph layer `aria-hidden` (no `aria-label` on the span — ARIA 1.2 / axe).

## Tunables (top of TopplingPhysics.jsx)

`RELEASE_FROM/TO`, `HYSTERESIS`, `RETURN_MS`, `HOLD_MAX_MS`, `SETTLE_*`, `REPULSE_R`, `STIR_MAX_SPEED`,
`FLOOR_INSET`; engine: gravity 1, restitution .25, friction .35, frictionAir .01, positionIterations 10.
Pin length: `--hero-pin` in Hero.scss (JS reads it back from the DOM).

## Gotchas learned (don't re-discover)

- Bodies created with `isStatic: true` never store `_original` mass → create dynamic, then `Body.setStatic(true)`.
- Matter skips static-vs-sleeping pairs → wake bodies near the pointer manually.
- Standing letters must have collision mask 0 (else released letters rest on intact lines and the pile
  gets wedged between the bottom line and the floor → floor penetration). Mask restored on release.
- Lenis (`autoRaf`) keeps emitting native scroll after an instant `scrollTo`; track pointer client coords yourself.
- Matter's `Mouse` attaches `wheel` + `touch*` listeners that `preventDefault` → strip them right after `Mouse.create`.
- Next 15.5 dev + `next build` share `.next` → build in an isolated copy (tar + `node_modules` junction).
  The dev server on :3000 belongs to another agent/session; it went 500 once after editing `useSmoothScroll.js`
  (stale HMR) — touching `src/pages/index.jsx` recovers it.
- Browser serialises `translate3d(x, y, 0)` as `0px` — regex accordingly in tests.

## Known limitations / likely feedback points

- Tablets without a fine pointer have no Lenis → no hold; they simply un-stick at the spacer end.
- Keyboard scrolling during the hold is not blocked (Lenis only owns wheel).
- Hold release "settle" and the 5 s cap land close together (~4–5 s); if the wait feels long, lower the
  fall time (gravity) or the cap.
- Pin length is one viewport; the pile is left-aligned with the headline (walls at the gutter).
- No per-line tone treatment (uniform `$ink`); the brand-legal option would be `$ink` / `$ink-65` per sentence.
- Reference video: `C:\Users\ataba\OneDrive\Masaüstü\Ekran Kaydı 2026-09-11 185714.mp4` (readable via ffmpeg frames).

## How to verify

- Dev server: http://localhost:3000 (someone else's `next dev`; don't start a second one).
- Harness scripts lived in the session scratchpad (not in the repo): `verify-pin.mjs` (19 real-wheel checks at
  any viewport), `verify-topple.mjs` (older non-pinned checks), `probe-floor.mjs`. Recreate from this note if needed.
- Last results: 19/19 at 1440×900, 1024×768, 768×1024 (run concurrently); `next build` exit 0, `/` 6.31 kB.
- Screenshots of the final run: `.claude/temporary screenshots/screenshot-101…110-pin-*.png`.
