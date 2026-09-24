// Makes Whyte Inktrap's three vertical-metric tables agree, so every engine sizes the line
// box identically. As shipped by the foundry the tables disagree (hhea/typo 393/-95 vs
// OS/2 win 812/188): Windows Chrome reads win, iOS/macOS WebKit, Android and Firefox read
// hhea, so the same CSS put the baseline .16em higher on a phone and tall glyphs (caps,
// İ-dots) were cut by every tight overflow:hidden box. WebKit ignores the CSS
// ascent/descent-override descriptors, so the files themselves must carry the fix:
//   hhea  ascender/descender/lineGap       ->  812 / -188 / 0
//   OS/2  sTypoAscender/Descender/LineGap  ->  812 / -188 / 0, USE_TYPO_METRICS set
//   OS/2  usWinAscent/usWinDescent         ->  812 / 188 (unchanged)
// Glyph outlines, advances, kerning and names are untouched. Both .woff and .woff2 are
// rewritten in place (.woff2 needs the `wawoff2` package: `npx -p wawoff2 node scripts/...`
// or `npm i -D wawoff2`). Run it again on any freshly copied foundry file — the values in
// globals.scss (ascent-override 81.2% / descent-override 18.8%) mirror these numbers.
//
// usage: node scripts/fix-font-metrics.mjs public/fonts [--verify]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const DIR = process.argv[2] || 'public/fonts';
const VERIFY_ONLY = process.argv.includes('--verify');
const ASC = 812, DESC = 188, GAP = 0;

const pad4 = (n) => Math.ceil(n / 4) * 4;
function checksum(buf) {
  const p = Buffer.alloc(pad4(buf.length)); buf.copy(p);
  let s = 0; for (let i = 0; i < p.length; i += 4) s = (s + p.readUInt32BE(i)) >>> 0; return s;
}
function parseSfnt(b) {
  const numTables = b.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    const tag = b.toString('ascii', o, o + 4), off = b.readUInt32BE(o + 8), len = b.readUInt32BE(o + 12);
    tables.push({ tag, data: Buffer.from(b.subarray(off, off + len)) });
  }
  return { flavor: b.readUInt32BE(0), tables };
}
function buildSfnt({ flavor, tables }) {
  const n = tables.length;
  const es = Math.floor(Math.log2(n)), sr = (2 ** es) * 16;
  const header = Buffer.alloc(12);
  header.writeUInt32BE(flavor, 0); header.writeUInt16BE(n, 4); header.writeUInt16BE(sr, 6); header.writeUInt16BE(es, 8); header.writeUInt16BE(n * 16 - sr, 10);
  const dir = Buffer.alloc(n * 16);
  const sorted = [...tables].sort((a, b) => (a.tag < b.tag ? -1 : 1));
  let off = 12 + n * 16; const chunks = [];
  const head = sorted.find((t) => t.tag === 'head');
  if (head) head.data.writeUInt32BE(0, 8);
  sorted.forEach((t, i) => {
    const o = i * 16;
    dir.write(t.tag, o, 4, 'ascii'); dir.writeUInt32BE(checksum(t.data), o + 4); dir.writeUInt32BE(off, o + 8); dir.writeUInt32BE(t.data.length, o + 12);
    const padded = Buffer.alloc(pad4(t.data.length)); t.data.copy(padded); chunks.push(padded); off += padded.length;
  });
  const file = Buffer.concat([header, dir, ...chunks]);
  if (head) {
    const adj = (0xB1B0AFBA - checksum(file)) >>> 0;
    const hoff = 12 + sorted.indexOf(head) * 16;
    file.writeUInt32BE(adj, file.readUInt32BE(hoff + 8) + 8);
  }
  return file;
}
function woffToSfnt(b) {
  const flavor = b.readUInt32BE(4), n = b.readUInt16BE(12); const tables = [];
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20; const tag = b.toString('ascii', o, o + 4), off = b.readUInt32BE(o + 4), cl = b.readUInt32BE(o + 8), ol = b.readUInt32BE(o + 12);
    let d = b.subarray(off, off + cl); if (cl < ol) d = zlib.inflateSync(d); tables.push({ tag, data: Buffer.from(d) });
  }
  return { flavor, tables };
}
function sfntToWoff(sfntBuf) {
  const { flavor, tables } = parseSfnt(sfntBuf);
  const n = tables.length;
  const header = Buffer.alloc(44);
  header.write('wOFF', 0, 'ascii'); header.writeUInt32BE(flavor, 4); header.writeUInt16BE(n, 12); header.writeUInt32BE(sfntBuf.length, 16); header.writeUInt16BE(1, 20); header.writeUInt16BE(0, 22);
  const dir = Buffer.alloc(n * 20); let off = 44 + n * 20; const chunks = [];
  tables.forEach((t, i) => {
    let comp = zlib.deflateSync(t.data, { level: 9 }); if (comp.length >= t.data.length) comp = t.data;
    const o = i * 20; dir.write(t.tag, o, 4, 'ascii'); dir.writeUInt32BE(off, o + 4); dir.writeUInt32BE(comp.length, o + 8); dir.writeUInt32BE(t.data.length, o + 12); dir.writeUInt32BE(checksum(t.data), o + 16);
    const padded = Buffer.alloc(pad4(comp.length)); comp.copy(padded); chunks.push(padded); off += padded.length;
  });
  header.writeUInt32BE(off, 8);
  return Buffer.concat([header, dir, ...chunks]);
}
function describe(sfnt) {
  const hhea = sfnt.tables.find((t) => t.tag === 'hhea').data, os2 = sfnt.tables.find((t) => t.tag === 'OS/2').data, head = sfnt.tables.find((t) => t.tag === 'head').data;
  return `upm=${head.readUInt16BE(18)} hhea=${hhea.readInt16BE(4)}/${hhea.readInt16BE(6)}/${hhea.readInt16BE(8)} typo=${os2.readInt16BE(68)}/${os2.readInt16BE(70)}/${os2.readInt16BE(72)} win=${os2.readUInt16BE(74)}/${os2.readUInt16BE(76)} USE_TYPO=${!!(os2.readUInt16BE(62) & 128)}`;
}
function isFixed(sfnt) { return describe(sfnt).includes(`hhea=${ASC}/${-DESC}/${GAP} typo=${ASC}/${-DESC}/${GAP} win=${ASC}/${DESC} USE_TYPO=true`); }
function patchTables(sfnt) {
  const hhea = sfnt.tables.find((t) => t.tag === 'hhea').data, os2 = sfnt.tables.find((t) => t.tag === 'OS/2').data;
  hhea.writeInt16BE(ASC, 4); hhea.writeInt16BE(-DESC, 6); hhea.writeInt16BE(GAP, 8);
  os2.writeInt16BE(ASC, 68); os2.writeInt16BE(-DESC, 70); os2.writeInt16BE(GAP, 72); os2.writeUInt16BE(ASC, 74); os2.writeUInt16BE(DESC, 76);
  os2.writeUInt16BE(os2.readUInt16BE(62) | 128, 62);
  // USE_TYPO_METRICS (fsSelection bit 7) exists from OS/2 version 4; v3 and v4 share the
  // same 96-byte layout, so bumping the version is a one-field change.
  if (os2.readUInt16BE(0) === 3) os2.writeUInt16BE(4, 0);
}

