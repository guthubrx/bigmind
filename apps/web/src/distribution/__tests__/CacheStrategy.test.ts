/**
 * CacheStrategy Tests
 * Phase 4 - Sprint 2
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ImmutableCacheStrategy,
  MetadataCacheStrategy,
  StaleWhileRevalidateStrategy,
  NoCacheStrategy,
  createCacheStrategy,
} from '../CacheStrategy';
import type { CacheEntry } from '../CacheManager';

describe('CacheStrategy', () => {
  describe('ImmutableCacheStrategy', () => {
    it('should create immutable strategy', () => {
      const strategy = new ImmutableCacheStrategy();
      expect(strategy).toBeInstanceOf(ImmutableCacheStrategy);
    });

    it('should handle cache set', async () => {
      const strategy = new ImmutableCacheStrategy();
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now(), maxAge: 1000 };
      await expect(strategy.onCacheSet('key', entry)).resolves.toBeUndefined();
    });

    it('should handle cache delete', async () => {
      const strategy = new ImmutableCacheStrategy();
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      await strategy.onCacheDelete('key');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Deleted'));
      consoleSpy.mockRestore();
    });

    it('should handle cache clear', async () => {
      const strategy = new ImmutableCacheStrategy();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await strategy.onCacheClear();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not revalidate immutable content', async () => {
      const strategy = new ImmutableCacheStrategy();
      await expect(strategy.onRevalidate('key')).resolves.toBeUndefined();
    });
  });

  describe('MetadataCacheStrategy', () => {
    it('should create metadata strategy without callback', () => {
      const strategy = new MetadataCacheStrategy();
      expect(strategy).toBeInstanceOf(MetadataCacheStrategy);
    });

    it('should create metadata strategy with callback', () => {
      const callback = vi.fn();
      const strategy = new MetadataCacheStrategy(callback);
      expect(strategy).toBeInstanceOf(MetadataCacheStrategy);
    });

    it('should call refresh callback on revalidation', async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      const strategy = new MetadataCacheStrategy(callback);
      await strategy.onRevalidate('key');
      expect(callback).toHaveBeenCalledWith('key');
    });

    it('should handle revalidation errors', async () => {
      const callback = vi.fn().mockRejectedValue(new Error('Failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const strategy = new MetadataCacheStrategy(callback);
      await strategy.onRevalidate('key');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('StaleWhileRevalidateStrategy', () => {
    it('should create SWR strategy with callback', () => {
      const callback = vi.fn();
      const strategy = new StaleWhileRevalidateStrategy(callback);
      expect(strategy).toBeInstanceOf(StaleWhileRevalidateStrategy);
    });

    it('should revalidate in background', async () => {
      const callback = vi.fn().mockResolvedValue(undefined);
      const strategy = new StaleWhileRevalidateStrategy(callback);
      await strategy.onRevalidate('key');
      expect(callback).toHaveBeenCalledWith('key');
    });

    it('should not revalidate twice for same key', async () => {
      const callback = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const strategy = new StaleWhileRevalidateStrategy(callback);

      // Start first revalidation
      const promise1 = strategy.onRevalidate('key');
      // Start second revalidation (should be ignored)
      const promise2 = strategy.onRevalidate('key');

      await Promise.all([promise1, promise2]);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle revalidation errors', async () => {
      const callback = vi.fn().mockRejectedValue(new Error('Failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const strategy = new StaleWhileRevalidateStrategy(callback);
      await strategy.onRevalidate('key');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('NoCacheStrategy', () => {
    it('should create no-cache strategy', () => {
      const strategy = new NoCacheStrategy();
      expect(strategy).toBeInstanceOf(NoCacheStrategy);
    });

    it('should be no-op for all operations', async () => {
      const strategy = new NoCacheStrategy();
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now(), maxAge: 1000 };

      await expect(strategy.onCacheSet('key', entry)).resolves.toBeUndefined();
      await expect(strategy.onCacheDelete('key')).resolves.toBeUndefined();
      await expect(strategy.onCacheClear()).resolves.toBeUndefined();
      await expect(strategy.onRevalidate('key')).resolves.toBeUndefined();
    });
  });

  describe('createCacheStrategy', () => {
    it('should create immutable strategy', () => {
      const strategy = createCacheStrategy('immutable');
      expect(strategy).toBeInstanceOf(ImmutableCacheStrategy);
    });

    it('should create metadata strategy', () => {
      const strategy = createCacheStrategy('metadata');
      expect(strategy).toBeInstanceOf(MetadataCacheStrategy);
    });

    it('should create SWR strategy with callback', () => {
      const callback = vi.fn();
      const strategy = createCacheStrategy('swr', { revalidate: callback });
      expect(strategy).toBeInstanceOf(StaleWhileRevalidateStrategy);
    });

    it('should throw error for SWR without callback', () => {
      expect(() => createCacheStrategy('swr')).toThrow('revalidate callback');
    });

    it('should create no-cache strategy', () => {
      const strategy = createCacheStrategy('none');
      expect(strategy).toBeInstanceOf(NoCacheStrategy);
    });
  });
});
