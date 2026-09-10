/**
 * Protected copy guard.
 *
 * PROTECTED-COPY.md lists the lines that must appear on the site exactly as
 * written. This checks that they do, against the BUILT HTML rather than the
 * source, because source is wrapped across lines, entity encoded, and split by
 * inline tags. A line can be intact in a component and still render wrong.
 *
 * The list is read from PROTECTED-COPY.md rather than repeated here, so there
 * is one copy of it and it cannot drift from the document it enforces.
 *
 * A negative control runs first. If the matcher cannot report a line that has
 * been altered, it cannot confirm one that has not, so a clean pass would mean
 * nothing. That is the standard the pilot harness holds its own guards to, and
 * this guard was written after a hand-rolled version of it produced a false
 * failure, so it is not hypothetical here either.
 *
 * Usage: node scripts/check-protected-copy.mjs
 * Exit 0 all present, 1 a line is missing or altered, 2 the control did not
 * fire, 3 nothing to check.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LIST = join(ROOT, 'PROTECTED-COPY.md');
const DIST = join(ROOT, 'dist');

/** Numbered items from the list, before the Notes section. Items may wrap. */
function protectedLines(md) {
  const body = md.split(/^##\s+Notes/m)[0];
  const out = [];
  let current = null;
  for (const raw of body.split('\n')) {
    const start = raw.match(/^(\d+)\.\s+(.*)$/);
    if (start) {
      if (current) out.push(current);
      current = start[2];
    } else if (current && /^\s+\S/.test(raw)) {
      current += ' ' + raw.trim();
    } else if (current && raw.trim() === '') {
      out.push(current);
      current = null;
    }
  }
  if (current) out.push(current);
  return out.map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

/**
 * Rendered text of a page, as a reader sees it.
 *
 * Inline tags are replaced with a space so words never run together, then
 * whitespace before punctuation is closed up again: "specification</strong>."
 * renders as "specification." and must not be read as "specification ."
 */
function renderedText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;|’|‘/g, "'")
    .replace(/&ldquo;|&rdquo;|“|”/g, '"')
    .replace(/&middot;/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1');
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory()
      ? htmlFiles(full)
      : name.endsWith('.html')
        ? [full]
        : [];
  });
}

function findMissing(lines, pages) {
  return lines.filter((line) => !pages.some(([, text]) => text.includes(line)));
}

function main() {
  if (!existsSync(LIST)) {
    console.error('cannot check: PROTECTED-COPY.md is missing.');
    return 3;
  }
  if (!existsSync(DIST)) {
    console.error('cannot check: no dist/. Run `npm run build` first, so the');
    console.error('lines are checked against what a reader actually gets.');
    return 3;
  }

  const lines = protectedLines(readFileSync(LIST, 'utf8'));
  if (!lines.length) {
    console.error('cannot check: PROTECTED-COPY.md lists no lines.');
    return 3;
  }

  const pages = htmlFiles(DIST).map((f) => [
    relative(DIST, f),
    renderedText(readFileSync(f, 'utf8')),
  ]);

  // Negative control: alter each line and require the matcher to notice.
  const blind = lines.filter((line) => {
    const altered = line.replace(/\.$/, '') + ' and one more clause.';
    return findMissing([altered], pages).length === 0;
  });
  if (blind.length) {
    console.error('The check cannot fail, so its passing means nothing.');
    for (const b of blind) console.error(`  not detected when altered: ${b}`);
    return 2;
  }

  const missing = findMissing(lines, pages);

  console.log(`Protected copy, ${lines.length} lines against ${pages.length} built pages`);
  console.log('='.repeat(64));
  for (const line of lines) {
    const on = pages.filter(([, t]) => t.includes(line)).length;
    const short = line.length > 52 ? line.slice(0, 52) + '...' : line;
    console.log(`  ${missing.includes(line) ? 'MISSING ' : 'present '} ${String(on).padStart(2)} page(s)  ${short}`);
  }
  console.log('='.repeat(64));

  if (missing.length) {
    console.error('RESULT: PROTECTED COPY HAS BEEN ALTERED');
    console.error('  A protected line may be moved or re-styled. Its words and');
    console.error('  its sentence boundaries may not change. See PROTECTED-COPY.md.');
    return 1;
  }
  console.log('RESULT: EVERY PROTECTED LINE IS PRESENT VERBATIM');
  console.log(`  and the check reported all ${lines.length} of them when altered.`);
  return 0;
}

process.exit(main());
