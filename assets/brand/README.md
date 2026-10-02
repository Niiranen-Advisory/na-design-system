# Brand marks

| File | Use |
| --- | --- |
| `na-monogram.svg` | The master. Letters follow `currentColor`, slash is oxblood. Light grounds |
| `na-monogram-reversed.svg` | One colour, all white. Dark grounds where the slash must not be a second colour |
| `na-monogram-dark.svg` | White letters, rust slash, transparent. The mark as used on dark surfaces |
| `na-monogram-plate.svg` / `.png` | The dark-ground mark centred on the `#0b0b0b` plate, square. Avatars and app icons. The GitHub organisation avatar is this |
| `na-wordmark.svg` | "Niiranen/Advisory", letters `currentColor`, oxblood slash |
| `na-wordmark-reversed.svg` | One-colour reversed wordmark |
| `favicon.svg` | Square, follows `prefers-color-scheme` |

The dark and plate variants are derived from the master by `scripts/cut-brand.mjs`. Change the master and re-run it; do not edit them by hand. The plate PNG is a 512px render of the plate SVG, made in a browser, and has to be re-rendered when the SVG changes.

Colors in the dark variants are the plate tokens: ground `#0b0b0b`, letters `#ffffff`, slash `#d06a4e`.
