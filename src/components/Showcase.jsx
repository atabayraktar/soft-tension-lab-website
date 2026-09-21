import ArchiveImage from './ArchiveImage';
import { SHOWCASE } from '../lib/showcase';

// The showcase: walking past a gallery wall. No headline, no copy, no CTA — twenty pieces
// hung at different heights and sizes on desktop, the ten strongest stacked on phones.
// Each piece carries ONE info caption, right-aligned, hung just under its frame.
// Everything editable lives in src/lib/showcase.js; the hang itself in Showcase.scss.
const DEFAULT_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';

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
                  <ArchiveImage slug={p.slug} alt={p.alt} ratio={p.ratio} sizes={p.sizes || DEFAULT_SIZES} />
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
