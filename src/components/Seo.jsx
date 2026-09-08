import Head from 'next/head';
import { SITE } from '../lib/site';

const ORG_ID = `${SITE.url}/#organization`;

// Organization + LocalBusiness for the studio. No street address or phone by design —
// the brief forbids location/phone anywhere on the site.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'LocalBusiness'],
      '@id': ORG_ID,
      name: SITE.name,
      alternateName: SITE.shortName,
      url: SITE.url,
      email: SITE.email,
      slogan: SITE.tagline,
      description: SITE.description,
      logo: `${SITE.url}/logos/logo-ana.svg`,
      image: `${SITE.url}${SITE.ogImage}`,
      founder: [
        { '@type': 'Person', name: 'Ömer' },
        { '@type': 'Person', name: 'Cemre' },
      ],
      sameAs: [SITE.instagram, SITE.behance],
      areaServed: 'TR',
      knowsAbout: [
        'Marka Kimliği',
        'Logo Sistemleri',
        'Tipografi',
        'İçerik Geliştirme',
        'Editöryel Tasarım',
        'Sanat Üretimi',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: 'tr',
      publisher: { '@id': ORG_ID },
    },
  ],
};

export default function Seo({ title, description = SITE.description, path = '/', image = SITE.ogImage, noindex = false }) {
  const fullTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — Sanat, tasarım ve kültürün kesişiminde bağımsız bir kreatif stüdyo`;
  const url = `${SITE.url}${path}`;
  const img = image.startsWith('http') ? image : `${SITE.url}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow,max-image-preview:large" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE.name} — ${SITE.tagline}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
    </Head>
  );
}
