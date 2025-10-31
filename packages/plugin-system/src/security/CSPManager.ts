/**
 * Content Security Policy Manager
 * Manages CSP headers and policies for plugin isolation
 */

/* eslint-disable no-console, class-methods-use-this */

import { debugLog } from '../utils/debug';

/**
 * CSP directive
 */
export interface CSPDirective {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'frame-ancestors'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
}

/**
 * CSP policy
 */
export interface CSPPolicy {
  directives: CSPDirective;
  reportOnly?: boolean;
  reportUri?: string;
}

/**
 * CSP Manager
 */
export class CSPManager {
  private defaultPolicy: CSPPolicy;

  private pluginPolicies = new Map<string, CSPPolicy>();

  constructor() {
    // Strict default policy (secure by default)
    this.defaultPolicy = {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"], // Allow inline styles for UI
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-src': ["'none'"],
        'worker-src': ["'self'", 'blob:'],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
      reportOnly: false,
    };
  }

  /**
   * Set custom CSP policy for a plugin
   */
  setPluginPolicy(pluginId: string, policy: Partial<CSPPolicy>): void {
    const merged = this.mergeWithDefault(policy);
    this.pluginPolicies.set(pluginId, merged);
    debugLog(`[CSPManager] Set custom CSP for plugin: ${pluginId}`);
  }

  /**
   * Get CSP policy for a plugin
   */
  getPluginPolicy(pluginId: string): CSPPolicy {
    return this.pluginPolicies.get(pluginId) || this.defaultPolicy;
  }

  /**
   * Get CSP header string for a plugin
   */
  getCSPHeader(pluginId: string): string {
    const policy = this.getPluginPolicy(pluginId);
    return this.buildCSPString(policy);
  }

  /**
   * Build CSP header string from policy
   */
  private buildCSPString(policy: CSPPolicy): string {
    const directives = Object.entries(policy.directives)
      .map(([key, values]) => {
        if (!values || values.length === 0) {
          return '';
        }
        return `${key} ${values.join(' ')}`;
      })
      .filter(d => d !== '')
      .join('; ');

    if (policy.reportUri) {
      return `${directives}; report-uri ${policy.reportUri}`;
    }

    return directives;
  }

  /**
   * Merge custom policy with default
   */
  private mergeWithDefault(custom: Partial<CSPPolicy>): CSPPolicy {
    const directives: CSPDirective = {};

    // Start with default directives
    Object.entries(this.defaultPolicy.directives).forEach(([key, values]) => {
      directives[key as keyof CSPDirective] = [...(values || [])];
    });

    // Merge custom directives
    if (custom.directives) {
      Object.entries(custom.directives).forEach(([key, values]) => {
        if (values) {
          const existing = directives[key as keyof CSPDirective] || [];
          // Combine and deduplicate
          directives[key as keyof CSPDirective] = Array.from(new Set([...existing, ...values]));
        }
      });
    }

    return {
      directives,
      reportOnly: custom.reportOnly ?? this.defaultPolicy.reportOnly,
      reportUri: custom.reportUri ?? this.defaultPolicy.reportUri,
    };
  }

  /**
   * Allow network access for a plugin
   */
  allowNetworkAccess(pluginId: string, domains: string[]): void {
    const policy = this.getPluginPolicy(pluginId);
    const connectSrc = policy.directives['connect-src'] || [];
    policy.directives['connect-src'] = Array.from(new Set([...connectSrc, ...domains]));
    this.pluginPolicies.set(pluginId, policy);
    debugLog(`[CSPManager] Allowed network access for ${pluginId}:`, domains);
  }

  /**
   * Allow script source for a plugin
   */
  allowScriptSource(pluginId: string, sources: string[]): void {
    const policy = this.getPluginPolicy(pluginId);
    const scriptSrc = policy.directives['script-src'] || [];
    policy.directives['script-src'] = Array.from(new Set([...scriptSrc, ...sources]));
    this.pluginPolicies.set(pluginId, policy);
    debugLog(`[CSPManager] Allowed script sources for ${pluginId}:`, sources);
  }

  /**
   * Create sandbox CSP (strict isolation)
   */
  createSandboxPolicy(): CSPPolicy {
    return {
      directives: {
        'default-src': ["'none'"],
        'script-src': ["'self'", 'blob:'],
        'style-src': ["'unsafe-inline'"],
        'img-src': ['data:', 'blob:'],
        'connect-src': ["'none'"],
        'worker-src': ["'self'", 'blob:'],
      },
      reportOnly: false,
    };
  }

  /**
   * Apply CSP to iframe
   */
  applyToIframe(iframe: HTMLIFrameElement, pluginId: string): void {
    const policy = this.getPluginPolicy(pluginId);
    const cspString = this.buildCSPString(policy);

    // Set CSP via meta tag in iframe
    iframe.setAttribute('csp', cspString);

    // Also set sandbox attributes
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-modals allow-popups'
    );

    debugLog(`[CSPManager] Applied CSP to iframe for plugin: ${pluginId}`);
  }

  /**
   * Validate CSP compliance
   */
  validateCompliance(pluginId: string, requestedUrl: string): boolean {
    const policy = this.getPluginPolicy(pluginId);
    const connectSrc = policy.directives['connect-src'] || [];

    // Check if URL is allowed
    const url = new URL(requestedUrl);
    const { origin } = url;

    const allowed =
      connectSrc.includes("'self'") ||
      connectSrc.includes('*') ||
      connectSrc.some(src => {
        if (src === "'self'") {
          return origin === window.location.origin;
        }
        if (src.includes('*')) {
          const pattern = src.replace(/\*/g, '.*');
          return new RegExp(pattern).test(origin);
        }
        return origin === src || origin.startsWith(src);
      });

    if (!allowed) {
      console.warn(`[CSPManager] CSP violation: ${pluginId} attempted to connect to ${origin}`);
    }

    return allowed;
  }

  /**
   * Remove plugin policy
   */
  removePolicy(pluginId: string): void {
    this.pluginPolicies.delete(pluginId);
  }

  /**
   * Get default policy
   */
  getDefaultPolicy(): CSPPolicy {
    return { ...this.defaultPolicy };
  }

  /**
   * Set default policy
   */
  setDefaultPolicy(policy: CSPPolicy): void {
    this.defaultPolicy = policy;
    debugLog('[CSPManager] Updated default CSP policy');
  }
}
