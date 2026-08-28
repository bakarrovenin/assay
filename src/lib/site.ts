export const site = {
  name: 'Assay',
  domain: 'assay.website',
  url: 'https://assay.website',
  tagline: 'Independent verification for AI-authored code',
  description:
    'Every AI security tool writes its own patches and certifies its own work. Assay is the third party that checks. One verdict on every AI-authored change, before it merges.',
  email: 'security@assay.dev',
} as const;

export const nav = [
  { label: 'Product', href: '/#how-it-works' },
  { label: 'The Index', href: '/the-index' },
  { label: 'Research', href: '/research' },
  { label: 'Docs', href: '/methodology' },
  { label: 'Pricing', href: '/#pricing' },
] as const;

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Docs', href: '/methodology' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'The Index', href: '/the-index' },
      { label: 'Changelog', href: 'https://github.com/assay-dev/assay/releases' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Blog', href: '/research' },
      { label: 'Methodology', href: '/methodology' },
      { label: 'Open source', href: 'https://github.com/assay-dev' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: 'mailto:hello@assay.dev' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'GitHub', href: 'https://github.com/assay-dev' },
      { label: 'X', href: 'https://x.com/assaydev' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/assaydev' },
    ],
  },
] as const;

export const METHOD_VERSION = '1.0';

/**
 * Where the Index email capture posts.
 *
 * Empty until a list provider is wired up. While it is empty the form falls
 * back to composing a mail message client-side, so the control is never a
 * dead end and no address is collected anywhere we cannot honour.
 */
export const INDEX_SIGNUP_ENDPOINT = '';
export const INDEX_SIGNUP_MAILTO = 'index@assay.dev';
