# Assay design system, v2

The brief, in one line: Assay is an assay office. Every page is a filed
document. The site should look like a certificate, not like a SaaS landing page.

This document is the source. Nothing in the rebuild should be invented outside
it. Where a value needs tuning, tune it here first and let the pages follow.

---

## 1. What is wrong with v1, and what we are fixing

The v1 site is not badly designed. It is monotonous. Every section uses the same
recipe at the same weight: eyebrow, headline, bordered artifact, one line of
prose, hairline rule, repeat. Near black, one gold, mid density, forever.

Three fixes, in priority order:

1. **Dynamic range.** Nothing sits at the same weight twice. Ten times the size
   difference between the smallest and largest type on a page.
2. **Section identity.** Each section is a different kind of document, not the
   same block with different words.
3. **Colour.** A real second colour with a semantic job, not a decorative
   accent.

---

## 2. Palette

Turquoise is verdigris: what copper turns when it oxidises. What the metal
reveals about itself once tested. It is the accent, the brand, and the verified
state.

Two semantic colours only. Everything else is a neutral.

### Ink theme (dark, primary)

    --bg            #080B0C    near black, cooled
    --bg-2          #0D1214    section tint, alternating
    --panel         #101719    artifact surfaces
    --panel-2       #161E21    nested surfaces
    --line          rgba(232,237,239,0.10)   hairlines
    --fg            #E8EDEF    primary text, cool white
    --fg-2          #8A979B    secondary text
    --fg-3          #5A686C    metadata, mono labels
    --accent        #2FB3A3    verdigris, primary accent
    --accent-hi     #4FD6C4    hover, emphasis
    --accent-dim    rgba(47,179,163,0.14)    fills, tints
    --fail          #E0614C    NOT VERIFIED only
    --fail-dim      rgba(224,97,76,0.12)

Code surfaces are a separate family and are NOT theme following. Diff,
Terminal, CodePanel and PRPanel depict a tool, so they stay dark in both
themes:

    --code-bg       #101719    always, both themes
    --code-bg-2     #161E21
    --code-fg       #E8EDEF
    --code-fg-2     #8A979B
    --code-line     rgba(232,237,239,0.10)

--panel and --panel-2 remain theme following and are for general surfaces.
The syntax palette on code surfaces is functional colour, not brand colour,
and is exempt from the two semantic colours rule.

### Paper theme (light)

    --bg            #F0F3F2
    --bg-2          #E8ECEB
    --panel         #FFFFFF
    --panel-2       #F6F8F8
    --line          rgba(10,20,22,0.12)
    --fg            #0B1214
    --fg-2          #4A585C
    --fg-3          #78868A
    --accent        #0E7A6D    darker for contrast on light
    --accent-hi     #0A5F55
    --accent-dim    rgba(14,122,109,0.10)
    --fail          #B33A28
    --fail-dim      rgba(179,58,40,0.09)

### Rules

- Accent is for: the brand mark, verified states, live links, one emphasis per
  section. Never for decoration, never as a background wash.
- Eyebrows and all other metadata are --fg-3, never accent. An accent that
  appears in every section is not an accent. Place it once per section, on the
  thing that carries the meaning: a verified mark, a live link, a key number,
  a struck punch.
- Fail is for NOT VERIFIED and failed checks only. Never for anything else.
- Gold is retired. If a legacy gold value survives anywhere, replace it.
- No gradients, no glows, no soft shadows. Flat, ruled, engraved.

---

## 3. Type

The dynamic range is the whole point. The smallest type on a page is 10px and
the largest is 96px. Nothing lives in the comfortable middle for long.

    --t-display     clamp(38px, 5.4vw, 72px)   page headline, once per page
    --t-section     clamp(28px, 3.6vw, 46px)   section headline
    --t-lead        clamp(18px, 2vw, 22px)     lede, italic
    --t-body        17px                        prose
    --t-small       14px                        secondary prose
    --t-meta        10.5px                      mono metadata, 0.2em tracking

- Display and section headlines: Archivo. No serif is being added, so the
  display and section sizes above were redrawn downward from the values first
  written here, which were drawn for a serif at weight 500 and read too heavy
  on a grotesque. The range against 10.5px meta is what carries the idea.
- There is no roman plus italic device. The site has no italic face and is not
  getting one.
- Body: the site's sans.
- Meta: the site's mono, uppercase, letterspaced, --fg-3.
- Line length: body never exceeds 68 characters.

---

## 4. The metadata grammar

This is the device that carries the brand, and Assay has real material for it
where a template would have to invent it. Every section is filed.

