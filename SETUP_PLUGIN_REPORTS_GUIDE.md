# Guide d'exécution: Migration Plugin Reports

## 📋 Contexte

Ce guide vous aide à créer les tables `plugin_reports` et `report_submissions` dans votre base de données Supabase.

**Tables créées:**

- `plugin_reports` - Stocke les signalements de plugins
- `report_submissions` - Rate limiting (1 signalement/24h par email)

## 🚀 Étape 1: Accéder au SQL Editor

1. Ouvrez votre projet Supabase: https://supabase.com/dashboard
2. Sélectionnez votre projet Cartae
3. Dans le menu latéral, cliquez sur **SQL Editor**

## 📝 Étape 2: Exécuter la migration

**⚠️ IMPORTANT:** Utilisez la migration corrigée, pas l'ancienne !

1. Cliquez sur **New query** (en haut à gauche)
2. Copiez le contenu du fichier `supabase/migrations/20251031_fix_plugin_reports_schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (ou Ctrl+Enter)

**Note:** Cette migration corrigée remplace `20251031_plugin_reports_setup.sql` qui avait des incohérences de schéma.

## ✅ Étape 3: Vérifier que tout fonctionne

### 3.1 Vérifier que les tables sont créées

Exécutez cette requête:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('plugin_reports', 'report_submissions');
```

**Résultat attendu:**

```
table_name
-----------------------
plugin_reports
report_submissions
```

### 3.2 Vérifier les permissions

Exécutez cette requête:

```sql
-- Vérifier les permissions sur plugin_reports
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'plugin_reports';

-- Vérifier les permissions sur report_submissions
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'report_submissions';
```

**Résultat attendu:**

- `anon` : SELECT, INSERT
- `authenticated` : SELECT, INSERT, UPDATE, DELETE

### 3.3 Vérifier que RLS est désactivé

Exécutez cette requête:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('plugin_reports', 'report_submissions');
```

**Résultat attendu:**

```
tablename              | rowsecurity
-----------------------+-------------
plugin_reports         | false
report_submissions     | false
```

### 3.4 Tester l'API REST

Ouvrez votre navigateur et testez:

```
GET https://[VOTRE-PROJET].supabase.co/rest/v1/plugin_reports
```

**Résultat attendu:** `[]` (tableau vide, pas d'erreur 401)

## 🧹 Étape 4 (Optionnel): Configurer le nettoyage automatique

Pour supprimer automatiquement les `report_submissions` de plus de 24h:

1. Allez dans **Database** → **Cron Jobs**
2. Cliquez sur **Add new cron job**
3. Configuration:
   - **Name**: Cleanup old report submissions
   - **Schedule**: `0 * * * *` (toutes les heures)
   - **Command**: `SELECT cleanup_old_report_submissions();`
4. Cliquez sur **Save**

## 🐛 Dépannage

### Erreur: "relation already exists"

Les tables existent déjà. Vérifiez avec:

```sql
SELECT * FROM plugin_reports LIMIT 1;
SELECT * FROM report_submissions LIMIT 1;
```

### Erreur: "permission denied"

Vous n'avez pas les droits d'administration. Contactez l'admin du projet Supabase.

### Erreur 401 lors du test API

Vérifiez que RLS est bien désactivé:

```sql
ALTER TABLE plugin_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_submissions DISABLE ROW LEVEL SECURITY;
```

## 📊 Résultat final

Après cette migration:

✅ Tables créées et configurées
✅ Permissions correctes (anon + authenticated)
✅ RLS désactivé pour simplifier l'accès
✅ Indexes créés pour performance
✅ Fonction de nettoyage disponible

## 🔄 Prochaine étape

Testez le système de signalement dans l'application:

1. Démarrez l'application: `pnpm dev`
2. Ouvrez le marketplace
3. Essayez de signaler un plugin
4. Vérifiez que le signalement apparaît dans Supabase

## 📚 Référence

- **Fichier de migration:** `supabase/migrations/20251031_fix_plugin_reports_schema.sql` (corrigé)
- ~~Ancien fichier:~~ `20251031_plugin_reports_setup.sql` (ne pas utiliser)
- **Code du service:** `apps/web/src/services/PluginReportService.ts`
- **Composant UI:** `apps/web/src/components/plugins/ReportPluginModal.tsx`

## 🔒 Rate Limiting

Le système de signalement inclut un **rate limiting automatique** :

- **Limite:** 3 signalements par plugin par IP toutes les 24h
- **Mécanisme:** Table `report_submissions` enregistre chaque tentative
- **Détection IP:** Service externe (api.ipify.org) avec fallback anonyme
- **Nettoyage:** Fonction `cleanup_old_report_submissions()` pour supprimer les anciennes entrées

**Implémentation:**

- Vérifie le nombre de signalements dans les dernières 24h
- Bloque si limite atteinte (message d'erreur à l'utilisateur)
- Enregistre chaque soumission réussie
- Nettoyage automatique optionnel via cron job
