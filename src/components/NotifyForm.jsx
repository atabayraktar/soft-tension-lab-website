import { useRef, useState } from 'react';
import Button from './Button';
import { SITE } from '../lib/site';

const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

// What each placement says, and what lands in the studio inbox.
const TOPICS = {
  shop: {
    title: 'Shop henüz açılmadı.',
    copy: 'E-postanı bırak, açıldığı gün haber verelim.',
    doneTitle: 'Tamamdır.',
    doneCopy: 'Shop açıldığında bu adrese haber vereceğiz.',
    button: 'Haber Ver',
    subject: 'Shop bekleme listesi',
    fromName: 'Soft Tension Lab — Shop Bekleme Listesi',
    message: (mail) => `${mail} adresi shop'un açılmasını bekliyor. Shop açıldığında haber verilmesini istiyor.`,
    source: '/shop/',
  },
  news: {
    title: 'Bizden haberdar ol.',
    copy: 'Yeni işler, stüdyodan notlar, açılışlar. E-postanı bırak, yazalım.',
    doneTitle: 'Tamamdır.',
    doneCopy: 'Yeni bir şey olduğunda bu adrese yazacağız.',
    button: 'Haber Ver',
    subject: 'Haber listesi',
    fromName: 'Soft Tension Lab — Haber Listesi',
    message: (mail) => `${mail} adresi Soft Tension Lab'dan haberdar olmak istiyor.`,
    source: '/',
  },
  comingsoon: {
    title: 'Yine de bize ulaşabilirsiniz.',
    copy: 'E-postanı bırak, yayına geçtiğimizde\nilk sen haberdar ol.',
    doneTitle: 'Tamamdır.',
    doneCopy: 'Yayına geçtiğimizde bu adrese haber vereceğiz.',
    button: 'Haber Ver',
    subject: 'Yakında sayfası bekleme listesi',
    fromName: 'Soft Tension Lab — Yakında Bekleme Listesi',
    message: (mail) => `${mail} adresi yakında sayfasının yayına geçmesini bekliyor.`,
    source: '/comingsoon/',
  },
};

/**
 * "E-postanı bırak" box. The static export has no API routes, so — like ContactForm — it
 * posts to Web3Forms from the client. The mail lands in the studio inbox with reply-to =
 * the visitor, which is the waiting list.
 *
 *   topic   — 'shop' (Shop coming-soon) · 'news' (general "stay in the loop")
 *   variant — 'page' (Paper page, left-aligned row) · 'finale' (black footer finale:
 *             centred, light type, smaller — plain text, no effect)
 */
export default function NotifyForm({ topic = 'shop', variant = 'page' }) {
  const t = TOPICS[topic] || TOPICS.shop;
  const finale = variant === 'finale';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const honeypotRef = useRef(null);
  const cls = `notify${finale ? ' notify--finale' : ''}`;

  const onChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      document.getElementById(`nf-email-${topic}`)?.focus();
      return;
    }

    // Honeypot: bots fill the hidden checkbox — pretend success, send nothing.
    if (honeypotRef.current?.checked) {
      setSent(true);
      return;
    }

    setSending(true);
    setError('');
    try {
      const mail = email.trim();
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `${t.subject} — ${mail}`,
          from_name: t.fromName,
          email: mail,
          botcheck: false,
          'Mesaj': t.message(mail),
          'E-posta': mail,
          'Kaynak': `${SITE.url}${t.source}`,
        }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError('Bir sorun oluştu, lütfen tekrar deneyin.');
    } catch {
      setError('Bir sorun oluştu, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className={`${cls} notify--done`} role="status" aria-live="polite">
        <p className="notify__title">{t.doneTitle}</p>
        <p className="notify__copy">{t.doneCopy}</p>
      </div>
    );
  }

  const titleId = `nf-title-${topic}`;
  return (
    <form className={cls} onSubmit={onSubmit} noValidate aria-labelledby={titleId}>
      <input
        ref={honeypotRef}
        type="checkbox"
        name="botcheck"
        className="notify__honeypot"
        tabIndex="-1"
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="notify__text">
        <p id={titleId} className="notify__title">{t.title}</p>
        <p className="notify__copy">{t.copy}</p>
      </div>

      <div className={`cform__field notify__field ${error ? 'is-invalid' : ''}`.trim()}>
        <input
          id={`nf-email-${topic}`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder=" "
          value={email}
          onChange={onChange}
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? `nf-err-${topic}` : undefined}
        />
        <label htmlFor={`nf-email-${topic}`} className="cform__label">E-posta</label>
        {error ? <p id={`nf-err-${topic}`} className="cform__error notify__error" role="alert">{error}</p> : null}
      </div>

      <Button type="submit" surface="glass" arrow={null} disabled={sending}>
        {sending ? 'Gönderiliyor…' : t.button}
      </Button>
    </form>
  );
}
