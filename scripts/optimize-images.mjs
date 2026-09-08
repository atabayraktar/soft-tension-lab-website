// Re-encodes the inherited archive PNGs (public/images/archive/src/*.png) to responsive
// WebP derivatives. Run once after downloading the sources: `npm run images`.
//
//   <slug>-800.webp / <slug>-1400.webp   — responsive pair for <img srcset>
//   <slug>-thumb.webp                    — 480px, used by the /services hover preview
//   hero-bg.webp                         — one image, pre-blurred, the hero "video" stand-in
//
// Crops: the layout asks for 4:5 portraits in places — crop, never stretch (sharp `cover`
// with attention-based positioning keeps the subject).

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SRC = path.resolve('public/images/archive/src');
const OUT = path.resolve('public/images/archive');
const HERO_SOURCE = process.env.HERO_SOURCE || 'x1.png';

const slug = (name) =>
  name
    .replace(/\.png$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const files = fs.readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const manifest = {};

for (const file of files) {
  const input = path.join(SRC, file);
  const s = slug(file);
  const meta = await sharp(input).metadata();
  manifest[s] = { source: file, width: meta.width, height: meta.height, ratio: +(meta.width / meta.height).toFixed(3) };

  for (const w of [800, 1400]) {
    const target = path.join(OUT, `${s}-${w}.webp`);
    await sharp(input)
      .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(target);
    // Noisy/halftone sources (the "Which God?" poster) stay huge at q78 — trade a little
    // quality for a file a phone can actually afford. Budget: ~180 KB @800, ~360 KB @1400.
    const budget = w === 800 ? 180_000 : 360_000;
    if (fs.statSync(target).size > budget) {
      // Halftone dither is incompressible; a sub-pixel soften (after the resize) removes the
      // noise the eye cannot see at this scale and cuts the file by ~4×.
      await sharp(input)
        .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
        .blur(0.9)
        .webp({ quality: 62, effort: 6, smartSubsample: true })
        .toFile(target + '.tmp');
      fs.renameSync(target + '.tmp', target);
      console.log(`  softened ${path.basename(target)} -> ${Math.round(fs.statSync(target).size / 1024)} KB`);
    }
  }
  await sharp(input)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(OUT, `${s}-thumb.webp`));

  const out = await sharp(path.join(OUT, `${s}-1400.webp`)).metadata();
  manifest[s].outWidth = out.width;
  manifest[s].outHeight = out.height;
  console.log(`${file} -> ${s} (${meta.width}x${meta.height})`);
}

// Hero background: heavily blurred at encode time so the browser never pays for a
// 40px CSS blur on a full-viewport element. 1600px wide is plenty behind a blur.
const heroIn = path.join(SRC, HERO_SOURCE);
if (fs.existsSync(heroIn)) {
  await sharp(heroIn)
    .resize({ width: 1600, height: 1000, fit: 'cover', position: sharp.strategy.attention })
    .blur(42)
    .webp({ quality: 60 })
    .toFile(path.join(OUT, 'hero-bg.webp'));
  await sharp(heroIn)
    .resize({ width: 800, height: 1200, fit: 'cover', position: sharp.strategy.attention })
    .blur(36)
    .webp({ quality: 58 })
    .toFile(path.join(OUT, 'hero-bg-portrait.webp'));
  // Phone-sized portrait: behind a 36px blur, 480px is indistinguishable from 800px.
  await sharp(heroIn)
    .resize({ width: 480, height: 720, fit: 'cover', position: sharp.strategy.attention })
    .blur(22)
    .webp({ quality: 56 })
    .toFile(path.join(OUT, 'hero-bg-portrait-480.webp'));
  console.log(`hero-bg.webp <- ${HERO_SOURCE}`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('manifest.json written');
