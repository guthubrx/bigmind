/**
 * Theme Manager Plugin
 * Provides interface themes (Light/Dark)
 */

import type { IPluginContext, PluginManifest } from '@cartae/plugin-system';
import { getAllInterfaceThemes, getTheme, applyThemeToDocument } from '../../../themes/colorThemes';

export const manifest: PluginManifest = {
  id: 'com.bigmind.theme-manager',
  name: 'Theme Manager',
  version: '1.0.0',
  description:
    "Gérez les thèmes d'interface Light et Dark pour personnaliser l'apparence globale",
  longDescription: `Adaptez BigMind à votre environnement de travail et à vos préférences visuelles. Theme Manager gère l'ensemble du système de thèmes de l'interface, appliquant automatiquement les variables CSS à tous les composants.

**Un confort visuel optimal**

Travaillez de jour avec le mode Light lumineux et passez au mode Dark le soir pour préserver vos yeux. Tous les éléments de l'interface s'adaptent instantanément : panneaux, boutons, menus, nœuds. Le thème sélectionné est sauvegardé et restauré automatiquement à chaque session.`,
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'theme-manager-plugin.js',
  icon: '🌓',
  logo: '/assets/plugin-logos/theme-manager.svg',
  color: '#6366F1',
  category: 'theme',
  tags: ['theme', 'dark-mode', 'light-mode', 'appearance', 'ui'],
  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Classification
  source: 'core',
  pricing: 'free',
  featured: false,
  autoActivate: true, // Auto-activate on first launch

  // Marketing
  tagline: 'Light ou Dark, choisissez votre ambiance',
  benefits: [
    'Mode Light : interface claire pour environnement lumineux',
    'Mode Dark : réduction de la fatigue oculaire',
    'Application instantanée sur tous les composants',
    'Variables CSS automatiques pour cohérence parfaite',
    'Persistance automatique du thème sélectionné',
    'Base extensible pour créer vos propres thèmes',
  ],
  useCases: [
    'Travail de jour : utilisez le mode Light pour une interface claire',
    'Travail de nuit : passez en mode Dark pour protéger vos yeux',
    'Présentations : choisissez le thème adapté à votre écran',
    'Personnalisation : créez votre propre thème avec les variables CSS',
  ],

  // Features
  features: [
    {
      label: 'Mode Light',
      description: 'Interface claire et lumineuse pour un environnement bien éclairé',
      icon: '☀️',
    },
    {
      label: 'Mode Dark',
      description: 'Interface sombre pour réduire la fatigue oculaire en faible luminosité',
      icon: '🌙',
    },
    {
      label: 'Variables CSS globales',
      description: "Tous les composants s'adaptent automatiquement au thème sélectionné",
      icon: '🎨',
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
          description: 'Thème Light avec palette claire',
        },
        {
          type: 'added',
          description: 'Thème Dark avec palette sombre',
        },
        {
          type: 'added',
          description: 'Application automatique des variables CSS',
        },
        {
          type: 'added',
          description: 'Persistance du thème sélectionné',
        },
      ],
    },
  ],

  // Hooks
  hooks: {
    listens: ['theme.changed'], // Écoute les changements de thème
    emits: [], // N'émet pas d'événements
  },

  // UI Contributions
  uiContributions: {
    commands: ['themes.list', 'themes.get', 'themes.apply'],
    menus: ['Settings > Appearance > Theme'],
    panels: [],
    settings: true,
  },

  permissions: [],
};

export async function activate(context: IPluginContext): Promise<void> {
  // console.log('🌓 [Theme Manager] Plugin activé');

  // Register command to list all themes
  context.commands.registerCommand('themes.list', async () => getAllInterfaceThemes());

  // Register command to get a specific theme
  context.commands.registerCommand('themes.get', async (themeId: string) => {
    const theme = getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme "${themeId}" not found`);
    }
    return theme;
  });

  // Register command to apply a theme
  context.commands.registerCommand('themes.apply', async (themeId: string) => {
    const theme = getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme "${themeId}" not found`);
    }

    applyThemeToDocument(theme);
    // console.log(`🌓 [Theme Manager] Theme "${theme.name}" applied`);

    return theme;
  });

  // Listen to theme changes
  context.hooks.registerAction('theme.changed', async (_data: any) => {
    // console.log(`🌓 [Theme Manager] Theme changed:`, _data);
  });

  // const themeCount = getAllInterfaceThemes().length;
  // console.log(`🌓 [Theme Manager] ${themeCount} thèmes disponibles`);
}

export async function deactivate(): Promise<void> {
  // console.log('🌓 [Theme Manager] Plugin désactivé');
}
