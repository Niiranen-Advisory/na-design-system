#!/usr/bin/env node
/*
  Taxonomy Grid: a finite set of real items sorted into factual groups, as one
  standalone HTML file (periodic-table style). No dependencies.

    node scripts/make-taxonomy-grid.mjs content.json [--out grid.html]

  The content JSON is embedded in the output. Open the file with #edit appended
  to the address to change labels and statuses in the browser and copy the
  updated JSON; the edit controls do not exist without #edit, so screenshots
  and prints never show them.

  content.json
    brand        "default" | "perspectives" | "licensing-guide"   (palettes/*.css)
    size         [width, height] in px, default [1600, 1200]
    title        optional string
    columns      group panels per row, default 2
    tileColumns  tiles per row inside a panel, default 2
    source       optional line at the foot, e.g. "Snapshot, October 2026"
    groups[]     { name, items[] }
    items[]      { name, id?, status?, qualifier?, emphasis? }
                 status: ga | preview | retiring | deprecated (optional, shown as text)

  Groups and statuses come from the source material. Never invent them to fill space.
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './lib/palettes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outI = args.indexOf('--out');
const inFile = args.find((a, i) => !a.startsWith('--') && !(outI >= 0 && i === outI + 1));
if (!inFile) { console.error('usage: make-taxonomy-grid.mjs content.json [--out grid.html]'); process.exit(2); }
const content = JSON.parse(readFileSync(resolve(inFile), 'utf8'));
const out = resolve(outI >= 0 ? args[outI + 1] : inFile.replace(/\.json$/, '.html'));

const [W, H] = content.size || [1600, 1200];
const columns = content.columns || 2;
const tileColumns = content.tileColumns || 2;
const groups = content.groups || [];
if (!groups.length) throw new Error('content.groups is empty');
const STATUSES = { ga: 'GA', preview: 'Preview', retiring: 'Retiring', deprecated: 'Deprecated' };
for (const g of groups) for (const it of g.items || []) {
  if (it.status && !STATUSES[it.status]) throw new Error(`unknown status "${it.status}" on "${it.name}"`);
}
const brand = content.brand || 'default';
const paletteCss = brand === 'default' ? '' : readFileSync(join(ROOT, 'palettes', `${brand}.css`), 'utf8');
const tokensCss = readFileSync(join(ROOT, 'tokens.css'), 'utf8');
const rows = Math.max(...groups.map((g) => Math.ceil((g.items || []).length / tileColumns)));
const panelRows = Math.ceil(groups.length / columns);

const tile = (it) => {
  const st = it.status || '';
  const label = st ? STATUSES[st] + (st === 'retiring' && it.qualifier && /^\d/.test(it.qualifier) ? ' ' + it.qualifier : '') : '';
  const qual = it.qualifier && !(st === 'retiring' && /^\d/.test(it.qualifier)) ? it.qualifier : '';
  return `<div class="tile${st ? ' is-' + st : ''}${it.emphasis ? ' is-emph' : ''}" data-status="${esc(st)}"${it.qualifier ? ` data-qual="${esc(it.qualifier)}"` : ''}>
  ${it.id ? `<span class="tid" data-f="id">${esc(it.id)}</span>` : ''}<span class="tname" data-f="name">${esc(it.name)}</span>
  ${label ? `<span class="tstatus" data-f="status">${esc(label)}</span>` : ''}${qual ? `<span class="tqual" data-f="qualifier">${esc(qual)}</span>` : ''}
</div>`;
};
const panel = (g) => `<section class="panel"><h2 data-f="group">${esc(g.name)}</h2>
<div class="tiles">${(g.items || []).map(tile).join('\n')}</div></section>`;

const fonts = { perspectives: 'Space+Grotesk:wght@500;700&family=Raleway:wght@400;600', 'licensing-guide': 'DM+Serif+Display&family=IBM+Plex+Serif:wght@400;600', default: 'DM+Serif+Display&family=IBM+Plex+Serif:wght@400;600' }[brand] ?? '';
const json = JSON.stringify(content, null, 2).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(content.title || groups.map((g) => g.name).join(', '))}</title>
<meta name="viewport" content="width=${W}">
${fonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fonts}&display=swap">` : ''}
<style>
${tokensCss}
${paletteCss}
/* taxonomy grid: flat, 0 radius, no shadow. --s scales every size from the 1600 px design width. */
html,body{margin:0;background:var(--na-color-bg)}
#artboard{--s:${(W / 1600).toFixed(4)};width:${W}px;height:${H}px;box-sizing:border-box;overflow:hidden;position:relative;
  padding:calc(48px*var(--s));display:flex;flex-direction:column;gap:calc(28px*var(--s));
  background:var(--na-color-bg);color:var(--na-color-ink);font-family:var(--na-font-text)}
#artboard h1{margin:0;font:600 calc(52px*var(--s))/1.1 var(--na-font-display);color:var(--na-color-heading,var(--na-color-ink))}
.panels{flex:1;min-height:0;display:grid;grid-template-columns:repeat(${columns},1fr);grid-template-rows:repeat(${panelRows},1fr);gap:calc(32px*var(--s))}
.panel{display:flex;flex-direction:column;min-height:0;gap:calc(16px*var(--s))}
.panel h2{margin:0;padding-bottom:calc(10px*var(--s));border-bottom:calc(3px*var(--s)) solid var(--na-color-border-strong);
  font:700 calc(34px*var(--s))/1.15 var(--na-font-display);color:var(--na-color-heading,var(--na-color-ink))}
