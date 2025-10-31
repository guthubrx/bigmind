# Déploiement de la fonction Edge Function: check-rate-limit

## Ce que fait cette fonction

La fonction `check-rate-limit` limite le nombre de ratings qu'un utilisateur peut soumettre par plugin:

- **Max 5 ratings** par plugin par utilisateur (basé sur IP) par **24 heures**
- Retourne `{allowed: true}` si l'utilisateur peut soumettre
- Retourne `{allowed: false, message: "..."}` si la limite est atteinte

## Structure des fichiers

```
supabase/
├── functions/
│   ├── check-rate-limit/
│   │   └── index.ts          ← La fonction
│   └── deno.json             ← Configuration Deno
```

## Comment déployer

### Option 1: Déploiement via Supabase CLI (Recommandé)

1. **Installe Supabase CLI** (si ce n'est pas fait):

```bash
brew install supabase/tap/supabase
```

2. **Login à Supabase**:

```bash
supabase login
```

3. **Link to your project**:

```bash
cd /Users/moi/Nextcloud/10.Scripts/cartae/cartae
supabase projects list  # pour voir ton projet ID
supabase link --project-id rfnvtosfwvxoysmncrzz
```

4. **Deploy the function**:

```bash
supabase functions deploy check-rate-limit
```

✅ La fonction est maintenant deployée!

### Option 2: Déploiement via Dashboard Supabase (Plus simple)

1. Va à: https://supabase.com/dashboard → Cartae → Edge Functions
2. Clique **"Create a new function"**
3. Nomme-la: `check-rate-limit`
4. Copie le contenu de `supabase/functions/check-rate-limit/index.ts`
5. Colle dans l'éditeur
6. Clique **"Deploy"**

## Vérification

Pour tester que la fonction marche:

```bash
curl -X POST https://rfnvtosfwvxoysmncrzz.supabase.co/functions/v1/check-rate-limit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"pluginId": "com.example.test"}'
```

Tu devrais recevoir:

```json
{
  "allowed": true,
  "message": "OK",
  "remaining": 4
}
```

## Notes importantes

⚠️ **Avant de déployer**, assure-toi que:

1. ✅ Le script SQL `SUPABASE_COMPLETE_SETUP.sql` a été exécuté (crée la table `rating_submissions`)
2. ✅ Supabase CLI est installé
3. ✅ Tu es loggé dans Supabase CLI

## Configuration de la fonction

La fonction utilise les variables d'environnement:

- `SUPABASE_URL` - Automatiquement défini
- `SUPABASE_SERVICE_ROLE_KEY` - Automatiquement défini

Ces variables sont fournies par Supabase automatiquement pour les Edge Functions.

## Si ça ne marche pas

### Erreur: "Could not find function"

→ La fonction n'a pas été deployée. Refais l'étape "Deploy the function"

### Erreur: "Table rating_submissions not found"

→ Le script SQL `SUPABASE_COMPLETE_SETUP.sql` n'a pas été exécuté
→ Va dans Supabase SQL Editor et execute le script complet

### Erreur: "Method not allowed"

→ Assure-toi que tu envoies une requête POST (pas GET)

## Amélioration future

Si tu veux modifier le rate limit:

- **Nombre max**: Change `RATE_LIMIT = 5` (ligne 3)
- **Durée**: Change `TIME_WINDOW = 24 * 60 * 60 * 1000` (ligne 4)
