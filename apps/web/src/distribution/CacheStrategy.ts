/**
 * Cache Strategies
 * Phase 4 - Sprint 2 - CORE
 */

import type { CacheEntry } from './CacheManager';

export interface CacheStrategy {
  onCacheSet(key: string, entry: CacheEntry<unknown>): Promise<void>;
  onCacheDelete(key: string): Promise<void>;
  onCacheClear(): Promise<void>;
  onRevalidate(key: string): Promise<void>;
}

/**
 * Immutable Cache Strategy
 * For versioned content that never changes (plugin packages)
 */
export class ImmutableCacheStrategy implements CacheStrategy {
  async onCacheSet(key: string, entry: CacheEntry<unknown>): Promise<void> {
    // Immutable content - no action needed
  }

  async onCacheDelete(key: string): Promise<void> {
    // Rarely deleted - log for monitoring
    console.info(`[ImmutableCache] Deleted: ${key}`);
  }

  async onCacheClear(): Promise<void> {
    console.warn('[ImmutableCache] Full cache clear - unexpected!');
  }

  async onRevalidate(key: string): Promise<void> {
    // Immutable content never needs revalidation
  }
}

/**
 * Metadata Cache Strategy
 * Short-lived cache with frequent updates
 */
export class MetadataCacheStrategy implements CacheStrategy {
  private refreshCallback?: (key: string) => Promise<unknown>;

  constructor(refreshCallback?: (key: string) => Promise<unknown>) {
    this.refreshCallback = refreshCallback;
  }

  async onCacheSet(key: string, entry: CacheEntry<unknown>): Promise<void> {
    // Metadata cached - ready for serving
  }

  async onCacheDelete(key: string): Promise<void> {
    // Normal operation for metadata
  }

  async onCacheClear(): Promise<void> {
    console.info('[MetadataCache] Cache cleared');
  }

  async onRevalidate(key: string): Promise<void> {
    if (this.refreshCallback) {
      try {
        await this.refreshCallback(key);
      } catch (error) {
        console.error(`[MetadataCache] Revalidation failed for ${key}:`, error);
      }
    }
  }
}

/**
 * Stale-While-Revalidate Strategy
 * Serve stale content while refreshing in background
 */
export class StaleWhileRevalidateStrategy implements CacheStrategy {
  private revalidationCallback: (key: string) => Promise<unknown>;

  private pendingRevalidations = new Set<string>();

  constructor(revalidationCallback: (key: string) => Promise<unknown>) {
    this.revalidationCallback = revalidationCallback;
  }

  async onCacheSet(key: string, entry: CacheEntry<unknown>): Promise<void> {
    // Content cached
  }

  async onCacheDelete(key: string): Promise<void> {
    this.pendingRevalidations.delete(key);
  }

  async onCacheClear(): Promise<void> {
    this.pendingRevalidations.clear();
  }

  async onRevalidate(key: string): Promise<void> {
    if (this.pendingRevalidations.has(key)) {
      return; // Already revalidating
    }

    this.pendingRevalidations.add(key);

    try {
      await this.revalidationCallback(key);
    } catch (error) {
      console.error(`[SWR] Revalidation failed for ${key}:`, error);
    } finally {
      this.pendingRevalidations.delete(key);
    }
  }
}

/**
 * No-Cache Strategy
 * Bypass caching entirely
 */
export class NoCacheStrategy implements CacheStrategy {
  async onCacheSet(): Promise<void> {
    // No caching
  }

  async onCacheDelete(): Promise<void> {
    // No-op
  }

  async onCacheClear(): Promise<void> {
    // No-op
  }

  async onRevalidate(): Promise<void> {
    // No-op
  }
}

/**
 * Create appropriate strategy based on content type
 */
export function createCacheStrategy(
  type: 'immutable' | 'metadata' | 'swr' | 'none',
  callbacks?: {
    refresh?: (key: string) => Promise<unknown>;
    revalidate?: (key: string) => Promise<unknown>;
  }
): CacheStrategy {
  switch (type) {
    case 'immutable':
      return new ImmutableCacheStrategy();
    case 'metadata':
      return new MetadataCacheStrategy(callbacks?.refresh);
    case 'swr':
      if (!callbacks?.revalidate) {
        throw new Error('SWR strategy requires revalidate callback');
      }
      return new StaleWhileRevalidateStrategy(callbacks.revalidate);
    case 'none':
      return new NoCacheStrategy();
  }
}
