/**
 * Map Settings Registry
 * Allows plugins to inject custom sections into MapSettings panel
 */

import React from 'react';

export interface MapSettingsSection {
  id: string;
  pluginId: string;
  position?: number; // Order within MapSettings (lower = earlier)
  component: React.ComponentType<{ activeFile: any }>; // React component to render
}

/**
 * FR: Registre global des sections MapSettings (alimenté par les plugins)
 * EN: Global MapSettings sections registry (populated by plugins)
 */
const mapSettingsSectionsRegistry: Map<string, MapSettingsSection> = new Map();

/**
 * FR: Enregistrer une section MapSettings (utilisé par les plugins)
 * EN: Register a MapSettings section (used by plugins)
 */
export function registerMapSettingsSection(section: MapSettingsSection): void {
  mapSettingsSectionsRegistry.set(section.id, section);
}

/**
 * FR: Désenregistrer une section MapSettings (utilisé par les plugins)
 * EN: Unregister a MapSettings section (used by plugins)
 */
export function unregisterMapSettingsSection(sectionId: string): void {
  mapSettingsSectionsRegistry.delete(sectionId);
}

/**
 * FR: Obtenir toutes les sections triées par position
 * EN: Get all sections sorted by position
 */
export function getMapSettingsSections(): MapSettingsSection[] {
  return Array.from(mapSettingsSectionsRegistry.values())
    .sort((a, b) => (a.position || 100) - (b.position || 100));
}

/**
 * FR: Obtenir toutes les sections (pour debugging)
 * EN: Get all sections (for debugging)
 */
export function getAllMapSettingsSections(): MapSettingsSection[] {
  return Array.from(mapSettingsSectionsRegistry.values());
}
