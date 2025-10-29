/**
 * Distribution Schema Validation
 * Zod schemas for validating plugin distribution fields
 * Phase 4 - Sprint 1
 */

import { z } from 'zod';

/**
 * Integrity configuration schema
 */
export const IntegritySchema = z.object({
  sig: z.string().optional().describe('Ed25519 or RSA signature (base64)'),
  pubKeyId: z
    .string()
    .optional()
    .describe('Public key ID (e.g., "dev:john@example.com")'),
  hash: z.string().optional().describe('SHA-256 hash of the package'),
  algorithm: z.enum(['ed25519', 'rsa']).optional().default('ed25519'),
});

/**
 * Plugin distribution schema
 */
export const PluginDistributionSchema = z.object({
  // Registry configuration
  registry: z
    .string()
    .url()
    .optional()
    .describe('Registry URL (e.g., "https://registry.bigmind.app")'),

  cdn: z
    .string()
    .url()
    .optional()
    .describe('CDN base URL (e.g., "https://cdn.bigmind.app/plugins")'),

  // Security & Integrity
  integrity: IntegritySchema.optional(),

  // Supply Chain Security
  sbom: z
    .string()
    .optional()
    .describe('Path to SBOM file (CycloneDX/SPDX)'),

  provenance: z
    .string()
    .url()
    .optional()
    .describe('SLSA provenance attestation URL'),

  // Assets
  assets: z
    .array(z.string())
    .optional()
    .describe('Additional assets to distribute'),

  // Dependencies
  dependencies: z
    .record(z.string(), z.string())
    .optional()
    .describe('External dependencies with versions'),

  peerDependencies: z
    .record(z.string(), z.string())
    .optional()
    .describe('Peer dependencies'),

  // Publishing metadata
  publishedAt: z
    .string()
    .datetime()
    .optional()
    .describe('ISO date of publication'),

  publishedBy: z.string().optional().describe('Publisher identifier'),

  channel: z
    .enum(['stable', 'beta', 'alpha'])
    .optional()
    .default('stable')
    .describe('Release channel'),

  // License & Compliance
  licenseFile: z.string().optional().describe('Path to LICENSE file'),

  notices: z
    .string()
    .optional()
    .describe('Path to NOTICES file (third-party licenses)'),
});

/**
 * Extended plugin manifest schema with distribution
 */
export const PluginManifestSchema = z.object({
  // Core metadata (required)
  id: z
    .string()
    .regex(/^[a-z0-9-_.]+$/, 'ID must contain only lowercase letters, numbers, hyphens, dots, and underscores'),
  name: z.string().min(1, 'Name is required'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/, 'Version must be valid semver (e.g., "1.0.0" or "1.0.0-beta.1")'),
  description: z.string().min(1, 'Description is required'),
  author: z.union([
    z.string(),
    z.object({
      name: z.string(),
      email: z.string().email().optional(),
      url: z.string().url().optional(),
    }),
  ]),

  // Compatibility
  bigmindVersion: z.string().optional(),

  // Entry points
  main: z.string().min(1, 'Main entry point is required'),

  // Visual identity
  icon: z.string().optional(),
  logo: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  banner: z.string().optional(),

  // Classification
  category: z
    .enum(['productivity', 'integration', 'theme', 'developer', 'export', 'template'])
    .optional(),
  tags: z.array(z.string()).optional(),
  source: z.enum(['core', 'community', 'enterprise']).optional().default('community'),
  pricing: z.enum(['free', 'paid', 'freemium']).optional().default('free'),

  // Marketplace metadata
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  screenshots: z.array(z.string().url()).optional(),
  documentation: z.string().url().optional(),

  // Phase 4: Distribution
  distribution: PluginDistributionSchema.optional(),
});

/**
 * Validate distribution configuration
 */
export function validateDistribution(
  distribution: unknown
): { success: boolean; data?: z.infer<typeof PluginDistributionSchema>; errors?: string[] } {
  try {
    const result = PluginDistributionSchema.safeParse(distribution);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return { success: false, errors };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
    };
  }
}

/**
 * Validate full manifest including distribution
 */
export function validateManifestWithDistribution(
  manifest: unknown
): { success: boolean; data?: z.infer<typeof PluginManifestSchema>; errors?: string[] } {
  try {
    const result = PluginManifestSchema.safeParse(manifest);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return { success: false, errors };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
    };
  }
}

/**
 * Check if distribution fields are present
 */
export function hasDistribution(manifest: unknown): boolean {
  if (!manifest || typeof manifest !== 'object') {
    return false;
  }

  const m = manifest as Record<string, unknown>;
  return 'distribution' in m && m.distribution !== null && m.distribution !== undefined;
}

/**
 * Check if manifest has integrity signature
 */
export function hasIntegritySignature(manifest: unknown): boolean {
  if (!hasDistribution(manifest)) {
    return false;
  }

  const m = manifest as Record<string, unknown>;
  const dist = m.distribution as Record<string, unknown>;

  return (
    dist &&
    'integrity' in dist &&
    dist.integrity !== null &&
    typeof dist.integrity === 'object' &&
    'sig' in (dist.integrity as Record<string, unknown>)
  );
}

/**
 * Extract distribution from manifest
 */
export function getDistribution(
  manifest: unknown
): z.infer<typeof PluginDistributionSchema> | null {
  if (!hasDistribution(manifest)) {
    return null;
  }

  const m = manifest as Record<string, unknown>;
  return m.distribution as z.infer<typeof PluginDistributionSchema>;
}

// Type exports
export type PluginDistribution = z.infer<typeof PluginDistributionSchema>;
export type Integrity = z.infer<typeof IntegritySchema>;
export type PluginManifestWithDistribution = z.infer<typeof PluginManifestSchema>;
