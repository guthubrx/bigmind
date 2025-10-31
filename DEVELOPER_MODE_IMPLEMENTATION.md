# Phase 2 : Developer Mode + GitHub OAuth - Implémentation

## Résumé

Cette implémentation ajoute un mode développeur complet au système de plugins Cartae, permettant aux développeurs de cloner, modifier et publier des plugins community via GitHub.

## Fichiers créés

### Services

1. **`apps/web/src/services/GitHubAuthService.ts`**
   - Service d'authentification GitHub via Personal Access Token (PAT)
   - Fonctions : `login()`, `logout()`, `getUser()`, `getToken()`, `isAuthenticated()`, `validateToken()`
   - Stockage dans localStorage pour persistance

2. **`apps/web/src/services/PluginDevService.ts`**
   - Service de développement de plugins
   - `clonePlugin()` : Télécharge un plugin depuis GitHub et génère les fichiers de configuration
   - `publishPlugin()` : Vérifie l'ownership et génère les instructions de publication
   - `openInVSCode()` : Ouvre le plugin dans VSCode (bonus)

### Composants React

3. **`apps/web/src/components/plugins/GitHubLoginButton.tsx`**
   - Composant de connexion/déconnexion GitHub
   - Affiche un formulaire pour saisir le GitHub PAT
   - Affiche l'utilisateur connecté et permet la déconnexion

4. **`apps/web/src/components/plugins/DeveloperModeToggle.tsx`**
   - Toggle pour activer/désactiver le mode développeur
   - Hook `useDeveloperMode()` pour récupérer l'état dans d'autres composants
   - Persistance dans localStorage

## Fichiers modifiés

5. **`apps/web/src/pages/Settings.tsx`**
   - Ajout d'une nouvelle section "Développeur" dans la sidebar
   - Intégration de `DeveloperModeToggle` et `GitHubLoginButton`
   - Instructions pour les développeurs
   - Correction de l'erreur TypeScript avec `onViewDetails`

6. **`apps/web/src/components/plugins/PluginCard.tsx`**
   - Ajout de props pour le mode développeur :
     - `developerMode?: boolean`
     - `onCloneForDev?: () => void`
     - `onPublish?: () => void`
     - `onOpenInVSCode?: () => void`
   - Affichage conditionnel des boutons "Clone for Dev", "Publish", et "Open in VSCode"
   - Boutons visibles uniquement pour les plugins `source='community'` en mode développeur

7. **`apps/web/src/components/plugins/PluginManager.tsx`**
   - Utilisation du hook `useDeveloperMode()` pour obtenir l'état
   - Ajout des handlers :
     - `handleCloneForDev()`
     - `handlePublish()`
     - `handleOpenInVSCode()`
   - Passage des props de développement à `PluginCard`
   - Affichage des boutons uniquement pour les plugins community

8. **`apps/web/src/components/plugins/index.ts`**
   - Export des nouveaux composants :
     - `GitHubLoginButton`
     - `DeveloperModeToggle` et `useDeveloperMode`

## Fonctionnalités implémentées

### 1. Authentification GitHub

- Login via GitHub Personal Access Token (PAT)
- Validation du token avec l'API GitHub
- Stockage sécurisé dans localStorage
- Affichage du username et avatar
- Logout

### 2. Mode Développeur

- Toggle activable dans Settings > Développeur
- État persisté dans localStorage
- Hook `useDeveloperMode()` pour accès global
- Indicateur visuel quand actif

### 3. Boutons Developer sur PluginCard

Les boutons apparaissent uniquement si :

- Developer Mode est activé
- Plugin source = 'community'

**Clone for Dev** :

- Télécharge `index.ts` et `manifest.json` depuis GitHub
- Génère `package.json`, `tsconfig.json`, `vite.config.ts`
- Stocke les instructions dans sessionStorage
- Affiche les instructions dans une alert (MVP)

**Publish to Registry** :

- Vérifie que l'utilisateur est connecté à GitHub
- Vérifie que `manifest.author.github === user.login`
- Génère les instructions de publication (création PR, etc.)
- Affiche les instructions dans une alert

**Open in VSCode** (bonus) :

- Ouvre le dossier du plugin via protocole `vscode://file/`
- Nécessite VSCode installé sur la machine

### 4. Section Developer dans Settings

- Explication du mode développeur
- Toggle pour activer/désactiver
- Formulaire de connexion GitHub
- Instructions étape par étape

## Instructions pour l'utilisateur

### Comment obtenir un GitHub Personal Access Token (PAT)

1. Allez sur GitHub : https://github.com/settings/tokens/new
2. Remplissez le formulaire :
   - **Note** : "Cartae Plugin Development"
   - **Expiration** : Choisissez la durée souhaitée (90 jours recommandé)
   - **Scopes requis** :
     - `repo` : Accès complet aux repositories
     - `read:user` : Lire les informations de profil
