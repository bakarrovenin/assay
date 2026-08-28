# Assay

Marketing site for Assay: independent verification for AI-authored code.

Astro 7 + TypeScript, Tailwind v4, no component library. Static output.

## Running it

Needs **Node 22.12 or newer** (Astro 7 requires it). `.nvmrc` pins 22.

```
nvm use
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/ exactly as a static host would
npm run check    # astro check, must stay at 0 errors
```

Deploy target is Vercel, live at <https://assay.website>. No `vercel.json` is
needed: the output is plain static files and the defaults serve them correctly.

Commits must be authored by an email on the Vercel team, or Vercel blocks the
deployment with "Git author ... must have access to the team". The repo-local
git identity is set accordingly.

## Before launch

One thing is deliberately unwired:

- **`INDEX_SIGNUP_ENDPOINT` in `src/lib/site.ts` is empty.** The Index email
  capture is a real, labelled, validating form, but there is no list provider
  behind it. While the constant is empty the form stays visible and says it is
  not connected, rather than accepting an address there is nowhere to put.
  Point it at a provider and it starts working.

There is no contact email anywhere on the site, by choice. Security reports go
to GitHub private vulnerability reporting via `SECURITY_ADVISORY_URL` in
`src/lib/site.ts`, which requires **Private vulnerability reporting** to be
enabled under Settings > Code security or the link 404s. Three controls have no
target as a result and are deliberately left visible but `aria-disabled`: the
two pricing "Talk to us" buttons and "Get in touch" on /about.

Everything else on the site is either real or an explicit empty state. There
are no fabricated customers, logos, testimonials or Index results anywhere,
which is the point.

## Structure

```
src/
  components/     one file per section, plus the primitives
  layouts/        BaseLayout (shell, SEO, JSON-LD), PostLayout (markdown)
  lib/
    site.ts       nav, footer, method version, signup endpoint
    og.ts         build-time Open Graph card
    highlight.ts  build-time JSON tokeniser
  pages/
    index.astro                 home
    the-index.astro             /the-index
    methodology.astro           /methodology
    about.astro                 /about
    research/index.astro        blog index
    research/*.md               posts
    og.png.ts                   renders /og.png at build time
  styles/global.css             tokens, both themes, primitives
public/fonts/                   latin-subset woff2, self-hosted
```

## Decisions worth knowing

**`/the-index`, not `/index`.** The brief asked for `/index`. That route is not
available on a static host: the home page is `index.html`, so a request for
`/index` resolves to the home page before the resolver ever tries
`index/index.html`. Verified against `astro preview`, which serves the built
output the way a static host does. `/the-index` matches the nav label and
cannot collide.

**Three tokens deviate from the brief, all for WCAG AA.** Each is commented in
`global.css` with its measured ratio:

| Token | Brief | Shipped | Why |
| --- | --- | --- | --- |
| `--graphite` | `#5A6068` | `#4E545C` | 6.08:1 on `--paper`; the original failed |
| `--graphite-d` | `#8A919B` | `#9AA1AB` | 6.96:1 on `--ink-bg` |
| `--blue` | `#1B5FD9` | `#1A55C6` | was 4.09:1 on `--paper-2`, so eyebrows on tinted sections failed |

The code-comment colour in `CodePanel.astro` moved for the same reason.

**The chart draws bars in SVG but sets its labels in HTML.** A single scaled
`viewBox` holding `<text>` renders labels at roughly 6px on a phone, because
text scales with the viewBox. Stretching axis-aligned rectangles is exactly
what a bar chart does, so nothing distorts, and the type stays on the site
scale at every width. There is a visually hidden data table alongside it.

**The OG card converts text to vector paths.** sharp renders SVG through
librsvg, which ignores `@font-face`, so anything left as `<text>` silently
falls back to whatever font the build machine has. `src/lib/og.ts` lays glyphs
out from the real Archivo and IBM Plex Mono files with manual kerning. It
positions each glyph with a transform rather than baking the offset into
`getPath`, because opentype.js emits an occasional `NaN` control point when
given a fractional offset, and librsvg abandons the rest of that subpath
without an error. The layout function throws on `NaN` so a broken card can
never ship silently.

**Grids declare `grid-cols-1` at the base breakpoint.** An implicit grid track
is sized `auto` and can grow to an item's max-content, which pushed a
horizontal scrollbar onto the page at mobile widths. Panels that scroll their
own content also carry `min-w-0`, since grid and flex children default to
`min-width: auto`.

## Adding a research post

Drop a markdown file in `src/pages/research/`. The index picks it up and sorts
by date; no registration step.

```yaml
---
layout: ../../layouts/PostLayout.astro
title: ...
description: ...
date: 2026-09-01
author: ...
readingTime: 6 min read
---
```

## House style

- **No em dashes or en dashes in prose.** Commas, colons, full stops. The only
  `—` on the site is the empty-value marker in the Index table.
- No "AI-native", "agentic" (except the CSA framework's actual name),
  "revolutionise", "empower", "seamless", "cutting-edge".
- Every statistic carries its source and year inline, in mono.
- Never claim customers, logos or testimonials. There are none yet.
