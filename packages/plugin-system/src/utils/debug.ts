/**
 * Debug logging utilities for plugin system
 * Set DEBUG_PLUGINS=true in localStorage to enable verbose logging
 */

const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('DEBUG_PLUGINS') === 'true';
  } catch {
    return false;
  }
};

export const debugLog = (message: string, ...args: any[]): void => {
  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
};

export const enableDebug = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('DEBUG_PLUGINS', 'true');
    // eslint-disable-next-line no-console
    console.log('Plugin debug logging enabled. Reload to see all logs.');
  }
};

export const disableDebug = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('DEBUG_PLUGINS');
    // eslint-disable-next-line no-console
    console.log('Plugin debug logging disabled.');
  }
};
