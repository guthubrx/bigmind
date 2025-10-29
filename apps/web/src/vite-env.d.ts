/// <reference types="vite/client" />

/**
 * Vite environment type definitions
 */

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  /**
   * Vite's glob import feature
   * @see https://vitejs.dev/guide/features.html#glob-import
   */
  glob<T = any>(
    pattern: string,
    options?: {
      eager?: boolean;
      as?: 'raw' | 'url';
    }
  ): Record<string, T>;
}
