/**
 * BundleConfig Tests
 * Phase 4 - Sprint 3
 */

import { describe, it, expect } from 'vitest';
import {
  BundleConfig,
  createBundleConfig,
  getDefaultPluginConfig,
  SHARED_EXTERNALS,
  DEFAULT_LIMITS,
} from '../BundleConfig';

describe('BundleConfig', () => {
  describe('Configuration', () => {
    it('should create bundle config with defaults', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      const options = config.getOptions();
      expect(options.format).toBe('es');
      expect(options.minify).toBe(true);
      expect(options.sourcemap).toBe(false);
      expect(options.external).toContain('react');
    });

    it('should override defaults', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'umd',
        minify: false,
        sourcemap: true,
      });

      const options = config.getOptions();
      expect(options.minify).toBe(false);
      expect(options.sourcemap).toBe(true);
    });

    it('should get Vite configuration', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      const viteConfig = config.getViteConfig();
      expect(viteConfig.build).toBeDefined();
    });
  });

  describe('External Dependencies', () => {
    it('should include shared externals', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      const options = config.getOptions();
      for (const external of SHARED_EXTERNALS) {
        expect(options.external).toContain(external);
      }
    });

    it('should add custom external', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      config.addExternal('custom-lib');
      expect(config.getOptions().external).toContain('custom-lib');
    });

    it('should not add duplicate externals', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      config.addExternal('custom-lib');
      config.addExternal('custom-lib');

      const externals = config.getOptions().external || [];
      const count = externals.filter(e => e === 'custom-lib').length;
      expect(count).toBe(1);
    });
  });

  describe('Bundle Validation', () => {
    it('should validate bundle within limits', () => {
      const config = new BundleConfig(
        {
          entry: './src/index.ts',
          outputDir: './dist',
          format: 'es',
        },
        {
          maxSize: 5 * 1024 * 1024, // 5MB
          warnThreshold: 80,
        }
      );

      const result = config.validateBundle({
        size: 1 * 1024 * 1024, // 1MB
        modules: 50,
        chunks: 2,
        assets: ['index.js', 'style.css'],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect size violations', () => {
      const config = new BundleConfig(
        {
          entry: './src/index.ts',
          outputDir: './dist',
          format: 'es',
        },
        {
          maxSize: 1 * 1024 * 1024, // 1MB
          warnThreshold: 80,
        }
      );

      const result = config.validateBundle({
        size: 2 * 1024 * 1024, // 2MB (exceeds limit)
        modules: 50,
        chunks: 2,
        assets: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn when approaching limits', () => {
      const config = new BundleConfig(
        {
          entry: './src/index.ts',
          outputDir: './dist',
          format: 'es',
        },
        {
          maxSize: 10 * 1024 * 1024, // 10MB
          warnThreshold: 80,
        }
      );

      const result = config.validateBundle({
        size: 9 * 1024 * 1024, // 9MB (90% of limit)
        modules: 50,
        chunks: 2,
        assets: [],
      });

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Bundle Report', () => {
    it('should generate bundle report', () => {
      const config = new BundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      const report = config.generateReport({
        size: 1024 * 1024,
        modules: 50,
        chunks: 2,
        assets: ['index.js'],
      });

      expect(report).toContain('Bundle Report');
      expect(report).toContain('Statistics');
      expect(report).toContain('Validation');
    });
  });

  describe('Helper Functions', () => {
    it('should create config via helper', () => {
      const config = createBundleConfig({
        entry: './src/index.ts',
        outputDir: './dist',
        format: 'es',
      });

      expect(config).toBeInstanceOf(BundleConfig);
    });

    it('should get default plugin config', () => {
      const config = getDefaultPluginConfig('./src/index.ts', './dist');

      expect(config).toBeInstanceOf(BundleConfig);
      expect(config.getOptions().format).toBe('es');
      expect(config.getOptions().minify).toBe(true);
    });
  });
});
