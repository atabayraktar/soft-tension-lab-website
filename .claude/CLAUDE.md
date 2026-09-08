# CLAUDE.md — Soft Tension Lab Frontend Rules

Project: **Soft Tension Lab** — an independent creative studio (Ömer & Cemre) at the intersection of art, design and culture. Multidisciplinary artists' playground; a live, process-open studio. "Lead With Tension."
Vibe: clean, editorial, artistic, kinetic. **Liquid glass** is the signature material (references: olhalazarieva.com, emelecollab.com, studiograylab.com, zarach.pl for the holding page). Instagram: @softtensionlab. Existing site being replaced: softtensionlab.com (Elementor).
Art-gallery energy, not agency energy. **Explicitly not corporate. Not a template.**

Traffic is almost entirely from Instagram on mobile. **Mobile-first is not a checkbox here — it is the primary design target.** Thumb ergonomics and page speed outrank any desktop flourish.

## Always Do First

- **Invoke both `frontend-design` and `ui-ux-pro-max` skills** before writing any frontend code, every session, no exceptions. Run them together.
- **Invoke the `seo` skill** to add proper meta tags, Open Graph, structured data, and SEO best practices to every page (title, description, OG image, `lang="tr"`, JSON-LD `Organization` + `LocalBusiness` for the studio).

## Reference Files & Brand System

- The brand spec ships with this project. **Read it before designing — it is the single source of truth. Do not invent brand colors, fonts, sections, or glass values.**
  - `.claude/brand_assets/brand_guidelines.html` — colours (60/30/10 ratio), typography, the literal liquid-glass button/icon implementation (HTML+CSS+SVG filter), logo variants. Open it in a browser or read the source directly — it's a real, running reference, not a mockup image.
  - `.claude/brand_assets/design_architecture.html` — labeled **"NİHAİ" (final)**, v5.1. This is the authoritative section-by-section blueprint, written by the studio directly to the developer ("Ata'ya Özel Not"). It supersedes any earlier structural idea below if the two ever conflict — **when in doubt, re-read this file, not your memory of it.**
- **Fonts** ship at `.claude/fonts/Woff/*.woff` (Whyte Inktrap, the full family) and are loaded via Google Fonts (Archivo) — see Typography below. **Before writing any page code, copy `.claude/fonts/Woff/*.woff` to `public/fonts/`.**
- **Logo family** ships at `.claude/logos/*.svg`. Copy to `public/logos/` before writing page code (note the source filenames — rename on copy for URL-safety, e.g. `Logo-Family_Ana Logo.svg` → `logo-ana.svg`). Four assets, each with a fixed job — do not substitute one for another:

| Source file | Copy to | Role | Where it goes |
|---|---|---|---|
| `Logo-Family_Ana Logo.svg` | `public/logos/logo-ana.svg` | Primary mark | Header (mobile/compact), footer, social avatar, print |
| `Logo-Family_Monogram.svg` | `public/logos/logo-monogram.svg` | Compact mark | Favicon, loader, cursor, stamp — **the only mark allowed below 32px** |
| `Logo-Family_Logotype.svg` | `public/logos/logo-logotype.svg` | Horizontal lockup | Nav bar (desktop), wide footer |
| `Logo-Family_Maskotlar.svg` | `public/logos/logo-maskotlar.svg` | Mascots / illustration | Empty states, 404, Shop coming-soon |
| `Logo-Family.svg` | — | Full sheet | Reference only — **never ship this file to a page** |

