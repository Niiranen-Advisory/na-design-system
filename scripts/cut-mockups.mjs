#!/usr/bin/env node
/*
  Cuts the N/A mockups into assets/mockups/.

    node scripts/cut-mockups.mjs                       frames, screens and composed laptops
    node scripts/cut-mockups.mjs --screen shot.png     also compose one laptop around a PNG screenshot
                                                       (16:10, shown in the 1440 x 900 slot, embedded as base64)

  No dependencies. Three kinds of output:

    frames/laptop.svg            hardware only, with an empty 1440 x 900 screen slot (id="screen-slot")
    screens/<name>.svg           a flat app screen, 1440 x 900, colours as var(--na-color-*, fallback)
    out/laptop-<name>[-dark].svg frame x screen x palette, composed

  The hardware is staged (gradients, noise, blur, glare). The screen content
  is not: it is flat, one accent, square corners, like everything else here.
  See SPICE.md, "Mockups".

  Composed files are "baked": every var() is resolved to its fallback and the
  two fonts are embedded as base64 (OFL, assets/mockups/fonts/). They then look
  the same as an <img>, in Office and in a browser. The standalone screen keeps
  the variables so it follows a page's brand when inlined.

  Text in the screen is content: edit CONTENT and re-run. Never edit the SVGs by hand.
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SLASH, PALETTES, MONO, v, f, esc, bake } from './lib/palettes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'assets', 'mockups');
for (const d of ['frames', 'screens', 'out']) mkdirSync(join(DIR, d), { recursive: true });

// ---- content ---------------------------------------------------------
const CONTENT = {
  title: 'Tenant review',
  tenant: 'contoso.onmicrosoft.com · read-only',
  nav: ['Environments', 'Connectors', 'DLP policies', 'Licensing', 'Makers', 'Findings'],
  navActive: 'Licensing',
  snapshot: 'Snapshot 23 Oct 2026',
  heading: 'Licensing coverage',
  lede: 'Premium connectors in use, matched against assigned licences.',
  stats: [['Environments', '38'], ['Apps on premium connectors', '47'], ['Users without coverage', '12'], ['Pay-as-you-go linked', 'N/A']],
  statHot: 2,
  chart: {
    title: 'Apps by environment type',
    keys: ['Standard', 'Premium'],
    bars: [['Default', 64, 9], ['Production', 41, 22], ['Sandbox', 23, 11], ['Developer', 30, 5], ['Trial', 8, 0]],
  },
  table: {
    title: 'Findings',
    head: ['Environment', 'Apps', 'Gap', 'Status'],
    rows: [
      ['Sales Hub PROD', '14', '6 users', 'Open'],
      ['Field Service', '9', '4 users', 'Open'],
      ['HR Onboarding', '6', '2 users', 'Review'],
      ['Default', '11', '0', 'Covered'],
      ['Finance Sandbox', '3', 'N/A', 'Not applicable'],
      ['Dev — jdoe', '4', 'N/A', 'Not applicable'],
    ],
  },
  note: '12 users need a Premium licence before the renewal on 1 Dec.',
  buttons: ['Assign later', 'Export findings'],
};

const FONT_FILES = [
  ['NA Display', 400, 'dm-serif-display-latin-400-normal.woff2'],
  ['NA Text', 400, 'ibm-plex-serif-latin-400-normal.woff2'],
  ['NA Text', 600, 'ibm-plex-serif-latin-600-normal.woff2'],
];
const DISPLAY = "'NA Display','DM Serif Display',Georgia,serif";
const TEXT = "'NA Text','IBM Plex Serif',Georgia,serif";
const UI = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

const fontCss = () => FONT_FILES.map(([fam, w, file]) =>
  `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${readFileSync(join(DIR, 'fonts', file)).toString('base64')}) format('woff2');}`).join('\n');

// ---- screen (1440 x 900, flat) ------------------------------------------
function monogram(x, y, h, letters, slash) {
  const src = readFileSync(join(ROOT, 'assets', 'brand', 'na-monogram.svg'), 'utf8');
  const paths = [...src.matchAll(/<path d="([^"]+)"[^>]*transform="([^"]+)"/g)];
  const rect = src.match(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*transform="([^"]+)"/);
  if (paths.length !== 2 || !rect) throw new Error('na-monogram.svg shape changed; update monogram()');
  return `<g transform="translate(${x},${y}) scale(${(h / 120.32).toFixed(4)}) translate(-13.22,-3.84)">
<path class="${letters}" d="${paths[0][1]}" transform="${paths[0][2]}"/>
<rect class="${slash}" x="${rect[1]}" y="${rect[2]}" width="${rect[3]}" height="${rect[4]}" transform="${rect[5]}"/>
<path class="${letters}" d="${paths[1][1]}" transform="${paths[1][2]}"/></g>`;
}

function screenStyle(p) {
  return `.bg{fill:${v('bg', p.bg)}}.rz{fill:${v('bg-raised', p.raised)}}.ink{fill:${v('ink', p.ink)}}
.mut{fill:${v('ink-muted', p.muted)}}.acc{fill:${v('accent', p.accent)}}.bd{fill:${v('border', p.border)}}
.pbg{fill:${v('plate-bg', p.plateBg)}}.pi{fill:${v('plate-ink', p.plateInk)}}.pm{fill:${v('plate-ink-muted', p.plateMuted)}}.pac{fill:${v('plate-accent', p.plateAccent)}}
.on-acc{fill:${v('accent-ink', '#ffffff')}}
.sl{stroke:${v('ink', p.ink)}}.sb{stroke:${v('border', p.border)}}
.disp{font-family:${DISPLAY}}.txt{font-family:${TEXT}}.ui{font-family:${UI}}.mono{font-family:${MONO}}`;
}

function screenBody(p) {
  const C = CONTENT, o = [], a = (s) => o.push(s), X = 280;
  a(`<defs><pattern id="na-hatch-ink-screen" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${SLASH})"><rect width="3" height="9" fill="${v('ink', p.ink)}"/></pattern></defs>`);
  a(`<rect class="bg" width="1440" height="900"/>`);
  // plate masthead
  a(`<rect class="pbg" width="1440" height="64"/>`);
  a(monogram(28, 16, 32, 'pi', 'pac'));
  a(`<text class="pi disp" x="100" y="42" font-size="24">${esc(C.title)}</text>`);
  a(`<text class="pm mono" x="1412" y="40" text-anchor="end" font-size="14">${esc(C.tenant)}</text>`);
  // left nav
  a(`<rect class="bg" x="0" y="64" width="232" height="836"/><rect class="bd" x="231" y="64" width="1" height="836"/>`);
  C.nav.forEach((n, i) => {
    const y = 118 + i * 46, sel = n === C.navActive;
    if (sel) a(`<rect class="rz" x="0" y="${y - 28}" width="231" height="42"/><rect class="ink" x="0" y="${y - 28}" width="4" height="42"/>`);
    a(`<text class="ui ${sel ? 'ink' : 'mut'}" x="32" y="${y}" font-size="17" font-weight="${sel ? 600 : 400}">${esc(n)}</text>`);
  });
  a(`<text class="mut mono" x="32" y="860" font-size="13">${esc(C.snapshot)}</text>`);
  a(`<text class="ink disp" x="${X}" y="138" font-size="46">${esc(C.heading)}</text>`);
  a(`<text class="mut txt" x="${X}" y="176" font-size="18">${esc(C.lede)}</text>`);
  // stat row: the accent is saved for the button
  C.stats.forEach(([lab, val], i) => {
    const x = X + i * 280, hot = i === C.statHot;
    a(`<rect class="bg ${hot ? 'sl' : 'sb'}" x="${x}" y="208" width="262" height="116" stroke-width="${hot ? 2 : 1}"/>`);
    a(`<text class="mut ui" x="${x + 20}" y="242" font-size="14">${esc(lab)}</text>`);
    a(`<text class="ink disp" x="${x + 20}" y="302" font-size="50">${esc(val)}</text>`);
  });
  // chart: hatch vs solid ink, no extra hues
  const cx = X, cy = 356, cw = 520, ch = 380, ct = C.chart;
  a(`<rect class="bg sb" x="${cx}" y="${cy}" width="${cw}" height="${ch}"/>`);
  a(`<text class="ink txt" x="${cx + 20}" y="${cy + 36}" font-size="18" font-weight="600">${esc(ct.title)}</text>`);
  a(`<rect class="sl" x="${cx + 20}" y="${cy + 54}" width="14" height="14" fill="url(#na-hatch-ink-screen)" stroke-width="1.5"/><text class="mut ui" x="${cx + 42}" y="${cy + 66}" font-size="13">${esc(ct.keys[0])}</text>`);
  a(`<rect class="ink" x="${cx + 122}" y="${cy + 54}" width="14" height="14"/><text class="mut ui" x="${cx + 144}" y="${cy + 66}" font-size="13">${esc(ct.keys[1])}</text>`);
  const base = cy + 330;
  ct.bars.forEach(([lab, std, prem], i) => {
    const bx = cx + 40 + i * 94, hs = std * 3, hp = prem * 3;
    a(`<rect class="sl" x="${bx}" y="${Math.round(base - hs - hp)}" width="56" height="${Math.round(hs)}" fill="url(#na-hatch-ink-screen)" stroke-width="1.5"/>`);
    if (hp) a(`<rect class="ink" x="${bx}" y="${Math.round(base - hp)}" width="56" height="${Math.round(hp)}"/>`);
    a(`<text class="mut ui" x="${bx + 28}" y="${base + 26}" text-anchor="middle" font-size="13">${esc(lab)}</text>`);
  });
  a(`<rect class="ink" x="${cx + 24}" y="${base}" width="${cw - 48}" height="1.5"/>`);
  // table
  const tx = X + 548, ty = 356, tw = 584, tb = C.table;
  a(`<rect class="bg sb" x="${tx}" y="${ty}" width="${tw}" height="380"/>`);
  a(`<text class="ink txt" x="${tx + 20}" y="${ty + 36}" font-size="18" font-weight="600">${esc(tb.title)}</text>`);
  const cols = [tx + 20, tx + 250, tx + 330, tx + 420];
  tb.head.forEach((h, i) => a(`<text class="mut ui" x="${cols[i]}" y="${ty + 76}" font-size="13" font-weight="600">${esc(h.toUpperCase())}</text>`));
  a(`<rect class="ink" x="${tx + 20}" y="${ty + 88}" width="${tw - 40}" height="1.5"/>`);
  tb.rows.forEach((r, i) => {
    const y = ty + 124 + i * 44;
    r.forEach((cell, k) => a(`<text class="${/^N\/A$|^Not applicable$/.test(cell) ? 'mut' : 'ink'} mono" x="${cols[k]}" y="${y}" font-size="15">${esc(cell)}</text>`));
    a(`<rect class="bd" x="${tx + 20}" y="${y + 16}" width="${tw - 40}" height="1"/>`);
  });
  // action row: one accent
  a(`<text class="mut txt" x="${X}" y="800" font-size="17">${esc(C.note)}</text>`);
  a(`<rect class="acc" x="${X + 884}" y="770" width="248" height="52"/>`);
  a(`<text class="on-acc ui" x="${X + 1008}" y="803" text-anchor="middle" font-size="17" font-weight="600">${esc(C.buttons[1])}</text>`);
  a(`<rect class="bg sl" x="${X + 716}" y="770" width="152" height="52" stroke-width="2"/>`);
  a(`<text class="ink ui" x="${X + 792}" y="803" text-anchor="middle" font-size="17" font-weight="600">${esc(C.buttons[0])}</text>`);
  return o.join('\n');
}

// ---- laptop frame (1600 x 1060) -------------------------------------------
const W = 1600, H = 1060, CXM = 800;
const LID = { x: 318, y: 70, w: 964, h: 626 };
const SCR = { x: 346, y: 100, w: 908, h: 567.5 }; // the 1440 x 900 slot, scaled 0.63056
const DECK_Y0 = 708, DECK_Y1 = 908, HW0 = 505, HW1 = 640;
const P = (u, t) => [CXM + u * (HW0 + (HW1 - HW0) * t), DECK_Y0 + (DECK_Y1 - DECK_Y0) * Math.pow(t, 0.92)];
const quad = (u0, u1, t0, t1) => [P(u0, t0), P(u1, t0), P(u1, t1), P(u0, t1)].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function keyboard() {
  const o = [];
  const rows = [
    [1.5, ...Array(12).fill(1), 1.5],
    [...Array(13).fill(1), 2],
    [1.5, ...Array(12).fill(1), 1.5],
    [1.8, ...Array(11).fill(1), 2.2],
    [2.35, ...Array(10).fill(1), 2.65],
    [1, 1, 1, 1.25, 5.4, 1.25, 1, 3.0],
  ];
  const legends = { 1: [...'`1234567890-='], 2: ['', ...'QWERTYUIOP[]', ''], 3: ['', ...'ASDFGHJKL;\'', ''], 4: ['', ...'ZXCVBNM,./', ''] };
  const U0 = -0.8, U1 = 0.8, T0 = 0.06, T1 = 0.615, heights = [0.55, 1, 1, 1, 1, 1], tot = heights.reduce((s, x) => s + x), gap = 0.012;
  let t = T0;
  rows.forEach((row, ri) => {
    const th = ((T1 - T0) * heights[ri]) / tot, ta = t + gap * 0.5, tb = t + th - gap * 0.5, s = row.reduce((x, y) => x + y);
    let u = U0;
    row.forEach((kw, ki) => {
      const du = ((U1 - U0) * kw) / s, ua = u + 0.0045, ub = u + du - 0.0045;
      o.push(`<polygon points="${quad(ua, ub, ta, tb)}" fill="#0c0c0d"/>`);
      const cu = (ub - ua) * 0.06, ct = (tb - ta) * 0.1;
      o.push(`<polygon points="${quad(ua + cu, ub - cu, ta + ct * 0.4, tb - ct * 1.6)}" fill="url(#keycap)"/>`);
      o.push(`<polygon points="${quad(ua + cu, ub - cu, ta + ct * 0.4, ta + ct * 1.1)}" fill="#ffffff" fill-opacity="0.07"/>`);
      const leg = legends[ri];
      if (leg && ki < leg.length && leg[ki]) {
        const [x, y] = P((ua + ub) / 2, ta + (tb - ta) * 0.62), fs = 7.5 + 2.5 * ((ta - T0) / (T1 - T0));
        o.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="${UI}" font-size="${fs.toFixed(1)}" fill="#d9dadc" fill-opacity="0.85">${esc(leg[ki])}</text>`);
      }
      u += du;
    });
    t += th;
  });
  return o.join('\n');
}

function frame() {
  const deck = quad(-1, 1, 0, 1), well = quad(-0.825, 0.825, 0.045, 0.63), pad = quad(-0.3, 0.3, 0.685, 0.95);
  const lipL = P(-1, 1), lipR = P(1, 1), nL = P(-0.09, 1), nR = P(0.09, 1), n0 = (x) => x.toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Laptop on a desk">
<title>Laptop frame</title>
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dad8"/><stop offset="1" stop-color="#f2f2f0"/></linearGradient>
  <radialGradient id="wallLight" cx="0.5" cy="0.62" r="0.62"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfcdc8"/><stop offset="0.35" stop-color="#dcdad5"/><stop offset="1" stop-color="#b9b6b0"/></linearGradient>
  <radialGradient id="deskLight" cx="0.5" cy="0.15" r="0.7"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.07"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
  <filter id="woodgrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.22" numOctaves="3" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.10"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
  <filter id="softShadow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
  <filter id="contactShadow" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="glowSpill" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="brushed" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.9" numOctaves="2" seed="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.06"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
  <linearGradient id="lidRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3e4e6"/><stop offset="0.5" stop-color="#a9acb1"/><stop offset="1" stop-color="#d3d5d8"/></linearGradient>
  <linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151517"/><stop offset="1" stop-color="#0a0a0b"/></linearGradient>
  <linearGradient id="hinge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3b3e"/><stop offset="0.45" stop-color="#8d9095"/><stop offset="1" stop-color="#5d6064"/></linearGradient>
  <linearGradient id="deckTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8bbc0"/><stop offset="0.25" stop-color="#d2d4d8"/><stop offset="0.7" stop-color="#dfe1e4"/><stop offset="1" stop-color="#c9cbcf"/></linearGradient>
  <linearGradient id="deckSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.42" stop-color="#ffffff" stop-opacity="0.32"/><stop offset="0.58" stop-color="#ffffff" stop-opacity="0.12"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <linearGradient id="lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f2"/><stop offset="0.25" stop-color="#a7aaaf"/><stop offset="1" stop-color="#6b6e73"/></linearGradient>
  <linearGradient id="wellGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a9da2"/><stop offset="1" stop-color="#b5b8bc"/></linearGradient>
  <linearGradient id="keycap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2c2f"/><stop offset="1" stop-color="#1d1d20"/></linearGradient>
  <linearGradient id="padGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3c5c9"/><stop offset="1" stop-color="#d5d7da"/></linearGradient>
  <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.05"/><stop offset="0.15" stop-color="#000" stop-opacity="0"/><stop offset="0.85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.06"/></linearGradient>
  <clipPath id="scrClip"><rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}"/></clipPath>
</defs>

<!-- room -->
<rect width="${W}" height="640" fill="url(#wall)"/>
<rect width="${W}" height="640" fill="url(#wallLight)"/>
<rect width="${W}" height="640" fill="#000" filter="url(#grain)"/>
<rect y="640" width="${W}" height="${H - 640}" fill="url(#desk)"/>
<rect y="640" width="${W}" height="${H - 640}" fill="url(#deskLight)"/>
<rect y="640" width="${W}" height="${H - 640}" fill="#5a4e40" filter="url(#woodgrain)"/>
<rect y="638" width="${W}" height="3" fill="#b0aea9"/>

<!-- screen light spilling onto the desk, cast shadows -->
<ellipse cx="800" cy="700" rx="560" ry="70" fill="#ffffff" opacity="0.35" filter="url(#glowSpill)"/>
<ellipse cx="800" cy="935" rx="700" ry="46" fill="#1a1a18" opacity="0.30" filter="url(#softShadow)"/>
<polygon points="${Math.round(lipL[0] + 8)},${Math.round(lipL[1] + 18)} ${Math.round(lipR[0] - 8)},${Math.round(lipR[1] + 18)} ${Math.round(lipR[0] - 30)},${Math.round(lipR[1] + 30)} ${Math.round(lipL[0] + 30)},${Math.round(lipL[1] + 30)}" fill="#000" opacity="0.55" filter="url(#contactShadow)"/>

<!-- lid -->
<rect x="${LID.x}" y="${LID.y}" width="${LID.w}" height="${LID.h}" rx="24" fill="url(#lidRim)"/>
<rect x="${LID.x + 3}" y="${LID.y + 3}" width="${LID.w - 6}" height="${LID.h - 4}" rx="21" fill="url(#bezel)"/>
<circle cx="${CXM}" cy="${LID.y + 15}" r="3.2" fill="#232327"/><circle cx="${CXM}" cy="${LID.y + 15}" r="1.3" fill="#3b4a5c"/>

<!-- screen slot: 1440 x 900 content goes in #screen-slot; vignette and glare sit on top -->
<g clip-path="url(#scrClip)">
  <g id="screen-slot" transform="translate(${SCR.x},${SCR.y}) scale(${(SCR.w / 1440).toFixed(5)})"></g>
  <rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" fill="url(#vignette)"/>
  <polygon points="${SCR.x},${SCR.y} ${SCR.x + 560},${SCR.y} ${SCR.x + 190},${SCR.y + SCR.h} ${SCR.x},${SCR.y + SCR.h}" fill="url(#glare)"/>
</g>
<rect x="${SCR.x - 0.5}" y="${SCR.y - 0.5}" width="${SCR.w + 1}" height="${SCR.h + 1}" fill="none" stroke="#000" stroke-opacity="0.6"/>
<rect x="${LID.x + 3}" y="${LID.y + LID.h - 24}" width="${LID.w - 6}" height="22" fill="#111113"/>

<!-- hinge -->
<rect x="${CXM - HW0 + 40}" y="${LID.y + LID.h}" width="${2 * HW0 - 80}" height="${DECK_Y0 - LID.y - LID.h + 2}" fill="url(#hinge)"/>

<!-- deck -->
<polygon points="${deck}" fill="url(#deckTop)"/>
<polygon points="${deck}" fill="#000" filter="url(#brushed)"/>
<polygon points="${deck}" fill="url(#deckSheen)"/>
<path d="M${n0(lipL[0])},${n0(lipL[1])} L${n0(lipR[0])},${n0(lipR[1])} Q${n0(lipR[0] + 4)},${n0(lipR[1] + 12)} ${n0(lipR[0] - 14)},${n0(lipR[1] + 20)} L${n0(lipL[0] + 14)},${n0(lipL[1] + 20)} Q${n0(lipL[0] - 4)},${n0(lipL[1] + 12)} ${n0(lipL[0])},${n0(lipL[1])} Z" fill="url(#lip)"/>
<path d="M${n0(nL[0])},${n0(nL[1])} Q${CXM},${n0(nL[1] + 10)} ${n0(nR[0])},${n0(nR[1])}" fill="#9a9da2" opacity="0.7"/>
<line x1="${n0(lipL[0] + 2)}" y1="${n0(lipL[1] + 0.5)}" x2="${n0(lipR[0] - 2)}" y2="${n0(lipR[1] + 0.5)}" stroke="#fff" stroke-opacity="0.8" stroke-width="1.2"/>
<!-- keyboard well, keys, trackpad -->
<polygon points="${well}" fill="url(#wellGrad)"/>
<polygon points="${well}" fill="none" stroke="#7d8085" stroke-width="1"/>
${keyboard()}
<polygon points="${pad}" fill="url(#padGrad)" stroke="#a3a6ab" stroke-width="1.2"/>
<polygon points="${pad}" fill="url(#deckSheen)" opacity="0.6"/>
<!-- speaker grilles -->
<polygon points="${quad(-0.93, -0.85, 0.06, 0.61)}" fill="#a6a9ae" opacity="0.35"/>
<polygon points="${quad(0.85, 0.93, 0.06, 0.61)}" fill="#a6a9ae" opacity="0.35"/>
</svg>
`;
}

// ---- compose ---------------------------------------------------------------
function compose(frameSvg, inner, styleCss, label) {
  let s = frameSvg.replace('<g id="screen-slot"', '<g id="screen-slot"').replace(/(<g id="screen-slot"[^>]*>)<\/g>/, `$1${inner}</g>`);
  s = s.replace('<defs>', `<style>\n${fontCss()}\n${styleCss}\n</style>\n<defs>`);
  s = s.replace(/aria-label="Laptop on a desk"/, `aria-label="${esc(label)}"`).replace('<title>Laptop frame</title>', `<title>${esc(label)}</title>`);
  return bake(s);
}

const frameSvg = frame();
writeFileSync(join(DIR, 'frames', 'laptop.svg'), frameSvg);
let n = 1;
for (const [pal, p] of Object.entries(PALETTES)) {
  const style = screenStyle(p), body = screenBody(p), suffix = pal === 'dark' ? '-dark' : '';
  writeFileSync(join(DIR, 'screens', `licensing-coverage${suffix}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900" role="img" aria-label="${esc(CONTENT.heading)}: tenant review screen"><style>\n${fontCss()}\n${style}\n</style>\n${body}\n</svg>\n`);
  writeFileSync(join(DIR, 'out', `laptop-licensing-coverage${suffix}.svg`),
    compose(frameSvg, body, style, 'Laptop on a desk showing a Power Platform licensing coverage report in the N/A design system'));
  n += 2;
}

const i = process.argv.indexOf('--screen');
if (i > 0) {
  const png = process.argv[i + 1];
  if (!png) throw new Error('--screen needs a PNG path');
  const b64 = readFileSync(png).toString('base64');
  const inner = `<rect class="bg" width="1440" height="900"/><image width="1440" height="900" preserveAspectRatio="xMidYMin slice" href="data:image/png;base64,${b64}"/>`;
  const name = basename(png).replace(/\.png$/i, '');
  writeFileSync(join(DIR, 'out', `laptop-${name}.svg`), compose(frameSvg, inner, screenStyle(PALETTES.light), `Laptop on a desk showing ${name}`));
  n++;
}
console.log(`cut ${n} mockup files into ${DIR}`);
