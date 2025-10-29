/**
 * Plugin manifest - metadata and configuration
 * Inspired by VS Code extensions and Chrome extensions
 */

import type { Permission } from '../permissions/types';

export interface PluginManifest {
  // Core metadata
  id: string; // Unique identifier (e.g., "com.example.myplugin")
  name: string; // Display name
  version: string; // Semantic version (e.g., "1.0.0")
  description: string; // Short description (1-2 lignes)
  longDescription?: string; // Description marketing longue (markdown supporté)
  author:
    | string
    | {
        name: string;
        email?: string;
        url?: string;
      };

  // Compatibility
  bigmindVersion?: string; // e.g., "^1.0.0" (semver range)

  // Entry points
  main: string; // Entry file path (e.g., "./dist/index.js")

  // Permissions requested
  permissions?: Permission[];

  // Visual identity
  icon?: string; // Icon URL or path (recommandé: SVG)
  logo?: string; // Logo haute résolution pour la page de détails
  color?: string; // Couleur principale du plugin (hex)
  banner?: string; // Image de bannière pour la page de détails

  // Classification & Discovery
  category?: 'productivity' | 'integration' | 'theme' | 'developer' | 'export' | 'template';
  tags?: string[];
  source?: 'core' | 'community' | 'enterprise'; // Source du plugin
  pricing?: 'free' | 'paid' | 'freemium'; // Modèle économique
  featured?: boolean; // Plugin mis en avant
  autoActivate?: boolean; // Auto-activer au premier lancement (défaut: false)

  // Marketplace metadata
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  screenshots?: string[];
  documentation?: string;
  rating?: number; // Note moyenne (0-5)
  downloads?: number; // Nombre de téléchargements
  reviewCount?: number; // Nombre d'avis

  // Content marketing
  tagline?: string; // Accroche courte (1 phrase)
  benefits?: string[]; // Liste des bénéfices pour l'utilisateur
  useCases?: string[]; // Cas d'usage typiques

  // Features list (what the plugin does)
  features?: PluginFeature[];

  // Changelog
  changelog?: ChangelogEntry[];

  // Hooks/Events
  hooks?: {
    listens?: string[]; // Events this plugin listens to
    emits?: string[]; // Events this plugin emits
  };

  // UI contributions summary
  uiContributions?: {
    menus?: string[];
    pages?: string[];
    panels?: string[];
    commands?: string[];
    settings?: boolean;
  };

  // Plugin capabilities
  contributes?: {
    commands?: CommandContribution[];
    menus?: MenuContribution[];
    themes?: ThemeContribution[];
    templates?: TemplateContribution[];
    fileFormats?: FileFormatContribution[];
  };

  // Phase 4: Distribution & Security
  distribution?: PluginDistribution;
}

/**
 * Plugin distribution configuration
 * Phase 4 - Storage & Distribution
 */
export interface PluginDistribution {
  // Registry configuration
  registry?: string; // URL of the registry (e.g., "https://registry.bigmind.app")
  cdn?: string; // CDN base URL (e.g., "https://cdn.bigmind.app/plugins")

  // Security & Integrity
  integrity?: {
    sig?: string; // Ed25519 signature (base64)
    pubKeyId?: string; // Public key ID (e.g., "dev:john@example.com")
    hash?: string; // SHA-256 hash of the package
    algorithm?: 'ed25519' | 'rsa'; // Signature algorithm
  };

  // Supply Chain Security
  sbom?: string; // Path to SBOM file (CycloneDX/SPDX)
  provenance?: string; // SLSA provenance attestation URL

  // Assets
  assets?: string[]; // Additional assets to distribute (icons, docs, etc.)

  // Dependencies
  dependencies?: Record<string, string>; // External dependencies with versions
  peerDependencies?: Record<string, string>; // Peer dependencies

  // Publishing metadata
  publishedAt?: string; // ISO date of publication
  publishedBy?: string; // Publisher identifier
  channel?: 'stable' | 'beta' | 'alpha'; // Release channel

  // License & Compliance
  licenseFile?: string; // Path to LICENSE file
  notices?: string; // Path to NOTICES file (third-party licenses)
}

/**
 * Plugin feature description
 */
export interface PluginFeature {
  label: string;
  description: string;
  icon?: string;
}

/**
 * Changelog entry
 */
export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'fixed' | 'changed' | 'removed' | 'security';
    description: string;
  }[];
}

/**
 * Command contribution
 */
export interface CommandContribution {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  shortcut?: string;
}

/**
 * Menu contribution
 */
export interface MenuContribution {
  id: string;
  location: 'context' | 'toolbar' | 'menubar' | 'statusbar';
  when?: string; // Condition (e.g., "viewType == 'mindmap'")
  group?: string;
  order?: number;
}

/**
 * Theme contribution
 */
export interface ThemeContribution {
  id: string;
  label: string;
  type: 'light' | 'dark' | 'highContrast';
  path: string;
}

/**
 * Template contribution
 */
export interface TemplateContribution {
  id: string;
  name: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  path: string;
}

/**
 * File format contribution
 */
export interface FileFormatContribution {
  id: string;
  name: string;
  extensions: string[]; // e.g., [".xmind", ".mm"]
  mimeTypes?: string[];
  export?: boolean;
  import?: boolean;
}
