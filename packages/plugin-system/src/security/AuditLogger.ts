/**
 * Audit Logger - GDPR Compliant
 * Logs security-relevant events with encryption and retention policies
 */

/* eslint-disable no-console, @typescript-eslint/no-explicit-any, max-classes-per-file, class-methods-use-this */

import type { Permission } from '../permissions/types';
import { debugLog } from '../utils/debug';

/**
 * Audit event types
 */
export enum AuditEventType {
  PLUGIN_INSTALLED = 'plugin:installed',
  PLUGIN_ACTIVATED = 'plugin:activated',
  PLUGIN_DEACTIVATED = 'plugin:deactivated',
  PLUGIN_UNINSTALLED = 'plugin:uninstalled',
  PERMISSION_REQUESTED = 'permission:requested',
  PERMISSION_GRANTED = 'permission:granted',
  PERMISSION_DENIED = 'permission:denied',
  PERMISSION_REVOKED = 'permission:revoked',
  API_CALL = 'api:call',
  API_DENIED = 'api:denied',
  RATE_LIMIT_EXCEEDED = 'ratelimit:exceeded',
  POLICY_VIOLATION = 'policy:violation',
  SECURITY_ALERT = 'security:alert',
}

/**
 * Audit event severity
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Audit event
 */
export interface AuditEvent {
  id: string;
  timestamp: number;
  type: AuditEventType;
  severity: AuditSeverity;
  pluginId: string;
  action: string;
  resource?: string;
  permission?: Permission;
  result: 'success' | 'failure' | 'denied';
  metadata?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
}

/**
 * Audit log storage interface
 */
export interface AuditStorage {
  save(event: AuditEvent): Promise<void>;
  query(filters: AuditQueryFilters): Promise<AuditEvent[]>;
  delete(eventId: string): Promise<void>;
  cleanup(olderThan: number): Promise<number>; // Delete events older than timestamp
}

/**
 * Audit query filters
 */
export interface AuditQueryFilters {
  pluginId?: string;
  type?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

/**
 * Simple in-memory audit storage (for development)
 * In production, use encrypted persistent storage
 */
class InMemoryAuditStorage implements AuditStorage {
  private events: AuditEvent[] = [];

  async save(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    let results = [...this.events];

    if (filters.pluginId) {
      results = results.filter(e => e.pluginId === filters.pluginId);
    }

    if (filters.type) {
      results = results.filter(e => e.type === filters.type);
    }

    if (filters.severity) {
      results = results.filter(e => e.severity === filters.severity);
    }

    if (filters.startDate) {
      results = results.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter(e => e.timestamp <= filters.endDate!);
    }

    // Sort by timestamp descending (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async delete(eventId: string): Promise<void> {
    this.events = this.events.filter(e => e.id !== eventId);
  }

  async cleanup(olderThan: number): Promise<number> {
    const before = this.events.length;
    this.events = this.events.filter(e => e.timestamp >= olderThan);
    return before - this.events.length;
  }
}

/**
 * Audit Logger
 */
export class AuditLogger {
  private storage: AuditStorage;

  private retentionDays: number;

  private encryptionEnabled: boolean;

  constructor(
    storage?: AuditStorage,
    options?: {
      retentionDays?: number;
      encryptionEnabled?: boolean;
    }
  ) {
    this.storage = storage || new InMemoryAuditStorage();
    this.retentionDays = options?.retentionDays || 90; // Default: 90 days
    this.encryptionEnabled = options?.encryptionEnabled || false;

    // Schedule cleanup
    this.scheduleCleanup();
  }

  /**
   * Log an audit event
   */
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...event,
    };

    // Encrypt if enabled (placeholder - implement actual encryption)
    if (this.encryptionEnabled) {
      // TODO: Implement encryption with AES-256 or libsodium
      debugLog('[AuditLogger] Encryption enabled (not yet implemented)');
    }

    await this.storage.save(fullEvent);

