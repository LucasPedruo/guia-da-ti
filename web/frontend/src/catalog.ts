import snapshot from './generated/catalog.json';
export type Resource = {
  slug: string; type: string; name: string; summary: string; description: string;
  url: string; areas: string[]; technologies: string[]; languages: string[]; updatedAt: string; demo?: boolean;
};
export const resources: Resource[] = snapshot.resources;
export const taxonomy = snapshot.taxonomy;
export const categories = [
  { id: 'communities', route: 'comunidades', name: 'Comunidades', description: 'Encontre sua turma e compartilhe conhecimento.' },
  { id: 'courses', route: 'cursos', name: 'Cursos', description: 'Dê o próximo passo no seu aprendizado.' },
  { id: 'roadmaps', route: 'roadmaps', name: 'Roadmaps', description: 'Descubra caminhos para começar e evoluir.' },
  { id: 'creators', route: 'criadores', name: 'Criadores', description: 'Conheça quem compartilha o que aprende.' },
  { id: 'youtube', route: 'youtube', name: 'YouTube', description: 'Explore canais para aprender no seu ritmo.' },
];
export const labels: Record<string, string> = { frontend: 'Front-end', backend: 'Back-end', dados: 'Dados', devops: 'DevOps', cybersecurity: 'Segurança', design: 'Design', produto: 'Produto', cloud: 'Cloud', qa: 'Qualidade', mobile: 'Mobile', ia: 'Inteligência artificial', redes: 'Redes', hardware: 'Hardware', carreira: 'Carreira', educacao: 'Educação', react: 'React', typescript: 'TypeScript', csharp: 'C#', dotnet: '.NET', python: 'Python', linux: 'Linux', figma: 'Figma' };
export const resourcePath = (r: Resource) => `/${categories.find(c => c.id === r.type)!.route}/${r.slug}`;
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function pageInfo(path: string) {
  const parts = path.split('/').filter(Boolean);
  const category = categories.find(c => c.route === parts[0]);
  const resource = parts.length === 2 && category ? resources.find(r => r.type === category.id && r.slug === parts[1]) : undefined;
  const area = parts.length === 2 && parts[0] === 'areas' && taxonomy.areas.includes(parts[1]) ? parts[1] : undefined;
  const technology = parts.length === 2 && parts[0] === 'tecnologias' && taxonomy.technologies.includes(parts[1]) ? parts[1] : undefined;
  const valid = path === '/' || path === '/explorar' || path === '/contribuir' || (parts.length === 1 && !!category) || !!resource || !!area || !!technology;
  const title = !valid ? 'Página não encontrada' : resource?.name ?? (area ? labels[area] : technology ? labels[technology] : undefined) ?? category?.name ?? (path === '/' ? 'Seu próximo passo em tecnologia começa aqui' : path === '/contribuir' ? 'Um guia feito por todos' : 'Explore o universo da tecnologia');
  return { category, resource, area, technology, valid, title, description: resource?.summary ?? 'Encontre comunidades, cursos, roadmaps e pessoas para crescer em tecnologia.' };
}
export const routes = ['/', '/explorar', '/contribuir', ...categories.map(c => `/${c.route}`), ...resources.map(resourcePath), ...taxonomy.areas.map(a => `/areas/${a}`), ...taxonomy.technologies.map(t => `/tecnologias/${t}`)];
