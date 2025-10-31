/**
 * Legacy UI Adapter
 * Maintains backward compatibility with old registry APIs
 * DEPRECATED: Will be removed in v2.0.0
 */

import type { ReactNode } from 'react';

/**
 * Legacy panel registration
 * @deprecated Use declarative manifest contributions instead
 */
export interface LegacyPanelConfig {
  id: string;
  title: string;
  icon?: string;
  component: ReactNode;
  location?: 'sidebar' | 'bottom';
}

/**
 * Legacy node properties tab
 * @deprecated Use declarative manifest contributions instead
 */
export interface LegacyNodePropertiesTab {
  id: string;
  label: string;
  icon?: string;
  component: ReactNode;
  order?: number;
}

/**
 * Legacy settings section
 * @deprecated Use declarative manifest contributions instead
 */
export interface LegacySettingsSection {
  id: string;
  title: string;
  component: ReactNode;
  order?: number;
}

/**
 * Usage metrics for migration tracking
 */
interface UsageMetrics {
  registerPanel: number;
  registerNodePropertiesTab: number;
  registerSettingsSection: number;
  registerMapSettingsSection: number;
}

class LegacyUIAdapter {
  private static instance: LegacyUIAdapter;

  private panels = new Map<string, LegacyPanelConfig>();

  private nodePropertiesTabs = new Map<string, LegacyNodePropertiesTab>();

  private settingsSections = new Map<string, LegacySettingsSection>();

  private mapSettingsSections = new Map<string, LegacySettingsSection>();

  private metrics: UsageMetrics = {
    registerPanel: 0,
    registerNodePropertiesTab: 0,
    registerSettingsSection: 0,
    registerMapSettingsSection: 0,
  };

  private constructor() {}

  static getInstance(): LegacyUIAdapter {
    if (!LegacyUIAdapter.instance) {
      LegacyUIAdapter.instance = new LegacyUIAdapter();
    }
    return LegacyUIAdapter.instance;
  }

  /**
   * Register panel (legacy)
   * @deprecated Use manifest.json contributions instead
   */
  registerPanel(config: LegacyPanelConfig): () => void {
    this.logDeprecation(
      'registerPanel',
      'Use manifest.json ui.contributions.panels instead',
      'https://docs.bigmind.dev/plugins/ui-contributions#panels'
    );

    this.metrics.registerPanel++;
    this.panels.set(config.id, config);

    // Return unregister function
    return () => {
      this.panels.delete(config.id);
    };
  }

  /**
   * Register node properties tab (legacy)
   * @deprecated Use manifest.json contributions instead
   */
  registerNodePropertiesTab(config: LegacyNodePropertiesTab): () => void {
    this.logDeprecation(
      'registerNodePropertiesTab',
      'Use manifest.json ui.contributions.nodeProperties instead',
      'https://docs.bigmind.dev/plugins/ui-contributions#node-properties'
    );

    this.metrics.registerNodePropertiesTab++;
    this.nodePropertiesTabs.set(config.id, config);

    return () => {
      this.nodePropertiesTabs.delete(config.id);
    };
  }

  /**
   * Register settings section (legacy)
   * @deprecated Use manifest.json contributions instead
   */
  registerSettingsSection(config: LegacySettingsSection): () => void {
    this.logDeprecation(
      'registerSettingsSection',
      'Use manifest.json ui.contributions.settings instead',
      'https://docs.bigmind.dev/plugins/ui-contributions#settings'
    );

    this.metrics.registerSettingsSection++;
    this.settingsSections.set(config.id, config);

    return () => {
      this.settingsSections.delete(config.id);
    };
  }

  /**
   * Register map settings section (legacy)
   * @deprecated Use manifest.json contributions instead
   */
  registerMapSettingsSection(config: LegacySettingsSection): () => void {
    this.logDeprecation(
      'registerMapSettingsSection',
      'Use manifest.json ui.contributions.mapSettings instead',
      'https://docs.bigmind.dev/plugins/ui-contributions#map-settings'
    );

    this.metrics.registerMapSettingsSection++;
    this.mapSettingsSections.set(config.id, config);

    return () => {
      this.mapSettingsSections.delete(config.id);
    };
  }

  /**
   * Get all registered panels
   */
  getPanels(): LegacyPanelConfig[] {
    return Array.from(this.panels.values());
  }

  /**
   * Get all node properties tabs
   */
  getNodePropertiesTabs(): LegacyNodePropertiesTab[] {
    return Array.from(this.nodePropertiesTabs.values());
  }

  /**
   * Get all settings sections
   */
  getSettingsSections(): LegacySettingsSection[] {
    return Array.from(this.settingsSections.values());
  }

  /**
   * Get all map settings sections
   */
  getMapSettingsSections(): LegacySettingsSection[] {
    return Array.from(this.mapSettingsSections.values());
  }

  /**
   * Get usage metrics
   */
  getMetrics(): UsageMetrics {
    return { ...this.metrics };
  }

  /**
   * Log deprecation warning
   */
  private logDeprecation(method: string, replacement: string, docsUrl: string): void {
    console.warn(
      `[DEPRECATED] ${method}() is deprecated and will be removed in v2.0.0.\n` +
        `${replacement}\n` +
        `See: ${docsUrl}`
    );
  }

  /**
   * Check if any legacy APIs are being used
   */
  hasLegacyUsage(): boolean {
    return (
      this.panels.size > 0 ||
      this.nodePropertiesTabs.size > 0 ||
      this.settingsSections.size > 0 ||
      this.mapSettingsSections.size > 0
    );
  }

  /**
   * Generate migration report
   */
  getMigrationReport(): {
    totalUsages: number;
    byType: UsageMetrics;
    pluginsToMigrate: string[];
  } {
    const totalUsages =
      this.metrics.registerPanel +
      this.metrics.registerNodePropertiesTab +
      this.metrics.registerSettingsSection +
      this.metrics.registerMapSettingsSection;

    // TODO: Track which plugins are using legacy APIs
    const pluginsToMigrate: string[] = [];

    return {
      totalUsages,
      byType: this.metrics,
      pluginsToMigrate,
    };
  }
}

// Export singleton instance
export const legacyUIAdapter = LegacyUIAdapter.getInstance();

/**
 * Export legacy functions for compatibility
 * @deprecated These will be removed in v2.0.0
 */
export const registerPanel = (config: LegacyPanelConfig) => legacyUIAdapter.registerPanel(config);

export const registerNodePropertiesTab = (config: LegacyNodePropertiesTab) =>
  legacyUIAdapter.registerNodePropertiesTab(config);

export const registerSettingsSection = (config: LegacySettingsSection) =>
  legacyUIAdapter.registerSettingsSection(config);

export const registerMapSettingsSection = (config: LegacySettingsSection) =>
  legacyUIAdapter.registerMapSettingsSection(config);
