import ArchiveImage from './ArchiveImage';
import Button from './Button';
import { LEAD_LINES } from '../lib/site';

/**
 * The rich showcase — an asymmetric editorial wall, not a uniform grid. Real archive
 * pieces from the current site sit in irregular column spans, interspersed with the two
 * brand lead lines and a "Proje Başlat" CTA.
 */
export default function ShowcaseGrid() {
  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <div className="wrap">
        <h2 id="showcase-title" className="sr-only">Seçilmiş işler ve stüdyodan kesitler</h2>

        <div className="showcase__grid">
          {/* Row A — illustration (4:5) + "Sanat Üretimi" copy */}
          <figure className="showcase__cell showcase__cell--a" data-reveal>
            <div className="showcase__media showcase__media--45">
              <ArchiveImage slug="x1" alt="Cemre'nin tuval resmi: alevler içindeki bir kutudan doğrulan, kolları havada bir figür" ratio="4 / 5" sizes="(min-width: 1024px) 38vw, 100vw" />
            </div>
            <figcaption className="showcase__cap"><span>İllüstrasyon</span><span>Cemre</span></figcaption>
          </figure>

          <div className="showcase__cell showcase__cell--b showcase__text" data-reveal>
            <p className="showcase__lead">{LEAD_LINES[0]}</p>
            <Button href="/contact/" surface="outline">Proje Başlat</Button>
          </div>

          {/* Row C — second lead line + poster + painting */}
          <div className="showcase__cell showcase__cell--e showcase__text" data-reveal>
            <p className="showcase__lead showcase__lead--sm">{LEAD_LINES[1]}</p>
          </div>

          <figure className="showcase__cell showcase__cell--f" data-reveal>
            <div className="showcase__media showcase__media--45">
              <ArchiveImage slug="calisma-yuzeyi-1-kopya" alt="“Which God?” afişi: mavi gözlü, mavi dudaklı, sarı tonlarda bir yüz portresi üzerine yerleştirilmiş başlık" ratio="4 / 5" sizes="(min-width: 1024px) 30vw, 100vw" />
            </div>
            <figcaption className="showcase__cap"><span>Editöryel &amp; Baskı</span><span>Which God?</span></figcaption>
          </figure>

          <figure className="showcase__cell showcase__cell--g" data-reveal>
            <div className="showcase__media showcase__media--45">
              <ArchiveImage slug="pretend-theres-art-inside" alt="Siyah zeminde şeffaf bir poşet: üzerinde “Pretend there’s art inside.” yazısı" ratio="4 / 5" sizes="(min-width: 1024px) 22vw, 100vw" />
            </div>
            <figcaption className="showcase__cap"><span>Ambalaj</span><span>Pretend there’s art inside</span></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
