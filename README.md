# N/A Design System

The design system behind Niiranen Advisory productions: tokens, brand marks, and a small kit of identity pieces that drop into pages, decks, apps and one-file tools.

This repository holds the approved essentials only. Work in progress, studies and history live elsewhere.

## Use it

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="palettes/licensing-guide.css"> <!-- optional brand -->
<link rel="stylesheet" href="spice.css">
```

`tokens.css` carries structure and the default N/A palette. A palette file overrides only color and font values on the same slot names. `spice.css` is optional and works on top of either.

Open `examples/spice.html` to see every piece and switch brand.

## What is here

| Path | What |
| --- | --- |
| `tokens.css` | Structural tokens and the default palette |
| `palettes/` | Perspectives and Licensing Guide brands |
| `spice.css` | Window, cut, hatch, glyph |
| `SPICE.md` | The rules for using them |
| `assets/brand/` | Monogram (light, reversed, dark, and the square plate), wordmark and favicon. See its README |
| `assets/artifacts/` | Generated SVGs: cut, crop, hatch band, receipt, coverage, checkbox, sheet, hatch chart. Each in light and `-dark` |
| `scripts/cut-artifacts.mjs` | Regenerates `assets/artifacts/`. No dependencies |
| `scripts/cut-brand.mjs` | Derives the dark monogram and plate icon from the master |
| `examples/spice.html` | Demo page |

## Regenerate artifacts

```sh
node scripts/cut-artifacts.mjs
```

The text in the artifacts lives in `CONTENT` at the top of the script. Never edit the generated SVGs by hand.

## Status

Early. The tokens, palettes and brand marks are carried over unchanged from the working repository. The spice kit is new and is the first thing built for this one. Still to come once cleaned: the full rules document, the shadcn adapter, the presentation layer and the deck templates.

## License

[CC BY-NC-ND 4.0](LICENSE). Free to read, learn from, take inspiration from, and share unmodified with credit for noncommercial purposes. Not free to take and run with as your own design system. The brand marks in `assets/brand/` are not licensed at all. See [NOTICE.md](NOTICE.md).