- The first three are **single-colour `#03173A`**. Recolour by surface, never by decoration: `--ink` on Paper, `--paper`/white on Ink sections (e.g. the dark Works logo wall, the black footer CTA) and over glass. Import them as inline SVG with `fill="currentColor"` so colour is driven by CSS, not by duplicate files.
- **Clear space:** minimum 1× monogram width on every side. **Minimum size:** primary mark 40px, monogram 20px.
- Ana Logo and Logotype are alternatives, not companions — never place both in the same view.
- Never apply gradient, drop shadow, outline, rotation, or a glass filter *to the mark itself*. A mark may sit **on** glass; it never **is** glass.
- **Mascot / illustration — controlled exception.** `Logo-Family_Maskotlar.svg` carries colours outside the brand palette (oranges, teals, mint — including a mascot orange that is visually close to but **not** the brand Signal `#FF5700`; never derive one from the other, never blend them). These live **only inside the mascot artwork.** None of them may become a background, button, link, border, or text colour anywhere in the UI. **Max one per screen**, and only in the two places the blueprint actually calls for organic illustration: the **Shop** coming-soon empty state and the **404** page. Never in a corporate context (forms, footer CTA).
- There is **no local studio photography or archive imagery yet** — `brand_assets/` ships only the two HTML specs. **Archive imagery is inherited from the current live site.** Download everything under `softtensionlab.com/wp-content/uploads/2026/05/` into `public/images/archive/` and re-encode to WebP/AVIF. Known assets: `Calisma-Yuzeyi-1`, `Calisma-Yuzeyi-1-kopya`, `our-studio-space-insta`, `our-studio-space-insta-W`, `Pretend-theres-art-inside_`, `Gift-Cardlar-5`, `Gift-Cardlar-7`, `1png`, `x1`. Crop 4:5 portrait where the layout calls for a portrait image — crop, never stretch. Until real work-sample logos exist for the Works wall and real illustration/motion stills exist for the Home showcase, use clearly-labeled `https://placehold.co/WIDTHxHEIGHT` blocks there and flag it in your summary — **do not invent fake client logos or fake artwork.**
- Match the blueprint's layout and structure exactly. Small refinements grounded in the brand are allowed — do not invent enhancements, do not overdo it.
- Screenshot your output, compare against the reference, fix mismatches, re-screenshot. At least 2 comparison rounds. Stop only when no visible differences remain or the user says so.

### Brand tokens (mirror of brand_guidelines.html `:root` — pull, don't guess)

```
--paper:    #F0EEE9   /* 60% — warm off-white/bone background (never pure #fff) */
--ink:      #03173A   /* 30% — primary text, dark sections, glass tint */
--signal:   #FF5700   /* 10% — single accent */

--ink-65:   rgba(3,23,58,.65)   /* "mute" — body copy on paper, secondary text */
--ink-40:   rgba(3,23,58,.40)   /* "faint" — captions, placeholders, muted labels */
--ink-15:   rgba(3,23,58,.15)   /* "line" — borders, dividers, pill outlines */
--ink-08:   rgba(3,23,58,.08)   /* "hair" — faint section dividers */
--ink-05:   rgba(3,23,58,.05)   /* "ph" — placeholder-block fill */
```

**The 60/30/10 ratio is a rule, not a suggestion.** Signal (`#FF5700`) is allowed **only** on: hover states, links, the active nav item, and a handful of very specific focal points (e.g. the glitch-hover on the footer finale). Never a background fill, never a large surface, never body text. The **Works** page and the **footer CTA finale** are full-bleed near-black (`--ink`, or true `#000` per the footer-CTA spec) — those are the only ink-dark full-bleed moments; don't add more. Do not introduce a fourth colour — if grey is needed use `rgba(3,23,58,α)`.

### Typography

Two families, not three — **this replaces any earlier idea of Syne / Instrument Serif / DM Mono.**

