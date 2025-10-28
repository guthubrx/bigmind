/**
 * Palette Manager Plugin
 * Provides color palettes for nodes and tags
 */

import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';
import { getAllPalettes, getPalette } from '../themes/colorPalettes';

export const manifest: PluginManifest = {
  id: 'com.bigmind.palette-manager',
  name: 'Palette Manager',
  version: '1.0.0',
  description: 'Fournit des palettes de couleurs prédéfinies pour personnaliser vos nœuds et tags',
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'palette-manager-plugin.js',
  icon: '🎨',
  category: 'theme',
  tags: ['colors', 'palettes', 'theme', 'customization'],
  license: 'MIT',
  bigmindVersion: '1.0.0',

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

export async function activate(context: IPluginContext): Promise<void> {
  console.log('🎨 [Palette Manager] Plugin activé');

  // Register command to list all palettes
  context.commands.registerCommand('palettes.list', async () => {
    return getAllPalettes();
  });

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
    console.log(`🎨 [Palette Manager] Palette "${palette.name}" selected`);
    return palette;
  });

  // Listen to palette changes
  context.hooks.registerAction('palette.changed', async (data: any) => {
    console.log(`🎨 [Palette Manager] Palette changed:`, data);
  });

  const paletteCount = getAllPalettes().length;
  console.log(`🎨 [Palette Manager] ${paletteCount} palettes disponibles`);
}

export async function deactivate(): Promise<void> {
  console.log('🎨 [Palette Manager] Plugin désactivé');
}
