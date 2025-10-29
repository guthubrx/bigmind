/**
 * Manifest Validator Tests
 * Phase 4 - Sprint 1
 */

import { describe, it, expect } from 'vitest';
import {
  validateManifest,
  validateForPublication,
  validateCompatibility,
  isCorePlugin,
  isPaidPlugin,
  getValidationSummary,
  formatValidationMessages,
  validateManifests,
} from '../ManifestValidator';
import type { PluginManifest } from '@bigmind/plugin-system';

describe('ManifestValidator', () => {
  const validManifest: PluginManifest = {
    id: 'com.example.plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: 'Test Author',
    main: './dist/index.js',
    license: 'MIT',
    repository: 'https://github.com/example/plugin',
    category: 'productivity',
  };

  describe('validateManifest', () => {
    it('should validate correct manifest', () => {
      const result = validateManifest(validManifest);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object manifest', () => {
      const result = validateManifest(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ message: expect.stringContaining('object') })
      );
    });

    it('should reject manifest without required fields', () => {
      const invalidManifest = {
        id: 'test',
        // Missing name, version, etc.
      };

      const result = validateManifest(invalidManifest);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid ID format', () => {
      const manifest = {
        ...validManifest,
        id: 'INVALID_ID', // Should be lowercase
      };

      const result = validateManifest(manifest);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid version format', () => {
      const manifest = {
        ...validManifest,
        version: 'not-semver',
      };

      const result = validateManifest(manifest);

      expect(result.valid).toBe(false);
    });

    it('should warn about missing recommended fields', () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test',
        version: '1.0.0',
        description: 'Test',
        author: 'Test',
        main: './index.js',
        // Missing icon, category, license, etc.
      };

      const result = validateManifest(manifest);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate manifest with distribution', () => {
      const manifest = {
        ...validManifest,
        distribution: {
          registry: 'https://registry.bigmind.app',
          cdn: 'https://cdn.bigmind.app/plugins',
          integrity: {
            sig: 'base64signature',
            pubKeyId: 'dev:test@example.com',
          },
          sbom: 'sbom.json',
        },
      };

      const result = validateManifest(manifest);

      expect(result.valid).toBe(true);
    });

    it('should warn when no integrity signature', () => {
      const manifest = {
        ...validManifest,
        distribution: {
          registry: 'https://registry.bigmind.app',
          // No integrity
        },
      };

      const result = validateManifest(manifest);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'distribution.integrity',
          message: expect.stringContaining('signature'),
        })
      );
    });

    it('should warn when no SBOM', () => {
      const manifest = {
        ...validManifest,
        distribution: {
          registry: 'https://registry.bigmind.app',
          // No SBOM
        },
      };

      const result = validateManifest(manifest);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'distribution.sbom',
          message: expect.stringContaining('SBOM'),
        })
      );
    });

    it('should warn for HTTP URLs', () => {
      const manifest = {
        ...validManifest,
        distribution: {
          registry: 'http://insecure.registry.com',
        },
      };

      const result = validateManifest(manifest);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'distribution.registry',
          message: expect.stringContaining('HTTP'),
        })
      );
    });
  });

  describe('validateForPublication', () => {
    it('should require distribution for publication', () => {
      const result = validateForPublication(validManifest);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'distribution',
          message: expect.stringContaining('required for publication'),
        })
      );
    });

    it('should require signature for publication', () => {
      const manifest = {
        ...validManifest,
        distribution: {
          registry: 'https://registry.bigmind.app',
          // No signature
        },
      };

      const result = validateForPublication(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('signature'),
        })
      );
    });

    it('should require license for publication', () => {
      const manifest = {
        ...validManifest,
        license: undefined,
        distribution: {
          registry: 'https://registry.bigmind.app',
          integrity: {
            sig: 'base64sig',
          },
        },
      };

      const result = validateForPublication(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'license',
        })
      );
    });

    it('should require repository or homepage for publication', () => {
      const manifest = {
        ...validManifest,
        repository: undefined,
        homepage: undefined,
        distribution: {
          registry: 'https://registry.bigmind.app',
          integrity: {
            sig: 'base64sig',
          },
        },
      };

      const result = validateForPublication(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'repository',
        })
      );
    });

    it('should accept valid publication manifest', () => {
      const manifest = {
        ...validManifest,
        distribution: {
          registry: 'https://registry.bigmind.app',
          integrity: {
            sig: 'base64signature',
            pubKeyId: 'dev:test@example.com',
          },
        },
      };

      const result = validateForPublication(manifest);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateCompatibility', () => {
    it('should accept compatible version', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        bigmindVersion: '^1.0.0',
      };

      const isCompatible = validateCompatibility(manifest, '1.5.0');
      expect(isCompatible).toBe(true);
    });

    it('should accept when no version constraint', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        bigmindVersion: undefined,
      };

      const isCompatible = validateCompatibility(manifest, '1.0.0');
      expect(isCompatible).toBe(true);
    });

    it('should reject incompatible major version', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        bigmindVersion: '^1.0.0',
      };

      const isCompatible = validateCompatibility(manifest, '2.0.0');
      expect(isCompatible).toBe(false);
    });
  });

  describe('isCorePlugin', () => {
    it('should identify core plugin by source', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        source: 'core',
      };

      expect(isCorePlugin(manifest)).toBe(true);
    });

    it('should identify core plugin by ID prefix', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        id: 'com.bigmind.export-manager',
      };

      expect(isCorePlugin(manifest)).toBe(true);
    });

    it('should identify community plugin', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        id: 'com.example.plugin',
        source: 'community',
      };

      expect(isCorePlugin(manifest)).toBe(false);
    });
  });

  describe('isPaidPlugin', () => {
    it('should identify paid plugin', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        pricing: 'paid',
      };

      expect(isPaidPlugin(manifest)).toBe(true);
    });

    it('should identify freemium plugin', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        pricing: 'freemium',
      };

      expect(isPaidPlugin(manifest)).toBe(true);
    });

    it('should identify free plugin', () => {
      const manifest: PluginManifest = {
        ...validManifest,
        pricing: 'free',
      };

      expect(isPaidPlugin(manifest)).toBe(false);
    });
  });

  describe('getValidationSummary', () => {
    it('should return success message for valid manifest', () => {
      const result = validateManifest(validManifest);
      const summary = getValidationSummary(result);

      expect(summary).toContain('valid');
    });

    it('should mention warnings', () => {
      const manifest = {
        ...validManifest,
        icon: undefined,
      };

      const result = validateManifest(manifest);
      const summary = getValidationSummary(result);

      expect(summary).toContain('warning');
    });

    it('should mention errors', () => {
      const result = validateManifest({ id: 'test' });
      const summary = getValidationSummary(result);

      expect(summary).toContain('invalid');
      expect(summary).toContain('error');
    });
  });

  describe('formatValidationMessages', () => {
    it('should format errors with emoji', () => {
      const manifest = { id: 'INVALID' };
      const result = validateManifest(manifest);
      const messages = formatValidationMessages(result);

      expect(messages.some((msg) => msg.startsWith('❌'))).toBe(true);
    });

    it('should format warnings with emoji', () => {
      const manifest = {
        ...validManifest,
        icon: undefined,
      };

      const result = validateManifest(manifest);
      const messages = formatValidationMessages(result);

      expect(messages.some((msg) => msg.startsWith('⚠️'))).toBe(true);
    });

    it('should include field names', () => {
      const manifest = { id: 'test' };
      const result = validateManifest(manifest);
      const messages = formatValidationMessages(result);

      expect(messages.some((msg) => msg.includes('['))).toBe(true);
    });
  });

  describe('validateManifests', () => {
    it('should validate multiple manifests', () => {
      const manifests = [
        validManifest,
        { ...validManifest, id: 'com.example.plugin2' },
      ];

      const results = validateManifests(manifests);

      expect(results.size).toBe(2);
      expect(results.get('com.example.plugin')?.valid).toBe(true);
      expect(results.get('com.example.plugin2')?.valid).toBe(true);
    });

    it('should handle invalid manifests', () => {
      const manifests = [validManifest, { invalid: 'manifest' }];

      const results = validateManifests(manifests);

      expect(results.size).toBe(1); // Only valid manifest with ID
    });

    it('should handle empty array', () => {
      const results = validateManifests([]);
      expect(results.size).toBe(0);
    });
  });
});
