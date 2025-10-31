# 📦 Cartae — Phase 4: Storage & Distribution (Prompt instructif pour LLM développeur)

> Objectif: Concevoir et implémenter une **infrastructure de distribution de plugins** robuste, sécurisée, scalable et performante pour l’écosystème Cartae.  
> Axes: **Registry**, **CDN**, **résolution de dépendances**, **mises à jour delta**, **signature & intégrité**, **marketplace**, **search & discovery**, **monorepo DX**, **modération & qualité**, **supply-chain security**.

---

## 🧭 Principes directeurs (2024–2025)
- **Security-first**: zero-trust, signatures, SBOM, provenance (SLSA), politiques de publication.
- **Performance globale**: CDN edge, cache immutable, delta-updates, lazy metadata hydration.
- **Compatibilité & simplicité**: npm comme standard, fallback locaux, CLI unique.
- **Observabilité**: audit, métriques, traces; protection des données (RGPD).
- **Automatisation**: CI/CD, semantic-release, vuln scanning, review workflows.

---

## 1) Registry & Publication

### 1.1. npm (standard) + Private Registry
- **Scoped packages** `@cartae/plugin-foo` pour éviter *dependency confusion*.
- **SemVer strict** `MAJOR.MINOR.PATCH[-pre]` + `dist-tags` (`latest`, `beta`).
- **Private registry** (MVP: Verdaccio; Enterprise: Nexus/Artifactory).

**Verdaccio minimal config**:
```yaml
storage: ./storage
auth:
  htpasswd:
    file: ./htpasswd
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
packages:
  '@cartae/*':
    access: $authenticated
    publish: $authenticated
```

### 1.2. Manifeste plugin (extraits pertinents distribution)
```json
{
  "id": "com.cartae.pdf-export",
  "name": "PDF Export Pro",
  "version": "1.2.0",
  "main": "dist/index.js",
  "cartae": { "minVersion": "0.2.0" },
  "distribution": {
    "registry": "https://registry.cartae.app",
    "cdn": "https://cdn.cartae.app/plugins",
    "integrity": {
      "sig": "base64-edsig",
      "pubKeyId": "dev:john@example.com"
    },
    "assets": ["assets/icon.png", "docs/README.md"],
    "sbom": "sbom.json"
  }
}
```

### 1.3. Publication automatisée
- **semantic-release**: calcul version + changelog + tag + publish.
- **CI gates**: tests, lint, typecheck, **vuln scan**, bundle-size, license compliance.
- **Provenance**: générer attestation (SLSA) + SBOM (CycloneDX/SPDX).

---

## 2) CDN & Caching Strategy

### 2.1. Adresses
```
https://cdn.cartae.app/plugins/@cartae/pdf-export/1.2.0/index.js
https://cdn.cartae.app/plugins/manifest.json
```

### 2.2. Cache headers
- **Immutables versionnés**: `Cache-Control: public, max-age=31536000, immutable`
- **Métadonnées fréquentes**: `public, max-age=300, must-revalidate`

### 2.3. Invalidations ciblées
- Purge par chemin, **par tag**, et **soft purge** (stale-while-revalidate).

### 2.4. Fallback & HA
- Edge → Origin (S3/GCS) → Registry (Verdaccio) → npm public (proxy).

---

## 3) Résolution de dépendances

### 3.1. Stratégie **Hybrid (recommandée)**
- **Shared externals** (React, react-dom, core SDK) → fournis par l’hôte.
- **Deps spécifiques** bundle côté plugin.

```js
externals: {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@cartae/plugin-sdk': 'CartaePluginSDK'
}
```

### 3.2. Alternatives
- **All-bundled**: zéro conflit, bundle plus gros.
- **Virtual env** par plugin: isolation complète.

### 3.3. Lock & Integrity
- Lockfiles + SRI + hash validation.

---

## 4) Delta Updates

- **bsdiff/courgette**: patchs binaires; **file-level deltas**.
- **Règle**: delta > 60% → servir *full*.
- **Vérifications**: hash avant/après patch, signature, rollback.

---

## 5) Code Signing & Supply-Chain Security

### 5.1. Signature multi-couches
1) Marketplace  
2) Developer  
3) File hashes + SRI  

### 5.2. Sigstore / Cosign
- OIDC identities, provenance attestée, builds vérifiables.

### 5.3. SBOM & Policies
- SBOM embarqué (CycloneDX/SPDX), blocage vulnérabilités connues.

---

## 6) Marketplace (API & Backend)

### Services
- Plugin Service, Search Service, Review Service, Analytics Service.

### Endpoints
```http
POST /api/v1/plugins
GET /api/v1/plugins/:id
GET /api/v1/plugins/:id/versions
POST /api/v1/plugins/:id/install
```

### Schéma SQL
```sql
CREATE TABLE plugins (
  id varchar(255) primary key,
  name varchar(255) not null,
  description text,
  author_id uuid references users(id),
  version varchar(50),
  manifest jsonb,
  downloads integer default 0
);
```

---

## 7) Search & Discovery
- MVP: SQL LIKE.
- Scale: Elasticsearch ou Algolia.
- Facettes: catégories, tags, rating, compatibilité.

---

## 8) Monorepo & DX (Turborepo)
- Workspaces, pipelines, cache distant, HMR dev loop.

---

## 9) Modération & Qualité
- Signature, audit, virus scan, lint, bundle budget, AI flagging, review humaine.

---

## 10) Release Management
- Channels (alpha/beta/stable), staged rollout, auto-rollback.

---

## 11) Privacy, Audit & RGPD
- Data minimization, opt-in metrics, logs signés, TTL 90 jours.

---

## 12) Interfaces & API (Core)
```ts
interface RegistryClient {
  getManifest(id: string): Promise<PluginManifest>;
}
interface PluginInstaller {
  install(id: string, version: string): Promise<void>;
}
interface UpdateManager {
  check(id: string): Promise<UpdateInfo | null>;
}
```

---

## ROLE: STORAGE-DISTRO-ENGINEER
**Mission**: Implémenter la **chaîne complète de distribution** Cartae.  
**Règles**:
1. npm + Verdaccio (MVP).  
2. CDN performant, delta updates, fallback chain.  
3. Signatures multi-couches + SBOM.  
4. Marketplace API + recherche + analytics RGPD.  
5. Observabilité totale (latence, crash rate, signature errors).

**Sorties attendues**:
- SDKs (`RegistryClient`, `PluginInstaller`, `UpdateManager`)  
- CI/CD pipeline signée  
- Logs et audit RGPD-ready
