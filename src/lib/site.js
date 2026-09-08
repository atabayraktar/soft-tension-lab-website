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
  founders: 'Ömer & Cemre',
  tagline: 'Lead With Tension',
  locale: 'tr_TR',
  description:
    'Soft Tension Lab; sanat, tasarım ve kültürün kesişiminde yer alan bağımsız bir kreatif stüdyodur. Multidisipliner sanatçıların oyun alanı; sürece açık, canlı bir stüdyo.',
  ogImage: '/og.png',
};

// Nav is exactly these four items (design_architecture.html, NİHAİ). /services is
// a secondary page linked from About and the footer — never a nav item.
export const NAV = [
  { href: '/about/', label: 'About' },
  { href: '/work/', label: 'Works' },
  { href: '/contact/', label: 'Contact' },
  { href: '/shop/', label: 'Shop' },
];

export const HERO_LINE = 'Multidisipliner sanatçıların oyun alanı. Sürece açık, canlı bir stüdyo.';

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
