/**
 * CacheInvalidator Tests
 * Phase 4 - Sprint 2
 */

import { describe, it, expect, vi } from 'vitest';
import { CacheInvalidator, createCacheInvalidator } from '../CacheInvalidator';

describe('CacheInvalidator', () => {
  const cdnUrl = 'https://cdn.bigmind.app';

  describe('purgeByPath', () => {
    it('should purge single path', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeByPath('/path/to/file.txt');

      expect(result.success).toBe(true);
      expect(result.purgedCount).toBe(1);
    });

    it('should support soft purge', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeByPath('/path/to/file.txt', true);

      expect(result.success).toBe(true);
    });

    it('should log purge action', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const invalidator = new CacheInvalidator(cdnUrl);

      await invalidator.purgeByPath('/test.txt');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Purging path'));
      consoleSpy.mockRestore();
    });
  });

  describe('purgeByTag', () => {
    it('should purge by tag', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeByTag('plugin-v1');

      expect(result.success).toBe(true);
      expect(result.purgedCount).toBeGreaterThanOrEqual(0);
    });

    it('should support soft purge by tag', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeByTag('plugin-v1', true);

      expect(result.success).toBe(true);
    });

    it('should log tag purge action', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const invalidator = new CacheInvalidator(cdnUrl);

      await invalidator.purgeByTag('test-tag');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Purging tag'));
      consoleSpy.mockRestore();
    });
  });

  describe('purgeBatch', () => {
    it('should purge multiple paths', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeBatch({
        paths: ['/file1.txt', '/file2.txt'],
      });

      expect(result.success).toBe(true);
      expect(result.purgedCount).toBe(2);
    });

    it('should purge multiple tags', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeBatch({
        tags: ['tag1', 'tag2'],
      });

      expect(result.success).toBe(true);
    });

    it('should purge paths and tags together', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeBatch({
        paths: ['/file1.txt'],
        tags: ['tag1'],
      });

      expect(result.success).toBe(true);
      expect(result.purgedCount).toBeGreaterThan(0);
    });

    it('should support soft purge in batch', async () => {
      const invalidator = new CacheInvalidator(cdnUrl);
      const result = await invalidator.purgeBatch({
        paths: ['/file1.txt'],
        softPurge: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('purgeAll', () => {
    it('should purge entire cache', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidator = new CacheInvalidator(cdnUrl);

      const result = await invalidator.purgeAll();

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Purging ALL cache'));
      consoleSpy.mockRestore();
    });
  });

  describe('createCacheInvalidator', () => {
    it('should create invalidator via helper', () => {
      const invalidator = createCacheInvalidator(cdnUrl);
      expect(invalidator).toBeInstanceOf(CacheInvalidator);
    });

    it('should create invalidator with API key', () => {
      const invalidator = createCacheInvalidator(cdnUrl, 'secret-key');
      expect(invalidator).toBeInstanceOf(CacheInvalidator);
    });
  });
});
