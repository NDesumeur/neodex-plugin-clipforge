// ClipForge : un monteur vidéo. Les médias importés (vidéos, images, sons) se posent sur une timeline à 5 pistes
// (Textes, Vidéo 2 par-dessus Vidéo 1, Son 1, Son 2), se coupent, se déplacent et se rognent à la souris. Chaque clip a
// ses transitions, ses effets (couleurs, flou, pixels), sa vitesse et son volume. L'aperçu est un canevas : l'export le
// filme en temps réel avec MediaRecorder (vidéo du canevas + sons mixés par Web Audio) et donne un fichier WebM.
const CSS = `
.cfApp{display:flex;flex-direction:column;gap:10px}
.cfTop{display:grid;grid-template-columns:230px minmax(0,1fr) 290px;gap:10px}
@media (max-width:1100px){.cfTop{display:contents}.cfStage{order:1}.cfTlBar{order:2}.cfTl{order:3}.cfLib{order:4}.cfInsp{order:5}.cfCv{max-height:240px}}
.cfLib,.cfInsp{display:flex;flex-direction:column;gap:6px;max-height:540px;overflow:auto;min-width:0}
.cfRow{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.cfRow .btn,.cfInsp .btn,.cfBar .btn{width:auto;margin:0;padding:5px 9px}
.cfMed{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:6px;align-items:center;background:var(--bg0);border:2px solid var(--line);padding:4px;cursor:var(--cp,pointer)}
.cfMed:hover{border-color:var(--magenta)}
.cfMed.miss{border-color:#ff4fb0;opacity:.75}
.cfMed .th{width:64px;height:36px;background:#0b0816 center/cover no-repeat;image-rendering:pixelated;display:flex;align-items:center;justify-content:center;font:10px monospace;color:var(--muted)}
.cfMed b{font-weight:normal;color:#fff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.cfMed small{display:block;color:var(--muted);font-size:11px}
.cfMed .x{color:var(--muted);padding:0 4px}
.cfMed .x:hover{color:#ff4fb0}
.cfStage{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}
.cfCv{max-width:100%;max-height:430px;background:#000;border:2px solid var(--line);display:block}
.cfBar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center}
.cfTime{font:14px monospace;color:#fff;min-width:160px;text-align:center}
.cfInsp{font-size:12px;color:var(--lilac)}
.cfInfo{font:11px monospace;color:var(--muted)}
.cfP{display:grid;grid-template-columns:100px minmax(0,1fr) 52px;gap:6px;align-items:center}
.cfP b{font:11px monospace;color:#fff;text-align:right;font-weight:normal}
.cfP select,.cfP input[type=color]{width:100%;box-sizing:border-box;background:var(--bg0);color:#fff;border:2px solid var(--line);font:12px inherit;padding:2px}
.cfRange{-webkit-appearance:none;appearance:none;height:10px;background:var(--bg0);border:2px solid var(--line);outline:none;width:100%}
.cfRange::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:20px;background:var(--magenta);border:2px solid #000;cursor:var(--cp,pointer)}
.cfInsp textarea{width:100%;box-sizing:border-box;min-height:64px;resize:vertical;background:var(--bg0);color:#fff;border:2px solid var(--line);font:13px inherit;padding:6px}
.cfLooks{display:flex;flex-wrap:wrap;gap:4px}
.cfLooks .btn{font-size:11px;padding:3px 6px}
.cfHelp{font-size:12px;color:var(--muted);line-height:1.55;margin:0}
.cfTlBar{display:flex;gap:10px;align-items:center;font-size:12px;color:var(--muted);flex-wrap:wrap}
.cfTlBar .cfRange{width:160px}
.cfTl{display:grid;grid-template-columns:104px minmax(0,1fr);background:var(--bg0);border:2px solid var(--line);user-select:none}
.cfHeads>div{height:44px;border-top:2px solid var(--line);display:flex;align-items:center;gap:6px;padding:0 6px;font-size:12px;color:var(--lilac);box-sizing:border-box}
.cfHeads>.rh{height:22px;border-top:0}
.cfHeads .m{cursor:var(--cp,pointer);font:13px monospace;color:#fff;width:14px}
.cfHeads .off{color:var(--muted);text-decoration:line-through}
.cfScroll{overflow-x:auto;overflow-y:hidden;min-width:0}
.cfLanes{position:relative;touch-action:none}
.cfRuler{height:22px;position:relative;cursor:var(--cp,pointer);background:#0b0816;overflow:hidden}
.cfRuler i{position:absolute;top:0;height:22px;border-left:2px solid var(--line);font:10px monospace;color:var(--muted);padding-left:3px;font-style:normal;box-sizing:border-box}
.cfLane{height:44px;border-top:2px solid var(--line);position:relative;box-sizing:border-box}
.cfLane.k-t{background:#14101f}.cfLane.k-a{background:#0f1418}
.cfClip{position:absolute;top:3px;height:34px;border:2px solid #000;box-sizing:border-box;overflow:hidden;font-size:11px;padding:2px 9px;white-space:nowrap;cursor:grab;background-repeat:repeat-x;background-size:auto 100%;image-rendering:pixelated}
.cfClip.k-video{background-color:#ff4fb0}.cfClip.k-image{background-color:#b48cff}.cfClip.k-t{background-color:#ffd84a}
.cfClip.k-audio{background-color:#1d6b55;background-size:100% 100%;background-repeat:no-repeat}
.cfClip.miss{background-color:#5a2a3a}
.cfClip.on{border-color:#fff}
.cfClip span{background:rgba(0,0,0,.65);color:#fff;padding:0 3px;position:relative;z-index:1}
.cfClip .h{position:absolute;top:0;bottom:0;width:7px;background:rgba(255,255,255,.45);cursor:ew-resize;z-index:2}
.cfClip .h.l{left:0}.cfClip .h.r{right:0}
.cfClip .fi,.cfClip .fo{position:absolute;top:0;bottom:0;background:rgba(0,0,0,.4)}
.cfClip .fi{left:0}.cfClip .fo{right:0}
.cfPh{position:absolute;top:0;bottom:0;width:2px;background:#fff;pointer-events:none;z-index:3}
.cfPh::before{content:'';position:absolute;top:0;left:-4px;width:10px;height:8px;background:#fff}
`;
const FORMATS = {'16:9': [1280, 720], '9:16': [720, 1280], '1:1': [1080, 1080]};
const TRACKS = [{id: 't', name: 'Textes', kind: 't'}, {id: 'v2', name: 'Vidéo 2', kind: 'v'}, {id: 'v1', name: 'Vidéo 1', kind: 'v'}, {id: 'a1', name: 'Son 1', kind: 'a'}, {id: 'a2', name: 'Son 2', kind: 'a'}];
const DRAW_ORDER = ['v1', 'v2', 't'];
// [clé, nom, min, max, neutre]
const FX = [['lum', 'Luminosité', 0, 200, 100], ['con', 'Contraste', 0, 200, 100], ['sat', 'Saturation', 0, 300, 100], ['gris', 'Noir et blanc', 0, 100, 0],
  ['sepia', 'Sépia', 0, 100, 0], ['teinte', 'Teinte', -180, 180, 0], ['flou', 'Flou', 0, 20, 0], ['pixel', 'Pixels', 0, 32, 0]];