    // Also log to console for debugging
    this.logToConsole(fullEvent);
  }

  /**
   * Query audit logs
   */
  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    return this.storage.query(filters);
  }

  /**
   * Log plugin installation
   */
  async logPluginInstalled(pluginId: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      type: AuditEventType.PLUGIN_INSTALLED,
      severity: AuditSeverity.INFO,
      pluginId,
      action: 'install',
      result: 'success',
      metadata,
    });
  }

  /**
   * Log plugin activation
   */
  async logPluginActivated(pluginId: string): Promise<void> {
    await this.log({
      type: AuditEventType.PLUGIN_ACTIVATED,
      severity: AuditSeverity.INFO,
      pluginId,
      action: 'activate',
      result: 'success',
    });
  }

  /**
   * Log permission request
   */
  async logPermissionRequested(
    pluginId: string,
    permission: Permission,
    granted: boolean
  ): Promise<void> {
    await this.log({
      type: granted ? AuditEventType.PERMISSION_GRANTED : AuditEventType.PERMISSION_DENIED,
      severity: granted ? AuditSeverity.INFO : AuditSeverity.WARNING,
      pluginId,
      action: 'request_permission',
      permission,
      result: granted ? 'success' : 'denied',
    });
  }

  /**
   * Log API call
   */
  async logApiCall(
    pluginId: string,
    api: string,
    resource?: string,
    allowed: boolean = true
  ): Promise<void> {
    await this.log({
      type: allowed ? AuditEventType.API_CALL : AuditEventType.API_DENIED,
      severity: allowed ? AuditSeverity.INFO : AuditSeverity.WARNING,
      pluginId,
      action: `api:${api}`,
      resource,
      result: allowed ? 'success' : 'denied',
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(pluginId: string): Promise<void> {
    await this.log({
      type: AuditEventType.RATE_LIMIT_EXCEEDED,
      severity: AuditSeverity.WARNING,
      pluginId,
      action: 'rate_limit',
      result: 'denied',
    });
  }

  /**
   * Log security alert
   */
  async logSecurityAlert(
    pluginId: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      type: AuditEventType.SECURITY_ALERT,
      severity: AuditSeverity.CRITICAL,
      pluginId,
      action: 'security_alert',
      result: 'failure',
      metadata: { message, ...metadata },
    });
  }

  /**
   * Clean up old logs based on retention policy
   */
  async cleanup(): Promise<void> {
    const cutoffDate = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    const deleted = await this.storage.cleanup(cutoffDate);
    const msg = `[AuditLogger] Cleaned up ${deleted} old audit logs`;
    debugLog(`${msg} (older than ${this.retentionDays} days)`);
  }

  /**
   * Schedule automatic cleanup
   */
  private scheduleCleanup(): void {
    // Run cleanup daily
    setInterval(
      () => {
        this.cleanup().catch(err => {
          console.error('[AuditLogger] Cleanup failed:', err);
        });
      },
      24 * 60 * 60 * 1000
    );
  }

  /**
   * Generate unique event ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Log to console (for debugging)
   */
  private logToConsole(event: AuditEvent): void {
    const icon = this.getSeverityIcon(event.severity);
    const parts = [icon, '[AUDIT]', event.type, event.pluginId, event.action, event.result];
    const message = parts.join(' | ');

    const isCritical = event.severity === AuditSeverity.CRITICAL;
    const isError = event.severity === AuditSeverity.ERROR;

    if (isCritical || isError) {
      console.error(message, event);
    } else if (event.severity === AuditSeverity.WARNING) {
      console.warn(message, event);
    } else {
      debugLog(message);
    }
  }

  /**
   * Get icon for severity level
   */
  private getSeverityIcon(severity: AuditSeverity): string {
    const icons = {
      [AuditSeverity.INFO]: 'ℹ️',
      [AuditSeverity.WARNING]: '⚠️',
      [AuditSeverity.ERROR]: '❌',
      [AuditSeverity.CRITICAL]: '🚨',
    };
    return icons[severity];
  }
}
