/**
 * GitHub Plugin Registry
 * Fetches plugin metadata and downloads from GitHub
 */

export interface PluginRegistryEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  source: 'official' | 'community';
  category: string;
  tags: string[];
  icon?: string;
  downloadUrl: string;
  manifestUrl: string;
  downloads: number;
  rating: number; // 0-5 stars
  reviewCount: number;
  featured: boolean;
  lastUpdated: string;
}

export interface PluginRatings {
  rating: number;
  reviewCount: number;
  reviews?: Array<{
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

interface RegistryResponse {
  version: string;
  lastUpdated: string;
  plugins: PluginRegistryEntry[];
}

const REGISTRY_URL =
  'https://raw.githubusercontent.com/guthubrx/bigmind-plugins/main/registry.json';

const CACHE_KEY = 'bigmind-plugin-registry-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: RegistryResponse;
  timestamp: number;
}

export class GitHubPluginRegistry {
  private cache: CacheEntry | null = null;

  /**
   * Fetch the plugin registry from GitHub
   * Uses cache if fresh (< 5min)
   */
  async fetchRegistry(): Promise<PluginRegistryEntry[]> {
    // Check cache
    if (this.cache && Date.now() - this.cache.timestamp < CACHE_TTL) {
      console.log('[GitHubPluginRegistry] Using cached registry');
      return this.cache.data.plugins;
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheEntry: CacheEntry = JSON.parse(cached);
        if (Date.now() - cacheEntry.timestamp < CACHE_TTL) {
          console.log('[GitHubPluginRegistry] Using localStorage cached registry');
          this.cache = cacheEntry;
          return cacheEntry.data.plugins;
        }
      }
    } catch (error) {
      console.warn('[GitHubPluginRegistry] Failed to read cache:', error);
    }

    // Fetch from GitHub
    console.log('[GitHubPluginRegistry] Fetching registry from GitHub...');
    try {
      const response = await this.fetchWithRetry(REGISTRY_URL, 3);
      const data: RegistryResponse = await response.json();

      // Update cache
      const cacheEntry: CacheEntry = {
        data,
        timestamp: Date.now(),
      };
      this.cache = cacheEntry;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));

      console.log(`[GitHubPluginRegistry] Fetched ${data.plugins.length} plugins`);
      return data.plugins;
    } catch (error) {
      console.error('[GitHubPluginRegistry] Failed to fetch registry:', error);
      // Return cached data even if expired, better than nothing
      if (this.cache) {
        console.warn('[GitHubPluginRegistry] Using expired cache as fallback');
        return this.cache.data.plugins;
      }
      throw error;
    }
  }

  /**
   * Download a plugin from GitHub
   */
  async downloadPlugin(id: string): Promise<Blob> {
    const plugins = await this.fetchRegistry();
    const plugin = plugins.find(p => p.id === id);

    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }

    console.log(`[GitHubPluginRegistry] Downloading plugin: ${plugin.name}`);
    // Add cache-busting parameter to force fresh download
    const url = new URL(plugin.downloadUrl);
    url.searchParams.set('_t', Date.now().toString());
    const response = await this.fetchWithRetry(url.toString(), 3);
    return await response.blob();
  }

  /**
   * Get download count for a plugin
   * Uses data from registry.json
   */
  async getDownloadCount(id: string): Promise<number> {
    const plugins = await this.fetchRegistry();
    const plugin = plugins.find(p => p.id === id);
    return plugin?.downloads ?? 0;
  }

  /**
   * Get ratings for a plugin
   * Uses data from registry.json
   */
  async getRatings(id: string): Promise<PluginRatings> {
    const plugins = await this.fetchRegistry();
    const plugin = plugins.find(p => p.id === id);

    if (!plugin) {
      return {
        rating: 0,
        reviewCount: 0,
      };
    }

    return {
      rating: plugin.rating,
      reviewCount: plugin.reviewCount,
    };
  }

  /**
   * Get manifest for a plugin
   */
  async getManifest(id: string): Promise<any> {
    const plugins = await this.fetchRegistry();
    const plugin = plugins.find(p => p.id === id);

    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }

    console.log(`[GitHubPluginRegistry] Fetching manifest for: ${plugin.name}`);
    // Add cache-busting parameter to force fresh download
    const url = new URL(plugin.manifestUrl);
    url.searchParams.set('_t', Date.now().toString());
    const response = await this.fetchWithRetry(url.toString(), 3);
    return await response.json();
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(
    url: string,
    retries: number,
    backoff: number = 1000
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        if (i === retries - 1) throw error;

        const delay = backoff * Math.pow(2, i); // Exponential backoff
        console.warn(`[GitHubPluginRegistry] Retry ${i + 1}/${retries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Failed after all retries');
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    localStorage.removeItem(CACHE_KEY);
    console.log('[GitHubPluginRegistry] Cache cleared');
  }
}

// Singleton instance
export const gitHubPluginRegistry = new GitHubPluginRegistry();
