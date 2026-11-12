// lancé par le test « local » de NeoDex : une image, un son et une petite vidéo fabriqués sur place sont importés,
// posés sur la timeline avec un texte, coupés, annulés, puis le montage est exporté en WebM
module.exports = async ({ pj, sleep }) => {
  const run = async code => { const r = await pj(code); if (r && r.err) throw new Error(r.err); return r; };
  await sleep(500);
  await run(`(async () => { try {
    const cf = document.querySelector('.cfApp').parentNode.__cf;
    // une image en pixel art : ciel, soleil, collines
    const c = document.createElement('canvas'); c.width = 160; c.height = 90; const g = c.getContext('2d');
    g.fillStyle = '#2a1a5a'; g.fillRect(0, 0, 160, 90); g.fillStyle = '#ff4fb0'; g.fillRect(110, 14, 22, 22); g.fillStyle = '#ffd84a'; g.fillRect(114, 18, 14, 14);
    g.fillStyle = '#3ad0a0'; for (let x = 0; x < 160; x += 4) { const h = 24 + Math.round(10 * Math.sin(x / 18)); g.fillRect(x, 90 - h, 4, h); }
    const png = await new Promise(ok => c.toBlob(ok, 'image/png'));
    // un son : 2 secondes de notes
    const sr = 22050, n = sr * 2, d = new DataView(new ArrayBuffer(44 + n * 2)), w = (o, s) => [...s].forEach((ch, i) => d.setUint8(o + i, ch.charCodeAt(0)));
    w(0, 'RIFF'); d.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, sr, true); d.setUint32(28, sr * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); w(36, 'data'); d.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const f = [262, 330, 392, 523][Math.floor(i / (sr / 2)) % 4], env = 1 - (i % (sr / 2)) / (sr / 2); d.setInt16(44 + i * 2, Math.sin(2 * Math.PI * f * i / sr) * 12000 * env, true); }
    // une vidéo d'une seconde : un carré qui traverse l'écran
    const vc = document.createElement('canvas'); vc.width = 320; vc.height = 180; const vg = vc.getContext('2d'), rec = new MediaRecorder(vc.captureStream(30)), parts = [];
    rec.ondataavailable = e => parts.push(e.data); const done = new Promise(ok => rec.onstop = ok); rec.start();
    const t0 = performance.now(); await new Promise(ok => { const f = () => { const p = (performance.now() - t0) / 1000; vg.fillStyle = '#101830'; vg.fillRect(0, 0, 320, 180); vg.fillStyle = '#b48cff'; vg.fillRect(Math.round(p * 280), 70, 40, 40); if (p < 1.2) requestAnimationFrame(f); else ok(); }; f(); });
    rec.stop(); await done;
    const im = await cf.addFile(new File([png], 'paysage.png', {type: 'image/png'}));
    const so = await cf.addFile(new File([d.buffer], 'notes.wav', {type: 'audio/wav'}));
    const vi = await cf.addFile(new File(parts, 'carre.webm', {type: 'video/webm'}));
    if (!im || !so || !vi) return {err: 'import : ' + [!!im, !!so, !!vi]};
    if (!(vi.dur > .8 && vi.dur < 2)) return {err: 'durée de la vidéo : ' + vi.dur};
    if (!so.wave || !vi.thumb || !im.thumb) return {err: 'vignettes ou forme d\\'onde manquantes'};
    window.__cfIds = [im.id, so.id, vi.id];
    return {ok: 1};
  } catch (e) { return {err: e.message}; } })()`);
  await run(`(async () => {
    const cf = document.querySelector('.cfApp').parentNode.__cf, [im, so, vi] = window.__cfIds, P = cf.proj;
    const a = cf.addClip(P.media.find(m => m.id === im)); a.dur = 1.5; a.fin = .5; a.tin = 'zoom'; a.fx = {sat: 170, con: 115};
    const v = cf.addClip(P.media.find(m => m.id === vi)); v.fout = .3;
    if (v.start !== 1.5 || v.tr !== 'v1') return {err: 'la vidéo n\\'est pas posée au bout de la piste : ' + v.start};
    const s = cf.addClip(P.media.find(m => m.id === so)); if (s.tr !== 'a1') return {err: 'piste du son ' + s.tr};
    cf.seek(.3); const t = cf.addText(); t.text = 'ClipForge'; t.dur = 2.4; cf.changed();
    const nb = P.clips.length; cf.seek(1); cf.sel = a.id; cf.cut();
    if (P.clips.length !== nb + 1) return {err: 'la coupe n\\'a pas fait deux clips'};
    const b = P.clips.find(c => c.m === im && c.id !== a.id); if (Math.abs(a.dur - 1) > 1e-9 || Math.abs(b.start - 1) > 1e-9 || Math.abs(b.dur - .5) > 1e-9) return {err: 'coupe : ' + a.dur + ' ' + b.start + ' ' + b.dur};
    cf.undo(); if (P.clips.length !== nb) return {err: 'annuler la coupe'};
    // à la souris : glisser le texte de 0,5 s (zoom 60 px/s), puis rogner le bord droit du son d'une seconde
    const drag = (id, dx, side) => { const d = document.querySelector('[data-id="' + id + '"]'), r = d.getBoundingClientRect(), x = side === 'r' ? r.right - 3 : r.left + r.width / 2, y = r.top + r.height / 2, L = d.closest('.cfLanes'), ev = (t, X) => new PointerEvent(t, {bubbles: true, clientX: X, clientY: y, pointerId: 1, button: 0});
      d.dispatchEvent(ev('pointerdown', x)); L.dispatchEvent(ev('pointermove', x + dx / 2)); L.dispatchEvent(ev('pointermove', x + dx)); L.dispatchEvent(ev('pointerup', x + dx)); };
    const C = id => P.clips.find(c => c.id === id);
    drag(t.id, 30, 'm'); if (Math.abs(C(t.id).start - .8) > .02) return {err: 'glisser le texte : ' + C(t.id).start};
    drag(s.id, -60, 'r'); if (Math.abs(C(s.id).dur - 1) > .02) return {err: 'rogner le son : ' + C(s.id).dur};
    cf.undo(); cf.undo(); if (Math.abs(C(t.id).start - .3) > .02 || Math.abs(C(s.id).dur - 2) > .02) return {err: 'annuler le glisser'};
    return {ok: 1};
  })()`);
  const exp = await run(`(async () => {
    const view = document.querySelector('.cfApp').parentNode, cf = view.__cf, t = performance.now();
    await cf.exportVideo(false); const b = view.__cfLast; if (!b) return {err: 'pas de vidéo exportée'};
    const v = document.createElement('video'); v.src = URL.createObjectURL(b); await new Promise((ok, ko) => { v.onloadedmetadata = ok; v.onerror = () => ko(new Error('vidéo exportée illisible')); });
    if (!isFinite(v.duration)) { v.currentTime = 1e9; await new Promise(ok => v.onseeked = ok); }
    const z = view.querySelector('.cfTlBar .cfRange'); z.value = 220; z.oninput(); cf.seek(.9); cf.sel = null; cf.sel = cf.proj.clips.find(c => c.tr === 't').id; view.querySelector('.cfTl').scrollIntoView({block: 'end'});
    return {size: b.size, dur: v.duration, w: v.videoWidth, h: v.videoHeight, ms: Math.round(performance.now() - t)};
  })()`);
  if (!(exp.size > 5000 && exp.w === 1280 && exp.h === 720 && exp.dur > 2 && exp.dur < 4.5)) throw new Error('export : ' + JSON.stringify(exp));
  await sleep(300);
  return `import (image, son, vidéo), timeline, coupe, annuler et export WebM ok (${(exp.size / 1e3).toFixed(0)} ko, ${exp.dur.toFixed(1)} s, ${exp.w}×${exp.h})`;
};
