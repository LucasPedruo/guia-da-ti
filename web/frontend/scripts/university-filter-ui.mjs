import assert from "node:assert/strict";

export async function checkUniversityFilter({
  catalog,
  send,
  evaluate,
  waitFor,
  navigate,
  click,
  selectOption,
}) {
  const institutions = catalog.resources.filter(
    (r) => r.type === "universities" && !r.demo,
  );
  const trigger = `document.querySelector('[role="combobox"][aria-label="Tipo de instituição"]')`;
  await navigate(
    "/faculdades/?instituicao=private&pagina=2&ordem=comments&visualizacao=lista",
  );
  await waitFor(`${trigger}?.textContent.includes('Privada')`);
  const names = () =>
    evaluate(
      `[...document.querySelectorAll('main article')].map(a=>a.querySelector('a:not([aria-hidden="true"])').textContent)`,
    );
  assert.deepEqual(
    (await names()).sort(),
    institutions
      .filter((r) => r.universityType === "private")
      .map((r) => r.name)
      .sort(),
  );
  await selectOption("Tipo de instituição", "Pública");
  await waitFor(
    `new URLSearchParams(location.search).get('instituicao') === 'public'`,
  );
  assert.equal(
    await evaluate(`new URLSearchParams(location.search).has('pagina')`),
    false,
  );
  assert.equal(
    await evaluate(`new URLSearchParams(location.search).get('ordem')`),
    "comments",
  );
  assert.deepEqual(
    (await names()).sort(),
    institutions
      .filter((r) => r.universityType === "public")
      .map((r) => r.name)
      .sort(),
  );
  await navigate("/faculdades/?instituicao=public&q=FIAP");
  await waitFor(
    `document.querySelector('main').textContent.includes('Nenhum resultado')`,
  );
  await selectOption("Tipo de instituição", "Privada");
  await waitFor(`document.querySelectorAll('main article').length === 1`);
  assert.equal(
    (await names())[0],
    institutions.find((r) => r.slug === "fiap").name,
  );
  await navigate("/faculdades/?instituicao=private");
  await selectOption("Tipo de instituição", "Todas as instituições");
  await waitFor(
    `document.querySelectorAll('main article').length === ${institutions.length}`,
  );
  assert.equal(
    await evaluate(`new URLSearchParams(location.search).has('instituicao')`),
    false,
  );
  await navigate("/plataformas/");
  assert.equal(await evaluate(`!!${trigger}`), false);

  await evaluate(`sessionStorage.setItem('participationMode','member')`);
  await navigate("/contribuir/?categoria=universities");
  await waitFor(`!!${trigger}`);
  await evaluate(`(()=>{
    for(const [name,value] of Object.entries({name:'Faculdade de teste',url:'https://example.org/new-university',summary:'Uma faculdade para teste',description:'Uma descrição para testar o cadastro'})){
      const el=document.querySelector('main form input[name="'+name+'"], main form textarea[name="'+name+'"]');
      Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,value);
      el.dispatchEvent(new Event('input',{bubbles:true}));
    }
    const area=document.querySelector('select[name="area"]');area.value='educacao';area.dispatchEvent(new Event('change',{bubbles:true}));
  })()`);
  assert.equal(
    await evaluate(
      `document.querySelector('main form button[type="submit"]').disabled`,
    ),
    true,
  );
  await selectOption("Tipo de instituição", "Pública");
  await waitFor(
    `!document.querySelector('main form button[type="submit"]').disabled`,
  );
  await click(`document.querySelector('main form button[type="submit"]')`);
  await waitFor(`window.lastContribution?.universityType === 'public'`);
  assert.equal(await evaluate(`window.lastContribution.type`), "universities");
  await waitFor(`document.querySelector('[aria-label="Avisos de sugestões"]').textContent.includes('ana adicionou Faculdade de teste em Faculdades')`);
  assert.equal(await evaluate(`document.querySelectorAll('[aria-label="Avisos de sugestões"] > li').length`), 1);
  const toast = await evaluate(`(()=>{const r=document.querySelector('[aria-label="Avisos de sugestões"]').getBoundingClientRect();return {right:document.documentElement.clientWidth-r.right,bottom:innerHeight-r.bottom}})()`);
  assert.ok(toast.right >= 16 && toast.right <= 31);
  assert.equal(toast.bottom,16);
  await click(`document.querySelector('[aria-label="Fechar aviso"]')`);
  await waitFor(`!document.querySelector('[aria-label="Fechar aviso"]')`);
  await evaluate(`sessionStorage.removeItem('participationMode')`);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate("/faculdades/?instituicao=private");
  await waitFor(`${trigger}?.textContent.includes('Privada')`);
  assert.equal(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth`),
    true,
  );
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  console.log(
    "University filter OK: public/private, search, sort, page reset, URL, mobile and required suggestion metadata.",
  );
}
