/**
 * BigMind Plugin System
 * Main entry point
 */

// ===== Core =====
// ===== Helper function to create a plugin system =====
import { PluginRegistry } from './core/PluginRegistry';
import { HookSystem } from './core/HookSystem';
import { PermissionManager, PermissionStorage } from './permissions/PermissionManager';
import { RoleManager } from './permissions/RoleManager';
import { PolicyEngine } from './permissions/PolicyEngine';
import { EnhancedPermissionManager } from './permissions/EnhancedPermissionManager';
import { RateLimiterManager } from './security/RateLimiter';
import { AuditLogger } from './security/AuditLogger';
import { CSPManager } from './security/CSPManager';
import { EventEmitter } from 'eventemitter3';

export { PluginRegistry } from './core/PluginRegistry';
export { HookSystem, HookType } from './core/HookSystem';

// ===== Types =====
export type { Plugin, PluginInfo } from './types/plugin';
export { PluginState } from './types/plugin';
export type { PluginManifest } from './types/manifest';
export type { IPluginContext } from './types/context';
export type { Permission } from './permissions/types';

// ===== Permissions (Phase 1) =====
export { PermissionManager } from './permissions/PermissionManager';
export type { PermissionStorage } from './permissions/PermissionManager';
export { PermissionMetadataMap } from './permissions/types';

// ===== Permissions Phase 2 - RBAC/ABAC =====
export { RoleManager, PluginRole, StandardRoles } from './permissions/RoleManager';
export type { Role } from './permissions/RoleManager';
export { PolicyEngine, PolicyEffect } from './permissions/PolicyEngine';
export type { Policy, PolicyStatement, EvaluationContext } from './permissions/PolicyEngine';
export { EnhancedPermissionManager } from './permissions/EnhancedPermissionManager';
export type {
  PermissionConstraints,
  ConstrainedPermission,
} from './permissions/EnhancedPermissionManager';

// ===== Security =====
export { RateLimiterManager, TokenBucketLimiter } from './security/RateLimiter';
export type { RateLimitConfig } from './security/RateLimiter';
export { AuditLogger, AuditEventType, AuditSeverity } from './security/AuditLogger';
export type { AuditEvent, AuditStorage, AuditQueryFilters } from './security/AuditLogger';
export { CSPManager } from './security/CSPManager';
export type { CSPPolicy, CSPDirective } from './security/CSPManager';
export { WebWorkerSandbox } from './security/WebWorkerSandbox';

// ===== Runtime =====
export { PluginContext } from './runtime/PluginContext';
export { PluginSandbox } from './runtime/PluginSandbox';

// ===== Validation =====
export { validateManifest } from './validation/manifestSchema';
export { validatePolicy } from './schemas/policySchema';

export interface PluginSystemOptions {
  bigmindVersion?: string;
  permissionStorage: PermissionStorage;
  eventBus: EventEmitter;
  enablePhase2Security?: boolean; // Enable Phase 2 security features
}

export function createPluginSystem(options: PluginSystemOptions) {
  const hookSystem = new HookSystem();
  const permissionManager = new PermissionManager(options.permissionStorage);
  const registry = new PluginRegistry(
    permissionManager,
    hookSystem,
    options.eventBus,
    options.bigmindVersion || '1.0.0'
  );

  // Connect registry to hook system for cleanup
  registry.on('plugin:cleanup-hooks', (pluginId: string) => {
    hookSystem.removePluginHooks(pluginId);
  });

  return {
    registry,
    hookSystem,
    permissionManager,
  };
}

/**
 * Create enhanced plugin system with Phase 2 security
 */
export function createEnhancedPluginSystem(options: PluginSystemOptions) {
  const hookSystem = new HookSystem();
  const roleManager = new RoleManager();
  const policyEngine = new PolicyEngine();
  const rateLimiter = new RateLimiterManager();
  const auditLogger = new AuditLogger();
  const cspManager = new CSPManager();

  const permissionManager = new EnhancedPermissionManager(
    options.permissionStorage,
    roleManager,
    policyEngine,
    rateLimiter,
    auditLogger
  );

  const registry = new PluginRegistry(
    permissionManager,
    hookSystem,
    options.eventBus,
    options.bigmindVersion || '1.0.0'
  );

  // Connect registry to hook system for cleanup
  registry.on('plugin:cleanup-hooks', (pluginId: string) => {
    hookSystem.removePluginHooks(pluginId);
  });

  return {
    registry,
    hookSystem,
    permissionManager,
    roleManager,
    policyEngine,
    rateLimiter,
    auditLogger,
    cspManager,
  };
}
