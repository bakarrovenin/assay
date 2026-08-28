import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
// @ts-expect-error opentype.js ships no bundled types.
import opentype from 'opentype.js';
import sharp from 'sharp';

const require = createRequire(import.meta.url);

/**
 * Open Graph card, generated at build time.
 *
 * Text is converted to vector paths from the real Archivo and IBM Plex Mono
 * files rather than being rendered as <text>. librsvg, which sharp uses for
 * SVG input, ignores @font-face, so anything left as text would silently fall
 * back to whatever the build machine happens to have installed. Paths render
 * identically everywhere.
 */

type Font = {
  unitsPerEm: number;
  charToGlyph: (ch: string) => Glyph;
  getKerningValue: (a: Glyph, b: Glyph) => number;
};

type Glyph = {
  advanceWidth: number;
  getPath: (x: number, y: number, size: number) => { toPathData: (n: number) => string };
};

const loadFont = (pkg: string, file: string): Font => {
  const dir = path.dirname(require.resolve(`${pkg}/package.json`));
  const buf = fs.readFileSync(path.join(dir, 'files', file));
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  ) as Font;
};

/**
 * Lay a string out glyph by glyph. Deliberately bypasses opentype.js's shaper,
 * which throws on one of Archivo's GSUB lookups. Kerning is applied by hand.
 *
 * Each glyph is generated at the origin and positioned with a transform rather
 * than by passing the pen position into getPath. Baking a fractional offset
 * into the coordinates makes opentype.js emit an occasional NaN control point,
 * and librsvg silently abandons the rest of that subpath when it hits one,
 * which loses half a letter with no error anywhere.
 */
const layout = (
  font: Font,
  text: string,
  size: number,
  letterSpacing = 0,
): { d: string; width: number } => {
  const scale = size / font.unitsPerEm;
  const parts: string[] = [];
  let x = 0;
  let prev: Glyph | null = null;

  const chars = [...text];

  chars.forEach((ch, i) => {
    const glyph = font.charToGlyph(ch);
    if (prev) x += font.getKerningValue(prev, glyph) * scale;

    const d = glyph.getPath(0, 0, size).toPathData(2);
    if (d.includes('NaN')) {
      throw new Error(`OG: glyph "${ch}" produced a NaN path at size ${size}`);
    }
    parts.push(`<path transform="translate(${x.toFixed(3)} 0)" d="${d}"/>`);

    x += glyph.advanceWidth * scale;
    // Tracking sits between glyphs, never after the last one, or the measured
    // width is too wide and anything centred on it drifts left.
    if (i < chars.length - 1) x += letterSpacing;
    prev = glyph;
  });

  return { d: parts.join(''), width: x };
};

const W = 1200;
const H = 630;
const PAD = 76;

const PAPER = '#E9E5DC';
const INK = '#14161A';
const BLUE = '#1B5FD9';
const RULE = 'rgba(20,22,26,0.16)';

export async function renderOgImage(): Promise<Buffer> {
  const display = loadFont('@fontsource/archivo', 'archivo-latin-800-normal.woff');
  const mono = loadFont('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff');
  const wordmarkFont = loadFont('@fontsource/archivo', 'archivo-latin-700-normal.woff');

  const text = (
    font: Font,
    value: string,
    x: number,
    y: number,
    size: number,
    fill: string,
    tracking = 0,
  ) => {
    const { d } = layout(font, value, size, tracking);
    return `<g transform="translate(${x} ${y})" fill="${fill}">${d}</g>`;
  };

  const headline = ['Your AI fixed it.', 'We check whether', 'it actually did.'];
  const headlineSize = 76;
  const firstBaseline = 300;
  const leading = 82;

  const verdict = layout(display, 'VERIFIED', 40, 2);
  const stampNote = layout(mono, 'CLOSED · BEHAVIOUR HELD', 12, 1.6);
  const stampW = Math.ceil(Math.max(verdict.width, stampNote.width)) + 64;
  const stampH = 118;
  const stampX = W - PAD - stampW;
  const stampY = 396;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <!-- Document rules, matching the site chrome. -->
  <rect x="0" y="128" width="${W}" height="1" fill="${RULE}"/>
  <rect x="0" y="${H - 96}" width="${W}" height="1" fill="${RULE}"/>

  <!-- Assay mark -->
  <g transform="translate(${PAD} 56) scale(1.5)">
    <path d="M2.4 2.4h13.2l6 6v13.2H2.4V2.4Z" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M7.4 12.4l3.2 3.4 6.2-6.6" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  ${text(wordmarkFont, 'ASSAY', PAD + 52, 84, 21, INK, 3.4)}

  <!-- Eyebrow -->
  ${text(mono, 'INDEPENDENT VERIFICATION FOR AI-AUTHORED CODE', PAD, 196, 17, BLUE, 3.4)}

  <!-- Headline -->
  ${headline
    .map((line, i) =>
      text(display, line, PAD, firstBaseline + i * leading, headlineSize, INK),
    )
    .join('\n  ')}

  <!-- Verdict stamp -->
  <g transform="rotate(-2.6 ${stampX + stampW / 2} ${stampY + stampH / 2})">
    <rect x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}" rx="3"
      fill="rgba(27,95,217,0.07)" stroke="${BLUE}" stroke-width="2.5"/>
    ${text(display, 'VERIFIED', stampX + (stampW - verdict.width) / 2, stampY + 62, 40, BLUE, 2)}
    ${text(mono, 'CLOSED · BEHAVIOUR HELD', stampX + (stampW - stampNote.width) / 2, stampY + 90, 12, BLUE, 1.6)}
  </g>

  <!-- Footer line -->
  ${text(mono, 'assay.website', PAD, H - 52, 15, INK, 1.2)}
  ${(() => {
    const credo = layout(mono, 'NULLIUS IN VERBA', 15, 3);
    return text(mono, 'NULLIUS IN VERBA', W - PAD - credo.width, H - 52, 15, INK, 3);
  })()}
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
