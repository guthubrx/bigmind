# 🔧 Fix: Boutons Approuver/Rejeter ne fonctionnent pas

## Problème
Quand tu cliques sur "Approuver" ou "Rejeter" dans l'Admin Panel, rien ne se passe.

## Cause
La colonne `is_approved` n'existe pas dans la table Supabase `plugin_ratings`.

## ✅ Solution (5 minutes)

### Étape 1: Aller dans Supabase SQL Editor

1. Ouvre: https://supabase.com/dashboard
2. Clique sur ton projet BigMind
3. Clique sur "SQL Editor" (dans le menu à gauche)
4. Clique sur "New Query"

### Étape 2: Copier le SQL de migration

Copie **TOUT** ce SQL (ctrl+C):

```sql
-- 1. Ajouter la colonne is_approved
ALTER TABLE plugin_ratings
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_plugin_ratings_is_approved
ON plugin_ratings(is_approved)
WHERE is_approved = false;

-- 3. RLS Policy: Allow admins to update
DROP POLICY IF EXISTS "Allow admins to update approval status" ON plugin_ratings;
CREATE POLICY "Allow admins to update approval status"
ON plugin_ratings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. RLS Policy: Allow admins to delete
DROP POLICY IF EXISTS "Allow admins to delete ratings" ON plugin_ratings;
CREATE POLICY "Allow admins to delete ratings"
ON plugin_ratings
FOR DELETE
USING (auth.role() = 'authenticated');

-- 5. Update read policy to only show approved ratings
DROP POLICY IF EXISTS "Allow public read" ON plugin_ratings;
CREATE POLICY "Allow public read approved ratings"
ON plugin_ratings
FOR SELECT
USING (is_approved = true);

-- 6. Vérification finale
SELECT COUNT(*) as total_ratings,
       SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved_ratings
FROM plugin_ratings;
```

### Étape 3: Exécuter le SQL

1. Colle le SQL dans la fenêtre de requête (ctrl+V)
2. Clique sur le bouton **"RUN"** (triangle ▶)
3. Attends 2-3 secondes
4. Tu devrais voir: ✅ "Success. No rows returned"

### Étape 4: Vérifier dans l'app

1. Retour à l'application
2. Aller à **Settings → Plugins → Marketplace → Admin**
3. Une liste de "ratings en attente d'approbation" devrait apparaître
4. Clique **"Approuver"** → le rating disparaît ✅
5. Clique **"Rejeter"** → le rating est supprimé ✅

---

## 🐛 Debug si ça ne marche toujours pas

### Vérifier la colonne existe

Exécute ce SQL dans Supabase:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plugin_ratings'
ORDER BY ordinal_position;
```

Tu devrais voir une colonne `is_approved` de type `boolean`.

### Vérifier les RLS Policies

Va à:
- Supabase Dashboard → Tables → plugin_ratings → RLS Policies
- Vérifie qu'il y a 4 policies:
  - ✅ "Allow public read approved ratings"
  - ✅ "Allow public insert"
  - ✅ "Allow admins to update approval status"
  - ✅ "Allow admins to delete ratings"

### Vérifier les logs console

1. Ouvre DevTools: **F12** ou **Cmd+Option+I** (Mac)
2. Onglet **Console**
3. Cherche les messages d'erreur Supabase
4. Copie l'erreur complète et envoie-la

---

## 📊 Après la fix

Tous les ratings **nouveaux** ne seront visibles au public que s'ils sont approuvés (colonne `is_approved = true`).

Les ratings **existants** sont tous non approuvés par défaut - l'admin doit les vérifier et les approuver.

---

## 📞 Besoin d'aide?

Si ça ne fonctionne pas:
1. Vérifie que tu as exécuté **TOUT** le SQL (pas juste une partie)
2. Attends 5 secondes et recharge la page (ctrl+shift+R / cmd+shift+r)
3. Vérifie la console du navigateur (F12) pour les erreurs
4. Partage les erreurs de la console pour debug
