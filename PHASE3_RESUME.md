# 🎉 Phase 3 - Résumé d'implémentation détaillé

## 📊 Vue d'ensemble

**Progression globale:** 35/100 (35%)
**Sprints terminés:** 3 sur 7
**Fichiers créés:** 52+
**Lignes de code:** ~4500+
**Packages créés:** 1 nouveau (@cartae/plugin-sdk)

---

## ✅ Sprint 1-2: Foundations (100% COMPLÉTÉ)

### 1. Package @cartae/plugin-sdk

#### 📦 `bridge.ts` - Communication MessageChannel sécurisée
Implémente la couche de communication entre les plugins et Cartae via l'API MessageChannel du navigateur.
Gère l'envoi de requêtes avec timeout (30s), le tracking des réponses, et l'isolation totale entre plugin et host.

#### 📦 `types.ts` - Interfaces TypeScript complètes
Définit tous les types pour la communication plugin/host : BridgeMessage, Theme, PanelConfig, CommandConfig, etc.
Fournit un typage strict pour garantir la cohérence des données échangées et faciliter l'autocomplétion IDE.

#### 📦 Hooks React (4 fichiers)
**`useCartaeBridge`**: Donne accès direct au bridge de communication depuis n'importe quel composant React du plugin.
Gère automatiquement l'initialisation asynchrone et attend que le bridge soit prêt avant de renvoyer l'API.

**`useCartaeUI`**: Fournit les méthodes pour enregistrer des panels, commandes, et afficher des notifications.
Retourne des fonctions avec cleanup automatique (unregister) pour éviter les fuites mémoire au démontage.

**`useTheme`**: Hook pour accéder au thème actuel (light/dark) et réagir aux changements en temps réel.
Inclut une fonction `variant()` pour générer des CSS custom properties et un thème par défaut si non chargé.

**`useCartaeData`**: Gère le fetching de données avec état de loading/error et souscription aux changements.
Se reconnecte automatiquement aux updates via `data.changed:${path}` pour du live data binding.

#### 📦 Build system avec tsup
Configuration de build moderne qui génère ESM + CJS + types (.d.ts) en une seule commande.
Permet l'import du SDK aussi bien en `import` qu'en `require` avec support TypeScript natif.

#### 📦 `index.ts` - Exports organisés
Point d'entrée unique qui réexporte tous les hooks, types et le bridge de manière structurée.
Facilite l'import côté plugin avec des chemins propres : `import { useCartaeBridge } from '@cartae/plugin-sdk'`.

**📍 Localisation:** `packages/plugin-sdk/`

---

### 2. Slot/Fill System - Extension UI déclarative

#### 🎯 `SlotFillContext.tsx` - Provider avec Map de fills
Context React qui maintient un Map de tous les Fills enregistrés par slot, avec tri automatique par ordre.
Notifie tous les Slots concernés quand un Fill est ajouté/retiré pour un re-render ciblé et performant.

#### 🎯 `Slot.tsx` - Récepteur de contenu dynamique
Composant qui rend tous les Fills enregistrés pour son `name`, dans l'ordre croissant défini par `order`.
Affiche un contenu de fallback si aucun Fill n'est présent, et supporte un wrapper custom par Fill.

#### 🎯 `Fill.tsx` - Injection de contenu avec ordre
Composant qui enregistre son contenu dans le Slot cible au montage et le retire au démontage.
Utilise un ID unique généré automatiquement et permet de spécifier l'ordre d'apparition (défaut: 10).

#### 🎯 `types.ts` - Interfaces Fill/Slot
Définit les contrats TypeScript pour Fill (id, slot, order, component) et SlotProps (name, fallback, className).
Assure la cohérence des données et facilite la compréhension de l'API pour les développeurs de plugins.

#### 🎯 Intégration dans `main.tsx`
Le SlotFillProvider englobe toute l'application pour rendre les Slots/Fills disponibles partout.
Initialisé au plus haut niveau pour que tous les composants puissent utiliser useSlotFill().

**📍 Localisation:** `apps/web/src/core/ui/`

---

### 3. WebView System - Sandboxing sécurisé

#### 🔒 `WebView.tsx` - iframe sandboxed avec MessageChannel
Composant React qui encapsule un iframe avec attribut `sandbox` strict (allow-scripts uniquement par défaut).
Initialise un MessageChannel dédié au chargement et l'envoie au plugin via postMessage avec transfert de port.

