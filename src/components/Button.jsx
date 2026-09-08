import Link from 'next/link';
import GlassCard from './GlassCard';

/**
 * The pill CTA. Three surfaces, one shape:
 *   glass   — liquid glass; only where it sits on imagery or a dark scene
 *   outline — hairline pill on flat Paper (glass has nothing to refract there)
 *   solid   — solid Ink pill (the form submit)
 * Hover turns the text Signal (brand_guidelines.html §05) and shifts the arrow 4px.
 */
export default function Button({ href, surface = 'outline', arrow = '↗', children, className = '', type, onClick, ...rest }) {
  const label = (
    <>
      <span className="btn__label">{children}</span>
      {arrow ? <span className="btn__arrow" aria-hidden="true">{arrow}</span> : null}
    </>
  );

  const cls = `btn btn--${surface} ${className}`.trim();

  if (surface === 'glass') {
    const Tag = href ? Link : 'button';
    const props = href ? { href } : { type: type || 'button', onClick };
    return (
      <GlassCard as={Tag} variant="frost" refraction="chip" radius="pill" className={cls} contentClassName="btn__inner" {...props} {...rest}>
        {label}
      </GlassCard>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        <span className="btn__inner">{label}</span>
      </Link>
    );
  }
  return (
    <button type={type || 'button'} className={cls} onClick={onClick} {...rest}>
      <span className="btn__inner">{label}</span>
    </button>
  );
}
