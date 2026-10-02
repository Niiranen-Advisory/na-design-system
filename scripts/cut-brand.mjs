#!/usr/bin/env node
/*
  Derives the dark monogram variants from the master na-monogram.svg.

    node scripts/cut-brand.mjs

  Writes to assets/brand/:
    na-monogram-dark.svg    white letters, plate-accent slash, transparent.
                            For placing on a dark ground. This is the mark
                            as used on dark surfaces such as the GitHub
                            organisation avatar.
    na-monogram-plate.svg   the same mark centred on a square #0b0b0b plate.
                            Avatars, app icons, social profile images.

  Never edit these by hand: change the master and re-run. The PNG companion
  of the plate (na-monogram-plate.png, 512px) is rendered from the SVG in a
  browser; see assets/brand/README.md.
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BRAND = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'brand');
const PLATE = '#0b0b0b'; // --na-color-plate-bg
const LETTERS = '#ffffff'; // --na-color-plate-ink
const SLASH = '#d06a4e'; // --na-color-plate-accent

const master = readFileSync(join(BRAND, 'na-monogram.svg'), 'utf8');
const vb = master.match(/viewBox="([\d.\s-]+)"/)?.[1];
const paths = [...master.matchAll(/<path d="([^"]+)"[^>]*transform="([^"]+)"/g)];
const rect = master.match(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*transform="([^"]+)"/);
if (!vb || paths.length !== 2 || !rect) throw new Error('na-monogram.svg shape changed; update cut-brand.mjs');

const mark = (letters, slash) =>
  `<path d="${paths[0][1]}" fill="${letters}" transform="${paths[0][2]}"/>
<rect x="${rect[1]}" y="${rect[2]}" width="${rect[3]}" height="${rect[4]}" fill="${slash}" transform="${rect[5]}"/>
<path d="${paths[1][1]}" fill="${letters}" transform="${paths[1][2]}"/>`;

writeFileSync(join(BRAND, 'na-monogram-dark.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="N/A — Niiranen Advisory">
<title>N/A monogram, dark-ground variant</title>
${mark(LETTERS, SLASH)}
</svg>
`);

// Square plate: the mark at 66% of the width, centred.
const [, , vw, vh] = vb.split(/\s+/).map(Number);
const S = 512, w = S * 0.66, h = (w * vh) / vw, x = (S - w) / 2, y = (S - h) / 2;
writeFileSync(join(BRAND, 'na-monogram-plate.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="N/A — Niiranen Advisory">
<title>N/A monogram on the identity plate</title>
<rect width="${S}" height="${S}" fill="${PLATE}"/>
<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${vb}">
${mark(LETTERS, SLASH)}
</svg>
</svg>
`);
console.log('cut na-monogram-dark.svg, na-monogram-plate.svg');
