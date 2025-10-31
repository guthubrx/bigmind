# 🚀 Déploiement Migration admin_users

## ✅ Edge Functions Déployées

Les 5 Edge Functions sont **déjà déployées** sur Supabase :

- ✅ `verify-admin`
- ✅ `admin-approve-rating`
- ✅ `admin-reject-rating`
- ✅ `admin-update-report-status`
- ✅ `admin-delete-report`

**Dashboard:** https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/functions

---

## 📋 Étape Restante : Exécuter la Migration SQL

### Option 1 : Via SQL Editor (RECOMMANDÉ)

1. **Ouvre le SQL Editor :**
   https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/sql/new

2. **Copie-colle le contenu ci-dessous :**

```sql
-- Copie TOUT le contenu de :
-- supabase/migrations/20251030_admin_users.sql
```

3. **Clique sur Run** (ou Cmd+Enter)

4. **Vérification :**
   ```sql
   SELECT * FROM admin_users;
   ```
   Tu devrais voir ta ligne avec :
   - `github_user_id`: 158686865
   - `github_username`: guthubrx
   - `role`: super_admin

---

### Option 2 : Copier-Coller Automatique

Tape cette commande pour copier la migration dans ton presse-papier :

```bash
cat supabase/migrations/20251030_admin_users.sql | pbcopy
```

Puis colle dans SQL Editor et Run.

---

## 🧪 Test Rapide

Après avoir exécuté la migration, teste que tout fonctionne :

### 1. Vérifie que la table existe
```sql
SELECT * FROM admin_users;
```

### 2. Vérifie les fonctions helper
```sql
SELECT * FROM is_github_user_admin('158686865');
```

Devrait retourner :
| is_admin | role        | username  |
|----------|-------------|-----------|
| true     | super_admin | guthubrx  |

### 3. Vérifie les Edge Functions

Ouvre le Dashboard Functions et clique sur chaque fonction pour voir les logs :
https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/functions

---

## ⚠️ Troubleshooting

**Erreur "table already exists" :**
- C'est OK ! La migration a déjà été exécutée
- Vérifie juste avec `SELECT * FROM admin_users;`

**Pas de résultat dans admin_users :**
- Le INSERT a échoué à cause d'un UNIQUE constraint
- Exécute manuellement :
  ```sql
  INSERT INTO admin_users (github_user_id, github_username, role)
  VALUES ('158686865', 'guthubrx', 'super_admin')
  ON CONFLICT (github_user_id) DO NOTHING;
  ```

---

## ✅ Prochaine Étape

Une fois la migration exécutée, on passe à :
- Mettre à jour AdminPanel.tsx pour utiliser AdminAPIClient
- Rebuild le plugin
- Tester le flow complet

**Quand c'est fait, dis-moi et on continue !** 🚀