- **Whyte Inktrap** — the primary corporate family for *everything readable*: display headlines, hero type, body copy, buttons, form labels. Loaded **locally** from `public/fonts/` (`.woff`, copied from `.claude/fonts/Woff/`). Available weights: Thin, ExtraLight, Light, Book, Regular, Medium, Bold, Heavy, Black, Super (+ italics for most). Suggested role mapping:
  - Hero / big display type, footer-CTA lines: **Heavy/Black/Super**, tight letter-spacing.
  - H2/H3, section intros: **Bold**.
  - Body copy, form fields: **Regular/Medium**, 16–18px, line-height ~1.6.
  - Long manifesto-style paragraphs (About) may run **Bold** at a larger size in tight leading, per the actual inherited copy — see `design_architecture.html` section A1 for the literal treatment.
- **Archivo** (`family=Archivo:wdth,wght@62..125,100..900`) — Google Font, variable width+weight. Used **only** for small structural text: uppercase eyebrows/index labels, nav items, tag chips, metadata (`10–12px`, `letter-spacing .12–.2em`, bold weight). This is the family's only job — never use it for body copy or headlines.
- Do **not** introduce Inter, Syne, DM Mono, Instrument Serif, or any third family.
- **Border-radius is not flat 2–3px everywhere** — see the two real UI-chrome shapes below, defined by the actual brand spec:
  - **Pill (`border-radius: 999px` / `3rem`+)** — the floating nav bar, all liquid-glass buttons/CTAs, tag/pill chips (e.g. "PROJE BAŞLAT ↗"). This is correct per `brand_guidelines.html` and `design_architecture.html` — do not "correct" it down to a hairline radius.
  - **Small (2–4px)** — everything else: cards, image containers, form underlines (which are square, 0 radius, bottom-border only), the 404/illustration boxes.
  - Icon-only glass buttons use `2rem`→`2.5rem` on hover (near-circular), matching `brand_guidelines.html`.

### Liquid glass system (the signature material)

**This is not plain `backdrop-filter`.** The look is refracted glass: an SVG turbulence + displacement filter bends what is behind the surface, with a specular light pass for the edge. The studio's own literal reference implementation lives in `brand_guidelines.html` (`#glass-distortion`, `.liquidGlass-*` classes) — treat it as the floor, and the fuller 10-stop-shine version below as the refined production version of the same idea. Build one `<GlassCard>` component and use it everywhere — never hand-roll a second glass.

**Four layers. The order never changes.**

```jsx
<div className="lg">
  <div className="lg__effect" />    {/* 01 blur + SVG refraction — the physics */}
  <div className="lg__tint" />      {/* 02 single translucent colour — the ONLY thing a variant changes */}
  <div className="lg__shine" />     {/* 03 stacked inset shadows — the thickness */}
  <div className="lg__content">…</div>  {/* 04 text/icons — never filtered, never blurred */}
</div>
```

```scss
.lg { position: relative; overflow: hidden; isolation: isolate; }
// radius is set by the CONSUMER per the shape rule above (pill for nav/buttons, 2-4px for cards) — GlassCard takes a `radius` or `pill` prop, it does not hardcode one.

.lg__effect {
  position: absolute; inset: 0; z-index: 0;
  backdrop-filter: blur(3px);
  filter: url(#stl-glass);          // the refraction
}
.lg__tint    { position: absolute; inset: 0; z-index: 1; }
.lg__shine   { position: absolute; inset: 0; z-index: 2; box-shadow: /* 10-stop stack, see below */; }
.lg__content { position: relative;  z-index: 3; }

/* variants change ONE line — the tint */
.lg--frost .lg__tint { background: rgba(240,238,233,.22); }  // nav, cards, modals, forms
.lg--clear .lg__tint { background: rgba(240,238,233,.10); }  // captions, HUD, hover labels
.lg--tint  .lg__tint { background: rgba(3,23,58,.34);     }  // dark scenes, transition veil
```

**The filter** is defined once, in `_document.jsx`, as a hidden inline SVG — not duplicated per component:

