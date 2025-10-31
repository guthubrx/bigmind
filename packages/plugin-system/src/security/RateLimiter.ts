/**
 * Rate Limiter - Token Bucket Algorithm
 * Prevents abuse by limiting the rate of plugin API calls
 */

/* eslint-disable no-console, max-classes-per-file */

import { debugLog } from '../utils/debug';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number; // Maximum tokens in bucket
  windowMs: number; // Refill rate (tokens per window)
  burstSize?: number; // Optional burst capacity
}

/**
 * Token Bucket Rate Limiter
 */
export class TokenBucketLimiter {
  private tokens: number;

  private lastRefill: number;

  private readonly rate: number; // Tokens per second

  private readonly capacity: number;

  constructor(config: RateLimitConfig) {
    this.capacity = config.maxRequests;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
    this.rate = config.maxRequests / (config.windowMs / 1000); // tokens/sec
  }

  /**
   * Check if request is allowed and consume a token
   */
  allow(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.rate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Reset limiter
   */
  reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

/**
 * Rate Limiter Manager
 * Manages rate limiters for multiple plugins
 */
export class RateLimiterManager {
  private limiters = new Map<string, TokenBucketLimiter>();

  private defaultConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 100 requests per minute
  };

  private customConfigs = new Map<string, RateLimitConfig>();

  /**
   * Set custom rate limit for a plugin
   */
  setPluginLimit(pluginId: string, config: RateLimitConfig): void {
    this.customConfigs.set(pluginId, config);
    // Remove existing limiter to force recreation with new config
    this.limiters.delete(pluginId);
    debugLog(
      `[RateLimiter] Set custom limit for ${pluginId}: ${config.maxRequests}/${config.windowMs}ms`
    );
  }

  /**
   * Check if request is allowed for a plugin
   */
  allow(pluginId: string): boolean {
    const limiter = this.getOrCreateLimiter(pluginId);
    const allowed = limiter.allow();

    if (!allowed) {
      console.warn(`[RateLimiter] Rate limit exceeded for plugin: ${pluginId}`);
    }

    return allowed;
  }

  /**
   * Get or create limiter for a plugin
   */
  private getOrCreateLimiter(pluginId: string): TokenBucketLimiter {
    let limiter = this.limiters.get(pluginId);

    if (!limiter) {
      const config = this.customConfigs.get(pluginId) || this.defaultConfig;
      limiter = new TokenBucketLimiter(config);
      this.limiters.set(pluginId, limiter);
    }

    return limiter;
  }

  /**
   * Get remaining tokens for a plugin
   */
  getRemaining(pluginId: string): number {
    const limiter = this.limiters.get(pluginId);
    return limiter ? Math.floor(limiter.getTokens()) : this.defaultConfig.maxRequests;
  }

  /**
   * Reset rate limit for a plugin
   */
  reset(pluginId: string): void {
    const limiter = this.limiters.get(pluginId);
    if (limiter) {
      limiter.reset();
      debugLog(`[RateLimiter] Reset rate limit for plugin: ${pluginId}`);
    }
  }

  /**
   * Remove rate limiter for a plugin
   */
  remove(pluginId: string): void {
    this.limiters.delete(pluginId);
    this.customConfigs.delete(pluginId);
  }

  /**
   * Set default rate limit configuration
   */
  setDefaultConfig(config: RateLimitConfig): void {
    this.defaultConfig = config;
  }
}
