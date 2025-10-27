/**
 * Permission Manager
 * Manages plugin permissions with user consent
 */

/* eslint-disable no-console */

import type { Permission } from './types';

/**
 * Storage interface for persisting permissions
 */
export interface PermissionStorage {
  save(permissions: Map<string, Set<Permission>>): Promise<void>;
  load(): Promise<Map<string, Set<Permission>> | null>;
}

/**
 * Permission Manager
 */
export class PermissionManager {
  private granted = new Map<string, Set<Permission>>();

  private storage: PermissionStorage;

  constructor(storage: PermissionStorage) {
    this.storage = storage;
    this.loadGrantedPermissions();
  }

  /**
   * Request permissions from user
   */
  async requestPermissions(pluginId: string, permissions: Permission[]): Promise<boolean> {
    // Filter already granted
    const existing = this.granted.get(pluginId) || new Set<Permission>();
    const needed = permissions.filter(p => !existing.has(p));

    if (needed.length === 0) {
      return true; // All already granted
    }

    // Show permission dialog
    const result = await this.showPermissionDialog(pluginId, needed);

    if (result.approved) {
      // Grant permissions
      needed.forEach(permission => {
        this.grant(pluginId, permission);
      });
      await this.storage.save(this.granted);
      return true;
    }

    return false;
  }

  /**
   * Check if plugin has permission
   */
  has(pluginId: string, permission: Permission): boolean {
    const permissions = this.granted.get(pluginId);
    return permissions?.has(permission) || false;
  }

  /**
   * Grant permission
   */
  grant(pluginId: string, permission: Permission): void {
    if (!this.granted.has(pluginId)) {
      this.granted.set(pluginId, new Set());
    }
    this.granted.get(pluginId)!.add(permission);
    console.log(`[PermissionManager] Granted permission ${permission} to plugin ${pluginId}`);
  }

  /**
   * Revoke permission
   */
  revoke(pluginId: string, permission: Permission): void {
    this.granted.get(pluginId)?.delete(permission);
    console.log(`[PermissionManager] Revoked permission ${permission} from plugin ${pluginId}`);
  }

  /**
   * Revoke all permissions for a plugin
   */
  revokeAll(pluginId: string): void {
    this.granted.delete(pluginId);
    console.log(`[PermissionManager] Revoked all permissions from plugin ${pluginId}`);
  }

  /**
   * Get all granted permissions for a plugin
   */
  getGranted(pluginId: string): Permission[] {
    return Array.from(this.granted.get(pluginId) || []);
  }

  /**
   * Get all plugins with permissions
   */
  getAllGranted(): Map<string, Permission[]> {
    const result = new Map<string, Permission[]>();
    Array.from(this.granted.entries()).forEach(([pluginId, permissions]) => {
      result.set(pluginId, Array.from(permissions));
    });
    return result;
  }

  // ===== Private Methods =====

  /**
   * Show permission dialog to user
   * TODO: This should be implemented by the UI layer
   */
  // eslint-disable-next-line class-methods-use-this
  private showPermissionDialog(
    pluginId: string,
    permissions: Permission[]
  ): Promise<{ approved: boolean }> {
    // For Phase 1, auto-approve (development mode)
    // In Phase 2, this will show a real UI dialog
    console.log(
      `[PermissionManager] Auto-approving permissions for ${pluginId} (dev mode):`,
      permissions
    );
    return Promise.resolve({ approved: true });
  }

  /**
   * Load granted permissions from storage
   */
  private async loadGrantedPermissions(): Promise<void> {
    try {
      const data = await this.storage.load();
      if (data) {
        // Convert Arrays to Sets (from JSON deserialization)
        this.granted = new Map();
        data.forEach((permissions, pluginId) => {
          this.granted.set(
            pluginId,
            permissions instanceof Set ? permissions : new Set(permissions)
          );
        });
        console.log(`[PermissionManager] Loaded permissions for ${this.granted.size} plugins`);
      }
    } catch (error) {
      console.error('[PermissionManager] Failed to load permissions:', error);
    }
  }
}
