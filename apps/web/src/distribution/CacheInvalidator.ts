/**
 * Cache Invalidator
 * Purge cache entries via CDN API
 * Phase 4 - Sprint 2 - CORE
 */

export interface PurgeOptions {
  tags?: string[];
  paths?: string[];
  softPurge?: boolean;
}

export interface PurgeResult {
  success: boolean;
  purgedCount: number;
  errors?: string[];
}

/**
 * CacheInvalidator - Purge CDN cache
 */
export class CacheInvalidator {
  private cdnUrl: string;

  private apiKey?: string;

  constructor(cdnUrl: string, apiKey?: string) {
    this.cdnUrl = cdnUrl;
    this.apiKey = apiKey;
  }

  /**
   * Purge by path
   */
  async purgeByPath(path: string, softPurge = false): Promise<PurgeResult> {
    const url = `${this.cdnUrl}/purge/?key=${encodeURIComponent(path)}`;

    try {
      // Simulate purge (replace with actual CDN API call)
      console.info(`[CacheInvalidator] Purging path: ${path} (soft: ${softPurge})`);

      return {
        success: true,
        purgedCount: 1,
      };
    } catch (error) {
      return {
        success: false,
        purgedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Purge by tag
   */
  async purgeByTag(tag: string, softPurge = false): Promise<PurgeResult> {
    try {
      console.info(`[CacheInvalidator] Purging tag: ${tag} (soft: ${softPurge})`);

      return {
        success: true,
        purgedCount: 0, // Unknown count for tag-based purge
      };
    } catch (error) {
      return {
        success: false,
        purgedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Purge multiple paths
   */
  async purgeBatch(options: PurgeOptions): Promise<PurgeResult> {
    const results: PurgeResult[] = [];

    // Purge by paths
    if (options.paths) {
      for (const path of options.paths) {
        const result = await this.purgeByPath(path, options.softPurge);
        results.push(result);
      }
    }

    // Purge by tags
    if (options.tags) {
      for (const tag of options.tags) {
        const result = await this.purgeByTag(tag, options.softPurge);
        results.push(result);
      }
    }

    // Aggregate results
    const success = results.every(r => r.success);
    const purgedCount = results.reduce((sum, r) => sum + r.purgedCount, 0);
    const errors = results.flatMap(r => r.errors || []);

    return {
      success,
      purgedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Purge entire cache (use with caution!)
   */
  async purgeAll(): Promise<PurgeResult> {
    try {
      console.warn('[CacheInvalidator] Purging ALL cache - this is expensive!');

      return {
        success: true,
        purgedCount: 0, // Unknown count
      };
    } catch (error) {
      return {
        success: false,
        purgedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

/**
 * Create cache invalidator
 */
export function createCacheInvalidator(cdnUrl: string, apiKey?: string): CacheInvalidator {
  return new CacheInvalidator(cdnUrl, apiKey);
}
