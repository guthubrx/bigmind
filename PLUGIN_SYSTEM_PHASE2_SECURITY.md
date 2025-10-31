# 🔐 Phase 2 — Système de Permissions et Sécurité pour Cartae

## 🎯 Objectif

Mettre en place un système de permissions et sécurité robuste, inspiré des meilleures pratiques 2024–2025 (RBAC, ABAC, Chrome Manifest V3, Android, AWS IAM, Capability-based Security).

Ce document décrit le prompt d'implémentation pour concevoir et coder la couche de sécurité du futur écosystème de plugins Cartae.

## 🧩 Objectifs techniques

- Sécuriser l'accès des plugins à l'API Core Cartae.
- Appliquer le principe du moindre privilège (Zero Trust).
- Offrir un modèle hybride RBAC + ABAC extensible.
- Gérer la demande, la révocation et la délégation de permissions.
- Intégrer un sandbox multicouche pour l'isolation des plugins.
- Assurer traçabilité, auditabilité et conformité RGPD.

## 🏗️ Architecture générale

### 🔹 Vue d'ensemble

```
┌──────────────────────────────────────────────┐
│             Cartae Core (Trusted)           │
├──────────────────────────────────────────────┤
│     Permission Manager  + Policy Engine      │
│     • RBAC + ABAC + Scopes                  │
│     • Runtime checks + Rate limiting         │
│     • Audit logging + Revocation             │
├──────────────────────────────────────────────┤
│         Plugin Context API (Proxied)         │
├──────────────────────────────────────────────┤
│           Sandbox Layer (Isolated)           │
│  [Soft Proxy] → [Web Worker] → [iframe]      │
└──────────────────────────────────────────────┘
```

### 🔹 Packages à créer

```
packages/
  plugin-system/
    src/
      permissions/        → Core RBAC/ABAC, revocation, policies
      security/           → Sandbox, CSP, rate limiting, monitoring
      types/              → Typages globaux
      schemas/            → JSON Schema (manifest, policy)
```

## 🔒 1. Permission System (RBAC + ABAC)

### 🎯 Rôles standards (RBAC)

```typescript
export enum PluginRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  CUSTOM = 'custom',
}

export const StandardRoles = {
  viewer: {
    id: PluginRole.VIEWER,
    permissions: ['mindmap:read'],
  },
  editor: {
    id: PluginRole.EDITOR,
    permissions: ['mindmap:read', 'mindmap:write'],
  },
  admin: {
    id: PluginRole.ADMIN,
    permissions: ['*'],
  },
};
```

### 🎯 Attributs contextuels (ABAC)

```typescript
interface PermissionConstraints {
  timeWindow?: { start: string; end: string };
  daysOfWeek?: number[];
  resourceIds?: string[];
  requiresMFA?: boolean;
  rateLimit?: { maxRequests: number; windowMs: number };
  context?: Record<string, any>;
}
```

### 🎯 Policy Engine (AWS IAM inspired)

```typescript
interface PolicyStatement {
  effect: 'Allow' | 'Deny';
  action: string | string[];
  resource: string | string[];
  condition?: Record<string, any>;
}
```

**Exemple :** autoriser la lecture de mindmaps pendant les heures ouvrées :

```json
{
  "Version": "1.0",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["mindmap:read"],
      "Condition": {
        "NumericGreaterThan": { "time:hour": 9 },
        "NumericLessThan": { "time:hour": 18 }
      }
    }
  ]
}
```

## 🧱 2. Permission Manager

### 📦 Structure

```typescript
class PermissionManager {
  private granted = new Map<string, Set<Permission>>();

  async request(pluginId: string, permissions: Permission[]): Promise<boolean> {
    const toAsk = permissions.filter(p => !this.has(pluginId, p));
    const approved = await this.showDialog(pluginId, toAsk);
    if (approved) this.grant(pluginId, toAsk);
    return approved;
  }

  has(pluginId: string, perm: Permission): boolean {
    return this.granted.get(pluginId)?.has(perm) ?? false;
  }

  revoke(pluginId: string, perm: Permission) {
    this.granted.get(pluginId)?.delete(perm);
  }

  revokeAll(pluginId: string) {
    this.granted.delete(pluginId);
  }
}
```

### 🪟 UI Permission Dialog (Runtime Request)

- Afficher le nom du plugin, la raison et le niveau de risque.
- **Exemple :** "Le plugin PDF Export souhaite enregistrer des fichiers sur votre ordinateur."

## 🧩 3. Sandbox & Isolation

### 🧠 Niveaux d'isolation

