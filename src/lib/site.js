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

// Nav order: Services, Works, Shop, About, Contact. Services is an in-page
// target: it scrolls to the Home services section (#hizmetler) — smoothly when
// already on Home, otherwise Home is loaded first (see Nav.jsx `scroll`).
// `labelUpper` is what the bar and the menu sheet render — written in capitals in
// the data, like HERO_LINES: CSS uppercase turns the Turkish "i" into "I" in
// browsers that don't apply locale casing (Instagram's in-app browser does this).
export const SERVICES_ID = 'hizmetler';
export const NAV = [
  { href: `/#${SERVICES_ID}`, label: 'Hizmetler', labelUpper: 'HİZMETLER', scroll: SERVICES_ID },
  { href: '/work/', label: 'Çalışmalar', labelUpper: 'ÇALIŞMALAR' },
  { href: '/shop/', label: 'Mağaza', labelUpper: 'MAĞAZA' },
  { href: '/about/', label: 'Hakkında', labelUpper: 'HAKKINDA' },
  { href: '/contact/', label: 'İletişim', labelUpper: 'İLETİŞİM' },
];

// Forced line breaks per studio feedback (2026-09-17) — always these 3 lines,
// at every viewport; only the font-size scales down responsively, the break
// points never move (see Hero.scss/TopplingText.jsx). Written in capitals in the
// data, like MANIFESTO — CSS uppercase would turn the Turkish "i" into "I".
export const HERO_LINES = [
  'MULTİDİSİPLİNER SANATÇILARIN',
  'OYUN ALANI.',
  'SÜRECE AÇIK, CANLI BİR STÜDYO.',
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
    copy: 'Bir markanın nasıl göründüğünü değil, nasıl hissettirdiğini tasarlıyoruz; tutarlı, tekrar edilebilir bir kimlik sistemi kuruyoruz. Markayı ve hedefini konuşarak başlıyor, eskizlerden ve ara durumlardan birlikte geçiyoruz. Sonunda logo, renk ve tipografiyi bir araya getiren, uygulanabilir bir marka kılavuzu teslim ediyoruz.',
  },
  {
    items: ['ÖZEL YAZI SİSTEMLERİ', 'HARF FORMU ÇALIŞMASI', 'DİJİTAL & BASKI KULLANIMI'],
    copy: 'Tipografiyi süs değil, markanın sesi olarak ele alıyoruz. Harf formlarını markanın karakterine göre çiziyor, ekranda ve baskıda nasıl davranacağını birlikte deniyoruz. Teslimde kullanım kuralları belli, dijitale ve kâğıda hazır bir yazı sistemi bırakıyoruz.',
  },
  {
    items: ['METİN & SES TONU', 'SOSYAL İÇERİK', 'KAMPANYA DİLİ'],
    copy: 'Görselin arkasındaki dili kuruyoruz; markanın nasıl konuştuğunu tanımlıyoruz. Ses tonunu birlikte belirliyor, sosyal içerikten kampanya diline aynı sesi taşıyoruz. Elinize geçen şey tek seferlik metin değil, sonrasında kendi başınıza yazabileceğiniz bir dil kılavuzu.',
  },
  {
    items: ['EL İŞÇİLİĞİ', 'DİJİTAL ÜRETİM', 'KARMA TEKNİK'],
    copy: 'Geleneksel tekniklerle dijital üretimi aynı çalışmada buluşturuyoruz. Elle üretilen doku, baskı ya da çizim dijital ortamda işleniyor; hangi katmanın nerede kalacağına işin ihtiyacına göre karar veriyoruz. Ortaya çıkan iş hem basılabilir hem ekranda yaşayabilir halde teslim ediliyor.',
  },
  {
    items: ['YAYIN TASARIMI', 'SAYFA DÜZENİ', 'BASKI ÜRETİMİ'],
    copy: 'Basılı işi bir vitrin değil, kendi başına bir deneyim olarak tasarlıyoruz. Kâğıdı, formatı ve sayfa düzenini içerikle birlikte kuruyor, baskı öncesi provaları sizinle birlikte kontrol ediyoruz. Baskıya hazır dosyaları, matbaayla konuşulmuş teknik notlarla birlikte teslim ediyoruz.',
  },
  {
    items: ['ATÖLYE & EĞİTİM', 'SANAT DANIŞMANLIĞI', 'SÜREÇ YÖNETİMİ'],
    copy: 'Stüdyonun birikimini atölyeler ve danışmanlıkla paylaşıyoruz. Atölyelerde geleneksel teknikleri küçük gruplarla, elle çalışarak öğretiyoruz; danışmanlıkta ise süren bir projenin sanat yönünü birlikte netleştiriyoruz. Süre ve içerik ihtiyaca göre şekilleniyor.',
  },
  {
    items: ['ORİJİNAL ÜRETİM', 'SERGİ HAZIRLIĞI', 'SINIRLI ÜRETİM'],
    copy: 'Kendi sanat pratiğimizi sürdürüyor, stüdyonun sezgisini somutlaştırıyoruz. Orijinal işler, sergi hazırlığı ve sınırlı sayıda üretimler bu pratiğin içinden çıkıyor. Bir iş ya da iş birliği için yazdığınızda süreci ve takvimi birlikte planlıyoruz.',
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
