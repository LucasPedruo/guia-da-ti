import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const path = resolve(process.env.CATALOG_PATH || '../../database/dist/catalog.json');
const catalog = JSON.parse(await readFile(path, 'utf8'));
if (catalog.version !== 1 || !Array.isArray(catalog.resources)) throw new Error('Snapshot inválido. Valide os dados primeiro.');
await mkdir('src/generated', { recursive: true });
await writeFile('src/generated/catalog.json', JSON.stringify(catalog));
