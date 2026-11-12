// ClipForge : l'atelier de texte. Une « recette » est une suite d'étapes (majuscules, trier les lignes, remplacer, Base64…)
// appliquée en direct au texte d'entrée ; les recettes se gardent et se rejouent. Les modèles sont des textes à trous
// ({nom}, {date}…) qu'on remplit puis copie. L'historique du presse-papiers, lui, est dans le plugin Presse-papiers.
const CSS = `
.cfTabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.cfTabs .btn,.cfRow .btn,.cfOps .btn{width:auto;margin:0;padding:5px 10px}
.cfGrid{display:grid;grid-template-columns:minmax(0,1fr) 300px minmax(0,1fr);gap:10px}
.cfGrid textarea,.cfTpl textarea{width:100%;box-sizing:border-box;min-height:300px;resize:vertical;font:13px monospace;background:var(--bg0);color:#fff;border:2px solid var(--line);padding:8px}
.cfGrid textarea[readonly]{color:#bff5bf}
.cfStat{font-size:12px;color:var(--muted);margin-top:4px}
.cfRow{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0}
.cfRow .f{width:auto;flex:1;min-width:80px;margin:0}
.cfOps{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0;max-height:190px;overflow:auto}
.cfOps .btn{font-size:12px;padding:3px 7px}
.cfOps .btn::before{content:'+ '}
.cfStep{background:var(--bg0);border:2px solid var(--line);padding:5px 8px;margin:4px 0;font-size:13px}
.cfStep.err{border-color:#ff4fb0}
.cfStep .h{display:flex;gap:6px;align-items:center}
.cfStep .h b{flex:1;color:#fff;font-weight:normal}
.cfStep .x{cursor:var(--cp,pointer);color:var(--muted)}
.cfStep .f{margin:4px 0 0;width:100%;box-sizing:border-box}
.cfStep .e{color:#ff4fb0;font-size:12px}
.cfTpl{display:grid;grid-template-columns:220px minmax(0,1fr) minmax(0,1fr);gap:10px}
.cfList div{padding:5px 8px;border:2px solid transparent;cursor:var(--cp,pointer);color:var(--lilac);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cfList div.on{border-color:var(--magenta);color:#fff;background:var(--bg0)}
.cfVars label{display:block;font-size:12px;color:var(--muted);margin-top:6px}
.cfVars .f{width:100%;box-sizing:border-box;margin:2px 0 0}
.cfOut{white-space:pre-wrap;font:13px monospace;background:var(--bg0);border:2px solid var(--line);padding:8px;min-height:120px;color:#bff5bf;margin-top:8px}
@media (max-width:900px){.cfGrid,.cfTpl{grid-template-columns:minmax(0,1fr)}.cfGrid textarea{min-height:160px}}
`;
// ---------- les opérations ----------
const words = s => s.match(/[\p{L}\p{N}]+/gu) || [];
const cap = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const noAcc = s => s.normalize('NFD').replace(/\p{M}/gu, '');
const perLine = f => s => s.split('\n').map(f).join('\n');
const lines = f => s => f(s.split('\n')).join('\n');
const b64e = s => { const b = new TextEncoder().encode(s); let r = ''; for (const c of b) r += String.fromCharCode(c); return btoa(r); };
const b64d = s => new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
const esc = s => s.replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const unesc = s => s.replace(/&(amp|lt|gt|quot|#39|#x?[0-9a-f]+|nbsp);/gi, (m, k) => ({amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' '})[k.toLowerCase()] ?? String.fromCodePoint(k[1].toLowerCase() === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)));
const unq = s => s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
// « /motif/drapeaux » = expression régulière, sinon texte exact
function finder(a) { const m = /^\/(.+)\/([gimsuy]*)$/s.exec(a); if (m) return new RegExp(m[1], m[2].includes('g') ? m[2] : m[2] + 'g'); return new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); }
const OPS = [
  ['upper', 'MAJUSCULES', s => s.toUpperCase()], ['lower', 'minuscules', s => s.toLowerCase()], ['title', 'Chaque Mot', s => s.replace(/[\p{L}\p{N}]+/gu, cap)],
  ['sentence', 'Début de phrase', s => s.toLowerCase().replace(/(^|[.!?]\s+|\n)(\p{L})/gu, (m, a, b) => a + b.toUpperCase())],
  ['camel', 'camelCase', perLine(l => words(noAcc(l)).map((w, i) => i ? cap(w) : w.toLowerCase()).join(''))],
  ['pascal', 'PascalCase', perLine(l => words(noAcc(l)).map(cap).join(''))],
  ['snake', 'snake_case', perLine(l => words(noAcc(l)).join('_').toLowerCase())], ['kebab', 'kebab-case', perLine(l => words(noAcc(l)).join('-').toLowerCase())],
  ['const', 'CONSTANTE', perLine(l => words(noAcc(l)).join('_').toUpperCase())], ['noacc', 'Sans accents', noAcc],
  ['trim', 'Espaces en bord de ligne', perLine(l => l.trim())], ['spaces', 'Espaces en double', s => s.replace(/[ \t]+/g, ' ')],
  ['noempty', 'Lignes vides', lines(L => L.filter(l => l.trim()))], ['unique', 'Lignes en double', lines(L => [...new Set(L)])],
  ['sort', 'Trier A → Z', lines(L => [...L].sort((a, b) => a.localeCompare(b, 'fr', {numeric: true, sensitivity: 'base'})))],
  ['sortlen', 'Trier par longueur', lines(L => [...L].sort((a, b) => a.length - b.length))], ['revlines', 'Inverser les lignes', lines(L => [...L].reverse())],
  ['number', 'Numéroter', lines(L => L.map((l, i) => (i + 1) + '. ' + l))], ['revtext', 'Texte à l’envers', s => [...s].reverse().join('')],
  ['replace', 'Remplacer', (s, a, b) => a ? s.replace(finder(a), unq(b || '')) : s, ['Chercher (ou /regex/)', 'Remplacer par']],
  ['keep', 'Garder les lignes avec', (s, a) => a ? s.split('\n').filter(l => { const r = finder(a); return r.test(l); }).join('\n') : s, ['Texte (ou /regex/)']],
  ['drop', 'Retirer les lignes avec', (s, a) => a ? s.split('\n').filter(l => { const r = finder(a); return !r.test(l); }).join('\n') : s, ['Texte (ou /regex/)']],
  ['wrap', 'Entourer chaque ligne', (s, a, b) => s.split('\n').map(l => (a || '') + l + (b || '')).join('\n'), ['Avant', 'Après']],
  ['join', 'Joindre les lignes', (s, a) => s.split('\n').join(unq(a ?? ', ')), ['Séparateur']], ['split', 'Couper en lignes', (s, a) => a ? s.split(finder(a)).join('\n') : s, ['Séparateur (ou /regex/)']],
  ['extract', 'Extraire', (s, a) => a ? (s.match(finder(a)) || []).join('\n') : s, ['Motif (/regex/)']],
  ['b64e', 'Base64 →', b64e], ['b64d', '→ texte (Base64)', b64d], ['urle', 'URL encoder', s => encodeURIComponent(s)], ['urld', 'URL décoder', s => decodeURIComponent(s)],
  ['htmle', 'HTML échapper', esc], ['htmld', 'HTML déséchapper', unesc],
  ['jsonp', 'JSON indenté', s => JSON.stringify(JSON.parse(s), null, 2)], ['jsonm', 'JSON compact', s => JSON.stringify(JSON.parse(s))],
  ['slug', 'Slug d’URL', perLine(l => words(noAcc(l)).join('-').toLowerCase())],
];
const OP = Object.fromEntries(OPS.map(o => [o[0], o]));
function run(text, steps) { const out = []; let s = text; for (const st of steps) { try { s = OP[st.op][2](s, st.a, st.b); out.push(null); } catch (e) { out.push(e.message || String(e)); return {s, errs: out, failed: true}; } } return {s, errs: out}; }
// ---------- les modèles ----------
const VAR = /\{([\p{L}\p{N}_ -]{1,30})\}/gu;
const AUTO = {date: () => new Date().toLocaleDateString('fr-FR'), heure: () => new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}), jour: () => new Date().toLocaleDateString('fr-FR', {weekday: 'long'})};
const varsOf = t => [...new Set([...t.matchAll(VAR)].map(m => m[1].trim()))].filter(v => !AUTO[v.toLowerCase()]);
const fill = (t, vals) => t.replace(VAR, (m, k) => { k = k.trim(); const a = AUTO[k.toLowerCase()]; return a ? a() : vals[k] || m; });
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast } = ctx.host;
  ctx.host.addStyle(CSS);
  console.assert(OP.camel[2]('Été chaud du jour') === 'eteChaudDuJour' && OP.snake[2]('Mon Titre 2') === 'mon_titre_2' && OP.unique[2]('a\nb\na') === 'a\nb'
    && OP.sort[2]('b10\nb2\nA') === 'A\nb2\nb10' && b64d(b64e('héllo 👋')) === 'héllo 👋' && OP.replace[2]('a1b22', '/\\d+/', '#') === 'a#b#'
    && unesc(esc('<a href="x">&</a>')) === '<a href="x">&</a>' && unesc('&#233;&#x41;') === 'éA' && OP.join[2]('a\nb', '\\t') === 'a\tb'
    && fill('{nom} {nom}', {nom: 'Léa'}) === 'Léa Léa' && varsOf('{Nom} {date} {x}').join() === 'Nom,x' && run('{', [{op: 'jsonp'}]).failed, 'clipforge : opérations');
  let data = null; try { data = await ctx.folder.read('clipforge'); } catch {}
  const st = {tab: data?.tab || 'forge', input: data?.input ?? 'Liste des courses\npommes\n  Bananes \nPommes\n\ncafé moulu\nbananes',
    steps: data?.steps || [{op: 'trim'}, {op: 'noempty'}, {op: 'lower'}, {op: 'unique'}, {op: 'sort'}], recipes: data?.recipes || [],
    tpls: data?.tpls || [
      {name: 'Relance par mail', text: 'Bonjour {nom},\n\nJe me permets de revenir vers vous au sujet de {sujet}, dont nous avions parlé. Avez-vous pu avancer de votre côté ?\n\nBonne journée,\n{signature}'},
      {name: 'Rapport de bug', text: '## {titre}\n\nVersion : {version}\nDate : {date}\n\n### Étapes\n1. \n\n### Attendu\n\n### Obtenu\n'},
      {name: 'Compte rendu', text: 'Réunion du {jour} {date} à {heure}\nPrésents : {présents}\n\nDécisions :\n- \n\nÀ faire :\n- '}],
    cur: data?.cur ?? 0, vals: data?.vals || {}};
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => ctx.folder.write('clipforge', st).catch(() => {}), 300); };
  const btn = (t, f, cls = '') => { const b = el('button', 'btn px ' + cls, t); b.onclick = f; return b; };
  const copy = t => navigator.clipboard.writeText(t).then(() => toast('Copié'), () => toast('Copie impossible'));
  view.innerHTML = '';
  const wrap = el('div', 'appWrap'), head = el('div', 'agHead'), tabs = el('div', 'cfTabs'), body = el('div', 'sysCard px');
  head.append(el('span', 'label', 'ClipForge · l’atelier de texte')); wrap.append(head, tabs, body); view.append(wrap);
  const TABS = [['forge', '⚒ Transformer'], ['tpl', '✎ Modèles']];
  function drawTabs() { tabs.replaceChildren(...TABS.map(([k, t]) => { const b = el('button', 'btn px' + (st.tab === k ? ' main' : ''), t); b.dataset.tab = k; b.onclick = () => { st.tab = k; save(); drawTabs(); build(); }; return b; })); }
  const stat = (box, s) => { const n = s.split('\n').length, w = words(s).length; box.replaceChildren(el('span', '', String(n)), ' ', el('span', '', n > 1 ? 'lignes' : 'ligne'), ' · ', el('span', '', String(w)), ' ', el('span', '', w > 1 ? 'mots' : 'mot'), ' · ', el('span', '', String([...s].length)), ' ', el('span', '', 'caractères')); };
  // ---------- l'atelier ----------
  function buildForge() {
    const grid = el('div', 'cfGrid'), c1 = el('div'), c2 = el('div'), c3 = el('div'), inp = el('textarea'), out = el('textarea'), s1 = el('div', 'cfStat'), s3 = el('div', 'cfStat');
    inp.id = 'cf_in'; out.id = 'cf_out'; out.readOnly = true; inp.translate = false; out.translate = false; inp.spellcheck = false; out.spellcheck = false; inp.value = st.input;
    const r1 = el('div', 'cfRow'), r3 = el('div', 'cfRow');
    r1.append(el('span', 'label', 'Entrée'), btn('Coller', () => navigator.clipboard.readText().then(t => { inp.value = t; inp.oninput(); }, () => toast('Coller demande l’autorisation presse-papiers : utilise Ctrl+V'))), btn('Vider', () => { inp.value = ''; inp.oninput(); }));
    const use = btn('⇤ Reprendre en entrée', () => { inp.value = out.value; st.steps = []; inp.oninput(); drawSteps(); }), cp = btn('Copier', () => copy(out.value), 'main'); cp.id = 'cf_copy';
    r3.append(el('span', 'label', 'Résultat'), cp, use, btn('↓ .txt', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out.value], {type: 'text/plain'})); a.download = 'clipforge.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }));
    c1.append(r1, inp, s1); c3.append(r3, out, s3);
    // la recette
    const steps = el('div'), ops = el('div', 'cfOps'), search = el('input', 'f'), recRow = el('div', 'cfRow'), recName = el('input', 'f'), recSel = el('select', 'f');
    search.placeholder = 'Chercher une étape…'; search.oninput = drawOps; recName.placeholder = 'Nom de la recette'; recName.translate = false; recSel.translate = false;
    function drawOps() { const q = noAcc(search.value.toLowerCase()); ops.replaceChildren(...OPS.filter(o => !q || noAcc(o[1].toLowerCase()).includes(q)).map(o => { const b = btn(o[1], () => { st.steps.push({op: o[0], a: '', b: ''}); drawSteps(); }); b.dataset.op = o[0]; return b; })); }
    function drawRecipes() { recSel.replaceChildren(el('option', '', st.recipes.length ? 'Recettes gardées…' : 'Aucune recette gardée'), ...st.recipes.map((r, i) => { const o = el('option', '', r.name); o.value = i; return o; })); }
    recSel.onchange = () => { const r = st.recipes[+recSel.value]; if (r) { st.steps = structuredClone(r.steps); recName.value = r.name; drawSteps(); } };
    recRow.append(recName, btn('Garder', () => { const name = recName.value.trim(); if (!name) return toast('Donne un nom à la recette'); if (!st.steps.length) return toast('La recette est vide');
      const r = {name, steps: structuredClone(st.steps)}, i = st.recipes.findIndex(k => k.name === name); if (i >= 0) st.recipes[i] = r; else st.recipes.push(r); save(); drawRecipes(); toast('Recette gardée'); }),
      btn('✕', () => { const i = st.recipes.findIndex(k => k.name === recName.value.trim()); if (i < 0) return; st.recipes.splice(i, 1); recName.value = ''; save(); drawRecipes(); }));
    c2.append(el('span', 'label', 'Recette'), steps, btn('Tout retirer', () => { st.steps = []; drawSteps(); }), search, ops, recSel, recRow);
    function drawSteps() {
      steps.replaceChildren(...st.steps.map((s, i) => { const o = OP[s.op], box = el('div', 'cfStep'), h = el('div', 'h'), up = el('span', 'x', '▲'), x = el('span', 'x', '✕');
        up.title = 'Monter'; x.title = 'Retirer'; up.onclick = () => { if (i) { [st.steps[i - 1], st.steps[i]] = [st.steps[i], st.steps[i - 1]]; drawSteps(); } }; x.onclick = () => { st.steps.splice(i, 1); drawSteps(); };
        h.append(el('span', 'hint', (i + 1) + '.'), el('b', '', o[1]), up, x); box.append(h);
        (o[3] || []).forEach((ph, j) => { const f = el('input', 'f'), k = j ? 'b' : 'a'; f.placeholder = ph; f.translate = false; f.spellcheck = false; f.value = s[k] ?? ''; f.oninput = () => { s[k] = f.value; apply(); }; box.append(f); });
        box.append(el('div', 'e')); return box; }));
      if (!st.steps.length) steps.append(el('div', 'hint', 'Ajoute des étapes ci-dessous : elles s’appliquent dans l’ordre.'));
      apply();
    }
    function apply() { const r = run(inp.value, st.steps); out.value = r.failed ? '' : r.s; stat(s1, inp.value); stat(s3, out.value);
      [...steps.querySelectorAll('.cfStep')].forEach((b, i) => { b.classList.toggle('err', !!r.errs[i]); b.querySelector('.e').textContent = r.errs[i] || ''; }); save(); }
    inp.oninput = () => { st.input = inp.value; apply(); };
    grid.append(c1, c2, c3); body.append(grid); drawOps(); drawRecipes(); drawSteps();
  }
  // ---------- les modèles ----------
  function buildTpl() {
    const grid = el('div', 'cfTpl'), list = el('div', 'cfList'), side = el('div'), ed = el('div'), name = el('input', 'f'), text = el('textarea'), vars = el('div', 'cfVars'), res = el('div'), outBox = el('div', 'cfOut'), r = el('div', 'cfRow');
    name.translate = false; text.translate = false; outBox.translate = false; text.spellcheck = false; text.id = 'cf_tpl'; outBox.id = 'cf_tout';
    side.append(el('span', 'label', 'Modèles'), list, btn('+ Nouveau', () => { st.tpls.push({name: 'Nouveau modèle', text: 'Bonjour {nom},\n\n'}); st.cur = st.tpls.length - 1; save(); draw(); }, 'main'));
    ed.append(el('span', 'label', 'Texte du modèle'), name, text, el('div', 'hint', 'Écris {nom}, {sujet}… pour un trou à remplir. {date}, {heure} et {jour} se remplissent tout seuls.'));
    const cp = btn('Copier', () => copy(outBox.textContent), 'main'); cp.id = 'cf_tcopy';
    r.append(cp, btn('Supprimer le modèle', async () => { if (!await ctx.host.confirm('Supprimer ce modèle ?')) return; st.tpls.splice(st.cur, 1); st.cur = 0; save(); draw(); }));
    res.append(el('span', 'label', 'À remplir'), vars, outBox, r); grid.append(side, ed, res); body.append(grid);
    const t = () => st.tpls[st.cur];
    function draw() {
      if (!st.tpls[st.cur]) st.cur = 0;
      list.replaceChildren(...st.tpls.map((k, i) => { const d = el('div', i === st.cur ? 'on' : '', k.name); d.translate = false; d.onclick = () => { st.cur = i; save(); draw(); }; return d; }));
      const has = !!t(); ed.style.display = res.style.display = has ? '' : 'none'; if (!has) return;
      name.value = t().name; text.value = t().text; drawVars();
    }
    function drawVars() { vars.replaceChildren(...varsOf(t().text).map(v => { const l = el('label', '', v), f = el('input', 'f'); l.translate = false; f.translate = false; f.value = st.vals[v] || ''; f.dataset.v = v; f.oninput = () => { st.vals[v] = f.value; save(); upd(); }; l.append(f); return l; })); upd(); }
    const upd = () => { outBox.textContent = fill(t().text, st.vals); };
    name.oninput = () => { t().name = name.value; list.children[st.cur].textContent = name.value; save(); };
    text.oninput = () => { t().text = text.value; save(); drawVars(); };
    draw();
  }
  function build() { body.replaceChildren(); (st.tab === 'tpl' ? buildTpl : buildForge)(); }
  drawTabs(); build();
}
