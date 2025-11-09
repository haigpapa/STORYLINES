/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LRUCache from '../cache';

describe('LRUCache', () => {
  let cache;

  beforeEach(() => {
    cache = new LRUCache({ max: 3, ttl: 1000 });
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should evict least recently used when max size exceeded', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4'); // This should evict key1

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should update LRU order on get', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    cache.get('key1'); // Access key1, making it most recently used

    cache.set('key4', 'value4'); // This should evict key2, not key1

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should expire entries after TTL', async () => {
    const shortCache = new LRUCache({ max: 10, ttl: 50 });
    shortCache.set('key1', 'value1');

    expect(shortCache.get('key1')).toBe('value1');

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(shortCache.get('key1')).toBeUndefined();
  });

  it('should update existing keys', () => {
    cache.set('key1', 'value1');
    cache.set('key1', 'updated');

    expect(cache.get('key1')).toBe('updated');
    expect(cache.size).toBe(1);
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete keys', () => {
    cache.set('key1', 'value1');
    cache.delete('key1');

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should report correct size', () => {
    expect(cache.size).toBe(0);

    cache.set('key1', 'value1');
    expect(cache.size).toBe(1);

    cache.set('key2', 'value2');
    expect(cache.size).toBe(2);

    cache.delete('key1');
    expect(cache.size).toBe(1);
  });
});
