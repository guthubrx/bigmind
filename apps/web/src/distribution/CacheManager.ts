/**
 * Cache Manager
 * Orchestrates caching strategies for plugin distribution
 * Phase 4 - Sprint 2 - CORE
 */

import type { CacheStrategy } from './CacheStrategy';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  maxAge: number;
  staleWhileRevalidate?: number;
  tags?: string[];
}

export interface CacheOptions {
  maxAge: number;
  staleWhileRevalidate?: number;
  tags?: string[];
}

/**
 * CacheManager - Main cache orchestration
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  private strategy: CacheStrategy;

  private revalidating: Set<string> = new Set();

  constructor(strategy: CacheStrategy) {
    this.strategy = strategy;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Fresh cache
    if (age < entry.maxAge) {
      return entry.data;
    }

    // Stale-while-revalidate
    if (entry.staleWhileRevalidate && age < entry.maxAge + entry.staleWhileRevalidate) {
      // Return stale data immediately
      const staleData = entry.data;

      // Trigger background revalidation
      if (!this.revalidating.has(key)) {
        this.revalidate(key);
      }

      return staleData;
    }

    // Expired
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache value
   */
  async set<T>(key: string, data: T, options: CacheOptions): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      maxAge: options.maxAge,
      staleWhileRevalidate: options.staleWhileRevalidate,
      tags: options.tags,
    };

    this.cache.set(key, entry);
    await this.strategy.onCacheSet(key, entry);
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      await this.strategy.onCacheDelete(key);
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    await this.strategy.onCacheClear();
  }

  /**
   * Purge by tag
   */
  async purgeByTag(tag: string): Promise<number> {
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        await this.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    revalidating: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      revalidating: this.revalidating.size,
    };
  }

  /**
   * Background revalidation
   */
  private async revalidate(key: string): Promise<void> {
    this.revalidating.add(key);

    try {
      await this.strategy.onRevalidate(key);
    } finally {
      this.revalidating.delete(key);
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      const maxStale = entry.maxAge + (entry.staleWhileRevalidate || 0);

      if (age > maxStale) {
        await this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Create cache manager with strategy
 */
export function createCacheManager(strategy: CacheStrategy): CacheManager {
  return new CacheManager(strategy);
}