.tiles{flex:1;min-height:0;display:grid;grid-template-columns:repeat(${tileColumns},1fr);grid-template-rows:repeat(${rows},1fr);gap:calc(12px*var(--s))}
.tile{position:relative;box-sizing:border-box;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:calc(6px*var(--s));
  padding:calc(14px*var(--s)) calc(18px*var(--s));background:var(--na-color-bg-raised);border:calc(1.5px*var(--s)) solid var(--na-color-border-strong);overflow:hidden}
.tid{font:600 calc(20px*var(--s))/1 var(--na-font-mono);color:var(--na-color-ink-muted)}
.tname{font:700 calc(30px*var(--s))/1.15 var(--na-font-display)}
.tstatus{font:600 calc(19px*var(--s))/1.1 var(--na-font-mono);text-transform:uppercase;letter-spacing:.04em;color:var(--na-color-ink-muted)}
.tqual{font:400 calc(20px*var(--s))/1.25 var(--na-font-text);color:var(--na-color-ink-muted)}
.tile.is-preview{border-style:dashed}
.tile.is-retiring,.tile.is-deprecated{padding-top:calc(26px*var(--s))}
.tile.is-retiring::before,.tile.is-deprecated::before{content:"";position:absolute;left:0;right:0;top:0;height:calc(10px*var(--s));
  background:repeating-linear-gradient(var(--na-hatch-angle,110deg),var(--na-color-accent) 0 calc(3px*var(--s)),transparent calc(3px*var(--s)) calc(9px*var(--s)))}
.tile.is-retiring .tstatus,.tile.is-deprecated .tstatus{color:var(--na-color-ink)}
.tile.is-emph{border-width:calc(4px*var(--s));border-color:var(--na-color-accent)}
.source{font:400 calc(18px*var(--s))/1.2 var(--na-font-text);color:var(--na-color-ink-muted)}
/* edit mode only exists with #edit */
.edit-bar{position:fixed;right:12px;bottom:12px;display:flex;gap:8px;font:14px var(--na-font-ui)}
.edit-bar button{padding:6px 10px;border:1px solid var(--na-color-border-strong);background:var(--na-color-bg);color:var(--na-color-ink);border-radius:0;cursor:pointer}
body.editing [data-f]{outline:1px dotted var(--na-color-accent);cursor:text}
@media print{.edit-bar{display:none}}
</style></head>
<body>
<main id="artboard">
${content.title ? `<h1>${esc(content.title)}</h1>` : ''}
<div class="panels">
${groups.map(panel).join('\n')}
</div>
${content.source ? `<div class="source">${esc(content.source)}</div>` : ''}
</main>
<script type="application/json" id="content">
${json}
</script>
<script>
(function(){
  var a=document.getElementById('artboard');
  function check(){var bad=[].some.call(document.querySelectorAll('.tile,.panel,#artboard'),function(e){return e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1});
    document.documentElement.setAttribute('data-overflow',bad?'yes':'no');document.documentElement.setAttribute('data-ready','yes')}
  Promise.race([document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve(),new Promise(function(r){setTimeout(r,3000)})]).then(function(){setTimeout(check,50)});
  if(location.hash!=='#edit')return;
  document.body.classList.add('editing');
  [].forEach.call(document.querySelectorAll('[data-f]'),function(e){e.contentEditable='true';e.addEventListener('input',check)});
  var ST=['','ga','preview','retiring','deprecated'];
  [].forEach.call(document.querySelectorAll('.tile'),function(t){t.addEventListener('dblclick',function(){var s=ST[(ST.indexOf(t.dataset.status)+1)%ST.length];t.dataset.status=s;
    t.className='tile'+(s?' is-'+s:'')+(t.classList.contains('is-emph')?' is-emph':'')})});
  var bar=document.createElement('div');bar.className='edit-bar';
  bar.innerHTML='<span>Edit mode: type to change text, double-click a tile to cycle its status</span><button>Copy content JSON</button>';
  document.body.appendChild(bar);
  bar.querySelector('button').onclick=function(){
    var c=JSON.parse(document.getElementById('content').textContent);var ST2={GA:'ga',PREVIEW:'preview',RETIRING:'retiring',DEPRECATED:'deprecated'};
    c.groups=[].map.call(document.querySelectorAll('.panel'),function(p){return{name:p.querySelector('[data-f=group]').textContent.trim(),
      items:[].map.call(p.querySelectorAll('.tile'),function(t){var it={name:t.querySelector('[data-f=name]').textContent.trim()};
        var id=t.querySelector('[data-f=id]');if(id)it.id=id.textContent.trim();
        var s=t.dataset.status;if(s)it.status=s;var q=t.querySelector('[data-f=qualifier]');
        if(q)it.qualifier=q.textContent.trim();else if(t.dataset.qual)it.qualifier=t.dataset.qual;
        if(t.classList.contains('is-emph'))it.emphasis=true;return it})}});
    navigator.clipboard.writeText(JSON.stringify(c,null,2));bar.querySelector('button').textContent='Copied'};
})();
</script>
</body></html>
`;
writeFileSync(out, html);
console.log('wrote', out);
