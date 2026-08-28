/**
 * Build-time JSON tokeniser.
 *
 * Runs in Astro frontmatter only, so nothing reaches the browser. It emits the
 * same token classes the hand-written snippets use, which keeps one set of
 * colours across every code panel on the site.
 */

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const wrap = (cls: string, text: string): string =>
  `<span class="${cls}">${escapeHtml(text)}</span>`;

export function highlightJson(source: string): string {
  // One pass over strings, numbers, literals and punctuation. Keys are the
  // strings immediately followed by a colon.
  const pattern =
    /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],:])/g;

  let out = '';
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    out += escapeHtml(source.slice(last, match.index));
    last = pattern.lastIndex;

    const [, str, colon, num, lit, punct] = match;

    if (str !== undefined) {
      // A string followed by a colon is a key, everything else is a value.
      out += colon
        ? wrap('tok-fn', str) + wrap('tok-var', colon)
        : wrap('tok-str', str);
    } else if (num !== undefined) {
      out += wrap('tok-mut', num);
    } else if (lit !== undefined) {
      out += wrap('tok-kw', lit);
    } else if (punct !== undefined) {
      out += wrap('tok-var', punct);
    }
  }

  out += escapeHtml(source.slice(last));
  return out;
}
