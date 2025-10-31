# Système de Storage pour Plugins Cartae

## 🎯 Concept : "Cartes Porteuses d'Extensions"

Les cartes mentales Cartae sont maintenant des **documents auto-suffisants** qui transportent leurs propres extensions et données de plugins.

### Avant

```
Ma_Carte.cartae
├─ Contenu de la carte
└─ nodePaletteId: "vibrant"  ❌ Difficile à étendre
```

### Maintenant

```
Ma_Carte.cartae
├─ Contenu de la carte
├─ Plugins requis: [palette-manager, education]
└─ Données des plugins:
   ├─ palette-manager: {palettes, thèmes...}
   ├─ education: {cours, étudiants...}
   └─ project: {phases, budget...}
```

## 🌟 Avantages

### 1. Portabilité Totale

- ✅ Une carte = tout ce dont elle a besoin
- ✅ Pas de configuration externe
- ✅ Partage simplifié entre utilisateurs

### 2. Évolutivité

- ✅ Les plugins peuvent évoluer leur format de données
- ✅ Migrations automatiques
- ✅ Pas de perte de données

### 3. Découvrabilité

- ✅ La carte indique quels plugins utiliser
- ✅ Suggestion d'installation automatique (à venir)
- ✅ Versioning des dépendances

### 4. Isolation

- ✅ Chaque plugin a son propre espace
- ✅ Pas de conflits entre plugins
- ✅ Données structurées et typées

## 📦 Pour les Utilisateurs

### Qu'est-ce qui change ?

**Rien !** Tout fonctionne exactement comme avant, mais en mieux :

- Vos anciennes cartes sont **automatiquement migrées** au chargement
- Les nouvelles cartes incluent les données des plugins
- Vous pouvez partager vos cartes sans souci de configuration

### Exemple : Palette de Couleurs

**Avant :** Les palettes étaient stockées dans des champs génériques du fichier.

**Maintenant :** Le plugin `palette-manager` stocke ses données de manière structurée :

```json
{
  "pluginData": {
    "com.cartae.palette-manager": {
      "_meta": {
        "pluginVersion": "1.0.0",
        "schemaVersion": "1"
      },
      "data": {
        "nodePaletteId": "vibrant",
        "tagPaletteId": "pastel",
        "customColors": [...]
      }
    }
  }
}
```

## 👨‍💻 Pour les Développeurs de Plugins

### Installation Rapide

```typescript
import { pluginDataManager } from '../utils/pluginDataManager';

// Créer un storage pour votre plugin
const storage = pluginDataManager.getStorage(
  'com.votrecompagnie.votre-plugin',
  '1.0.0', // Version de votre plugin
  '1' // Version du schéma de données
);
```

### API Complète

#### Écrire des Données

```typescript
// Simple
await storage.set('config', {
  theme: 'dark',
  language: 'fr'
});

// Complexe
await storage.set('userData', {
  students: [...],
  courses: [...],
  grades: {...}
});
```

#### Lire des Données

```typescript
// Lecture avec type
const config = await storage.get<MyConfig>('config');

// Les migrations s'exécutent automatiquement si nécessaire
const userData = await storage.get('userData');
```

#### Gestion des Clés

```typescript
// Lister toutes les clés
const keys = await storage.keys();

// Supprimer une clé
await storage.delete('oldData');
```

### Déclarer des Dépendances

```typescript
// Marquer votre plugin comme nécessaire
storage.markAsRequired('1.0.0', '2.0.0');

// Ou comme recommandé
storage.markAsRecommended();
```

Le fichier contiendra alors :

```json
{
  "plugins": {
    "required": [
      {
        "id": "com.votrecompagnie.votre-plugin",
        "minVersion": "1.0.0",
        "maxVersion": "2.0.0"
      }
    ]
  }
}
```

## 🔄 Système de Migrations

### Pourquoi des Migrations ?

Votre plugin évolue. Le format de données aussi. Les migrations permettent de **transformer automatiquement** les anciennes données vers le nouveau format.

### Exemple Concret

Imaginons que votre plugin évolue :

**Version 1** → **Version 2**

- `colors: string[]` → `palette: { colors: Color[], theme: string }`