const FX0 = Object.fromEntries(FX.map(f => [f[0], f[4]]));
const LOOKS = {'Normal': {}, 'Noir et blanc': {gris: 100, con: 120}, 'Ancien': {sepia: 80, con: 90, lum: 105}, 'Vif': {sat: 170, con: 115},
  'Froid': {teinte: 25, sat: 80, lum: 95}, 'Nuit': {lum: 60, con: 130, teinte: 20, sat: 60}, 'Rétro pixel': {pixel: 6, sat: 130, con: 110}};
const TRANS = {fondu: 'Fondu', glisse: 'Glisse', zoom: 'Zoom', volet: 'Volet'};
const FONTS = {gras: ['Gras', 'bold {}px sans-serif'], normal: ['Normal', '{}px sans-serif'], machine: ['Machine à écrire', 'bold {}px monospace'], titre: ['Titre', 'bold {}px serif']};
const SPEEDS = [.25, .5, .75, 1, 1.25, 1.5, 2, 4];
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
// ---------- le temps d'un clip ----------
const isOn = (c, t) => t >= c.start && t < c.start + c.dur;
const localT = (c, t) => c.inn + (t - c.start) * c.speed;  // l'instant du média montré à l'instant t du montage
function fade(c, t) {  // p : avancée de l'entrée (0 → 1), a : opacité de la sortie (1 → 0)
  const e = t - c.start, r = c.start + c.dur - t;
  return {p: c.fin > 0 && e < c.fin ? Math.max(0, e / c.fin) : 1, a: c.fout > 0 && r < c.fout ? Math.max(0, r / c.fout) : 1};
}
function split(c, t) {
  if (t <= c.start + .05 || t >= c.start + c.dur - .05) return null;
  const d = t - c.start, b = {...c, fx: {...c.fx}, id: uid(), start: t, inn: c.inn + d * c.speed, dur: c.dur - d, fin: 0};
  c.dur = d; c.fout = 0; return b;
}
const filterOf = fx => { const f = {...FX0, ...fx}; return FX.every(([k]) => k === 'pixel' || f[k] === FX0[k]) ? 'none'
  : `brightness(${f.lum}%) contrast(${f.con}%) saturate(${f.sat}%) grayscale(${f.gris}%) sepia(${f.sepia}%) hue-rotate(${f.teinte}deg) blur(${f.flou}px)`; };
