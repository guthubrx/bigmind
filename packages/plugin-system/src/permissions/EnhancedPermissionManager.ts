/**
 * Enhanced Permission Manager
 * Extends base PermissionManager with RBAC, ABAC, and contextual constraints
 */

/* eslint-disable no-console */

import type { Permission } from './types';
import { PermissionManager, type PermissionStorage } from './PermissionManager';
import { RoleManager } from './RoleManager';
import { PolicyEngine, type Policy, type EvaluationContext } from './PolicyEngine';
import { RateLimiterManager } from '../security/RateLimiter';
import { AuditLogger, AuditEventType, AuditSeverity } from '../security/AuditLogger';
import { debugLog } from '../utils/debug';

/**
 * Permission constraints (ABAC)
 */
export interface PermissionConstraints {
  timeWindow?: { start: string; end: string };
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  resourceIds?: string[];
  requiresMFA?: boolean;
  rateLimit?: { maxRequests: number; windowMs: number };
  context?: Record<string, any>;
}

/**
 * Permission with constraints
 */
export interface ConstrainedPermission {
  permission: Permission;
  constraints?: PermissionConstraints;
  grantedAt: number;
  expiresAt?: number;
}

/**
 * Enhanced Permission Manager
 */
export class EnhancedPermissionManager extends PermissionManager {
  private roleManager: RoleManager;

  private policyEngine: PolicyEngine;

  private rateLimiter: RateLimiterManager;

  private auditLogger: AuditLogger;

  private constraints = new Map<string, ConstrainedPermission[]>();

  constructor(
    storage: PermissionStorage,
    roleManager: RoleManager,
    policyEngine: PolicyEngine,
    rateLimiter: RateLimiterManager,
    auditLogger: AuditLogger
  ) {
    super(storage);
    this.roleManager = roleManager;
    this.policyEngine = policyEngine;
    this.rateLimiter = rateLimiter;
    this.auditLogger = auditLogger;
  }

  /**
   * Check if plugin has permission with contextual evaluation
   */
  hasWithContext(
    pluginId: string,
    permission: Permission,
    context?: Partial<EvaluationContext>
  ): boolean {
    // First check rate limit
    if (!this.rateLimiter.allow(pluginId)) {
      this.auditLogger.logRateLimitExceeded(pluginId);
      return false;
    }

    // Check basic permission
    const hasBasic = super.has(pluginId, permission);

    // Check role-based permission
    const hasRole = this.roleManager.hasPermission(pluginId, permission);

    // If neither basic nor role grants permission, check policy
    if (!hasBasic && !hasRole) {
      const evalContext: EvaluationContext = {
        pluginId,
        timestamp: Date.now(),
        ...context,
      };

      const policyResult = this.policyEngine.evaluate(pluginId, permission, evalContext);

      if (!policyResult.allowed) {
        this.auditLogger.logApiCall(pluginId, permission, context?.resource, false);
        return false;
      }
    }

    // Check constraints
    const constraintsMet = this.checkConstraints(pluginId, permission, context);

    if (!constraintsMet) {
      this.auditLogger.logApiCall(pluginId, permission, context?.resource, false);
      return false;
    }

    // Log successful access
    this.auditLogger.logApiCall(pluginId, permission, context?.resource, true);

    return true;
  }

  /**
   * Grant permission with constraints
   */
  grantWithConstraints(
    pluginId: string,
    permission: Permission,
    constraints?: PermissionConstraints
  ): void {
    super.grant(pluginId, permission);

    // Store constraints
    if (constraints) {
      const constrained: ConstrainedPermission = {
        permission,
        constraints,
        grantedAt: Date.now(),
      };

      if (!this.constraints.has(pluginId)) {
        this.constraints.set(pluginId, []);
      }

      this.constraints.get(pluginId)!.push(constrained);

      // Apply rate limit if specified
      if (constraints.rateLimit) {
        this.rateLimiter.setPluginLimit(pluginId, constraints.rateLimit);
      }

      debugLog(`[EnhancedPermissionManager] Granted ${permission} to ${pluginId} with constraints`);
    }

    this.auditLogger.logPermissionRequested(pluginId, permission, true);
  }

