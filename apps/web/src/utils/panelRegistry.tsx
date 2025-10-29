/**
 * Panel Registry
 * Allows plugins to inject custom panels into DockableLayout
 */

import React from 'react';

export interface PanelDefinition {
  id: string;
  pluginId: string;
  name: string; // Display name in tab
  component: React.ComponentType<any>; // React component to render
  icon?: React.ComponentType<any>; // Optional icon component
  badge?: () => number | null; // Optional badge count function
  enableClose?: boolean; // Allow closing the tab
  defaultPosition?: 'left' | 'right' | 'bottom'; // Suggested position in layout
}

/**
 * FR: Registre global des panneaux (alimenté par les plugins)
 * EN: Global panels registry (populated by plugins)
 */
const panelsRegistry: Map<string, PanelDefinition> = new Map();

/**
 * FR: Listeners pour les changements de registre
 * EN: Listeners for registry changes
 */
const listeners: Set<() => void> = new Set();

/**
 * FR: Notifier les listeners d'un changement
 * EN: Notify listeners of a change
 */
function notifyChange(): void {
  listeners.forEach(listener => listener());
}

/**
 * FR: S'abonner aux changements du registre
 * EN: Subscribe to registry changes
 */
export function onPanelRegistryChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * FR: Enregistrer un panneau (utilisé par les plugins)
 * EN: Register a panel (used by plugins)
 */
export function registerPanel(panel: PanelDefinition): void {
  panelsRegistry.set(panel.id, panel);
  notifyChange();
}

/**
 * FR: Désenregistrer un panneau (utilisé par les plugins)
 * EN: Unregister a panel (used by plugins)
 */
export function unregisterPanel(panelId: string): void {
  panelsRegistry.delete(panelId);
  notifyChange();
}

/**
 * FR: Obtenir tous les panneaux
 * EN: Get all panels
 */
export function getAllPanels(): PanelDefinition[] {
  return Array.from(panelsRegistry.values());
}

/**
 * FR: Obtenir un panneau par son ID
 * EN: Get a panel by its ID
 */
export function getPanel(panelId: string): PanelDefinition | undefined {
  return panelsRegistry.get(panelId);
}

/**
 * FR: Vérifier si un panneau existe
 * EN: Check if a panel exists
 */
export function hasPanel(panelId: string): boolean {
  return panelsRegistry.has(panelId);
}
