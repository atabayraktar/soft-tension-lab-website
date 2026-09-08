import Seo from '../components/Seo';
import ContactForm from '../components/ContactForm';
import { SITE } from '../lib/site';

// Contact: split screen. Left — the headline, email, Instagram, Behance. Nothing else.
// Right — the custom Tally-register form. No location, no phone, by design.
export default function Contact() {
  return (
    <main id="main" className="page contact">
      <Seo title="Contact" description="Hadi tanışalım. hello@softtensionlab.com — proje talebi formu." path="/contact/" />
      <div className="contact__split wrap">
        <section className="contact__left" aria-labelledby="contact-title">
          <h1 id="contact-title" className="contact__title">
            <span className="mask mask--1"><span>Hadi</span></span>
            <span className="mask mask--2"><span>Tanışalım.</span></span>
          </h1>
          <ul className="contact__links" data-reveal>
            <li><a className="contact__mail link" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li><a className="link contact__social" href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram <span className="link__arrow" aria-hidden="true">↗</span></a></li>
            <li><a className="link contact__social" href={SITE.behance} target="_blank" rel="noopener noreferrer">Behance <span className="link__arrow" aria-hidden="true">↗</span></a></li>
          </ul>
        </section>

        <section className="contact__right" aria-label="Proje talebi formu" data-reveal>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
