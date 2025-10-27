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
