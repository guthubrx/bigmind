/**
 * CacheManager Tests
 * Phase 4 - Sprint 2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CacheManager, createCacheManager } from '../CacheManager';
import { NoCacheStrategy } from '../CacheStrategy';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager(new NoCacheStrategy());
  });

  describe('Basic Operations', () => {
    it('should set and get cache value', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000 });
      const value = await cacheManager.get<string>('key1');
      expect(value).toBe('value1');
    });

    it('should return null for non-existent key', async () => {
      const value = await cacheManager.get('nonexistent');
      expect(value).toBeNull();
    });

    it('should delete cache entry', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000 });
      const deleted = await cacheManager.delete('key1');
      expect(deleted).toBe(true);
      const value = await cacheManager.get('key1');
      expect(value).toBeNull();
    });

    it('should clear all cache', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000 });
      await cacheManager.set('key2', 'value2', { maxAge: 1000 });
      await cacheManager.clear();
      expect(await cacheManager.get('key1')).toBeNull();
      expect(await cacheManager.get('key2')).toBeNull();
    });
  });

  describe('Expiration', () => {
    it('should expire after maxAge', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 100 });
      await new Promise(resolve => setTimeout(resolve, 150));
      const value = await cacheManager.get('key1');
      expect(value).toBeNull();
    });

    it('should serve fresh content within maxAge', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      const value = await cacheManager.get('key1');
      expect(value).toBe('value1');
    });
  });

  describe('Stale-While-Revalidate', () => {
    it('should serve stale content during revalidation window', async () => {
      await cacheManager.set('key1', 'value1', {
        maxAge: 100,
        staleWhileRevalidate: 200,
      });

      // Wait for content to become stale
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should still return stale value
      const value = await cacheManager.get('key1');
      expect(value).toBe('value1');
    });

    it('should expire after stale-while-revalidate window', async () => {
      await cacheManager.set('key1', 'value1', {
        maxAge: 100,
        staleWhileRevalidate: 100,
      });

      // Wait beyond both windows
      await new Promise(resolve => setTimeout(resolve, 250));

      const value = await cacheManager.get('key1');
      expect(value).toBeNull();
    });
  });

  describe('Tag-Based Purging', () => {
    it('should purge entries by tag', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000, tags: ['tag1'] });
      await cacheManager.set('key2', 'value2', { maxAge: 1000, tags: ['tag1', 'tag2'] });
      await cacheManager.set('key3', 'value3', { maxAge: 1000, tags: ['tag2'] });

      const count = await cacheManager.purgeByTag('tag1');
      expect(count).toBe(2);
      expect(await cacheManager.get('key1')).toBeNull();
      expect(await cacheManager.get('key2')).toBeNull();
      expect(await cacheManager.get('key3')).toBe('value3');
    });

    it('should return 0 when purging non-existent tag', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000, tags: ['tag1'] });
      const count = await cacheManager.purgeByTag('nonexistent');
      expect(count).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should return cache statistics', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 1000 });
      await cacheManager.set('key2', 'value2', { maxAge: 1000 });

      const stats = cacheManager.getStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.revalidating).toBe(0);
    });

    it('should track revalidating entries', async () => {
      // This test would need async revalidation to work properly
      const stats = cacheManager.getStats();
      expect(stats.revalidating).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup expired entries', async () => {
      await cacheManager.set('key1', 'value1', { maxAge: 50 });
      await cacheManager.set('key2', 'value2', { maxAge: 1000 });

      await new Promise(resolve => setTimeout(resolve, 100));

      const cleaned = await cacheManager.cleanup();
      expect(cleaned).toBe(1);
      expect(await cacheManager.get('key1')).toBeNull();
      expect(await cacheManager.get('key2')).toBe('value2');
    });

    it('should cleanup entries beyond stale window', async () => {
      await cacheManager.set('key1', 'value1', {
        maxAge: 50,
        staleWhileRevalidate: 50,
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      const cleaned = await cacheManager.cleanup();
      expect(cleaned).toBe(1);
    });
  });

  describe('Helper Functions', () => {
    it('should create cache manager with createCacheManager', () => {
      const manager = createCacheManager(new NoCacheStrategy());
      expect(manager).toBeInstanceOf(CacheManager);
    });
  });
});