// vérification : la découpe garde le bon morceau du média, à la bonne vitesse, et le fondu avance comme il faut
{ const c = {id: 'a', start: 2, dur: 4, inn: 1, speed: 2, fin: 1, fout: 0, fx: {}}, b = split(c, 3);
  console.assert(b && c.dur === 1 && b.start === 3 && b.inn === 3 && b.dur === 3 && localT(b, 4) === 5 && fade(c, 2.5).p === .5 && fade(b, 5.9).a === 1 && !split(c, 2.01)
    && filterOf({}) === 'none' && filterOf({gris: 100}).includes('grayscale(100%)'), 'ClipForge : découpe, temps ou effets faux'); }

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast } = ctx.host;
  ctx.host.addStyle(CSS);
  // le montage est dans « montage » ; l'ancien document « clipforge » (l'atelier de texte d'avant) reste sur le disque, intact
  let data = null; try { data = await ctx.folder.read('montage'); } catch {}
  const proj = {fmt: '16:9', mute: {}, clips: [], media: [], ...(data || {})};
  const urls = new Map(), imgs = new Map(), els = new Map(), gains = new Map();
  const mediaOf = id => proj.media.find(m => m.id === id), clipOf = id => proj.clips.find(c => c.id === id);
  const kindOf = c => c.tr === 't' ? 't' : mediaOf(c.m)?.type;
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => ctx.folder.write('montage', proj).catch(e => toast('Montage non enregistré : ' + e.message)), 400); };
  for (const m of proj.media) if (m.file) try { const b = await ctx.folder.readFile(m.file); if (b) urls.set(m.id, URL.createObjectURL(await (await fetch('data:' + (m.mime || 'application/octet-stream') + ';base64,' + b)).blob())); } catch {}

  // ---------- l'interface ----------
  view.innerHTML = '';
  const app = el('div', 'appWrap cfApp'), head = el('div', 'agHead'), top = el('div', 'cfTop');
  const lib = el('div', 'sysCard px cfLib'), stage = el('div', 'sysCard px cfStage'), insp = el('div', 'sysCard px cfInsp');
  const cv = el('canvas', 'cfCv'), g = cv.getContext('2d'), bar = el('div', 'cfBar'), time = el('span', 'cfTime');
  cv.id = 'cf_cv'; time.translate = false;
  const tlBar = el('div', 'cfTlBar'), tl = el('div', 'cfTl'), heads = el('div', 'cfHeads'), scroll = el('div', 'cfScroll'), lanesEl = el('div', 'cfLanes'), ruler = el('div', 'cfRuler'), ph = el('div', 'cfPh');
  head.append(el('span', 'label', 'ClipForge · monteur vidéo')); stage.append(cv, bar);
  top.append(lib, stage, insp); scroll.append(lanesEl); tl.append(heads, scroll); app.append(head, top, tlBar, tl); view.append(app);
  const btn = (txt, fn, cls = '') => { const b = el('button', 'btn px ' + cls, txt); b.onclick = fn; return b; };
  const pick = (multi, fn) => { const i = el('input'); i.type = 'file'; i.multiple = multi; i.accept = 'video/*,audio/*,image/*'; i.onchange = () => fn([...i.files]); i.click(); };

  // ---------- les médias ----------
  const once = (e, ev) => new Promise((ok, ko) => { e.addEventListener(ev, ok, {once: true}); e.addEventListener('error', () => ko(new Error('illisible')), {once: true}); });
  const thumbOf = (src, w, h) => { const c = document.createElement('canvas'), k = Math.min(1, 128 / w, 72 / h); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k)); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .7); };
  async function probe(m, url) {
    if (m.type === 'image') { const i = new Image(); i.src = url; await once(i, 'load'); m.w = i.naturalWidth; m.h = i.naturalHeight; m.thumb = thumbOf(i, m.w, m.h); return; }
    const e = document.createElement(m.type); e.preload = 'auto'; e.muted = true; e.src = url; await once(e, 'loadedmetadata');
    if (!isFinite(e.duration)) { e.currentTime = 1e9; await once(e, 'seeked'); }  // les WebM enregistrés par un navigateur n'annoncent pas leur durée
    m.dur = e.duration; if (!(m.dur > 0)) throw new Error('durée inconnue');
    if (m.type === 'video') { m.w = e.videoWidth; m.h = e.videoHeight; e.currentTime = Math.min(1, m.dur / 2); await once(e, 'seeked'); m.thumb = thumbOf(e, m.w, m.h); }
    e.removeAttribute('src'); e.load();
  }
  async function waveOf(f) {  // la forme d'onde, dessinée une fois pour le fond des clips de son
    const b = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await f.arrayBuffer()), d = b.getChannelData(0), W = 400, H = 34, c = document.createElement('canvas');
    c.width = W; c.height = H; const x = c.getContext('2d'), st = d.length / W; x.fillStyle = '#7dffcf';
    for (let i = 0; i < W; i++) { let pk = 0; for (let j = Math.floor(i * st), e = Math.floor((i + 1) * st); j < e; j += 8) pk = Math.max(pk, Math.abs(d[j])); const h = Math.max(2, Math.round(pk * (H - 4)) & ~1); x.fillRect(i, (H - h) / 2, 1, h); }
    return c.toDataURL('image/png');
  }
  const b64 = f => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = () => ko(r.error); r.readAsDataURL(f); });
  const typeOf = f => /^(video|audio|image)\//.exec(f.type)?.[1] || (/\.(mp4|webm|mkv|mov|m4v)$/i.test(f.name) ? 'video' : /\.(mp3|wav|ogg|oga|m4a|flac|opus|aac)$/i.test(f.name) ? 'audio' : /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name) ? 'image' : null);
  async function keep(m, f) {  // jusqu'à 15 Mo, le fichier est gardé dans le dossier du plugin ; au-delà il faudra le réimporter à la prochaine ouverture
    if (f.size > 15e6) return; try { const nm = 'm-' + m.id + '.' + ((/\.([a-z0-9]{1,5})$/i.exec(f.name) || [, 'bin'])[1].toLowerCase()); await ctx.folder.writeFile(nm, await b64(f)); m.file = nm; } catch {}
  }
  async function addFile(f, into = null) {
    const type = typeOf(f); if (!type) { toast('Format non reconnu : ' + f.name); return null; }
    if (into && into.type !== type) { toast('Ce fichier n\'est pas du même type que ' + into.name); return null; }
    const m = into || {id: uid(), name: f.name, type, mime: f.type, size: f.size, dur: 4, w: 0, h: 0, file: null, thumb: '', wave: ''};
    const url = URL.createObjectURL(f);
    try { await probe(m, url); } catch { URL.revokeObjectURL(url); toast('Impossible de lire ' + f.name); return null; }
    if (type !== 'image' && f.size < 300e6) m.wave = await waveOf(f).catch(() => '');
    urls.set(m.id, url); imgs.delete(m.id); for (const c of proj.clips) if (c.m === m.id) drop(c.id);
    await keep(m, f); if (!into) proj.media.push(m); save(); drawLib(); refresh(); return m;
  }
  const importFiles = async fs => { for (const f of fs) await addFile(f); };
  view.addEventListener('dragover', e => e.preventDefault());
  view.addEventListener('drop', e => { e.preventDefault(); importFiles([...e.dataTransfer.files]); });
  async function removeMedia(m) {
    const n = proj.clips.filter(c => c.m === m.id).length;
    if (!await ctx.host.confirm(n ? `Retirer ${m.name} et ses ${n} clip(s) de la timeline ?` : `Retirer ${m.name} ?`)) return;
    proj.clips = proj.clips.filter(c => c.m !== m.id); proj.media = proj.media.filter(x => x !== m); hist = []; fut = [];  // annuler ne peut pas faire revenir un média retiré
    if (m.file) ctx.folder.removeFile(m.file).catch(() => {}); if (!clipOf(sel)) sel = null; changed(); drawLib();
  }
  function drawLib() {
    lib.replaceChildren(el('span', 'label', 'Médias'));
    const r = el('div', 'cfRow'); r.append(btn('IMPORTER', () => pick(true, importFiles), 'main'), btn('+ TEXTE', addText)); lib.append(r);
    if (!proj.media.length) lib.append(el('p', 'cfHelp', 'Importe des vidéos, des images et des sons (ou glisse-les ici), puis clique sur un média pour le poser au bout de sa piste.'));
    for (const m of proj.media) {
      const row = el('div', 'cfMed' + (urls.has(m.id) ? '' : ' miss')), th = el('div', 'th', m.type === 'audio' && !m.wave ? '♪' : ''), info = el('div'), x = el('span', 'x', '✕');
      if (m.thumb || m.wave) th.style.backgroundImage = `url(${m.thumb || m.wave})`;
      info.append(el('b', '', m.name), el('small', '', urls.has(m.id) ? ({video: 'Vidéo', audio: 'Son', image: 'Image'}[m.type] + (m.type === 'image' ? '' : ' · ' + fmt(m.dur))) : 'À réimporter (plus de 15 Mo)'));
      row.title = urls.has(m.id) ? 'Poser sur la timeline' : 'Choisir à nouveau ce fichier'; x.title = 'Retirer';
      row.onclick = e => { if (e.target === x) return removeMedia(m); if (urls.has(m.id)) addClip(m); else pick(false, fs => fs[0] && addFile(fs[0], m)); };
      row.dataset.media = m.id; row.append(th, info, x); lib.append(row);
    }
  }

  // ---------- les clips ----------
  const endOf = tr => Math.max(0, ...proj.clips.filter(c => c.tr === tr).map(c => c.start + c.dur));
  const total = () => Math.max(0, ...proj.clips.map(c => c.start + c.dur));
  const maxDur = c => { const m = mediaOf(c.m); return m && m.type !== 'image' ? (m.dur - c.inn) / c.speed : 3600; };
  const base = () => ({id: uid(), inn: 0, speed: 1, vol: 1, fin: 0, fout: 0, tin: 'fondu', x: .5, y: .5, sc: 1, fit: false, fx: {}});
  function addClip(m) {
    const tr = m.type === 'audio' ? (endOf('a1') <= endOf('a2') ? 'a1' : 'a2') : 'v1';
    snap(); const c = {...base(), tr, m: m.id, start: endOf(tr), dur: m.type === 'image' ? 4 : m.dur};
    proj.clips.push(c); sel = c.id; changed(); return c;
  }
  function addText() {
    snap(); const c = {...base(), tr: 't', m: null, start: T, dur: 3, text: 'Ton texte', size: 64, col: '#ffffff', font: 'gras', bg: true, y: .82, fin: .4, fout: .4};
    proj.clips.push(c); sel = c.id; changed(); return c;
  }
  function cut() {
    const s = clipOf(sel), list = s && isOn(s, T) ? [s] : proj.clips.filter(c => isOn(c, T));
    const before = cur(), made = list.map(c => split(c, T)).filter(Boolean);
    if (!made.length) return toast('Rien à couper sous la tête de lecture');
    push(before); proj.clips.push(...made); changed();
  }
  function del() { if (!clipOf(sel)) return; snap(); proj.clips = proj.clips.filter(c => c.id !== sel); sel = null; changed(); }
  function dup() { const c = clipOf(sel); if (!c) return; snap(); const d = {...c, fx: {...c.fx}, id: uid(), start: endOf(c.tr)}; proj.clips.push(d); sel = d.id; changed(); }

  // ---------- annuler / rétablir ----------
  let hist = [], fut = [], pend = null, sel = null;
  const cur = () => JSON.stringify({clips: proj.clips, mute: proj.mute});
  const push = s => { hist.push(s); if (hist.length > 80) hist.shift(); fut = []; };
  const snap = () => push(cur());
  const restore = s => { const o = JSON.parse(s); proj.clips = o.clips; proj.mute = o.mute; if (!clipOf(sel)) sel = null; changed(); };
  const undo = () => { if (hist.length) { fut.push(cur()); restore(hist.pop()); } };
  const redo = () => { if (fut.length) { hist.push(cur()); restore(fut.pop()); } };

  // ---------- l'aperçu ----------
  let W = 1280, H = 720;
  const off = document.createElement('canvas'), og = off.getContext('2d');
  function img(m) { let i = imgs.get(m.id); if (!i && urls.has(m.id)) { i = new Image(); i.src = urls.get(m.id); i.onload = () => { if (!playing) draw(T); }; imgs.set(m.id, i); } return i; }
  function elOf(c) {
    let e = els.get(c.id); if (e) return e; const m = mediaOf(c.m);
    e = document.createElement(m.type === 'video' ? 'video' : 'audio'); e.preload = 'auto'; e.playsInline = true; e.src = urls.get(m.id);
    e.onseeked = e.onloadeddata = () => { if (!playing) draw(T); };
    els.set(c.id, e); if (ac) hook(c.id, e); return e;
  }
  function drop(id) { const e = els.get(id); if (!e) return; e.pause(); e.removeAttribute('src'); e.load(); els.delete(id); gains.get(id)?.disconnect(); gains.delete(id); }
  function drawMedia(c, m, ox, k) {
    const src = m.type === 'image' ? img(m) : urls.has(m.id) ? elOf(c) : null;
    const ready = src && (m.type === 'image' ? src.complete && src.naturalWidth : src.readyState >= 2);
    const bw = W * c.sc, bh = H * c.sc, cx = c.x * W + ox, cy = c.y * H;
    if (!ready) { if (!urls.has(m.id)) { g.fillStyle = '#3a1a2a'; g.fillRect(cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); g.fillStyle = '#ff8ac8'; g.font = 'bold 32px sans-serif'; g.textAlign = 'center'; g.fillText('Média à réimporter : ' + m.name, cx, cy); } return; }
    const sw = m.type === 'image' ? src.naturalWidth : src.videoWidth, sh = m.type === 'image' ? src.naturalHeight : src.videoHeight; if (!sw || !sh) return;
    const s = (c.fit ? Math.max : Math.min)(bw / sw, bh / sh) * k, dw = sw * s, dh = sh * s;
    if (c.fit) { g.beginPath(); g.rect(cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); g.clip(); }
    g.filter = filterOf(c.fx);
    const px = c.fx?.pixel || 0;
    if (px > 0) {  // l'effet pixels : l'image réduite puis agrandie sans lissage
      off.width = Math.max(1, Math.round(dw / px)); off.height = Math.max(1, Math.round(dh / px)); og.drawImage(src, 0, 0, off.width, off.height);
      g.imageSmoothingEnabled = false; g.drawImage(off, cx - dw / 2, cy - dh / 2, dw, dh); g.imageSmoothingEnabled = true;
    } else g.drawImage(src, cx - dw / 2, cy - dh / 2, dw, dh);
  }
  function drawText(c, ox, k) {
    const fs = Math.max(4, c.size * Math.min(W, H) / 720), lines = String(c.text || '').split('\n'), lh = fs * 1.2;
    g.translate(c.x * W + ox, c.y * H); g.scale(k, k);
    g.font = (FONTS[c.font] || FONTS.gras)[1].replace('{}', Math.round(fs)); g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = Math.max(...lines.map(l => g.measureText(l).width)), h = lh * lines.length;
    if (c.bg) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(-w / 2 - fs * .4, -h / 2 - fs * .2, w + fs * .8, h + fs * .4); }
    g.lineJoin = 'round'; g.lineWidth = Math.max(2, fs / 7); g.strokeStyle = '#000'; g.fillStyle = c.col || '#fff';
    lines.forEach((l, i) => { const y = -h / 2 + lh * (i + .5); g.strokeText(l, 0, y); g.fillText(l, 0, y); });
  }
  function draw(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (const tr of DRAW_ORDER) if (!proj.mute[tr]) for (const c of order) if (c.tr === tr && isOn(c, t)) {
      const m = mediaOf(c.m); if (tr !== 't' && !m) continue;
      const {p, a} = fade(c, t); let ox = 0, k = 1;
      g.save(); g.globalAlpha = (c.tin === 'fondu' ? p : 1) * a;
      if (p < 1) { if (c.tin === 'glisse') ox = -(1 - p) * W; if (c.tin === 'zoom') k = .2 + .8 * p; if (c.tin === 'volet') { g.beginPath(); g.rect(0, 0, W * p, H); g.clip(); } }
      if (tr === 't') drawText(c, ox, k); else drawMedia(c, m, ox, k);
      g.restore();
    }
    time.textContent = fmt(t) + ' / ' + fmt(total());
  }

  // ---------- la lecture et le son ----------
  let ac = null, master = null, recDest = null, T = 0, playing = false, t0 = 0, p0 = 0, raf = 0, rec = null, order = [];
  function hook(id, e) { const gn = ac.createGain(); ac.createMediaElementSource(e).connect(gn).connect(master); gains.set(id, gn); }
  function audio() {
    if (!ac) { ac = new AudioContext(); master = ac.createGain(); master.connect(ac.destination); recDest = ac.createMediaStreamDestination(); master.connect(recDest); for (const [id, e] of els) hook(id, e); }
    if (ac.state === 'suspended') ac.resume();
  }
  function sync(t, run) {
    for (const c of proj.clips) {
      const m = mediaOf(c.m); if (!m || m.type === 'image' || !urls.has(m.id)) continue;
      const on = isOn(c, t), soon = c.start > t && c.start - t < 1.5, e = on || soon ? elOf(c) : els.get(c.id); if (!e) continue;
      if (!on) { if (!e.paused) e.pause(); if (soon && !e.seeking && Math.abs(e.currentTime - c.inn) > .05) e.currentTime = c.inn; continue; }  // prêt d'avance pour démarrer net
      const want = localT(c, t); e.playbackRate = c.speed;
      if (run) { if (e.paused) { e.currentTime = want; e.play().catch(() => {}); } else if (Math.abs(e.currentTime - want) > .3) e.currentTime = want; }
      else { if (!e.paused) e.pause(); if (!e.seeking && Math.abs(e.currentTime - want) > .02) e.currentTime = want; }
      const gn = gains.get(c.id), {p, a} = fade(c, t); if (gn) gn.gain.value = proj.mute[c.tr] ? 0 : c.vol * p * a;
    }
  }
  function loop() {
    if (!playing) return;
    T = t0 + (performance.now() - p0) / 1000;
    if (T >= total()) { T = total(); stop(); rec?.r.stop(); return; }
    sync(T, true); draw(T); movePh(true);
    if (rec) expBtn.textContent = 'ANNULER L\'EXPORT · ' + Math.floor(T / Math.max(.1, total()) * 100) + ' %';
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!proj.clips.length) return; audio(); if (T >= total() - .02) T = 0; playing = true; t0 = T; p0 = performance.now(); playB.textContent = '❚❚'; loop(); }
  function stop() { playing = false; cancelAnimationFrame(raf); for (const e of els.values()) e.pause(); playB.textContent = '▶'; sync(T, false); draw(T); movePh(); }
  const toggle = () => { if (rec) return cancelExport(); playing ? stop() : start(); };
  function seek(t) { T = clamp(t, 0, total() + 30); if (playing) { t0 = T; p0 = performance.now(); } sync(T, playing); draw(T); movePh(); }

  // ---------- l'export ----------
  const expBtn = btn('EXPORTER EN WEBM', () => rec ? cancelExport() : exportVideo(), 'main');
  function cancelExport() { if (!rec) return; rec.cancel = true; stop(); rec.r.stop(); }
  async function exportVideo(download = true) {  // download false : le test vérifie la vidéo sans l'enregistrer dans Téléchargements
    if (!proj.clips.length) return toast('Le montage est vide.');
    if (typeof MediaRecorder === 'undefined') return toast('Export impossible : pas d\'enregistreur vidéo ici.');
    stop(); audio(); T = 0; sync(0, false); await new Promise(r => setTimeout(r, 400)); draw(0);  // le temps que les vidéos se placent au début
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    const vt = cv.captureStream(30).getVideoTracks()[0], stream = new MediaStream([vt, ...recDest.stream.getAudioTracks()]);
    const r = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: 8e6, audioBitsPerSecond: 192e3}), parts = [];
    r.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
    const done = new Promise(ok => { r.onstop = ok; }); rec = {r, cancel: false};
    r.start(500); start(); await done; vt.stop();
    const cancelled = rec.cancel; rec = null; expBtn.textContent = 'EXPORTER EN WEBM';
    if (cancelled) return toast('Export annulé');
    const blob = new Blob(parts, {type: 'video/webm'}); view.__cfLast = blob; if (!download) return blob;
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'montage-' + new Date().toISOString().slice(0, 10) + '.webm'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast('Vidéo exportée (' + (blob.size / 1e6).toFixed(1) + ' Mo)');
  }

  // ---------- la timeline ----------
  let zm = 60;
  const zoom = el('input', 'cfRange'); zoom.type = 'range'; zoom.min = 10; zoom.max = 300; zoom.value = zm; zoom.oninput = () => { zm = +zoom.value; drawTl(); };
  tlBar.append(el('span', '', 'Zoom'), zoom, el('span', 'cfHelp', 'Glisse un clip pour le déplacer (aussi vers une autre piste), ses bords pour le rogner. Espace : lecture · S : couper · Suppr : effacer · Ctrl+Z : annuler'));
  const lanes = {}, heading = {};
  heads.append(el('div', 'rh'));
  for (const t of TRACKS) {
    const h = el('div'), m = el('span', 'm'), n = el('span', '', t.name);
    m.title = 'Couper / remettre la piste'; m.onclick = () => { snap(); proj.mute[t.id] = !proj.mute[t.id]; changed(); };
    h.append(m, n); heading[t.id] = [m, n]; heads.append(h);
    const l = el('div', 'cfLane k-' + t.kind); l.dataset.tr = t.id; lanes[t.id] = l;
  }
  lanesEl.append(ruler, ...Object.values(lanes), ph);
  const kindOk = (tr, c) => { const k = TRACKS.find(t => t.id === tr).kind, ck = kindOf(c); return k === 't' ? ck === 't' : k === 'a' ? ck === 'audio' : ck === 'video' || ck === 'image'; };
  function movePh(follow) {
    ph.style.left = Math.round(T * zm) + 'px'; time.textContent = fmt(T) + ' / ' + fmt(total());
    if (follow) { const x = T * zm; if (x > scroll.scrollLeft + scroll.clientWidth - 40 || x < scroll.scrollLeft) scroll.scrollLeft = x - 40; }
  }
  function drawTl() {
    const w = Math.max(scroll.clientWidth || 600, (total() + 15) * zm); lanesEl.style.width = w + 'px';
    const step = zm >= 80 ? 1 : zm >= 35 ? 2 : zm >= 15 ? 5 : 10;
    ruler.replaceChildren(...Array.from({length: Math.ceil(w / zm / step) + 1}, (_, i) => { const t = el('i', '', fmt(i * step).replace(/\.0$/, '')); t.style.left = i * step * zm + 'px'; return t; }));
    for (const t of TRACKS) { const [m, n] = heading[t.id]; m.textContent = proj.mute[t.id] ? '□' : '■'; n.className = proj.mute[t.id] ? 'off' : ''; }
    for (const [tr, l] of Object.entries(lanes)) l.replaceChildren(...order.filter(c => c.tr === tr).map(c => {
      const m = mediaOf(c.m), k = kindOf(c), d = el('div', 'cfClip k-' + k + (c.id === sel ? ' on' : '') + (m && !urls.has(m.id) ? ' miss' : ''));
      d.dataset.id = c.id; d.style.left = c.start * zm + 'px'; d.style.width = Math.max(6, c.dur * zm) + 'px';
      const bg = k === 'audio' ? m.wave : m?.thumb; if (bg) d.style.backgroundImage = `url(${bg})`;
      const fi = el('div', 'fi'), fo = el('div', 'fo'); fi.style.width = c.fin * zm + 'px'; fo.style.width = c.fout * zm + 'px';
      d.append(fi, fo, el('span', '', k === 't' ? String(c.text).split('\n')[0] : (c.speed !== 1 ? '×' + c.speed + ' ' : '') + m.name), el('i', 'h l'), el('i', 'h r'));
      d.title = (k === 't' ? c.text : m.name) + ' · ' + fmt(c.start) + ' → ' + fmt(c.start + c.dur); return d;
    }));
    movePh();
  }
  function snapT(t, self, len) {  // aimant : le début, la tête de lecture et les bords des autres clips, à 8 pixels près
    const pts = [0, T, ...proj.clips.filter(c => c.id !== self.id).flatMap(c => [c.start, c.start + c.dur])], lim = 8 / zm;
    let best = t, bd = lim;
    for (const p of pts) for (const o of len ? [0, len] : [0]) { const d = Math.abs(t + o - p); if (d < bd) { bd = d; best = p - o; } }
    return best;
  }
  const laneAt = y => Object.entries(lanes).find(([, l]) => { const r = l.getBoundingClientRect(); return y >= r.top && y < r.bottom; })?.[0];
  const tAt = x => (x - lanesEl.getBoundingClientRect().left) / zm;
  lanesEl.addEventListener('pointerdown', e => {
    if (e.button) return;
    const cd = e.target.closest('.cfClip'); try { lanesEl.setPointerCapture(e.pointerId); } catch {}
    if (!cd) {  // la règle ou un endroit vide : déplacer la tête de lecture
      if (sel) { sel = null; drawTl(); drawInsp(); }
      seek(Math.max(0, tAt(e.clientX)));
      lanesEl.onpointermove = ev => seek(Math.max(0, tAt(ev.clientX))); lanesEl.onpointerup = () => { lanesEl.onpointermove = lanesEl.onpointerup = null; }; return;
    }
    const c = clipOf(cd.dataset.id), r = cd.getBoundingClientRect(), x = e.clientX - r.left, o = {...c}, before = cur(), x0 = e.clientX;
    const mode = x < 9 ? 'l' : x > r.width - 9 ? 'r' : 'm', media = kindOf(c) === 'video' || kindOf(c) === 'audio';
    let moved = false; sel = c.id; drawInsp();
    lanesEl.onpointermove = ev => {
      const d = (ev.clientX - x0) / zm; if (!moved && Math.abs(ev.clientX - x0) < 3 && laneAt(ev.clientY) === o.tr) return; moved = true;
      if (mode === 'm') { c.start = Math.max(0, snapT(o.start + d, c, o.dur)); const tr = laneAt(ev.clientY); if (tr && kindOk(tr, c)) c.tr = tr; }
      else if (mode === 'l') { const ns = clamp(snapT(o.start + d, c, 0), Math.max(0, media ? o.start - o.inn / o.speed : 0), o.start + o.dur - .1); c.start = ns; c.dur = o.dur - (ns - o.start); c.inn = o.inn + (ns - o.start) * o.speed; }
      else c.dur = clamp(snapT(o.start + o.dur + d, c, 0) - o.start, .1, maxDur(c));
      refresh();
    };
    lanesEl.onpointerup = () => { lanesEl.onpointermove = lanesEl.onpointerup = null; if (moved) { push(before); changed(); } else drawTl(); };
  });

  // ---------- le panneau du clip ----------
  const commit = () => { if (pend) { push(pend); pend = null; } changed(); };
  const touch = () => { pend ??= cur(); };
  function slider(label, get, set, mn, mx, st, show = v => String(v)) {
    const row = el('div', 'cfP'), r = el('input', 'cfRange'), val = el('b', '', show(get()));
    r.type = 'range'; r.min = mn; r.max = mx; r.step = st; r.value = get(); r.dataset.k = label; val.translate = false;
    r.oninput = () => { touch(); set(+r.value); val.textContent = show(+r.value); refresh(); }; r.onchange = commit;
    row.append(el('span', '', label), r, val); return row;
  }
  function choice(label, opts, get, set) {
    const row = el('div', 'cfP'), s = el('select');
    for (const [v, n] of Object.entries(opts)) { const o = el('option', '', n); o.value = v; s.append(o); }
    s.value = String(get()); s.dataset.k = label; s.onchange = () => { touch(); set(s.value); commit(); };
    row.append(el('span', '', label), s, el('b')); return row;
  }
  function check(label, get, set) {
    const row = el('label', 'cfP'), b = el('input'); b.type = 'checkbox'; b.checked = !!get(); b.dataset.k = label;
    b.onchange = () => { touch(); set(b.checked); commit(); }; row.append(el('span', '', label), b, el('b')); return row;
  }
  const pct = v => Math.round(v * 100) + ' %', sec = v => (+v).toFixed(1) + ' s';
  function drawInsp() {
    const c = clipOf(sel); insp.replaceChildren();
    if (!c) {
      insp.append(el('span', 'label', 'Projet'), choice('Format', {'16:9': 'Paysage 16:9', '9:16': 'Portrait 9:16', '1:1': 'Carré 1:1'}, () => proj.fmt, v => { proj.fmt = v; resize(); }));
      const r = el('div', 'cfRow'); r.append(expBtn, btn('Vider la timeline', async () => { if (proj.clips.length && await ctx.host.confirm('Retirer tous les clips de la timeline ? (Ctrl+Z pour revenir)')) { snap(); proj.clips = []; sel = null; changed(); } }));
      insp.append(r, el('p', 'cfHelp', 'Clique sur un clip pour régler ses transitions, ses effets, sa vitesse et son volume. Vidéo 2 passe par-dessus Vidéo 1 (incrustation : réduis sa taille), les textes par-dessus tout. L\'export filme le montage en temps réel : garde ClipForge ouvert jusqu\'au bout.'));
      return;
    }
    const m = mediaOf(c.m), k = kindOf(c), n = el('div', 'cfInfo'); n.translate = false;
    n.textContent = fmt(c.start) + ' → ' + fmt(c.start + c.dur) + ' · ' + fmt(c.dur);
    insp.append(el('span', 'label', k === 't' ? 'Texte' : m.name), n);
    if (k === 't') {
      const ta = el('textarea'); ta.value = c.text; ta.dataset.k = 'texte'; ta.oninput = () => { touch(); c.text = ta.value; refresh(); }; ta.onchange = commit;
      const col = el('div', 'cfP'), ci = el('input'); ci.type = 'color'; ci.value = c.col; ci.oninput = () => { touch(); c.col = ci.value; refresh(); }; ci.onchange = commit; col.append(el('span', '', 'Couleur'), ci, el('b'));
      insp.append(ta, choice('Police', Object.fromEntries(Object.entries(FONTS).map(([k2, f]) => [k2, f[0]])), () => c.font, v => { c.font = v; }), col,
        slider('Taille', () => c.size, v => { c.size = v; }, 16, 200, 2), check('Fond sombre', () => c.bg, v => { c.bg = v; }));
    }
    if (k === 'video' || k === 'audio') {
      insp.append(choice('Vitesse', Object.fromEntries(SPEEDS.map(s => [s, '×' + s])), () => c.speed, v => { const s = +v; c.dur = c.dur * c.speed / s; c.speed = s; c.dur = Math.min(c.dur, maxDur(c)); }),
        slider('Volume', () => c.vol, v => { c.vol = v; }, 0, 2, .05, pct));
    }
    if (k !== 'audio') insp.append(choice('Entrée', TRANS, () => c.tin, v => { c.tin = v; }));
    insp.append(slider(k === 'audio' ? 'Fondu d\'entrée' : 'Durée entrée', () => c.fin, v => { c.fin = Math.min(v, c.dur); }, 0, 3, .1, sec),
      slider('Fondu de sortie', () => c.fout, v => { c.fout = Math.min(v, c.dur); }, 0, 3, .1, sec));
    if (k !== 'audio') {
      if (k !== 't') insp.append(slider('Taille', () => c.sc, v => { c.sc = v; }, .1, 1.5, .01, pct), check('Remplir le cadre', () => c.fit, v => { c.fit = v; }));
      insp.append(slider('Position X', () => c.x, v => { c.x = v; }, 0, 1, .01, pct), slider('Position Y', () => c.y, v => { c.y = v; }, 0, 1, .01, pct));
    }
    if (k === 'video' || k === 'image') {
      const looks = el('div', 'cfLooks');
      for (const [nm, fx] of Object.entries(LOOKS)) looks.append(btn(nm, () => { snap(); c.fx = {...fx}; changed(); }));
      insp.append(el('span', 'label', 'Effets'), looks, ...FX.map(([key, nm, mn, mx]) => slider(nm, () => c.fx?.[key] ?? FX0[key], v => { c.fx = {...c.fx, [key]: v}; }, mn, mx, 1)));
    }
    const r = el('div', 'cfRow'); r.append(btn('Dupliquer', dup), btn('Supprimer', del)); insp.append(r);
  }

  // ---------- tout remettre à jour ----------
  function resize() { [W, H] = FORMATS[proj.fmt] || FORMATS['16:9']; cv.width = W; cv.height = H; }
  function refresh() { order = [...proj.clips].sort((a, b) => a.start - b.start); drawTl(); if (!playing) { sync(T, false); draw(T); } }
  function changed() { for (const id of [...els.keys()]) if (!clipOf(id)) drop(id); save(); refresh(); drawInsp(); }
  const playB = btn('▶', toggle, 'main'); playB.title = 'Lecture / pause (Espace)';
  const tb = (txt, fn, tip) => { const x = btn(txt, fn); x.title = tip; return x; };
  bar.append(tb('⏮', () => seek(0), 'Au début (Origine)'), playB, time, tb('✂ Couper', cut, 'Couper sous la tête de lecture (S)'), tb('Annuler', undo, 'Ctrl+Z'), tb('Rétablir', redo, 'Ctrl+Y'));
  document.addEventListener('keydown', e => {
    if (!view.isConnected || !view.offsetParent || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.ctrlKey && k === 'z') { e.preventDefault(); undo(); } else if (e.ctrlKey && k === 'y') { e.preventDefault(); redo(); }
    else if (e.ctrlKey || e.altKey || e.metaKey) return;
    else if (k === ' ') { e.preventDefault(); toggle(); } else if (k === 's') cut(); else if (k === 'delete' || k === 'backspace') del();
    else if (k === 'home') seek(0); else if (k === 'arrowleft') seek(T - 1 / 30); else if (k === 'arrowright') seek(T + 1 / 30);
  });
  new ResizeObserver(() => drawTl()).observe(scroll);
  resize(); drawLib(); refresh(); drawInsp();
  // pour le test « local » de NeoDex
  view.__cf = {proj, addFile, addText, addClip, cut, seek, undo, exportVideo, changed, get T() { return T; }, get sel() { return sel; }, set sel(v) { sel = v; drawInsp(); drawTl(); }};
}
