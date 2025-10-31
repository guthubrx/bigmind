# 🔌 Guide de Démonstration - Système de Plugins Cartae

Ce guide vous montre comment tester et utiliser le système de plugins Phase 2 avec interface utilisateur complète.

## 🚀 Démarrage Rapide

### 1. Lancer l'application

```bash
pnpm dev
```

L'application démarre avec 2 plugins d'exemple pré-installés :

- **Plugin Exemple** : Démontre les fonctionnalités de base
- **Plugin Analytics** : Collecte des statistiques d'utilisation

### 2. Accéder à la page Plugins

**Option 1 - Via le menu :**

1. Cliquez sur **Outils** dans la barre de menu
2. Sélectionnez **Plugins...** (Ctrl+Shift+P)

**Option 2 - Via l'URL :**
Naviguez directement vers : `http://localhost:5173/plugins`

## 📋 Interface de Gestion des Plugins

L'interface comprend 3 onglets principaux :

### 🔌 Gestionnaire

- **Vue d'ensemble** : Statistiques (Total, Actifs, Erreurs)
- **Filtres** : Tous, Actifs, Inactifs, Erreurs
- **Actions par plugin** :
  - ✅ Activer / ⏸️ Désactiver
  - 🔒 Voir les permissions
  - 🗑️ Désinstaller (si inactif)

### 📊 Audit

- **Statistiques temps réel** :
  - Total événements
  - Événements critiques
  - Erreurs
  - Dernières 24h
- **Filtres** :
  - Par sévérité (Info, Warning, Error, Critical)
  - Par type (Activation, Permissions, API, Alertes)
- **Table des événements** avec codes couleur

### 🔐 Politiques

- **Éditeur ABAC** pour créer des politiques avancées
- **Gestion des règles** Allow/Deny
- **Configuration actions et ressources**
- **Aperçu JSON en temps réel**

## 🧪 Scénarios de Test

### Test 1 : Activer un plugin simple

1. Allez dans l'onglet **Gestionnaire**
2. Trouvez **Plugin Exemple** (statut: Inactif)
3. Cliquez sur **Activer**
4. ✅ Le plugin s'active et demande la permission `mindmap:read`
5. Ouvrez la console du navigateur (F12) pour voir :
   ```
   ✅ Example Plugin activated!
   📊 Active mindmap: Ma première carte
   ```

### Test 2 : Tester le plugin Analytics

1. Activez **Plugin Analytics** (permissions: read, storage:read, storage:write)
2. Créez des nœuds dans votre mindmap (Tab, Entrée)
3. Modifiez des nœuds existants
4. Supprimez des nœuds
5. Vérifiez la console :
   ```
   📊 Analytics Plugin activated!
   📊 Stats updated: {nodesCreated: 3, nodesUpdated: 1, nodesDeleted: 0}
   ```
6. Les stats sont sauvegardées dans localStorage

### Test 3 : Vérifier les permissions

1. Cliquez sur **Permissions** pour un plugin actif
2. Un dialogue s'ouvre avec :
   - Liste des permissions accordées
   - Niveau de risque de chaque permission
   - Détails de sécurité
   - Indicateurs colorés (🟢 Faible, 🟠 Moyen, 🔴 Élevé)

### Test 4 : Consulter les logs d'audit

1. Allez dans l'onglet **Audit**
2. Consultez les événements :
   - 🎉 `plugin:activated` - Activations de plugins
   - ✅ `permission:granted` - Permissions accordées
   - 📞 `api:call` - Appels API effectués
3. Utilisez les filtres pour affiner la recherche
4. Les événements sont colorés par sévérité

### Test 5 : Créer une politique ABAC

1. Allez dans l'onglet **Politiques**
2. Cliquez **+ Nouvelle Politique**
3. Entrez l'ID d'un plugin (ex: `com.cartae.example`)
4. Ajoutez une règle :
   - **Effet** : Allow (Autoriser)
   - **Action** : `mindmap:*` (toutes les actions mindmap)
   - **Ressource** : Laissez vide ou spécifiez
5. Cliquez **Ajouter la règle**
6. Consultez l'aperçu JSON en bas
7. Cliquez **Sauvegarder la politique**

### Test 6 : Désactiver et désinstaller

1. Dans le **Gestionnaire**, trouvez un plugin actif
2. Cliquez **Désactiver**
3. Console affiche : `🛑 Example Plugin deactivated`
4. Une fois désactivé, cliquez **Désinstaller**
5. Le plugin disparaît de la liste

## 🔍 Comprendre les Plugins d'Exemple

### Plugin Exemple (`example-plugin.ts`)

**Permissions demandées :**

- `mindmap:read` - Lire la mindmap active

**Fonctionnalités :**

- S'enregistre sur le hook `mindmap.nodeCreated`
- Affiche des logs quand un nœud est créé
- Récupère la mindmap active via l'API

