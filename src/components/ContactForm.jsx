import { useState } from 'react';
import Button from './Button';
import { SITE } from '../lib/site';

const PROJECT_TYPES = [
  'Marka Kimliği & Logo Sistemleri',
  'Web Design',
  'Motion Design',
  'Tipografi / İçerik Geliştirme',
  'Editöryel & Baskılı Tasarım',
  'Sanat Üretimi',
  'Diğer',
];

/**
 * Custom-coded form in the Tally register: underlined fields, no boxes.
 * Adınız · E-posta · Proje Tipi · Bütçe Aralığı (+ optional message).
 *
 * The site is a static export, so submit composes a mailto: to the studio inbox with the
 * answers in the body. Swap `onSubmit` for a Formspree/Tally endpoint when one exists —
 * the markup and validation do not change.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const next = {};
    if (!data.name?.trim()) next.name = 'Adınızı yazın.';
    if (!data.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) next.email = 'Geçerli bir e-posta adresi girin.';
    if (!data.type) next.type = 'Bir proje tipi seçin.';
    if (!data.budget?.trim()) next.budget = 'Bütçe aralığınızı yazın.';
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector('[aria-invalid="true"], .is-invalid input, .is-invalid select');
      first?.focus();
      return;
    }
    const subject = encodeURIComponent(`Proje talebi — ${data.name}`);
    const body = encodeURIComponent(
      `Adınız: ${data.name}\nE-posta: ${data.email}\nProje tipi: ${data.type}\nBütçe aralığı: ${data.budget}\n\n${data.message || ''}`.trim()
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="cform cform--done" role="status" aria-live="polite">
        <p className="cform__done-title">Teşekkürler.</p>
        <p className="cform__done-copy">
          E-posta uygulamanızda hazırlanan mesajı gönderdiğinizde en kısa sürede dönüş yapacağız. Açılmadıysa doğrudan yazın:{' '}
          <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    );
  }

  const field = (id, label, control, hint) => (
    <div className={`cform__field ${errors[id] ? 'is-invalid' : ''}`.trim()}>
      {control}
      <label htmlFor={`cf-${id}`} className="cform__label">{label} <span aria-hidden="true">*</span></label>
      {errors[id] ? <p id={`cf-${id}-err`} className="cform__error" role="alert">{errors[id]}</p> : hint ? <p id={`cf-${id}-hint`} className="cform__hint">{hint}</p> : null}
    </div>
  );

  return (
    <form className="cform" onSubmit={onSubmit} noValidate>
      <p className="label cform__kicker">Proje talebi</p>

      {field('name', 'Adınız',
        <input id="cf-name" name="name" type="text" autoComplete="name" placeholder=" " required aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} />
      )}
      {field('email', 'E-posta',
        <input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder=" " required aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} />
      )}
      {field('type', 'Proje Tipi',
        <select id="cf-type" name="type" defaultValue="" required aria-required="true" aria-invalid={!!errors.type} aria-describedby={errors.type ? 'cf-type-err' : 'cf-type-hint'}>
          <option value="" disabled>Seçin</option>
          {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>,
        'Marka Kimliği, Web Design, Motion vs.'
      )}
      {field('budget', 'Bütçe Aralığı',
        <input id="cf-budget" name="budget" type="text" inputMode="text" placeholder=" " required aria-required="true" aria-invalid={!!errors.budget} aria-describedby={errors.budget ? 'cf-budget-err' : undefined} />
      )}

      <div className="cform__field cform__field--textarea">
        <textarea id="cf-message" name="message" rows={3} placeholder=" " />
        <label htmlFor="cf-message" className="cform__label">Kısaca projeniz <span className="cform__opt">(isteğe bağlı)</span></label>
      </div>

      <div className="cform__actions">
        <Button type="submit" surface="solid" arrow={null}>Gönder</Button>
      </div>
    </form>
  );
}
