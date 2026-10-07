import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

export async function checkYouTubeCuration({send, evaluate, waitFor, navigate, click, selectOption}) {
  const catalog = JSON.parse(await readFile(new URL('../src/generated/catalog.json', import.meta.url), 'utf8'));
  const channels = catalog.resources.filter(resource => resource.type === 'youtube');
  const pageSize = 20;
  await navigate('/criadores/?plataforma=youtube');
  await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(pageSize, channels.length)}`);
  assert.equal(await evaluate(`[...document.querySelectorAll('main button')].find(b=>b.textContent.trim()==='Sugerir canal').textContent.trim()`), 'Sugerir canal');
  const links = [];
  for (let page = 1; page <= Math.ceil(channels.length / pageSize); page++) {
    if (page > 1) {
      await click(`document.querySelector('button[aria-label="Próxima página"]')`);
      await waitFor(`new URLSearchParams(location.search).get('pagina') === '${page}'`);
    }
    links.push(...await evaluate(`[...document.querySelectorAll('main tbody tr td:first-child a')].map(a => a.href)`));
  }
  assert.equal(links.length, channels.length);
  assert.equal(new Set(links).size, channels.length);
  assert.ok(links.every(url => new URL(url).hostname === 'www.youtube.com'));
  await selectOption('Categoria de conteúdo', 'Carreira');
  const career = channels.filter(resource => resource.creatorCategories?.includes('career'));
  await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(pageSize, career.length)}`);
  assert.equal(await evaluate(`new URLSearchParams(location.search).has('pagina')`), false);
  await evaluate(`(()=>{const input=document.querySelector('#resource-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'@devlucaspedro');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await waitFor(`document.querySelectorAll('main tbody tr').length === 1`);
  assert.equal(await evaluate(`document.querySelector('main tbody tr td:first-child a').href`), 'https://www.youtube.com/@devlucaspedro');
  for (const width of [320, 390, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height:1000, deviceScaleFactor:1, mobile:false});
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `YouTube overflow at ${width}px`);
  }
  await evaluate(`sessionStorage.setItem('participationMode', 'member')`);
  await navigate('/contribuir/?categoria=youtube');
  await waitFor(`document.querySelector('[role="combobox"][aria-label="Categoria do guia"]')?.textContent.includes('YouTube')`);
  await evaluate(`(()=>{
    const input=document.querySelector('input[name="url"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'https://www.youtube.com/@newcreator');input.dispatchEvent(new Event('input',{bubbles:true}));
  })()`);
  await waitFor(`document.querySelector('input[name="name"]').value === 'Canal da Ana'`);
  assert.equal(await evaluate(`document.querySelector('[data-contribution-form] button[type="submit"]').disabled`), true);
  await click(`document.querySelector('button[data-field="creatorCategories"][data-value="career"]')`);
  await click(`document.querySelector('button[data-field="creatorCategories"][data-value="reviews"]')`);
  await selectOption('Assunto principal','Geral');
  await click(`document.querySelector('[data-contribution-form] button[type="submit"]')`);
  await waitFor(`window.lastContribution?.type === 'youtube'`);
  assert.deepEqual(await evaluate(`window.lastContribution.creatorCategories`), ['career','reviews']);
  await waitFor(`document.querySelector('[data-contribution-form]').textContent.includes('Sugestão enviada para revisão')`);
  await evaluate(`sessionStorage.removeItem('participationMode')`);
  console.log('YouTube OK: real channels, pagination without duplicates, category/search combination, channel suggestion and mobile layout.');
}