**Code clé :**

```typescript
context.registerHook('mindmap.nodeCreated', async data => {
  console.log('🎉 New node created:', data);
  return data;
});

const mindmap = await context.api.mindmap.getActive();
```

### Plugin Analytics (`analytics-plugin.ts`)

**Permissions demandées :**

- `mindmap:read` - Lire les données
- `storage:read` - Charger les stats
- `storage:write` - Sauvegarder les stats

**Fonctionnalités :**

- Suit les créations, modifications, suppressions de nœuds
- Persiste les statistiques dans localStorage
- Charge les stats au démarrage

**Statistiques collectées :**

```typescript
{
  nodesCreated: number,
  nodesUpdated: number,
  nodesDeleted: number
}
```

## 🛠️ Créer Votre Propre Plugin

### 1. Créer le fichier plugin

Créez `/apps/web/src/plugins/mon-plugin.ts` :

```typescript
import type { Plugin, PluginManifest, PluginContext } from '@cartae/plugin-system';

const manifest: PluginManifest = {
  id: 'com.monentreprise.monplugin',
  name: 'Mon Plugin',
  version: '1.0.0',
  description: 'Description de mon plugin',
  author: 'Mon Nom',
  permissions: ['mindmap:read'], // Permissions nécessaires
  hooks: ['mindmap.nodeCreated'], // Hooks à écouter
};

export class MonPlugin implements Plugin {
  manifest = manifest;
  private context: PluginContext | null = null;

  async activate(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('✅ Mon Plugin activé!');

    // Votre code ici
  }

  async deactivate(): Promise<void> {
    console.log('🛑 Mon Plugin désactivé');
    this.context = null;
  }
}

export default new MonPlugin();
```

### 2. Enregistrer le plugin

Dans `/apps/web/src/utils/pluginManager.ts`, ajoutez :

```typescript
import monPlugin from '../plugins/mon-plugin';

export async function initializePlugins(): Promise<void> {
  // ... plugins existants ...

  await registry.register(monPlugin);
  console.log('✅ Registered: Mon Plugin');
}
```

### 3. Redémarrer l'application

```bash
# L'application se recharge automatiquement en mode dev
# Votre plugin apparaît dans la liste !
```

## 🔐 Système de Sécurité Phase 2

### Permissions disponibles

| Permission       | Niveau    | Description                   |
| ---------------- | --------- | ----------------------------- |
| `mindmap:read`   | 🟢 Faible | Lire les données des mindmaps |
| `mindmap:write`  | 🟠 Moyen  | Modifier les mindmaps         |
| `mindmap:delete` | 🔴 Élevé  | Supprimer des mindmaps        |
| `storage:read`   | 🟢 Faible | Lire le stockage local        |
| `storage:write`  | 🟠 Moyen  | Écrire dans le stockage       |
| `network`        | 🔴 Élevé  | Accès réseau                  |

### Rôles RBAC

- **Viewer** : Lecture seule (`mindmap:read`)
- **Editor** : Lecture + écriture (`mindmap:read`, `mindmap:write`)
- **Admin** : Tous les droits (toutes permissions)

### Rate Limiting

Par défaut :

- **10 requêtes/seconde** par plugin
- **100 tokens maximum** (Token Bucket)
- Configurable par plugin

### Audit Logging

Tous les événements sont journalisés :

- 🎉 Activation/Désactivation plugins
- ✅ Permissions accordées/refusées
- 📞 Appels API
- 🚨 Alertes sécurité

**Rétention :** 90 jours par défaut

## 📚 Documentation Complète

- **Architecture** : `/packages/plugin-system/SECURITY.md`
- **API Reference** : `/packages/plugin-system/README.md`
- **UI Components** : `/packages/plugin-system/UI_COMPONENTS.md`
- **Spécification Phase 2** : `/packages/plugin-system/PHASE2_SPEC.md`

## ❓ Questions Fréquentes

**Q: Comment déboguer un plugin ?**
R: Ouvrez la console navigateur (F12) et surveillez les logs préfixés par ✅ 🛑 ❌ 📊

**Q: Puis-je désinstaller les plugins d'exemple ?**
R: Oui ! Désactivez-les puis cliquez Désinstaller. Ils sont rechargés au redémarrage.

**Q: Les permissions persistent-elles ?**
R: Oui, dans `localStorage` sous `cartae-plugin-permissions`

**Q: Comment réinitialiser tout le système ?**
R: Supprimez les clés localStorage et rechargez l'application.

## 🎯 Prochaines Étapes

1. ✅ Testez les plugins d'exemple
2. 📝 Créez votre premier plugin
3. 🔐 Explorez les politiques ABAC
4. 📊 Analysez les logs d'audit
5. 🚀 Développez des plugins avancés

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-10-27
**Système:** Cartae Plugin System Phase 2
