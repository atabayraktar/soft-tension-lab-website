// Single source of truth for studio facts and copy that repeats across pages.
// Copy is inherited from the brief / existing site — never paraphrase it here.

export const SITE = {
  name: 'SOFT TENSION LAB',
  shortName: 'STL',
  url: 'https://softtensionlab.com',
  email: 'hello@softtensionlab.com',
  instagram: 'https://www.instagram.com/softtensionlab',
  instagramHandle: '@softtensionlab',
  behance: 'https://www.behance.net/softtensionlab',
  youtube: 'https://www.youtube.com/@SOFTTENSIONLAB',
  tiktok: 'https://www.tiktok.com/@softtensionlab',
  founders: 'Ömer & Cemre',
  tagline: 'Lead With Tension',
  locale: 'tr_TR',
  description:
    'SOFT TENSION LAB; sanat, tasarım ve kültürün kesişiminde yer alan bağımsız bir kreatif stüdyodur. Multidisipliner sanatçıların oyun alanı; sürece açık, canlı bir stüdyo.',
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
  'SOFT TENSION LAB; SANAT, TASARIM VE KÜLTÜRÜN KESİŞİMİNDE YER ALAN BAĞIMSIZ BİR KREATİF STÜDYODUR. KAVRAMSAL DÜŞÜNCEYİ SOMUT GÖRSEL KİMLİKLERE DÖNÜŞTÜRÜYOR; MARKALAR VE SANATÇILAR İÇİN ÖZGÜN, YAŞAYAN SİSTEMLER KURUYORUZ.',
  'SÜRECE AÇIK, CANLI BİR STÜDYO OLARAK; SİSTEMATİK TASARIM İLE SANATSAL SEZGİ ARASINDAKİ GERİLİMDEN BESLENİYORUZ. HİKAYESİ OLAN, SAMİMİ VE BÜTÜNSEL İŞLER ORTAYA KOYMAK İÇİN SÜRECİ BAŞTAN SONA BİRLİKTE KURGULUYORUZ.',
];

// About page team cluster (§ team, five cards) — this exact order. `bio` is the
// paragraph shown in the card's expanded view (TeamModal); verbatim studio copy.
export const TEAM = [
  {
    name: 'Cemre Ece Kurtman',
    role: 'Kurucu Ortak / Ressam & İllüstratör',
    bio: 'Tuval, kâğıt ve fiziksel üretim teknikleriyle projelere organik dokunuşlar katıyor. Stüdyonun "sanatsal sezgi" tarafını ve bağımsız üretim pratiğini yönlendiriyor.',
  },
  {
    name: 'Ömer Akbaş',
    role: 'Kurucu Ortak / Marka Kimliği & Tasarım Sistemleri',
    bio: 'Markaların görsel dünyalarını mimari bir titizlikle inşa ediyor. Logo sistemlerini ve marka kılavuzlarını kurgulayarak, stüdyonun o "sistematik tasarım" aklını temsil ediyor.',
  },
  {
    name: 'Celal Karakuş',
    role: 'Motion Design & Ses Tasarımı',
    bio: 'Statik tasarımları ve markanın sesini ekranda harekete geçiriyor. İşin kurgusunu, hareketli grafiklerini ve işitsel dünyasını tasarlayarak projelerin dinamik ritmini belirliyor.',
  },
  {
    name: 'Ata Bayraktar',
    role: 'Web Tasarımı & Arayüz',
    bio: 'Kimliği dijital dünyaya taşıyor, markanın ekrandaki yaşam alanını kodlar ve piksellerle kuruyor. Görselin arkasında pürüzsüz çalışan, temiz arayüzler ve web mimarileri tasarlıyor.',
  },
  {
    name: 'Atike & Çocuk',
    role: 'Duygusal Destek',
    bio: 'Stüdyonun en yoğun anlarında sürece doğrudan müdahale ederek stresi sıfırlıyorlar. Ekran önünde uyuyarak veya kritik anlarda klavyeye basarak ekibi dengede tutuyorlar.',
  },
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
  'Tipografi & Editöryel Tasarım',
  'Sanat Üretimi',
  'Geleneksel & Dijital Sanat Entegrasyonu',
  'Web Tasarımı & Arayüz',
  'Motion Design',
  'Kreatif Danışmanlık & Geleneksel Sanat Eğitimi',
];

