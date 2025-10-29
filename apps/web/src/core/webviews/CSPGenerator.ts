/**
 * Content Security Policy Generator
 * Generates secure CSP headers for plugin webviews
 */

import type { CSPConfig } from './types';

/**
 * Default CSP configuration for plugin webviews
 */
const DEFAULT_CSP: CSPConfig = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // unsafe-inline needed for styled-components
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
};

/**
 * Allowed CDN domains for common libraries
 */
const ALLOWED_CDNS = [
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/**
 * Generate CSP header string
 */
export function generateCSP(customCSP?: Partial<CSPConfig>): string {
  const config: CSPConfig = {
    ...DEFAULT_CSP,
    ...customCSP,
  };

  const directives: string[] = [];

  for (const [directive, values] of Object.entries(config)) {
    directives.push(`${directive} ${values.join(' ')}`);
  }

  return directives.join('; ');
}

/**
 * Generate CSP with CDN allowlist
 */
export function generateCSPWithCDNs(customCSP?: Partial<CSPConfig>): string {
  const withCDNs: Partial<CSPConfig> = {
    ...customCSP,
    'script-src': [...(customCSP?.['script-src'] || DEFAULT_CSP['script-src']), ...ALLOWED_CDNS],
    'style-src': [...(customCSP?.['style-src'] || DEFAULT_CSP['style-src']), ...ALLOWED_CDNS],
  };

  return generateCSP(withCDNs);
}

/**
 * Validate CSP directive value
 */
export function isValidCSPValue(value: string): boolean {
  // Check for common XSS bypasses
  if (value === "'unsafe-eval'") return false;
  if (value.includes('data:') && value.includes('script')) return false;

  return true;
}
