import { readFile, readdir, mkdir, writeFile, lstat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const schema = await json(resolve(root, 'schemas/resource.schema.json'));
export const taxonomy = await json(resolve(root, 'taxonomy/index.json'));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const check = ajv.compile(schema);

export function validateResource(resource, file, seen = new Set()) {
  if (!check(resource)) throw new Error(`${file}: ${ajv.errorsText(check.errors)}`);
  if (file !== `${resource.type}/${resource.slug}.json`) throw new Error(`${file}: tipo/slug não corresponde ao caminho`);
  for (const field of ['areas', 'technologies', 'languages']) {
    if (resource[field].some(id => !taxonomy[field].includes(id))) throw new Error(`${file}: ${field} fora da taxonomia`);
  }
  const url = new URL(resource.url);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !url.hostname.includes('.') || /(^localhost$|\.local$|\.localhost$|\.internal$|^[\d.]+$|:)/i.test(url.hostname)) throw new Error(`${file}: URL pública HTTPS obrigatória`);
  if (resource.communityLinks) {
    const platforms=resource.communityLinks.map(link=>link.platform);
    if (new Set(platforms).size!==platforms.length || platforms.length!==resource.communityPlatforms.length || platforms.some(id=>!resource.communityPlatforms.includes(id))) throw new Error(`${file}: informe um link para cada plataforma selecionada`);
    for (const link of resource.communityLinks) {
      const target=new URL(link.url);
      if (target.protocol!=='https:' || target.username || target.password || target.port || !target.hostname.includes('.') || /(^localhost$|\.local$|\.localhost$|\.internal$|^[\d.]+$|:)/i.test(target.hostname)) throw new Error(`${file}: link de plataforma deve ser uma URL pública HTTPS`);
    }
  }
  if (resource.communityMembers?.checkedAt > new Date().toISOString().slice(0,10)) throw new Error(`${file}: data da contagem de membros no futuro`);
  if (resource.updatedAt > new Date().toISOString().slice(0, 10)) throw new Error(`${file}: data futura`);
  url.hash = '';
  const key = url.href.replace(/\/$/, '');
  if (seen.has(key)) throw new Error(`${file}: URL duplicada`);
  seen.add(key);
  return resource;
}

export async function buildCatalog(dataRoot = resolve(root, '../../database/data')) {
  const resources = [], seen = new Set();
  for (const dir of await readdir(dataRoot, { withFileTypes: true })) {
    if (!dir.isDirectory() || !taxonomy.types.includes(dir.name)) throw new Error(`Categoria inválida: ${dir.name}`);
    for (const name of await readdir(resolve(dataRoot, dir.name))) {
      const path = resolve(dataRoot, dir.name, name);
      const stat = await lstat(path);
      if (!stat.isFile() || !name.endsWith('.json') || stat.size > 20000) throw new Error(`Arquivo inválido: ${name}`);
      resources.push(validateResource(await json(path), `${dir.name}/${name}`, seen));
    }
  }
  return { version: 1, taxonomy, resources: resources.sort((a, b) => a.slug.localeCompare(b.slug)) };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = await buildCatalog(process.argv[2] && resolve(process.argv[2]));
  await mkdir(resolve(root, 'dist'), { recursive: true });
  await writeFile(resolve(root, 'dist/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  console.log(`${catalog.resources.length} cadastros válidos. Catálogo gerado.`);
}