Forms to use, drawn from actual artifacts:

    CERT · ASY-2026-0001
    SHEET 1 / 4
    FILED 2026.09.09 · 14:02 UTC
    METHOD v1.0
    SCANNER · SEMGREP 1.90.0
    RUN · sha 9a76723532b0
    STRUCK / UNSTRUCK
    ISSUE 01 · PILOT 001

Placement: top-left and top-right of a section, or as a caption strip beneath an
artifact. Always mono, 10.5px, --fg-3, letterspaced.

Rule: **only use metadata that is true.** A fabricated certificate number on a
site about verification is the exact failure we publish about. Every timestamp,
hash and version on the site must trace to a real artifact.

---

## 5. Spacing and rhythm

    --space-section    clamp(96px, 12vh, 180px)   between sections
    --space-block      48px                        within a section
    --space-tight      16px

- Sections alternate --bg and --bg-2, so the rhythm is legible. This applies to
  full-bleed marketing sections only. Inside the docs reading column it does
  not: see the sixth correction below.
- Hairline rules separate, they do not decorate. One rule per boundary.
- Artifacts (Diff, Terminal, VerdictBlock) get real air: minimum 64px above and
  below, never crowded by prose.

---

## 6. Section identity

Each section is a different document. This is the fix for monotony, and it is
the part that must not be flattened back into a uniform grid.

| Section | Document it becomes |
|---|---|
| Hero | The certificate. Verdict panel, large, as the primary object |
| The gap | A spec sheet. Numbered zones, leader lines, one struck layer |
| Overfitted patch | Already correct. Keep. This is the benchmark |
| The four checks | A punch card. 01 to 04, struck marks, mono |
| Pricing | An assay ledger. Line items, total due, auth line. No subtotal |
| The Index | A results sheet. Ruled table, column rules, no card chrome |
| The record | A hallmark. Four punches, struck and unstruck, large |
| Research | A dispatch. Issue number, filed date, contact sheet listing |
| Methodology | A technical manual. Sidebar, anchors, dense, no marketing |
| About | A colophon. Nullius in verba as the mark |

Two corrections from building it.

**Pricing has no subtotal.** The three tiers are mutually exclusive: a reader
buys one of them, and summing them is not a number that means anything. The
line was written before anyone tried to draw it.

**Two of the three totals are empty, and stay empty.** Assay has no price for
Team or Enterprise. A ledger wants figures and there are none, so those cells
carry the reason instead, which is the device /the-index already uses. Filling
them would be inventing figures on a site whose argument is that vendors invent
figures. The form yields to the facts.

**A struck punch means a verdict.** So the four checks read as struck only
where a verdict exists. On /product, which explains what the checks are, the
punches are unstruck: a check that has not been applied yet. The hero
certificate is the struck version of the same card.

**Alternating tints do not apply inside the docs reading column.** Section 5
says sections alternate with no exceptions. That is wrong. The tint is a
full-bleed device: it works because the band runs the whole width of the
viewport and the rhythm is read at the page edge. Inside the bordered reading
column on /methodology there is no edge to run to, so the tint reads as a
stray filled box behind a paragraph rather than as rhythm. DocsLayout sets
those sections transparent on purpose. Methodology stays untinted.

---

## 7. Copy rules

- One sentence of setup. The artifact. One sentence of consequence. No more.
- Every protected line stays verbatim. They are listed in PROTECTED-COPY.md
  at the repository root.
- No em dashes or en dashes anywhere in prose.
- The artifact is the explanation. If a paragraph explains the thing next to it,
  cut the paragraph.
- Numbers are specific and traceable. No rounded marketing figures.

---

## 8. Build order

Do not do this in one pass. Stop after each stage for review, screenshot 1512px
and 390px in both themes.

**Stage 1. Tokens only.** Replace the palette and type scale globally. Change no
layout. The site will look wrong in places, and that is expected. The purpose is
to see the new colour and scale on the existing structure before committing to
new layouts.

**Stage 2. The homepage.** Full rebuild against section identity. This is the
proof. If the homepage does not land, stop and fix it before touching anything
else.

**Stage 3. Product and pricing.** The spec sheet and the ledger.

**Stage 4. The Index, research, about.** The results sheet, the dispatch, the
colophon.

**Stage 5. Methodology.** Deliberately last and deliberately plainest. It is
reference material, not persuasion. Density is correct there.

**Preserve throughout:** the Loops modal and INDEX_SIGNUP_ENDPOINT, the GA4
snippet, every protected copy line, both themes, and the existing Diff,
VerdictBlock, Terminal, Hallmark, ConditionList and RuledRows components.
Restyle them. Do not replace them.
