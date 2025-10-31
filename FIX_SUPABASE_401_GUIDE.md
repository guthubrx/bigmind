# 🔧 Guide : Correction Erreur Supabase 401

**Date :** 31 Octobre 2025
**Problème :** Erreur 401 "Invalid API key" sur `/rest/v1/plugin_ratings`
**Solution :** Recréer les tables avec les bonnes permissions

---

## 📋 Diagnostic

**Symptôme :**

```
[Supabase] Error fetching ratings:
Object { message: "Invalid API key", hint: "Double check your Supabase `anon` or `service_role` API key." }
```

**Cause probable :**

- Tables `plugin_ratings` n'existent pas ou ont été supprimées
- Permissions (GRANTS) incorrectes ou manquantes
- RLS activé et bloque les requêtes anonymes

---

## ✅ Solution Rapide (Recommandée)

### **Étape 1 : Ouvrir Supabase SQL Editor**

1. Va sur : https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/sql/new
2. Ou depuis le dashboard Cartae → SQL Editor → New query

### **Étape 2 : Exécuter la migration complète**

**Option A : Via le fichier de migration**

1. Ouvre le fichier : `supabase/migrations/20251031_complete_ratings_setup.sql`
2. Copie **tout le contenu** (Cmd+A → Cmd+C)
3. Colle dans le SQL Editor Supabase
4. Clique sur **"Run"** (ou Cmd+Enter)

**Option B : Copie directe**

Copie et exécute ce SQL :

```sql
-- ============================================
-- SUPABASE COMPLETE SETUP FOR CARTAE
-- ============================================

-- 1. Drop existing objects (clean slate)
DROP TABLE IF EXISTS plugin_rating_replies CASCADE;
DROP TABLE IF EXISTS plugin_ratings CASCADE;
DROP TABLE IF EXISTS rating_submissions CASCADE;

-- 2. Create rating_submissions (rate limiting)
CREATE TABLE rating_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rating_submissions_plugin_ip ON rating_submissions("pluginId", ip_address, created_at DESC);

-- 3. Create plugin_ratings
CREATE TABLE plugin_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create plugin_rating_replies
CREATE TABLE plugin_rating_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "rating_id" UUID NOT NULL REFERENCES plugin_ratings(id) ON DELETE CASCADE,
  "author_name" TEXT NOT NULL,
  "reply_text" TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX idx_plugin_ratings_pluginId ON plugin_ratings("pluginId");
CREATE INDEX idx_plugin_ratings_is_approved ON plugin_ratings(is_approved) WHERE is_approved = false;
CREATE INDEX idx_plugin_ratings_created_at ON plugin_ratings(created_at DESC);
CREATE INDEX idx_plugin_ratings_plugin_approved ON plugin_ratings("pluginId", is_approved);
CREATE INDEX idx_plugin_rating_replies_rating_id ON plugin_rating_replies("rating_id");

-- 6. DISABLE RLS (simplifie l'accès)
ALTER TABLE plugin_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_rating_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rating_submissions DISABLE ROW LEVEL SECURITY;

-- 7. GRANT permissions
GRANT SELECT, INSERT ON plugin_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_ratings TO authenticated;
GRANT SELECT, INSERT ON plugin_rating_replies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_rating_replies TO authenticated;
GRANT SELECT, INSERT ON rating_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON rating_submissions TO authenticated;

-- 8. Verify (affiche les résultats)
SELECT 'Tables créées:' as status, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('plugin_ratings', 'plugin_rating_replies', 'rating_submissions');

SELECT 'RLS status:' as info, tablename,
  CASE WHEN rowsecurity THEN 'ENABLED ⚠️' ELSE 'DISABLED ✅' END as rls_status
FROM pg_tables
WHERE tablename IN ('plugin_ratings', 'plugin_rating_replies', 'rating_submissions');

SELECT 'Permissions:' as info, grantee, table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('plugin_ratings', 'plugin_rating_replies', 'rating_submissions')
GROUP BY grantee, table_name
ORDER BY table_name, grantee;
```

### **Étape 3 : Vérifier les résultats**

Tu devrais voir :

**Tables créées :**

```
status          | table_name
----------------|---------------------------
Tables créées:  | plugin_rating_replies
Tables créées:  | plugin_ratings
Tables créées:  | rating_submissions
```

**RLS status :**

```
info        | tablename              | rls_status
------------|------------------------|------------
RLS status: | plugin_rating_replies  | DISABLED ✅
RLS status: | plugin_ratings         | DISABLED ✅
RLS status: | rating_submissions     | DISABLED ✅
```

**Permissions :**

