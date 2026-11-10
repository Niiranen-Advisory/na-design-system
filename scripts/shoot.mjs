#!/usr/bin/env node
/*
  Render an artifact HTML file to an exact-size PNG with headless Chrome or Chromium.
  No npm dependencies. Fails when the PNG is not the requested size or the page reports overflow.

    node scripts/shoot.mjs grid.html grid.png [--size 1600x1200]

  Size defaults to the artboard size in the file's content JSON, else 1600x1200.
  Chrome is found from $CHROME, a Playwright cache, or the PATH. The page marks itself
  ready (data-ready) and overflow-free (data-overflow="no") once fonts have loaded; this
  script reads both from the dumped DOM. Web fonts load from Google Fonts, so a machine
  without network renders the fallback fonts: check the result by eye.
  Manual fallback: open the file, hide browser chrome, screenshot the #artboard element.
*/
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const sI = args.indexOf('--size');
const pos = args.filter((a, i) => !a.startsWith('--') && !(sI >= 0 && i === sI + 1));
if (pos.length < 2) { console.error('usage: shoot.mjs file.html out.png [--size WxH]'); process.exit(2); }
const [src, out] = pos.map((p) => resolve(p));
const html = readFileSync(src, 'utf8');
let size = sI >= 0 ? args[sI + 1] : null;
if (!size) { const m = html.match(/"size":\s*\[\s*(\d+),\s*(\d+)\s*\]/); size = m ? `${m[1]}x${m[2]}` : '1600x1200'; }
const [W, H] = size.split('x').map(Number);

function findChrome() {
  if (process.env.CHROME && existsSync(process.env.CHROME)) return process.env.CHROME;
  const pw = join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(pw)) {
    const dirs = readdirSync(pw).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const d of dirs) for (const sub of ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-win/chrome.exe'])
      if (existsSync(join(pw, d, sub))) return join(pw, d, sub);
  }
  for (const c of ['google-chrome', 'chromium', 'chromium-browser', 'chrome']) {
    try { return execFileSync('which', [c], { encoding: 'utf8' }).trim(); } catch {}
  }
  throw new Error('No Chrome or Chromium found. Set CHROME=/path/to/chrome.');
}
const chrome = findChrome();
const url = 'file://' + src;
const base = ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=8000'];

const dom = execFileSync(chrome, [...base, '--dump-dom', url], { encoding: 'utf8', timeout: 60000, maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
const ready = /data-ready="yes"/.test(dom);
const overflow = /data-overflow="yes"/.test(dom);
execFileSync(chrome, [...base, `--window-size=${W},${H}`, `--screenshot=${out}`, url], { timeout: 60000, stdio: 'ignore' });

const png = readFileSync(out);
const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
const problems = [];
if (w !== W || h !== H) problems.push(`PNG is ${w}x${h}, wanted ${W}x${H}`);
if (!ready) problems.push('page never reported ready (script error or fonts hung)');
if (overflow) problems.push('content overflows a tile, panel or the artboard');
console.log(`${out}  ${w}x${h}  ready=${ready}  overflow=${overflow}`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
