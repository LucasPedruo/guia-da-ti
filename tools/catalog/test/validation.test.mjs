import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, validateResource, taxonomy } from '../scripts/validate.mjs';
const sample = { slug: 'exemplo', type: 'courses', name: 'Exemplo', summary: 'Um curso de demonstração.', description: 'Descrição de demonstração.', url: 'https://example.org/curso', areas: ['backend'], technologies: ['csharp'], languages: ['pt-BR'], updatedAt: '2026-01-01' };
test('catálogo de demonstração válido', async () => assert.ok((await buildCatalog()).resources.length > 0));
test('rejeita campos desconhecidos, taxonomia e URLs inseguras', () => {
  for (const change of [{ name: '' }, { script: 'x' }, { areas: ['Front End'] }, { url: 'javascript:alert(1)' }, { url: 'https://127.0.0.1/a' }, { url: 'https://user:pass@example.org' }, { updatedAt: '2099-01-01' }]) {
    assert.throws(() => validateResource({ ...sample, ...change }, 'courses/exemplo.json'));
  }
});
test('rejeita caminho divergente e URL duplicada com fragmento', () => {
  assert.throws(() => validateResource(sample, 'courses/outro.json'));
  const seen = new Set();
  validateResource(sample, 'courses/exemplo.json', seen);
  assert.throws(() => validateResource({ ...sample, url: sample.url + '#a' }, 'courses/exemplo.json', seen));
});

test("accepts all supported resource types and rejects unknown types", () => {
  for (const type of taxonomy.types) {
    assert.doesNotThrow(() => validateResource({ ...sample, type }, `${type}/exemplo.json`));
  }
  assert.throws(() => validateResource({ ...sample, type: "unknown" }, "unknown/exemplo.json"));
});

test("accepts ISO country tags and rejects malformed country tags", () => {
  assert.doesNotThrow(() => validateResource({ ...sample, countries: ["US", "CA"] }, "courses/exemplo.json"));
  for (const countries of [["us"], ["USA"], ["U1"], ["US", "US"], Array(21).fill("US")]) {
    assert.throws(() => validateResource({ ...sample, countries }, "courses/exemplo.json"));
  }
});

test('validates community location scopes and official UFs', () => {
 const community={...sample,type:'communities'};
 for(const communityLocation of [{scope:'regional',states:['SP','RJ']},{scope:'national'},{scope:'international'}]) assert.doesNotThrow(()=>validateResource({...community,communityLocation},'communities/exemplo.json'));
 for(const communityLocation of [{scope:'regional',states:[]},{scope:'regional',states:['XX']},{scope:'regional',states:['SP','SP']},{scope:'national',states:['SP']},{scope:'international',states:[]},{scope:'world'},{scope:'regional',states:['SP'],unknown:true}]) assert.throws(()=>validateResource({...community,communityLocation},'communities/exemplo.json'));
 assert.throws(()=>validateResource({...sample,communityLocation:{scope:'national'}},'courses/exemplo.json'));
 assert.doesNotThrow(()=>validateResource(community,'communities/exemplo.json'));
});

test('validates community platforms and meeting modalities',()=>{
 const community={...sample,type:'communities'};
 for(const communityModality of ['online','in-person','hybrid']) assert.doesNotThrow(()=>validateResource({...community,communityModality,communityPlatforms:['discord','telegram']},'communities/exemplo.json'));
 for(const extra of [{communityPlatforms:[]},{communityPlatforms:['unknown']},{communityPlatforms:['discord','discord']},{communityModality:'unknown'}]) assert.throws(()=>validateResource({...community,...extra},'communities/exemplo.json'));
 assert.throws(()=>validateResource({...sample,communityPlatforms:['discord']},'courses/exemplo.json'));
 assert.throws(()=>validateResource({...sample,communityModality:'online'},'courses/exemplo.json'));
});
