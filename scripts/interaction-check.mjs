// Interaction checks that a static screenshot cannot show: the open mobile menu sheet,
// the toppling headline mid-scroll, and the glass veil mid-transition.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:/Users/ataba/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe';
const DIR = path.resolve('.claude/temporary screenshots');
const BASE = process.argv[2] || 'http://localhost:3001';
const next = (label) => {
  const n = fs.readdirSync(DIR).filter((f) => f.startsWith('screenshot-')).reduce((m, f) => Math.max(m, +(f.match(/screenshot-(\d+)/) || [0, 0])[1]), 0) + 1;
  return path.join(DIR, `screenshot-${n}-${label}.png`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });

// 1. Mobile menu sheet open
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, deviceScaleFactor: 2, hasTouch: true });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await page.tap('.nav__toggle');
  await wait(900);
  await page.screenshot({ path: next('menu-open-mobile') });
  await page.close();
}

// 2. Toppling headline mid-scroll (desktop) — two moments
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  for (const y of [180, 420]) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await wait(700);
    await page.screenshot({ path: next(`topple-${y}`) });
  }
  await page.close();
}

// 3. Veil mid-transition: click ABOUT and capture at ~260ms
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await page.click('a.nav__link[href="/about/"]');
  await wait(260);
  await page.screenshot({ path: next('veil-mid') });
  await wait(1200);
  await page.screenshot({ path: next('veil-after') });
  const errors = await page.evaluate(() => window.__errors || []);
  console.log('after-transition url:', page.url(), 'errors:', errors.length);
  await page.close();
}

await browser.close();
console.log('done');