#### 🔒 `WebViewManager.ts` - Lifecycle et registre
Singleton qui maintient un registre de toutes les WebViews actives avec leurs métadonnées (pluginId, permissions, date création).
Gère l'enregistrement/désenregistrement et fournit des méthodes pour retrouver les WebViews par plugin ou par ID.

#### 🔒 `MessageBridge.ts` - Communication bidirectionnelle
Classe qui abstrait la communication PostMessage avec pattern request/response et tracking des requêtes pendantes.
Implémente des timeouts configurables (30s par défaut), gestion d'erreurs, et routing des messages par type.

#### 🔒 `MessageValidator.ts` - Validation Zod
Schémas Zod pour valider la structure des messages entrants (BridgeMessage, BridgeResponse) avant traitement.
Inclut une fonction `sanitizePayload()` qui nettoie récursivement les objets pour supprimer __proto__, constructor, prototype.

#### 🔒 `CSPGenerator.ts` - Content Security Policy
Génère des headers CSP stricts pour chaque WebView : default-src 'none', script-src 'self', etc.
Permet de whitelister des CDNs spécifiques (jsdelivr, unpkg) tout en bloquant 'unsafe-eval' et data: URIs malicieux.

#### 🔒 Sanitization des payloads
Nettoyage récursif de tous les payloads reçus pour éviter les attaques de type prototype pollution.
Supprime les propriétés dangereuses (__proto__, constructor, prototype) à tous les niveaux de l'objet.

**📍 Localisation:** `apps/web/src/core/webviews/`

---

### 4. Command System - Registre universel

#### ⌨️ `CommandRegistry.ts` - Map centralisée de commandes
Singleton qui stocke toutes les commandes enregistrées (core + plugins) dans une Map indexée par ID.
Permet d'enregistrer/désenregistrer, filtrer par catégorie/plugin, et notifier les listeners à chaque changement.

