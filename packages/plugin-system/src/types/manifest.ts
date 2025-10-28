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
  description: string; // Short description
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

  // Optional metadata
  icon?: string; // Icon URL or path
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];

  // WordPress-like rich metadata
  category?: 'productivity' | 'integration' | 'theme' | 'developer' | 'export' | 'template';
  tags?: string[];
  screenshots?: string[];
  documentation?: string;

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