// Home services accordion (#hizmetler): one entry per SERVICES title, same order.
// `items` are the "/ " sub-lines (written in capitals in the data — CSS uppercase
// would turn the Turkish "i" into "I"), `copy` the one-sentence description.
export const SERVICE_DETAILS = [
  {
    items: ['LOGO SİSTEMLERİ', 'RENK & TİPOGRAFİ', 'MARKA KILAVUZU', 'UYGULAMA ÖRNEKLERİ'],
    copy: 'Bir markanın sadece nasıl göründüğünü değil, nasıl hissettirdiğini tasarlıyor; tutarlı ve sürdürülebilir bir kimlik sistemi kuruyoruz. Markanızın hedeflerini dinliyor, eskizlerden son rötuşlara kadar süreci birlikte yönetiyoruz. Sonuç olarak; logo, renk paleti ve tipografinin uyum içinde çalıştığı, uygulanabilir bir marka kılavuzu teslim ediyoruz.',
  },
  {
    items: ['ÖZEL YAZI SİSTEMLERİ', 'HARF FORMU ÇALIŞMASI', 'YAYIN VE SAYFA TASARIMI', 'BASKI ÜRETİMİ'],
    copy: 'Harfleri ve kâğıdı, markanın dokunsal ve görsel sesi olarak konumlandırıyoruz. İhtiyaca özel harf formları şekillendiriyor; bu yazı sistemlerinin yayın ve sayfa tasarımlarında nasıl davranacağını kurguluyoruz. Sonuç olarak; hem dijital dünyada tutarlı çalışan özel bir yazı sistemi hem de matbaaya gitmeye hazır, okuma akışı tasarlanmış basılı işler teslim ediyoruz.',
  },
  {
    items: ['ORİJİNAL ÜRETİM', 'SERGİ HAZIRLIĞI', 'SINIRLI ÜRETİM'],
    copy: 'Kendi bağımsız sanat pratiğimizi sürdürüyor, stüdyonun yaratıcı sezgilerini somutlaştırıyoruz. Orijinal işler, sergi hazırlıkları ve sınırlı edisyon üretimler bu pratiğin içinden çıkıyor. Özel bir eser siparişi ya da sanat odaklı bir iş birliği istediğinizde, süreci ve takvimi birlikte planlıyoruz. Sonuç olarak; alanınıza veya projenize özel bağımsız sanat eserleri teslim ediyoruz.',
  },
  {
    items: ['EL İŞÇİLİĞİ', 'DİJİTAL ÜRETİM', 'KARMA TEKNİK'],
    copy: 'Geleneksel tekniklerle dijital üretimi aynı çalışmada buluşturuyoruz. Elle üretilen doku, baskı ya da çizimi dijital ortama taşıyor; hangi katmanın nerede kalacağına işin ihtiyacına göre karar veriyoruz. Sonuç olarak; sadece kâğıt üzerinde kalmayan, hem basılabilir hem de ekranlarda yaşayabilen işler teslim ediyoruz.',
  },
  {
    items: ['SİTE MİMARİSİ', 'ARAYÜZ TASARIMI', 'İNTERAKTİF TİPOGRAFİ'],
    copy: 'Markanın dijitaldeki yaşam alanını baştan inşa ediyoruz. Sayfa mimarisini ve ziyaretçinin yolculuğunu kurguluyor; interaktif tipografi ve görsellerle arayüzü şekillendiriyoruz. Sadece durağan bir görünüme değil, sitenin ekranda nasıl hareket ettiğine ve nasıl tepki verdiğine odaklanıyoruz. Sonuç olarak; ziyaretçiyi yormayan, markanın karakterini net bir şekilde yansıtan ve pürüzsüz çalışan web arayüzleri teslim ediyoruz.',
  },
  {
    items: ['HAREKETLİ GRAFİK', 'KURGU', 'MÜZİK & SES TASARIMI'],
    copy: 'Statik tasarımları harekete geçiriyor, görsel hikayeleri profesyonel kurguyla şekillendiriyoruz. Hareketli grafiklerle projelere dinamizm katarken, işin duygu dünyasını müzik ve ses tasarımıyla tamamlıyoruz. Sonuç olarak; hem görsel hem de işitsel detayları incelikle işlenmiş, markanın ritmine uygun dinamik videolar teslim ediyoruz.',
  },
  {
    items: ['ATÖLYE & EĞİTİM', 'SANAT DANIŞMANLIĞI', 'SÜREÇ YÖNETİMİ'],
    copy: 'Stüdyonun birikimini atölyeler ve danışmanlıkla paylaşıyoruz. Atölyelerde geleneksel teknikleri küçük gruplarla, elle çalışarak öğretiyoruz; danışmanlık tarafında ise süren bir projenin, yeni kurulan bir yaratıcı alanın ya da inşası başlayan bağımsız bir kimliğin sanat yönünü birlikte netleştiriyoruz. İşin arkasındaki dili ve süreç yönetimini tamamen ihtiyaca göre şekillendiriyoruz. Sonuç olarak; kendi yolunu çizenlere özel, net ve uygulanabilir bir yol haritası teslim ediyoruz.',
  },
];

// Home marquee band (design_architecture.html §01) — same seven services, same order.
export const MARQUEE = SERVICES;

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