| Niveau | Type                     | Isolation                  | Usage          |
| ------ | ------------------------ | -------------------------- | -------------- |
| 1      | Proxy sandbox            | Contrôle API via Proxy     | Phase 1 (core) |
| 2      | Web Worker               | Thread isolé               | Phase 2        |
| 3      | Iframe sandbox           | Contexte navigateur séparé | Phase 3        |
| 4      | Hybrid (iframe + Worker) | Isolation maximale         | Future         |

### 🔍 Exemple Soft Sandbox

```typescript
class PluginSandbox {
  constructor(
    private pluginId: string,
    private pm: PermissionManager
  ) {}

  createContext(full: IPluginContext): IPluginContext {
    return new Proxy(full, {
      get: (target, prop) => {
        if (prop === 'fs') this.ensure('filesystem:read');
        return target[prop];
      },
    });
  }

  private ensure(permission: string) {
    if (!this.pm.has(this.pluginId, permission))
      throw new Error(`Permission '${permission}' denied for ${this.pluginId}`);
  }
}
```

## 🧰 4. Rate Limiting & Throttling

Limiter les appels `plugin → core` pour prévenir les abus.

### Exemple : Token Bucket

```typescript
class TokenBucketLimiter {
  constructor(
    private rate: number,
    private capacity: number
  ) {}
  private tokens = this.capacity;
  private lastRefill = Date.now();

  allow(): boolean {
    const now = Date.now();
    const delta = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + delta * this.rate);
    this.lastRefill = now;
    if (this.tokens >= 1) {
      this.tokens--;
      return true;
    }
    return false;
  }
}
```

## 🧾 5. Audit Logging (GDPR Compliant)

### Données à logger

- `pluginId`, `action`, `timestamp`, `resource`, `result`
- Journaliser tous les accès sensibles.

### Exemple

```typescript
class AuditLogger {
  log(event: AuditEvent) {
    console.info(`[AUDIT]`, JSON.stringify(event));
    // Option : encrypt + persist
  }
}
```

### Bonnes pratiques RGPD

- Chiffrement des logs (AES-256 ou libsodium).
- Rétention limitée (30-90 jours).
- Accès restreint (admin only).

## 🧨 6. Defense in Depth

| Couche | Description                                |
| ------ | ------------------------------------------ |
| 1      | Validation du manifest JSON (install-time) |
| 2      | Permission system RBAC/ABAC                |
| 3      | Soft sandbox (runtime)                     |
| 4      | Rate limiting                              |
| 5      | Audit logging                              |
| 6      | CSP strict (no eval, no remote code)       |
| 7      | Anomaly detection (future)                 |

## 🚦 7. Étapes d'implémentation

### Sprint 1 — Base du système de permissions

- [ ] Créer `permissions/RoleManager.ts` (RBAC)
- [ ] Créer `permissions/PolicyEngine.ts` (ABAC)
- [ ] Étendre `PermissionManager` avec contraintes contextuelles
- [ ] Créer `schemas/policySchema.ts` (JSON Schema pour policies)
- [ ] Tests unitaires

### Sprint 2 — Sandbox + Logging

- [ ] Créer `security/RateLimiter.ts` (Token Bucket)
- [ ] Créer `security/AuditLogger.ts` (RGPD compliant)
- [ ] Améliorer `PluginSandbox` avec Web Worker support
- [ ] Créer `security/CSPManager.ts`
- [ ] Tests d'isolation

### Sprint 3 — Policy Engine (ABAC)

- [ ] Implémenter évaluation des conditions (time, resource, context)
- [ ] Créer UI pour gestion des policies
- [ ] Implémenter révocation en cascade
- [ ] Créer dashboard d'audit
- [ ] Tests de sécurité (penetration testing)

## 🧩 Patterns utilisés

- **Proxy Pattern** → interception des appels API
- **Capability Pattern** → référence + droit = autorisation
- **Command Pattern** → contrôle des actions
- **Registry Pattern** → centralisation des permissions
- **Chain of Responsibility** → traitement multi-couche sécurité
- **Observer Pattern** → audit / revocation events

## ✅ Résultats attendus

- Isolation des plugins garantie.
- Sécurité par défaut (deny-first).
- Audit complet des opérations.
- Extensibilité (ajout facile de nouvelles permissions, sandboxes ou politiques).

## 📘 Références

- [VSCode Extension Host Architecture (2024)](https://code.visualstudio.com/api/advanced-topics/extension-host)
- [Chrome Manifest V3 Security Model](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [Android Runtime Permissions Model](https://developer.android.com/guide/topics/permissions/overview)
- [Agoric SES (Secure EcmaScript)](https://github.com/endojs/endo/tree/master/packages/ses)
- [OWASP API Security Top 10 (2025)](https://owasp.org/www-project-api-security/)

---

**Auteur :** Claude Code
**Version :** v1.0 — Phase 2 (Sécurité & Permissions)
**Date :** 2025-10-27