```typescript
// Déclarer la migration
storage.registerMigration('1', '2', async oldData => {
  return {
    palette: {
      colors: oldData.colors.map(hex => ({ hex, name: generateName(hex) })),
      theme: 'custom',
    },
  };
});
```

**Magie :** Quand un utilisateur ouvre une ancienne carte, la migration s'exécute automatiquement !

### Migrations Multi-étapes

Le système trouve automatiquement le chemin optimal :

```typescript
// Vous déclarez les étapes
storage.registerMigration('1', '2', migration1to2);
storage.registerMigration('2', '3', migration2to3);
storage.registerMigration('3', '4', migration3to4);

// Le système migre automatiquement : 1 → 2 → 3 → 4
const data = await storage.get('myData');
```

### Chemins Alternatifs

```typescript
// Migration directe pour les cas spéciaux
storage.registerMigration('1', '3', directMigration1to3);

// Le système choisit le chemin le plus court
// 1 → 3 → 4 au lieu de 1 → 2 → 3 → 4
```

## 🎓 Cas d'Usage

### Plugin Éducation

```typescript
const storage = pluginDataManager.getStorage(
  'com.cartae.education',
  '1.0.0',
  '1'
);

// Stocker des informations de cours
await storage.set('course', {
  title: 'Introduction à React',
  level: 'intermédiaire',
  students: [
    { id: 1, name: 'Alice', progress: 75 },
    { id: 2, name: 'Bob', progress: 60 }
  ],
  assignments: [...]
});

// Marquer comme requis
storage.markAsRequired('1.0.0');
```

**Résultat :** La carte devient un document pédagogique complet qui se transporte avec ses données d'étudiants et de progression.

### Plugin Gestion de Projet

```typescript
const storage = pluginDataManager.getStorage('com.cartae.project-management', '1.0.0', '1');

await storage.set('project', {
  name: 'Refonte Site Web',
  startDate: '2025-01-01',
  phases: [
    { id: 1, name: 'Analyse', status: 'completed', duration: 2 },
    { id: 2, name: 'Design', status: 'in-progress', duration: 3 },
  ],
  budget: {
    allocated: 50000,
    spent: 15000,
  },
});

await storage.set('team', {
  members: [
    { id: 1, name: 'Alice', role: 'Lead Dev', allocation: 100 },
    { id: 2, name: 'Bob', role: 'Designer', allocation: 50 },
  ],
});
```

### Plugin Recherche Scientifique

```typescript
const storage = pluginDataManager.getStorage(
  'com.cartae.research',
  '1.0.0',
  '1'
);

await storage.set('paper', {
  title: 'Machine Learning in Healthcare',
  authors: ['Dr. Smith', 'Dr. Jones'],
  references: [...],
  methodology: {
    type: 'experimental',
    sampleSize: 1000,
    tools: ['Python', 'TensorFlow']
  },
  results: {
    accuracy: 0.95,
    precision: 0.93
  }
});
```

## 📚 Structure d'un Fichier

```json
{
  "version": "2.0",
  "name": "Ma Carte Mentale",

  "plugins": {
    "required": [
      {
        "id": "com.cartae.palette-manager",
        "minVersion": "1.0.0",
        "dataSchemaVersion": "1"
      }
    ],
    "recommended": [
      {
        "id": "com.cartae.education",
        "minVersion": "1.0.0",
        "dataSchemaVersion": "1"
      }
    ]
  },

  "pluginData": {
    "com.cartae.palette-manager": {
      "_meta": {
        "pluginVersion": "1.0.0",
        "schemaVersion": "1",
        "writtenAt": "2025-01-15T10:30:00Z",
        "migrationHistory": []
      },
      "data": {
        "nodePaletteId": "vibrant",
        "tagPaletteId": "pastel"
      }
    },
    "com.cartae.education": {
      "_meta": {...},
      "data": {
        "course": {...},
        "students": [...]
      }
    }
  },

  "nodes": {...},
  "edges": {...}
}
```

## 🛠️ Migration de Plugins Existants

### Étape 1 : Créer le Storage

```typescript
// Dans votre plugin
const storage = pluginDataManager.getStorage('com.cartae.mon-plugin', '1.0.0', '1');
```

