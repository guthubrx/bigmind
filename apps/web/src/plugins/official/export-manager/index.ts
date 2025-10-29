/**
 * Export Manager Plugin
 * Handles file export in various formats
 */

import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';
import { useOpenFiles } from '../../../hooks/useOpenFiles';
import { useViewport } from '../../../hooks/useViewport';
import { useCanvasOptions } from '../../../hooks/useCanvasOptions';
import { useTagStore } from '../tags-manager/hooks/useTagStore';
import JSZip from 'jszip';

export const manifest: PluginManifest = {
  id: 'com.bigmind.export-manager',
  name: 'Export Manager',
  version: '1.0.0',
  description: 'Exportez vos mind maps dans tous les formats populaires',
  /* eslint-disable max-len */
  longDescription: `Partagez et sauvegardez vos cartes mentales en toute simplicité grâce à un moteur d'export universel et intelligent. Export Manager garantit que toutes vos données - styles, tags, notes - sont parfaitement préservées lors de l'exportation.

**Vos données, partout où vous en avez besoin**

Travaillez en toute sérénité : vos cartes peuvent être exportées au format XMind pour collaborer avec d'autres outils, ou sauvegardées avec toutes les métadonnées BigMind intactes. Le système de sidecar intelligent préserve absolument toutes vos personnalisations, même les fonctionnalités avancées de BigMind que XMind ne supporte pas nativement.`,
  /* eslint-enable max-len */
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'export-manager-plugin.js',

  // Visual identity
  icon: '📤',
  logo: '/assets/plugin-logos/export-manager.svg',
  color: '#10B981',

  // Classification
  category: 'export',
  tags: ['export', 'save', 'xmind', 'interoperability', 'backup'],
  source: 'official',
  autoActivate: true, // Auto-activate (essential for export functionality)
  pricing: 'free',

  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Marketing
  tagline: 'Exportez sans compromis',
  benefits: [
    'Export XMind natif avec compatibilité totale',
    'Préservation automatique de tous les styles et tags',
    'Métadonnées BigMind embarquées (sidecar JSON)',
    'Sauvegarde complète du viewport et des options',
    "Aucune perte de données lors de l'export/import",
    'Commande rapide accessible depuis le menu',
  ],
  useCases: [
    'Partager des cartes avec des utilisateurs XMind',
    'Créer des sauvegardes complètes de vos projets',
    'Migrer entre BigMind et XMind sans perte',
    'Archiver des cartes avec toutes leurs métadonnées',
    "Collaborer en utilisant XMind comme format d'échange",
  ],

  // Features
  features: [
    {
      label: 'Export XMind',
      description: 'Exportez vos cartes au format XMind avec sidecar BigMind intégré',
      icon: '📁',
    },
    {
      label: 'Préservation des données',
      description: "Tous les overlays (notes, styles, tags) sont préservés lors de l'export",
      icon: '💾',
    },
    {
      label: 'Export avec métadonnées',
      description: 'Inclut viewport, options canvas, et tags dans le fichier',
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
          description: 'Export au format XMind (.xmind)',
        },
        {
          type: 'added',
          description: "Intégration du sidecar bigmind.json dans l'archive",
        },
        {
          type: 'added',
          description: 'Sauvegarde automatique des tags et associations',
        },
      ],
    },
  ],

  // Hooks
  hooks: {
    listens: [], // Ne listen aucun événement
    emits: ['export.started', 'export.completed', 'export.failed'], // Émet lors des exports
  },

  // UI Contributions
  uiContributions: {
    commands: ['export.xmind'],
    menus: ['File > Export > XMind', 'Toolbar > Save'],
    panels: [],
    settings: false,
  },

  permissions: [],
};

export async function activate(context: IPluginContext): Promise<void> {
  // console.log('📤 [Export Manager] Plugin activé');

  // Register XMind export command
  context.commands.registerCommand('export.xmind', async () => {
    const active = useOpenFiles.getState().getActiveFile();

    if (!active || !active.content) {
      throw new Error('Aucun fichier actif à exporter');
    }

    // Emit start event
    await context.hooks.doAction('export.started', {
      format: 'xmind',
      filename: active.name,
    });

    try {
      const zip = new JSZip();

      // Build topic tree recursively
      const buildTopic = (id: string): any => {
        const n = active.content.nodes[id];
        if (!n) return null;
        return {
          id: n.id,
          title: n.title,
          notes: n.notes ? { plain: n.notes } : undefined,
          style: n.style,
          children:
            n.children && n.children.length > 0
              ? { attached: n.children.map(buildTopic).filter(Boolean) }
              : undefined,
        };
      };

      // Create content.json
      const json = [{ class: 'sheet', rootTopic: buildTopic(active.content.rootNode.id) }];
      zip.file('content.json', JSON.stringify(json, null, 2));

      // Create bigmind.json sidecar
      try {
        const overlay: any = { nodes: {} };
        Object.values(active.content.nodes).forEach((n: any) => {
          overlay.nodes[n.id] = { title: n.title, notes: n.notes, style: n.style };
        });
        overlay.options = {
          zoom: useViewport.getState().zoom,
          nodesDraggable: useCanvasOptions.getState().nodesDraggable,
        };

        // Save tags from unified store
        overlay.tags = useTagStore.getState().export();

        zip.file('bigmind.json', JSON.stringify(overlay, null, 2));
      } catch (e) {
        console.warn('[Export Manager] Error creating sidecar:', e);
      }

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${active.name.replace(/\.xmind$/i, '')}.xmind`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 0);

      // console.log('📤 [Export Manager] Export XMind réussi');

      // Emit success event
      await context.hooks.doAction('export.completed', {
        format: 'xmind',
        filename: a.download,
      });
    } catch (error) {
      console.error('📤 [Export Manager] Export failed:', error);

      // Emit failure event
      await context.hooks.doAction('export.failed', {
        format: 'xmind',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  });

  // console.log('📤 [Export Manager] Commande export.xmind enregistrée');
}

export async function deactivate(): Promise<void> {
  // console.log('📤 [Export Manager] Plugin désactivé');
}
