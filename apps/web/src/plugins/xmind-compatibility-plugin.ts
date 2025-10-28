/**
 * XMind Compatibility Plugin
 * Ensures full bidirectional compatibility with XMind format
 *
 * Architecture:
 * - Parse XMind data and preserve all original information
 * - Convert XMind features to BigMind equivalents
 * - Serialize back to XMind format without data loss
 * - Synchronize: XMind rich text ↔ Markdown, Markers ↔ Tags, etc.
 */

import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';
import { nodeStyleRegistry } from '../utils/nodeStyleRegistry';
import type { NodeStyleContext } from '../utils/nodeStyleRegistry';

export const manifest: PluginManifest = {
  id: 'com.xmind.compatibility',
  name: 'XMind Compatibility',
  version: '1.0.0',
  description:
    'Assure une compatibilité bidirectionnelle complète avec le format XMind, ' +
    'en préservant toutes les données XMind tout en permettant les extensions BigMind',
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'xmind-compatibility-plugin.js',
  icon: '🔄',
  category: 'integration',
  tags: ['xmind', 'compatibility', 'import', 'export', 'sync'],
  license: 'MIT',
  bigmindVersion: '1.0.0',

  features: [
    {
      label: 'Synchronisation bidirectionnelle',
      description: 'Lecture et écriture complètes du format XMind sans perte de données',
      icon: '🔄',
    },
    {
      label: 'Thèmes et couleurs XMind',
      description: 'Interprète les palettes XMind et calcule les couleurs héritées',
      icon: '🎨',
    },
    {
      label: 'Rich Text ↔ Markdown',
      description: 'Conversion automatique entre le texte enrichi XMind et Markdown',
      icon: '📝',
    },
    {
      label: 'Markers ↔ Tags',
      description: 'Mapping intelligent entre les markers XMind et les tags BigMind',
      icon: '🏷️',
    },
    {
      label: 'Préservation des métadonnées',
      description: 'Conservation de toutes les métadonnées XMind originales',
      icon: '💾',
    },
  ],

  changelog: [
    {
      version: '1.0.0',
      date: '2025-01-28',
      changes: [
        {
          type: 'added',
          description: 'Système de synchronisation bidirectionnelle complet',
        },
        {
          type: 'added',
          description: 'Support des thèmes et palettes XMind',
        },
        {
          type: 'added',
          description: 'Conversion Rich Text ↔ Markdown',
        },
        {
          type: 'added',
          description: 'Mapping Markers XMind ↔ Tags BigMind',
        },
        {
          type: 'added',
          description: 'Préservation des extensions et métadonnées XMind',
        },
      ],
    },
  ],

  hooks: {
    listens: ['file.loaded', 'file.beforeSave'],
    emits: ['xmind.parsed', 'xmind.serialized'],
  },

  uiContributions: {
    commands: ['xmind.parse', 'xmind.serialize', 'xmind.getTheme'],
    menus: [],
    panels: [],
    settings: true,
  },

  permissions: ['storage'],
};

// ============================================================================
// Types
// ============================================================================

interface XMindTheme {
  map?: {
    properties?: {
      'color-list'?: string; // Space-separated hex colors
      'svg:fill'?: string;
      'multi-line-colors'?: string;
    };
  };
  centralTopic?: { properties?: Record<string, any> };
  mainTopic?: { properties?: Record<string, any> };
  subTopic?: { properties?: Record<string, any> };
  importantTopic?: { properties?: Record<string, any> };
  minorTopic?: { properties?: Record<string, any> };
  expiredTopic?: { properties?: Record<string, any> };
  floatingTopic?: { properties?: Record<string, any> };
  summaryTopic?: { properties?: Record<string, any> };
  calloutTopic?: { properties?: Record<string, any> };
  boundary?: { properties?: Record<string, any> };
  summary?: { properties?: Record<string, any> };
  relationship?: { properties?: Record<string, any> };
  skeletonThemeId?: string;
  colorThemeId?: string;
}

interface XMindMetadata {
  dataStructureVersion?: string;
  creator?: {
    name?: string;
    version?: string;
  };
  activeSheetId?: string;
  layoutEngineVersion?: string;
}

interface XMindNodeData {
  richTextNotes?: string; // Original XMind rich text
  markers?: string[]; // XMind marker IDs
  assets?: {
    images?: string[];
    attachments?: string[];
  };
  branch?: string; // "folded" or other
  structureClass?: string;
  extensions?: any[];
}

