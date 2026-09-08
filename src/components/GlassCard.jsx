import { useCallback, useRef } from 'react';

/**
 * The single owner of the four-layer liquid-glass markup.
 *
 *   01 effect  — blur + SVG refraction (the physics)
 *   02 tint    — one translucent colour; the ONLY thing a variant changes
 *   03 shine   — ten stacked inset shadows (the thickness) + cursor-following edge light
 *   04 content — never filtered, never blurred
 *
 * variant:    'frost' (nav, cards, forms) · 'clear' (captions, HUD) · 'tint' (dark scenes, veil)
 * refraction: 'chip' 120 · 'nav' 90 · 'card' 70 · 'veil' 40  — matches the surface size
 * radius:     'pill' (nav, buttons, tags) · 'small' (everything else). Nothing in between.
 */
export default function GlassCard({
  as: Tag = 'div',
  variant = 'frost',
  refraction = 'card',
  radius = 'small',
  className = '',
  contentClassName = '',
  children,
  ...rest
}) {
  const ref = useRef(null);

  // Glass breathing: the edge highlight follows the pointer. Runtime CSS vars only —
  // nothing is styled inline in markup.
  const onPointerMove = useCallback((e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  return (
    <Tag
      ref={ref}
      className={`lg lg--${variant} lg--r-${refraction} lg--${radius} ${className}`.trim()}
      onPointerMove={onPointerMove}
      {...rest}
    >
      <span className="lg__effect" aria-hidden="true" />
      <span className="lg__tint" aria-hidden="true" />
      <span className="lg__shine" aria-hidden="true" />
      <div className={`lg__content ${contentClassName}`.trim()}>{children}</div>
    </Tag>
  );
}
