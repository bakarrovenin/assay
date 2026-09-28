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
    '/whitepaper': '/methodology',
    '/about': '/evidence#about',
    '/research': '/evidence',
    '/the-index': '/benchmark/leaderboard',
    // Product became the benchmark: the free instrument lives at /benchmark and
    // the explanatory material also lives on at /methodology.
    '/product': '/benchmark',
  },
  // The component sheet is a working document, not a page.
  integrations: [sitemap({ filter: (page) => !page.includes('/design-system') && !page.includes('-v1') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