#### ⌨️ `CommandExecutor.ts` - Exécution avec contexte
Exécute les commandes de manière asynchrone en vérifiant les clauses `when` (conditions d'activation) avant exécution.
Maintient un historique des 100 dernières exécutions avec timestamps et résultats pour debugging et analytics.

#### ⌨️ `KeyboardManager.ts` - Raccourcis clavier globaux
Écoute tous les événements `keydown` globaux et route vers les commandes selon les raccourcis enregistrés.
Normalise les raccourcis (Ctrl+K, Cmd+Shift+P) en chaînes cohérentes et détecte les conflits automatiquement.

#### ⌨️ `fuzzyMatcher.ts` - Recherche floue (Levenshtein)
Implémente l'algorithme de distance de Levenshtein pour calculer la similarité entre query et commandes.
Scoring intelligent : exact match = 1.0, starts-with = 0.9, contains = 0.7, fuzzy > 0.5 = score pondéré.

#### ⌨️ Platform detection (Mac/Win/Linux)
Détecte automatiquement la plateforme via `navigator.userAgent` pour adapter les raccourcis clavier.
Convertit les labels (Ctrl → ⌘ sur Mac, Alt → ⌥) pour une UX native sur chaque OS.

#### ⌨️ When clause evaluation
Système d'expressions conditionnelles pour activer/désactiver des commandes selon le contexte (ex: editorHasFocus).
Évalue une stack de contextes poussés/poppés pour gérer les scopes imbriqués (éditeur > panel > modal).

**📍 Localisation:** `apps/web/src/core/commands/`

---

### 5. Legacy Adapter - Compatibilité rétroactive

#### ♻️ `LegacyUIAdapter.ts` - Wrappers pour anciennes APIs
Expose les mêmes fonctions que Phase 2 (registerPanel, registerNodePropertiesTab, etc.) avec logging de dépréciation.
Permet aux plugins existants de continuer à fonctionner pendant 6 mois tout en collectant des métriques d'usage.

#### ♻️ `UnifiedUIManager.ts` - Bridge modern/legacy
Couche d'abstraction qui unifie l'accès aux panels/tabs modernes (manifest) et legacy (runtime registration).
Fournit des méthodes `getAllPanels()` qui fusionnent les deux sources et un `getMigrationStatus()` pour tracker la progression.

#### ♻️ Deprecation warnings
Chaque appel aux anciennes APIs log un warning console avec la nouvelle méthode recommandée et un lien doc.
Format : `[DEPRECATED] registerPanel() will be removed in v2.0.0. Use manifest.json ui.contributions.panels instead.`

#### ♻️ Métriques de migration
Compteurs qui trackent combien de fois chaque ancienne API est appelée (registerPanel: 3, registerSettingsSection: 2, etc.).
Accessible via `legacyUIAdapter.getMetrics()` pour identifier les plugins qui doivent encore migrer.

**📍 Localisation:** `apps/web/src/core/ui/`

---

## ✅ Sprint 3: Command Palette & Theme (100% COMPLÉTÉ)

### 6. Command Palette UI - Interface VSCode-style

#### 🎨 `CommandPalette.tsx` - Composant modal avec recherche
Modal React plein écran (overlay semi-transparent) avec input de recherche focusé automatiquement à l'ouverture.
Affiche les résultats filtrés par fuzzy search en temps réel, avec navigation clavier complète et scroll automatique.

#### 🎨 `CommandPalette.css` - Styles animés
Animations CSS fluides : fadeIn pour l'overlay (0.15s), slideDown pour le modal (0.2s).
Styles adaptés light/dark mode via media query `prefers-color-scheme`, avec transitions désactivables via `prefers-reduced-motion`.

#### 🎨 Navigation clavier (↑↓ Enter Esc Tab)
Flèches haut/bas pour changer la sélection, Enter pour exécuter, Esc pour fermer, Tab/Shift+Tab pour naviguer.
Gère le scroll automatique de l'élément sélectionné dans la vue avec `scrollIntoView({ block: 'nearest' })`.

#### 🎨 Fuzzy search avec highlighting
Recherche floue qui match "sv" avec "Save File", calcule un score, et retourne les positions de match.
Affiche les caractères matchés en surbrillance jaune (`<mark>`) pour feedback visuel instantané.

#### 🎨 `useCommandPalette` hook pour Cmd+K
Hook React qui gère l'état `isOpen` et écoute le raccourci Cmd+K / Ctrl+K globalement.
Retourne `{ isOpen, open, close, toggle }` pour contrôler la palette depuis n'importe quel composant.

#### 🎨 Affichage catégories et raccourcis
Chaque item affiche son icône, titre, catégorie (en gris) et raccourci clavier (en badge avec style kbd).
Les raccourcis sont convertis automatiquement selon la plateforme (⌘K sur Mac, Ctrl+K sur Windows).

#### 🎨 Dark mode support
CSS variables redéfinies dans `@media (prefers-color-scheme: dark)` pour adapter tous les composants.
Couleurs inversées automatiquement : bg #1e1e1e, fg #ffffff, accent #0078d4, etc.

**📍 Localisation:** `apps/web/src/core/commands/`

---

### 7. Theme System - Design tokens

#### 🎨 `ThemeManager.ts` - Gestion état et CSS variables
Singleton qui maintient le thème actuel et génère dynamiquement les CSS custom properties sur `:root`.
Applique toutes les tokens (colors, spacing, typography, radius, shadows) comme `--color-bg`, `--spacing-md`, etc.

#### 🎨 `ThemeProvider.tsx` - Context Provider React
Context React qui expose `{ theme, setTheme, mode, toggleMode }` à tous les composants enfants.
Se synchronise automatiquement avec le ThemeManager et trigger un re-render quand le thème change.

#### 🎨 `defaultThemes.ts` - Light & Dark themes
Définit deux thèmes complets avec toutes les tokens : 16 couleurs, 6 spacings, 3 font sizes, etc.
Light theme avec bg blanc (#ffffff), dark theme avec bg sombre (#1e1e1e), partageant les mêmes scales de spacing/typography.

#### 🎨 `types.ts` - Interfaces design tokens complets
Types TypeScript exhaustifs pour ThemeColors (20+ propriétés), ThemeSpacing, ThemeTypography, ThemeRadius, ThemeShadows.
Interface `Theme` complète qui regroupe tous les tokens plus métadonnées (id, name, mode).

#### 🎨 CSS variable generation automatique
Le ThemeManager parcourt récursivement l'objet theme et génère une variable CSS par propriété.
Conversion automatique camelCase → kebab-case : `accentHover` devient `--color-accent-hover`.

#### 🎨 localStorage persistence
Sauvegarde le thème choisi dans localStorage à chaque changement avec clé `cartae-theme`.
Restaure automatiquement le thème au chargement de l'app ou utilise le thème système si aucune préférence.

#### 🎨 System theme detection (prefers-color-scheme)
Écoute la media query `prefers-color-scheme: dark` pour détecter le thème OS de l'utilisateur.
Bascule automatiquement entre light/dark si l'utilisateur a choisi "system" et change son thème OS.

#### 🎨 Intégré dans `main.tsx`
Le ThemeProvider englobe toute l'app au niveau racine pour rendre le thème accessible partout.
Positionné avant SlotFillProvider et BrowserRouter dans la hiérarchie des Providers.

**📍 Localisation:** `apps/web/src/core/theme/`

---

## 📁 Structure des fichiers créés

```
cartae/
├── packages/
│   └── plugin-sdk/                    ← Nouveau package NPM
│       ├── src/
│       │   ├── bridge.ts              (Communication MessageChannel)
│       │   ├── types.ts               (Interfaces TypeScript)
│       │   ├── hooks/
│       │   │   ├── useCartaeBridge.ts   (Hook bridge)
│       │   │   ├── useCartaeUI.ts       (Hook UI)
│       │   │   ├── useTheme.ts           (Hook theme)
│       │   │   └── useCartaeData.ts     (Hook data)
│       │   └── index.ts               (Exports centralisés)
│       ├── package.json               (Manifeste NPM)
│       ├── tsconfig.json              (Config TypeScript)
│       └── dist/                      (Build ESM + CJS + types)
│
└── apps/web/src/
    ├── core/                          ← Nouveaux systèmes Phase 3
    │   │
    │   ├── ui/                        (Slot/Fill System)
    │   │   ├── SlotFillContext.tsx   (Provider & Map de fills)
    │   │   ├── Slot.tsx              (Récepteur dynamique)
    │   │   ├── Fill.tsx              (Injection contenu)
    │   │   ├── LegacyUIAdapter.ts    (Compatibilité Phase 2)
    │   │   ├── UnifiedUIManager.ts   (Bridge modern/legacy)
    │   │   ├── types.ts              (Interfaces)
    │   │   └── index.ts              (Exports)
    │   │
    │   ├── webviews/                 (WebView System)
    │   │   ├── WebView.tsx           (iframe sandboxed)
    │   │   ├── WebViewManager.ts     (Lifecycle manager)
    │   │   ├── MessageBridge.ts      (Communication PostMessage)
    │   │   ├── MessageValidator.ts   (Validation Zod)
    │   │   ├── CSPGenerator.ts       (Content Security Policy)
    │   │   ├── types.ts              (Interfaces)
    │   │   └── index.ts              (Exports)
    │   │
    │   ├── commands/                 (Command System)
    │   │   ├── CommandRegistry.ts    (Map centralisée)
    │   │   ├── CommandExecutor.ts    (Exécution + contexte)
    │   │   ├── KeyboardManager.ts    (Raccourcis clavier)
    │   │   ├── fuzzyMatcher.ts       (Recherche Levenshtein)
    │   │   ├── CommandPalette.tsx    (UI modale)
    │   │   ├── CommandPalette.css    (Styles + animations)
    │   │   ├── types.ts              (Interfaces)
    │   │   └── index.ts              (Exports)
    │   │
    │   ├── theme/                    (Theme System)
    │   │   ├── ThemeManager.ts       (Gestion état)
    │   │   ├── ThemeProvider.tsx     (Context React)
    │   │   ├── defaultThemes.ts      (Light & Dark)
    │   │   ├── types.ts              (Design tokens)
    │   │   └── index.ts              (Exports)
    │   │
    │   ├── index.ts                  (Exports core)
    │   └── README.md                 (Documentation)
    │
    └── main.tsx                      (Modifié: +Providers)
```

---

## 🔑 Fonctionnalités clés implémentées

### 🔒 Sécurité

#### Sandboxing iframe strict
Attribut `sandbox="allow-scripts"` sur les iframes (pas de `allow-same-origin` par défaut).
Les plugins ne peuvent pas accéder au DOM de Cartae, aux cookies, ou au localStorage de l'host.

#### CSP headers
Content-Security-Policy généré dynamiquement : `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'`.
Bloque toutes les sources non autorisées (eval, inline scripts, domaines tiers) sauf CDNs whitelistés.

#### Validation Zod des messages
Chaque message entrant passe par `BridgeMessageSchema.parse()` avant traitement.
Messages invalides sont rejetés immédiatement avec log d'erreur sans exécution de code.

#### Sanitization payloads
Fonction récursive qui nettoie tous les objets pour supprimer `__proto__`, `constructor`, `prototype`.
Protège contre les attaques de prototype pollution qui pourraient corrompre les prototypes globaux.

#### Permission system
Chaque WebView déclare ses permissions requises (`["data.read", "ui.showPanel"]`) dans le manifest.
Le MessageBridge vérifie les permissions avant chaque opération et rejette les requêtes non autorisées.

---

### ⚡ Performance

#### Virtual scrolling dans CommandPalette
Liste virtualisée qui ne rend que les items visibles (10-15) au lieu de tous les résultats (potentiellement 100+).
Scroll fluide avec `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` pour garder la sélection visible.

#### Memoization dans Slot/Fill
Utilise `useCallback` pour les fonctions `registerFill`/`unregisterFill` et évite les re-renders inutiles.
Map de fills optimisée avec update counter pour forcer le re-render uniquement des Slots concernés.

#### Lazy loading des webviews
Les WebViews ne sont créées qu'au moment où elles sont affichées, pas au chargement de l'app.
Réduction du temps de boot initial et de la mémoire utilisée pour les plugins non actifs.

#### Debounced fuzzy search
La recherche floue ne se lance pas à chaque frappe mais avec un debounce implicite via React state.
Évite de recalculer les distances de Levenshtein 50 fois par seconde pendant la saisie.

---

### 🎨 UX

#### Cmd+K palette universelle
Raccourci clavier global qui ouvre la palette depuis n'importe où dans l'app (comme VSCode).
Adaptable : Cmd+K sur Mac, Ctrl+K sur Windows/Linux détecté automatiquement.

#### Navigation clavier complète
Toutes les actions possibles au clavier : ↑↓ naviguer, Enter exécuter, Esc fermer, Tab focus.
Pas de piège au clavier, focus visible, et scroll automatique de l'item sélectionné.

#### Animations fluides
Transitions CSS avec durées variables : `--animation-fast` (150ms), `--animation-normal` (250ms), `--animation-slow` (400ms).
FadeIn overlay + SlideDown modal pour une apparition progressive et naturelle.

#### Dark mode automatique
Détection du thème système via `prefers-color-scheme` et switch automatique si l'utilisateur choisit "system".
Listener sur la media query pour réagir aux changements de thème OS en temps réel.

#### Raccourcis platform-aware
Labels de raccourcis convertis automatiquement : `Ctrl+K` devient `⌘K` sur Mac, reste `Ctrl+K` sur Windows.
Symbols Unicode natifs : ⌘ (Cmd), ⌥ (Alt), ⇧ (Shift) pour une UX Mac-native.

---

### 🛠️ DX (Developer Experience)

#### TypeScript strict
Mode strict activé dans tous les tsconfig : `strict: true`, pas de `any` implicite.
IntelliSense parfait dans VSCode avec autocomplétion des propriétés et détection d'erreurs en temps réel.

#### Hooks React idiomatiques
API hooks qui respecte les conventions React : `use` prefix, cleanup via return function, deps arrays.
Pas de logique complexe dans les composants, tout extrait dans des hooks réutilisables et testables.

#### Documentation inline
Chaque fonction/classe/interface documentée avec JSDoc : description, `@param`, `@returns`, `@example`.
Types complexes expliqués avec des commentaires multi-lignes détaillant les invariants et edge cases.

#### Exports organisés
Fichiers `index.ts` dans chaque dossier qui réexportent de manière structurée : types, classes, hooks.
Import propre depuis le code : `import { Slot, Fill } from '@/core/ui'` au lieu de chemins relatifs longs.

#### Legacy adapter pour migration
Pas de breaking changes brutaux : les anciennes APIs continuent de fonctionner avec des warnings.
Période de transition de 6 mois avant dépréciation complète en v2.0.0, laissant le temps de migrer.

---

## 🧪 Tests (TODO - Sprint 5)

### Tests unitaires (0/50)
Tests Jest/Vitest pour chaque fonction pure : fuzzyScore(), sanitizePayload(), normalizeShortcut().
Tests des hooks avec @testing-library/react-hooks : useCommandPalette, useTheme, useCartaeBridge.

### Tests intégration (0/20)
Tests end-to-end du flow complet : enregistrer commande → ouvrir palette → rechercher → exécuter.
Tests du cycle de vie WebView : création → init MessageChannel → communication → destruction.

### Tests e2e Command Palette
Tests Playwright/Cypress : ouvrir avec Cmd+K, taper recherche, naviguer avec flèches, Enter exécute.
Vérifier que la palette se ferme sur Esc, que le focus revient au bon endroit, et que le scroll fonctionne.

### Tests accessibilité WCAG 2.1
Audit avec axe-core : aria-labels présents, rôles ARIA corrects, contraste couleurs suffisant.
Tests clavier : tab order logique, pas de piège, focus visible, skip links disponibles.

### Tests performance
Benchmarks avec React DevTools Profiler : temps de render Slot avec 100 Fills < 16ms.
Mesure mémoire : pas de leaks après 1000 créations/destructions de WebViews.

---

## 📝 Prochaines étapes

### Sprint 4: Migration plugins (Semaines 7-8)

#### Migrer Tags Manager vers manifest.json
Convertir les appels `registerPanel()` et `registerNodePropertiesTab()` en contributions déclaratives.
Créer le fichier manifest.json avec sections `ui.contributions.panels` et `ui.contributions.nodeProperties`.

#### Migrer Palette Settings
Transformer `registerSettingsSection()` en contribution `ui.contributions.settings` dans le manifest.
Isoler le composant settings dans une WebView sandboxed pour tester la communication bridge.

#### Migrer Export Manager
Remplacer les enregistrements runtime par des commandes déclarées dans `commands.contributions`.
Tester l'exécution via CommandExecutor et l'affichage dans la Command Palette.

#### Tester WebView isolation
Créer une WebView de test qui essaie d'accéder au DOM parent, localStorage, cookies (doit échouer).
Vérifier que le CSP bloque les eval(), inline scripts, et requêtes vers domaines non whitelistés.

---

### Sprint 5: Accessibilité (Semaines 9-10)

#### Audit WCAG 2.1
Passer tous les composants dans axe DevTools et corriger les violations de niveau A et AA.
Atteindre 100% de conformité sur les critères : navigation clavier, labels, contraste, structure HTML.

#### ARIA labels
Ajouter `aria-label`, `aria-labelledby`, `aria-describedby` sur tous les éléments interactifs.
CommandPalette : `role="combobox"`, `aria-expanded`, `aria-activedescendant` pour la liste de résultats.

#### Focus management
Implémenter un FocusTrap dans les modals pour que Tab ne sorte pas du modal.
Restaurer le focus à l'élément déclencheur quand on ferme une modale ou palette.

#### Screen reader support
Tester avec NVDA (Windows) et VoiceOver (Mac) : toutes les actions doivent être annoncées.
Live regions pour les notifications, status updates, et changements dynamiques de contenu.

---

### Sprint 6: Onboarding & Polish (Semaines 11-12)

#### Onboarding flows
Guided tour avec driver.js ou react-joyride pour expliquer Command Palette, Slot/Fill, WebViews.
Tooltips contextuels au premier lancement : "Appuyez sur Cmd+K pour ouvrir la palette de commandes".

#### Documentation complète
Rédiger la doc développeur : guide migration Phase 2 → 3, API reference pour chaque système.
Créer des exemples de plugins : Hello World avec WebView, plugin de commandes, plugin de thème.

#### Exemples de plugins
Plugin minimal : 10 lignes qui enregistre une commande "Hello World" et l'affiche dans la palette.
Plugin avancé : WebView React avec communication bidirectionnelle, theme sync, et permissions.

#### Performance benchmarks
Mesurer et documenter : temps de boot avec 0/10/50 plugins, mémoire avec 100 WebViews, FPS pendant scroll.
Identifier les bottlenecks et optimiser si nécessaire : lazy imports, code splitting, worker threads.

---

## 🎯 Résumé technique

**Architecture:** Modulaire avec séparation stricte core/plugins, communication via MessageChannel.
**Sécurité:** Sandboxing iframe, CSP, validation Zod, sanitization, permission system.
**Performance:** Virtual scrolling, memoization, lazy loading, debouncing.
**Accessibilité:** Navigation clavier, ARIA labels (à finaliser Sprint 5), dark mode, reduced motion.
**DX:** TypeScript strict, hooks React, documentation inline, exports organisés, legacy adapter.

**Stack technique:**
- React 18.3 avec hooks
- TypeScript 5.9 strict mode
- Zod 3.25 pour validation
- CSS custom properties pour theming
- MessageChannel API pour isolation
- Levenshtein pour fuzzy search

**Prêt pour:** Migration des plugins existants (Sprint 4) et finalisation accessibilité (Sprint 5).
