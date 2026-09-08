// Responsive <img> for the pre-encoded archive derivatives (scripts/optimize-images.mjs).
// With `output: 'export'` there is no image optimizer at request time, so the srcset is
// built here from the 800/1400 WebP pair. Width/height reserve the box (no layout shift).
const BASE = '/images/archive';

export default function ArchiveImage({ slug, alt, ratio = '4 / 5', sizes = '(min-width: 1024px) 40vw, 100vw', eager = false, className = '' }) {
  const [w, h] = ratio.split('/').map((n) => Number(n.trim()));
  return (
    <img
      className={`archive-img ${className}`.trim()}
      src={`${BASE}/${slug}-800.webp`}
      srcSet={`${BASE}/${slug}-800.webp 800w, ${BASE}/${slug}-1400.webp 1400w`}
      sizes={sizes}
      width={w * 200}
      height={h * 200}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}
