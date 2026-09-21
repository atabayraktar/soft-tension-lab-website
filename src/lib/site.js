// Single source of truth for studio facts and copy that repeats across pages.
// Copy is inherited from the brief / existing site — never paraphrase it here.

export const SITE = {
  name: 'Soft Tension Lab',
  shortName: 'STL',
  url: 'https://softtensionlab.com',
  email: 'hello@softtensionlab.com',
  instagram: 'https://www.instagram.com/softtensionlab',
  instagramHandle: '@softtensionlab',
  behance: 'https://www.behance.net/softtensionlab',
  // TODO verify: same @softtensionlab handle convention as Instagram/Behance —
  // confirm these are the studio's actual YouTube/TikTok accounts before launch.
  youtube: 'https://www.youtube.com/@softtensionlab',
  tiktok: 'https://www.tiktok.com/@softtensionlab',
  founders: 'Ömer & Cemre',
  tagline: 'Lead With Tension',
  locale: 'tr_TR',
  description:
    'Soft Tension Lab; sanat, tasarım ve kültürün kesişiminde yer alan bağımsız bir kreatif stüdyodur. Multidisipliner sanatçıların oyun alanı; sürece açık, canlı bir stüdyo.',
  ogImage: '/og.png',
};

// Nav order: Services, Works, Shop, About, Contact. Services is intentionally
// inert for now (no destination page click-through yet) but reads visually
// identical to the other items — see Nav.jsx's `disabled` handling.
export const NAV = [
  { href: '/services/', label: 'Hizmetler', disabled: true },
  { href: '/work/', label: 'Çalışmalar' },
  { href: '/shop/', label: 'Mağaza' },
  { href: '/about/', label: 'Hakkında' },
  { href: '/contact/', label: 'İletişim' },
];

// Forced line breaks per studio feedback (2026-09-17) — always these 3 lines,
// at every viewport; only the font-size scales down responsively, the break
// points never move (see Hero.scss/TopplingPhysics.jsx).
export const HERO_LINES = [
  'Multidisipliner sanatçıların',
  'oyun alanı.',
  'Sürece açık, canlı bir stüdyo.',
];

export const MANIFESTO = [
  'SOFT TENSION LAB; SANAT, TASARIM VE KÜLTÜRÜN KESİŞİMİNDE YER ALAN BAĞIMSIZ BİR KREATİF STÜDYODUR. KAVRAMSAL DÜŞÜNCEYİ SOMUT GÖRSEL KİMLİKLERE DÖNÜŞTÜREREK, MARKALAR VE SANATÇILAR İÇİN ESTETİK DUVARLARI YIKIYORUZ.',
  'SÜRECE AÇIK, CANLI BİR STÜDYO OLARAK; SİSTEMATİK TASARIM İLE SANATSAL SEZGİ ARASINDAKİ GERİLİMDEN BESLENİYORUZ. HİKAYESİ OLAN, SAMİMİ VE BÜTÜNSEL DENEYİMLER YARATMAK İÇİN BİRLİKTE HAREKETE GEÇELİM.',
];

// The two lead lines from brand_guidelines.html §01 — used as the short copy
// blocks interspersed in the Home showcase.
export const LEAD_LINES = [
  'Multidisipliner sanatçıların oyun alanı; sürece açık, canlı bir stüdyo.',
  'Sistematik tasarım ile sanatsal sezgi arasındaki gerilimden besleniyor, markalar için samimi görsel hikayeler yaratıyoruz.',
];

// The seven services (long-form list on /services).
export const SERVICES = [
  'Marka Kimliği & Logo Sistemleri',
  'Tipografi',
  'İçerik Geliştirme',
  'Geleneksel & Dijital Sanat Entegrasyonu',
  'Editöryel & Baskılı Tasarım',
  'Kreatif Danışmanlık & Geleneksel Sanat Eğitimi',
  'Sanat Üretimi',
];

// Home services accordion (#hizmetler): one entry per SERVICES title, same order.
// `items` are the "/ " sub-lines (written in capitals in the data — CSS uppercase
// would turn the Turkish "i" into "I"), `copy` the one-sentence description.
export const SERVICE_DETAILS = [
  {
    items: ['LOGO SİSTEMLERİ', 'RENK & TİPOGRAFİ', 'MARKA KILAVUZU', 'UYGULAMA ÖRNEKLERİ'],
    copy: 'Bir markanın nasıl göründüğünü değil, nasıl hissettirdiğini tasarlıyoruz; tutarlı, tekrar edilebilir bir kimlik sistemi kuruyoruz.',
  },
  {
    items: ['ÖZEL YAZI SİSTEMLERİ', 'HARF FORMU ÇALIŞMASI', 'DİJİTAL & BASKI KULLANIMI'],
    copy: 'Tipografiyi süs değil, markanın sesi olarak ele alıyoruz.',
  },
  {
    items: ['METİN & SES TONU', 'SOSYAL İÇERİK', 'KAMPANYA DİLİ'],
    copy: 'Görselin arkasındaki dili kuruyoruz; markanın nasıl konuştuğunu tanımlıyoruz.',
  },
  {
    items: ['EL İŞÇİLİĞİ', 'DİJİTAL ÜRETİM', 'KARMA TEKNİK'],
    copy: 'Geleneksel tekniklerle dijital üretimi aynı çalışmada buluşturuyoruz.',
  },
  {
    items: ['YAYIN TASARIMI', 'SAYFA DÜZENİ', 'BASKI ÜRETİMİ'],
    copy: 'Basılı işi bir vitrin değil, kendi başına bir deneyim olarak tasarlıyoruz.',
  },
  {
    items: ['ATÖLYE & EĞİTİM', 'SANAT DANIŞMANLIĞI', 'SÜREÇ YÖNETİMİ'],
    copy: 'Stüdyonun birikimini atölyeler ve danışmanlıkla paylaşıyoruz.',
  },
  {
    items: ['ORİJİNAL ÜRETİM', 'SERGİ HAZIRLIĞI', 'SINIRLI ÜRETİM'],
    copy: 'Kendi sanat pratiğimizi sürdürüyor, stüdyonun sezgisini somutlaştırıyoruz.',
  },
];

// Home marquee band (design_architecture.html §01).
export const MARQUEE = [
  'Marka Kimliği & Logo Sistemleri',
  'Tipografi / İçerik Geliştirme',
  'Web Design',
  'Motion Design',
  'Geleneksel & Dijital Sanat Entegrasyonu',
  'Editöryel & Baskılı Tasarım',
  'Sanat Üretimi',
];

// About page minimal service row (design_architecture.html §A1).
export const SERVICE_TAGS = [
  'Marka Kimliği & Logo',
  'Tipografi & İçerik',
  'Web Design & Motion',
  'Geleneksel & Dijital Sanat',
  'Sanat Üretimi',
];

// Footer finale lines (design_architecture.html §03). Order and wording are literal.
export const FINALE_LINES = [
  { text: 'SOFT TENSION LAB', size: 'xl' },
  { text: 'Ömer & Cemre', size: 'md' },
  { text: 'Lead With Tension', size: 'md' },
  { text: 'Sanatsal Sezgi', size: 'md' },
  { text: 'Sistematik Tasarım', size: 'md' },
];

export const IS_HOLDING = process.env.NEXT_PUBLIC_HOLDING === '1';
