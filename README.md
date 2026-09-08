# Soft Tension Lab — website

Next.js (Pages Router) static export for Firebase Hosting. Brand spec and blueprint live in
`.claude/brand_assets/`; the frontend rulebook is `.claude/CLAUDE.md`.

## Run

```bash
npm install
npm run dev            # Next dev server → http://localhost:3000
npm run build          # static export → out/
npm run serve          # serve out/ with .claude/serve.mjs → http://localhost:3000 (PORT=3002 to change)
```

## Assets

```bash
npm run images         # re-encode public/images/archive/src/*.png → responsive WebP (+ hero background)
HERO_SOURCE=1png.png npm run images   # pick which source becomes the blurred hero background
npm run og             # render public/og.png + apple-touch-icon.png from the brand marks
```

The raw PNG sources under `public/images/archive/src/` are git-ignored (multi-MB); the WebP
derivatives are committed.

Fonts: the four Whyte Inktrap weights in use (Regular, Medium, Bold, Heavy) also ship as
`.woff2` (re-packed losslessly from the `.woff` with `wawoff2`, ~30% smaller); the `.woff`
stays as the fallback source.

## Checks

```bash
npm run check:overflow -- http://localhost:3000   # scrollWidth vs innerWidth, every page × breakpoint
npm run shots -- http://localhost:3000 home        # 9-viewport screenshot matrix → .claude/temporary screenshots/
npm run check:interact -- http://localhost:3000    # open menu sheet, toppling headline, page-veil frames
```

## Holding page (pre-launch)

The pre-launch screen is always previewable at `/holding/`. To serve it at the root domain
until launch, build with the flag on:

```bash
NEXT_PUBLIC_HOLDING=1 npm run build
```

Build without the flag to publish the real site. Nothing is deleted either way.

## Deploy (Firebase Hosting)

`firebase.json` serves `out/` with clean URLs and long-lived caching for hashed assets.
Set the project id in `.firebaserc`, then:

```bash
npm run build
npx firebase-tools login
npx firebase-tools deploy --only hosting
```
