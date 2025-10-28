/**
 * Settings Registry
 * Allows plugins to inject custom settings sections dynamically
 */

import React from 'react';

export interface SettingsSection {
  id: string;
  pluginId: string;
  section: 'appearance' | 'shortcuts' | 'plugins'; // Which tab to inject into
  position?: number; // Order within the section (lower = earlier)
  component: React.ComponentType<any>; // React component to render
}

/**
 * FR: Registre global des sections de settings (alimenté par les plugins)
 * EN: Global settings sections registry (populated by plugins)
 */
const settingsSectionsRegistry: Map<string, SettingsSection> = new Map();

/**
 * FR: Enregistrer une section de settings (utilisé par les plugins)
 * EN: Register a settings section (used by plugins)
 */
export function registerSettingsSection(section: SettingsSection): void {
  settingsSectionsRegistry.set(section.id, section);
}

/**
 * FR: Désenregistrer une section de settings (utilisé par les plugins)
 * EN: Unregister a settings section (used by plugins)
 */
export function unregisterSettingsSection(sectionId: string): void {
  settingsSectionsRegistry.delete(sectionId);
}

/**
 * FR: Obtenir toutes les sections pour un onglet donné
 * EN: Get all sections for a given tab
 */
export function getSettingsSections(
  sectionType: 'appearance' | 'shortcuts' | 'plugins'
): SettingsSection[] {
  return Array.from(settingsSectionsRegistry.values())
    .filter(s => s.section === sectionType)
    .sort((a, b) => (a.position || 100) - (b.position || 100));
}

/**
 * FR: Obtenir toutes les sections (pour debugging)
 * EN: Get all sections (for debugging)
 */
export function getAllSettingsSections(): SettingsSection[] {
  return Array.from(settingsSectionsRegistry.values());
}