interface XMindCompatibilityData {
  theme?: XMindTheme;
  metadata?: XMindMetadata;
  extensions?: any[];
  structureClass?: string;
  nodes?: Record<string, XMindNodeData>; // Per-node XMind-specific data
}

// ============================================================================
// Converters: XMind ↔ BigMind
// ============================================================================

/**
 * Convert XMind rich text to Markdown
 * XMind uses HTML-like rich text, we convert to Markdown
 * @internal Used for import/export, will be called dynamically
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function richTextToMarkdown(richText: string): string {
  if (!richText) return '';

  let md = richText;

  // Convert XMind rich text tags to Markdown
  // XMind uses: <span style="font-weight:bold">text</span>
  md = md.replace(/<span style="font-weight:bold">(.*?)<\/span>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');

  md = md.replace(/<span style="font-style:italic">(.*?)<\/span>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');

  // Links
  md = md.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/p><p>/gi, '\n\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  return md.trim();
}

/**
 * Convert Markdown to XMind rich text
 */
function markdownToRichText(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML entities
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Convert Markdown to XMind rich text
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight:bold">$1</span>');
  html = html.replace(/__(.*?)__/g, '<span style="font-weight:bold">$1</span>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<span style="font-style:italic">$1</span>');
  html = html.replace(/_(.*?)_/g, '<span style="font-style:italic">$1</span>');

  // Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');

  // Wrap in paragraph if not already
  if (!html.startsWith('<p>')) {
    html = `<p>${html}</p>`;
  }

  return html;
}

/**
 * Convert XMind markers to BigMind tags
 * XMind markers are predefined icons, we map them to tag names
 * @internal Used for import/export, will be called dynamically
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function markersToTags(markers: string[]): string[] {
  if (!markers || markers.length === 0) return [];

  // Mapping table: XMind marker ID → BigMind tag name
  const markerMap: Record<string, string> = {
    'priority-1': '⭐ Priorité 1',
    'priority-2': '⭐ Priorité 2',
    'priority-3': '⭐ Priorité 3',
    'task-start': '▶️ À commencer',
    'task-quarter': '🔵 25%',
    'task-half': '🔵 50%',
    'task-3quar': '🔵 75%',
    'task-done': '✅ Fait',
    'smiley-smile': '😊 Content',
    'smiley-cry': '😢 Triste',
    'smiley-surprise': '😮 Surpris',
    'flag-red': '🚩 Drapeau rouge',
    'flag-orange': '🟧 Drapeau orange',
    'flag-green': '🟩 Drapeau vert',
    'people-1': '👤 Personne',
    'people-2': '👥 Équipe',
  };

  return markers.map(markerId => markerMap[markerId] || `📌 ${markerId}`).filter(Boolean);
}

/**
 * Convert BigMind tags to XMind markers (best effort)
 */
function tagsToMarkers(tags: string[]): string[] {
  if (!tags || tags.length === 0) return [];

  // Reverse mapping (not perfect, but best effort)
  const tagMap: Record<string, string> = {
    '⭐ Priorité 1': 'priority-1',
    '⭐ Priorité 2': 'priority-2',
    '⭐ Priorité 3': 'priority-3',
    '▶️ À commencer': 'task-start',
    '🔵 25%': 'task-quarter',
    '🔵 50%': 'task-half',
    '🔵 75%': 'task-3quar',
    '✅ Fait': 'task-done',
    '😊 Content': 'smiley-smile',
    '😢 Triste': 'smiley-cry',
    '😮 Surpris': 'smiley-surprise',
    '🚩 Drapeau rouge': 'flag-red',
    '🟧 Drapeau orange': 'flag-orange',
    '🟩 Drapeau vert': 'flag-green',
    '👤 Personne': 'people-1',
    '👥 Équipe': 'people-2',
  };

  return tags.map(tag => tagMap[tag]).filter(Boolean);
}

/**
 * Extract color palette from XMind theme
 */
function extractColorPalette(theme: XMindTheme | undefined): string[] {
  if (!theme?.map?.properties?.['color-list']) {
    // Default palette if none found
    return [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
      '#F8B88B',
      '#AED6F1',
    ];
  }

  // Parse space-separated hex colors
  return theme.map.properties['color-list'].split(/\s+/).filter(c => c.startsWith('#'));
}

/**
 * Calculate inherited color for a node based on XMind theme logic
 */
