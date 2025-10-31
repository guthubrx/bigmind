/**
 * Unified UI Manager
 * Bridges modern Slot/Fill system with legacy registries
 */

import { legacyUIAdapter, type LegacyPanelConfig } from './LegacyUIAdapter';
import type { ReactNode } from 'react';

/**
 * Modern panel contribution (from manifest)
 */
export interface ModernPanelContribution {
  id: string;
  title: string;
  icon?: string;
  slot: string;
  webview?: {
    src: string;
    sandbox?: string[];
  };
  component?: ReactNode;
}

class UnifiedUIManager {
  private static instance: UnifiedUIManager;

  private modernPanels = new Map<string, ModernPanelContribution>();

  private constructor() {}

  static getInstance(): UnifiedUIManager {
    if (!UnifiedUIManager.instance) {
      UnifiedUIManager.instance = new UnifiedUIManager();
    }
    return UnifiedUIManager.instance;
  }

  /**
   * Register modern panel (from manifest)
   */
  registerModernPanel(panel: ModernPanelContribution): void {
    this.modernPanels.set(panel.id, panel);
  }

  /**
   * Get all panels (modern + legacy)
   */
  getAllPanels(): Array<LegacyPanelConfig | ModernPanelContribution> {
    const legacy = legacyUIAdapter.getPanels();
    const modern = Array.from(this.modernPanels.values());

    return [...legacy, ...modern];
  }

  /**
   * Get panel by ID (searches both modern and legacy)
   */
  getPanel(id: string): LegacyPanelConfig | ModernPanelContribution | undefined {
    // Check modern first
    const modern = this.modernPanels.get(id);
    if (modern) return modern;

    // Check legacy
    const legacy = legacyUIAdapter.getPanels().find(p => p.id === id);
    return legacy;
  }

  /**
   * Check if using legacy APIs
   */
  hasLegacyUsage(): boolean {
    return legacyUIAdapter.hasLegacyUsage();
  }

  /**
   * Get migration status
   */
  getMigrationStatus(): {
    totalPanels: number;
    modernPanels: number;
    legacyPanels: number;
    migrationProgress: number;
  } {
    const legacyCount = legacyUIAdapter.getPanels().length;
    const modernCount = this.modernPanels.size;
    const total = legacyCount + modernCount;

    return {
      totalPanels: total,
      modernPanels: modernCount,
      legacyPanels: legacyCount,
      migrationProgress: total > 0 ? (modernCount / total) * 100 : 100,
    };
  }

  /**
   * Helper: Migrate legacy panel to modern
   * Returns manifest contribution format
   */
  migratePanelToModern(legacyPanel: LegacyPanelConfig): ModernPanelContribution {
    return {
      id: legacyPanel.id,
      title: legacyPanel.title,
      icon: legacyPanel.icon,
      slot: legacyPanel.location === 'bottom' ? 'bottomPanel' : 'sidebarPanel',
      component: legacyPanel.component,
    };
  }
}

// Export singleton instance
export const unifiedUIManager = UnifiedUIManager.getInstance();
