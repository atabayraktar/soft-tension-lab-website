// The Home showcase — a silent gallery wall. This is the ONLY place the studio edits when
// real work lands: swap `slug` (a file in public/images/archive, see manifest.json), write
// the two captions, set `tone` to the image's own brightness, choose which 10 stay on phones.
//
// Fields
//   id      slot number 01–20. Its wall position (column / band / offset) lives in
//           src/styles/components/Showcase.scss under the same number — the layout is the
//           wall, the data is what hangs on it.
//   slug    archive derivative (`<slug>-800.webp` / `-1400.webp`).
//   ratio   the frame: '4/5' portrait · '3/4' · '1/1' square · '3/2' wide. object-fit: cover
//           crops the source into it — crop, never stretch.
//   alt     what is in the picture, in Turkish.
//   left    caption bottom-left  — what it is   (e.g. "Logo tasarımı")
//   right   caption bottom-right — who made it  (e.g. "Ata Bayraktar")
//   lang    'en' while the placeholder text is English (keeps Turkish uppercase from
//           turning "info" into "İNFO"); drop it once the captions are Turkish.
//   tone    'dark' image → light captions · 'light' image → ink captions.
//   mobile  true for the 10 that show below 768px (the rest stay hidden and unloaded).
//   sizes   optional srcset hint; the default fits a third-width piece.
//
// Three real images exist today, so the wall repeats them — every slot is a placeholder.

const CAP = { left: 'info text', right: 'info text', lang: 'en' };
const WIDE = '(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw';

export const SHOWCASE = [
  { id: '01', slug: 'x1', ratio: '4/5', tone: 'dark', mobile: true, sizes: WIDE,
    alt: 'Cemre’nin tuval resmi: alevler içindeki bir kutudan doğrulan, kolları havada bir figür', ...CAP },
  { id: '02', slug: 'pretend-theres-art-inside', ratio: '1/1', tone: 'dark', mobile: true,
    alt: 'Siyah zeminde şeffaf bir poşet: üzerinde “Pretend there’s art inside.” yazısı', ...CAP },
  { id: '03', slug: 'gift-cardlar-5', ratio: '4/5', tone: 'light', mobile: false,
    alt: 'Beyaz zeminde siyah karınca yiyen ve iki karınca illüstrasyonlu hediye kartı', ...CAP },
  { id: '04', slug: 'calisma-yuzeyi-1', ratio: '4/5', tone: 'dark', mobile: false,
    alt: 'Siyah zemin üzerine dağınık yerleştirilmiş beyaz metin blokları: “Which God?” sergi afişi arka yüzü', ...CAP },
  { id: '05', slug: '1png', ratio: '1/1', tone: 'light', mobile: true,
    alt: 'Mavi zeminde saksafon çalan iki iskelet, kenarlarda mor çiçekler — tuval üzerine yağlı boya', ...CAP },
  { id: '06', slug: 'calisma-yuzeyi-1-kopya', ratio: '3/4', tone: 'dark', mobile: true,
    alt: '“Which God?” afişi: mavi gözlü, mavi dudaklı bir yüz portresi üzerine yerleştirilmiş başlık', ...CAP },
  { id: '07', slug: 'our-studio-space-insta-w', ratio: '3/2', tone: 'light', mobile: true, sizes: WIDE,
    alt: 'Beyaz zeminde devasa siyah “OUR STUDIO SPACE” harfleri ve bir Game Boy', ...CAP },
  { id: '08', slug: 'gift-cardlar-7', ratio: '4/5', tone: 'dark', mobile: true,
    alt: 'Kraft zarf içinde siyah hediye kartı: karınca yiyen illüstrasyonu ve “Gift Card” yazısı', ...CAP },
  { id: '09', slug: 'x1', ratio: '3/4', tone: 'dark', mobile: false,
    alt: 'Alevler içindeki kutu figürünün yakın plan kadrajı — tuval üzerine yağlı boya', ...CAP },
  { id: '10', slug: 'our-studio-space-insta', ratio: '4/5', tone: 'dark', mobile: true,
    alt: 'Siyah zeminde devasa beyaz “OUR STUDIO SPACE” harfleri ve bir Game Boy', ...CAP },
  { id: '11', slug: 'calisma-yuzeyi-1-kopya', ratio: '1/1', tone: 'dark', mobile: false,
    alt: '“Which God?” afişinin kare kadrajı: mavi gözler ve başlık', ...CAP },
  { id: '12', slug: '1png', ratio: '4/5', tone: 'light', mobile: false, sizes: WIDE,
    alt: 'Saksafon çalan iki iskelet — mavi zeminli tuval resmi, tam kadraj', ...CAP },
  { id: '13', slug: 'pretend-theres-art-inside', ratio: '1/1', tone: 'dark', mobile: false,
    alt: '“Pretend there’s art inside.” poşetinin kare kadrajı', ...CAP },
  { id: '14', slug: 'gift-cardlar-5', ratio: '3/4', tone: 'light', mobile: true,
    alt: 'Beyaz hediye kartı: karınca yiyen ve karıncalar, “GAM COLLECTIVE” başlığı', ...CAP },
  { id: '15', slug: 'calisma-yuzeyi-1-kopya', ratio: '4/5', tone: 'dark', mobile: false,
    alt: '“Which God?” afişi, tam kadraj', ...CAP },
  { id: '16', slug: 'our-studio-space-insta', ratio: '3/2', tone: 'dark', mobile: false,
    alt: 'Siyah zeminde “OUR STUDIO SPACE” harflerinin geniş kadrajı', ...CAP },
  { id: '17', slug: 'x1', ratio: '3/4', tone: 'dark', mobile: false,
    alt: 'Alevler içindeki kutu figürü — dikey kadraj', ...CAP },
  { id: '18', slug: 'calisma-yuzeyi-1', ratio: '1/1', tone: 'dark', mobile: true,
    alt: 'Siyah zeminde beyaz metin blokları — “Which God?” afişi arka yüzü, kare kadraj', ...CAP },
  { id: '19', slug: 'pretend-theres-art-inside', ratio: '4/5', tone: 'dark', mobile: false,
    alt: 'Siyah zeminde “Pretend there’s art inside.” poşeti, tam kadraj', ...CAP },
  { id: '20', slug: '1png', ratio: '3/4', tone: 'light', mobile: true,
    alt: 'Saksafon çalan iki iskelet — dikey kadraj', ...CAP },
];
