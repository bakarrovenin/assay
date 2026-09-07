export const site = {
  name: 'Assay',
  domain: 'assay.website',
  url: 'https://assay.website',
  tagline: 'Independent verification for AI-authored code',
  description:
    'Every AI security tool writes its own patches and certifies its own work. Assay is the third party that checks. One verdict on every AI-authored change, before it merges.',
} as const;

/** Where security bypass reports go. GitHub private vulnerability reporting. */
export const SECURITY_ADVISORY_URL =
  'https://github.com/bakarrovenin/assay/security/advisories/new';

export const nav = [
  { label: 'Product', href: '/product' },
  { label: 'The Index', href: '/the-index' },
  { label: 'Research', href: '/research' },
  { label: 'Docs', href: '/methodology' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
] as const;

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '/product' },
      { label: 'Docs', href: '/methodology' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'The Index', href: '/the-index' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Blog', href: '/research' },
      { label: 'Methodology', href: '/methodology' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
    ],
  },
] as const;

export const METHOD_VERSION = '1.0';

/**
 * Where the email captures post. Loops hosted newsletter form endpoint.
 *
 * Shared by the Index signup and the "Verify a pull request" modal. The two
 * are told apart by the userGroup field they send, not by the URL. See
 * submitSignup in ./signup.
 */
export const INDEX_SIGNUP_ENDPOINT =
  'https://app.loops.so/api/newsletter-form/cmtg0rra2024z0jzslh4couj3';