### Étape 2 : Remplacer les Accès Directs

**Avant :**

```typescript
const paletteId = fileData.nodePaletteId;
fileData.nodePaletteId = 'new-palette';
```

**Après :**

```typescript
const paletteId = await storage.get('nodePaletteId');
await storage.set('nodePaletteId', 'new-palette');
```

### Étape 3 : Migration Automatique

Les anciennes cartes sont **automatiquement migrées** au chargement. Pas besoin de code supplémentaire !

## 🔍 Détails Techniques

### Métadonnées Automatiques

Chaque plugin storage contient des métadonnées automatiques :

- `pluginVersion` : Version du plugin qui a écrit les données
- `schemaVersion` : Version du format des données
- `writtenAt` : Timestamp d'écriture
- `migrationHistory` : Historique des migrations appliquées

### Isolation des Données

Chaque plugin a son propre namespace :

```
pluginData/
├─ com.cartae.palette-manager/
│  ├─ _meta/
│  └─ data/
├─ com.cartae.education/
│  ├─ _meta/
│  └─ data/
└─ com.votre-plugin/
   ├─ _meta/
   └─ data/
```

### Performance

- **Lecture :** Accès direct O(1) par clé
- **Migration :** Exécutée une seule fois, résultat sauvegardé
- **Écriture :** Métadonnées mises à jour automatiquement

## 📖 Ressources

### Documentation Technique

- `PLUGIN_STORAGE_MIGRATION.md` - Architecture et plan d'implémentation
- `PLUGIN_STORAGE_IMPLEMENTATION.md` - Documentation complète de l'implémentation

### Fichiers Sources

- `apps/web/src/utils/fileFormat.ts` - Types et interfaces
- `apps/web/src/utils/pluginStorage.ts` - Implémentation du storage
- `apps/web/src/utils/migrationManager.ts` - Système de migrations
- `apps/web/src/utils/pluginDataManager.ts` - Gestionnaire centralisé
- `apps/web/src/utils/legacyDataMigration.ts` - Migration automatique

## 🚀 Prochaines Étapes

### Interface de Compatibilité (Phase 3)

- Dialog de suggestion de plugins manquants
- Vérification des versions au chargement
- UI de gestion des dépendances

### Améliorations Futures

- Cache des migrations pour performance optimale
- Validation de schéma avec JSON Schema
- Export/import sélectif de données de plugins
- API de nettoyage des données orphelines

## 💡 Conseils et Bonnes Pratiques

### Nommage des Plugins

Utilisez un identifiant unique et descriptif :

```typescript
// ✅ Bon
'com.cartae.palette-manager';
'com.votrecompagnie.education';
'org.votre-org.project-tools';

// ❌ À éviter
'palette';
'plugin1';
'my-plugin';
```

### Versioning des Schémas

Incrémentez le numéro de version du schéma à chaque changement de structure :

```typescript
// Version 1
{ colors: string[] }

// Version 2 → Incrémenter !
{ palette: { colors: Color[], theme: string } }
```

### Migrations Progressives

Préférez plusieurs petites migrations plutôt qu'une grosse :

```typescript
// ✅ Bon - Étapes claires
storage.registerMigration('1', '2', addThemeField);
storage.registerMigration('2', '3', convertColorsToObjects);
storage.registerMigration('3', '4', addColorNames);

// ❌ À éviter - Migration monolithique
storage.registerMigration('1', '4', hugeComplexMigration);
```

### Typage TypeScript

Définissez des interfaces pour vos données :

```typescript
interface MyPluginData {
  config: {
    theme: string;
    language: string;
  };
  userData: {
    preferences: Record<string, any>;
  };
}

// Utilisation typée
const config = await storage.get<MyPluginData['config']>('config');
```

## 🎉 Conclusion

Le système de Plugin Storage transforme Cartae en une **plateforme extensible** où les cartes mentales deviennent de véritables documents riches et auto-suffisants.

**Pour les utilisateurs :** Partage simplifié, pas de configuration.
**Pour les développeurs :** API puissante, migrations automatiques, isolation garantie.

Bienvenue dans l'ère des **Cartes Porteuses d'Extensions** ! 🚀
