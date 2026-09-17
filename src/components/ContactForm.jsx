import { useRef, useState } from 'react';
import Button from './Button';
import Select from './Select';
import { SITE } from '../lib/site';

const PROJECT_TYPES = [
  'Logo tasarımı',
  'Marka kimlik sistemi',
  'Marka yenileme (rebranding)',
  'Sunum / pitch deck tasarımı',
  'Diğer',
];

const TIMELINES = ['1 Aydan önce', '1 Ay', '2 Ay', '3+ Ay', 'Esnek, acele değil'];

const BUDGETS = ['₺10.000 – ₺20.000', '₺20.000 – ₺40.000', '₺40.000 – ₺80.000', '₺80.000+', 'Henüz bilmiyorum'];

const PRIOR_DESIGN = ['Hayır, ilk kez', 'Evet, iyi geçti', 'Evet, tatmin olmadım'];

const DECISION_MAKERS = [
  'Ben tek karar vericiyim',
  'Bir ortak veya ekiple birlikte karar veriyorum',
  'Üst yönetime / yönetim kuruluna onaylattırmam gerekiyor',
];

const EMPTY_VALUES = {
  name: '', company: '', email: '', phone: '', projectType: '', sector: '',
  projectDescription: '', timeline: '', budget: '', priorDesign: '', decisionMaker: '', extra: '',
};

// Messages only for the required fields — company/sector/extra stay optional.
const VALIDATORS = {
  name: (v) => (v.trim() ? null : 'Adınızı soyadınızı yazın.'),
  email: (v) => (v.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : 'Geçerli bir e-posta adresi girin.'),
  phone: (v) => (v.trim() ? null : 'Telefon numaranızı yazın.'),
  projectType: (v) => (v ? null : 'Bir proje türü seçin.'),
  projectDescription: (v) => (v.trim() ? null : 'Projeyi kısaca anlatın.'),
  timeline: (v) => (v ? null : 'Hedef teslim tarihini seçin.'),
  budget: (v) => (v ? null : 'Bütçe aralığınızı seçin.'),
  priorDesign: (v) => (v ? null : 'Bir seçenek işaretleyin.'),
  decisionMaker: (v) => (v ? null : 'Bir seçenek işaretleyin.'),
};

const REQUIRED_IDS = Object.keys(VALIDATORS);

