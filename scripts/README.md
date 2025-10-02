# Scripts BigMind

Ce répertoire contient des scripts utilitaires pour le développement et le débogage de BigMind, numérotés dans leur ordre logique d'utilisation.

## 🔄 Workflow de développement

```
1️⃣ Développement quotidien    → 01-quick-commit.sh
2️⃣ Débogage/branches importantes → 02-debug-and-commit.sh
3️⃣ Création de release       → 03-create-release.sh
4️⃣ Reconstruction binaires   → 04-rebuild-release.sh
```

## Scripts disponibles (ordre logique)

### 1️⃣ `01-quick-commit.sh` - Commit rapide

Script léger pour les commits rapides avec vérification minimale (développement quotidien).

**Usage :**

```bash
# Commit rapide avec message personnalisé
./scripts/01-quick-commit.sh "fix: correction bug"

# Commit rapide avec message automatique
./scripts/01-quick-commit.sh
```

**Fonctionnalités :**

- ✅ Vérification rapide de compilation
- ✅ Commit automatique des changements
- ✅ Messages d'erreur clairs
- ✅ Redirection vers le script de débogage en cas d'erreur

### 2️⃣ `02-debug-and-commit.sh` - Script de débogage complet

Script principal pour le débogage approfondi et la création de commits avec logs détaillés.

**Usage :**

```bash
# Commit avec message personnalisé
./scripts/02-debug-and-commit.sh "feat: nouvelle fonctionnalité"

# Commit avec message automatique
./scripts/02-debug-and-commit.sh
```

**Fonctionnalités :**

- ✅ Collecte d'informations système complètes
- ✅ Vérification des dépendances
- ✅ Option de nettoyage et réinstallation
- ✅ Build complet de tous les packages
- ✅ Exécution des tests et linting
- ✅ Création de commit avec logs détaillés
- ✅ Génération de rapport complet
- ✅ Logs colorés et horodatés

**Logs générés :**
Les logs sont sauvegardés dans `logs/debug_YYYYMMDD_HHMMSS.log` et contiennent :

- Informations système (OS, Node.js, Git, etc.)
- État du projet et des dépendances
- Sortie complète de toutes les commandes
- Rapport final avec résumé

### 3️⃣ `03-create-release.sh` - Création de release manuelle

Script pour créer des releases manuelles de façon contrôlée et éviter les doubles releases.

**Usage :**

```bash
# Release patch (0.1.0 → 0.1.1)
./scripts/03-create-release.sh patch

# Release minor (0.1.0 → 0.2.0)
./scripts/03-create-release.sh minor

# Release major (0.1.0 → 1.0.0)
./scripts/03-create-release.sh major

# Release patch par défaut
./scripts/03-create-release.sh
```

**Fonctionnalités :**

- ✅ Vérification des prérequis (branche main, pas de changements, à jour)
- ✅ Build complet de tous les packages
- ✅ Mise à jour automatique de la version
- ✅ Création du commit et tag de release
- ✅ Push vers GitHub et déclenchement du workflow
- ✅ Évite les doubles releases

### 4️⃣ `04-rebuild-release.sh` - Reconstruction de binaires

Script pour reconstruire les binaires d'une release existante (utile si les binaires sont manquants ou corrompus).

**Usage :**

```bash
# Lister les releases disponibles
./scripts/04-rebuild-release.sh

# Reconstruire les binaires pour une version spécifique
./scripts/04-rebuild-release.sh v0.2.0
```

**Fonctionnalités :**

- ✅ Liste des releases disponibles
- ✅ Validation du tag/release
- ✅ Déclenchement du workflow GitHub Actions
- ✅ Ajout automatique des binaires à la release existante
- ✅ Remplacement des anciens binaires si présents

## Utilisation recommandée

### Pour le développement quotidien :

```bash
./scripts/01-quick-commit.sh "feat: ajout export SVG"
```

