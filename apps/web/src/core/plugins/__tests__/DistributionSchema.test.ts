/**
 * Distribution Schema Tests
 * Phase 4 - Sprint 1
 */

import { describe, it, expect } from 'vitest';
import {
  PluginDistributionSchema,
  IntegritySchema,
  validateDistribution,
  validateManifestWithDistribution,
  hasDistribution,
  hasIntegritySignature,
  getDistribution,
} from '../DistributionSchema';

describe('DistributionSchema', () => {
  describe('IntegritySchema', () => {
    it('should validate valid integrity config', () => {
      const integrity = {
        sig: 'base64signature',
        pubKeyId: 'dev:john@example.com',
        hash: 'sha256hash',
        algorithm: 'ed25519' as const,
      };

      const result = IntegritySchema.safeParse(integrity);
      expect(result.success).toBe(true);
    });

    it('should allow optional fields', () => {
      const integrity = {
        algorithm: 'ed25519' as const,
      };

      const result = IntegritySchema.safeParse(integrity);
      expect(result.success).toBe(true);
    });

    it('should reject invalid algorithm', () => {
      const integrity = {
        algorithm: 'invalid',
      };

      const result = IntegritySchema.safeParse(integrity);
      expect(result.success).toBe(false);
    });
  });

  describe('PluginDistributionSchema', () => {
    it('should validate complete distribution config', () => {
      const distribution = {
        registry: 'https://registry.bigmind.app',
        cdn: 'https://cdn.bigmind.app/plugins',
        integrity: {
          sig: 'base64sig',
          pubKeyId: 'dev:test@example.com',
          hash: 'sha256hash',
          algorithm: 'ed25519' as const,
        },
        sbom: 'sbom.json',
        provenance: 'https://provenance.bigmind.app/attestation',
        assets: ['icon.png', 'README.md'],
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
        channel: 'stable' as const,
      };

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(true);
    });

    it('should validate minimal distribution', () => {
      const distribution = {
        registry: 'https://registry.bigmind.app',
      };

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(true);
    });

    it('should reject invalid registry URL', () => {
      const distribution = {
        registry: 'not-a-url',
      };

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(false);
    });

    it('should reject invalid CDN URL', () => {
      const distribution = {
        cdn: 'not-a-url',
      };

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(false);
    });

    it('should reject invalid provenance URL', () => {
      const distribution = {
        provenance: 'not-a-url',
      };

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(false);
    });

    it('should reject invalid channel', () => {
      const distribution = {
        channel: 'invalid-channel',
      };

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(false);
    });

    it('should default channel to stable', () => {
      const distribution = {};

      const result = PluginDistributionSchema.safeParse(distribution);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.channel).toBe('stable');
      }
    });
  });

  describe('validateDistribution', () => {
    it('should return success for valid distribution', () => {
      const distribution = {
        registry: 'https://registry.bigmind.app',
        cdn: 'https://cdn.bigmind.app/plugins',
      };

      const result = validateDistribution(distribution);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid distribution', () => {
      const distribution = {
        registry: 'invalid-url',
      };

      const result = validateDistribution(distribution);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('validateManifestWithDistribution', () => {
    it('should validate manifest with distribution', () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        main: './dist/index.js',
        distribution: {
          registry: 'https://registry.bigmind.app',
        },
      };

      const result = validateManifestWithDistribution(manifest);

      expect(result.success).toBe(true);
    });

    it('should validate manifest without distribution', () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        main: './dist/index.js',
      };

      const result = validateManifestWithDistribution(manifest);

      expect(result.success).toBe(true);
    });

    it('should reject invalid manifest ID', () => {
      const manifest = {
        id: 'INVALID_ID', // Should be lowercase
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        main: './dist/index.js',
      };

      const result = validateManifestWithDistribution(manifest);

      expect(result.success).toBe(false);
    });

    it('should reject invalid version', () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: 'invalid', // Should be semver
        description: 'A test plugin',
        author: 'Test Author',
        main: './dist/index.js',
      };

      const result = validateManifestWithDistribution(manifest);

      expect(result.success).toBe(false);
    });

    it('should accept valid semver with prerelease', () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0-beta.1',
        description: 'A test plugin',
        author: 'Test Author',
        main: './dist/index.js',
      };

      const result = validateManifestWithDistribution(manifest);

      expect(result.success).toBe(true);
    });
  });

  describe('hasDistribution', () => {
    it('should return true when distribution exists', () => {
      const manifest = {
        distribution: {
          registry: 'https://registry.bigmind.app',
        },
      };

      expect(hasDistribution(manifest)).toBe(true);
    });

    it('should return false when no distribution', () => {
      const manifest = {};
      expect(hasDistribution(manifest)).toBe(false);
    });

    it('should return false when distribution is null', () => {
      const manifest = {
        distribution: null,
      };

      expect(hasDistribution(manifest)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(hasDistribution(null)).toBe(false);
      expect(hasDistribution('string')).toBe(false);
      expect(hasDistribution(123)).toBe(false);
    });
  });

  describe('hasIntegritySignature', () => {
    it('should return true when signature exists', () => {
      const manifest = {
        distribution: {
          integrity: {
            sig: 'base64signature',
          },
        },
      };

      expect(hasIntegritySignature(manifest)).toBe(true);
    });

    it('should return false when no integrity', () => {
      const manifest = {
        distribution: {},
      };

      expect(hasIntegritySignature(manifest)).toBe(false);
    });

    it('should return false when no distribution', () => {
      const manifest = {};
      expect(hasIntegritySignature(manifest)).toBe(false);
    });

    it('should return false when no signature field', () => {
      const manifest = {
        distribution: {
          integrity: {
            hash: 'sha256hash',
          },
        },
      };

      expect(hasIntegritySignature(manifest)).toBe(false);
    });
  });

  describe('getDistribution', () => {
    it('should extract distribution', () => {
      const manifest = {
        id: 'test',
        distribution: {
          registry: 'https://registry.bigmind.app',
          channel: 'beta' as const,
        },
      };

      const distribution = getDistribution(manifest);

      expect(distribution).toBeDefined();
      expect(distribution?.registry).toBe('https://registry.bigmind.app');
      expect(distribution?.channel).toBe('beta');
    });

    it('should return null when no distribution', () => {
      const manifest = { id: 'test' };
      expect(getDistribution(manifest)).toBeNull();
    });

    it('should return null for invalid input', () => {
      expect(getDistribution(null)).toBeNull();
      expect(getDistribution('string')).toBeNull();
    });
  });
});
