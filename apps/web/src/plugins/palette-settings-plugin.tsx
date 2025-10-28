/**
 * Palette Settings Plugin
 * Injects palette selection UI into the Settings page and MapSettings panel
 */

import React from 'react';
import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';
import { registerSettingsSection, unregisterSettingsSection } from '../utils/settingsRegistry';
import {
  registerMapSettingsSection,
  unregisterMapSettingsSection,
} from '../utils/mapSettingsRegistry';
import { getAllPalettes } from '../themes/colorPalettes';
import PaletteSelector from '../components/PaletteSelector';
import { useAppSettings } from '../hooks/useAppSettings';
import { useOpenFiles } from '../hooks/useOpenFiles';

/**
 * FR: Composant de section Settings pour les palettes
 * EN: Settings section component for palettes
 */
function PaletteSettingsSection() {
  const allPalettes = getAllPalettes();
  const defaultNodePaletteId = useAppSettings(s => s.defaultNodePaletteId);
  const setDefaultNodePalette = useAppSettings(s => s.setDefaultNodePalette);
  const defaultTagPaletteId = useAppSettings(s => s.defaultTagPaletteId);
  const setDefaultTagPalette = useAppSettings(s => s.setDefaultTagPalette);

  // Si aucune palette n'est disponible, ne rien afficher
  if (allPalettes.length === 0) {
    return null;
  }

  return (
    <>
      {/* FR: Séparateur */}
      {/* EN: Separator */}
      <hr className="settings-separator" />

      {/* FR: Palette par défaut pour les nœuds */}
      {/* EN: Default palette for nodes */}
      <div className="settings-field">
        <span className="settings-label">Palette par défaut des nœuds</span>
        <div style={{ flex: 1 }}>
          <PaletteSelector
            palettes={allPalettes}
            value={defaultNodePaletteId}
            onChange={setDefaultNodePalette}
            aria-label="Sélectionner une palette pour les nœuds"
          />
        </div>
      </div>

      {/* FR: Palette par défaut pour les tags */}
      {/* EN: Default palette for tags */}
      <div className="settings-field">
        <span className="settings-label">Palette par défaut des tags</span>
        <div style={{ flex: 1 }}>
          <PaletteSelector
            palettes={allPalettes}
            value={defaultTagPaletteId}
            onChange={setDefaultTagPalette}
            aria-label="Sélectionner une palette pour les tags"
          />
        </div>
      </div>
    </>
  );
}

/**
 * FR: Composant de section MapSettings pour les palettes (spécifiques à la carte)
 * EN: MapSettings section component for palettes (map-specific)
 */
interface PaletteMapSettingsSectionProps {
  activeFile: any;
}

function PaletteMapSettingsSection({ activeFile }: PaletteMapSettingsSectionProps) {
  const allPalettes = getAllPalettes();
  const defaultNodePaletteId = useAppSettings(s => s.defaultNodePaletteId);
  const defaultTagPaletteId = useAppSettings(s => s.defaultTagPaletteId);
  const updateNodePalette = useOpenFiles(state => state.updateActiveFileNodePalette);
  const updateTagPalette = useOpenFiles(state => state.updateActiveFileTagPalette);

  // Si aucune palette n'est disponible, ne rien afficher
  if (allPalettes.length === 0) {
    return null;
  }

  // FR: Utiliser les palettes de la carte ou les palettes par défaut
  // EN: Use map palettes or default palettes
  const currentNodePaletteId = activeFile.content?.nodePaletteId || defaultNodePaletteId;
  const currentTagPaletteId = activeFile.content?.tagPaletteId || defaultTagPaletteId;

  const handleNodePaletteChange = (paletteId: string) => {
    updateNodePalette(paletteId);
  };

  const handleTagPaletteChange = (paletteId: string) => {
    updateTagPalette(paletteId);
  };

  return (
    <div className="map-settings-section">
      <h4 className="map-settings-section-title">Palettes de couleurs</h4>

      <div className="map-settings-field">
        <div className="map-settings-label">Palette des nœuds</div>
        <PaletteSelector
          palettes={allPalettes}
          value={currentNodePaletteId}
          onChange={handleNodePaletteChange}
          aria-label="Palette des nœuds de cette carte"
        />
        {!activeFile.content?.nodePaletteId && (
          <span className="map-settings-hint">Par défaut</span>
        )}
      </div>

      <div className="map-settings-field">
        <div className="map-settings-label">Palette des tags</div>
        <PaletteSelector
          palettes={allPalettes}
          value={currentTagPaletteId}
          onChange={handleTagPaletteChange}
          aria-label="Palette des tags de cette carte"
        />
        {!activeFile.content?.tagPaletteId && <span className="map-settings-hint">Par défaut</span>}
      </div>
    </div>
  );
}

export const manifest: PluginManifest = {
  id: 'com.bigmind.palette-settings',
  name: 'Palette Settings',
  version: '1.0.0',
  description: 'Ajoute les options de sélection de palettes dans les paramètres',
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'palette-settings-plugin.js',
  icon: '🎨',
  category: 'theme',
  tags: ['settings', 'palettes', 'ui', 'appearance'],
  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Features
  features: [
    {
      label: 'Injection UI dynamique',
      description: "Ajoute les sélecteurs de palette dans l'onglet Apparence des paramètres",
      icon: '⚙️',
    },
    {
      label: 'Gestion des palettes',
      description: 'Permet de choisir la palette par défaut pour les nœuds et les tags',
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
          description: 'Section Settings pour la sélection de palettes',
        },
        {
          type: 'added',
          description: "Injection dynamique dans l'onglet Apparence",
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
    panels: [],
    settings: true, // This plugin contributes to settings
  },

  permissions: [],
};

export async function activate(_context: IPluginContext): Promise<void> {
  // console.log('🎨 [Palette Settings] Plugin activé');

  // Register Settings section (global defaults)
  registerSettingsSection({
    id: 'palette-settings-section',
    pluginId: manifest.id,
    section: 'appearance',
    position: 50, // After theme/minimap settings
    component: PaletteSettingsSection,
  });

  // Register MapSettings section (map-specific palettes)
  registerMapSettingsSection({
    id: 'palette-map-settings-section',
    pluginId: manifest.id,
    position: 10, // Before node style settings
    component: PaletteMapSettingsSection,
  });

  // console.log('🎨 [Palette Settings] Sections injectées dans Settings et MapSettings');
}

export async function deactivate(): Promise<void> {
  // console.log('🎨 [Palette Settings] Plugin désactivé');

  // Unregister settings sections
  unregisterSettingsSection('palette-settings-section');
  unregisterMapSettingsSection('palette-map-settings-section');

  // console.log('🎨 [Palette Settings] Sections retirées de Settings et MapSettings');
}