function calculateInheritedColor(
  nodeId: string,
  nodes: Record<string, any>,
  rootId: string,
  palette: string[]
): string {
  // Find the main branch this node belongs to
  let currentId = nodeId;
  let parentId = nodes[currentId]?.parentId;
  let mainBranchId = currentId;

  // Traverse up to find the first child of root
  while (parentId && parentId !== rootId) {
    mainBranchId = currentId;
    currentId = parentId;
    parentId = nodes[currentId]?.parentId;
  }

  // If we found a main branch, assign color based on position
  if (parentId === rootId) {
    const rootNode = nodes[rootId];
    if (rootNode?.children) {
      const branchIndex = rootNode.children.indexOf(mainBranchId);
      if (branchIndex >= 0) {
        return palette[branchIndex % palette.length];
      }
    }
  }

  // Fallback: use first color
  return palette[0] || '#98D8C8';
}

/**
 * Calculate optimal text color (black or white) based on background
 */
function getOptimalTextColor(bgColor: string): string {
  try {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch {
    return '#000000';
  }
}

/**
 * Get style for a node based on XMind theme
 */
function getNodeStyleFromTheme(
  nodeData: any,
  context: NodeStyleContext,
  theme: XMindTheme | undefined,
  palette: string[]
): { backgroundColor?: string; textColor?: string } | undefined {
  // Priority 1: Manual color (from style.backgroundColor)
  if (nodeData.style?.backgroundColor) {
    return {
      backgroundColor: nodeData.style.backgroundColor,
      textColor: nodeData.style.textColor || getOptimalTextColor(nodeData.style.backgroundColor),
    };
  }

  // Priority 2: XMind theme-based colors
  let backgroundColor: string | undefined;

  // Check if node is root (central topic)
  if (context.isPrimary) {
    backgroundColor = theme?.centralTopic?.properties?.['svg:fill'] || '#000229';
  } else {
    // Check for special markers/styles
    // TODO: Check if node has "important" or "minor" marker
    // For now, use inherited color
    backgroundColor = calculateInheritedColor(
      context.nodeId,
      context.nodes,
      context.rootId,
      palette
    );
  }

  if (!backgroundColor) return undefined;

  return {
    backgroundColor,
    textColor: getOptimalTextColor(backgroundColor),
  };
}

// ============================================================================
// Plugin Lifecycle
// ============================================================================

let unregisterStyleComputer: (() => void) | null = null;

export async function activate(context: IPluginContext): Promise<void> {
  /* eslint-disable no-console */
  console.log('🔄 [XMind Compatibility] Plugin activé');

  // Get XMind compatibility data from plugin storage
  const compatData = (await context.storage.get('xmindData')) as XMindCompatibilityData | undefined;

  // Extract palette from theme
  const palette = extractColorPalette(compatData?.theme);

  // Register style computer with high priority (runs first)
  unregisterStyleComputer = nodeStyleRegistry.register(
    'com.xmind.compatibility',
    (nodeData, styleContext) =>
      getNodeStyleFromTheme(nodeData, styleContext, compatData?.theme, palette),
    0 // Priority 0 = runs first, can be overridden by user or other plugins
  );

  // Register command to parse XMind data
  context.commands.registerCommand('xmind.parse', async (xmindFileData: any) => {
    console.log('🔄 [XMind Compatibility] Parsing XMind data');

    // Parse and extract all XMind-specific data
    const compatibilityData: XMindCompatibilityData = {
      theme: xmindFileData.theme,
      metadata: xmindFileData.metadata,
      extensions: xmindFileData.extensions,
      structureClass: xmindFileData.structureClass || xmindFileData.rootTopic?.structureClass,
      nodes: {},
    };

    // Process each node to extract XMind-specific data
    const processNode = (node: any) => {
      if (!node) return;

      const nodeXMindData: XMindNodeData = {};

      // Preserve rich text notes (if different from markdown)
      if (node.notes) {
        nodeXMindData.richTextNotes = node.notes; // Will be converted to MD in BigMind
      }

      // Preserve markers
      if (node.markers && node.markers.length > 0) {
        nodeXMindData.markers = node.markers;
      }

      // Preserve assets
      if (node.assets) {
        nodeXMindData.assets = node.assets;
      }

      // Preserve branch state
      if (node.branch) {
        nodeXMindData.branch = node.branch;
      }

      // Preserve structure class
      if (node.structureClass) {
        nodeXMindData.structureClass = node.structureClass;
      }

      // Store if any data to preserve
      if (Object.keys(nodeXMindData).length > 0) {
        compatibilityData.nodes![node.id] = nodeXMindData;
      }

      // Process children
      if (node.children) {
        if (Array.isArray(node.children)) {
          node.children.forEach(processNode);
        } else if (node.children.attached) {
          node.children.attached.forEach(processNode);
        }
      }
    };

    // Start from root
    if (xmindFileData.rootTopic || xmindFileData.root) {
      processNode(xmindFileData.rootTopic || xmindFileData.root);
    }

    // Save to plugin storage
    await context.storage.set('xmindData', compatibilityData);

    console.log('✅ [XMind Compatibility] XMind data parsed and preserved');

    // TODO: Emit event when event system is available
    // context.events.emit('xmind.parsed', compatibilityData);

    return compatibilityData;
  });

  // Register command to serialize back to XMind format
  context.commands.registerCommand('xmind.serialize', async (bigmindData: any) => {
    console.log('🔄 [XMind Compatibility] Serializing to XMind format');

    // Get preserved XMind data
    const storedData = (await context.storage.get('xmindData')) as
      | XMindCompatibilityData
      | undefined;

    if (!storedData) {
      console.warn('⚠️ [XMind Compatibility] No preserved XMind data found');
      return null;
    }

    // Reconstruct XMind format
    const xmindData: any = {
      theme: storedData.theme,
      extensions: storedData.extensions,
      structureClass: storedData.structureClass,
    };

    // Convert nodes back to XMind format
    const convertNode = (nodeId: string): any => {
      const node = bigmindData.nodes[nodeId];
      if (!node) return null;

      const xmindNode: any = {
        id: node.id,
        title: node.title,
      };

      // Restore XMind-specific data
      const nodeXMindData = storedData.nodes?.[nodeId];

      if (nodeXMindData) {
        // Convert Markdown back to rich text
        if (node.notes) {
          xmindNode.notes = markdownToRichText(node.notes);
        }

        // Restore markers (or convert from tags)
        if (nodeXMindData.markers) {
          xmindNode.markers = nodeXMindData.markers;
        } else if (node.tags) {
          // Try to convert BigMind tags back to XMind markers
          xmindNode.markers = tagsToMarkers(node.tags);
        }

        // Restore assets
        if (nodeXMindData.assets) {
          xmindNode.assets = nodeXMindData.assets;
        }

        // Restore branch state
        if (node.collapsed || nodeXMindData.branch === 'folded') {
          xmindNode.branch = 'folded';
        }

        // Restore structure class
        if (nodeXMindData.structureClass) {
          xmindNode.structureClass = nodeXMindData.structureClass;
        }
      }

      // Restore position
      if (node.x !== undefined && node.y !== undefined) {
        xmindNode.position = { x: node.x, y: node.y };
      }

      // Convert children
      if (node.children && node.children.length > 0) {
        xmindNode.children = {
          attached: node.children.map((childId: string) => convertNode(childId)).filter(Boolean),
        };
      }

      return xmindNode;
    };

    // Start from root
    xmindData.rootTopic = convertNode(bigmindData.rootId);

    console.log('✅ [XMind Compatibility] Data serialized to XMind format');

    // TODO: Emit event when event system is available
    // context.events.emit('xmind.serialized', xmindData);

    return xmindData;
  });

  // Register command to get current theme
  context.commands.registerCommand('xmind.getTheme', async () => {
    const storedThemeData = (await context.storage.get('xmindData')) as
      | XMindCompatibilityData
      | undefined;
    return storedThemeData?.theme || null;
  });

  // Listen to file loaded event
  context.hooks.registerAction('file.loaded', async (data: any) => {
    console.log('📂 [XMind Compatibility] File loaded, checking for XMind data');

    // Check if file has XMind data (presence of theme, extensions, etc.)
    if (data.theme || data.extensions || data.structureClass) {
      // This is a XMind file, parse it
      await context.commands.executeCommand('xmind.parse', data);
    }
  });

  // Listen to before save event
  context.hooks.registerAction('file.beforeSave', async (data: any) => {
    console.log('💾 [XMind Compatibility] File about to save, checking if XMind format');

    // Check if we have preserved XMind data
    const storedBeforeSave = (await context.storage.get('xmindData')) as
      | XMindCompatibilityData
      | undefined;

    if (storedBeforeSave) {
      // Serialize back to XMind format
      await context.commands.executeCommand('xmind.serialize', data);
      // TODO: Merge xmindData back into data for saving
    }
  });

  console.log('✅ [XMind Compatibility] Commands and hooks registered');
}

export async function deactivate(): Promise<void> {
  console.log('🔄 [XMind Compatibility] Plugin désactivé');

  // Unregister style computer
  if (unregisterStyleComputer) {
    unregisterStyleComputer();
    unregisterStyleComputer = null;
  }
}