3. Cliquez sur "Generate token"
4. **Important** : Copiez le token immédiatement (vous ne pourrez pas le revoir)
5. Dans Cartae, allez dans Settings > Développeur
6. Collez le token dans le champ "GitHub Personal Access Token"
7. Cliquez sur "Se connecter"

### Workflow de développement

1. **Activer le mode développeur**
   - Settings > Développeur > Activer le toggle

2. **Se connecter à GitHub**
   - Settings > Développeur > Entrer votre PAT

3. **Cloner un plugin community**
   - Settings > Plugins
   - Trouvez un plugin community
   - Cliquez sur "Clone for Dev"
   - Suivez les instructions pour créer les fichiers localement

4. **Développer**
   - Modifiez le code dans `apps/web/src/plugins/community/{plugin-id}/`
   - Testez localement

5. **Publier**
   - Cliquez sur "Publish to Registry"
   - Suivez les instructions pour créer une Pull Request

## Limitations actuelles (MVP)

### 1. Pas de File System Access API

- Le clonage ne crée pas automatiquement les fichiers
- L'utilisateur doit copier manuellement le contenu depuis sessionStorage
- Pour l'avenir : utiliser File System Access API (Chrome/Edge)

### 2. Pas d'intégration Git automatique

- La publication ne fait pas de commit/push automatique
- L'utilisateur doit créer manuellement la PR sur GitHub
- Pour l'avenir : GitHub Actions ou backend Node.js

### 3. Token stocké en localStorage

- Sécurité limitée (accessible en JS)
- Alternative future : Backend avec OAuth proper flow

### 4. Pas de build automatique

- Le plugin doit être buildé manuellement avant publication
- Pour l'avenir : intégrer Vite build dans le workflow

## TODOs pour améliorer

1. **File System Access API**
   - Implémenter le vrai clonage de fichiers vers le système
   - Nécessite Chrome/Edge ou polyfill

2. **GitHub Actions Workflow**
   - Automatiser le build et la publication
   - Créer automatiquement la PR via GitHub API

3. **OAuth Flow proper**
   - Backend Node.js pour gérer l'OAuth
   - Plus sécurisé que PAT en localStorage

4. **Build intégré**
   - Bouton "Build Plugin" dans l'UI
   - Utiliser Vite programmatiquement

5. **Plugin Templates**
   - Template generator pour nouveaux plugins
   - Wizard avec questions (nom, description, catégorie, etc.)

6. **Tests intégrés**
   - Bouton "Run Tests" dans l'UI
   - Afficher les résultats dans un panel

7. **Hot Reload**
   - Recharger automatiquement le plugin lors des modifications
   - Watch mode intégré

## Architecture technique

### Flow d'authentification

```
User → GitHubLoginButton
  → GitHubAuthService.login(token)
    → fetch('https://api.github.com/user')
      → localStorage.setItem('cartae-github-token')
      → localStorage.setItem('cartae-github-user')
```

### Flow de clonage

```
User → PluginCard "Clone for Dev"
  → PluginManager.handleCloneForDev()
    → PluginDevService.clonePlugin()
      → GitHubPluginRegistry.getManifest()
      → fetch(raw.githubusercontent.com/.../index.ts)
      → Generate package.json, tsconfig.json, vite.config.ts
      → sessionStorage.setItem('clone-instructions-{id}')
      → alert(instructions)
```

### Flow de publication

```
User → PluginCard "Publish"
  → PluginManager.handlePublish()
    → PluginDevService.publishPlugin()
      → GitHubAuthService.getUser()
      → Verify author.github === user.login
      → Generate publication instructions
      → alert(instructions)
```

## Sécurité

- **Token GitHub** : Stocké en localStorage (limitation MVP)
- **Vérification ownership** : `manifest.author.github` doit correspondre au user connecté
- **Rate limiting** : Utiliser les limites de GitHub API (5000 req/h authentifié)
- **CORS** : GitHub API supporte CORS, pas de proxy nécessaire

## Performance

- **Cache** : GitHubPluginRegistry cache le registry.json (5min TTL)
- **Lazy loading** : Services importés dynamiquement
- **SessionStorage** : Utilisé pour les instructions de clonage (évite re-fetch)

## Tests

Pour tester l'implémentation :

1. Lancer l'app : `npm run dev`
2. Aller dans Settings > Développeur
3. Créer un GitHub PAT sur https://github.com/settings/tokens/new
4. Se connecter avec le PAT
5. Activer le mode développeur
6. Aller dans Settings > Plugins
7. Vérifier que les boutons "Clone for Dev" et "Publish" apparaissent sur les plugins community

## Dépendances ajoutées

Aucune nouvelle dépendance npm. Utilise uniquement :

- React (déjà présent)
- lucide-react (déjà présent)
- fetch API (natif)
- localStorage API (natif)
- sessionStorage API (natif)

## Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge (modernes)
- **VSCode Protocol** : Nécessite VSCode installé (bonus feature)
- **GitHub API** : Fonctionne avec GitHub public et privé repos
