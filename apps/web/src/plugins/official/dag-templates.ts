/**
 * DAG Templates Manager Plugin
 * Provides predefined DAG structure templates
 */

import type { IPluginContext, PluginManifest } from '@cartae/plugin-system';
import {
  getAllTemplates,
  getFavoriteTemplates,
  getTemplate,
  applyTemplate,
} from '../../utils/dagTemplates';

export const manifest: PluginManifest = {
  id: 'com.bigmind.dag-templates',
  name: 'DAG Templates Manager',
  version: '1.0.0',
  description: 'Gérez et appliquez des structures DAG prédéfinies pour démarrer vos projets',
  /* eslint-disable max-len */
  longDescription: `Ne partez plus jamais d'une feuille blanche. DAG Templates Manager vous permet d'appliquer en un clic des structures hiérarchiques complètes avec tags et relations déjà configurés.

**Le pouvoir des templates**

Gagnez des heures de configuration en partant de structures éprouvées. Ce plugin gère l'application des templates créés par vous ou fournis par d'autres plugins. Il sert de moteur central pour tout le système de templates de BigMind.`,
  /* eslint-enable max-len */
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'dag-templates-plugin.js',
  icon: '📋',
  logo: '/assets/plugin-logos/dag-templates.svg',
  color: '#10B981',
  category: 'template',
  tags: ['templates', 'dag', 'productivity', 'structures'],
  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Classification
  source: 'official',
  pricing: 'free',
  featured: false,
  autoActivate: true, // Auto-activate (essential for template system)

  // Marketing
  tagline: "Appliquez des structures DAG prêtes à l'emploi",
  benefits: [
    'Moteur central pour gérer tous les templates DAG',
    'Application en un clic avec préservation des données existantes',
    'Gestion des favoris pour accès rapide',
    'API complète pour créer vos propres templates',
    'Compatible avec tous les plugins de templates',
  ],
  useCases: [
    'Démarrer rapidement un nouveau projet avec une structure éprouvée',
    "Standardiser l'organisation de vos cartes mentales",
    'Réutiliser des structures qui ont fait leurs preuves',
    'Créer des bibliothèques de templates pour votre équipe',
  ],

  // Features
  features: [
    {
      label: 'Templates DAG prédéfinis',
      description:
        "3 structures prêtes à l'emploi : Taxonomie biologique, " +
        'Architecture logicielle, Processus de projet',
      icon: '📋',
    },
    {
      label: 'Application en un clic',
      description: 'Appliquez un template complet avec tags et relations hiérarchiques',
      icon: '⚡',
    },
    {
      label: 'Templates favoris',
      description: 'Marquez vos templates préférés pour y accéder rapidement',
      icon: '⭐',
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
          description: 'Template "Biological Taxonomy" avec structure hiérarchique',
        },
        {
          type: 'added',
          description: 'Template "Software Architecture" en couches',
        },
        {
          type: 'added',
          description: 'Template "Project Process" type Waterfall',
        },
        {
          type: 'added',
          description: 'Système de favoris pour templates',
        },
      ],
    },
  ],

  // Hooks
  hooks: {
    listens: [], // Ne listen aucun événement
    emits: ['template.applied'], // Émet quand un template est appliqué
  },

  // UI Contributions
  uiContributions: {
    commands: ['templates.apply', 'templates.list', 'templates.getFavorites'],
    menus: ['File > New from template'],
    panels: [],
    settings: false,
  },

  permissions: [],
};

export async function activate(context: IPluginContext): Promise<void> {
  // console.log('📋 [DAG Templates] Plugin activé');

  // Register command to list all templates
  context.commands.registerCommand('templates.list', async () => getAllTemplates());

  // Register command to get favorite templates
  context.commands.registerCommand('templates.getFavorites', async () => getFavoriteTemplates());

  // Register command to apply a template
  context.commands.registerCommand('templates.apply', async (templateId: string) => {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const result = applyTemplate(template);
    // console.log(`📋 [DAG Templates] Applied template: ${template.name}`);

    // Emit event
    await context.hooks.doAction('template.applied', {
      templateName: template.name,
      tagsCount: result.tags.length,
      linksCount: result.links.length,
    });

    return result;
  });

  // const templateCount = getAllTemplates().length;
  // console.log(`📋 [DAG Templates] ${templateCount} templates disponibles`);
}

export async function deactivate(): Promise<void> {
  // console.log('📋 [DAG Templates] Plugin désactivé');
}
