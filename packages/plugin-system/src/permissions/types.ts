/**
 * Permission types - what plugins can request access to
 */
export type Permission =
  // Mind map permissions
  | 'mindmap:read' // Read mind map content
  | 'mindmap:write' // Modify mind map content

  // Filesystem permissions
  | 'filesystem:read' // Read files
  | 'filesystem:write' // Write files

  // Network permissions
  | 'network' // Make HTTP requests

  // System permissions
  | 'clipboard' // Access clipboard
  | 'storage' // Use plugin storage

  // Command permissions
  | 'commands' // Register commands

  // UI permissions
  | 'ui:menu' // Add menu items
  | 'ui:panel' // Add panels
  | 'ui:statusbar' // Add statusbar items
  | 'ui:notification' // Show notifications

  // Settings permissions
  | 'settings:read' // Read app settings
  | 'settings:write' // Modify app settings

  // Native permissions (for future desktop app)
  | 'native'; // Access native APIs

/**
 * Permission metadata for display in UI
 */
export interface PermissionMetadata {
  label: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

/**
 * Permission metadata registry
 */
export const PermissionMetadataMap: Record<Permission, PermissionMetadata> = {
  'mindmap:read': {
    label: 'Read mind maps',
    description: 'Access your mind map content',
    risk: 'low',
  },
  'mindmap:write': {
    label: 'Modify mind maps',
    description: 'Create, update, and delete nodes',
    risk: 'medium',
  },
  'filesystem:read': {
    label: 'Read files',
    description: 'Read files from your computer',
    risk: 'medium',
  },
  'filesystem:write': {
    label: 'Write files',
    description: 'Create and modify files on your computer',
    risk: 'high',
  },
  network: {
    label: 'Network access',
    description: 'Make HTTP requests to external servers',
    risk: 'medium',
  },
  clipboard: {
    label: 'Clipboard access',
    description: 'Read and write to clipboard',
    risk: 'low',
  },
  storage: {
    label: 'Storage access',
    description: 'Store data locally for this plugin',
    risk: 'low',
  },
  commands: {
    label: 'Register commands',
    description: 'Add new commands to BigMind',
    risk: 'low',
  },
  'ui:menu': {
    label: 'Add menu items',
    description: 'Add items to menus',
    risk: 'low',
  },
  'ui:panel': {
    label: 'Add panels',
    description: 'Add custom panels to the UI',
    risk: 'low',
  },
  'ui:statusbar': {
    label: 'Add statusbar items',
    description: 'Add items to the status bar',
    risk: 'low',
  },
  'ui:notification': {
    label: 'Show notifications',
    description: 'Display notification messages',
    risk: 'low',
  },
  'settings:read': {
    label: 'Read settings',
    description: 'Access app settings',
    risk: 'low',
  },
  'settings:write': {
    label: 'Modify settings',
    description: 'Change app settings',
    risk: 'medium',
  },
  native: {
    label: 'Native API access',
    description: 'Access native system APIs (desktop app only)',
    risk: 'high',
  },
};
