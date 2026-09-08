/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export (SSG) for Firebase Hosting — `next build` writes the site to `out/`.
  output: 'export',
  // /about -> out/about/index.html. Both Firebase Hosting and .claude/serve.mjs resolve
  // directory indexes natively, so links never depend on a rewrite rule.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // The default image optimizer needs a server; with a static export it is off and the
    // archive imagery is pre-encoded to WebP at build time by scripts/optimize-images.mjs.
    unoptimized: true,
  },
  sassOptions: {
    // Lets every page/component stylesheet `@use 'tokens'` without relative paths.
    includePaths: ['src/styles'],
    silenceDeprecations: ['legacy-js-api'],
  },
  env: {
    // Set NEXT_PUBLIC_HOLDING=1 at build time to serve the pre-launch holding page at `/`
    // (the real homepage stays in the codebase and at /home while the flag is on).
    NEXT_PUBLIC_HOLDING: process.env.NEXT_PUBLIC_HOLDING || '0',
  },
};

module.exports = nextConfig;
