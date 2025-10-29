/**
 * Tags Manager Plugin
 * Provides tagging functionality for nodes including UI integration
 */

import React from 'react';
import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';
import { registerNodePropertiesTab, unregisterNodePropertiesTab } from '../../../utils/nodePropertiesRegistry';
import { registerPanel, unregisterPanel } from '../../../utils/panelRegistry';
import { useTagStore } from './hooks/useTagStore';
import { Tag } from 'lucide-react';
import NodeTagPanel from './components/NodeTagPanel';
import TagLayersPanelRCT from './components/TagLayersPanelRCT';

export const manifest: PluginManifest = {
  id: 'com.bigmind.tags-manager',
  name: 'Tags Manager',
  version: '1.0.0',
  description: 'Organisez vos idées avec un système de tags puissant et flexible',
  longDescription: `Transformez le chaos de vos mind maps en organisation structurée grâce à un système de tags hiérarchique et intelligent. Tags Manager est l'outil essentiel pour tous ceux qui gèrent des cartes mentales complexes avec des dizaines ou centaines de nœuds.

**Pourquoi les tags changent tout**

Imaginez pouvoir identifier instantanément tous les nœuds liés à un projet, une priorité ou une catégorie spécifique. Créez des hiérarchies de tags pour refléter votre taxonomie personnelle. Filtrez votre vue pour vous concentrer uniquement sur ce qui compte en ce moment. C'est comme avoir un système de classement infiniment flexible, directement intégré dans vos cartes mentales.`,
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'tags-manager-plugin.js',

  // Visual identity
  icon: '🏷️',
  logo: '/assets/plugin-logos/tags-manager.svg',
  color: '#3B82F6',

  // Classification
  category: 'productivity',
  tags: ['tags', 'organization', 'filtering', 'productivity', 'workflow'],
  source: 'core',
  pricing: 'free',
  featured: true,

  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Marketing
  tagline: 'Maîtrisez la complexité avec les tags',
  benefits: [
    'Tags hiérarchiques pour une organisation multi-niveaux',
    'Création rapide de tags directement depuis les nœuds',
    'Panneau dédié pour gérer toute votre taxonomie',
    'Filtrage visuel pour isoler les nœuds pertinents',
    'Compteurs automatiques sur chaque tag',
    'Couleurs personnalisables pour chaque tag'
  ],
  useCases: [
    'Gestion de projet : tags par statut (À faire, En cours, Terminé)',
    'Recherche : catégoriser les sources et les thématiques',
    'Apprentissage : organiser les concepts par difficulté ou priorité',
    'Brainstorming : identifier les idées prometteuses vs à creuser',
    'Documentation : structurer par type de contenu (API, Guide, Référence)'
  ],

  // Features
  features: [
    {
      label: 'Gestion des tags',
      description: 'Créer, modifier et supprimer des tags pour organiser vos nœuds',
      icon: '🏷️',
    },
    {
      label: 'Filtrage par tags',
      description: 'Filtrer la carte mentale par tags pour se concentrer sur certains nœuds',
      icon: '🔍',
    },
    {
      label: 'Panneau Organisation',
      description: 'Interface dédiée pour gérer tous les tags de votre carte',
      icon: '📋',
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
          description: 'Migration du système de tags depuis le core vers un plugin',
        },
        {
          type: 'added',
          description: 'Onglet Tags dans les propriétés du nœud',
        },
        {
          type: 'added',
          description: 'Panneau Organisation dans la barre latérale',
        },
      ],
    },
  ],

  // Hooks
  hooks: {
    listens: [],
    emits: [],
  },

  // UI Contributions
  uiContributions: {
    commands: [],
    menus: [],
    panels: ['tags-organization'], // Contributes organization panel
    settings: false,
  },

  permissions: [],
};

export async function activate(_context: IPluginContext): Promise<void> {
  // FR: Enregistrer l'onglet Tags dans NodeProperties
  // EN: Register Tags tab in NodeProperties
  registerNodePropertiesTab({
    id: 'tags',
    pluginId: manifest.id,
    label: 'Tags',
    icon: Tag,
    position: 30, // After content and style, before advanced
    component: NodeTagPanel,
    badge: (nodeId: string) => {
      // FR: Récupérer le nombre de tags du nœud depuis le store
      // EN: Get tag count for the node from the store
      const state = useTagStore.getState();
      return state.nodeTagMap[nodeId]?.size || 0;
    },
  });

  // FR: Enregistrer le panneau Organisation dans DockableLayout
  // EN: Register Organization panel in DockableLayout
  registerPanel({
    id: 'tags',
    pluginId: manifest.id,
    name: 'Organisation',
    component: TagLayersPanelRCT,
    badge: () => {
      // FR: Récupérer le nombre total de tags
      // EN: Get total tag count
      const state = useTagStore.getState();
      return Object.keys(state.tags).length;
    },
    enableClose: false,
    defaultPosition: 'right',
  });
}

export async function deactivate(): Promise<void> {
  // FR: Désenregistrer l'onglet Tags
  // EN: Unregister Tags tab
  unregisterNodePropertiesTab('tags');

  // FR: Désenregistrer le panneau Organisation
  // EN: Unregister Organization panel
  unregisterPanel('tags');
}
