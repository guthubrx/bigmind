/**
 * Palette Manager Plugin
 * Provides color palettes for nodes and tags
 */

import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';
import { getAllPalettes, getPalette } from '../themes/colorPalettes';
import { nodeStyleRegistry } from '../utils/nodeStyleRegistry';
import { getNodeColor } from '../utils/nodeColors';

export const manifest: PluginManifest = {
  id: 'com.bigmind.palette-manager',
  name: 'Palette Manager',
  version: '1.0.0',
  description: 'Gérez les palettes de couleurs pour personnaliser automatiquement vos nœuds et tags',
  longDescription: `Donnez vie à vos cartes mentales avec un système de coloration automatique intelligent. Palette Manager calcule automatiquement les couleurs de vos nœuds en fonction de leur position dans la hiérarchie et de la palette active.

**La couleur au service de la clarté**

Fini les nœuds tous blancs ou les couleurs incohérentes. Ce plugin applique automatiquement une palette harmonieuse à vos cartes mentales, rendant la structure visuelle immédiatement compréhensible. Chaque niveau de la hiérarchie se distingue naturellement, guidant l'œil et facilitant la navigation.`,
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'palette-manager-plugin.js',
  icon: '🎨',
  logo: '/assets/plugin-logos/palette-manager.svg',
  color: '#F59E0B',
  category: 'theme',
  tags: ['colors', 'palettes', 'theme', 'customization'],
  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Classification
  source: 'core',
  pricing: 'free',
  featured: false,

  // Marketing
  tagline: 'Coloration automatique intelligente',
  benefits: [
    'Calcul automatique des couleurs selon la hiérarchie',
    'Respect des couleurs manuelles existantes',
    'Contraste optimal pour la lisibilité du texte',
    'S\'intègre avec toutes les palettes disponibles',
    'API complète pour étendre le système',
    'Priorité configurable pour la composition',
  ],
  useCases: [
    'Visualiser automatiquement la structure de vos cartes mentales',
    'Maintenir une cohérence visuelle sans effort manuel',
    'Identifier rapidement les différents niveaux de profondeur',
    'Créer des cartes esthétiques pour vos présentations',
  ],

  // Features
  features: [
    {
      label: '8 Palettes prédéfinies',
      description: 'Vibrant, Pastel, Earth, Neon, Ocean, Sunset, Forest, Monochrome',
      icon: '🌈',
    },
    {
      label: '10 couleurs par palette',
      description: 'Chaque palette contient 10 couleurs harmonieuses',
      icon: '🎨',
    },
    {
      label: 'Application facile',
      description: 'Appliquez une palette à vos nœuds ou tags en un clic',
      icon: '✨',
    },
  ],

  // Changelog
  changelog: [
    {
      version: '1.0.0',
      date: '2025-01-28',
      changes: [
        {
          type: 'added',
          description: 'Palette "Vibrant" - couleurs vives et énergiques',
        },
        {
          type: 'added',
          description: 'Palette "Pastel" - couleurs douces et apaisantes',
        },
        {
          type: 'added',
          description: 'Palette "Earth" - tons naturels et terreux',
        },
        {
          type: 'added',
          description: 'Palette "Neon" - couleurs électriques et lumineuses',
        },
        {
          type: 'added',
          description: 'Palette "Ocean" - nuances de bleu et de vert',
        },
        {
          type: 'added',
          description: 'Palette "Sunset" - dégradé chaud',
        },
        {
          type: 'added',
          description: 'Palette "Forest" - verts et bruns naturels',
        },
        {
          type: 'added',
          description: 'Palette "Monochrome" - nuances de gris',
        },
      ],
    },
  ],

  // Hooks
  hooks: {
    listens: ['palette.changed'], // Écoute les changements de palette
    emits: [], // N'émet pas d'événements
  },

  // UI Contributions
  uiContributions: {
    commands: ['palettes.list', 'palettes.get', 'palettes.apply'],
    menus: ['Settings > Palettes'],
    panels: [],
    settings: true,
  },

  permissions: [],
};

let unregisterStyleComputer: (() => void) | null = null;

export async function activate(context: IPluginContext): Promise<void> {
  // eslint-disable-next-line no-console
  // console.log('🎨 [Palette Manager] Plugin activé');

  // FR: Enregistrer le calculateur de styles pour les nœuds
  // EN: Register style computer for nodes
  unregisterStyleComputer = nodeStyleRegistry.register(
    'com.bigmind.palette-manager',
    (nodeData, styleContext) => {
      // FR: Si le nœud a déjà une couleur manuelle, ne pas la remplacer
      // EN: If node already has manual color, don't replace it
      if (nodeData.style?.backgroundColor) {
        return {
          backgroundColor: nodeData.style.backgroundColor,
          textColor: nodeData.style.textColor,
        };
      }

      // FR: Calculer la couleur automatique basée sur la position dans la hiérarchie
      // EN: Calculate automatic color based on position in hierarchy
      try {
        // Get current theme - we'll use a default palette for now
        // TODO: Get the active palette from plugin storage
        const defaultTheme = {
          colors: {
            nodeBackground: '#ffffff',
            nodeText: '#000000',
          },
          palette: [
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
          ],
        };

        const autoColor = getNodeColor(
          styleContext.nodeId,
          styleContext.nodes,
          styleContext.rootId,
          defaultTheme as any
        );

        // FR: Calculer la couleur de texte optimale
        // EN: Calculate optimal text color
        const getOptimalTextColor = (bgColor: string): string => {
          // Simple luminance calculation
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
        };

        return {
          backgroundColor: autoColor,
          textColor: getOptimalTextColor(autoColor),
        };
      } catch (error) {
        console.error('[Palette Manager] Error computing node color:', error);
        return undefined;
      }
    },
    5 // Priority 5 = runs early, can be overridden by other plugins
  );

  // Register command to list all palettes
  context.commands.registerCommand('palettes.list', async () => getAllPalettes());

  // Register command to get a specific palette
  context.commands.registerCommand('palettes.get', async (paletteId: string) => {
    const palette = getPalette(paletteId);
    if (!palette) {
      throw new Error(`Palette "${paletteId}" not found`);
    }
    return palette;
  });

  // Register command to apply a palette (returns the palette for application)
  context.commands.registerCommand('palettes.apply', async (paletteId: string) => {
    const palette = getPalette(paletteId);
    if (!palette) {
      throw new Error(`Palette "${paletteId}" not found`);
    }
    // eslint-disable-next-line no-console
    // console.log(`🎨 [Palette Manager] Palette "${palette.name}" selected`);
    // TODO: Save palette selection to plugin storage
    return palette;
  });

  // Listen to palette changes
  context.hooks.registerAction('palette.changed', async (_data: any) => {
    // eslint-disable-next-line no-console
    // console.log(`🎨 [Palette Manager] Palette changed:`, _data);
    // TODO: Update colors when palette changes
  });

  // const paletteCount = getAllPalettes().length;
  // eslint-disable-next-line no-console
  // console.log(`🎨 [Palette Manager] ${paletteCount} palettes disponibles`);
  // eslint-disable-next-line no-console
  // console.log('🎨 [Palette Manager] Style computer registered');
}

export async function deactivate(): Promise<void> {
  // eslint-disable-next-line no-console
  // console.log('🎨 [Palette Manager] Plugin désactivé');

  // FR: Désenregistrer le calculateur de styles
  // EN: Unregister style computer
  if (unregisterStyleComputer) {
    unregisterStyleComputer();
    unregisterStyleComputer = null;
  }
}
