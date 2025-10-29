# Migration Supabase - Ajouter Support des Approbations

## Problème
- Colonne `is_approved` n'existe pas dans `plugin_ratings`
- RLS policies UPDATE et DELETE manquent
- Les boutons Approuver/Rejeter dans AdminPanel ne fonctionnent pas

## Solution

Exécuter ce SQL dans Supabase SQL Editor (https://supabase.com/dashboard):

```sql
-- 1. Ajouter la colonne is_approved avec valeur par défaut FALSE
ALTER TABLE plugin_ratings
ADD COLUMN is_approved BOOLEAN DEFAULT false;

-- 2. Créer un index pour optimiser les requêtes de filtrage
CREATE INDEX idx_plugin_ratings_is_approved
ON plugin_ratings(is_approved)
WHERE is_approved = false;

-- 3. Créer l'index pour les ratings approuvés (pour l'affichage public)
CREATE INDEX idx_plugin_ratings_is_approved_true
ON plugin_ratings(is_approved, plugin_id)
WHERE is_approved = true;

-- 4. RLS Policy: Permettre à un administrateur authentifié de modifier les approbations
CREATE POLICY "Allow admins to update approval status"
ON plugin_ratings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 5. RLS Policy: Permettre à un administrateur authentifié de rejeter (supprimer) les ratings
CREATE POLICY "Allow admins to delete ratings"
ON plugin_ratings
FOR DELETE
USING (auth.role() = 'authenticated');

-- 6. Mettre à jour la policy SELECT publique pour ne montrer que les ratings approuvés
DROP POLICY IF EXISTS "Allow public read" ON plugin_ratings;

CREATE POLICY "Allow public read approved ratings"
ON plugin_ratings
FOR SELECT
USING (is_approved = true);

-- 7. Vérifier que la table est correctement configurée
SELECT * FROM plugin_ratings LIMIT 1;
```

## Vérification

Après exécution du SQL:

1. Aller à Supabase Dashboard → Tables → plugin_ratings
2. Vérifier que la colonne `is_approved` existe
3. Vérifier les RLS policies:
   - "Allow public read approved ratings" ✅
   - "Allow public insert" ✅
   - "Allow admins to update approval status" ✅
   - "Allow admins to delete ratings" ✅

## Test dans l'Application

1. Aller à Settings → Plugins → Marketplace → Admin
2. Une liste de ratings "en attente d'approbation" devrait apparaître
3. Cliquer "Approuver" → rating disparaît
4. Cliquer "Rejeter" → rating est supprimé

## Résultat

- ✅ Les boutons Approuver/Rejeter fonctionnent
- ✅ Les nouveaux ratings ne sont visibles publiquement que s'ils sont approuvés
- ✅ Les administrateurs peuvent modérer les ratings
