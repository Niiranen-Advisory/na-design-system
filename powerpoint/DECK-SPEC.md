# N/A deck rules (PowerPoint)

Draft v0.1. Rules for building PowerPoint decks in the N/A look so that an agent's baseline needs content edits, not styling edits. They apply to decks built on the `NA …` layouts of the N/A PowerPoint template. The template, the reference builder (python-pptx), the lint and the render check are kept in the working repository and are not part of this one.

## Principles

1. **Ship-ready baseline.** Styling that had to be fixed by hand once is a rule from then on.
2. **Theme-bound.** Every colour is a theme slot (`bg1`, `bg2`, `tx1`, `accent1`, `accent3`, `accent4`, `accent6`). No hard-coded hex, except the screenshot callout red.
3. **Native and editable.** Diagrams are PowerPoint shapes and connectors, never pictures of diagrams. Third-party slides are redrawn, never pasted.
4. **Real structure.** Real placeholders, real tables, and connectors glued to shapes so they follow when boxes move.
5. **No tracking text on slides.** TODOs, open questions and "replace this" go in speaker notes or in the hand-off message.

## Diagram

| Rule | Value |
| --- | --- |
| Box shape | Rectangle, 1 pt outline |
| Neutral box | Fill `bg2`, outline `tx1`, text `tx1`. Never a white box on a white slide |
| Focus box (the decision, what the slide is about) | Fill `accent1`, text `bg1`. One per diagram, two at most |
| Secondary box (next or optional step) | Fill `accent1` at 80 % lighter, outline `accent1` |
| External box (other system, sub-flow) | Fill `accent4`, outline `tx1` |
| Text in boxes | 16 pt (14 pt when the box is under 1.6 in), centred, theme body font. Monospace only for literal names visible in the product, in at most two boxes per slide |
| Box size | 1.75 × 0.85 in default; shrink before overflowing |
| Arrows | 1.25 pt `tx1`, triangle head, glued to connection sites. Elbow when rows differ, straight otherwise. Dashed means return or optional |
| Edge labels | 12 pt `accent3`, on the last run into the target so branches never share a spot |
| Scope container | Dashed 1 pt, no fill, 12 pt `accent3` caption top-left. `accent3` outline for neutral scopes, `accent1` for the failure path |
| Sequence diagram | Actor boxes in neutral, dashed `accent3` lifelines, 13 pt message labels on a `bg1` fill, solid for a call, dashed for a return |
| Width | The diagram layout gives 8.6 in plus an insight column. With five or more columns use the full 11.9 in canvas and put the insight in one or two lines under it |
| Icons | Product icons at about 0.5 in to show where data lives, from the product's own icon set, never recoloured |
| Colour is not the only signal | Focus, secondary and external boxes also differ by label or position |

## Screenshot

| Rule | Value |
| --- | --- |
| Frame | Aspect kept, fitted into the canvas, 0.75 pt `accent6` border |
| Shadow | Soft shadow on screenshots only (blur 15 pt, 5 pt down, `tx1` at 30 %), so a pasted UI reads as a separate layer from the slide. Nothing else gets a shadow. The exact setting is still to be tuned |
| Callouts | Rectangle outline only, 1.75 pt, `danger` red (#B3261E), around the one thing to look at. Three at most |
| Alt text | Required, describes what the screenshot shows |
| Missing screenshot | Do not ship a "paste here" box. Leave the slide out and list the needed capture (screen, state, what to highlight) in the speaker notes and the hand-off |

## Table (definition grid)

No vertical lines. Header: `bg2` fill, 14 pt bold `tx1`, 1.5 pt `tx1` rule under it. Body rows unfilled with a 0.75 pt `accent6` rule under each. First column 16 pt in the display face, other columns 15 pt. Cell margin 0.1 in left. Use for term and meaning, question and example, risk and action, and comparisons with rows. Not for fewer than three rows (use bullets) or more than seven (split).

## Accent moments (the `accent1` red)

Red is used in small elements only, never as a full-slide background, and at most one red moment per content slide so it keeps meaning "look here".

| Moment | Rule |
| --- | --- |
| Chapter opener | Small 0.75 in `accent1` block with the chapter number in `bg1`, above the title. The background stays light |
| Big-number tiles | 54 pt display-face value over a 16 pt caption. `bg2` tiles, with the one surprising value as an `accent1` tile |
| Takeaway band | One sentence, 20 pt `bg1` on `accent1`, under a table. Never on a slide that already has a red tile or focus box |
| Focus box | The decision in a diagram (see Diagram) |

## Covers

Only the dark and the white cover are approved. No red cover or closing background.

## Slide catalogue

| Need | Layout |
| --- | --- |
| Deck opening | `NA Cover Dark` or `NA Cover Light` |
| Chapter | `NA Section Divider Light` |
| Statement or one idea | `NA Title and Body Light` |
| Flow, scope, architecture, sequence | `NA Diagram Light` |
| Screenshot with commentary | `NA Diagram Light` |
| Terms, questions, risks, comparison with rows | `NA Structured Table Light` |
| Two sides | `NA Comparison Light` |
| Break or close | `NA Closing Dark` |

Dark layouts are for opening, break and close only. Content stays on light.

## Content rules

- Use the client's real cases, not generic ones.
- Facts, names and numbers come from named sources. Mark anything unverified in the notes, not on the slide.
- The title says what the slide is about, in under 70 characters, with no trailing marker text.
- One idea per slide. Body text 16 pt or larger.
- Language follows the audience. Product UI terms stay in the UI's language.
- Speaker notes on every content slide: what to say, what to do on screen, timing.

## Process

1. Agree the outline (slide list, one line each, timing) before building. Most hand-edit time goes into the slide set, not styling.
2. Build on the template with real placeholders.
3. Lint: zero errors.
4. Render and look at every slide.
5. Hand over with a list of missing captures and unverified facts.

## Open

- Screenshot shadow setting.
- Footer design. The template footer is a placeholder-level treatment and needs a proper pass.
- Chart, KPI, timeline and quote layouts: build when a deck needs one.
