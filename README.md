# 🧠 BigMind

**BigMind** est un logiciel de cartographie mentale (mind mapping) open source, cross-platform et performant, avec support des formats standards incluant XMind et FreeMind.

## ✨ Fonctionnalités

### 🎯 MVP (Version actuelle)

- **Canvas interactif** : Zoom, pan, drag & drop, sélection multiple
- **Nœuds intelligents** : Création, édition inline, suppression, re-hiérarchisation
- **Styles flat design** : Thème clair/sombre avec accent color unique
- **Undo/Redo** : Historique illimité avec pattern Command
- **Formats supportés** : Import/Export FreeMind (.mm) et XMind (.xmind)
- **Onglets multi-cartes** : Plusieurs cartes ouvertes simultanément
- **Raccourcis clavier** : Productivité maximale
- **Autosave** : Sauvegarde automatique locale (IndexedDB)
- **i18n** : Support français/anglais

### 🚀 Roadmap

- **Phase 2** : Thèmes avancés, images, stickers, modèles
- **Phase 3** : Support .xmind complet, export PDF, impression
- **Phase 4** : Collaboration temps réel (CRDT), cloud sync

## 🏗️ Architecture

### Monorepo

- **pnpm** workspaces + **Turbo** pour la performance
- **Packages** :
  - `@bigmind/core` : Logique métier, modèles, parsers
  - `@bigmind/ui` : Composants React réutilisables
  - `@bigmind/design` : Design tokens, thèmes Tailwind
  - `apps/web` : Application web (Vite + React)
  - `apps/desktop` : Application desktop (Tauri)

### Stack Technique

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : TailwindCSS + Radix UI + shadcn
- **State** : Zustand + Immer
- **Canvas** : React Flow + ELK.js
- **Desktop** : Tauri (Rust)
- **Tests** : Vitest + Playwright

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0
- **Rust** (pour l'app desktop)

### Installation

```bash
# Cloner le repository
git clone https://github.com/guthubrx/bigmind.git
cd bigmind

# Installer les dépendances
pnpm install

# Lancer l'application web
pnpm dev

# Lancer l'application desktop
pnpm dev:desktop
```

## 📱 Utilisation

### Application Web

```bash
# Développement
pnpm dev

# Build de production
pnpm build

# Preview
pnpm preview
```

### Application Desktop

```bash
# Développement
pnpm dev:desktop

# Build
pnpm build:desktop
```

## ⌨️ Raccourcis Clavier

| Raccourci              | Action                      |
| ---------------------- | --------------------------- |
| `Enter`                | Nouveau nœud sibling        |
| `Tab`                  | Nouveau nœud enfant         |
| `Shift+Tab`            | Remonter dans la hiérarchie |
| `Delete` / `Backspace` | Supprimer la sélection      |
| `F2`                   | Édition inline              |
| `Ctrl/Cmd+Z`           | Annuler                     |
| `Ctrl/Cmd+Y`           | Refaire                     |
| `Ctrl/Cmd+S`           | Sauvegarder                 |
| `Ctrl/Cmd+O`           | Ouvrir fichier              |
| `Ctrl/Cmd+N`           | Nouvelle carte              |

## 🎨 Design System

BigMind utilise un design system flat moderne avec :

- **Palette neutre** : Gris sobres et contrastes optimisés
- **Accent color unique** : Bleu moderne (#3b82f6)
- **Typographie** : Système harmonieux
- **Espacements** : Système 8px
- **Ombres** : Subtiles et cohérentes

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📦 Builds

### Web

```bash
pnpm build
# Génère dans apps/web/dist/
```

### Desktop

```bash
pnpm build:desktop
# Génère dans apps/desktop/src-tauri/target/release/
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`feat/nom-feature`)
3. Commit avec Conventional Commands
4. Push et créer une Pull Request

### Standards

- **Code** : TypeScript strict, ESLint, Prettier
- **Commits** : Conventional Commits
- **Tests** : Coverage ≥ 80% sur le core
- **Documentation** : Commentaires FR + EN

## 📄 Licence

**AGPL-3.0** - Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **XMind** pour l'inspiration
- **React Flow** pour le canvas
- **Tauri** pour le desktop
- **TailwindCSS** pour le design
- **Communauté open source**

---

**BigMind** - Cartographie mentale moderne et intuitive 🧠✨
