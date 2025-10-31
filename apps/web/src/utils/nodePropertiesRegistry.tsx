/**
 * Node Properties Registry
 * Allows plugins to inject custom tabs into NodeProperties panel
 */

import React from 'react';

export interface NodePropertiesTab {
  id: string;
  pluginId: string;
  label: string; // Display name
  icon?: React.ComponentType<any>; // Optional icon component
  position?: number; // Order within tabs (lower = earlier)
  component: React.ComponentType<{ nodeId: string; node: any }>; // React component to render
  badge?: (nodeId: string, node: any) => number | null; // Optional badge count function
}

/**
 * FR: Registre global des onglets NodeProperties (alimenté par les plugins)
 * EN: Global NodeProperties tabs registry (populated by plugins)
 */
const nodePropertiesTabsRegistry: Map<string, NodePropertiesTab> = new Map();

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
export function onNodePropertiesRegistryChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * FR: Enregistrer un onglet NodeProperties (utilisé par les plugins)
 * EN: Register a NodeProperties tab (used by plugins)
 */
export function registerNodePropertiesTab(tab: NodePropertiesTab): void {
  nodePropertiesTabsRegistry.set(tab.id, tab);
  notifyChange();
}

/**
 * FR: Désenregistrer un onglet NodeProperties (utilisé par les plugins)
 * EN: Unregister a NodeProperties tab (used by plugins)
 */
export function unregisterNodePropertiesTab(tabId: string): void {
  nodePropertiesTabsRegistry.delete(tabId);
  notifyChange();
}

/**
 * FR: Obtenir tous les onglets triés par position
 * EN: Get all tabs sorted by position
 */
export function getNodePropertiesTabs(): NodePropertiesTab[] {
  return Array.from(nodePropertiesTabsRegistry.values()).sort(
    (a, b) => (a.position || 100) - (b.position || 100)
  );
}

/**
 * FR: Obtenir tous les onglets (pour debugging)
 * EN: Get all tabs (for debugging)
 */
export function getAllNodePropertiesTabs(): NodePropertiesTab[] {
  return Array.from(nodePropertiesTabsRegistry.values());
}
