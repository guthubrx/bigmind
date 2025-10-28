/**
 * Event Monitor Plugin
 * Captures all system events for debugging and monitoring
 */

import type { IPluginContext, PluginManifest } from '@bigmind/plugin-system';

// Global event store for the monitor
export interface EventLogEntry {
  id: string;
  timestamp: number;
  type: string;
  category: string;
  data: any;
}

class EventMonitorStore {
  private events: EventLogEntry[] = [];
  private maxEvents = 1000;
  private listeners: Set<(events: EventLogEntry[]) => void> = new Set();

  addEvent(type: string, category: string, data: any) {
    const entry: EventLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      category,
      data,
    };

    this.events.unshift(entry);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Notify listeners
    this.notifyListeners();
  }

  getEvents(): EventLogEntry[] {
    return [...this.events];
  }

  clear() {
    this.events = [];
    this.notifyListeners();
  }

  subscribe(listener: (events: EventLogEntry[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.events]));
  }

  setMaxEvents(max: number) {
    this.maxEvents = max;
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
      this.notifyListeners();
    }
  }
}

// Export singleton instance
export const eventMonitorStore = new EventMonitorStore();

// Plugin manifest
export const manifest: PluginManifest = {
  id: 'com.bigmind.event-monitor',
  name: 'Event Monitor',
  version: '1.0.0',
  description: 'Capture et affiche tous les événements système pour le debug',
  author: 'BigMind Team',
  main: 'event-monitor-plugin.js',
  permissions: [],
};

// Plugin initialization
export async function activate(context: IPluginContext): Promise<void> {
  console.log('🔍 [Event Monitor] Plugin activé');

  // Note: UI is directly integrated in Settings.tsx for now
  // Future: use context.ui.registerPanel() when UI registry is fully implemented
  console.log('🔍 [Event Monitor] Interface UI disponible dans Settings > Plugins > Panels');

  // Register actions for all event categories
  const eventCategories = [
    // Node events
    { hook: 'mindmap.nodeCreated', category: 'nodes' },
    { hook: 'mindmap.nodeUpdated', category: 'nodes' },
    { hook: 'mindmap.nodeDeleted', category: 'nodes' },
    { hook: 'mindmap.nodeSelected', category: 'nodes' },
    { hook: 'mindmap.nodeStyleChanged', category: 'nodes' },

    // File events
    { hook: 'file.created', category: 'files' },
    { hook: 'file.opened', category: 'files' },
    { hook: 'file.closed', category: 'files' },
    { hook: 'file.activated', category: 'files' },
    { hook: 'file.sheetChanged', category: 'files' },

    // Viewport events
    { hook: 'viewport.changed', category: 'viewport' },

    // Color events
    { hook: 'palette.changed', category: 'colors' },
    { hook: 'colors.applied', category: 'colors' },
    { hook: 'theme.changed', category: 'colors' },

    // Settings events
    { hook: 'settings.changed', category: 'settings' },

    // Canvas events
    { hook: 'canvas.optionChanged', category: 'canvas' },

    // Tag events
    { hook: 'tag.created', category: 'tags' },
    { hook: 'tag.deleted', category: 'tags' },
    { hook: 'tag.visibilityChanged', category: 'tags' },
    { hook: 'tag.nodeTagged', category: 'tags' },
    { hook: 'tag.nodeUntagged', category: 'tags' },
  ];

  // Register all event listeners
  eventCategories.forEach(({ hook, category }) => {
    context.hooks.registerAction(hook, async (data: any) => {
      eventMonitorStore.addEvent(hook, category, data);
    });
  });

  console.log(
    `🔍 [Event Monitor] Surveillance de ${eventCategories.length} types d'événements`
  );
}

export async function deactivate(): Promise<void> {
  console.log('🔍 [Event Monitor] Plugin désactivé');
  eventMonitorStore.clear();
}
