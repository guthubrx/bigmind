# GitHub OAuth Setup Guide

Ce guide explique comment configurer l'authentification GitHub OAuth pour BigMind.

## Pourquoi OAuth plutôt que PAT ?

**Avantages** :

- 🎯 **Meilleure UX** : Un simple clic au lieu de copier/coller un token
- 🔒 **Plus sécurisé** : Le client secret reste côté serveur
- ✅ **Moderne** : Flow standard utilisé par VSCode, Linear, etc.
- 🔄 **Révocable** : Facile à révoquer dans les paramètres GitHub

**Note** : Le PAT reste supporté comme fallback si OAuth n'est pas configuré.

## Étape 1 : Créer une GitHub OAuth App

1. Allez sur https://github.com/settings/developers
2. Cliquez sur **"New OAuth App"**
3. Remplissez le formulaire :
   ```
   Application name: BigMind Plugin Development
   Homepage URL: http://localhost:5173 (développement)
                 https://your-domain.com (production)
   Authorization callback URL: http://localhost:5173 (même que Homepage URL pour SPA)
   ```
4. Cliquez sur **"Register application"**
5. **Copiez le Client ID** affiché
6. Cliquez sur **"Generate a new client secret"**
7. **Copiez le Client Secret** (vous ne pourrez plus le revoir!)

## Étape 2 : Configuration locale (développement)

### 2.1 - Variables d'environnement frontend

Créez un fichier `.env.local` à la racine du projet :

```bash
# À la racine du projet bigmind/
touch .env.local
```

Ajoutez-y :

```env
# GitHub OAuth App credentials
VITE_GITHUB_CLIENT_ID=your_client_id_here

# Supabase Functions URL
VITE_SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1/github-oauth
```

### 2.2 - Secrets Supabase Edge Function

Les secrets de la Edge Function doivent être configurés avec le CLI Supabase :

```bash
# Se connecter à Supabase CLI
npx supabase login

# Lier votre projet (si pas déjà fait)
npx supabase link --project-ref your-project-ref

# Définir les secrets pour la Edge Function
npx supabase secrets set GITHUB_CLIENT_ID=your_client_id_here
npx supabase secrets set GITHUB_CLIENT_SECRET=your_client_secret_here
```

**⚠️ Important** : Ne JAMAIS commiter le Client Secret dans le code !

### 2.3 - Démarrer Supabase localement

```bash
# Démarrer Supabase local (si pas déjà fait)
npx supabase start

# Déployer la Edge Function localement
npx supabase functions serve github-oauth

# Dans un autre terminal, démarrer l'app
pnpm dev
```

## Étape 3 : Configuration production

### 3.1 - Variables d'environnement production

Dans votre plateforme de déploiement (Vercel, Netlify, etc.), ajoutez :

```env
VITE_GITHUB_CLIENT_ID=your_production_client_id
VITE_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1/github-oauth
```

### 3.2 - Déployer la Edge Function sur Supabase

```bash
# Se connecter à Supabase
npx supabase login

# Lier votre projet production
npx supabase link --project-ref your-project-ref

# Déployer la fonction
npx supabase functions deploy github-oauth

# Définir les secrets production
npx supabase secrets set GITHUB_CLIENT_ID=your_production_client_id
npx supabase secrets set GITHUB_CLIENT_SECRET=your_production_client_secret
```

### 3.3 - Créer une OAuth App de production

Créez une **deuxième OAuth App** sur GitHub pour la production :

- Homepage URL: `https://your-domain.com`
- Callback URL: `https://your-domain.com`

**Bonne pratique** : Séparez les apps dev et prod pour éviter les conflits.

## Étape 4 : Tester le flow OAuth

1. Allez dans **Settings > Développeur** dans BigMind
2. Cliquez sur **"Se connecter avec GitHub"**
3. Vous êtes redirigé vers GitHub
4. Autorisez l'application
5. Vous êtes redirigé vers BigMind, connecté automatiquement

## Architecture technique

### Flow OAuth détaillé

```
1. User clique "Se connecter avec GitHub"
   └─> GitHubAuthService.startOAuthFlow()
       └─> Génère un state random (CSRF protection)
       └─> Redirect vers github.com/login/oauth/authorize

2. User autorise l'app sur GitHub
   └─> GitHub redirect vers BigMind avec code + state

3. BigMind détecte le callback (useEffect)
   └─> GitHubAuthService.handleOAuthCallback(code, state)
       └─> Vérifie le state (CSRF protection)
       └─> Appelle Supabase Edge Function /github-oauth
           └─> Edge Function échange code contre token (avec client_secret)
           └─> Edge Function retourne token + user info
       └─> Stocke token + user dans localStorage
       └─> Nettoie les params de l'URL

4. User est connecté !
```

### Fichiers modifiés/créés

**Nouveaux fichiers** :

- `supabase/functions/github-oauth/index.ts` - Edge Function OAuth callback
- `apps/web/src/config/github.ts` - Configuration OAuth
- `GITHUB_OAUTH_SETUP.md` - Ce guide
- `.env.local.example` - Template des variables d'env

**Fichiers modifiés** :

- `apps/web/src/services/GitHubAuthService.ts` - Ajout méthodes OAuth
- `apps/web/src/components/plugins/GitHubLoginButton.tsx` - Bouton OAuth

## Sécurité

### CSRF Protection

- Un `state` random est généré avant le redirect GitHub
- À la réception du callback, on vérifie que le `state` correspond
- Si différent, on rejette (possible attaque CSRF)

### Client Secret

- ✅ Stocké uniquement dans Supabase Edge Function secrets
- ✅ Jamais exposé au frontend
- ✅ Jamais commité dans Git
- ✅ Accessible uniquement par la Edge Function

### Token Storage

- Token stocké dans `localStorage` (même approche que PAT)
- Alternative future : Cookies httpOnly pour plus de sécurité

## Pricing Supabase Edge Functions

**Free Tier** :

- 500,000 appels/mois gratuits
- Pour OAuth : ~1 appel par login
- Même avec 100 users × 10 logins/mois = **1,000 appels seulement**
- Vous êtes **très large** ! 🎉

**Plan Pro** (si dépassement) :

- 25$/mois → 2 millions d'appels
- Coût marginal : ~0.50$/million d'appels supplémentaires

## Troubleshooting

### "OAuth non configuré" affiché

→ Vérifiez que `VITE_GITHUB_CLIENT_ID` est défini dans `.env.local`

### "Edge Function error" lors du callback

→ Vérifiez que :

1. La Edge Function est déployée : `npx supabase functions list`
2. Les secrets sont définis : `npx supabase secrets list`
3. L'URL de la fonction est correcte dans `.env.local`

### "Invalid state parameter"

→ Cookies/localStorage bloqués ? Vérifiez les paramètres du navigateur

### GitHub dit "Redirect URI mismatch"

→ Vérifiez que l'URL de callback dans GitHub OAuth App correspond **exactement** à `window.location.origin`

## Fallback sur PAT

Si OAuth n'est pas configuré, l'app bascule automatiquement sur le PAT :

- Un warning s'affiche
- L'utilisateur peut entrer un PAT manuellement
- Même fonctionnalité, juste moins pratique

## Support

- Documentation GitHub OAuth : https://docs.github.com/en/apps/oauth-apps/building-oauth-apps
- Documentation Supabase Edge Functions : https://supabase.com/docs/guides/functions
- Issues BigMind : https://github.com/guthubrx/bigmind/issues
