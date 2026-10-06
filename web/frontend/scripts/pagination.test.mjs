import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate, readPage, pageNumbers } from '../src/pagination.ts';

test('splits results without skipping or repeating entries, with a partial last page', () => {
  const items = Array.from({ length: 46 }, (_, index) => index);
  const pages = [1, 2, 3].map(page => paginate(items, page));
  assert.deepEqual(pages.map(result => result.items.length), [20, 20, 6]);
  assert.deepEqual(pages.flatMap(result => result.items), items);
  assert.deepEqual([pages[2].start, pages[2].end, pages[2].pages], [41, 46, 3]);
});

test('keeps empty, small and reduced result sets on a valid page', () => {
  assert.deepEqual(paginate([], 999), { page: 1, pages: 1, start: 0, end: 0, items: [] });
  assert.equal(paginate([1], 2).page, 1);
  assert.equal(paginate(Array(21).fill(0), 999).page, 2);
  for (const page of [0, -1, 1.5, NaN, Infinity]) assert.equal(paginate([1], page).page, 1);
});

test('reads shared URLs while rejecting malformed page parameters', () => {
  assert.equal(readPage('?plataforma=instagram&pagina=2'), 2);
  for (const value of ['', '0', '-1', '1.5', '1e2', '2abc', 'Infinity', '9007199254740992']) {
    assert.equal(readPage(`?pagina=${value}`), 1);
  }
});

test('shows boundary pages and nearby pages without duplicate numbers', () => {
  assert.deepEqual(pageNumbers(1, 2), [1, 2]);
  assert.deepEqual(pageNumbers(5, 10), [1, 'gap', 4, 5, 6, 'gap', 10]);
  assert.deepEqual(pageNumbers(10, 10), [1, 'gap', 9, 10]);
});
