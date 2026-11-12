// lancé par le test « local » de NeoDex : la recette d'exemple, une étape Remplacer en regex, une erreur JSON signalée, un modèle rempli
module.exports = async ({ pj, sleep }) => {
  const click = q => pj(`document.querySelector(${JSON.stringify(q)}).click(), 0`);
  await sleep(400);
  const out = () => pj(`document.getElementById('cf_out').value`);
  if (await out() !== 'bananes\ncafé moulu\nliste des courses\npommes') throw new Error('recette d\'exemple : ' + JSON.stringify(await out()));
  await click('[data-op=replace]'); await sleep(50);
  await pj(`(() => { const f = [...document.querySelectorAll('.cfStep')].pop().querySelectorAll('input'); f[0].value = '/^([a-z])/'; f[0].oninput(); f[1].value = '- $1'; f[1].oninput(); })(), 0`);
  if (!(await out()).startsWith('- bananes')) throw new Error('remplacer : ' + JSON.stringify(await out()));
  await click('[data-op=jsonp]'); await sleep(50);
  if (await out() !== '' || !await pj(`!!document.querySelector('.cfStep.err')`)) throw new Error('erreur JSON non signalée');
  await pj(`[...document.querySelectorAll('.cfStep')].pop().querySelector('.x:last-of-type').click(), 0`); await sleep(50);
  if (!(await out()).startsWith('- bananes')) throw new Error('retirer une étape');
  await click('[data-tab=tpl]'); await sleep(100);
  await pj(`(() => { const f = document.querySelector('[data-v=nom]'); f.value = 'Léa'; f.oninput(); })(), 0`);
  if (!/^Bonjour Léa,/.test(await pj(`document.getElementById('cf_tout').textContent`))) throw new Error('modèle');
  await click('[data-tab=forge]'); await sleep(200);
  return 'recette, regex, erreur JSON et modèle ok';
};
