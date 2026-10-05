import snapshot from './generated/catalog.json';
import navigation from './navigation.json';
export type Resource = {
  slug: string; type: string; name: string; summary: string; description: string;
  url: string; areas: string[]; technologies: string[]; languages: string[]; countries?: string[]; updatedAt: string; demo?: boolean;
};
export const resources: Resource[] = snapshot.resources;
export const taxonomy = snapshot.taxonomy;
export const groups = navigation;
export const categories = groups.flatMap(group => group.categories);
export const labels: Record<string, string> = { frontend: 'Front-end', backend: 'Back-end', dados: 'Dados', devops: 'DevOps', cybersecurity: 'Segurança', design: 'Design', produto: 'Produto', cloud: 'Cloud', qa: 'Qualidade', mobile: 'Mobile', ia: 'Inteligência artificial', redes: 'Redes', hardware: 'Hardware', carreira: 'Carreira', educacao: 'Educação', react: 'React', typescript: 'TypeScript', csharp: 'C#', dotnet: '.NET', python: 'Python', linux: 'Linux', figma: 'Figma', US: 'Estados Unidos' };
export const resourcePath = (r: Resource) => `/${categories.find(c => c.id === r.type)!.route}/${r.slug}`;
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function pageInfo(path: string) {
  const parts = path.split('/').filter(Boolean);
  const category = categories.find(c => c.route === parts[0]);
  const resource = parts.length === 2 && category ? resources.find(r => r.type === category.id && r.slug === parts[1]) : undefined;
  const area = parts.length === 2 && parts[0] === 'areas' && taxonomy.areas.includes(parts[1]) ? parts[1] : undefined;
  const technology = parts.length === 2 && parts[0] === 'tecnologias' && taxonomy.technologies.includes(parts[1]) ? parts[1] : undefined;
  const valid = ['/', '/explorar', '/contribuir', '/sobre', '/apoiadores', '/contribuidores'].includes(path) || (parts.length === 1 && !!category) || !!resource || !!area || !!technology;
  const title = path === '/apoiadores' ? 'Empresas apoiadoras' : path === '/contribuidores' ? 'Contribuidores' : !valid ? 'Página não encontrada' : resource?.name ?? (area ? labels[area] : technology ? labels[technology] : undefined) ?? category?.name ?? (path === '/' ? 'Conversas da comunidade' : path === '/sobre' ? 'Sobre o Guia da TI' : path === '/contribuir' ? 'Contribuir' : 'Explore tecnologia');
  return { category, resource, area, technology, valid, title, description: resource?.summary ?? (path === '/' ? 'Conversas, dúvidas e ideias de quem vive tecnologia.' : path === '/sobre' ? 'Conheça o Guia da TI, um catálogo aberto de recursos de tecnologia mantido pela comunidade.' : 'Cursos, comunidades, ferramentas, artigos e oportunidades de tecnologia em um só lugar.') };
}
export const routes = ['/', '/explorar', '/contribuir', '/sobre', '/apoiadores', '/contribuidores', ...categories.map(c => `/${c.route}`), ...resources.map(resourcePath), ...taxonomy.areas.map(a => `/areas/${a}`), ...taxonomy.technologies.map(t => `/tecnologias/${t}`)];
