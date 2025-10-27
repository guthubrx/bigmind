/**
 * Analytics Plugin Example
 * Demonstrates plugin with multiple permissions
 */

import type { Plugin, PluginManifest, PluginContext } from '@bigmind/plugin-system';

const manifest: PluginManifest = {
  id: 'com.bigmind.analytics',
  name: 'Plugin Analytics',
  version: '1.0.0',
  description: 'Analyse et collecte des statistiques sur vos mindmaps (exemple)',
  author: 'BigMind Team',
  main: 'analytics-plugin.js',
  permissions: ['mindmap:read', 'storage:read', 'storage:write'],
  hooks: ['mindmap.nodeCreated', 'mindmap.nodeUpdated', 'mindmap.nodeDeleted'],
};

export class AnalyticsPlugin implements Plugin {
  manifest = manifest;

  private context: PluginContext | null = null;

  private stats = {
    nodesCreated: 0,
    nodesUpdated: 0,
    nodesDeleted: 0,
  };

  async activate(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('📊 Analytics Plugin activated!');

    // Load previous stats from storage
    try {
      const saved = await context.api.storage.get('analytics-stats');
      if (saved) {
        this.stats = JSON.parse(saved);
        console.log('📈 Loaded stats:', this.stats);
      }
    } catch (error) {
      console.log('ℹ️ No previous stats found');
    }

    // Track node creation
    context.registerHook('mindmap.nodeCreated', async data => {
      this.stats.nodesCreated += 1;
      await this.saveStats();
      console.log('📊 Stats updated:', this.stats);
      return data;
    });

    // Track node updates
    context.registerHook('mindmap.nodeUpdated', async data => {
      this.stats.nodesUpdated += 1;
      await this.saveStats();
      return data;
    });

    // Track node deletion
    context.registerHook('mindmap.nodeDeleted', async data => {
      this.stats.nodesDeleted += 1;
      await this.saveStats();
      return data;
    });
  }

  private async saveStats(): Promise<void> {
    if (!this.context) return;
    try {
      await this.context.api.storage.set('analytics-stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('❌ Failed to save stats:', error);
    }
  }

  async deactivate(): Promise<void> {
    console.log('🛑 Analytics Plugin deactivated');
    console.log('📊 Final stats:', this.stats);
    this.context = null;
  }
}

export default new AnalyticsPlugin();