/**
 * Custom-coded form matching the studio's Tally question set 1:1
 * (tally.so/r/LZ5Qlp) in the site's underlined-field register.
 *
 * The site is a static export (no API routes), so submit posts straight to the
 * Web3Forms API from the client — the access key is public by design (it only
 * ever delivers to the inbox it was issued for; NEXT_PUBLIC_WEB3FORMS_KEY must
 * be set in .env.local).
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const honeypotRef = useRef(null);

  const setFieldError = (id, msg) => {
    setErrors((prev) => {
      if (!msg) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: msg };
    });
  };

  const setValue = (id, v) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    // Once a field has shown an error, keep it live so a fix clears immediately.
    setErrors((prev) => {
      if (!(id in prev) || !VALIDATORS[id]) return prev;
      const msg = VALIDATORS[id](v);
      if (!msg) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: msg };
    });
  };

  // A field only turns visibly invalid once the user leaves it — not while
  // they're still typing into it for the first time.
  const onFieldBlur = (id) => () => {
    const validate = VALIDATORS[id];
    if (!validate) return;
    setFieldError(id, validate(values[id]));
  };

  const isValid = REQUIRED_IDS.every((id) => !VALIDATORS[id](values[id]));

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    REQUIRED_IDS.forEach((id) => {
      const msg = VALIDATORS[id](values[id]);
      if (msg) next[id] = msg;
    });
    setErrors(next);
    if (Object.keys(next).length) {
      const firstId = REQUIRED_IDS.find((id) => next[id]);
      document.getElementById(`cf-${firstId}`)?.focus();
      return;
    }

    // Honeypot: bots fill hidden fields, people never see this one. Pretend
    // success without actually sending, so scripts don't learn it failed.
    if (honeypotRef.current?.checked) {
      setSent(true);
      return;
    }

    setSending(true);
    setSubmitError(false);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `Proje talebi — ${values.name}`,
          from_name: 'Soft Tension Lab — İletişim Formu',
          email: values.email,
          botcheck: false,
          'Ad Soyad': values.name,
          'Şirket / Marka Adı': values.company.trim() || undefined,
          'Telefon': values.phone,
          'Proje türü': values.projectType,
          'Sektör': values.sector.trim() || undefined,
          'Projeyi kısaca anlatın': values.projectDescription,
          'Hedef teslim tarihi': values.timeline,
          'Bütçe aralığı': values.budget,
          'Daha önce profesyonel tasarım hizmeti aldınız mı': values.priorDesign,
          'Karar verici kim': values.decisionMaker,
          'Eklemek istediği bir şey': values.extra.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="cform cform--done" role="status" aria-live="polite">
        <p className="cform__done-title">Teşekkürler.</p>
        <p className="cform__done-copy">
          Mesajınız iletildi, en kısa sürede dönüş yapacağız. Acil bir konu varsa doğrudan yazın:{' '}
          <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    );
  }

  const field = (id, label, control, { hint, marker = true } = {}) => (
    <div className={`cform__field ${errors[id] ? 'is-invalid' : ''}`.trim()}>
      {control}
      <label htmlFor={`cf-${id}`} className="cform__label">
        {label}{marker ? <span aria-hidden="true"> *</span> : null}
      </label>
      {errors[id] ? <p id={`cf-${id}-err`} className="cform__error" role="alert">{errors[id]}</p> : hint ? <p id={`cf-${id}-hint`} className="cform__hint">{hint}</p> : null}
    </div>
  );

  const select = (id, options, hintId) => (
    <Select
      id={`cf-${id}`}
      options={options}
      value={values[id]}
      onChange={(v) => setValue(id, v)}
      onBlur={onFieldBlur(id)}
      required
      invalid={!!errors[id]}
      describedBy={errors[id] ? `cf-${id}-err` : hintId}
    />
  );

  const text = (id, type, extra = {}) => (
    <input
      id={`cf-${id}`}
      name={id}
      type={type}
      placeholder=" "
      value={values[id]}
      onChange={(e) => setValue(id, e.target.value)}
      onBlur={onFieldBlur(id)}
      aria-invalid={!!errors[id]}
      aria-describedby={errors[id] ? `cf-${id}-err` : undefined}
      {...extra}
    />
  );

  return (
    <form className="cform" onSubmit={onSubmit} noValidate>
      <input
        ref={honeypotRef}
        type="checkbox"
        name="botcheck"
        className="cform__honeypot"
        tabIndex="-1"
        autoComplete="off"
        aria-hidden="true"
      />

      <p className="cform__section">İletişim bilgileri</p>
      {field('name', 'Ad Soyad', text('name', 'text', { autoComplete: 'name', required: true, 'aria-required': true }))}
      {field('company', 'Şirket / Marka Adı',
        <input id="cf-company" name="company" type="text" autoComplete="organization" placeholder=" " value={values.company} onChange={(e) => setValue('company', e.target.value)} />,
        { marker: false }
      )}
      {field('email', 'E-posta', text('email', 'email', { autoComplete: 'email', inputMode: 'email', required: true, 'aria-required': true }))}
      {field('phone', 'Telefon', text('phone', 'tel', { autoComplete: 'tel', inputMode: 'tel', required: true, 'aria-required': true }))}

      <p className="cform__section">Proje hakkında</p>
      {field('projectType', 'Proje türü', select('projectType', PROJECT_TYPES))}
      {field('sector', 'Sektör',
        <input id="cf-sector" name="sector" type="text" placeholder=" " value={values.sector} onChange={(e) => setValue('sector', e.target.value)} />,
        { marker: false }
      )}
      {field('projectDescription', 'Projeyi kısaca anlatın',
        <textarea
          id="cf-projectDescription" name="projectDescription" rows={3} placeholder=" "
          value={values.projectDescription}
          onChange={(e) => setValue('projectDescription', e.target.value)}
          onBlur={onFieldBlur('projectDescription')}
          required aria-required="true"
          aria-invalid={!!errors.projectDescription}
          aria-describedby={errors.projectDescription ? 'cf-projectDescription-err' : 'cf-projectDescription-hint'}
        />,
        { hint: 'Ne kadar net yazarsan o kadar iyi bir teklif hazırlarız.' }
      )}

      <p className="cform__section">Zaman ve bütçe</p>
      {field('timeline', 'Hedef teslim tarihi', select('timeline', TIMELINES))}
      {field('budget', 'Bütçe aralığı', select('budget', BUDGETS))}

      <p className="cform__section">Son sorular</p>
      {field('priorDesign', 'Daha önce profesyonel tasarım hizmeti aldınız mı?', select('priorDesign', PRIOR_DESIGN))}
      {field('decisionMaker', 'Karar verici kim?',
        select('decisionMaker', DECISION_MAKERS, 'cf-decisionMaker-hint'),
        { hint: 'Bu, süreç planlaması için önemli.' }
      )}
      {field('extra', 'Eklemek istediğin bir şey var mı?',
        <textarea id="cf-extra" name="extra" rows={3} placeholder=" " value={values.extra} onChange={(e) => setValue('extra', e.target.value)} />,
        { marker: false }
      )}

      <div className="cform__actions">
        <Button type="submit" surface="glass" arrow={null} disabled={!isValid || sending}>
          {sending ? 'Gönderiliyor…' : 'Gönder'}
        </Button>
        {submitError ? (
          <p className="cform__error cform__error--submit" role="alert">
            Bir sorun oluştu, lütfen tekrar deneyin. Devam ederse doğrudan yazın:{' '}
            <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        ) : null}
      </div>
    </form>
  );
}
