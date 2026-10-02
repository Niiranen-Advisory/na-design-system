#!/usr/bin/env node
/*
  Cuts the N/A artifact SVGs into assets/artifacts/.

    node scripts/cut-artifacts.mjs

  No dependencies. Every colour is a CSS custom property with a baked-in
  fallback, so a file inlined in a page follows the page's brand tokens,
  while the same file used as an <img> shows the fallback palette. Each
  artifact is cut twice: default (light) and `-dark` (Licensing Guide).

  Text in the artifacts is content, not structure: edit CONTENT below and
  re-run. The generated SVG is never edited by hand.
  Fonts: system monospace only, so the files render the same anywhere.
  The crop outlines the monogram paths from assets/brand/na-monogram.svg.
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'artifacts');
mkdirSync(OUT, { recursive: true });

const SLASH = 20; // degrees, the brand slash
const TAN = Math.tan((SLASH * Math.PI) / 180);

// ---- content ---------------------------------------------------------
const CONTENT = {
  cut: { left: 'what the page says', right: 'what the invoice says' },
  receipt: {
    caption: 'LICENSING GUIDE · TABLE 3 · EXCERPT',
    rows: [
      ['Dataverse capacity', 'included', 'see note 4'],
      ['note 4', '', 'see note 7'],
      ['note 7', '', 'it depends'], // the highlighted row
      ['Premium connector', 'per user', 'per flow'],
      ['AI credits', 'pooled', 'not here'],
    ],
    hotRow: 2,
    footnote: '1 · the footnote that explains the footnote',
  },
  coverage: { a: 'user licence', b: 'capacity', c: 'pay-as-you-go', you: 'your scenario' },
  checkbox: {
    caption: 'COMPLIANCE FORM · SECTION 4',
    question: ['4.2  Does this licence cover your', 'scenario?'],
    options: ['Yes', 'No', 'N/A'],
    checked: 2,
    footer: 'Signed: ____________________   Date: __________',
  },
  sheet: {
    caption: 'ILLUSTRATIVE VALUES',
    rows: [
      ['', 'Licence', 'Dataverse', 'Premium', 'Agents'],
      ['1', 'Per user', '250 MB', 'yes', 'N/A'],
      ['2', 'Per app', '50 MB', 'yes', 'N/A'],
      ['3', 'PAYG', 'N/A', 'N/A', 'metered'],
      ['4', 'M365', 'N/A', 'no', 'N/A'],
      ['5', 'Trial', 'N/A', 'N/A', 'N/A'],
    ],
  },
  chart: { keys: ['hatch', 'solid ink', 'accent'], groups: ['Q1', 'Q2', 'Q3', 'Q4'] },
};

// ---- palettes (fallbacks baked into each file) -----------------------
const PALETTES = {
  light: {
    bg: '#ffffff', raised: '#eeeeeb', ink: '#1a1a18', muted: '#55534d', border: '#cfccc3',
    accent: '#7a2e1c', plateBg: '#0b0b0b', plateBorder: '#2c2a27', plateAccent: '#d06a4e',
  },
  dark: {
    bg: '#181110', raised: '#241a17', ink: '#efe9e6', muted: '#a89f9a', border: '#3a2c27',
    accent: '#e07a4f', plateBg: '#000000', plateBorder: '#262320', plateAccent: '#e07a4f',
  },
};

const MONO = 'SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace';
const v = (name, fb) => `var(--na-color-${name},${fb})`;
const f = (n) => +n.toFixed(1);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function make(p) {
  const style = `<style>
.bg{fill:${v('bg', p.bg)}}.rz{fill:${v('bg-raised', p.raised)}}.ink{fill:${v('ink', p.ink)}}
.mut{fill:${v('ink-muted', p.muted)}}.acc{fill:${v('accent', p.accent)}}.bd{fill:${v('border', p.border)}}
.pbg{fill:${v('plate-bg', p.plateBg)}}.pbd{fill:${v('plate-border', p.plateBorder)}}.pac{fill:${v('plate-accent', p.plateAccent)}}
.ln{stroke:${v('ink', p.ink)};fill:none}.lm{stroke:${v('ink-muted', p.muted)};fill:none}
.la{stroke:${v('accent', p.accent)};fill:none}.lb{stroke:${v('border', p.border)};fill:none}
.t{font:500 15px ${MONO}}.ts{font:500 12px ${MONO}}.tl{font:500 20px ${MONO}}
</style>`;
  const defs = `<defs>
<pattern id="na-hatch-accent" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${SLASH})"><rect width="2.6" height="9" fill="${v('accent', p.accent)}"/></pattern>
<pattern id="na-hatch-ink" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${SLASH})"><rect width="2.6" height="9" fill="${v('ink', p.ink)}"/></pattern>
</defs>`;
  const svg = (w, h, body, label) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${style}${defs}${body}</svg>\n`;
  const bgInk = `style="fill:${v('bg', p.bg)}"`;
  const slash = (cx, cy, len, w, cls) =>
    `<rect class="${cls}" x="${f(cx - w / 2)}" y="${f(cy - len / 2)}" width="${w}" height="${len}" transform="rotate(${SLASH} ${cx} ${cy})"/>`;

  // CUT: split field on the slash
  const cut = () => {
    const W = 1200, H = 630, cx = 700, top = cx + (H / 2) * TAN, bot = cx - (H / 2) * TAN;
    return svg(W, H, `<rect class="bg" width="${W}" height="${H}"/>
<polygon class="pbg" points="0,0 ${f(top)},0 ${f(bot)},${H} 0,${H}"/>
<rect class="pac" x="${cx - 14}" y="-60" width="28" height="${H + 120}" transform="rotate(${SLASH} ${cx} ${H / 2})"/>
<text class="t" x="48" y="${H - 48}" style="fill:#fff">${esc(CONTENT.cut.left)}</text>
<text class="t ink" x="${W - 48}" y="${H - 48}" text-anchor="end">${esc(CONTENT.cut.right)}</text>`,
      `Split field: ${CONTENT.cut.left} versus ${CONTENT.cut.right}`);
  };

  // CROP: monogram cropped by the frame, tone on tone
  const crop = () => {
    const src = readFileSync(join(ROOT, 'assets', 'brand', 'na-monogram.svg'), 'utf8');
    const paths = [...src.matchAll(/<path d="([^"]+)"[^>]*transform="([^"]+)"/g)];
    const rect = src.match(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*transform="([^"]+)"/);
    if (paths.length !== 2 || !rect) throw new Error('na-monogram.svg shape changed; update crop()');
    const W = 1200, H = 630;
    return svg(W, H, `<rect class="pbg" width="${W}" height="${H}"/>
<g transform="translate(-170 -420) scale(9.4)">
<path class="pbd" d="${paths[0][1]}" transform="${paths[0][2]}"/>
<rect class="pac" x="${rect[1]}" y="${rect[2]}" width="${rect[3]}" height="${rect[4]}" transform="${rect[5]}"/>
<path class="pbd" d="${paths[1][1]}" transform="${paths[1][2]}"/>
</g>`, 'Oversized N/A monogram cropped by the frame, tone on tone, with an accent slash');
  };

  // HATCH BAND: tonal ramp from line weight only
  const hatchBand = () => {
    const W = 1200, H = 240, step = 16;
    let bars = '';
    for (let x = -260; x < W + 260; x += step) {
      const t = Math.min(1, Math.max(0, (x + 260) / (W + 520)));
      bars += `<rect x="${f(x)}" y="-200" width="${f(0.6 + t * (step - 2.2))}" height="${H + 400}"/>`;
    }
    return svg(W, H, `<rect class="bg" width="${W}" height="${H}"/><g class="ink" transform="rotate(${SLASH} ${W / 2} ${H / 2})">${bars}</g>`,
      'Slashed hatch band whose line weight increases left to right');
  };

  // RECEIPT: document fragment
  const receipt = () => {
    const W = 680, H = 440, c = CONTENT.receipt;
    let y = 128, rows = '';
    c.rows.forEach((r, i) => {
      const hot = i === c.hotRow;
      rows += `<line class="lb" x1="40" x2="${W - 40}" y1="${y + 18}" y2="${y + 18}" stroke-width="1.5"/>
<text class="t ${hot ? 'acc' : 'ink'}" x="48" y="${y}">${esc(r[0])}</text>
<text class="t mut" x="330" y="${y}">${esc(r[1])}</text>
<text class="t ${hot ? 'acc' : 'mut'}" x="${W - 84}" y="${y}" text-anchor="end">${esc(r[2])}</text>`;
      if (hot) rows += `<rect class="acc" x="${W - 44}" y="${y - 15}" width="22" height="22"/><text class="ts" x="${W - 33}" y="${y + 1}" text-anchor="middle" ${bgInk}>1</text>`;
      y += 52;
    });
    return svg(W, H, `<rect class="bg" width="${W}" height="${H}"/>
<rect class="ln" x="20" y="20" width="${W - 40}" height="${H - 40}" stroke-width="2"/>
<text class="ts mut" x="48" y="62">${esc(c.caption)}</text>
<line class="ln" x1="40" x2="${W - 40}" y1="80" y2="80" stroke-width="2.5"/>${rows}
<text class="ts mut" x="48" y="${H - 44}">${esc(c.footnote)}</text>`,
      'Document excerpt where a licensing footnote refers to another footnote');
  };

  // COVERAGE: overlapping boundaries, scenario outside
  const coverage = () => {
    const W = 680, H = 440, c = CONTENT.coverage;
    return svg(W, H, `<rect class="bg" width="${W}" height="${H}"/>
<rect x="240" y="110" width="100" height="130" fill="url(#na-hatch-accent)"/>
<rect x="240" y="200" width="200" height="100" fill="url(#na-hatch-accent)"/>
<rect x="140" y="200" width="200" height="40" fill="url(#na-hatch-accent)"/>
<rect class="acc" x="240" y="200" width="100" height="40"/>
<rect class="ln" x="40" y="50" width="300" height="190" stroke-width="2.5"/>
<rect class="ln" x="240" y="110" width="300" height="190" stroke-width="2.5"/>
<rect class="ln" x="140" y="200" width="300" height="150" stroke-width="2.5"/>
<text class="t ink" x="52" y="78">${esc(c.a)}</text>
<text class="t ink" x="528" y="138" text-anchor="end">${esc(c.b)}</text>
<text class="t ink" x="152" y="338">${esc(c.c)}</text>
<rect class="ln" x="580" y="360" width="20" height="20" stroke-width="2.5"/>
<text class="ts mut" x="590" y="404" text-anchor="middle">${esc(c.you)}</text>`,
      'Three overlapping boundaries; a marked scenario sits outside all of them');
  };

  // CHECKBOX: the form question
  const checkbox = () => {
    const W = 680, H = 440, c = CONTENT.checkbox, xs = [48, 188, 318];
    const opt = (x, label, on) => `<rect class="ln" x="${x}" y="226" width="34" height="34" stroke-width="2.5"/>
${on ? `<rect class="acc" x="${x}" y="226" width="34" height="34"/><polyline points="${x + 8},243 ${x + 15},251 ${x + 27},235" fill="none" stroke="${v('bg', p.bg)}" stroke-width="4" stroke-linecap="square"/>` : ''}
<text class="tl ${on ? 'acc' : 'ink'}" x="${x + 46}" y="251">${esc(label)}</text>`;
    return svg(W, H, `<rect class="bg" width="${W}" height="${H}"/>
<rect class="ln" x="20" y="20" width="${W - 40}" height="${H - 40}" stroke-width="2"/>
<text class="ts mut" x="48" y="62">${esc(c.caption)}</text>
<line class="ln" x1="40" x2="${W - 40}" y1="80" y2="80" stroke-width="2.5"/>
<text class="t ink" x="48" y="134">${esc(c.question[0])}</text><text class="t ink" x="48" y="158">${esc(c.question[1])}</text>
${c.options.map((o, i) => opt(xs[i], o, i === c.checked)).join('')}
<line class="lb" x1="40" x2="${W - 40}" y1="330" y2="330" stroke-width="1.5"/>
<text class="ts mut" x="48" y="370">${esc(c.footer)}</text>`,
      `Form question with ${c.options[c.checked]} ticked`);
  };

  // SHEET: spreadsheet fragment, N/A cells carry the accent
  const sheet = () => {
    const W = 680, H = 440, x0 = 40, y0 = 70, cw = [60, 190, 130, 130, 90], rh = 44, c = CONTENT.sheet;
    let b = `<rect class="bg" width="${W}" height="${H}"/><text class="ts mut" x="${x0}" y="48">${esc(c.caption)}</text>`;
    c.rows.forEach((row, r) => {
      let x = x0;
      row.forEach((cell, i) => {
        const na = cell === 'N/A' && r > 0, head = r === 0 || i === 0;
        b += `<rect class="${na ? 'acc' : head ? 'rz' : 'bg'}" x="${x}" y="${y0 + r * rh}" width="${cw[i]}" height="${rh}"/><rect class="ln" x="${x}" y="${y0 + r * rh}" width="${cw[i]}" height="${rh}" stroke-width="1.5" style="stroke:${v('ink-muted', p.muted)}"/>`;
        b += `<text class="t ${na ? '' : head ? 'mut' : 'ink'}" ${na ? bgInk : ''} x="${x + 12}" y="${y0 + r * rh + 28}">${esc(cell)}</text>`;
        x += cw[i];
      });
    });
    return svg(W, H, b, 'Spreadsheet fragment where several cells read N/A and are filled in the accent colour');
  };

  // HATCH CHART: series by fill type, not by hue
  const hatchChart = () => {
    const W = 680, H = 440, base = 360, x0 = 80, c = CONTENT.chart;
    const vals = [[190, 120, 70], [230, 150, 100], [150, 170, 140], [260, 110, 60]];
    const fills = ['url(#na-hatch-accent)', v('ink', p.ink), v('accent', p.accent)];
    let b = `<rect class="bg" width="${W}" height="${H}"/><line class="ln" x1="${x0 - 20}" x2="${W - 40}" y1="${base}" y2="${base}" stroke-width="2.5"/>`;
    vals.forEach((g, gi) => {
      g.forEach((val, si) => {
        const x = x0 + gi * 140 + si * 34;
        b += `<rect x="${x}" y="${base - val}" width="30" height="${val}" fill="${fills[si]}"/><rect class="ln" x="${x}" y="${base - val}" width="30" height="${val}" stroke-width="2"/>`;
      });
      b += `<text class="ts mut" x="${x0 + gi * 140 + 50}" y="${base + 24}" text-anchor="middle">${esc(c.groups[gi])}</text>`;
    });
    c.keys.forEach((l, i) => {
      const x = 80 + i * 150;
      b += `<rect x="${x}" y="48" width="18" height="18" fill="${fills[i]}"/><rect class="ln" x="${x}" y="48" width="18" height="18" stroke-width="2"/><text class="ts ink" x="${x + 28}" y="62">${esc(l)}</text>`;
    });
    return svg(W, H, b, 'Bar chart with three series distinguished by hatch, solid ink and accent fill; illustrative values');
  };

  return { cut, crop, 'hatch-band': hatchBand, receipt, coverage, checkbox, sheet, 'hatch-chart': hatchChart };
}

let n = 0;
for (const [pal, p] of Object.entries(PALETTES)) {
  for (const [name, fn] of Object.entries(make(p))) {
    writeFileSync(join(OUT, `${name}${pal === 'dark' ? '-dark' : ''}.svg`), fn());
    n++;
  }
}
console.log(`cut ${n} artifacts into ${OUT}`);