```
info         | grantee        | table_name              | privileges
-------------|----------------|-------------------------|------------------
Permissions: | anon           | plugin_ratings          | INSERT, SELECT
Permissions: | authenticated  | plugin_ratings          | DELETE, INSERT, SELECT, UPDATE
Permissions: | anon           | plugin_rating_replies   | INSERT, SELECT
Permissions: | authenticated  | plugin_rating_replies   | DELETE, INSERT, SELECT, UPDATE
...
```

---

## ✅ Étape 4 : Tester l'application

1. **Recharge l'application** (Cmd+R ou F5)
2. **Hard refresh** si nécessaire (Cmd+Shift+R)
3. **Vérifie la console** : aucune erreur 401
4. **Teste le marketplace** : les ratings devraient charger

### **Test rapide dans la console du navigateur :**

```javascript
// Teste la connexion Supabase
const { data, error } = await window.supabaseClient.from('plugin_ratings').select('*').limit(5);

console.log('Ratings:', data);
console.log('Error:', error); // devrait être null
```

---

## 🔄 Migrer les données existantes (optionnel)

Si tu avais des ratings approuvés avant la migration, tu peux les restaurer :

```sql
-- Liste des ratings à restaurer (si tu les as sauvegardés)
-- INSERT INTO plugin_ratings (...)
```

---

## 📊 Vérifications Post-Fix

### **1. Vérifier que les tables existent**

```sql
SELECT tablename FROM pg_tables
WHERE tablename LIKE 'plugin_%'
ORDER BY tablename;
```

### **2. Vérifier RLS est DISABLED**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('plugin_ratings', 'plugin_rating_replies', 'rating_submissions');
```

→ Toutes les tables doivent avoir `rowsecurity = false`

### **3. Vérifier les GRANTS**

```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'plugin_ratings'
ORDER BY grantee, privilege_type;
```

→ `anon` doit avoir SELECT et INSERT
→ `authenticated` doit avoir SELECT, INSERT, UPDATE, DELETE

### **4. Tester l'accès depuis l'app**

Dans la console navigateur :

```javascript
const { data, error } = await window.supabaseClient.from('plugin_ratings').select('count');
console.log('Count:', data, 'Error:', error);
```

→ Error doit être `null`

---

## 🎯 Résultat Attendu

Après avoir exécuté la migration :

✅ **Tables créées :**

- `plugin_ratings` (avec colonnes approved_by, approved_at)
- `plugin_rating_replies`
- `rating_submissions`

✅ **RLS DISABLED :** Accès simplifié sans policies compliquées

✅ **GRANTS configurés :**

- `anon` : SELECT + INSERT (lecture et soumission de ratings)
- `authenticated` : SELECT + INSERT + UPDATE + DELETE (admin peut approuver/rejeter)

✅ **Indexes créés :** Performance optimale

✅ **Application fonctionnelle :**

- Aucune erreur 401
- Ratings chargent correctement
- Soumission fonctionne
- Admin panel peut approuver/rejeter

---

## 🐛 Troubleshooting

### **Erreur : "relation already exists"**

Tu avais déjà les tables. Solution :

1. Exécute uniquement la partie GRANTS + DISABLE RLS :

```sql
ALTER TABLE plugin_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_rating_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rating_submissions DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON plugin_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_ratings TO authenticated;
GRANT SELECT, INSERT ON plugin_rating_replies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_rating_replies TO authenticated;
GRANT SELECT, INSERT ON rating_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON rating_submissions TO authenticated;
```

### **Erreur persiste après migration**

1. Vérifie les clés API dans `.env.local` :

```bash
cat apps/web/.env.local | grep SUPABASE
```

2. Vérifie que tu es sur le bon projet Supabase :

```bash
npx supabase projects list
```

→ `Cartae` doit être `LINKED ●`

3. Hard refresh du navigateur : `Cmd+Shift+R`

4. Vide le cache Supabase :

```javascript
// Dans la console navigateur
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## ✅ Checklist Post-Migration

- [ ] SQL exécuté sans erreur dans Supabase SQL Editor
- [ ] 3 tables créées (plugin_ratings, plugin_rating_replies, rating_submissions)
- [ ] RLS disabled sur les 3 tables
- [ ] GRANTS configurés (anon + authenticated)
- [ ] Application rechargée (hard refresh)
- [ ] Aucune erreur 401 dans la console
- [ ] Ratings chargent dans le marketplace
- [ ] Test de soumission d'un rating fonctionne
- [ ] Admin panel peut voir les commentaires en attente

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. Vérifie les logs Supabase : Dashboard → Logs → Postgres Logs
2. Vérifie la console navigateur (F12) pour les erreurs détaillées
3. Copie le message d'erreur exact

---

**Migration créée le :** 31 Octobre 2025
**Pour le projet :** Cartae (ex-BigMind)
**Fichier migration :** `supabase/migrations/20251031_complete_ratings_setup.sql`
