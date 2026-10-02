// Browser smoke test without extra test dependencies. Uses a local Chrome installation.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const profile = await mkdtemp(join(tmpdir(), 'guia-ui-'));
const chrome = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
const processHandle = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const base = process.env.TEST_URL || 'http://localhost:5081';
let socket;
let launchError;
processHandle.on('error', error => { launchError = error; });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let port;
  for (let i = 0; i < 100; i++) {
    if (launchError) throw launchError;
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await sleep(100); }
  }
  if (!port) throw new Error('Chrome did not start. Configure CHROME_PATH.');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map(), errors = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) { const request = pending.get(message.id); pending.delete(message.id); if (message.error) request.reject(message.error); else request.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
  };
  function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); }); }
  async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
  async function waitFor(expression) { for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await sleep(100); } throw new Error(`Timed out: ${expression}`); }
  async function navigate(path) { await send('Page.navigate', { url: base + path }); await waitFor(`document.readyState === 'complete' && !!document.querySelector('main h1') && location.pathname === ${JSON.stringify(path)}`); await sleep(500); }
  async function click(expression) { const point = await evaluate(`(()=>{const el=${expression}; if(!el)throw Error('Missing element');const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`); await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 }); }
  async function hover(expression) { const point = await evaluate(`(()=>{const el=${expression}; if(!el)throw Error('Missing element');const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`); await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point }); }
  async function key(key, code = key) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code }); }
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('/');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-label="Categorias"] a').length`), 32);
  assert.equal(await evaluate(`document.body.textContent.includes('Seu próximo passo')`), false);
  assert.equal(await evaluate(`document.querySelector('main').textContent.includes('As conversas da comunidade vão aparecer aqui')`), true);
  await hover(`document.querySelector('[data-slot="navigation-menu-trigger"]')`);
  await waitFor(`document.querySelector('[data-slot="navigation-menu-content"]')?.getAttribute('data-state') === 'open'`);
  assert.equal(await evaluate(`document.querySelector('[data-slot="navigation-menu-content"]').textContent.includes('Plataformas de cursos')`), true);
  assert.equal(await evaluate(`document.querySelector('[data-slot="navigation-menu-content"]').textContent.includes('Bolsas')`), true);
  const menuBounds = await evaluate(`(()=>{const r=document.querySelector('[data-slot="navigation-menu-content"]').getBoundingClientRect();return {left:r.left,width:r.width,viewport:innerWidth}})()`);
  assert.ok(menuBounds.width >= menuBounds.viewport - 20, JSON.stringify(menuBounds));
  assert.ok(Math.abs(menuBounds.left) < 1, JSON.stringify(menuBounds));
  for (const route of ['/comunidades', '/cursos', '/criadores', '/eventos', '/ferramentas']) assert.equal(await evaluate(`!!document.querySelector('a[href="${route}"]')`), true, route);
  await key('Escape');
  await waitFor(`!document.querySelector('[data-slot="navigation-menu-content"]') || document.querySelector('[data-slot="navigation-menu-content"]').getAttribute('data-state') === 'closed'`);
  await evaluate(`document.querySelector('[data-slot="navigation-menu-trigger"]').focus()`); await key('ArrowDown');
  await waitFor(`document.activeElement?.getAttribute('data-slot') === 'navigation-menu-link'`);
  await key('Escape');
  await waitFor(`!document.querySelector('[data-slot="navigation-menu-content"]') || document.querySelector('[data-slot="navigation-menu-content"]').getAttribute('data-state') === 'closed'`);
  await click(`document.querySelector('[role="combobox"]')`);
  await waitFor(`!!document.querySelector('[role="listbox"]')`);
  await click(`[...document.querySelectorAll('[role="option"]')].find(e=>e.textContent.trim()==='Cursos')`);
  await waitFor(`document.querySelector('[aria-live="polite"]').textContent === '1 recurso'`);
  await navigate('/');
  await click(`document.querySelector('[aria-label="Idioma e região dos recursos"]')`);
  await waitFor(`!!document.querySelector('[role="listbox"]')`);
  await click(`[...document.querySelectorAll('[role="option"]')].find(e=>e.textContent.trim()==='English (United States)')`);
  await waitFor(`document.querySelector('[aria-live="polite"]').textContent === '1 recurso'`);
  assert.equal(await evaluate(`document.querySelector('main').textContent.includes('Pessoa Criadora')`), true);
  assert.equal(await evaluate(`document.querySelector('main').textContent.includes('Estados Unidos')`), true);
  await click(`document.querySelector('[aria-label="Idioma e região dos recursos"]')`);
  await click(`[...document.querySelectorAll('[role="option"]')].find(e=>e.textContent.trim()==='Português')`);
  await waitFor(`document.querySelector('[aria-live="polite"]').textContent === '4 recursos'`);
  await click(`document.querySelector('input[type="search"]')`);
  await send('Input.insertText', { text: 'python' });
  await waitFor(`document.querySelector('[aria-live="polite"]').textContent === '1 recurso'`);
  await navigate('/eventos/');
  await waitFor(`document.body.textContent.includes('Ainda não há recursos aqui')`);
  await navigate('/sobre/');
  assert.equal(await evaluate(`document.querySelector('h1').textContent`), 'Sobre o Guia da TI');
  await navigate('/');
  await click(`document.querySelector('[aria-label="Ativar tema escuro"]')`);
  await waitFor(`document.documentElement.classList.contains('dark')`);
  await click(`document.querySelector('[data-slot="navigation-menu-trigger"]')`); await waitFor(`document.querySelector('[data-slot="navigation-menu-content"]')?.getAttribute('data-state') === 'open'`);
  await key('Escape');
  await click(`document.querySelector('[aria-label="Ativar tema claro"]')`);
  for (const width of [768, 320, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await sleep(200);
    const dimensions = await evaluate(`(()=>{const m=document.querySelector('[data-slot="navigation-menu"]'),l=document.querySelector('[data-slot="navigation-menu-list"]'),s=getComputedStyle(l);return {viewport:innerWidth,document:document.documentElement.scrollWidth,header:document.querySelector('header').getBoundingClientRect().width,menu:m.getBoundingClientRect().width,menuClass:m.className,list:l.getBoundingClientRect().width,listClass:l.className,listScroll:l.scrollWidth,listCSS:{width:s.width,minWidth:s.minWidth,maxWidth:s.maxWidth,flex:s.flex,overflow:s.overflow}}})()`);
    assert.ok(dimensions.document <= dimensions.viewport, `Overflow at ${width}px: ${JSON.stringify(dimensions)}`);
  }
  await click(`document.querySelector('[data-slot="sheet-trigger"]')`);
  await waitFor(`document.querySelector('[data-slot="sheet-content"]')?.getAttribute('data-state') === 'open'`);
  assert.equal(await evaluate(`document.querySelector('[data-slot="sheet-content"]').textContent.includes('Comunidades')`), true);
  await key('Escape');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  await click(`document.querySelector('[data-slot="navigation-menu-trigger"]')`); await waitFor(`document.querySelector('[data-slot="navigation-menu-content"]')?.getAttribute('data-state') === 'open'`);
  assert.equal(await evaluate(`document.querySelector('[data-slot="navigation-menu-content"]').textContent.includes('Bolsas')`), true);
  const groups = JSON.parse(await readFile('src/navigation.json', 'utf8'));
  for (const category of groups.flatMap(group => group.categories)) {
    const response = await fetch(`${base}/${category.route}/`);
    assert.equal(response.status, 200, category.route);
    assert.ok((await response.text()).includes(category.name), category.route);
  }
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('UI OK: hover mega-menu, keyboard navigation, home discussion area, search, empty state, about, dark theme and responsive layout.');
} finally {
  socket?.close();
  processHandle.kill();
}
