import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adsHiddenKey, adsHiddenDuration, readAdsHiddenUntil, hideAdsTemporarily } from '../src/ad-preferences.ts';

test('dismissal persists for four hours and expires without blocking ads forever', () => {
  const originalNow = Date.now;
  let now = 10000;
  Date.now = () => now;
  const saved = new Map();
  globalThis.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  let broadcast;
  globalThis.window = { dispatchEvent: event => { broadcast = event.detail; } };
  try {
    assert.equal(readAdsHiddenUntil(), 0);
    const until = hideAdsTemporarily();
    assert.equal(until, now + adsHiddenDuration);
    assert.equal(broadcast, until);
    assert.equal(readAdsHiddenUntil(), until);
    now = until;
    assert.equal(readAdsHiddenUntil(), 0);
    saved.set(adsHiddenKey, 'invalid');
    assert.equal(readAdsHiddenUntil(), 0);
  } finally { Date.now = originalNow; }
});

test('unavailable browser storage still broadcasts dismissal to current page', () => {
  globalThis.localStorage = { getItem: () => { throw Error(); }, setItem: () => { throw Error(); } };
  let broadcast;
  globalThis.window = { dispatchEvent: event => { broadcast = event.detail; } };
  assert.equal(readAdsHiddenUntil(), 0);
  assert.equal(hideAdsTemporarily(), broadcast);
});
