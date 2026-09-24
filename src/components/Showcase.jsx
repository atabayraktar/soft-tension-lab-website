import ArchiveImage from './ArchiveImage';
import { SHOWCASE } from '../lib/showcase';

// The showcase: walking past a gallery wall. No headline, no copy, no CTA — twenty pieces
// hung at different heights and sizes on desktop, the ten strongest stacked on phones.
// Each piece carries ONE info caption, right-aligned, hung just under its frame.
// Everything editable lives in src/lib/showcase.js; the hang itself in Showcase.scss.
//
// `sizes` per slot — how many grid columns each piece spans, mirroring the $desk (12-col,
// ≥1024px) and $tab (6-col, ≥768px) hang maps in Showcase.scss. A column plus its gap is
// ≈7.7vw on the 12-col wall and ≈15.5vw on the 6-col wall once the gutters are taken out,
// so the browser can pick the 480/800/1400 derivative that actually fits the frame rather
// than always the 800 (a two-column piece is ~200px wide on a laptop). Keep in step with
// the SCSS maps when a slot moves. A `sizes` on the item itself (showcase.js) still wins.
const DESK_COLS = { '01': 6, '02': 3, '03': 2, '04': 3, '05': 4, '06': 3, '07': 6, '08': 3, '09': 2, '10': 4, '11': 3, '12': 5, '13': 2, '14': 3, '15': 3, '16': 4, '17': 2, '18': 3, '19': 4, '20': 3 };
const TAB_COLS = { '01': 4, '02': 2, '03': 2, '04': 3, '05': 3, '06': 3, '07': 4, '08': 2, '09': 2, '10': 3, '11': 3, '12': 3, '13': 2, '14': 3, '15': 3, '16': 3, '17': 2, '18': 3, '19': 3, '20': 3 };
const DEFAULT_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';
const sizesFor = (id) => {
  const desk = DESK_COLS[id];
  const tab = TAB_COLS[id];
  if (!desk || !tab) return DEFAULT_SIZES;
  return `(min-width: 1024px) ${Math.ceil(desk * 7.7 - 1.1)}vw, (min-width: 768px) ${Math.ceil(tab * 15.5 - 1.2)}vw, 100vw`;
};

export default function Showcase() {
  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <h2 id="showcase-title" className="sr-only">Galeri: stüdyodan seçilmiş işler</h2>
      <div className="wrap">
        <ul className="showcase__wall">
          {SHOWCASE.map((p) => (
            <li
              key={p.id}
              className={`showcase__item${p.mobile ? '' : ' showcase__item--desk'}`}
              data-ratio={p.ratio}
              data-reveal
            >
              <div className="showcase__frame">
                <div className="showcase__img">
                  <ArchiveImage slug={p.slug} alt={p.alt} ratio={p.ratio} sizes={p.sizes || sizesFor(p.id)} />
                </div>
              </div>
              <div className="showcase__caps">
                <span className="showcase__cap" lang={p.lang}>{p.right}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
