// ClipForge : un monteur vidéo dans l'esprit de CapCut. Les médias importés (vidéos, images, sons) se posent sur une timeline à 8 pistes
// (deux de textes et d'autocollants, une d'effets, l'incrustation par-dessus la vidéo, trois de son), se coupent, se déplacent et se rognent
// à la souris. Chaque clip a ses transitions d'entrée et de sortie, son mouvement, sa position, sa rotation, ses filtres et réglages de couleur,
// sa vitesse et son volume ; les textes ont leurs styles et leurs animations ; les effets (VHS, glitch, grain, neige…) s'appliquent à toute
// l'image sous eux. L'aperçu est un canevas : l'export le filme en temps réel avec MediaRecorder (vidéo + sons mixés par Web Audio).
const CSS = `
.cfApp{display:flex;flex-direction:column;gap:8px}
.cfHead{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.cfHead .label{margin:0;flex:1}
.cfHead .btn,.cfRow .btn,.cfInsp .btn,.cfBar .btn,.cfTools .btn{width:auto;margin:0;padding:5px 9px}
.cfTop{display:grid;grid-template-columns:290px minmax(0,1fr) 300px;gap:8px}
@media (max-width:1150px){.cfTop{grid-template-columns:minmax(0,1fr)}.cfStage{order:-1}.cfCv{max-height:300px}}
.cfLib,.cfInsp{display:flex;flex-direction:column;gap:6px;height:520px;overflow:auto;min-width:0}
@media (max-width:1150px){.cfLib,.cfInsp{height:auto;max-height:420px}}
.cfTabs{display:flex;gap:2px;flex-wrap:wrap;border-bottom:2px solid var(--line);padding-bottom:6px;margin-bottom:2px}
.cfTabs button{background:none;border:2px solid transparent;color:var(--muted);font:11px inherit;padding:4px 6px;cursor:var(--cp,pointer);display:flex;flex-direction:column;align-items:center;gap:1px;min-width:42px}
.cfTabs button b{font-size:16px;line-height:1;font-weight:normal;color:var(--lilac)}
.cfTabs button.on{border-color:var(--magenta);color:#fff;background:rgba(var(--pkr),.15)}
.cfTabs button.on b{color:#fff}
.cfRow{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.cfMed{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:6px;align-items:center;background:var(--bg0);border:2px solid var(--line);padding:4px;cursor:var(--cp,pointer)}
.cfMed:hover{border-color:var(--magenta)}
.cfMed.miss{border-color:#ff4fb0;opacity:.75}
.cfMed .th{width:72px;height:40px;background:#0b0816 center/cover no-repeat;display:flex;align-items:center;justify-content:center;font:12px monospace;color:var(--muted);position:relative}
.cfMed .th i{position:absolute;right:1px;bottom:1px;background:rgba(0,0,0,.75);color:#fff;font:9px monospace;font-style:normal;padding:0 2px}
.cfMed b{font-weight:normal;color:#fff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.cfMed small{display:block;color:var(--muted);font-size:11px}
.cfMed .x{color:var(--muted);padding:0 4px}
.cfMed .x:hover{color:#ff4fb0}
.cfCards{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:6px}
.cfCard{background:var(--bg0);border:2px solid var(--line);cursor:var(--cp,pointer);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 3px;font-size:11px;color:var(--lilac);text-align:center;min-height:62px;position:relative;overflow:hidden}
.cfCard:hover{border-color:var(--magenta);color:#fff}
.cfCard.on{border-color:#fff;color:#fff}
.cfCard .pv{width:100%;height:42px;background:#0b0816 center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;overflow:hidden}
.cfCard.emo{font-size:28px;min-height:48px;padding:2px}
.cfStage{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0;background:#06040c}
.cfScreen{flex:1;width:100%;display:flex;align-items:center;justify-content:center;min-height:0;background:repeating-linear-gradient(45deg,#0b0816 0 8px,#0e0a1c 8px 16px)}
.cfCv{max-width:100%;max-height:430px;background:#000;display:block;box-shadow:0 0 0 2px var(--line)}
.cfBar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center;width:100%}
.cfTime{font:14px monospace;color:#fff;min-width:150px;text-align:center}
.cfTime small{color:var(--muted)}
.cfInsp{font-size:12px;color:var(--lilac)}
.cfInfo{font:11px monospace;color:var(--muted)}
.cfP{display:grid;grid-template-columns:96px minmax(0,1fr) 52px;gap:6px;align-items:center}
.cfP b{font:11px monospace;color:#fff;text-align:right;font-weight:normal}
.cfP select,.cfP input[type=color]{width:100%;box-sizing:border-box;background:var(--bg0);color:#fff;border:2px solid var(--line);font:12px inherit;padding:2px}
.cfSub{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:6px}
.cfRange{-webkit-appearance:none;appearance:none;height:10px;background:var(--bg0);border:2px solid var(--line);outline:none;width:100%}
.cfRange::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:20px;background:var(--magenta);border:2px solid #000;cursor:var(--cp,pointer)}
.cfInsp textarea{width:100%;box-sizing:border-box;min-height:64px;resize:vertical;background:var(--bg0);color:#fff;border:2px solid var(--line);font:13px inherit;padding:6px}
.cfHelp{font-size:12px;color:var(--muted);line-height:1.55;margin:0}
.cfTools{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.cfTools .cfRange{width:140px}
.cfTools .sp{flex:1}
.cfTl{display:grid;grid-template-columns:118px minmax(0,1fr);background:#0b0816;border:2px solid var(--line);user-select:none}
.cfHeads>div{border-top:2px solid var(--line);display:flex;align-items:center;gap:6px;padding:0 6px;font-size:12px;color:var(--lilac);box-sizing:border-box;background:var(--bg0)}
.cfHeads>.rh{height:24px;border-top:0}
.cfHeads .ic{width:18px;text-align:center;font-size:13px}
.cfHeads .m{cursor:var(--cp,pointer);font:13px monospace;color:#fff;margin-left:auto}
.cfHeads .off{color:var(--muted);text-decoration:line-through}
.cfScroll{overflow-x:auto;overflow-y:hidden;min-width:0}
.cfLanes{position:relative;touch-action:none}
.cfRuler{height:24px;position:relative;cursor:var(--cp,pointer);background:#0b0816;overflow:hidden;background-image:linear-gradient(90deg,var(--line) 1px,transparent 1px);background-position:0 16px;background-repeat:repeat-x}
.cfRuler i{position:absolute;top:0;height:24px;border-left:2px solid var(--line);font:10px monospace;color:var(--muted);padding-left:3px;font-style:normal;box-sizing:border-box}
.cfLane{border-top:2px solid var(--line);position:relative;box-sizing:border-box}
.cfLane.k-t{background:#130f1f}.cfLane.k-e{background:#0d1714}.cfLane.k-v{background:#100c18}.cfLane.k-a{background:#0c1216}
.cfClip{position:absolute;top:3px;bottom:3px;border:2px solid #000;box-sizing:border-box;overflow:hidden;font-size:11px;padding:2px 9px;white-space:nowrap;cursor:grab;background-repeat:repeat-x;background-size:auto 100%}
.cfClip.k-video{background-color:#ff4fb0}.cfClip.k-image{background-color:#b48cff}.cfClip.k-t{background-color:#ffd84a}.cfClip.k-e{background-color:#3ad0a0}
.cfClip.k-audio{background-color:#1d6b55;background-size:100% 100%;background-repeat:no-repeat}
.cfClip.miss{background-color:#5a2a3a}
.cfClip.on{border-color:#fff;box-shadow:inset 0 0 0 1px #fff}
.cfClip span{background:rgba(0,0,0,.7);color:#fff;padding:0 3px;position:relative;z-index:1}
.cfClip .h{position:absolute;top:0;bottom:0;width:7px;background:rgba(255,255,255,.5);cursor:ew-resize;z-index:2}
.cfClip .h.l{left:0}.cfClip .h.r{right:0}
.cfClip .fi,.cfClip .fo{position:absolute;top:0;bottom:0;background:rgba(0,0,0,.45)}
.cfClip .fi{left:0;clip-path:polygon(0 0,100% 0,0 100%)}.cfClip .fo{right:0;clip-path:polygon(0 0,100% 0,100% 100%)}
.cfPh{position:absolute;top:0;bottom:0;width:2px;background:#fff;pointer-events:none;z-index:3}
.cfPh::before{content:'';position:absolute;top:0;left:-5px;width:12px;height:10px;background:#fff;clip-path:polygon(0 0,100% 0,50% 100%)}
`;
const FORMATS = {'16:9': [1280, 720], '9:16': [720, 1280], '1:1': [1080, 1080], '4:5': [1080, 1350], '4:3': [960, 720], '21:9': [1680, 720]};
const FMT_NAMES = {'16:9': 'Paysage 16:9', '9:16': 'Portrait 9:16 (TikTok)', '1:1': 'Carré 1:1', '4:5': 'Instagram 4:5', '4:3': 'Ancien 4:3', '21:9': 'Cinéma 21:9'};
const QUAL = {'480': ['480p', 480], '720': ['720p', 720], '1080': ['1080p', 1080]};
const TRACKS = [{id: 't2', name: 'Textes 2', kind: 't', ic: 'T', h: 34}, {id: 't', name: 'Textes', kind: 't', ic: 'T', h: 34}, {id: 'e', name: 'Effets', kind: 'e', ic: '✦', h: 30},
  {id: 'v2', name: 'Incrustation', kind: 'v', ic: '▣', h: 48}, {id: 'v1', name: 'Vidéo', kind: 'v', ic: '▶', h: 56}, {id: 'a1', name: 'Son 1', kind: 'a', ic: '♪', h: 40}, {id: 'a2', name: 'Son 2', kind: 'a', ic: '♪', h: 40}, {id: 'a3', name: 'Musique', kind: 'a', ic: '♫', h: 40}];
