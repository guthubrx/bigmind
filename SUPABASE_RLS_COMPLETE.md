# Fix Complet RLS pour Plugin Ratings

## Le problème
```
Error code: 42501
message: 'new row violates row-level security policy for table "plugin_ratings"'
```

Tu n'as pas la permission INSERT pour soumettre des ratings.

## Solution: Exécuter ce SQL exactement

**Copie-colle TOUT ce texte** dans Supabase SQL Editor et clique RUN:

```sql
-- ============================================
-- STEP 1: Drop all existing policies
-- ============================================
DROP POLICY IF EXISTS "Allow public read" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public insert" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public read approved ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow anyone to insert ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow anyone to insert unapproved ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow admins to update approval status" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow admins to delete ratings" ON plugin_ratings;

-- ============================================
-- STEP 2: Create correct policies
-- ============================================

-- 1. Public can READ only approved ratings
CREATE POLICY "Allow public read approved ratings"
ON plugin_ratings
FOR SELECT
USING (is_approved = true);

-- 2. Public can INSERT new ratings (unapproved by default)
CREATE POLICY "Allow public insert unapproved ratings"
ON plugin_ratings
FOR INSERT
WITH CHECK (is_approved = false);

-- 3. Authenticated users (admins) can UPDATE approval status
CREATE POLICY "Allow admins update approval"
ON plugin_ratings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Authenticated users (admins) can DELETE ratings
CREATE POLICY "Allow admins delete ratings"
ON plugin_ratings
FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 3: Verify (optional)
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'plugin_ratings'
ORDER BY policyname;
```

---

## ✅ Après exécution:

1. Tu devrais voir 4 policies:
   - ✅ "Allow public read approved ratings"
   - ✅ "Allow public insert unapproved ratings"
   - ✅ "Allow admins update approval"
   - ✅ "Allow admins delete ratings"

2. **Recharge la page** (Ctrl+Shift+R)
3. **Soumets un nouveau rating**
4. Tu devrais voir: `✅ Rating submitted successfully`

---

## 🐛 Si ça ne marche pas:

Va à Supabase Dashboard → Tables → plugin_ratings → RLS Settings
- Vérifie que RLS est **ACTIVÉ** (toggle vert)
- Vérifie que tu vois les 4 policies listées
- Si une policy manque, elle a pas été créée (erreur SQL?)

---

## 📝 Notes

- **Line 2**: Publique peut lire SEULEMENT les ratings approuvés
- **Line 5**: Publique peut INSÉRER des ratings (toujours non approuvés au départ)
- **Line 8**: Admins authentifiés peuvent METTRE À JOUR (changer is_approved)
- **Line 11**: Admins authentifiés peuvent SUPPRIMER (rejeter)

Exécute ce SQL et dis-moi le résultat! 👇
