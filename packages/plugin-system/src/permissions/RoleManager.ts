/**
 * Role Manager - RBAC (Role-Based Access Control)
 * Manages plugin roles and their associated permissions
 */

/* eslint-disable no-console */

import type { Permission } from './types';

/**
 * Standard plugin roles
 */
export enum PluginRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  CUSTOM = 'custom',
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inheritsFrom?: string[]; // Role inheritance
}

/**
 * Standard roles with predefined permissions
 */
export const StandardRoles: Record<PluginRole, Role> = {
  [PluginRole.VIEWER]: {
    id: PluginRole.VIEWER,
    name: 'Viewer',
    description: 'Read-only access to mind maps',
    permissions: ['mindmap:read'],
  },
  [PluginRole.EDITOR]: {
    id: PluginRole.EDITOR,
    name: 'Editor',
    description: 'Read and write access to mind maps',
    permissions: ['mindmap:read', 'mindmap:write', 'ui:notification', 'storage'],
    inheritsFrom: [PluginRole.VIEWER],
  },
  [PluginRole.ADMIN]: {
    id: PluginRole.ADMIN,
    name: 'Admin',
    description: 'Full access to all features',
    permissions: [
      'mindmap:read',
      'mindmap:write',
      'filesystem:read',
      'filesystem:write',
      'network',
      'clipboard',
      'storage',
      'commands',
      'ui:menu',
      'ui:panel',
      'ui:notification',
      'settings:read',
      'settings:write',
    ],
    inheritsFrom: [PluginRole.EDITOR],
  },
  [PluginRole.CUSTOM]: {
    id: PluginRole.CUSTOM,
    name: 'Custom',
    description: 'Custom role with user-defined permissions',
    permissions: [],
  },
};

/**
 * Role Manager
 */
export class RoleManager {
  private roles = new Map<string, Role>();

  private pluginRoles = new Map<string, string>(); // pluginId -> roleId

  constructor() {
    // Register standard roles
    Object.values(StandardRoles).forEach(role => {
      this.registerRole(role);
    });
  }

  /**
   * Register a new role
   */
  registerRole(role: Role): void {
    if (this.roles.has(role.id)) {
      throw new Error(`Role ${role.id} is already registered`);
    }

    // Validate inherited roles exist
    if (role.inheritsFrom) {
      role.inheritsFrom.forEach(parentId => {
        if (!this.roles.has(parentId)) {
          throw new Error(`Parent role ${parentId} not found`);
        }
      });
    }

    this.roles.set(role.id, role);
    console.log(`[RoleManager] Registered role: ${role.id}`);
  }

  /**
   * Assign a role to a plugin
   */
  assignRole(pluginId: string, roleId: string): void {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} not found`);
    }

    this.pluginRoles.set(pluginId, roleId);
    console.log(`[RoleManager] Assigned role ${roleId} to plugin ${pluginId}`);
  }

  /**
   * Get role assigned to a plugin
   */
  getPluginRole(pluginId: string): Role | undefined {
    const roleId = this.pluginRoles.get(pluginId);
    return roleId ? this.roles.get(roleId) : undefined;
  }

  /**
   * Get all permissions for a plugin based on its role
   * Includes inherited permissions
   */
  getPluginPermissions(pluginId: string): Permission[] {
    const role = this.getPluginRole(pluginId);
    if (!role) {
      return [];
    }

    return this.getRolePermissions(role);
  }

  /**
   * Get all permissions for a role (including inherited)
   */
  private getRolePermissions(role: Role): Permission[] {
    const permissions = new Set<Permission>(role.permissions);

    // Add inherited permissions
    if (role.inheritsFrom) {
      role.inheritsFrom.forEach(parentId => {
        const parentRole = this.roles.get(parentId);
        if (parentRole) {
          this.getRolePermissions(parentRole).forEach(perm => {
            permissions.add(perm);
          });
        }
      });
    }

    return Array.from(permissions);
  }

  /**
   * Check if a plugin has a specific permission through its role
   */
  hasPermission(pluginId: string, permission: Permission): boolean {
    const permissions = this.getPluginPermissions(pluginId);
    return permissions.includes(permission);
  }

  /**
   * Get a role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get all registered roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Remove role assignment from plugin
   */
  removePluginRole(pluginId: string): void {
    this.pluginRoles.delete(pluginId);
    console.log(`[RoleManager] Removed role from plugin ${pluginId}`);
  }

  /**
   * Create a custom role
   */
  createCustomRole(id: string, name: string, permissions: Permission[]): Role {
    const role: Role = {
      id,
      name,
      description: `Custom role: ${name}`,
      permissions,
    };

    this.registerRole(role);
    return role;
  }
}