// [clé, nom, min, max, neutre]
const FX = [['lum', 'Luminosité', 0, 200, 100], ['con', 'Contraste', 0, 200, 100], ['sat', 'Saturation', 0, 300, 100], ['gris', 'Noir et blanc', 0, 100, 0],
  ['sepia', 'Sépia', 0, 100, 0], ['teinte', 'Teinte', -180, 180, 0], ['flou', 'Flou', 0, 20, 0], ['pixel', 'Pixels', 0, 32, 0]];
const FX0 = Object.fromEntries(FX.map(f => [f[0], f[4]]));
const LOOKS = {'Normal': {}, 'Noir et blanc': {gris: 100, con: 120}, 'Ancien': {sepia: 80, con: 90, lum: 105}, 'Vif': {sat: 170, con: 115}, 'Froid': {teinte: 25, sat: 80, lum: 95},
  'Chaud': {sepia: 30, sat: 130, lum: 105}, 'Nuit': {lum: 60, con: 130, teinte: 20, sat: 60}, 'Cinéma': {con: 125, sat: 85, sepia: 15, lum: 95}, 'Pastel': {sat: 60, lum: 115, con: 85},
  'Délavé': {con: 75, sat: 70, lum: 110}, 'Contraste': {con: 170, sat: 110}, 'Sombre': {lum: 70, con: 115, sat: 90}, 'Rêve': {lum: 112, sat: 120, flou: 1}, 'Rétro pixel': {pixel: 6, sat: 130, con: 110}};
// transitions d'entrée et de sortie : q va de 0 (caché) à 1 (montré)
const TRANS = {fondu: 'Fondu', 'glisse-g': 'Glisse ←', 'glisse-d': 'Glisse →', monte: 'Monte', descend: 'Descend', zoom: 'Zoom', dezoom: 'Dézoom', volet: 'Volet', cercle: 'Cercle',
  flou: 'Flou', flash: 'Flash', tourne: 'Tourne', glitch: 'Glitch'};
const MOTIONS = {'': 'Aucun', kb: 'Zoom lent', kbo: 'Dézoom lent', pand: 'Panoramique →', pang: 'Panoramique ←', shake: 'Secousse', pulse: 'Pulsation', spin: 'Rotation', float: 'Flottement'};
const FONTS = {gras: ['Gras', 'bold {}px sans-serif'], normal: ['Normal', '{}px sans-serif'], machine: ['Machine à écrire', 'bold {}px monospace'], titre: ['Titre', 'bold {}px serif'],
  impact: ['Impact', '{}px Impact, "Arial Black", sans-serif'], ronde: ['Ronde', 'bold {}px "Comic Sans MS", "Trebuchet MS", sans-serif'], fine: ['Fine', '300 {}px "Segoe UI", sans-serif'], italique: ['Italique', 'italic bold {}px Georgia, serif']};
const TANIMS = {'': 'Aucune', machine: 'Machine à écrire', mot: 'Mot par mot', pop: 'Pop', rebond: 'Rebond', vague: 'Vague', battement: 'Battement'};
// les styles de texte tout prêts
const TSTYLES = {
  'Sous-titre': {font: 'gras', size: 48, col: '#ffffff', bg: 'box', bgCol: '#000000', sw: 0, shadow: '', y: .85},
  'Titre': {font: 'impact', size: 110, col: '#ffd84a', bg: '', sw: 10, stroke: '#000000', shadow: '', y: .45, anim: 'pop'},
  'Contour': {font: 'gras', size: 80, col: '#ffffff', bg: '', sw: 12, stroke: '#000000', shadow: ''},
  'Néon': {font: 'fine', size: 80, col: '#ffffff', bg: '', sw: 0, shadow: 'glow', shCol: '#ff4fb0'},
  'Bulle': {font: 'ronde', size: 60, col: '#1a1030', bg: 'bulle', bgCol: '#ffffff', sw: 0, shadow: ''},
  'Rétro': {font: 'italique', size: 90, col: '#ff4fb0', bg: '', sw: 0, shadow: 'drop', shCol: '#4fc3ff'},
  'Machine': {font: 'machine', size: 54, col: '#e8ffe8', bg: 'box', bgCol: '#0b1a0b', sw: 0, shadow: '', anim: 'machine'},
  'Étiquette': {font: 'gras', size: 50, col: '#ffffff', bg: 'bulle', bgCol: '#ff4fb0', sw: 0, shadow: '', anim: 'rebond'},
  'Ombre douce': {font: 'titre', size: 76, col: '#ffffff', bg: '', sw: 0, shadow: 'soft', shCol: '#000000'},
  'Jaune vif': {font: 'gras', size: 64, col: '#ffe14a', bg: '', sw: 8, stroke: '#2a1a00', shadow: 'drop', shCol: '#000000', anim: 'vague'},
};
const STICKERS = ['😀', '😂', '😍', '😎', '🤯', '😱', '🥳', '😭', '👍', '👏', '🙏', '💪', '🔥', '✨', '⭐', '💥', '💯', '❤️', '💔', '💖', '🎉', '🎵', '📢', '❗', '❓', '✅', '❌', '➡️', '⬇️', '👀', '🌈', '☀️', '🌙', '⚡', '💤', '🍕', '🎮', '🏆', '📍', '🚀'];
const EFFECTS = {vignette: ['Vignette', '◐'], grain: ['Grain', '░'], vhs: ['VHS', '📼'], glitch: ['Glitch', '▚'], flash: ['Flash', '⚡'], secousse: ['Secousse', '〰'], zoompulse: ['Zoom pulsé', '⊕'],
  cinema: ['Cinéma', '▭'], nb: ['Noir et blanc', '◑'], flou: ['Flou', '◌'], pixels: ['Pixels', '▦'], neige: ['Neige', '❄'], confettis: ['Confettis', '🎊'], pluie: ['Pluie', '☔'], etoiles: ['Étoiles', '✦'], coeurs: ['Cœurs', '♥']};
