# Security & Permissions System - Phase 2

Complete security implementation for the Cartae Plugin System with RBAC, ABAC, rate limiting, audit logging, and multi-layer sandboxing.

## Table of Contents

- [Overview](#overview)
- [RBAC - Role-Based Access Control](#rbac---role-based-access-control)
- [ABAC - Attribute-Based Access Control](#abac---attribute-based-access-control)
- [Rate Limiting](#rate-limiting)
- [Audit Logging](#audit-logging)
- [Content Security Policy](#content-security-policy)
- [Web Worker Sandbox](#web-worker-sandbox)
- [Usage Examples](#usage-examples)

## Overview

The Phase 2 security system implements defense-in-depth with multiple layers:

1. **Install-time validation** - Manifest JSON Schema validation
2. **Permission system** - RBAC + ABAC hybrid model
3. **Soft sandbox** - Proxy-based API interception
4. **Rate limiting** - Token Bucket algorithm
5. **Audit logging** - GDPR-compliant event tracking
6. **CSP** - Content Security Policy enforcement
7. **Web Worker isolation** - Thread-based sandboxing

## RBAC - Role-Based Access Control

### Standard Roles

```typescript
import { PluginRole, RoleManager } from '@cartae/plugin-system';

const roleManager = new RoleManager();

// Assign roles to plugins
roleManager.assignRole('pdf-exporter', PluginRole.EDITOR);
roleManager.assignRole('readonly-viewer', PluginRole.VIEWER);
roleManager.assignRole('admin-tools', PluginRole.ADMIN);

// Check permissions
if (roleManager.hasPermission('pdf-exporter', 'mindmap:write')) {
  // Plugin has permission through role
}
```

### Standard Roles

| Role     | Permissions                                                   | Description       |
| -------- | ------------------------------------------------------------- | ----------------- |
| `viewer` | `mindmap:read`                                                | Read-only access  |
| `editor` | `mindmap:read`, `mindmap:write`, `ui:notification`, `storage` | Read/write access |
| `admin`  | All permissions                                               | Full access       |

### Custom Roles

```typescript
const customRole = roleManager.createCustomRole('data-analyst', 'Data Analyst', [
  'mindmap:read',
  'network',
  'storage',
]);

roleManager.assignRole('analytics-plugin', 'data-analyst');
```

### Role Inheritance

Roles can inherit from other roles:

```typescript
const role: Role = {
  id: 'super-editor',
  name: 'Super Editor',
  description: 'Editor with network access',
  permissions: ['network'],
  inheritsFrom: [PluginRole.EDITOR], // Inherits all EDITOR permissions
};

roleManager.registerRole(role);
```

## ABAC - Attribute-Based Access Control

### Policy Engine

AWS IAM-style policies with conditions:

```typescript
import { PolicyEngine, PolicyEffect, type Policy } from '@cartae/plugin-system';

const policyEngine = new PolicyEngine();

// Time-based access control
const workHoursPolicy: Policy = {
  version: '1.0',
  statement: [
    {
      effect: PolicyEffect.ALLOW,
      action: ['mindmap:read', 'mindmap:write'],
      condition: {
        NumericGreaterThan: { 'time:hour': 9 },
        NumericLessThan: { 'time:hour': 17 },
      },
    },
  ],
};

policyEngine.registerPolicy('work-tools', workHoursPolicy);

// Evaluate permission with context
const context = {
  pluginId: 'work-tools',
  timestamp: Date.now(),
};

const result = policyEngine.evaluate('work-tools', 'mindmap:write', context);
console.log(result.allowed); // true during 9-17h, false otherwise
```

### Available Condition Operators

- **Numeric**: `NumericEquals`, `NumericGreaterThan`, `NumericLessThan`
- **String**: `StringEquals`, `StringNotEquals`, `StringLike`
- **Boolean**: `Bool`
- **Date**: `DateEquals`, `DateGreaterThan`, `DateLessThan`
- **Array**: `ArrayContains`

### Context Variables

- `time:hour` - Current hour (0-23)
- `time:day` - Current day of week (0-6)
- `time:timestamp` - Current timestamp
- `user.id` - User ID
- `user.roles` - User roles
- Custom context variables

### Resource Patterns

```typescript
const policy: Policy = {
  version: '1.0',
  statement: [
    {
      effect: PolicyEffect.ALLOW,
      action: 'mindmap:read',
      resource: 'mindmap:project-*', // Wildcard matching
    },
    {
      effect: PolicyEffect.DENY,
      action: 'mindmap:write',
      resource: 'mindmap:readonly-*',
    },
  ],
};
```

## Rate Limiting

Token Bucket algorithm to prevent abuse:

```typescript
import { RateLimiterManager } from '@cartae/plugin-system';

const rateLimiter = new RateLimiterManager();

// Set custom limit for a plugin
rateLimiter.setPluginLimit('heavy-plugin', {
  maxRequests: 100,
  windowMs: 60000, // 100 requests per minute
});

// Check if request is allowed
if (rateLimiter.allow('heavy-plugin')) {
  // Proceed with API call
} else {
  // Rate limit exceeded
}

// Get remaining tokens
const remaining = rateLimiter.getRemaining('heavy-plugin');
console.log(`${remaining} requests remaining`);
```

## Audit Logging

GDPR-compliant audit logging with encryption support:

```typescript
import { AuditLogger, AuditEventType, AuditSeverity } from '@cartae/plugin-system';

const auditLogger = new AuditLogger(undefined, {
  retentionDays: 90, // Keep logs for 90 days
  encryptionEnabled: true, // Enable encryption (requires implementation)
});

// Log events automatically
await auditLogger.logPluginActivated('my-plugin');
await auditLogger.logPermissionRequested('my-plugin', 'filesystem:write', true);
await auditLogger.logApiCall('my-plugin', 'mindmap.getActive');

// Query logs
const logs = await auditLogger.query({
  pluginId: 'my-plugin',
  type: AuditEventType.API_CALL,
  startDate: Date.now() - 24 * 60 * 60 * 1000, // Last 24h
  limit: 100,
});

console.log(`Found ${logs.length} API calls`);
```

### Event Types

- `plugin:installed`, `plugin:activated`, `plugin:deactivated`
- `permission:requested`, `permission:granted`, `permission:denied`, `permission:revoked`
- `api:call`, `api:denied`
- `ratelimit:exceeded`
- `policy:violation`
- `security:alert`

## Content Security Policy

Manage CSP for plugin isolation:

```typescript
import { CSPManager } from '@cartae/plugin-system';

const cspManager = new CSPManager();

// Allow network access for specific plugin
cspManager.allowNetworkAccess('network-plugin', [
  'https://api.example.com',
  'https://*.github.com',
]);

// Get CSP header
const cspHeader = cspManager.getCSPHeader('network-plugin');

// Apply CSP to iframe
const iframe = document.createElement('iframe');
cspManager.applyToIframe(iframe, 'network-plugin');
document.body.appendChild(iframe);

// Validate compliance
const allowed = cspManager.validateCompliance('network-plugin', 'https://api.example.com/data'); // true
```

## Web Worker Sandbox

Level 2 isolation using Web Workers:

```typescript
import { WebWorkerSandbox } from '@cartae/plugin-system';

// Check support
if (WebWorkerSandbox.isSupported()) {
  const sandbox = new WebWorkerSandbox('my-plugin', pluginContext);

  // Initialize with plugin code
  await sandbox.initialize(`
    // Plugin code runs in isolated worker thread
    self.activate = async (context) => {
      const mindmap = await context.mindmap.getActive();
      console.log('Mind map:', mindmap);
    };
  `);

  // Execute plugin method
  await sandbox.execute('activate');

  // Cleanup
  sandbox.terminate();
}
```

## Usage Examples

### Complete Enhanced System

```typescript
import { createEnhancedPluginSystem, PluginRole, PolicyEffect } from '@cartae/plugin-system';

// Create system with Phase 2 security
const system = createEnhancedPluginSystem({
  cartaeVersion: '1.0.0',
  permissionStorage: myStorage,
  eventBus: eventEmitter,
  enablePhase2Security: true,
});

const {
  registry,
  permissionManager,
  roleManager,
  policyEngine,
  rateLimiter,
  auditLogger,
  cspManager,
} = system;

// Assign role
roleManager.assignRole('my-plugin', PluginRole.EDITOR);

// Set rate limit
rateLimiter.setPluginLimit('my-plugin', {
  maxRequests: 50,
  windowMs: 30000,
});

// Register policy
policyEngine.registerPolicy('my-plugin', {
  version: '1.0',
  statement: [
    {
      effect: PolicyEffect.ALLOW,
      action: '*',
      condition: {
        NumericGreaterThan: { 'time:hour': 8 },
        NumericLessThan: { 'time:hour': 20 },
      },
    },
  ],
});

// Register and activate plugin
await registry.register(myPlugin);
await registry.activate('my-plugin');

// Check security summary
const summary = permissionManager.getSecuritySummary('my-plugin');
console.log('Security Summary:', summary);
```

### Permission with Constraints

```typescript
// Grant permission with time constraints
permissionManager.grantWithConstraints('time-limited-plugin', 'mindmap:write', {
  timeWindow: { start: '09:00', end: '17:00' },
  daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
  resourceIds: ['project-123', 'project-456'],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

// Check with context
const allowed = permissionManager.hasWithContext('time-limited-plugin', 'mindmap:write', {
  resource: 'project-123',
});
```

## Best Practices

### 1. Principle of Least Privilege

Always grant the minimum permissions needed:

```typescript
// ✅ Good: Specific permissions
roleManager.assignRole('viewer-plugin', PluginRole.VIEWER);

// ❌ Bad: Over-privileged
roleManager.assignRole('viewer-plugin', PluginRole.ADMIN);
```

### 2. Use Policies for Complex Rules

```typescript
// ✅ Good: Time-based access with policy
policyEngine.registerPolicy('plugin', workHoursPolicy);

// ❌ Bad: Manual time checking everywhere
```

### 3. Monitor Audit Logs

```typescript
// Regular audit review
const alerts = await auditLogger.query({
  severity: AuditSeverity.CRITICAL,
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
});

if (alerts.length > 0) {
  console.warn(`Found ${alerts.length} security alerts!`);
}
```

### 4. Rate Limit All Plugins

```typescript
// Set reasonable defaults
rateLimiter.setDefaultConfig({
  maxRequests: 100,
  windowMs: 60000,
});
```

## Security Checklist

- [ ] All plugins have assigned roles
- [ ] Sensitive operations have policies
- [ ] Rate limits configured
- [ ] Audit logging enabled
- [ ] CSP policies defined
- [ ] Regular audit review process
- [ ] Incident response plan
- [ ] GDPR compliance verified

## References

- [AWS IAM Policy Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [Chrome Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)

---

**Version:** Phase 2
**Last Updated:** 2025-10-27