  /**
   * Check constraints for a permission
   */
  private checkConstraints(
    pluginId: string,
    permission: Permission,
    context?: Partial<EvaluationContext>
  ): boolean {
    const pluginConstraints = this.constraints.get(pluginId);

    if (!pluginConstraints) {
      return true; // No constraints = allowed
    }

    const permConstraints = pluginConstraints.find(c => c.permission === permission);

    if (!permConstraints || !permConstraints.constraints) {
      return true;
    }

    const { constraints } = permConstraints;
    const now = Date.now();

    // Check expiration
    if (permConstraints.expiresAt && now > permConstraints.expiresAt) {
      console.warn(`[EnhancedPermissionManager] Permission expired for ${pluginId}`);
      return false;
    }

    // Check time window
    if (constraints.timeWindow) {
      const currentTime = new Date(now).toTimeString().slice(0, 5); // HH:MM
      if (currentTime < constraints.timeWindow.start || currentTime > constraints.timeWindow.end) {
        console.warn(`[EnhancedPermissionManager] Outside time window for ${pluginId}`);
        return false;
      }
    }

    // Check days of week
    if (constraints.daysOfWeek) {
      const currentDay = new Date(now).getDay();
      if (!constraints.daysOfWeek.includes(currentDay)) {
        console.warn(`[EnhancedPermissionManager] Not allowed on this day for ${pluginId}`);
        return false;
      }
    }

    // Check resource IDs
    if (constraints.resourceIds && context?.resource) {
      const allowed = constraints.resourceIds.some(id => context.resource === id);
      if (!allowed) {
        console.warn(`[EnhancedPermissionManager] Resource not allowed for ${pluginId}`);
        return false;
      }
    }

    // Check MFA (placeholder - would integrate with actual MFA system)
    if (constraints.requiresMFA) {
      console.warn(`[EnhancedPermissionManager] MFA required but not implemented yet`);
      // TODO: Integrate with MFA system
    }

    return true;
  }

  /**
   * Register a policy for a plugin
   */
  registerPolicy(pluginId: string, policy: Policy): void {
    this.policyEngine.registerPolicy(pluginId, policy);
    debugLog(`[EnhancedPermissionManager] Registered policy for plugin: ${pluginId}`);
  }

  /**
   * Assign a role to a plugin
   */
  assignRole(pluginId: string, roleId: string): void {
    this.roleManager.assignRole(pluginId, roleId);
    debugLog(`[EnhancedPermissionManager] Assigned role ${roleId} to ${pluginId}`);
  }

  /**
   * Revoke permission with cascade
   */
  revokeWithCascade(pluginId: string, permission: Permission): void {
    super.revoke(pluginId, permission);

    // Remove constraints
    const pluginConstraints = this.constraints.get(pluginId);
    if (pluginConstraints) {
      const filtered = pluginConstraints.filter(c => c.permission !== permission);
      if (filtered.length === 0) {
        this.constraints.delete(pluginId);
      } else {
        this.constraints.set(pluginId, filtered);
      }
    }

    this.auditLogger.log({
      type: AuditEventType.PERMISSION_REVOKED,
      severity: AuditSeverity.INFO,
      pluginId,
      action: 'revoke',
      permission,
      result: 'success',
    });
  }

  /**
   * Revoke all permissions with cleanup
   */
  override revokeAll(pluginId: string): void {
    super.revokeAll(pluginId);

    // Clean up constraints
    this.constraints.delete(pluginId);

    // Clean up rate limiter
    this.rateLimiter.remove(pluginId);

    // Clean up policy
    this.policyEngine.removePolicy(pluginId);

    // Remove role
    this.roleManager.removePluginRole(pluginId);

    this.auditLogger.log({
      type: AuditEventType.PERMISSION_REVOKED,
      severity: AuditSeverity.WARNING,
      pluginId,
      action: 'revoke_all',
      result: 'success',
    });
  }

  /**
   * Get all permissions for a plugin (including role-based)
   */
  getAllPermissions(pluginId: string): Permission[] {
    const granted = this.getGranted(pluginId);
    const rolePerms = this.roleManager.getPluginPermissions(pluginId);

    // Combine and deduplicate
    return Array.from(new Set([...granted, ...rolePerms]));
  }

  /**
   * Get constraints for a permission
   */
  getConstraints(pluginId: string, permission: Permission): PermissionConstraints | undefined {
    const pluginConstraints = this.constraints.get(pluginId);
    if (!pluginConstraints) {
      return undefined;
    }

    const found = pluginConstraints.find(c => c.permission === permission);
    return found?.constraints;
  }

  /**
   * Get security summary for a plugin
   */
  getSecuritySummary(pluginId: string): {
    permissions: Permission[];
    role?: string;
    hasPolicy: boolean;
    rateLimitRemaining: number;
    constraints: number;
  } {
    return {
      permissions: this.getAllPermissions(pluginId),
      role: this.roleManager.getPluginRole(pluginId)?.id,
      hasPolicy: !!this.policyEngine.getPolicy(pluginId),
      rateLimitRemaining: this.rateLimiter.getRemaining(pluginId),
      constraints: this.constraints.get(pluginId)?.length || 0,
    };
  }
}
