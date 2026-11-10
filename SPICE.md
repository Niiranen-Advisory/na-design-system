# Spice

The spice kit is the part of N/A identity that is meant to travel: small, flat pieces that put the brand into a page, deck, app or one-file tool without adopting the whole system. This file is the rules. The code is `spice.css` and `scripts/cut-artifacts.mjs`.

## The premise

N/A is what you write when a question does not apply. The slash is the load-bearing element, and every diagonal in the kit leans by the same angle: `--na-slash-angle`, 20°. Evidence, forms, footnotes and spreadsheets are the visual world, because that is where the work happens.

## Rules

1. **One piece per view.** A window, a cut or a glyph header. Not two. A page that uses three is decorated, not authored.
2. **Flat.** No shadows, no gradients as tone, no glow, no blur. The hatch is a line pattern with hard stops and is allowed because it is flat. Corners stay at 4px or under.
3. **One accent.** The accent appears once per piece: the primary button, the slash, the highlighted cell.
4. **Never behind body text.** Glyphs and hatch sit behind a heading or beside the content, not under paragraphs.
5. **Decorative means decorative.** Glyphs, window controls and hatch carry no meaning. Mark chrome `aria-hidden="true"`. The words carry the message.
6. **Real words, in the brand voice.** Copy is a parameter, and the default copy is dry and specific. Buttons say what they do ("Read the analysis", not "Learn more").
7. **No kickers.** No small label above a headline, no chip or badge cluster. The window title bar is the only label, and it names where the content comes from.

## The pieces

| Piece | Form | Use for | Don't use for |
| --- | --- | --- | --- |
| Window | `.na-window` (CSS) | A post, a dialog, an empty or error state, one call to action | A container for every block of content |
| Cut | `.na-cut` (CSS), `cut.svg` | Masthead, section divider, deck divider, OG image | Behind running text |
| Crop | `crop.svg` | Deck cover, identity plate, 404 | Anything small: it needs room to bleed |
| Hatch | `.na-hatch` (CSS), `hatch-band.svg` | Strips, chart series, the offset behind a window | Tone or depth. It is a fill, not a shadow substitute for every box |
| Glyph | `.na-glyph` (CSS), twelve glyphs, see Glyphs | A quiet mark behind one section header | Carrying meaning, or repeated down a page |
| Examples | `receipt`, `coverage`, `checkbox`, `sheet`, `hatch-chart` (SVG) | Showing a specific idea as a picture: footnote chains, overlap, "not applicable" | Filler. Each one should illustrate its section |
| Stamp | `stamp.svg` | Closing a section on a verdict (`NOT APPLICABLE`, `REVIEWED 24.10.2026`), an OG image | Decoration. The words must be a verdict someone could actually give |
| Tracked changes | `tracked.svg` | Showing that wording changed: old struck, new inserted in the accent | Real quotations. The sentences are illustrative |
| Terminal | `terminal.svg` | A CLI table on the plate where one cell reads `null` or `N/A` | Real command output. The values are illustrative |
| Mockup | `assets/mockups/` (frames, screens, composed) | Showing an app screen or a real screenshot on hardware: decks, case studies, social images | Anywhere a flat piece would do. One per view, like every other piece |

## Brands

Every piece reads `--na-color-*`, so it follows whichever palette is loaded. Two brand notes:

- **Hatch color.** It defaults to the accent. The Licensing Guide palette sets `--na-hatch-color` to 38% accent mixed into the ground, so the hatch recedes and the accent button stays the loudest element. A new dark brand should do the same.
- **Plate.** `cut` and `crop` use the `--na-color-plate-*` tokens, so the dark side of a cut is the identity plate color, not the page color.

## Mockups

`assets/mockups/frames/laptop.svg` is hardware with an empty 1440 x 900 screen slot. `assets/mockups/screens/*.svg` are app screens that fill it. `node scripts/cut-mockups.mjs` composes frame x screen x palette into `assets/mockups/out/`, and `--screen shot.png` composes a real screenshot into the slot.

**The hardware is exempt from "flat".** It is staging: gradients, noise, blur and glare are allowed on the device and the room around it. **The screen content is not exempt.** What is shown on the screen is a piece like any other: flat, one accent, square corners, honest copy. A real screenshot goes in unaltered.

Composed files are baked: every `var()` is resolved to its fallback and the two fonts (DM Serif Display, IBM Plex Serif, both OFL, in `assets/mockups/fonts/`) are embedded, so the file looks the same as an `<img>`, in Office and in a browser. A mockup counts as the one piece in its view.

## Window anatomy

The border and fill of the window are drawn by `::after`, above the hatch on `::before`. A negative-z pseudo-element paints over its parent's own border, so the frame cannot be the element's border. Keep this structure when changing the component, or the hatch will draw over the window edge.

## Glyphs

Twelve glyphs. Ten are drawn: a 240 box, a 22 stroke, butt ends, and every diagonal at `--na-slash-angle`. Two are typeset in the display face through `data-glyph`.

| Glyph | Markup | Goes with |
| --- | --- | --- |
| Section sign | `data-glyph="§"` | Licensing terms, product terms, contract and renewal content |
| Asterisk | `.na-glyph--asterisk` | Exceptions, caveats, footnotes |
| Not equal | `.na-glyph--neq` | A vendor claim against what a customer can obtain |
| Sum | `.na-glyph--sum` | Pricing and cost |
| At most | `.na-glyph--lte` | Limits, capacity, entitlements |
| Up and down | `.na-glyph--updown` | Trade-offs |
| Paragraph | `.na-glyph--paragraph` | Long-form analysis |
| Double slash | `.na-glyph--dslash` | Field notes, commentary |
| Prompt | `.na-glyph--prompt` | Governance as code, anything run from a terminal |
| Question mark | `data-glyph="?"` | Open questions, intake |
| Therefore | `.na-glyph--therefore` | Conclusions, recommendations |
| Null | `.na-glyph--null` | Empty and error states, "not applicable" |

The pairing is a habit for the author, not a code for the reader. Rule 5 still holds: a glyph carries no meaning, and the heading says what the section is. One glyph per view (rule 1). If no row fits the content, use no glyph. Do not add a thirteenth without a pass like the one that chose these.

Watermark strength is 9% ink mixed into the ground, and 16% inside `.na-plate`, because 9% disappears on a near-black ground. A dark brand sets `--na-glyph-strength` itself.

## Artifacts

`assets/artifacts/*.svg` are generated. Every color is a CSS variable with a baked fallback, so:

- inlined in a page, a file follows the page's brand;
- used as an `<img>`, it shows the fallback: default for `name.svg`, Licensing Guide for `name-dark.svg`.

Office (PowerPoint, Word) ignores CSS custom properties and draws every fill black, so for Office resolve the variables first: `bake()` in `scripts/lib/palettes.mjs` replaces each `var(--x, fallback)` with its fallback. Checked in PowerPoint 16 (2026-11-09): baked artifacts and the baked laptop mockups render correctly there, with embedded fonts, noise and blur intact. PowerPoint ignores `feDisplacementMap`, so the stamp shows clean edges instead of roughened ones: acceptable, but do not rely on the roughness. Type styles are written as `font-weight`, `font-size` and `font-family`, not the `font:` shorthand, because PowerPoint ignores the shorthand.

Text in them is content: change `CONTENT` in `scripts/cut-artifacts.mjs` and re-run it. Do not edit the SVGs by hand. Fonts are system monospace only, so the files look the same everywhere. The example values in `sheet` and `hatch-chart` are illustrative and not statements of fact.

## Provisional

- **Tally and slash field** were tried and dropped for now. They are not in the kit.
