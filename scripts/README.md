# Scripts BigMind

Ce répertoire contient des scripts utilitaires pour le développement et le débogage de BigMind.

## Scripts disponibles

### 🔍 `debug-and-commit.sh` - Script de débogage complet

Script principal pour le débogage approfondi et la création de commits avec logs détaillés.

**Usage :**
```bash
# Commit avec message personnalisé
./scripts/debug-and-commit.sh "feat: nouvelle fonctionnalité"

# Commit avec message automatique
./scripts/debug-and-commit.sh
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

### ⚡ `quick-commit.sh` - Commit rapide

Script léger pour les commits rapides avec vérification minimale.

**Usage :**
```bash
# Commit rapide avec message personnalisé
./scripts/quick-commit.sh "fix: correction bug"

# Commit rapide avec message automatique
./scripts/quick-commit.sh
```

**Fonctionnalités :**
- ✅ Vérification rapide de compilation
- ✅ Commit automatique des changements
- ✅ Messages d'erreur clairs
- ✅ Redirection vers le script de débogage en cas d'erreur

## Utilisation recommandée

### Pour le développement quotidien :
```bash
./scripts/quick-commit.sh "feat: ajout export SVG"
```

### Pour le débogage ou les branches importantes :
```bash
./scripts/debug-and-commit.sh "feat: refactoring complet des exports"
```

### En cas de problème :
1. Utilisez `debug-and-commit.sh` pour obtenir des logs détaillés
2. Consultez le fichier de log généré dans `logs/`
3. Partagez le contenu du log pour obtenir de l'aide

## Structure des logs

Les logs contiennent les sections suivantes :

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

## Dépannage

### Le script ne s'exécute pas
```bash
chmod +x scripts/debug-and-commit.sh
chmod +x scripts/quick-commit.sh
```

### Erreurs de compilation
Le script `debug-and-commit.sh` propose automatiquement de nettoyer et réinstaller les dépendances.

### Logs trop volumineux
Les anciens logs peuvent être supprimés manuellement :
```bash
rm -rf logs/debug_*.log
```

## Exemples d'utilisation

### Nouvelle fonctionnalité
```bash
./scripts/debug-and-commit.sh "feat: ajout export Word et Excel"
```

### Correction de bug
```bash
./scripts/quick-commit.sh "fix: correction export PDF"
```

### Refactoring important
```bash
./scripts/debug-and-commit.sh "refactor: restructuration des hooks"
```

### Commit automatique
```bash
./scripts/quick-commit.sh
# Génère : "feat: quick commit - 2024-01-15 14:30:25"
```
