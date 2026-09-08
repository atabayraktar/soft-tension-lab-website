// Renders the Open Graph image (1200×630) and the apple-touch-icon (180×180) from the
// brand marks with headless Chrome — no design tool round-trip. Run: `npm run og`.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:/Users/ataba/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe';
const PUB = path.resolve('public');
const read = (f) => fs.readFileSync(path.join(PUB, f), 'utf8');

const logotype = read('logos/logo-logotype.svg')
  .replace(/<\?xml[^>]*>/, '')
  .replace('viewBox="0 0 1080 1080"', 'viewBox="180 384 720 312"')
  .replace(/fill="#03173a"/gi, 'fill="#F0EEE9"');
const monogram = read('logos/logo-monogram.svg')
  .replace(/<\?xml[^>]*>/, '')
  .replace('viewBox="0 0 1080 1080"', 'viewBox="134 234 812 612"');

const font = fs.readFileSync(path.join(PUB, 'fonts/WhyteInktrap-Bold.woff')).toString('base64');
const archivoLink = '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700&display=block" rel="stylesheet">';

const og = `<!doctype html><html><head><meta charset="utf-8">${archivoLink}<style>
@font-face{font-family:'Whyte Inktrap';font-weight:700;src:url(data:font/woff;base64,${font}) format('woff')}
html,body{margin:0}body{width:1200px;height:630px;background:#03173A;color:#F0EEE9;font-family:'Whyte Inktrap',sans-serif;position:relative;overflow:hidden}
.mark{position:absolute;left:80px;top:72px;width:300px}
.mark svg{width:100%;height:auto;display:block}
.line{position:absolute;left:80px;bottom:150px;font-size:56px;font-weight:700;letter-spacing:-.03em;line-height:1.05;max-width:1000px}
.label{position:absolute;left:80px;bottom:72px;font-family:'Archivo',sans-serif;font-weight:700;font-size:16px;letter-spacing:.22em;text-transform:uppercase;color:rgba(240,238,233,.55)}
.sig{position:absolute;right:80px;bottom:72px;width:14px;height:14px;border-radius:50%;background:#FF5700}
</style></head><body>
<div class="mark">${logotype}</div>
<div class="line">Multidisipliner sanatçıların oyun alanı.<br>Sürece açık, canlı bir stüdyo.</div>
<div class="label">Soft Tension Lab · Lead With Tension · hello@softtensionlab.com</div>
<div class="sig"></div>
</body></html>`;

const icon = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0}body{width:180px;height:180px;background:#F0EEE9;display:grid;place-items:center}
svg{width:140px;height:auto;display:block}</style></head><body>${monogram}</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.setContent(og, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(PUB, 'og.png'), type: 'png' });
await page.setViewport({ width: 180, height: 180 });
await page.setContent(icon, { waitUntil: 'load' });
await page.screenshot({ path: path.join(PUB, 'apple-touch-icon.png'), type: 'png' });
await browser.close();
console.log('public/og.png + public/apple-touch-icon.png written');
