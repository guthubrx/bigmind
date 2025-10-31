/**
 * Bundle Configuration
 * Configuration for plugin bundling with Vite
 * Phase 4 - Sprint 3 - CORE
 */

export interface BundleOptions {
  entry: string;
  outputDir: string;
  format: 'es' | 'cjs' | 'umd';
  external?: string[];
  globals?: Record<string, string>;
  minify?: boolean;
  sourcemap?: boolean | 'inline' | 'hidden';
  target?: string;
}

export interface BundleStats {
  size: number;
  gzipSize?: number;
  modules: number;
  chunks: number;
  assets: string[];
}

export interface BundleLimits {
  maxSize: number; // bytes
  maxModules?: number;
  maxChunks?: number;
  warnThreshold: number; // percentage (e.g., 80 = 80%)
}

/**
 * Shared external dependencies
 * These are provided by the host application
 */
export const SHARED_EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@cartae/plugin-sdk',
  'zustand',
  'zod',
] as const;

/**
 * Global names for UMD bundles
 */
export const UMD_GLOBALS: Record<string, string> = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'jsxRuntime',
  '@cartae/plugin-sdk': 'PluginSDK',
  zustand: 'zustand',
  zod: 'Zod',
};

/**
 * Default bundle limits
 */
export const DEFAULT_LIMITS: BundleLimits = {
  maxSize: 5 * 1024 * 1024, // 5 MB
  maxModules: 500,
  maxChunks: 10,
  warnThreshold: 80,
};

/**
 * BundleConfig - Manage plugin bundle configuration
 */
export class BundleConfig {
  private options: BundleOptions;

  private limits: BundleLimits;

  constructor(options: BundleOptions, limits: BundleLimits = DEFAULT_LIMITS) {
    this.options = {
      external: [...SHARED_EXTERNALS],
      minify: true,
      sourcemap: false,
      target: 'esnext',
      ...options,
      format: options.format || 'es',
    };

    this.limits = { ...DEFAULT_LIMITS, ...limits };
  }

  /**
   * Get Vite build config
   */
  getViteConfig(): Record<string, unknown> {
    return {
      build: {
        lib: {
          entry: this.options.entry,
          formats: [this.options.format],
          name: this.options.globals ? Object.keys(this.options.globals)[0] : undefined,
        },
        outDir: this.options.outputDir,
        rollupOptions: {
          external: this.options.external,
          output: {
            globals: this.options.format === 'umd' ? this.options.globals : undefined,
          },
        },
        minify: this.options.minify,
        sourcemap: this.options.sourcemap,
        target: this.options.target,
      },
    };
  }

  /**
   * Validate bundle against limits
   */
  validateBundle(stats: BundleStats): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check size
    if (stats.size > this.limits.maxSize) {
      errors.push(
        `Bundle size ${this.formatBytes(stats.size)} exceeds limit ${this.formatBytes(this.limits.maxSize)}`
      );
    } else if (stats.size > this.limits.maxSize * (this.limits.warnThreshold / 100)) {
      warnings.push(
        `Bundle size ${this.formatBytes(stats.size)} is ${this.limits.warnThreshold}% of limit ${this.formatBytes(this.limits.maxSize)}`
      );
    }

    // Check modules
    if (this.limits.maxModules && stats.modules > this.limits.maxModules) {
      errors.push(`Module count ${stats.modules} exceeds limit ${this.limits.maxModules}`);
    }

    // Check chunks
    if (this.limits.maxChunks && stats.chunks > this.limits.maxChunks) {
      errors.push(`Chunk count ${stats.chunks} exceeds limit ${this.limits.maxChunks}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get bundle options
   */
  getOptions(): BundleOptions {
    return { ...this.options };
  }

  /**
   * Get bundle limits
   */
  getLimits(): BundleLimits {
    return { ...this.limits };
  }

  /**
   * Update external dependencies
   */
  addExternal(pkg: string): void {
    if (!this.options.external) {
      this.options.external = [];
    }

    if (!this.options.external.includes(pkg)) {
      this.options.external.push(pkg);
    }
  }

  /**
   * Add UMD global
   */
  addGlobal(pkg: string, globalName: string): void {
    if (!this.options.globals) {
      this.options.globals = {};
    }

    this.options.globals[pkg] = globalName;
  }

  /**
   * Enable tree shaking
   */
  enableTreeShaking(): void {
    // Tree shaking is enabled by default in Vite
    // This is a placeholder for explicit configuration
  }

  /**
   * Enable code splitting
   */
  enableCodeSplitting(chunks: Record<string, string[]>): void {
    // Placeholder for manual chunk configuration
    // Would be added to rollupOptions.output.manualChunks
  }

  /**
   * Format bytes to human-readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Generate bundle report
   */
  generateReport(stats: BundleStats): string {
    const validation = this.validateBundle(stats);

    let report = '# Bundle Report\n\n';
    report += `## Statistics\n`;
    report += `- Size: ${this.formatBytes(stats.size)}\n`;

    if (stats.gzipSize) {
      report += `- Gzipped: ${this.formatBytes(stats.gzipSize)}\n`;
    }

    report += `- Modules: ${stats.modules}\n`;
    report += `- Chunks: ${stats.chunks}\n`;
    report += `- Assets: ${stats.assets.length}\n\n`;

    report += `## Validation\n`;
    report += `- Status: ${validation.valid ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `- Errors: ${validation.errors.length}\n`;
    report += `- Warnings: ${validation.warnings.length}\n\n`;

    if (validation.errors.length > 0) {
      report += `### Errors\n`;
      for (const error of validation.errors) {
        report += `- ❌ ${error}\n`;
      }
      report += '\n';
    }

    if (validation.warnings.length > 0) {
      report += `### Warnings\n`;
      for (const warning of validation.warnings) {
        report += `- ⚠️ ${warning}\n`;
      }
      report += '\n';
    }

    return report;
  }
}

/**
 * Create bundle config
 */
export function createBundleConfig(options: BundleOptions, limits?: BundleLimits): BundleConfig {
  return new BundleConfig(options, limits);
}

/**
 * Get default plugin bundle config
 */
export function getDefaultPluginConfig(entry: string, outputDir: string): BundleConfig {
  return new BundleConfig({
    entry,
    outputDir,
    format: 'es',
    external: [...SHARED_EXTERNALS],
    minify: true,
    sourcemap: false,
    target: 'esnext',
  });
}
