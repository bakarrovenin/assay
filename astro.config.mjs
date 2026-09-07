// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://assay.website',
  // The method is published at /methodology and stays there: it is the live,
  // indexed URL and /the-index deep links into #index-rules. /docs is what
  // people type, so it redirects rather than becoming a second copy.
  redirects: {
    '/docs': '/methodology',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