const SPEEDS = [.1, .25, .5, .75, 1, 1.25, 1.5, 2, 3, 4, 8];
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const easeOut = q => 1 - (1 - q) ** 3, backOut = q => { const s = 1.7; return 1 + (s + 1) * (q - 1) ** 3 + s * (q - 1) ** 2; };
const bounce = q => { const n = 7.5625, d = 2.75; return q < 1 / d ? n * q * q : q < 2 / d ? n * (q -= 1.5 / d) * q + .75 : q < 2.5 / d ? n * (q -= 2.25 / d) * q + .9375 : n * (q -= 2.625 / d) * q + .984375; };
// ---------- le temps d'un clip ----------
const isOn = (c, t) => t >= c.start && t < c.start + c.dur;
const localT = (c, t) => c.inn + (t - c.start) * c.speed;  // l'instant du média montré à l'instant t du montage
function fade(c, t) {  // p : avancée de l'entrée (0 → 1), a : avancée de la sortie (1 → 0)
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
// ce que fait une transition à l'avancée q : décalage, échelle, rotation, opacité, flou, découpe, flash
function trans(type, q, W, H, out) {
  const o = {ox: 0, oy: 0, k: 1, rot: 0, a: 1, blur: 0, clip: null, flash: 0, jit: 0}; if (q >= 1) return o;
  const e = easeOut(q), s = out ? -1 : 1;
  switch (type) {
    case 'glisse-g': o.ox = -(1 - e) * W * s; break; case 'glisse-d': o.ox = (1 - e) * W * s; break;
    case 'monte': o.oy = (1 - e) * H * s; break; case 'descend': o.oy = -(1 - e) * H * s; break;
    case 'zoom': o.k = .2 + .8 * e; o.a = q; break; case 'dezoom': o.k = 1 + 1.5 * (1 - e); o.a = q; break;
    case 'volet': o.clip = g => g.rect(0, 0, W * e, H); break; case 'cercle': o.clip = g => g.arc(W / 2, H / 2, Math.max(1, e * Math.hypot(W, H) / 2), 0, Math.PI * 2); break;
    case 'flou': o.blur = (1 - e) * 24; o.a = Math.min(1, q * 1.5); break; case 'flash': o.flash = 1 - q; o.a = Math.min(1, q * 2); break;
    case 'tourne': o.rot = (1 - e) * Math.PI * s; o.k = .3 + .7 * e; o.a = q; break; case 'glitch': o.jit = 1 - q; o.a = q < .2 ? q * 5 : 1; break;
    default: o.a = q;
  }
  return o;
}
// vérification : la découpe garde le bon morceau du média, à la bonne vitesse, le fondu avance comme il faut, les transitions finissent à leur place
{ const c = {id: 'a', start: 2, dur: 4, inn: 1, speed: 2, fin: 1, fout: 0, fx: {}}, b = split(c, 3);
  console.assert(b && c.dur === 1 && b.start === 3 && b.inn === 3 && b.dur === 3 && localT(b, 4) === 5 && fade(c, 2.5).p === .5 && fade(b, 5.9).a === 1 && !split(c, 2.01)
    && filterOf({}) === 'none' && filterOf({gris: 100}).includes('grayscale(100%)') && Object.keys(TRANS).every(k => { const o = trans(k, 1, 100, 100); return o.a === 1 && o.ox === 0 && o.k === 1 && !o.clip; })
    && Math.abs(bounce(1) - 1) < 1e-6 && Math.abs(backOut(1) - 1) < 1e-9, 'ClipForge : découpe, temps, effets ou transitions faux'); }

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast } = ctx.host;
  ctx.host.addStyle(CSS);
  // le montage est dans « montage » ; l'ancien document « clipforge » (l'atelier de texte d'avant) reste sur le disque, intact
  let data = null; try { data = await ctx.folder.read('montage'); } catch {}
  const proj = {fmt: '16:9', mute: {}, clips: [], media: [], qual: '720', fps: 30, vfmt: 'webm', bg: '#000000', ...(data || {})};
  const urls = new Map(), imgs = new Map(), els = new Map(), gains = new Map();
  const mediaOf = id => proj.media.find(m => m.id === id), clipOf = id => proj.clips.find(c => c.id === id);
  const kindOf = c => c.tr === 't' || c.tr === 't2' ? 't' : c.tr === 'e' ? 'e' : c.tr[0] === 'a' ? 'audio' : mediaOf(c.m)?.type;
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => ctx.folder.write('montage', proj).catch(e => toast('Montage non enregistré : ' + e.message)), 400); };
  for (const m of proj.media) if (m.file) try { const b = await ctx.folder.readFile(m.file); if (b) urls.set(m.id, URL.createObjectURL(await (await fetch('data:' + (m.mime || 'application/octet-stream') + ';base64,' + b)).blob())); } catch {}

  // ---------- l'interface ----------
  view.innerHTML = '';
  const app = el('div', 'appWrap cfApp'), head = el('div', 'cfHead'), top = el('div', 'cfTop');
  const lib = el('div', 'sysCard px cfLib'), stage = el('div', 'sysCard px cfStage'), insp = el('div', 'sysCard px cfInsp');
  const screen = el('div', 'cfScreen'), cv = el('canvas', 'cfCv'), g = cv.getContext('2d'), bar = el('div', 'cfBar'), time = el('span', 'cfTime');
  cv.id = 'cf_cv'; time.translate = false;
  const tlBar = el('div', 'cfTools cfTlBar'), tl = el('div', 'cfTl'), heads = el('div', 'cfHeads'), scroll = el('div', 'cfScroll'), lanesEl = el('div', 'cfLanes'), ruler = el('div', 'cfRuler'), ph = el('div', 'cfPh');
  screen.append(cv); stage.append(screen, bar);
  top.append(lib, stage, insp); scroll.append(lanesEl); tl.append(heads, scroll); app.append(head, top, tlBar, tl); view.append(app);
  const btn = (txt, fn, cls = '') => { const b = el('button', 'btn px ' + cls, txt); b.onclick = fn; return b; };
  const pick = (multi, fn) => { const i = el('input'); i.type = 'file'; i.multiple = multi; i.accept = 'video/*,audio/*,image/*'; i.onchange = () => fn([...i.files]); i.click(); };
  const tabs = (items, cur, set) => { const t = el('div', 'cfTabs'); for (const [k, ic, n] of items) { const b = el('button', k === cur ? 'on' : ''); b.append(el('b', '', ic), el('span', '', n)); b.dataset.tab = k; b.onclick = () => set(k); t.append(b); } return t; };

  // ---------- les médias ----------
  const once = (e, ev) => new Promise((ok, ko) => { e.addEventListener(ev, ok, {once: true}); e.addEventListener('error', () => ko(new Error('illisible')), {once: true}); });
  const thumbOf = (src, w, h) => { const c = document.createElement('canvas'), k = Math.min(1, 128 / w, 72 / h); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k)); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .7); };
  async function probe(m, url) {
    if (m.type === 'image') { const i = new Image(); i.src = url; await once(i, 'load'); m.w = i.naturalWidth; m.h = i.naturalHeight; m.thumb = thumbOf(i, m.w, m.h); return; }
    const e = document.createElement(m.type); e.preload = 'auto'; e.muted = true; e.src = url; await once(e, 'loadedmetadata');
    if (!isFinite(e.duration)) { e.currentTime = 1e9; await once(e, 'seeked'); }  // les WebM enregistrés par un navigateur n'annoncent pas leur durée
    m.dur = e.duration; if (!(m.dur > 0)) throw new Error('durée inconnue');
    if (m.type === 'video') {
      m.w = e.videoWidth; m.h = e.videoHeight; e.currentTime = Math.min(1, m.dur / 2); await once(e, 'seeked'); m.thumb = thumbOf(e, m.w, m.h);
      // la pellicule : 10 images réparties sur la vidéo, posées côte à côte (le fond des clips sur la timeline)
      const N = 10, fw = 64, fh = Math.max(1, Math.round(64 * m.h / Math.max(1, m.w))), s = document.createElement('canvas'), sg = s.getContext('2d'); s.width = fw * N; s.height = fh;
      for (let i = 0; i < N; i++) { e.currentTime = Math.min(m.dur - .01, (i + .5) * m.dur / N); await Promise.race([once(e, 'seeked'), new Promise(r => setTimeout(r, 1500))]); sg.drawImage(e, i * fw, 0, fw, fh); }
      m.strip = s.toDataURL('image/jpeg', .6);
    }
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
  async function solidColor() {  // un fond de couleur unie, en image
    const col = await ctx.host.ask?.('Couleur du fond (par exemple #1a1030 ou rose)', '#1a1030'); if (!col) return;
    const [w, h] = FORMATS[proj.fmt], c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillStyle = String(col); x.fillRect(0, 0, w, h);
    const b = await new Promise(ok => c.toBlob(ok, 'image/png')), m = await addFile(new File([b], 'Fond ' + col + '.png', {type: 'image/png'})); if (m) addClip(m);
  }

  // ---------- la bibliothèque (à gauche) ----------
  let libTab = 'media', transSide = 'in';
  function card(label, pv, fn, cls = '') { const d = el('div', 'cfCard ' + cls); if (pv !== null) { const p = el('div', 'pv'); if (typeof pv === 'string') p.textContent = pv; else p.append(pv); d.append(p); } d.append(el('span', '', label)); d.onclick = fn; return d; }
  function drawLib() {
    lib.replaceChildren(tabs([['media', '▤', 'Médias'], ['text', 'T', 'Texte'], ['stick', '☺', 'Autocoll.'], ['fx', '✦', 'Effets'], ['trans', '⇄', 'Transit.'], ['filt', '◐', 'Filtres']], libTab, k => { libTab = k; drawLib(); }));
    const c = clipOf(sel), need = () => { toast('Choisis d\'abord un clip sur la timeline'); };
    if (libTab === 'media') {
      const r = el('div', 'cfRow'); r.append(btn('IMPORTER', () => pick(true, importFiles), 'main'), btn('+ FOND UNI', solidColor)); lib.append(r);
      if (!proj.media.length) lib.append(el('p', 'cfHelp', 'Importe des vidéos, des images et des sons (ou glisse-les ici), puis clique sur un média pour le poser au bout de sa piste.'));
      for (const m of proj.media) {
        const row = el('div', 'cfMed' + (urls.has(m.id) ? '' : ' miss')), th = el('div', 'th', m.type === 'audio' && !m.wave ? '♪' : ''), info = el('div'), x = el('span', 'x', '✕');
        if (m.thumb || m.wave) th.style.backgroundImage = `url(${m.thumb || m.wave})`; if (m.type !== 'image') th.append(el('i', '', fmt(m.dur)));
        info.append(el('b', '', m.name), el('small', '', urls.has(m.id) ? ({video: 'Vidéo', audio: 'Son', image: 'Image'}[m.type] + (m.w ? ' · ' + m.w + '×' + m.h : '')) : 'À réimporter (plus de 15 Mo)'));
        row.title = urls.has(m.id) ? 'Poser sur la timeline' : 'Choisir à nouveau ce fichier'; x.title = 'Retirer';
        row.onclick = e => { if (e.target === x) return removeMedia(m); if (urls.has(m.id)) addClip(m); else pick(false, fs => fs[0] && addFile(fs[0], m)); };
        row.dataset.media = m.id; row.append(th, info, x); lib.append(row);
      }
    } else if (libTab === 'text') {
      lib.append(btn('+ TEXTE SIMPLE', () => addText(), 'main'), el('span', 'cfSub', 'Styles'));
      const cards = el('div', 'cfCards');
      for (const [n, s] of Object.entries(TSTYLES)) { const pv = el('div', 'pv'); pv.textContent = 'Aa'; pv.style.cssText = `font:${(FONTS[s.font] || FONTS.gras)[1].replace('{}', 20)};color:${s.col};${s.bg ? `background:${s.bgCol}` : ''};${s.sw ? `-webkit-text-stroke:1px ${s.stroke}` : ''};${s.shadow === 'glow' ? `text-shadow:0 0 6px ${s.shCol}` : s.shadow === 'drop' ? `text-shadow:2px 2px 0 ${s.shCol}` : ''}`;
        const d = card(n, pv, () => { const t = addText(); Object.assign(t, JSON.parse(JSON.stringify(s)), {text: n === 'Sous-titre' ? 'Ton sous-titre' : 'Ton texte'}); changed(); }); d.dataset.style = n; cards.append(d); }
      lib.append(cards, el('p', 'cfHelp', 'Le texte se pose à la tête de lecture. Règle ensuite son animation et ses couleurs à droite.'));
    } else if (libTab === 'stick') {
      const cards = el('div', 'cfCards'); for (const s of STICKERS) { const d = card(s, null, () => addSticker(s), 'emo'); d.title = 'Ajouter'; d.dataset.sticker = s; cards.append(d); }
      lib.append(cards, el('p', 'cfHelp', 'Un autocollant se pose à la tête de lecture, sur une piste de textes. Donne-lui un mouvement (pulsation, rotation, flottement) dans Animation.'));
    } else if (libTab === 'fx') {
      const cards = el('div', 'cfCards'); for (const [k, [n, ic]] of Object.entries(EFFECTS)) { const d = card(n, ic, () => addEffect(k)); d.dataset.effect = k; cards.append(d); }
      lib.append(cards, el('p', 'cfHelp', 'Un effet se pose sur la piste Effets à la tête de lecture et s\'applique à toute l\'image en dessous (vidéo et incrustation), pendant sa durée.'));
    } else if (libTab === 'trans') {
      lib.append(tabs([['in', '→', 'Entrée'], ['out', '←', 'Sortie']], transSide, k => { transSide = k; drawLib(); }));
      const cards = el('div', 'cfCards'), curT = c ? (transSide === 'in' ? c.tin : c.tout) || 'fondu' : '';
      for (const [k, n] of Object.entries(TRANS)) { const d = card(n, k === 'fondu' ? '◐' : k.includes('glisse') ? (k.endsWith('g') ? '⇠' : '⇢') : {monte: '⇡', descend: '⇣', zoom: '⊕', dezoom: '⊖', volet: '▌', cercle: '◯', flou: '◌', flash: '⚡', tourne: '↻', glitch: '▚'}[k], () => {
        if (!c || kindOf(c) === 'audio' || kindOf(c) === 'e') return need(); snap(); if (transSide === 'in') { c.tin = k; if (!c.fin) c.fin = .5; } else { c.tout = k; if (!c.fout) c.fout = .5; } changed(); }, k === curT ? 'on' : ''); d.dataset.trans = k; cards.append(d); }
      lib.append(cards, el('p', 'cfHelp', c ? 'Clique une transition pour le clip choisi. Sa durée se règle dans Animation.' : 'Choisis un clip sur la timeline pour lui donner une transition.'));
    } else {
      const cards = el('div', 'cfCards'), th = c && (mediaOf(c.m)?.thumb);
      for (const [n, fx] of Object.entries(LOOKS)) { const pv = el('div', 'pv'); if (th) pv.style.backgroundImage = `url(${th})`; else pv.style.background = 'linear-gradient(135deg,#ff4fb0,#4fc3ff 50%,#ffd34f)'; pv.style.filter = filterOf(fx) === 'none' ? '' : filterOf(fx);
        const d = card(n, pv, () => { if (!c || !['video', 'image'].includes(kindOf(c))) return need(); snap(); c.fx = {...fx}; changed(); }); d.dataset.look = n; cards.append(d); }
      lib.append(cards, el('p', 'cfHelp', 'Les filtres s\'appliquent au clip vidéo ou image choisi. Affine-les dans Couleur, à droite.'));
    }
  }

  // ---------- les clips ----------
  const endOf = tr => Math.max(0, ...proj.clips.filter(c => c.tr === tr).map(c => c.start + c.dur));
  const total = () => Math.max(0, ...proj.clips.map(c => c.start + c.dur));
  const maxDur = c => { const m = mediaOf(c.m); return m && m.type !== 'image' ? (m.dur - c.inn) / c.speed : 3600; };
  const base = () => ({id: uid(), inn: 0, speed: 1, vol: 1, fin: 0, fout: 0, tin: 'fondu', tout: 'fondu', x: .5, y: .5, sc: 1, rot: 0, op: 1, flip: false, flipV: false, mot: '', fit: false, bgBlur: false, fx: {}});
  const freeAt = (trs, t, d) => trs.find(tr => !proj.clips.some(c => c.tr === tr && c.start < t + d && c.start + c.dur > t)) || trs[0];
  function addClip(m) {
    const tr = m.type === 'audio' ? (endOf('a1') <= endOf('a2') ? 'a1' : 'a2') : 'v1';
    snap(); const c = {...base(), tr, m: m.id, start: endOf(tr), dur: m.type === 'image' ? 4 : m.dur};
    proj.clips.push(c); sel = c.id; changed(); return c;
  }
  function addText() {
    snap(); const c = {...base(), tr: freeAt(['t', 't2'], T, 3), m: null, start: T, dur: 3, text: 'Ton texte', size: 64, col: '#ffffff', font: 'gras', bg: 'box', bgCol: '#000000', sw: 0, stroke: '#000000', shadow: '', shCol: '#000000', anim: '', ad: .8, align: 'center', y: .82, fin: .4, fout: .4};
    proj.clips.push(c); sel = c.id; changed(); return c;
  }
  function addSticker(s) { const c = addText(); Object.assign(c, {text: s, sticker: true, size: 140, bg: '', y: .3, x: .75, fin: .3, fout: .3, tin: 'zoom', tout: 'zoom', mot: 'pulse'}); changed(); return c; }
  function addEffect(k) { snap(); const c = {...base(), tr: 'e', m: null, start: T, dur: 3, eff: k, amt: 60, fin: 0, fout: 0}; proj.clips.push(c); sel = c.id; changed(); return c; }
  function cut() {
    const s = clipOf(sel), list = s && isOn(s, T) ? [s] : proj.clips.filter(c => isOn(c, T));
    const before = cur(), made = list.map(c => split(c, T)).filter(Boolean);
    if (!made.length) return toast('Rien à couper sous la tête de lecture');
    push(before); proj.clips.push(...made); changed();
  }
  function del() { if (!clipOf(sel)) return; snap(); proj.clips = proj.clips.filter(c => c.id !== sel); sel = null; changed(); }
  function rippleDel() {  // supprimer et refermer le trou : les clips suivants de la piste reculent
    const c = clipOf(sel); if (!c) return; snap(); proj.clips = proj.clips.filter(x => x !== c);
    for (const x of proj.clips) if (x.tr === c.tr && x.start >= c.start + c.dur - 1e-6) x.start = Math.max(0, x.start - c.dur); sel = null; changed(); }
  function dup() { const c = clipOf(sel); if (!c) return; snap(); const d = {...JSON.parse(JSON.stringify(c)), id: uid(), start: endOf(c.tr)}; proj.clips.push(d); sel = d.id; changed(); }
  let clipboard = null;
  const copy = () => { const c = clipOf(sel); if (c) { clipboard = JSON.stringify(c); toast('Clip copié'); } };
  const paste = () => { if (!clipboard) return; snap(); const d = {...JSON.parse(clipboard), id: uid(), start: T}; proj.clips.push(d); sel = d.id; changed(); };
  function detach() {  // le son d'une vidéo devient un clip de son à part ; la vidéo devient muette
    const c = clipOf(sel); if (!c || kindOf(c) !== 'video') return toast('Choisis un clip vidéo');
    snap(); const a = {...JSON.parse(JSON.stringify(c)), id: uid(), tr: freeAt(['a1', 'a2', 'a3'], c.start, c.dur), x: .5, y: .5}; c.vol = 0; proj.clips.push(a); sel = a.id; changed(); toast('Son détaché sur ' + TRACKS.find(t => t.id === a.tr).name);
  }
  async function freeze() {  // l'image sous la tête de lecture, figée 2 secondes au milieu du clip
    const c = clipOf(sel) && isOn(clipOf(sel), T) ? clipOf(sel) : proj.clips.find(x => isOn(x, T) && kindOf(x) === 'video' && x.tr === 'v1') || proj.clips.find(x => isOn(x, T) && kindOf(x) === 'video');
    if (!c || kindOf(c) !== 'video') return toast('Place la tête de lecture sur un clip vidéo');
    const e = elOf(c), w = e.videoWidth, h = e.videoHeight; if (!w) return toast('La vidéo n\'est pas encore prête');
    const k = document.createElement('canvas'); k.width = w; k.height = h; k.getContext('2d').drawImage(e, 0, 0, w, h);
    const b = await new Promise(ok => k.toBlob(ok, 'image/png')), m = await addFile(new File([b], 'Image figée ' + fmt(T) + '.png', {type: 'image/png'})); if (!m) return;
    snap(); const at = T, rest = split(c, at); for (const x of proj.clips) if (x.tr === c.tr && x.start >= at - 1e-6 && x !== c) x.start += 2;
    if (rest) { rest.start = at + 2; proj.clips.push(rest); }
    const f = {...base(), ...JSON.parse(JSON.stringify({x: c.x, y: c.y, sc: c.sc, rot: c.rot, fit: c.fit, fx: c.fx, flip: c.flip, flipV: c.flipV, bgBlur: c.bgBlur})), id: uid(), tr: c.tr, m: m.id, start: at, dur: 2, tin: 'fondu', fin: 0};
    proj.clips.push(f); sel = f.id; changed(); toast('Image figée 2 s');
  }

  // ---------- annuler / rétablir ----------
  let hist = [], fut = [], pend = null, sel = null;
  const cur = () => JSON.stringify({clips: proj.clips, mute: proj.mute});
  const push = s => { hist.push(s); if (hist.length > 80) hist.shift(); fut = []; };
  const snap = () => push(cur());
  const restore = s => { const o = JSON.parse(s); proj.clips = o.clips; proj.mute = o.mute; if (!clipOf(sel)) sel = null; changed(); };
  const undo = () => { if (hist.length) { fut.push(cur()); restore(hist.pop()); } };
  const redo = () => { if (fut.length) { hist.push(cur()); restore(fut.pop()); } };

  // ---------- l'aperçu ----------
  let W = 1280, H = 720, U = 1;  // U : l'échelle des tailles fixes (1 en 720p)
  const off = document.createElement('canvas'), og = off.getContext('2d'), frame = document.createElement('canvas'), fg = frame.getContext('2d');
  const noise = [0, 1, 2, 3].map(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), d = x.createImageData(128, 128); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
  function img(m) { let i = imgs.get(m.id); if (!i && urls.has(m.id)) { i = new Image(); i.src = urls.get(m.id); i.onload = () => { if (!playing) draw(T); }; imgs.set(m.id, i); } return i; }
  function elOf(c) {
    let e = els.get(c.id); if (e) return e; const m = mediaOf(c.m);
    e = document.createElement(kindOf(c) === 'video' ? 'video' : 'audio'); e.preload = 'auto'; e.playsInline = true; e.src = urls.get(m.id);
    e.onseeked = e.onloadeddata = () => { if (!playing) draw(T); };
    els.set(c.id, e); if (ac) hook(c.id, e); return e;
  }
  function drop(id) { const e = els.get(id); if (!e) return; e.pause(); e.removeAttribute('src'); e.load(); els.delete(id); gains.get(id)?.disconnect(); gains.delete(id); }
  function motion(c, t, o) {  // le mouvement continu du clip, sur toute sa durée
    const p = clamp((t - c.start) / Math.max(.01, c.dur), 0, 1), u = t - c.start;
    switch (c.mot) {
      case 'kb': o.k *= 1 + .18 * p; break; case 'kbo': o.k *= 1.18 - .18 * p; break; case 'pand': o.ox += (p - .5) * W * .08; o.k *= 1.1; break; case 'pang': o.ox -= (p - .5) * W * .08; o.k *= 1.1; break;
      case 'shake': o.ox += Math.sin(u * 47) * W * .008; o.oy += Math.cos(u * 39) * H * .008; break; case 'pulse': o.k *= 1 + .06 * Math.sin(u * Math.PI * 3); break;
      case 'spin': o.rot += u * Math.PI / 2; break; case 'float': o.oy += Math.sin(u * 2.4) * H * .015; break;
    }
  }
  function look(c, t) {  // transitions d'entrée et de sortie, puis le mouvement : un seul jeu de réglages pour dessiner le clip
    const {p, a} = fade(c, t), i = trans(c.tin || 'fondu', p, W, H), o = trans(c.tout || 'fondu', a, W, H, true);
    const r = {ox: i.ox + o.ox, oy: i.oy + o.oy, k: i.k * o.k, rot: i.rot + o.rot, a: i.a * o.a * (c.op ?? 1), blur: i.blur + o.blur, clips: [i.clip, o.clip].filter(Boolean), flash: Math.max(i.flash, o.flash), jit: Math.max(i.jit, o.jit)};
    motion(c, t, r); return r;
  }
  function srcOf(c, m) { const src = m.type === 'image' ? img(m) : urls.has(m.id) ? elOf(c) : null; return src && (m.type === 'image' ? src.complete && src.naturalWidth : src.readyState >= 2) ? src : null; }
  function drawMedia(c, m, L, t) {
    const src = srcOf(c, m), bw = W * c.sc, bh = H * c.sc;
    if (!src) { if (!urls.has(m.id)) { g.fillStyle = '#3a1a2a'; g.fillRect((c.x - c.sc / 2) * W, (c.y - c.sc / 2) * H, bw, bh); g.fillStyle = '#ff8ac8'; g.font = 'bold ' + Math.round(32 * U) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('Média à réimporter : ' + m.name, c.x * W, c.y * H); } return; }
    const sw = m.type === 'image' ? src.naturalWidth : src.videoWidth, sh = m.type === 'image' ? src.naturalHeight : src.videoHeight; if (!sw || !sh) return;
    if (c.bgBlur) { const s = Math.max(W / sw, H / sh) * 1.1; g.save(); g.globalAlpha = L.a; g.filter = 'blur(' + Math.round(28 * U) + 'px) brightness(70%)'; g.drawImage(src, (W - sw * s) / 2, (H - sh * s) / 2, sw * s, sh * s); g.restore(); }  // le fond flou, sous le clip
    const s = (c.fit ? Math.max : Math.min)(bw / sw, bh / sh), dw = sw * s, dh = sh * s;
    g.translate(c.x * W + L.ox, c.y * H + L.oy); g.rotate((c.rot || 0) * Math.PI / 180 + L.rot); g.scale(L.k * (c.flip ? -1 : 1), L.k * (c.flipV ? -1 : 1));
    if (c.fit) { g.beginPath(); g.rect(-bw / 2, -bh / 2, bw, bh); g.clip(); }
    const f = filterOf(c.fx); g.filter = (f === 'none' ? '' : f + ' ') + (L.blur > 0 ? 'blur(' + L.blur.toFixed(1) + 'px)' : '') || 'none';
    const px = c.fx?.pixel || 0;
    if (px > 0) {  // l'effet pixels : l'image réduite puis agrandie sans lissage
      off.width = Math.max(1, Math.round(dw / px)); off.height = Math.max(1, Math.round(dh / px)); og.drawImage(src, 0, 0, off.width, off.height);
      g.imageSmoothingEnabled = false; g.drawImage(off, -dw / 2, -dh / 2, dw, dh); g.imageSmoothingEnabled = true;
    } else g.drawImage(src, -dw / 2, -dh / 2, dw, dh);
  }
  function drawText(c, L, t) {
    const fs = Math.max(4, c.size * Math.min(W, H) / 720), lines = String(c.text || '').split('\n'), lh = fs * 1.2;
    const ap = clamp((t - c.start) / Math.max(.05, c.ad ?? .8), 0, 1), u = t - c.start;
    let k = L.k, oy = L.oy;
    if (c.anim === 'pop') k *= ap < 1 ? Math.max(0, backOut(ap)) : 1; if (c.anim === 'rebond') oy -= (1 - bounce(ap)) * H * .35; if (c.anim === 'battement') k *= 1 + .07 * Math.abs(Math.sin(u * Math.PI * 2));
    g.translate(c.x * W + L.ox, c.y * H + oy); g.rotate((c.rot || 0) * Math.PI / 180 + L.rot); g.scale(k, k); if (L.blur > 0) g.filter = 'blur(' + L.blur.toFixed(1) + 'px)';
    g.font = (FONTS[c.font] || FONTS.gras)[1].replace('{}', Math.round(fs)); g.textBaseline = 'middle'; g.textAlign = 'left';
    const widths = lines.map(l => g.measureText(l).width), w = Math.max(1, ...widths), h = lh * lines.length, pad = fs * .4;
    const bgMode = c.bg === true ? 'box' : c.bg;  // les anciens textes : fond sombre oui ou non
    if (bgMode && !c.sticker) { g.fillStyle = c.bgCol || '#000000'; g.globalAlpha *= bgMode === 'box' ? .65 : 1; g.beginPath(); g.roundRect(-w / 2 - pad, -h / 2 - fs * .2, w + pad * 2, h + fs * .4, bgMode === 'bulle' ? fs * .5 : 0); g.fill(); g.globalAlpha /= bgMode === 'box' ? .65 : 1; }
    g.lineJoin = 'round'; g.strokeStyle = c.stroke || '#000'; g.lineWidth = c.sw ?? Math.max(2, fs / 7);
    if (c.shadow === 'glow') { g.shadowColor = c.shCol || '#ff4fb0'; g.shadowBlur = fs * .5; } else if (c.shadow === 'drop') { g.shadowColor = c.shCol || '#000'; g.shadowOffsetX = g.shadowOffsetY = fs * .07; } else if (c.shadow === 'soft') { g.shadowColor = c.shCol || '#000'; g.shadowBlur = fs * .3; g.shadowOffsetY = fs * .06; }
    const all = lines.join(''), shown = c.anim === 'machine' ? Math.floor(all.length * ap) : c.anim === 'mot' ? -1 : all.length;
    const words = c.anim === 'mot' ? all.split(/\s+/).length : 0, wShown = Math.ceil(words * ap);
    let n = 0, wi = 0;
    lines.forEach((l, li) => {
      const y = -h / 2 + lh * (li + .5), x0 = c.align === 'left' ? -w / 2 : c.align === 'right' ? w / 2 - widths[li] : -widths[li] / 2;
      if (!c.anim || c.anim === 'pop' || c.anim === 'rebond' || c.anim === 'battement') { if (c.sw !== 0 && !c.sticker) g.strokeText(l, x0, y); g.fillStyle = c.col || '#fff'; g.fillText(l, x0, y); n += l.length; return; }
      let x = x0;
      for (const ch of l) {  // lettre par lettre : machine à écrire, mot par mot, vague
        if (ch === ' ' && c.anim === 'mot') wi++;
        const vis = c.anim === 'machine' ? n < shown : c.anim === 'mot' ? wi < wShown : true, yy = y + (c.anim === 'vague' ? Math.sin(u * 5 - n * .45) * fs * .15 : 0);
        if (vis) { if (c.sw !== 0 && !c.sticker) g.strokeText(ch, x, yy); g.fillStyle = c.col || '#fff'; g.fillText(ch, x, yy); }
        x += g.measureText(ch).width; n++;
      }
      if (c.anim === 'mot') wi++;
    });
    if (c.anim === 'machine' && ap < 1 && Math.floor(u * 3) % 2 === 0) { g.fillStyle = c.col || '#fff'; g.shadowColor = 'transparent'; g.fillRect(w / 2 + fs * .1, -fs * .5, fs * .08, fs); }  // le curseur qui clignote
  }
  // les effets de la piste Effets : la caméra (secousse, zoom pulsé) avant les vidéos, le reste par-dessus
  function postFx(c, t) {
    const amt = (c.amt ?? 60) / 100, u = t - c.start, {p, a} = fade(c, t), A = amt * Math.min(p, a);
    const grab = () => { frame.width = W; frame.height = H; fg.drawImage(cv, 0, 0); };
    g.save();
    switch (c.eff) {
      case 'nb': case 'flou': grab(); g.filter = c.eff === 'nb' ? `grayscale(${Math.round(A * 100)}%) contrast(${100 + A * 15}%)` : `blur(${(A * 16 * U).toFixed(1)}px)`; g.drawImage(frame, 0, 0); break;
      case 'pixels': { grab(); const s = 2 + Math.round(A * 22); off.width = Math.max(1, Math.round(W / s)); off.height = Math.max(1, Math.round(H / s)); og.drawImage(frame, 0, 0, off.width, off.height); g.imageSmoothingEnabled = false; g.drawImage(off, 0, 0, W, H); break; }
      case 'vignette': { const r = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.hypot(W, H) / 2); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(0,0,0,${(.25 + A * .7).toFixed(2)})`); g.fillStyle = r; g.fillRect(0, 0, W, H); break; }
      case 'grain': g.globalAlpha = A * .35; g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(noise[Math.floor(t * 24) % 4], 'repeat'); g.fillRect(0, 0, W, H); break;
      case 'vhs': case 'glitch': {
        grab(); const q = Math.floor(t * 12), on = c.eff === 'vhs' || hash(q) > .45, sh = Math.round((c.eff === 'vhs' ? 5 : 14) * A * U * (on ? 1 : .2));
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = .22 * A; g.filter = 'sepia(1) saturate(6) hue-rotate(-50deg)'; g.drawImage(frame, sh, 0); g.filter = 'sepia(1) saturate(6) hue-rotate(150deg)'; g.drawImage(frame, -sh, 0);
        g.filter = 'none'; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
        const n = c.eff === 'vhs' ? 1 : on ? 3 + Math.floor(hash(q + .5) * 6) : 0;
        for (let i = 0; i < n; i++) { const y = c.eff === 'vhs' ? ((u * .25) % 1) * H : hash(q * 7 + i) * H, hh = (c.eff === 'vhs' ? 18 : 4 + hash(q * 3 + i) * 40) * U, dx = (hash(q * 5 + i) - .5) * 60 * A * U; g.drawImage(frame, 0, y, W, hh, dx, y, W, hh); }
        if (c.eff === 'vhs') { g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += Math.max(2, Math.round(4 * U))) g.fillRect(0, y, W, Math.max(1, Math.round(U))); g.fillStyle = '#ffffff'; g.font = Math.round(28 * U) + 'px monospace'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('▶ PLAY  ' + fmt(u), 30 * U, 26 * U); }
        break; }
      case 'flash': g.fillStyle = '#ffffff'; g.globalAlpha = A * Math.max(0, 1 - u / .45); g.fillRect(0, 0, W, H); break;
      case 'cinema': { const b = H * (.06 + .08 * A); g.fillStyle = '#000'; g.fillRect(0, 0, W, b); g.fillRect(0, H - b, W, b); break; }
      case 'neige': case 'confettis': case 'pluie': case 'etoiles': case 'coeurs': {
        const N = Math.round(20 + A * 100), cols = ['#ff4fb0', '#4fc3ff', '#ffd34f', '#7ee07a', '#ffffff', '#b48cff'];
        for (let i = 0; i < N; i++) {
          const sp = c.eff === 'pluie' ? 1.6 : c.eff === 'coeurs' ? -.12 : c.eff === 'neige' ? .12 : c.eff === 'etoiles' ? 0 : .3, x = ((hash(i) * W + (c.eff === 'pluie' ? -u * W * .3 : Math.sin(u + i) * 20 * U)) % W + W) % W, y = ((hash(i + .3) * H + sp * u * H) % H + H) % H, s = (2 + hash(i + .7) * 5) * U;
          g.globalAlpha = Math.min(p, a);
          if (c.eff === 'neige') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill(); }
          else if (c.eff === 'pluie') { g.strokeStyle = 'rgba(200,220,255,.6)'; g.lineWidth = Math.max(1, U * 1.5); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6 * U, y + 24 * U); g.stroke(); }
          else if (c.eff === 'confettis') { g.save(); g.translate(x, y); g.rotate(u * 4 + i); g.fillStyle = cols[i % cols.length]; g.fillRect(-s, -s / 2, s * 2, s); g.restore(); }
          else if (c.eff === 'etoiles') { const tw = .5 + .5 * Math.sin(u * 4 + i * 1.7); g.fillStyle = '#fff8d8'; g.globalAlpha *= tw; g.fillRect(x - s * 1.5, y - U / 2, s * 3, U); g.fillRect(x - U / 2, y - s * 1.5, U, s * 3); }
          else { g.fillStyle = '#ff4fb0'; g.font = Math.round(s * 6) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('♥', x, y); }
        }
        break; }
    }
    g.restore();
  }
  function camera(t) {  // secousse et zoom pulsé : ils bougent toute l'image des vidéos
    const o = {ox: 0, oy: 0, k: 1}; if (proj.mute.e) return o;
    for (const c of order) if (c.tr === 'e' && isOn(c, t)) { const A = (c.amt ?? 60) / 100, u = t - c.start;
      if (c.eff === 'secousse') { o.ox += Math.sin(u * 53) * W * .012 * A; o.oy += Math.cos(u * 41) * H * .012 * A; }
      if (c.eff === 'zoompulse') o.k *= 1 + .08 * A * Math.abs(Math.sin(u * Math.PI * 2)); }
    return o;
  }
  function drawClip(c, t, m) {
    const L = look(c, t); if (L.a <= 0) return;
    g.save(); g.globalAlpha = L.a;
    for (const f of L.clips) { g.beginPath(); f(g); g.clip(); }
    if (L.jit > 0) { L.ox += (hash(Math.floor(t * 30)) - .5) * W * .06 * L.jit; }
    if (kindOf(c) === 't') drawText(c, L, t); else drawMedia(c, m, L, t);
    g.restore();
    if (L.flash > 0) { g.save(); g.globalAlpha = L.flash; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.restore(); }
  }
  function draw(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.fillStyle = proj.bg || '#000'; g.fillRect(0, 0, W, H);
    const cam = camera(t);
    g.save(); g.translate(W / 2 + cam.ox, H / 2 + cam.oy); g.scale(cam.k, cam.k); g.translate(-W / 2, -H / 2);
    for (const tr of ['v1', 'v2']) if (!proj.mute[tr]) for (const c of order) if (c.tr === tr && isOn(c, t)) { const m = mediaOf(c.m); if (m) drawClip(c, t, m); }
    g.restore();
    if (!proj.mute.e) for (const c of order) if (c.tr === 'e' && isOn(c, t)) postFx(c, t);
    for (const tr of ['t', 't2']) if (!proj.mute[tr]) for (const c of order) if (c.tr === tr && isOn(c, t)) drawClip(c, t, null);
    time.replaceChildren(fmt(t), el('small', '', ' / ' + fmt(total())));
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
      const want = localT(c, t); e.playbackRate = clamp(c.speed, .0625, 16);
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
    if (rec) expBtn.textContent = 'ANNULER · ' + Math.floor(T / Math.max(.1, total()) * 100) + ' %';
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!proj.clips.length) return; audio(); if (T >= total() - .02) T = 0; playing = true; t0 = T; p0 = performance.now(); playB.textContent = '❚❚'; loop(); }
  function stop() { playing = false; cancelAnimationFrame(raf); for (const e of els.values()) e.pause(); playB.textContent = '▶'; sync(T, false); draw(T); movePh(); }
  const toggle = () => { if (rec) return cancelExport(); playing ? stop() : start(); };
  function seek(t) { T = clamp(t, 0, total() + 30); if (playing) { t0 = T; p0 = performance.now(); } sync(T, playing); draw(T); movePh(); }

  // ---------- l'export ----------
  const MP4 = typeof MediaRecorder !== 'undefined' && ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,opus', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
  const expBtn = btn('EXPORTER', () => rec ? cancelExport() : exportVideo(), 'main');
  function cancelExport() { if (!rec) return; rec.cancel = true; stop(); rec.r.stop(); }
  async function exportVideo(download = true) {  // download false : le test vérifie la vidéo sans l'enregistrer dans Téléchargements
    if (!proj.clips.length) return toast('Le montage est vide.');
    if (typeof MediaRecorder === 'undefined') return toast('Export impossible : pas d\'enregistreur vidéo ici.');
    stop(); audio(); resize(proj.qual); T = 0; sync(0, false); await new Promise(r => setTimeout(r, 400)); draw(0);  // le temps que les vidéos se placent au début
    const mp4 = proj.vfmt === 'mp4' && MP4, mime = mp4 || ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    const vt = cv.captureStream(proj.fps || 30).getVideoTracks()[0], stream = new MediaStream([vt, ...recDest.stream.getAudioTracks()]);
    const r = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: Math.round(W * H * (proj.fps || 30) * .12), audioBitsPerSecond: 192e3}), parts = [];
    r.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
    const done = new Promise(ok => { r.onstop = ok; }); rec = {r, cancel: false};
    r.start(500); start(); await done; vt.stop();
    const cancelled = rec.cancel; rec = null; expBtn.textContent = 'EXPORTER'; resize(); draw(T);
    if (cancelled) return toast('Export annulé');
    const type = mp4 ? 'video/mp4' : 'video/webm', blob = new Blob(parts, {type}); view.__cfLast = blob; if (!download) return blob;
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'montage-' + new Date().toISOString().slice(0, 10) + (mp4 ? '.mp4' : '.webm'); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast('Vidéo exportée (' + (blob.size / 1e6).toFixed(1) + ' Mo)');
  }
  function exportPng() { resize(proj.qual); draw(T); cv.toBlob(b => { const a = el('a'); a.href = URL.createObjectURL(b); a.download = 'image-' + fmt(T).replace(/[:.]/g, '-') + '.png'; document.body.append(a); a.click(); a.remove(); resize(); draw(T); }); }

  // ---------- la timeline ----------
  let zm = 60, magnet = true;
  const zoom = el('input', 'cfRange'); zoom.type = 'range'; zoom.min = 10; zoom.max = 300; zoom.value = zm; zoom.oninput = () => { zm = +zoom.value; drawTl(); };
  const tool = (txt, fn, tip) => { const x = btn(txt, fn); x.title = tip; return x; };
  const magB = tool('🧲', () => { magnet = !magnet; magB.classList.toggle('main', magnet); }, 'Aimant : les clips se collent aux bords et à la tête de lecture'); magB.classList.add('main');
  tlBar.append(tool('✂', cut, 'Couper sous la tête de lecture (S)'), tool('⧉', dup, 'Dupliquer (Ctrl+D)'), tool('🗑', del, 'Supprimer (Suppr)'), tool('⇤', rippleDel, 'Supprimer et refermer le trou (Maj+Suppr)'),
    tool('❄', freeze, 'Figer l\'image sous la tête de lecture (2 s)'), tool('🔊', detach, 'Détacher le son de la vidéo'), tool('↶', undo, 'Annuler (Ctrl+Z)'), tool('↷', redo, 'Rétablir (Ctrl+Y)'), el('span', 'sp'), magB, el('span', '', 'Zoom'), zoom);
  const lanes = {}, heading = {};
  heads.append(el('div', 'rh'));
  for (const t of TRACKS) {
    const h = el('div'), m = el('span', 'm'), n = el('span', '', t.name); h.style.height = t.h + 'px';
    m.title = 'Couper / remettre la piste'; m.onclick = () => { snap(); proj.mute[t.id] = !proj.mute[t.id]; changed(); };
    h.append(el('span', 'ic', t.ic), n, m); heading[t.id] = [m, n]; heads.append(h);
    const l = el('div', 'cfLane k-' + t.kind); l.dataset.tr = t.id; l.style.height = t.h + 'px'; lanes[t.id] = l;
  }
  lanesEl.append(ruler, ...Object.values(lanes), ph);
  const kindOk = (tr, c) => { const k = TRACKS.find(t => t.id === tr).kind, ck = kindOf(c); return k === 't' ? ck === 't' : k === 'e' ? ck === 'e' : k === 'a' ? ck === 'audio' : ck === 'video' || ck === 'image'; };
  function movePh(follow) {
    ph.style.left = Math.round(T * zm) + 'px'; time.replaceChildren(fmt(T), el('small', '', ' / ' + fmt(total())));
    if (follow) { const x = T * zm; if (x > scroll.scrollLeft + scroll.clientWidth - 40 || x < scroll.scrollLeft) scroll.scrollLeft = x - 40; }
  }
  function drawTl() {
    const w = Math.max(scroll.clientWidth || 600, (total() + 15) * zm); lanesEl.style.width = w + 'px';
    const step = zm >= 80 ? 1 : zm >= 35 ? 2 : zm >= 15 ? 5 : 10; ruler.style.backgroundSize = (step * zm / 4) + 'px 8px';
    ruler.replaceChildren(...Array.from({length: Math.ceil(w / zm / step) + 1}, (_, i) => { const t = el('i', '', fmt(i * step).replace(/\.0$/, '')); t.style.left = i * step * zm + 'px'; return t; }));
    for (const t of TRACKS) { const [m, n] = heading[t.id]; m.textContent = proj.mute[t.id] ? '◌' : '●'; n.className = proj.mute[t.id] ? 'off' : ''; }
    for (const [tr, l] of Object.entries(lanes)) l.replaceChildren(...order.filter(c => c.tr === tr).map(c => {
      const m = mediaOf(c.m), k = kindOf(c), d = el('div', 'cfClip k-' + k + (c.id === sel ? ' on' : '') + (m && !urls.has(m.id) ? ' miss' : ''));
      d.dataset.id = c.id; d.style.left = c.start * zm + 'px'; d.style.width = Math.max(6, c.dur * zm) + 'px';
      if (k === 'audio') { if (m.wave) d.style.backgroundImage = `url(${m.wave})`; }
      else if (k === 'video' && m.strip) { d.style.backgroundImage = `url(${m.strip})`; d.style.backgroundSize = (m.dur / c.speed * zm) + 'px 100%'; d.style.backgroundRepeat = 'no-repeat'; d.style.backgroundPosition = -(c.inn / c.speed * zm) + 'px 0'; }
      else if (m?.thumb) d.style.backgroundImage = `url(${m.thumb})`;
      const fi = el('div', 'fi'), fo = el('div', 'fo'); fi.style.width = c.fin * zm + 'px'; fo.style.width = c.fout * zm + 'px';
      const label = k === 't' ? String(c.text).split('\n')[0] : k === 'e' ? EFFECTS[c.eff]?.[1] + ' ' + EFFECTS[c.eff]?.[0] : (c.speed !== 1 ? '×' + c.speed + ' ' : '') + (c.vol === 0 && k === 'video' ? '🔇 ' : '') + m.name;
      d.append(fi, fo, el('span', '', label), el('i', 'h l'), el('i', 'h r'));
      d.title = label + ' · ' + fmt(c.start) + ' → ' + fmt(c.start + c.dur); return d;
    }));
    movePh();
  }
  function snapT(t, self, len) {  // aimant : le début, la tête de lecture et les bords des autres clips, à 8 pixels près
    if (!magnet) return t;
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
      if (sel) { sel = null; drawTl(); drawInsp(); drawLib(); }
      seek(Math.max(0, tAt(e.clientX)));
      lanesEl.onpointermove = ev => seek(Math.max(0, tAt(ev.clientX))); lanesEl.onpointerup = () => { lanesEl.onpointermove = lanesEl.onpointerup = null; }; return;
    }
    const c = clipOf(cd.dataset.id), r = cd.getBoundingClientRect(), x = e.clientX - r.left, o = {...c}, before = cur(), x0 = e.clientX;
    const mode = x < 9 ? 'l' : x > r.width - 9 ? 'r' : 'm', media = kindOf(c) === 'video' || kindOf(c) === 'audio';
    let moved = false; const was = sel; sel = c.id; drawInsp(); if (was !== sel && (libTab === 'trans' || libTab === 'filt')) drawLib();
    lanesEl.onpointermove = ev => {
      const d = (ev.clientX - x0) / zm; if (!moved && Math.abs(ev.clientX - x0) < 3 && laneAt(ev.clientY) === o.tr) return; moved = true;
      if (mode === 'm') { c.start = Math.max(0, snapT(o.start + d, c, o.dur)); const tr = laneAt(ev.clientY); if (tr && kindOk(tr, c)) c.tr = tr; }
      else if (mode === 'l') { const ns = clamp(snapT(o.start + d, c, 0), Math.max(0, media ? o.start - o.inn / o.speed : 0), o.start + o.dur - .1); c.start = ns; c.dur = o.dur - (ns - o.start); c.inn = o.inn + (ns - o.start) * o.speed; }
      else c.dur = clamp(snapT(o.start + o.dur + d, c, 0) - o.start, .1, maxDur(c));
      refresh();
    };
    lanesEl.onpointerup = () => { lanesEl.onpointermove = lanesEl.onpointerup = null; if (moved) { push(before); changed(); } else drawTl(); };
  });

  // ---------- le panneau du clip (à droite) ----------
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
  function color(label, get, set) { const row = el('div', 'cfP'), ci = el('input'); ci.type = 'color'; ci.value = get() || '#000000'; ci.dataset.k = label; ci.oninput = () => { touch(); set(ci.value); refresh(); }; ci.onchange = commit; row.append(el('span', '', label), ci, el('b')); return row; }
  const pct = v => Math.round(v * 100) + ' %', sec = v => (+v).toFixed(1) + ' s', deg = v => Math.round(v) + '°';
  let inspTab = 'edit';
  function drawInsp() {
    const c = clipOf(sel); insp.replaceChildren();
    if (!c) {
      const mp4 = MP4 ? {mp4: 'MP4'} : {};
      insp.append(el('span', 'label', 'Projet'), choice('Format', FMT_NAMES, () => proj.fmt, v => { proj.fmt = v; resize(); }), color('Fond', () => proj.bg, v => { proj.bg = v; }),
        el('span', 'cfSub', 'Export'), choice('Qualité', Object.fromEntries(Object.entries(QUAL).map(([k, v]) => [k, v[0]])), () => proj.qual, v => { proj.qual = v; }),
        choice('Images/s', {24: '24', 30: '30', 60: '60'}, () => proj.fps, v => { proj.fps = +v; }), choice('Fichier', {webm: 'WebM', ...mp4}, () => proj.vfmt, v => { proj.vfmt = v; }));
      const r = el('div', 'cfRow'); r.append(btn('Image PNG', exportPng), btn('Vider la timeline', async () => { if (proj.clips.length && await ctx.host.confirm('Retirer tous les clips de la timeline ? (Ctrl+Z pour revenir)')) { snap(); proj.clips = []; sel = null; changed(); } }));
      insp.append(r, el('p', 'cfHelp', 'Clique sur un clip pour le régler. L\'incrustation passe par-dessus la vidéo (réduis sa taille), les effets s\'appliquent à toute l\'image sous eux, les textes et autocollants passent par-dessus tout. L\'export filme le montage en temps réel : garde ClipForge ouvert jusqu\'au bout.'));
      return;
    }
    const m = mediaOf(c.m), k = kindOf(c), n = el('div', 'cfInfo'); n.translate = false;
    n.textContent = fmt(c.start) + ' → ' + fmt(c.start + c.dur) + ' · ' + fmt(c.dur);
    const T_ = {video: [['edit', '▣', 'Image'], ['anim', '↻', 'Animation'], ['col', '◐', 'Couleur'], ['snd', '♪', 'Son']], image: [['edit', '▣', 'Image'], ['anim', '↻', 'Animation'], ['col', '◐', 'Couleur']],
      t: [['edit', 'T', 'Texte'], ['anim', '↻', 'Animation'], ['pos', '✥', 'Position']], audio: [['snd', '♪', 'Son']], e: [['edit', '✦', 'Effet']]}[k] || [['edit', '▣', 'Clip']];
    if (!T_.some(x => x[0] === inspTab)) inspTab = T_[0][0];
    insp.append(el('span', 'label', k === 't' ? (c.sticker ? 'Autocollant' : 'Texte') : k === 'e' ? 'Effet' : m.name), n, tabs(T_, inspTab, v => { inspTab = v; drawInsp(); }));
    const place = () => [slider('Position X', () => c.x, v => { c.x = v; }, -.2, 1.2, .01, pct), slider('Position Y', () => c.y, v => { c.y = v; }, -.2, 1.2, .01, pct),
      slider('Rotation', () => c.rot || 0, v => { c.rot = v; }, -180, 180, 1, deg), slider('Opacité', () => c.op ?? 1, v => { c.op = v; }, 0, 1, .01, pct)];
    if (inspTab === 'edit' && (k === 'video' || k === 'image')) {
      insp.append(slider('Taille', () => c.sc, v => { c.sc = v; }, .05, 3, .01, pct), ...place(), check('Remplir le cadre', () => c.fit, v => { c.fit = v; }), check('Fond flou', () => c.bgBlur, v => { c.bgBlur = v; }),
        check('Miroir ↔', () => c.flip, v => { c.flip = v; }), check('Miroir ↕', () => c.flipV, v => { c.flipV = v; }),
        btn('Recadrer au centre', () => { snap(); Object.assign(c, {x: .5, y: .5, sc: 1, rot: 0}); changed(); }));
    }
    if (inspTab === 'edit' && k === 't') {
      const ta = el('textarea'); ta.value = c.text; ta.dataset.k = 'texte'; ta.oninput = () => { touch(); c.text = ta.value; refresh(); }; ta.onchange = commit; insp.append(ta);
      if (!c.sticker) {
        const styles = el('div', 'cfRow'); for (const nm of Object.keys(TSTYLES)) styles.append(btn(nm, () => { snap(); const keepT = c.text, {x, y} = c; Object.assign(c, JSON.parse(JSON.stringify(TSTYLES[nm])), {text: keepT, x}); if (TSTYLES[nm].y === undefined) c.y = y; changed(); }));
        insp.append(choice('Police', Object.fromEntries(Object.entries(FONTS).map(([k2, f]) => [k2, f[0]])), () => c.font, v => { c.font = v; }), color('Couleur', () => c.col, v => { c.col = v; }),
          slider('Taille', () => c.size, v => { c.size = v; }, 12, 240, 2), choice('Alignement', {left: 'Gauche', center: 'Centre', right: 'Droite'}, () => c.align || 'center', v => { c.align = v; }),
          el('span', 'cfSub', 'Contour et ombre'), color('Contour', () => c.stroke, v => { c.stroke = v; }), slider('Épaisseur', () => c.sw ?? 8, v => { c.sw = v; }, 0, 30, 1),
          choice('Ombre', {'': 'Aucune', drop: 'Portée', soft: 'Douce', glow: 'Lueur'}, () => c.shadow || '', v => { c.shadow = v; }), color('Couleur ombre', () => c.shCol, v => { c.shCol = v; }),
          el('span', 'cfSub', 'Fond'), choice('Fond', {'': 'Aucun', box: 'Bande', bulle: 'Bulle'}, () => c.bg === true ? 'box' : c.bg || '', v => { c.bg = v; }), color('Couleur fond', () => c.bgCol, v => { c.bgCol = v; }),
          el('span', 'cfSub', 'Styles'), styles);
      } else insp.append(slider('Taille', () => c.size, v => { c.size = v; }, 30, 400, 2));
    }
    if (inspTab === 'pos' && k === 't') insp.append(...place());
    if (inspTab === 'anim') {
      if (k === 't' && !c.sticker) insp.append(choice('Animation', TANIMS, () => c.anim || '', v => { c.anim = v; }), slider('Durée anim.', () => c.ad ?? .8, v => { c.ad = v; }, .1, 4, .1, sec));
      insp.append(el('span', 'cfSub', 'Entrée'), choice('Transition', TRANS, () => c.tin || 'fondu', v => { c.tin = v; }), slider('Durée', () => c.fin, v => { c.fin = Math.min(v, c.dur); }, 0, 3, .1, sec),
        el('span', 'cfSub', 'Sortie'), choice('Transition ', TRANS, () => c.tout || 'fondu', v => { c.tout = v; }), slider('Durée ', () => c.fout, v => { c.fout = Math.min(v, c.dur); }, 0, 3, .1, sec),
        el('span', 'cfSub', 'Pendant le clip'), choice('Mouvement', MOTIONS, () => c.mot || '', v => { c.mot = v; }));
    }
    if (inspTab === 'col') {
      const looks = el('div', 'cfRow'); for (const [nm, fx] of Object.entries(LOOKS)) looks.append(btn(nm, () => { snap(); c.fx = {...fx}; changed(); }));
      insp.append(looks, ...FX.map(([key, nm, mn, mx]) => slider(nm, () => c.fx?.[key] ?? FX0[key], v => { c.fx = {...c.fx, [key]: v}; }, mn, mx, 1)), btn('Remettre à zéro', () => { snap(); c.fx = {}; changed(); }));
    }
    if (inspTab === 'snd') {
      insp.append(choice('Vitesse', Object.fromEntries(SPEEDS.map(s => [s, '×' + s])), () => c.speed, v => { const s = +v; c.dur = c.dur * c.speed / s; c.speed = s; c.dur = Math.min(c.dur, maxDur(c)); }),
        slider('Volume', () => c.vol, v => { c.vol = v; }, 0, 2, .05, pct));
      if (k === 'audio') insp.append(slider('Fondu d\'entrée', () => c.fin, v => { c.fin = Math.min(v, c.dur); }, 0, 5, .1, sec), slider('Fondu de sortie', () => c.fout, v => { c.fout = Math.min(v, c.dur); }, 0, 5, .1, sec));
      if (k === 'video') insp.append(btn('🔊 Détacher le son', detach), btn('❄ Figer l\'image ici', freeze));
    }
    if (inspTab === 'edit' && k === 'e') insp.append(choice('Effet', Object.fromEntries(Object.entries(EFFECTS).map(([k2, v]) => [k2, v[0]])), () => c.eff, v => { c.eff = v; }), slider('Intensité', () => c.amt ?? 60, v => { c.amt = v; }, 0, 100, 1, v => v + ' %'),
      slider('Apparition', () => c.fin, v => { c.fin = Math.min(v, c.dur); }, 0, 3, .1, sec), slider('Disparition', () => c.fout, v => { c.fout = Math.min(v, c.dur); }, 0, 3, .1, sec));
    const r = el('div', 'cfRow'); r.append(btn('Dupliquer', dup), btn('Supprimer', del)); insp.append(r);
  }

  // ---------- tout remettre à jour ----------
  function resize(q = '720') {  // l'aperçu en 720p ; l'export à la qualité choisie (le petit côté de l'image)
    const [bw, bh] = FORMATS[proj.fmt] || FORMATS['16:9'], k = QUAL[q][1] / Math.min(bw, bh);
    W = Math.round(bw * k / 2) * 2; H = Math.round(bh * k / 2) * 2; U = Math.min(W, H) / 720; cv.width = W; cv.height = H;
  }
  function refresh() { order = [...proj.clips].sort((a, b) => a.start - b.start); drawTl(); if (!playing) { sync(T, false); draw(T); } }
  function changed() { for (const id of [...els.keys()]) if (!clipOf(id)) drop(id); save(); refresh(); drawInsp(); }
  const playB = btn('▶', toggle, 'main'); playB.title = 'Lecture / pause (Espace)';
  bar.append(tool('⏮', () => seek(0), 'Au début (Origine)'), tool('◀', () => seek(T - 1 / 30), 'Image d\'avant (←)'), playB, tool('▶', () => seek(T + 1 / 30), 'Image suivante (→)'), time, tool('⛶', () => cv.requestFullscreen?.(), 'Aperçu en plein écran'));
  head.append(el('span', 'label', 'ClipForge · monteur vidéo'), btn('↶', undo), btn('↷', redo), expBtn);
  document.addEventListener('keydown', e => {
    if (!view.isConnected || !view.offsetParent || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.ctrlKey && k === 'z') { e.preventDefault(); undo(); } else if (e.ctrlKey && k === 'y') { e.preventDefault(); redo(); }
    else if (e.ctrlKey && k === 'c') copy(); else if (e.ctrlKey && k === 'v') paste(); else if (e.ctrlKey && k === 'd') { e.preventDefault(); dup(); }
    else if (e.ctrlKey || e.altKey || e.metaKey) return;
    else if (k === ' ') { e.preventDefault(); toggle(); } else if (k === 's') cut(); else if (k === 'delete' || k === 'backspace') (e.shiftKey ? rippleDel : del)();
    else if (k === 'home') seek(0); else if (k === 'arrowleft') seek(T - 1 / 30); else if (k === 'arrowright') seek(T + 1 / 30);
  });
  new ResizeObserver(() => drawTl()).observe(scroll);
  resize(); drawLib(); refresh(); drawInsp();
  // pour le test « local » de NeoDex
  view.__cf = {proj, addFile, addText, addClip, addSticker, addEffect, cut, seek, undo, exportVideo, changed, rippleDel, detach, freeze, draw, get T() { return T; }, get sel() { return sel; }, set sel(v) { sel = v; drawInsp(); drawTl(); }};
}
