import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const collections = {
  inform: ['news', 'blogs', 'newsletters', 'podcasts', 'articles', 'tutorials', 'studies', 'case-studies', 'reports'],
  networking: ['events', 'meetups', 'conferences', 'hackathons'],
  practice: ['tools', 'open-source', 'challenges', 'labs'],
  career: ['jobs', 'scholarships', 'mentoring', 'volunteering'],
};
const collection = Object.keys(collections).find(name => process.argv.includes(`--${name}`)) || 'inform';
const categories = new Set(collections[collection]);
const catalog = JSON.parse(await readFile(resolve(root, 'tools/catalog/dist/catalog.json'), 'utf8'));
const resources = catalog.resources.filter(resource => categories.has(resource.type) && !resource.demo);
const overrides = JSON.parse(await readFile(resolve(import.meta.dirname, `${collection}-image-overrides.json`), 'utf8'));
const destination = resolve(root, `web/frontend/src/assets/${collection}`);
const get = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  return response;
};
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), match[2].replaceAll('&amp;', '&')]));
const results = [];
let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < resources.length) {
    const resource = resources[index++];
    const key = `${resource.type}/${resource.slug}`;
    let page = resource.url;
    const candidates = [overrides[key], resource.imageUrl].filter(Boolean);
    if (!candidates.length) {
      try {
        const response = await get(page); page = response.url;
        const html = await response.text();
        const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0]));
        const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => attributes(match[0]));
        const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0]));
        candidates.push(...images.filter(image => /logo|brand/i.test([image.alt,image.id,image.class,image.src].join(' '))).map(image => image.src || image['data-src']),
          ...links.filter(link => /icon/i.test(link.rel || '') && !/mask/i.test(link.rel)).map(link => link.href),
          ...metas.filter(meta => ['og:image','twitter:image'].includes(meta.property || meta.name)).map(meta => meta.content));
      } catch { /* A page may restrict automation while its published asset remains public. */ }
    }
    candidates.push(new URL('/apple-touch-icon.png', page).href, new URL('/favicon.ico', page).href);
    let result;
    for (const candidate of [...new Set(candidates.filter(Boolean))].slice(0, 8)) {
      try {
        const url = new URL(candidate, page);
        if (url.protocol !== 'https:' || url.username || url.password) continue;
        const response = await get(url.href);
        const bytes = Buffer.from(await response.arrayBuffer());
        const mime = response.headers.get('content-type') || '';
        const extension = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
          : bytes[0] === 255 && bytes[1] === 216 ? 'jpg'
          : bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 ? 'ico'
          : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP' ? 'webp'
          : mime.includes('svg') && bytes.toString().includes('<svg') ? 'svg' : null;
        if (!extension || bytes.length < 100 || bytes.length > 4000000) continue;
        if (extension === 'svg' && /<script|<foreignObject|\son\w+=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i.test(bytes.toString())) continue;
        await mkdir(resolve(destination, resource.type), {recursive:true});
        const file = `${key}.${extension}`;
        await writeFile(resolve(destination, file), bytes);
        result = {key, page:resource.url, source:response.url, file, bytes:bytes.length, checkedAt:'2026-10-08'};
        if (!resource.imageUrl || (overrides[key] && resource.imageUrl !== response.url)) {
          resource.imageUrl = response.url;
          await writeFile(resolve(root, `database/data/${key}.json`), JSON.stringify(resource,null,2)+'\n');
        }
        break;
      } catch { /* Try the next reference from the publisher. */ }
    }
    results.push(result || {key,page:resource.url,error:'No verified image'});
    console.log(key, result ? `saved ${result.bytes} bytes` : 'MISSING');
  }
}));
await mkdir(destination, {recursive:true});
await writeFile(resolve(destination,'sources.json'),JSON.stringify(results.sort((a,b)=>a.key.localeCompare(b.key)),null,2)+'\n');
console.log(JSON.stringify({total:resources.length,downloaded:results.filter(item=>item.file).length,missing:results.filter(item=>!item.file).map(item=>item.key)}));