```xml
<filter id="stl-glass" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
  <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="1" seed="17" result="turb"/>
  <feComponentTransfer in="turb" result="mapped">
    <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
    <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
    <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
  </feComponentTransfer>
  <feGaussianBlur in="turb" stdDeviation="3" result="softMap"/>
  <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1"
    specularExponent="100" lighting-color="white" result="specLight">
    <fePointLight x="-200" y="-200" z="300"/>
  </feSpecularLighting>
  <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"/>
  <feDisplacementMap in="SourceGraphic" in2="softMap" scale="90"
    xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

**The shine** — thickness comes from ten stacked inset shadows, not one. White highlights top-left, Ink edges bottom-right, two soft outer drops last. Fixed values; never tuned per component:

```scss
box-shadow:
  inset 0 0 0 1px rgba(255,255,255,.10),
  inset 1.8px 3px 0 -2px rgba(255,255,255,.90),
  inset -2px -2px 0 -2px rgba(255,255,255,.80),
  inset -3px -8px 1px -6px rgba(255,255,255,.60),
  inset -.3px -1px 4px 0 rgba(3,23,58,.12),
  inset -1.5px 2.5px 0 -2px rgba(3,23,58,.20),
  inset 0 3px 4px -2px rgba(3,23,58,.20),
  inset 2px -6.5px 1px -4px rgba(3,23,58,.10),
  0 1px 5px 0 rgba(3,23,58,.10),
  0 6px 16px 0 rgba(3,23,58,.08);
