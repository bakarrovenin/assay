export const site = {
  name: 'Assay',
  domain: 'assay.website',
  url: 'https://assay.website',
  tagline: 'Independent verification for AI-authored code',
  description:
    'Independent checks for AI-written SQL injection fixes. Test patches against attacks and normal inputs, and inspect the evidence.',
} as const;

/** Where security bypass reports go. GitHub private vulnerability reporting. */
export const SECURITY_ADVISORY_URL =
  'https://github.com/bakarrovenin/assay/security/advisories/new';

// Three canonical destinations. Historical report URLs remain accessible.
export const nav = [
  { label: 'Benchmark', href: '/benchmark' },
  { label: 'How it works', href: '/methodology' },
  { label: 'Evidence', href: '/evidence' },
] as const;

export const footerColumns = [{ title: 'Assay', links: [...nav] }] as const;

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
