# One-off visual artifacts

How an agent turns facts into a screenshot-ready visual in the N/A look: one editable HTML file, plus a PNG. Use this instead of an AI-generated image when the visual contains labels, statuses or numbers that must be right and may need correcting later.

## When to use what

| Need | Use |
| --- | --- |
| A finite set of real items sorted into factual groups (product landscape, status overview) | Taxonomy Grid: `scripts/make-taxonomy-grid.mjs` |
| A spice piece (stamp, receipt, tracked change, hatch chart, terminal, laptop mockup) | `scripts/cut-artifacts.mjs` or `scripts/cut-mockups.mjs`, see `SPICE.md` |
| Anything else (timeline, comparison matrix, relationship map) | Not built. Hand-write one HTML file with `tokens.css` and a palette, and say so. Add a template here only after a second need appears |

## Workflow

1. **Collect the facts.** Items, groups, statuses and dates come from the source or the user. If a group, status or date is missing, ask or leave it out. Never invent categories to make the layout look interesting, and never imply two items are equivalent because they share a grid.
2. **Pick the brand.** `perspectives` for the newsletter, `licensing-guide` for the dark licensing look, `default` for N/A. If the user did not say, use the brand of the place the image will appear.
3. **Write the content JSON.** Start from `examples/taxonomy-ms-app-landscape.json`. Content and presentation stay separate: the JSON is the only thing you edit.
4. **Generate the HTML.**
   ```sh
   node scripts/make-taxonomy-grid.mjs content.json --out grid.html
   ```
5. **Render the PNG and read the checks.**
   ```sh
   node scripts/shoot.mjs grid.html grid.png
   ```
   It fails when the PNG is not the artboard size, when the page never reported ready, or when any tile, panel or the artboard overflows. Fix the content or the size, do not suppress the check. Then open the PNG and look at it: text legible at the size it will be posted, nothing clipped, retiring or preview items visibly different.
6. **Deliver** the HTML and the PNG. State what is unverified (statuses are snapshot values and carry a date in the `source` line).

## Taxonomy Grid

Content JSON fields: `brand`, `size` (default 1600 x 1200), `title` (optional), `columns` (group panels per row), `tileColumns` (tiles per row in a panel), `source` (foot line, use it for the snapshot date), `groups[].name`, `groups[].items[]` with `name`, optional `id` (short identifier), `status` (`ga`, `preview`, `retiring`, `deprecated`), `qualifier` (free text, or a date for retiring items) and `emphasis` (only when the source warrants it).

- Item count is free. Every tile in the file has the same size, taken from the largest group, so a short group leaves empty slots rather than larger tiles.
- Status is always written as text. Preview has a dashed border, retiring and deprecated carry a hatch band, emphasis is a heavier accent border. Colour is never the only signal.
- Flat: no shadows, 0 px corners, one accent. Fonts come from Google Fonts with fallbacks; nothing is bundled.
- **Edit without an IDE:** open the HTML with `#edit` added to the address. Type over any label, double-click a tile to cycle its status, press "Copy content JSON" and paste the result back into the JSON file. Without `#edit` the controls do not exist, so screenshots and prints are clean.
- The JSON is embedded in the HTML (`<script id="content">`), so the single file stays portable.

## Settled by the design system (do not re-decide)

Tokens and palettes from `tokens.css` and `palettes/`, flat borders instead of shadows, corners at 4 px or less, no decorative gradients or glow, one accent per piece, real words in the brand voice. See `SPICE.md`.

## Limits

- Web fonts need network when the PNG is rendered. Offline, Chrome draws the fallback fonts and the result must be judged by eye.
- `shoot.mjs` needs Chrome or Chromium (`CHROME=/path` to point at one). Manual fallback: open the file, screenshot the artboard element.
- The overflow check covers tiles, panels and the artboard, not whether the text is *good*.
- The Microsoft app landscape example is a snapshot of October 2026 statuses, supplied by Jukka. It is a demonstration, not evergreen data.

## Adding another template

Copy `make-taxonomy-grid.mjs`, keep the same contract (content JSON in, one HTML out, `data-ready` and `data-overflow` flags, `#edit` only), and add a row to the table above. Do not build one before a real need.