### Pour le débogage ou les branches importantes :

```bash
./scripts/02-debug-and-commit.sh "feat: refactoring complet des exports"
```

### Pour créer une release :

```bash
./scripts/03-create-release.sh minor
```

### Pour reconstruire des binaires manquants :

```bash
./scripts/04-rebuild-release.sh v0.2.0
```

## En cas de problème

### Le script ne s'exécute pas

```bash
chmod +x scripts/*.sh
```

### Erreurs de compilation

Le script `02-debug-and-commit.sh` propose automatiquement de nettoyer et réinstaller les dépendances.

### Logs trop volumineux

Les anciens logs peuvent être supprimés manuellement :

```bash
rm -rf logs/debug_*.log
```

### Doubles releases

Utilisez `03-create-release.sh` au lieu des releases automatiques pour un contrôle total.

## Structure des logs

Les logs du script `02-debug-and-commit.sh` contiennent :

```
=== INFORMATIONS SYSTÈME ===
- Date et heure
- Système d'exploitation
- Versions des outils (Node.js, npm, pnpm, Git)

=== INFORMATIONS GIT ===
- Branche actuelle
- Dernier commit
- Statut des fichiers

=== STRUCTURE DU PROJET ===
- Localisation des package.json
- Présence des node_modules

=== VARIABLES D'ENVIRONNEMENT ===
- Variables pertinentes pour Node.js

=== LOGS D'EXÉCUTION ===
- Sortie de toutes les commandes
- Messages d'erreur détaillés

=== INFORMATIONS DU COMMIT ===
- Message et hash du commit
- Fichiers modifiés

=== RAPPORT FINAL ===
- Résumé des étapes
- Statut final
```

## Exemples d'utilisation

### Nouvelle fonctionnalité

```bash
./scripts/02-debug-and-commit.sh "feat: ajout export Word et Excel"
```

### Correction de bug

```bash
./scripts/01-quick-commit.sh "fix: correction export PDF"
```

### Refactoring important

```bash
./scripts/02-debug-and-commit.sh "refactor: restructuration des hooks"
```

### Release de production

```bash
./scripts/03-create-release.sh minor
```

### Binaires manquants

```bash
./scripts/04-rebuild-release.sh v0.2.1
```

## 🚨 Guide de dépannage autonome

### Problèmes courants et solutions

#### 1. **Échec de build lors de la release**

**Symptômes :**

- `❌ Échec du build du package core/design/ui/web`
- Erreurs TypeScript ou de compilation

