# 🔄 Migration Plugin IDs : BigMind → Cartae

**Date :** 31 Octobre 2025
**Objectif :** Mettre à jour tous les plugin IDs dans la base de données de `com.bigmind.*` vers `com.cartae.*`

---

## 📊 Tables Concernées

| Table | Description | Colonne |
|-------|-------------|---------|
| `plugin_ratings` | Commentaires et notes des plugins | `pluginId` |
| `plugin_reports` | Signalements de plugins | `pluginId` |
| `report_submissions` | Soumissions (rate limiting) | `pluginId` |

---

## ✅ Méthode Recommandée : SQL Editor

### **Étape 1 : Ouvrir Supabase SQL Editor**

URL directe : https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/sql/new

### **Étape 2 : Copier le contenu de la migration**

Le fichier est dans : `supabase/migrations/20251031_rename_plugin_ids.sql`

Ou copie directement ce SQL :

```sql
-- ============================================
-- MIGRATION: BigMind → Cartae Plugin IDs
-- ============================================

-- Update plugin_ratings
UPDATE plugin_ratings
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- Update plugin_reports
UPDATE plugin_reports
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- Update report_submissions
UPDATE report_submissions
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- ============================================
-- VERIFICATION
-- ============================================

-- Vérifier plugin_ratings
SELECT
  'plugin_ratings' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM plugin_ratings;

-- Vérifier plugin_reports
SELECT
  'plugin_reports' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM plugin_reports;

-- Vérifier report_submissions
SELECT
  'report_submissions' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM report_submissions;

-- Lister tous les plugin IDs uniques
SELECT DISTINCT "pluginId"
FROM plugin_ratings
ORDER BY "pluginId";
```

### **Étape 3 : Exécuter**

1. Colle le SQL dans l'éditeur
2. Clique sur **"Run"** (ou `Cmd+Enter`)
3. Vérifie les résultats

### **Étape 4 : Vérifier les Résultats**

Tu devrais voir :
- ✅ `cartae_count` > 0 (les nouveaux IDs)
- ✅ `bigmind_count` = 0 (plus d'anciens IDs)

**Exemple de résultat attendu :**
```
table_name         | total_count | cartae_count | bigmind_count
-------------------+-------------+--------------+--------------
plugin_ratings     | 5           | 5            | 0
plugin_reports     | 0           | 0            | 0
report_submissions | 0           | 0            | 0
```

---

## 🔄 Rollback (Si Nécessaire)

Si tu veux revenir en arrière :

```sql
-- Rollback : Cartae → BigMind
UPDATE plugin_ratings
SET "pluginId" = REPLACE("pluginId", 'com.cartae.', 'com.bigmind.')
WHERE "pluginId" LIKE 'com.cartae.%';

UPDATE plugin_reports
SET "pluginId" = REPLACE("pluginId", 'com.cartae.', 'com.bigmind.')
WHERE "pluginId" LIKE 'com.cartae.%';

UPDATE report_submissions
SET "pluginId" = REPLACE("pluginId", 'com.cartae.', 'com.bigmind.')
WHERE "pluginId" LIKE 'com.cartae.%';
```

---

## 📋 Checklist

Avant d'exécuter :
- [ ] Sauvegarde des données (optionnel, mais recommandé)
- [ ] URL Supabase SQL Editor ouverte
- [ ] SQL copié dans l'éditeur

Après exécution :
- [ ] `bigmind_count` = 0 pour toutes les tables
- [ ] `cartae_count` > 0 (ou = 0 si pas de données)
- [ ] Liste des plugin IDs uniquement en `com.cartae.*`

---

## 🎯 Plugins Concernés

Tous les plugins officiels et communautaires :

### **Plugins Officiels**
- `com.bigmind.theme-manager` → `com.cartae.theme-manager`
- `com.bigmind.export-manager` → `com.cartae.export-manager`
- `com.bigmind.palette-settings` → `com.cartae.palette-settings`
- `com.bigmind.palette-manager` → `com.cartae.palette-manager`
- `com.bigmind.tags-manager` → `com.cartae.tags-manager`
- `com.bigmind.xmind-compatibility` → `com.cartae.xmind-compatibility`
- `com.bigmind.dag-templates` → `com.cartae.dag-templates`

### **Plugins Communautaires** (bigmind-plugins repo)
- `com.bigmind.hello-world` → `com.cartae.hello-world`
- `com.bigmind.example` → `com.cartae.example`
- `com.bigmind.event-monitor` → `com.cartae.event-monitor`
- `com.bigmind.analytics` → `com.cartae.analytics`
- `com.bigmind.color-palettes-collection` → `com.cartae.color-palettes-collection`
- `com.bigmind.dag-templates-collection` → `com.cartae.dag-templates-collection`

### **Plugin Privé**
- `com.bigmind.admin-panel` → `com.cartae.admin-panel`

---

## ⚠️ Notes Importantes

1. **Migration sûre** : Les UPDATE utilisent `WHERE` pour ne cibler que les IDs `com.bigmind.*`
2. **Réversible** : Tu peux rollback si nécessaire (voir section Rollback)
3. **Pas de perte de données** : Seuls les IDs changent, pas le contenu des commentaires/signalements
4. **Instantané** : La migration prend quelques millisecondes

---

## 🚀 Après la Migration

Une fois la migration effectuée :

1. ✅ Les commentaires en attente d'approbation seront liés aux bons plugin IDs
2. ✅ Les signalements pointeront vers les bons plugins
3. ✅ Le système de rate limiting fonctionnera correctement
4. ✅ L'admin panel affichera les bonnes statistiques

**Tout devrait fonctionner automatiquement !** 🎉

---

## 📞 Support

Si tu rencontres un problème :

1. Vérifie que tu es connecté avec le bon compte Supabase
2. Vérifie que tu as les permissions pour exécuter des UPDATE
3. Si erreur, copie le message d'erreur complet

---

**Prêt ? Ouvre le SQL Editor et lance la migration !** 🚀
