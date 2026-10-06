import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

export async function checkSocialCuration({send, evaluate, waitFor, navigate, click, selectOption}) {
  const catalog = JSON.parse(await readFile(new URL('../src/generated/catalog.json', import.meta.url), 'utf8'));
  const networks = [
    {id:'linkedin', host:'www.linkedin.com', label:'LinkedIn', mine:'https://www.linkedin.com/in/lucaspedruo/', query:'lucaspedruo'},
    {id:'tiktok', host:'www.tiktok.com', label:'TikTok', mine:'https://www.tiktok.com/@devlucaspedro', query:'@devlucaspedro'},
    {id:'twitter', host:'x.com', label:'Twitter / X', mine:'https://x.com/devlucaspedro', query:'devlucaspedro'},
  ];
  for (const network of networks) {
    const profiles = catalog.resources.filter(resource => resource.type === 'creators' && new URL(resource.url).hostname === network.host);
    assert.ok(profiles.length > 0, `${network.label} must have curated profiles`);
    await navigate(`/criadores/?plataforma=${network.id}`);
    await waitFor(`document.querySelector('[role="tab"][aria-selected="true"]').textContent === ${JSON.stringify(network.label)}`);
    await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(20, profiles.length)}`);
    const links = [];
    for (let page = 1; page <= Math.ceil(profiles.length / 20); page++) {
      if (page > 1) {
        await click(`document.querySelector('button[aria-label="Próxima página"]')`);
        await waitFor(`new URLSearchParams(location.search).get('pagina') === '${page}'`);
        await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(20, profiles.length - (page - 1) * 20)}`);
      }
      links.push(...await evaluate(`[...document.querySelectorAll('main tbody tr td:first-child a')].map(a => a.href)`));
    }
    assert.deepEqual([...new Set(links)].sort(), profiles.map(profile => profile.url).sort(), `${network.label}: all profiles appear once and only in their network`);
    assert.equal(links.length, profiles.length);
    await selectOption('Categoria de conteúdo', 'Carreira');
    const career = profiles.filter(profile => profile.creatorCategories?.includes('career'));
    await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(20, career.length)}`);
    assert.equal(await evaluate(`new URLSearchParams(location.search).has('pagina')`), false);
    const careerLinks = await evaluate(`[...document.querySelectorAll('main tbody tr td:first-child a')].map(a => a.href)`);
    assert.ok(careerLinks.every(url => career.some(profile => profile.url === url)));
    await selectOption('Categoria de conteúdo', 'Outra');
    await evaluate(`(()=>{const input=document.querySelector('#resource-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(network.query)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await waitFor(`document.querySelectorAll('main tbody tr').length === 1 && document.querySelector('main tbody tr td:first-child a').href === ${JSON.stringify(network.mine)}`);
    for (const width of [320, 390, 768, 1440]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:1000, deviceScaleFactor:1, mobile:false});
      assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `${network.label}: overflow at ${width}px`);
    }
  }
  console.log('Social curation OK: three networks, unique paginated profiles, category/search filters, author profiles and responsive layout.');
}
