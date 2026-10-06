import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesResourceSearch, readSearch } from '../src/resource-search.ts';
import { readCreatorCategory } from '../src/creator-categories.ts';
import { paginate } from '../src/pagination.ts';

const creator = { slug: 'criador', name: 'João Pedro', summary: 'Desenvolvimento de aplicações', description: 'Projetos com APIs e Java.', url: 'https://www.instagram.com/devjoao/', areas: ['cybersecurity'], technologies: [], languages: ['pt-BR'] };

test('searches names, handles, descriptions and translated tags without accents or case sensitivity', () => {
  for (const query of ['JOAO', '@devjoao', 'APLICACOES', 'Java APIs', 'seguranca']) {
    assert.equal(matchesResourceSearch(creator, query, { cybersecurity: 'Segurança' }), true, query);
  }
  assert.equal(matchesResourceSearch(creator, 'Java Python'), false);
  assert.equal(matchesResourceSearch(creator, '   '), true);
  assert.equal(matchesResourceSearch(creator, '[.*'), false);
});

test('search covers all matching items before pagination', () => {
  const resources = Array.from({ length: 26 }, (_, index) => ({ ...creator, name: index === 25 ? 'Último criador' : 'Outro criador' }));
  const filtered = resources.filter(resource => matchesResourceSearch(resource, 'ultimo'));
  assert.equal(filtered.length, 1);
  assert.equal(paginate(filtered, 1).items[0].name, 'Último criador');
});

test('restores URL search terms and bounds the query length', () => {
  assert.equal(readSearch('?plataforma=instagram&q=Jo%C3%A3o+Pedro&pagina=2'), 'João Pedro');
  assert.equal(readSearch('?pagina=2'), '');
  assert.equal(readSearch('?q=' + 'a'.repeat(300)).length, 200);
});

test('searches translated creator categories', () => {
  const categorized = {...creator, creatorCategories: ['career', 'humor']};
  assert.equal(matchesResourceSearch(categorized, 'carreira humor', {career: 'Carreira', humor: 'Humor'}), true);
  assert.equal(matchesResourceSearch(categorized, 'lifestyle'), false);
});

test('restores supported creator categories from shared URLs', () => {
  assert.equal(readCreatorCategory('?plataforma=instagram&conteudo=career&q=Ana'), 'career');
  assert.equal(readCreatorCategory('?conteudo=lifestyle&pagina=2'), 'lifestyle');
  assert.equal(readCreatorCategory('?conteudo=unknown'), 'all');
  assert.equal(readCreatorCategory(''), 'all');
});
