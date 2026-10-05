import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const path = resolve(process.env.CATALOG_PATH || '../../tools/catalog/dist/catalog.json');
const catalog = JSON.parse(await readFile(path, 'utf8'));
if (catalog.version !== 1 || !Array.isArray(catalog.resources)) throw new Error('Snapshot inválido. Valide os dados primeiro.');
await mkdir('src/generated', { recursive: true });
await writeFile('src/generated/catalog.json', JSON.stringify(catalog));
const community = JSON.parse(await readFile(resolve('../../database/community.json'), 'utf8'));
for (const key of ['supporters']) {
  if (!Array.isArray(community[key])) throw new Error(`Lista inválida: ${key}`);
  const urls = new Set();
  for (const person of community[key]) {
    if (typeof person.name !== 'string' || !person.name.trim() || person.name.length > 100
      || typeof person.url !== 'string' || !/^https:\/\//.test(person.url)
      || typeof person.description !== 'string' || person.description.length > 300) throw new Error(`Cadastro inválido: ${key}`);
    const url = new URL(person.url);
    if (url.username || url.password || urls.has(url.href)) throw new Error(`Link inválido ou duplicado: ${key}`);
    urls.add(url.href);
  }
}
await writeFile('src/generated/community.json', JSON.stringify(community));