```

**Refraction budget** — `scale` drops as the surface grows: small chips/buttons 120 · nav 90 · cards 70 · full-screen veil 40. Distortion reads on a small surface and turns to mud on a large one. `baseFrequency` stays in 0.006–0.010, `numOctaves` stays at 1.

**Rules**
- Glass **always sits on top of something** — imagery, video, or a dark scene. On flat Paper there is no glass; there is a hairline border.
- Max **two** stacked glass layers in one scene. A third turns to mud.
- Any text falling on imagery/video requires a glass layer. Bare text never sits directly on a photo or the hero background video.
- `.lg__content` never inherits a filter. If text looks soft, the content layer is in the wrong place.
- Radius follows the shape rule above (pill for nav/buttons/tags, small for everything else) — never an arbitrary in-between radius.

**Performance & fallback.** An SVG filter costs more than `backdrop-filter` alone. Budget **4 active glass surfaces per screen, 2 on mobile**; never sprinkle `will-change`. Degrade in this order:
1. `filter: url(#stl-glass)` — full refraction (feature-detected, desktop and capable mobile)
2. `backdrop-filter: blur(20px) saturate(150%)` — flat glass, still on-brand
3. 92% opaque Paper/Ink surface — no blur at all

`-webkit-backdrop-filter` is mandatory. Gate the SVG filter behind a support check plus a frame-rate check — if scroll drops below 60fps, fall to step 2 rather than removing the surface.

## Site Structure (from `design_architecture.html`, v5.1 "NİHAİ" — the authoritative blueprint)

Technically one app, perceptually multi-page: the URL changes and content is swapped behind a blur-in/blur-out mask (View Transitions). Nav is a **floating liquid-glass pill bar**: logo/wordmark on the left, items on the right (`ABOUT · WORKS · CONTACT · SHOP`). Always visible, never hides on scroll. Active item turns Signal.

**`/` (Home):**
1. **Header/Nav** — liquid-glass pill bar as above.
2. **Hero** — devasa (massive) typography manifesto line ("Multidisipliner sanatçıların oyun alanı. Sürece açık, canlı bir stüdyo.") over a very subtle, slow-moving blurred video background (TouchDesigner-style ambient loop — until a real video asset exists, use a static blurred placeholder and flag it). Scroll triggers the **toppling-letters** effect on this headline.
3. **Marquee band** — a full-width, continuously scrolling (Mondragon-style) line of services text right after the hero: "Marka Kimliği & Logo Sistemleri ✦ Tipografi / İçerik Geliştirme ✦ Web Design ✦ Motion Design ✦ …" looping.
4. **Rich showcase** — an asymmetric editorial grid (not a uniform grid) mixing illustration, web/motion work stills, and brand-identity pieces, interspersed with short copy blocks and "Proje Başlat" CTAs. Use placeholders (labeled, not fake) until real work stills exist.
5. **Footer finale (big final CTA)** — full-bleed near-black/`#000` section right before the real footer: stacked lines ("SOFT TENSION LAB" / "Ömer & Cemre" / "Lead With Tension" / "Sanatsal Sezgi" / "Sistematik Tasarım" / `hello@softtensionlab.com`), each line gets a glitch/colour hover effect (GSAP SplitText-style — reference only, do not literally import the referenced codepen's code), and one pill glass button ("PROJE BAŞLAT ↗") linking to `/contact`.

**`/about`** — Manifesto (inherited copy, bold/large, tight leading — see exact copy below) with a slide-up-on-load reveal. A minimal inline row of service labels sits at the bottom (`Marka Kimliği & Logo` / `Tipografi & İçerik` / `Web Design & Motion` / `Geleneksel & Dijital Sanat` / `Sanat Üretimi`) — plain text row, Archivo labels, not a heavy "services page." (There is a fuller `/services` page for anyone who wants the long-form list — link to it from here or from the footer, but it is **not** a floating-nav item; the nav bar is exactly the four items above.)

Manifesto copy (do not paraphrase):
> "SOFT TENSION LAB; SANAT, TASARIM VE KÜLTÜRÜN KESİŞİMİNDE YER ALAN BAĞIMSIZ BİR KREATİF STÜDYODUR. KAVRAMSAL DÜŞÜNCEYİ SOMUT GÖRSEL KİMLİKLERE DÖNÜŞTÜREREK, MARKALAR VE SANATÇILAR İÇİN ESTETİK DUVARLARI YIKIYORUZ.
>
> SÜRECE AÇIK, CANLI BİR STÜDYO OLARAK; SİSTEMATİK TASARIM İLE SANATSAL SEZGİ ARASINDAKİ GERİLİMDEN BESLENİYORUZ. HİKAYESİ OLAN, SAMİMİ VE BÜTÜNSEL DENEYİMLER YARATMAK İÇİN BİRLİKTE HAREKETE GEÇELİM."

**`/work`** (nav label "WORKS") — **Logo Wall.** Full-bleed dark mode (near-black `--ink`/`#000`). White (`--paper`/`currentColor`) client/work logos in a clean grid (3 columns desktop, collapses on mobile), headed "SELECTED WORKS." **No links, no boxes, no captions, no hover chrome** — this is a quiet, minimal power-move, deliberately the opposite of a busy portfolio grid. Until real client logos exist, use clearly-labeled placeholder blocks and flag it.

**`/services`** — secondary/long-form page (linked from About/footer, not in the floating nav) with the 7 services as an Archivo-labeled list; hovering a line may surface a related archive image behind glass — this refinement from the original brief is fine to keep here since it doesn't compete with the NİHAİ nav.
Marka Kimliği & Logo Sistemleri / Tipografi / İçerik Geliştirme / Geleneksel & Dijital Sanat Entegrasyonu / Editöryel & Baskılı Tasarım / Kreatif Danışmanlık & Geleneksel Sanat Eğitimi / Sanat Üretimi

**`/contact`** — Split-screen (Olha Lazarieva-style layout). **Left:** huge headline "Hadi Tanışalım.", `hello@softtensionlab.com`, Instagram ↗, Behance ↗. **No location, no phone number — never add them.** **Right:** a custom-coded form styled like a Tally form (see `tally.so/r/LZ5Qlp` for the question set) with underlined (not boxed) fields — Adınız / Proje Tipi / Bütçe Aralığı — and a solid ink pill submit button ("Gönder").

**`/shop`** — Coming-soon empty state: circular illustration slot (mascot/organic illustration goes here) + "Coming Soon." headline, slide-up text reveal. Closed, but visibly present in the nav.

**404 (global)** — Big "404" numeral (toppling-letters treatment optional here, or a studio illustration), "Görünüşe göre bu sayfa tasarım sürecinde kayboldu.", pill button "ANA SAYFAYA DÖN" back to `/`.

**`/` holding page (build phase only)** — single screen, no scroll, full-bleed black. "STL LOGO" wordmark small at top, "SOFT TENSION LAB" headline (toppling-letters on load), "WEBSITE COMING SOON" Archivo label, and **exactly one action**: a `mailto:hello@softtensionlab.com` link with a hover underline. No Instagram link here (differs from the old brief — the real spec is mail-only). Reference: zarach.pl. This is what stays live at the domain **until the real site is finished** — build it as a separate always-available route/toggle, not something the client has to remember to remove.

## Signature Elements (the things that make this site _not_ generic)

- **Liquid glass** — the recurring material, refracted not just blurred, on the nav and every CTA/pill button. This is the site's identity; spend the boldness here.
- **Toppling letters ("yıkılan harfler")** — dynamic typography that topples/collapses on **scroll** (not just cursor proximity). Used on the Home hero headline and optionally the 404 numeral. Physically consistent (gravity-like spring), not random.
- **Marquee band** — continuous horizontal scroll of services text, Home only, right after the hero.
- **Asymmetric editorial showcase** — the Home rich-showcase grid; deliberately irregular column spans, not a uniform CSS grid.
- **Glitch-hover footer finale** — the Home's big final CTA: stacked lines that glitch/shift colour on hover, full-bleed near-black, one glass CTA.
- **The Works logo wall** — dark, silent, no interaction chrome. The quiet power-move that contrasts with everything else.
- **Mascots/illustration** — the studio's playful face. Appear only at 404 and the Shop coming-soon state. One per screen, never in a corporate context (forms, footer CTA).
- **Custom cursor** — small dot on desktop, grows over interactive/preview areas, disabled on touch.
- Keep everything else quiet.

## Motion Spec

Only `transform` and `opacity` are animated (the marquee band may also translate via `transform: translateX`). Never `transition-all`.

| Moment | Spec |
|---|---|
| Toppling letters | scroll-triggered, spring-like fall/settle, used once on Home hero (+ optional 404) |
| Page transition | ~500ms `cubic-bezier(.16,1,.3,1)`, blur-in/blur-out mask sweep. **Blur, not fade.** |
| Cursor | small Signal dot, grows over hoverable/preview content, lerp-smoothed, disabled on touch |
| Marquee | linear, constant-speed `translateX` loop, `will-change` only while in viewport |
| Footer-CTA glitch hover | short, sharp colour/offset flicker on the hovered line only — not the whole block |
| Scroll reveal | sections/text rise ~24px from below on first view, `once: true`, no exit animation |
| Glass breathing | edge highlight follows the cursor (conic-gradient border, ~240ms), blur 26 → 30px |

`prefers-reduced-motion: reduce` kills every effect and leaves content fully visible. No exceptions. Any effect that drops below 60fps is deleted, not tuned.

## Local Server

- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start dev server: `node .claude/serve.mjs` (serves the static export at `http://localhost:3000`). Use `npm run dev` for iterative work against the Next dev server instead.
- If the server is already running, do not start a second instance.

## Screenshot Workflow

- Puppeteer is at `C:/Users/ataba/AppData/Local/Temp/puppeteer/`. Chrome cache at `C:/Users/ataba/.cache/puppeteer/`.
- **Single screenshot:** `node .claude/screenshot.mjs http://localhost:3000 [label]` (desktop 1440×900; add `--mobile` for a single 390×844 shot).
- **Full breakpoint matrix in one run:** `node .claude/screenshot-responsive.mjs http://localhost:3000 <page-label>` — shoots mobile/tablet-mini/midi/max × portrait/landscape + desktop (9 shots) in one go. Use this for the required breakpoint sweep instead of calling `screenshot.mjs` nine times.
- **Horizontal-overflow sweep across all pages:** `node .claude/check-overflow.mjs` — prints scrollWidth vs innerWidth per page × breakpoint; anything reported `OVERFLOW` must be fixed before moving on.
- Screenshots save to `.claude/temporary screenshots/screenshot-N[-label].png` (auto-incremented, never overwritten).
- After screenshotting, read the PNG with the Read tool and analyze it directly.
- Be specific when comparing: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px".
- Check: spacing/padding, font size/weight/line-height, colours (exact hex), alignment, border-radius (pill where the spec says pill, 2–4px elsewhere), shadows, image sizing, **and that the glass actually renders** — refraction visible at the edges (not just flat blur), specular highlight present, `.lg__content` text sharp and unblurred, no muddy stacking. If the glass looks like plain frosted blur, the SVG filter is not applying — fix it before moving on.
- Verify the Signal budget on every screenshot: count the orange elements. More than a couple of small accents per view means it is over budget — Signal is never a surface.
- Screenshot every breakpoint × orientation combo (mobile portrait/landscape, tablet mini/midi/max portrait/landscape, desktop) before marking a section done — not just desktop.

## Output Defaults

- Create `src/pages/index.jsx`, `src/pages/about.jsx`, `src/pages/work.jsx`, `src/pages/services.jsx`, `src/pages/contact.jsx`, `src/pages/shop.jsx`, `src/pages/404.jsx` as Next.js pages (Pages Router). Add more pages/components as needed. The **holding page** is a separate concern from the real `/` — implement it so it can be toggled on/off for launch (e.g. an env flag or a simple constant), without deleting the real homepage code.
- Standard Next.js structure: default export, `Head` from `next/head` for meta/SEO.
- **Copy is inherited from the existing site/brief — do not write placeholder or lorem ipsum for real copy blocks** (the About manifesto above is exact; reuse it verbatim). For imagery only (client logos, work stills, hero video) that doesn't exist yet locally, use clearly-labeled `https://placehold.co/WIDTHxHEIGHT` blocks and flag it — do not invent fake client names/logos.
- **Responsive is non-negotiable.** Mobile-first — this is where nearly all real traffic lands. Every section, type size, image, and spacing must work correctly at every breakpoint × orientation combo below — no overlap, no overflow, no clipped text:
  - **Mobile** (~375px): portrait AND landscape.
  - **Tablet**, three sizes — **mini** (~768px, e.g. iPad mini), **midi** (~834px, e.g. iPad Air), **max** (~1024px, e.g. iPad Pro) — each tested in portrait AND landscape.
  - **Desktop** (1280px+).
  Nav collapses to a glass menu sheet on mobile/tablet; page transitions still work; imagery stays full-bleed and correctly cropped at every size/orientation. Custom cursor and toppling-letters pointer-tracking are disabled on touch (scroll-triggered toppling still runs). Test all of the above before done — landscape on small devices (short viewport height) is a common breakage point, check it explicitly.
- **Styling conventions:**
  - Page styles → `src/styles/pages/<pagename>.scss`, imported in the page.
  - Component styles → `src/styles/components/<ComponentName>.scss`, imported in the component.
  - New `.scss` per page/component as needed. **Never** inline styles or Tailwind classes in `.jsx`.
  - BEM or logical class names. Define the brand tokens and the glass placeholder above in one place (`src/styles/_tokens.scss`) and `@use` it everywhere.
- Break the page into reusable components under `src/components/` (Nav, Hero, TopplingText, Marquee, GlassCard, Logo, Mascot, ShowcaseGrid, LogoWall, Services, ContactForm, FooterFinale, Footer, PageVeil, Cursor, HoldingPage). `GlassCard` is the single owner of the four-layer glass markup — no component builds its own.

## Anti-Generic Guardrails

- **Colours:** Only Paper / Ink / Signal + ink alphas. Never default Tailwind (indigo/blue/etc.). Background is warm Paper, never pure white. No second accent colour.
- **Shadows:** No flat `shadow-md`. The only shadow in the system is the glass lift (`0 26px 50px -28px rgba(3,23,58,.55)`). Elsewhere hairlines do the work.
- **Typography:** Whyte Inktrap + Archivo only. Nav items, tags, index/eyebrow labels are always uppercase Archivo — matching the existing site's caps voice. **Long body copy is never uppercase** (the About manifesto is an intentional exception — it's short, bold, and functions as a headline, not body copy).
- **Texture:** Glass is the depth device. Optional very subtle SVG grain on Ink sections only. No gradients.
- **Animations:** Only `transform` and `opacity`. **Never `transition-all`.** Spring-style easing. Nothing scattered or gratuitous — one signature moment per page. Respect `prefers-reduced-motion`.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. Hover = underline turning Signal + arrow shifting 4px right (or the glitch/colour flicker on the footer-finale lines specifically). Focus ring: 2px Signal, 3px offset, **never removed**.
- **Images:** Anything on imagery/video gets a glass layer for legibility, not a dark gradient overlay. Keep the archive's own colour — do not desaturate or filter it.
- **Spacing:** Intentional, consistent tokens — not random steps. Whitespace is content; a cramped page reads corporate.
- **Depth:** Clear layering (base Paper → imagery → glass → floating nav), not everything on one z-plane.

## Hard Rules

- Do not add sections, features, or content not in the blueprint (`design_architecture.html`). This includes: no photo-archive detail-view grid on `/work` (it's a logo wall, not a photo archive), no drag-to-kern interactive module anywhere (not part of the final brief).
- Do not stop after one screenshot pass.
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo, and do not use pure white backgrounds.
- Do not exceed the 60/30/10 colour ratio. Signal is never a surface.
- Do not stack more than two glass layers, and do not exceed 4 glass surfaces per screen.
- Nav/buttons/tags are pill-shaped by spec — don't flatten them to a hairline radius. Everything else stays small-radius (2–4px), never an arbitrary in-between value.
- Do not hand-roll glass outside `GlassCard`, and do not apply a glass filter to a logo.
- Do not let any mascot/illustration colour escape into the UI, and never treat the mascot orange as the brand Signal.
- Do not use `Logo-Family.svg` (the full sheet) on a page.
- Do not use any font outside Whyte Inktrap / Archivo.
- Do not add the location or a phone number to `/contact` — email + Instagram + Behance only.
- Do not write agency copy ("çözüm ortağınız", "360° hizmet", "tutkuyla"). Do not use stock photography, icon packs, or emoji.
- Small brand-grounded refinements are allowed — do not invent enhancements, do not overdo it.
- **Target the highest possible Google Lighthouse score** (Performance, Accessibility, Best Practices, SEO) on every page. Use `next/image` sizing/lazy-loading, compress imagery, avoid layout shift (reserve space for media before it loads, including the hero background video), minimize JS/CSS, budget the cost of `backdrop-filter`, and ensure proper semantic HTML + alt text + contrast for accessibility — **check contrast on glass surfaces specifically**, they are the easiest place to fail it.

## Deployment

- This is a Next.js **static export** (SSG) deployed to **Firebase Hosting**. Set `output: 'export'` in `next.config.js`, configure `firebase.json` to serve the `out/` directory with SPA-style rewrites for the client-routed feel, and keep a `.firebaserc` pointing at the correct project.
- Set up the config and verify `next build` produces a working `out/` directory locally (serve it with `.claude/serve.mjs` and check it). **Do not run `firebase deploy` without explicit confirmation** — that publishes to production; treat it the same as any other action that affects shared/live state.
