import Seo, { WEBSITE_ID } from '../components/Seo';
import ContactForm from '../components/ContactForm';
import SocialLinks from '../components/SocialLinks';
import { SITE } from '../lib/site';

const CONTACT_URL = `${SITE.url}/contact/`;
const CONTACT_JSON_LD = [
  {
    '@type': 'ContactPage',
    '@id': `${CONTACT_URL}#contactpage`,
    url: CONTACT_URL,
    name: `Contact — ${SITE.name}`,
    inLanguage: 'tr',
    isPartOf: { '@id': WEBSITE_ID },
  },
];

// Contact: headline, socials, then the Tally-register form — that order on
// every breakpoint. On wide screens the headline + socials sit in a left
// column beside the form (mail/Instagram/Behance/YouTube/TikTok as icons
// only — no location, no phone, by design).
export default function Contact() {
  return (
    <main id="main" className="page contact">
      <Seo title="Contact" description="Hadi tanışalım. hello@softtensionlab.com — proje talebi formu." path="/contact/" jsonLd={CONTACT_JSON_LD} />
      <div className="contact__split wrap">
        <div className="contact__left">
          <section className="contact__title-block" aria-labelledby="contact-title">
            <h1 id="contact-title" className="contact__title">
              <span className="mask mask--1"><span>Hadi</span></span>
              <span className="mask mask--2"><span>Tanışalım.</span></span>
            </h1>
          </section>

          <div className="contact__social-block" data-reveal>
            <SocialLinks className="contact__social" />
          </div>
        </div>

        <section className="contact__right" aria-label="Proje talebi formu" data-reveal>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
