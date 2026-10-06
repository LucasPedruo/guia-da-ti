export const creatorCategories = [
  { id: 'education', name: 'Tutoriais e educação' },
  { id: 'career', name: 'Carreira' },
  { id: 'humor', name: 'Humor' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'news', name: 'Notícias' },
  { id: 'reviews', name: 'Análises e opiniões' },
  { id: 'projects', name: 'Projetos e bastidores' },
  { id: 'other', name: 'Outra' },
];

export const creatorCategoryLabels: Record<string, string> = Object.fromEntries(creatorCategories.map(item => [item.id, item.name]));

export function readCreatorCategory(search: string) {
  const value = new URLSearchParams(search).get('conteudo');
  return creatorCategories.some(item => item.id === value) ? value! : 'all';
}