let wawoff2 = null;
try { wawoff2 = createRequire(import.meta.url)('wawoff2'); } catch { /* .woff2 handled below */ }

let changed = 0, already = 0, skipped = 0, bad = 0;
for (const f of fs.readdirSync(DIR).sort()) {
  const p = path.join(DIR, f);
  if (!/\.woff2?$/.test(f)) continue;
  const isW2 = f.endsWith('.woff2');
  if (isW2 && !wawoff2) { console.log(`${f}: skipped — install wawoff2 to rewrite .woff2 (npm i -D wawoff2)`); skipped++; continue; }
  const sfnt = isW2 ? parseSfnt(Buffer.from(await wawoff2.decompress(fs.readFileSync(p)))) : woffToSfnt(fs.readFileSync(p));
  const before = describe(sfnt);
  if (isFixed(sfnt)) { already++; if (VERIFY_ONLY) console.log(`${f}: ok  ${before}`); continue; }
  if (VERIFY_ONLY) { bad++; console.log(`${f}: NOT FIXED  ${before}`); continue; }
  patchTables(sfnt);
  const out = isW2 ? Buffer.from(await wawoff2.compress(buildSfnt(sfnt))) : sfntToWoff(buildSfnt(sfnt));
  fs.writeFileSync(p, out);
  const check = isW2 ? parseSfnt(Buffer.from(await wawoff2.decompress(out))) : woffToSfnt(out);
  console.log(`${f}: ${before}\n   -> ${describe(check)} (${out.length} bytes)`);
  changed++;
}
console.log(`${VERIFY_ONLY ? 'verified' : 'done'}: ${changed} rewritten, ${already} already fixed, ${skipped} skipped, ${bad} not fixed`);
if (bad) process.exit(1);
