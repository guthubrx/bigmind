/**
 * Palette Settings Plugin
 * Injects palette selection UI into the Settings page and MapSettings panel
 */

import React from 'react';
import type { IPluginContext, PluginManifest } from '@cartae/plugin-system';
import {
  registerSettingsSection,
  unregisterSettingsSection,
} from '../../../utils/settingsRegistry';
import {
  registerMapSettingsSection,
  unregisterMapSettingsSection,
} from '../../../utils/mapSettingsRegistry';
import { getAllPalettes } from '../../../themes/colorPalettes';
import PaletteSelector from './components/PaletteSelector';
import { useAppSettings } from '../../../hooks/useAppSettings';
import { useOpenFiles } from '../../../hooks/useOpenFiles';

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

  // Si aucune palette n'est disponible, afficher un message
  if (allPalettes.length === 0) {
    const messageJsx = (
      <>
        <hr className="settings-separator" />
        <div className="settings-field">
          <span className="settings-label">Palettes de couleurs</span>
          <div style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
            Aucune palette disponible. Activez le plugin &quot;Color Palettes Collection&quot; pour
            ajouter des palettes.
          </div>
        </div>
      </>
    );
    return messageJsx;
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
 * FR: Convertir hex en HSL pour un meilleur regroupement
 * EN: Convert hex to HSL for better grouping
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * FR: Regrouper les couleurs similaires par teinte
 * EN: Group similar colors by hue
 */
function groupColorsByHue(colors: string[]): string[] {
  if (colors.length === 0) return [];

  // Convertir en HSL
  const colorData = colors.map(hex => ({
    hex,
    hsl: hexToHsl(hex),
  }));

  // Trier par teinte
  colorData.sort((a, b) => a.hsl.h - b.hsl.h);

  // Regrouper par plages de teinte (tous les 60°)
  const groups: string[][] = [];
  let currentGroup: string[] = [];
  let lastHue = -1000;

  colorData.forEach(({ hex, hsl }) => {
    // Si la teinte est trop différente (> 30°), nouveau groupe
    if (Math.abs(hsl.h - lastHue) > 30 && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [hex];
    } else {
      currentGroup.push(hex);
    }
    lastHue = hsl.h;
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Prendre la couleur la plus saturée de chaque groupe
  const representative = groups.map(group => {
    const groupData = group.map(hex => ({ hex, hsl: hexToHsl(hex) }));
    // Trier par saturation descendante
    groupData.sort((a, b) => b.hsl.s - a.hsl.s);
    return groupData[0].hex;
  });

  return representative;
}

/**
 * FR: Extraire les couleurs de la carte et les regrouper intelligemment
 * EN: Extract colors from map and group them intelligently
 */
function extractMapColors(activeFile: any): string[] {
  if (!activeFile?.content?.nodes) {
    return [];
  }

  const colors = new Set<string>();
  Object.values(activeFile.content.nodes).forEach((node: any) => {
    if (node.style?.backgroundColor) {
      colors.add(node.style.backgroundColor);
    }
  });

  const uniqueColors = Array.from(colors);

  // Regrouper par teinte pour obtenir les couleurs de base
  return groupColorsByHue(uniqueColors);
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

  // FR: Extraire et regrouper les couleurs de la carte
  // EN: Extract and group map colors
  const mapColors = React.useMemo(() => {
    const colors = extractMapColors(activeFile);
    return colors;
  }, [activeFile]);

  // FR: Créer une palette dynamique "Palette de la carte" si des couleurs existent
  // EN: Create dynamic "Map Palette" if colors exist
  let availablePalettes = [...allPalettes];
  if (mapColors.length > 0) {
    availablePalettes = [
      {
        id: '__map__',
        name: 'Palette de la carte',
        description: `Couleurs actuellement utilisées dans cette carte (${mapColors.length})`,
        colors: mapColors,
      },
      ...allPalettes,
    ];
  }

  // Si aucune palette n'est disponible (même pas de couleurs dans la carte), afficher un message
  if (availablePalettes.length === 0) {
    return (
      <div className="map-settings-section">
        <h4 className="map-settings-section-title">Palettes de couleurs</h4>
        <div style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
          Aucune palette disponible. Activez le plugin &quot;Color Palettes Collection&quot; dans
          les paramètres, ou ajoutez des couleurs à vos nœuds.
        </div>
      </div>
    );
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
          palettes={availablePalettes}
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
          palettes={availablePalettes}
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
  description: 'Contrôlez vos palettes de couleurs depuis les paramètres',
  longDescription: `Prenez le contrôle total de l'apparence colorée de vos cartes mentales avec une interface intuitive de gestion des palettes. Ce plugin essentiel ajoute des options de configuration avancées directement dans vos paramètres.

**L'interface qu'il vous manquait**

Plus besoin de naviguer dans des menus complexes : définissez vos palettes par défaut en quelques clics. Choisissez une palette globale pour tous vos nouveaux nœuds, et une autre spécifique pour vos tags. Chaque carte peut même avoir sa propre palette dédiée.`,
  author: {
    name: 'BigMind Team',
    email: 'team@bigmind.com',
  },
  main: 'palette-settings-plugin.js',

  // Visual identity
  icon: '🎨',
  logo: '/assets/plugin-logos/palette-settings.svg',
  color: '#8B5CF6',

  // Classification
  category: 'theme',
  tags: ['settings', 'palettes', 'ui', 'configuration', 'productivity'],
  source: 'official',
  pricing: 'free',

  license: 'MIT',
  bigmindVersion: '1.0.0',

  // Marketing
  tagline: 'Gérez vos couleurs comme un pro',
  benefits: [
    'Interface centralisée dans les paramètres',
    'Palette par défaut pour tous les nouveaux nœuds',
    'Palette dédiée aux tags pour mieux les distinguer',
    'Configuration spécifique par carte mentale',
    'Aperçu en temps réel des palettes disponibles',
  ],
  useCases: [
    'Définir une identité visuelle cohérente pour tous vos projets',
    'Utiliser des couleurs différentes selon le type de carte',
    "Adapter rapidement l'ambiance d'une présentation",
    "Standardiser les couleurs au sein d'une équipe",
  ],

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
}

export async function deactivate(): Promise<void> {
  // Unregister settings sections
  unregisterSettingsSection('palette-settings-section');
  unregisterMapSettingsSection('palette-map-settings-section');
}