**Solutions (dans l'ordre) :**

```bash
# 1. Vérifier les erreurs TypeScript
pnpm type-check --filter <package>

# 2. Nettoyer et réinstaller
rm -rf node_modules dist
pnpm install

# 3. Vérifier les dépendances manquantes
pnpm install --frozen-lockfile

# 4. Build individuel pour identifier le problème
pnpm build --filter @bigmind/core
pnpm build --filter @bigmind/design
pnpm build --filter @bigmind/ui
pnpm build --filter bigmind-web
```

**Logs à consulter :**

- `logs/release_YYYYMMDD_HHMMSS.log` : Logs détaillés du build
- Sortie console de pnpm pour les erreurs spécifiques

#### 2. **Problèmes d'authentification GitHub**

**Symptômes :**

- `❌ Vous n'êtes pas authentifié avec GitHub CLI`
- `❌ GitHub CLI (gh) n'est pas installé`

**Solutions :**

```bash
# Installer GitHub CLI
brew install gh

# S'authentifier
gh auth login

# Vérifier l'authentification
gh auth status

# Configurer les permissions si nécessaire
gh auth refresh -s write:packages,repo
```

#### 3. **Workflow GitHub Actions ne se déclenche pas**

**Symptômes :**

- Release créée mais pas de binaires
- Workflow n'apparaît pas dans Actions

**Diagnostic :**

```bash
# Vérifier les workflows récents
gh run list --limit 10

# Vérifier le statut du workflow de release
gh workflow list
gh workflow view release.yml

# Déclencher manuellement
gh workflow run release.yml --ref v0.2.0
```

**Solutions :**

```bash
# Reconstruire les binaires
./scripts/04-rebuild-release.sh v0.2.0

# Vérifier les permissions du token GitHub
gh auth status
```

#### 4. **Changements non commités**

**Symptômes :**

- `❌ Il y a des changements non commités`
- Liste des fichiers modifiés

**Solutions :**

```bash
# Voir les changements
git status
git diff

# Option 1: Commiter les changements
git add .
git commit -m "fix: corrections avant release"

# Option 2: Stasher temporairement
git stash
# ... faire la release ...
git stash pop

# Option 3: Annuler les changements
git checkout .
```

#### 5. **Branche incorrecte**

**Symptômes :**

- `❌ Vous devez être sur la branche 'main'`

**Solutions :**

```bash
# Aller sur main
git checkout main

# Mettre à jour
git pull origin main

# Vérifier l'état
git status
```

#### 6. **Binaires manquants après release**

**Symptômes :**

- Release créée sur GitHub mais sans binaires
- Workflow échoué ou incomplet

**Diagnostic :**

```bash
# Lister les releases
gh release list

# Voir les détails d'une release
gh release view v0.2.0

# Vérifier les workflows
gh run list --workflow=release.yml
```

**Solutions :**

```bash
# Reconstruire automatiquement
./scripts/04-rebuild-release.sh v0.2.0

# Ou déclencher manuellement
gh workflow run release.yml --ref v0.2.0
```

### Interprétation des logs

#### Logs du script 03 (`logs/release_*.log`)

```
[2024-10-02 13:07:13] [DEBUG] === INFORMATIONS SYSTÈME ===
[2024-10-02 13:07:13] [DEBUG] Node.js: v18.17.0
[2024-10-02 13:07:13] [INFO] 🔨 Construction du projet
=== COMMAND: pnpm build --filter @bigmind/core ===
[sortie de la commande...]
[2024-10-02 13:07:45] [SUCCESS] Build @bigmind/core - Succès
```

**Éléments clés à vérifier :**

- **INFORMATIONS SYSTÈME** : Versions des outils
- **COMMAND sections** : Sortie détaillée des commandes
- **ERROR messages** : Erreurs avec suggestions de solutions
- **RÉSUMÉ DE LA RELEASE** : Informations finales

#### Logs du script 04 (`logs/rebuild_*.log`)

```
[2024-10-02 13:10:15] [INFO] 🔍 Vérification du tag v0.2.0
[2024-10-02 13:10:16] [SUCCESS] ✅ Tag trouvé
[2024-10-02 13:10:16] [INFO] 🔄 Déclenchement du workflow
```

### Commandes de diagnostic rapide

```bash
# État général du projet
git status
pnpm --version
node --version

# Vérifier les builds
pnpm build --filter @bigmind/core --dry-run

# État GitHub
gh auth status
gh repo view
gh release list --limit 5

# Workflows récents
gh run list --limit 5
gh run view --log  # pour le dernier run

# Nettoyer complètement (dernier recours)
rm -rf node_modules dist
rm -rf packages/*/node_modules packages/*/dist
rm -rf apps/*/node_modules apps/*/dist
pnpm install
```

### Quand contacter le support

Contactez le support IA uniquement si :

1. **Tous les diagnostics ci-dessus ont été tentés**
2. **Les logs détaillés sont disponibles** (`logs/` directory)
3. **Le problème persiste après nettoyage complet**
4. **Erreurs système non documentées** (pas liées au code)

**Informations à fournir :**

- Commande exacte exécutée
- Message d'erreur complet
- Contenu du fichier de log correspondant
- Sortie de `git status` et `pnpm --version`
- OS et version de Node.js
