import assert from 'node:assert/strict';

export async function checkCreatorCategories({send, evaluate, waitFor, navigate, click, selectOption}) {
  await navigate('/criadores/?plataforma=instagram&conteudo=lifestyle&pagina=2');
  await waitFor(`document.querySelector('[role="combobox"][aria-label="Categoria de conteúdo"]')?.textContent.includes('Estilo de vida')`);
  const controls = await evaluate(`(()=>{const category=document.querySelector('[role="combobox"][aria-label="Categoria de conteúdo"]').getBoundingClientRect(), search=document.querySelector('#resource-search').getBoundingClientRect();return {category:{x:category.x,y:category.y,width:category.width,height:category.height},search:{x:search.x,y:search.y,width:search.width,height:search.height}}})()`);
  assert.ok(Math.abs(controls.category.y - controls.search.y) < 2, 'Category and search share the same row');
  assert.ok(controls.category.x + controls.category.width <= controls.search.x, 'Category appears beside the search');
  assert.ok(Math.abs(controls.category.height - controls.search.height) < 2, 'Category and search use the same height');
  const profiles = await evaluate(`[...document.querySelectorAll('main tbody tr td:first-child a')].map(a => a.href)`);
  assert.equal(profiles.length, 4);
  assert.ok(profiles.some(url => url.includes('lucasmontano')));
  assert.equal(await evaluate(`document.querySelector('main tbody').textContent.includes('Estilo de vida')`), true);
  await selectOption('Categoria de conteúdo', 'Humor');
  await waitFor(`document.querySelector('main').textContent.includes('Ainda não há criadores nesta categoria')`);
  assert.equal(await evaluate(`new URLSearchParams(location.search).has('pagina')`), false);
  assert.equal(await evaluate(`!!document.querySelector('#resource-search')`), true);
  await selectOption('Categoria de conteúdo', 'Todas as categorias');
  await waitFor(`document.querySelectorAll('main tbody tr').length === 20`);
  assert.equal(await evaluate(`new URLSearchParams(location.search).has('conteudo')`), false);
  await evaluate(`sessionStorage.setItem('participationMode', 'member')`);
  await navigate('/contribuir/?categoria=creators');
  await waitFor(`document.querySelectorAll('button[data-field="creatorCategories"]').length === 8`);
  await evaluate(`(()=>{
    const input = document.querySelector('input[name="url"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'https://www.instagram.com/newcreator/');
    input.dispatchEvent(new Event('input',{bubbles:true}));
  })()`);
  await waitFor(`document.querySelector('input[name="name"]').value === 'Canal da Ana'`);
  assert.equal(await evaluate(`document.querySelector('[data-contribution-form] button[type="submit"]').disabled`), true);
  await click(`document.querySelector('button[data-field="creatorCategories"][data-value="career"]')`);
  await click(`document.querySelector('button[data-field="creatorCategories"][data-value="humor"]')`);
  await selectOption('Assunto principal','Geral');
  await waitFor(`!document.querySelector('[data-contribution-form] button[type="submit"]').disabled`);
  await click(`document.querySelector('[data-contribution-form] button[type="submit"]')`);
  await waitFor(`window.lastContribution?.creatorCategories?.length === 2`);
  assert.deepEqual(await evaluate(`window.lastContribution.creatorCategories`), ['career', 'humor']);
  assert.equal(await evaluate(`window.lastContribution.type`), 'creators');
  await waitFor(`document.querySelector('[data-contribution-form]').textContent.includes('Sugestão enviada para revisão')`);
  assert.equal(await evaluate(`document.querySelectorAll('button[data-field="creatorCategories"][data-state="checked"]').length`), 0);
  await send('Emulation.setDeviceMetricsOverride', {width:390, height:844, deviceScaleFactor:1, mobile:false});
  await navigate('/criadores/?plataforma=instagram&conteudo=career');
  await waitFor(`!!document.querySelector('main tbody tr')`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  assert.equal(await evaluate(`document.querySelector('main tbody tr td:first-child').textContent.includes('Carreira')`), true);
  await send('Emulation.setDeviceMetricsOverride', {width:1440, height:1000, deviceScaleFactor:1, mobile:false});
  await evaluate(`sessionStorage.removeItem('participationMode')`);
  console.log('Creator categories OK: URL filters, empty results, required multiple selections, submission metadata and mobile layout.');
}
