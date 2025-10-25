# ANALYSE EXHAUSTIVE - COMMITS TAGS

**Date d'analyse:** 2025-10-25 11:29:08

**Total commits analysés:** 76

**Période:** 2025-09-29 → 2025-10-25

## TABLE DES MATIÈRES

- [Phase 11: Divers & Corrections](#11_misc) - 7 commits
- [Phase 1: Foundation - Système DAG](#1_foundation_dag) - 1 commits
- [Phase 2: Synchronisation MindMap-DAG](#2_synchronization) - 28 commits
- [Phase 3: Affichage UI des Tags](#3_display) - 10 commits
- [Phase 4: Positionnement Visuel](#4_positioning) - 13 commits
- [Phase 5: Améliorations UI & Styling](#5_ui_enhancement) - 9 commits
- [Phase 6: Création de Tags & Utilitaires](#6_tag_creation) - 3 commits
- [Phase 7: Centralisation Store](#7_centralization) - 3 commits
- [Phase 8: Menus & Interactions](#8_menus) - 1 commits
- [Phase 9: Persistence & Fichiers](#9_persistence) - 1 commits

---

## VUE D'ENSEMBLE

### Statistiques globales

- **Fichiers modifiés:** 154
- **Lignes ajoutées:** 40,104
- **Lignes supprimées:** 6,367
- **Net:** +33,737

### Répartition par type

- **fix:** 32
- **feature:** 21
- **refactor:** 9
- **debug:** 6
- **style:** 5
- **other:** 2
- **chore:** 1

---

## Phase 11: Divers & Corrections {#11_misc}

**Commits dans cette phase:** 7

### 1. e6c87b5 - fix(ui): correction clé unique pour les tags

**Hash complet:** `e6c87b55f7ca3d569984e03eb8b653cd94b8ecf4`

**Date:** 2025-10-23T05:35:21+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Utilisation du tag comme clé au lieu de l'index pour éviter les warnings React
- Amélioration des performances et de la stabilité du rendu

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `ea71f6e0a3ff144cd1f29f64f35e271ff0dfb306`

**Voir le diff complet:**

```bash
git show e6c87b5
```

---

### 2. 5c8e921 - feat(ui): descente des tags de 20% de la hauteur du nœud

**Hash complet:** `5c8e9211265801c68bdd9389ddc366d23763db62`

**Date:** 2025-10-23T06:09:10+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Changement de bottom: '0' à bottom: '-8px'
- Les tags descendent de 8px supplémentaires (environ 20% de la hauteur moyenne d'un nœud de ~40px)
- Le milieu vertical des tags est maintenant 8px plus bas que la bordure inférieure
- Les tags sont davantage séparés visuellement du nœud

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `2ad5e9ad6455068a0173e1161e9bbecdf828ed06`

**Voir le diff complet:**

```bash
git show 5c8e921
```

---

### 3. 8741f7f - fix(ui): réalignement vertical du tag sur la bordure du nœud

**Hash complet:** `8741f7fb931662b8a0070448c12d28d9b2350e0c`

**Date:** 2025-10-23T06:22:40+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Retrait des 8px supplémentaires dans le transform
- Utilisation de translateY(50%) uniquement
- Le milieu vertical du tag est maintenant exactement sur la bordure inférieure
- Les tags sont parfaitement à cheval : 50% au-dessus, 50% en-dessous

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Dépendances (parents):**

- `d87432ee30552eca937c71ac7f1fccdd668bba32`

**Voir le diff complet:**

```bash
git show 8741f7f
```

---

### 4. d718620 - fix: keep exact label when copying tags in hierarchy

**Hash complet:** `d718620353dbc5a5e8c67b77007b13269a12d566`

**Date:** 2025-10-23T14:10:58+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Removed " (copie)" suffix from copied tag labels
- Copied tags now have exact same label as original
- Only the ID changes (with timestamp to ensure uniqueness)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Dépendances (parents):**

- `9a2fc985364ee3963066a2dfc483b009f742c684`

**Voir le diff complet:**

```bash
git show d718620
```

---

### 5. 5c36134 - fix: remove duplicate getDescendants function declaration

**Hash complet:** `5c361344dbbe293123fc987578eff080343dca56`

**Date:** 2025-10-23T17:11:13+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- getDescendants was already destructured from useTagGraph hook
- Removed the duplicate const declaration that caused compilation error
- Now uses the existing function from the hook

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 16 ----------------
 1 file changed, 16 deletions(-)
```

**Dépendances (parents):**

- `58c89fe3304d293ebafacec9af234b3aef3faf1d`

**Voir le diff complet:**

```bash
git show 5c36134
```

---

### 6. 10dfba6 - fix: enable sidebar scrolling to show all content including tags

**Hash complet:** `10dfba6e663277e7efa6231a17e64272a7034a2d`

**Date:** 2025-10-23T19:54:35+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Enable scrolling on .sidebar with overflow-y: auto (was overflow: hidden)
- Add scrollbar styling to .sidebar for visibility (8px, 70% opacity)
- Remove redundant overflow-y: auto from inner content div in Sidebar
- Simplify .node-properties to use overflow: visible (rely on parent sidebar scroll)
- Fixes issue where content couldn't scroll far enough to see tag layers
- Enables mouse wheel scrolling throughout the entire properties panel

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (3):**

- `apps/web/src/App.css`
- `apps/web/src/components/NodeProperties.css`
- `apps/web/src/components/Sidebar.tsx`

**Statistiques:**

```
apps/web/src/App.css                       | 28 +++++++++++++++++++++++++++-
 apps/web/src/components/NodeProperties.css | 29 +----------------------------
 apps/web/src/components/Sidebar.tsx        |  8 +++-----
 3 files changed, 31 insertions(+), 34 deletions(-)
```

**Voir le diff complet:**

```bash
git show 10dfba6
```

---

### 7. 1cc53da - fix: remove tag from node when deleted in tag hierarchy

**Hash complet:** `1cc53daff67c08d9281971d9b7c6dcc6484a0dfb`

**Date:** 2025-10-23T20:00:14+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Update node.tags property when deleting a tag
- Get all affected nodes before deletion
- Remove the tag from each node's tags array
- Ensures deleted tags disappear from nodes on the map
- Fixes issue where tags remained visible after deletion

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/hooks/useTagGraph.ts | 21 +++++++++++++++++++++
 1 file changed, 21 insertions(+)
```

**Dépendances (parents):**

- `10dfba6e663277e7efa6231a17e64272a7034a2d`

**Voir le diff complet:**

```bash
git show 1cc53da
```

---

## Phase 1: Foundation - Système DAG {#1_foundation_dag}

**Commits dans cette phase:** 1

### 1. f9390bc - feat(dag): implémentation complète du système DAG sémantique pour les tags

**Hash complet:** `f9390bc22548912552179e0706090997b650b1e7`

**Date:** 2025-10-22T19:41:58+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Évolution du système hiérarchique vers un graphe orienté acyclique (DAG)
- Support des multi-parents pour les tags (relations many-to-many)
- 3 types de relations sémantiques: is-type-of, is-related-to, is-part-of
- Visualisation interactive avec D3.js et d3-dag (layout Sugiyama vertical)
- Interactions riches: drag & drop, création de liens avec Shift+clic, zoom/pan
- Détection automatique de cycles pour garantir l'acyclicité
- Vue duale: liste hiérarchique ou graphe visuel
- Panneau de détails avec navigation entre tags
- Store Zustand persistant avec localStorage
- Données de test avec exemples de multi-parents
- Intégration complète dans la sidebar

Le système remplace l'ancien modèle "calques Photoshop" par un DAG flexible
permettant des relations sémantiques complexes entre tags.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (112):**

- `.cursorindexingignore`
- `.gitignore`
- `CHANGELOG_PHASE2.md`
- `PHASE2_COMPLETION_REPORT.md`
- `PHASE2_FILES_INDEX.md`
- `PHASE2_INTEGRATION_GUIDE.md`
- `PHASE2_PROGRESS.md`
- `PHASE2_QUICKSTART.md`
- `apps/web/package.json`
- `apps/web/src/App.css`
- `apps/web/src/components/MindMapCanvas.tsx`
- `apps/web/src/components/MindMapNode.tsx`
- `apps/web/src/components/NodeContextMenu.tsx`
- `apps/web/src/components/NodeProperties.css`
- `apps/web/src/components/NodeProperties.tsx`
- `apps/web/src/components/Sidebar.tsx`
- `apps/web/src/components/StickerPicker.tsx`
- `apps/web/src/components/TagGraph.tsx`
- `apps/web/src/components/TagLayersPanel.css`
- `apps/web/src/components/TagLayersPanel.tsx`
- ... et 92 autres fichiers

**Statistiques:**

```
.cursorindexingignore                              |   3 +
 .gitignore                                         |   3 +
 CHANGELOG_PHASE2.md                                | 372 +++++++++
 PHASE2_COMPLETION_REPORT.md                        | 506 ++++++++++++
 PHASE2_FILES_INDEX.md                              | 426 ++++++++++
 PHASE2_INTEGRATION_GUIDE.md                        | 490 +++++++++++
 PHASE2_PROGRESS.md                                 | 264 ++++++
 PHASE2_QUICKSTART.md                               | 518 ++++++++++++
 apps/web/package.json                              |   3 +
 apps/web/src/App.css                               |  11 +-
 apps/web/src/components/MindMapCanvas.tsx          |  43 +-
 apps/web/src/components/MindMapNode.tsx            |  32 +-
 apps/web/src/components/NodeContextMenu.tsx        | 240 +++++-
 apps/web/src/components/NodeProperties.css         |  66 +-
 apps/web/src/components/NodeProperties.tsx         | 766 ++++++++++++-----
 apps/web/src/components/Sidebar.tsx                | 245 ++----
 apps/web/src/components/StickerPicker.tsx          | 243 ++++++
 apps/web/src/components/TagGraph.tsx               | 393 +++++++++
 apps/web/src/components/TagLayersPanel.css         | 314 +++++++
 apps/web/src/components/TagLayersPanel.tsx         | 914 +++++++++++++++++++++
 apps/web/src/components/TagLayersPanelDAG.css      | 466 +++++++++++
 apps/web/src/components/TagLayersPanelDAG.tsx      | 373 +++++++++
 apps/web/src/components/TemplateGallery.tsx        | 322 ++++++++
 apps/web/src/components/ThemeSelector.tsx          | 266 ++++++
 .../src/components/dialogs/InsertImageDialog.tsx   |  50 ++
 .../src/components/dialogs/InsertStickerDialog.tsx |  53 ++
 apps/web/src/data/tags.json                        | 124 +++
 apps/web/src/hooks/__tests__/useAssets.test.ts     |  73 ++
 apps/web/src/hooks/__tests__/useTemplates.test.ts  | 110 +++
 apps/web/src/hooks/__tests__/useThemes.test.ts     | 102 +++
 apps/web/src/hooks/useAssets.ts                    |   1 -
 apps/web/src/hooks/useColumnResize.ts              |   4 +-
 apps/web/src/hooks/useMindmap.ts                   | 134 ++-
 apps/web/src/hooks/useOpenFiles.ts                 | 114 ++-
 apps/web/src/hooks/useReactFlowNodes.ts            |  29 +-
 apps/web/src/hooks/useTagGraph.ts                  | 378 +++++++++
 apps/web/src/hooks/useTagLayers.ts                 | 525 ++++++++++++
 apps/web/src/hooks/useTemplates.ts                 | 244 ++++++
 apps/web/src/hooks/useThemes.ts                    | 178 ++++
 apps/web/src/layouts/MainLayout.css                |   4 +-
 apps/web/src/layouts/MainLayout.tsx                |   3 +-
 apps/web/src/pages/Settings.css                    | 307 +++++++
 apps/web/src/pages/Settings.tsx                    | 373 ++-------
 apps/web/src/pages/SettingsAppearanceSection.tsx   | 115 +++
 apps/web/src/pages/SettingsInteractionSection.tsx  |  89 ++
 apps/web/src/pages/SettingsShortcutsSection.tsx    |  90 ++
 apps/web/src/types/dag.ts                          | 125 +++
 apps/web/src/utils/colorUtils.ts                   | 105 +--
 apps/web/src/utils/shortcutUtils.ts                |  92 +++
 apps/web/vite.config.ts                            |   8 +
 commit-branch.sh                                   |  64 ++
 logs/sessions/chat_input.txt                       |  10 +
 logs/sessions/commit_context.json                  |   5 +
 logs/sessions/current_session.json                 | 115 ++-
 logs/sessions/example_export.json                  |  76 ++
 logs/sessions/session_20251002_143637.json         | 112 +++
 packages/core/package.json                         |   4 +-
 packages/core/src/assets.d.ts                      | 110 +++
 packages/core/src/assets.d.ts.map                  |   1 +
 packages/core/src/assets.js                        | 144 ++++
 packages/core/src/assets.js.map                    |   1 +
 packages/core/src/assets.ts                        | 310 +++++++
 packages/core/src/commands.d.ts                    | 130 +--
 packages/core/src/commands.d.ts.map                |   2 +-
 packages/core/src/commands.js                      | 649 +++++++++------
 packages/core/src/commands.js.map                  |   2 +-
 packages/core/src/commands.ts                      | 103 +++
 packages/core/src/commands/history.d.ts            | 106 +--
 packages/core/src/commands/history.js              | 207 ++---
 packages/core/src/index.d.ts                       |  10 +-
 packages/core/src/index.d.ts.map                   |   2 +-
 packages/core/src/index.js                         |  12 +-
 packages/core/src/index.js.map                     |   2 +-
 packages/core/src/index.ts                         |  32 +-
 packages/core/src/model.d.ts                       | 173 ++--
 packages/core/src/model.d.ts.map                   |   2 +-
 packages/core/src/model.js                         | 213 +++--
 packages/core/src/model.js.map                     |   2 +-
 packages/core/src/model.ts                         |  80 ++
 packages/core/src/parsers/freemind.d.ts            |  52 +-
 packages/core/src/parsers/freemind.js              | 283 ++++---
 packages/core/src/parsers/xmind-phase2.d.ts        |  67 ++
 packages/core/src/parsers/xmind-phase2.d.ts.map    |   1 +
 packages/core/src/parsers/xmind-phase2.js          | 279 +++++++
 packages/core/src/parsers/xmind-phase2.js.map      |   1 +
 packages/core/src/parsers/xmind-phase2.ts          | 340 ++++++++
 packages/core/src/parsers/xmind.d.ts               | 112 +++
 packages/core/src/parsers/xmind.d.ts.map           |   2 +-
 packages/core/src/parsers/xmind.js                 | 519 ++++++++++++
 packages/core/src/parsers/xmind.js.map             |   2 +-
 packages/core/src/templates.d.ts                   | 106 +++
 packages/core/src/templates.d.ts.map               |   1 +
 packages/core/src/templates.js                     | 174 ++++
 packages/core/src/templates.js.map                 |   1 +
 packages/core/src/templates.ts                     | 353 ++++++++
 packages/core/src/themes.d.ts                      |  94 +++
 packages/core/src/themes.d.ts.map                  |   1 +
 packages/core/src/themes.js                        |  79 ++
 packages/core/src/themes.js.map                    |   1 +
 packages/core/src/themes.ts                        | 223 +++++
 packages/design/src/index.ts                       |   6 +
 packages/design/src/sticker-library.ts             | 456 ++++++++++
 packages/design/src/template-presets.ts            | 333 ++++++++
 packages/design/src/theme-presets.ts               | 444 ++++++++++
 pnpm-lock.yaml                                     | 468 +++++++++++
 scripts/10-ai-session-tracker.sh                   |  29 +
 scripts/11-conversation-auto-logger.sh             | 342 ++++++++
 scripts/12-chat-logger.sh                          |  68 ++
 scripts/13-ai-history-parser.sh                    | 225 +++++
 scripts/15-manual-chat-logger.sh                   | 264 ++++++
 tests/phase2.spec.ts                               | 305 +++++++
 tsconfig.base.json                                 |   6 +-
 112 files changed, 17334 insertions(+), 1691 deletions(-)
```

**Voir le diff complet:**

```bash
git show f9390bc
```

---

## Phase 2: Synchronisation MindMap-DAG {#2_synchronization}

**Commits dans cette phase:** 28

### 1. a72e060 - feat(ui): horizontal mindmap layout (left/right split), dynamic node-height spacing, side handles

**Hash complet:** `a72e060fa8fd1beade7ad78e6fb5266470c37ccc`

**Date:** 2025-09-29T08:53:03+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Implement two-pass layout with subtree banding to preserve sibling order
- Balance root children left/right; descendants inherit side
- Add left/right handles so edges attach from logical sides (root included)
- Fix edge generation to avoid reading ReactFlow nodes before init
- Fix hook order; keep zoom sync effect stable
- Move zoom controls into StatusBar with editable percentage input; remove canvas Controls
- XMind: continue JSON-first parsing; root detection unchanged
- Node: width fixed at 200px; auto height; increased spacing constants; compaction tuning
```

**Fichiers modifiés (0):**

**Statistiques:**

```
.editorconfig                              |   12 +
 .eslintrc.cjs                              |   45 +
 .gitattributes                             |   17 +
 .gitignore                                 |   73 +
 .prettierrc                                |   10 +
 README.md                                  |  166 +
 analyze-debug.js                           |  136 +
 apps/web/index.html                        |   51 +
 apps/web/package.json                      |   46 +
 apps/web/public/browserconfig.xml          |   11 +
 apps/web/public/favicon-192.png            |    8 +
 apps/web/public/favicon.svg                |    8 +
 apps/web/public/logo.svg                   |  249 ++
 apps/web/public/manifest.json              |   28 +
 apps/web/public/og-image.svg               |   92 +
 apps/web/src/App.css                       |  195 +
 apps/web/src/App.tsx                       |   33 +
 apps/web/src/components/CollapseButton.tsx |   57 +
 apps/web/src/components/FileTabs.css       |  158 +
 apps/web/src/components/FileTabs.tsx       |  121 +
 apps/web/src/components/MenuBar.css        |   95 +
 apps/web/src/components/MenuBar.tsx        |  182 +
 apps/web/src/components/MindMapCanvas.css  |   45 +
 apps/web/src/components/MindMapCanvas.tsx  |  391 ++
 apps/web/src/components/MindMapEdge.tsx    |   78 +
 apps/web/src/components/MindMapNode.tsx    |  207 +
 apps/web/src/components/NodeExplorer.css   |  150 +
 apps/web/src/components/NodeExplorer.tsx   |  177 +
 apps/web/src/components/NodeProperties.css |  169 +
 apps/web/src/components/NodeProperties.tsx |  248 ++
 apps/web/src/components/PlatformDebug.tsx  |   31 +
 apps/web/src/components/Sidebar.tsx        |  216 +
 apps/web/src/components/StatusBar.css      |   44 +
 apps/web/src/components/StatusBar.tsx      |   96 +
 apps/web/src/components/Toolbar.tsx        |  222 +
 apps/web/src/components/TopBar.css         |   42 +
 apps/web/src/components/TopBar.tsx         |   24 +
 apps/web/src/hooks/useColumnCollapse.ts    |   33 +
 apps/web/src/hooks/useFileOperations.ts    |  170 +
 apps/web/src/hooks/useMindmap.ts           |  306 ++
 apps/web/src/hooks/useOpenFiles.ts         |  155 +
 apps/web/src/hooks/usePlatform.ts          |   83 +
 apps/web/src/hooks/useViewport.ts          |   13 +
 apps/web/src/index.css                     |  134 +
 apps/web/src/layouts/MainLayout.css        |  496 +++
 apps/web/src/layouts/MainLayout.tsx        |  139 +
 apps/web/src/main.tsx                      |   20 +
 apps/web/src/parsers/FreeMindParser.ts     |  141 +
 apps/web/src/parsers/XMindParser.ts        |  418 ++
 apps/web/tailwind.config.js                |   32 +
 apps/web/tsconfig.json                     |   10 +
 apps/web/vite.config.ts                    |   36 +
 check-icons.js                             |  113 +
 debug-bigmind-quick.js                     |   80 +
 debug-bigmind.js                           |   69 +
 package.json                               |   64 +
 packages/core/package.json                 |   23 +
 packages/core/src/commands.ts              |  336 ++
 packages/core/src/commands/history.ts      |  131 +
 packages/core/src/index.ts                 |   18 +
 packages/core/src/model.ts                 |  267 ++
 packages/core/src/parsers/freemind.ts      |  204 +
 packages/core/src/parsers/xmind.ts         |  161 +
 packages/core/tsconfig.json                |    9 +
 packages/design/package.json               |   19 +
 packages/design/src/index.ts               |    7 +
 packages/design/src/tailwind-preset.ts     |  117 +
 packages/design/src/tokens.ts              |  138 +
 packages/design/tsconfig.json              |    9 +
 packages/ui/package.json                   |   34 +
 packages/ui/src/hooks/useMindmap.ts        |  265 ++
 packages/ui/tsconfig.json                  |    9 +
 playwright.config.ts                       |   90 +
 pnpm-lock.yaml                             | 6425 ++++++++++++++++++++++++++++
 pnpm-workspace.yaml                        |    3 +
 test-map.mm                                |   13 +
 tests/bigmind-debug-firefox.spec.ts        |  177 +
 tests/bigmind-debug.spec.ts                |  164 +
 tsconfig.base.json                         |   31 +
 tsconfig.json                              |   19 +
 turbo.json                                 |   23 +
 81 files changed, 15137 insertions(+)
```

**Voir le diff complet:**

```bash
git show a72e060
```

---

### 2. 9c10440 - feat: implement dynamic DAG-MindMap synchronization

**Hash complet:** `9c104405fc1923dec9e3b0be31d7796091003022`

**Date:** 2025-10-22T20:06:29+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Add event bus system for bidirectional communication
- Create node-tag association store with optimized indexes
- Implement synchronization hooks and components
- Fix tree lines display in tag list view
- Add NodeTagPanel for tagging nodes from MindMap
- Update TagLayersPanelDAG with node count badges
- Complete documentation for synchronization system

The DAG is now dynamically connected to the MindMap with real-time bidirectional sync.

Note: Some ESLint accessibility warnings remain to be fixed in future commits.
```

**Fichiers modifiés (10):**

- `apps/web/docs/dag-sync-mindmap.md`
- `apps/web/src/components/NodeTagPanel.css`
- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.css`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useMindMapDAGSync.ts`
- `apps/web/src/hooks/useNodeTags.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `apps/web/src/types/nodeTag.ts`
- `apps/web/src/utils/eventBus.ts`

**Statistiques:**

```
apps/web/docs/dag-sync-mindmap.md             | 171 ++++++++++++++
 apps/web/src/components/NodeTagPanel.css      | 308 ++++++++++++++++++++++++++
 apps/web/src/components/NodeTagPanel.tsx      | 213 ++++++++++++++++++
 apps/web/src/components/TagLayersPanelDAG.css |  66 ++++++
 apps/web/src/components/TagLayersPanelDAG.tsx |  88 +++++---
 apps/web/src/hooks/useMindMapDAGSync.ts       | 212 ++++++++++++++++++
 apps/web/src/hooks/useNodeTags.ts             | 255 +++++++++++++++++++++
 apps/web/src/hooks/useTagGraph.ts             | 131 ++++++++++-
 apps/web/src/types/nodeTag.ts                 |  48 ++++
 apps/web/src/utils/eventBus.ts                | 119 ++++++++++
 10 files changed, 1581 insertions(+), 30 deletions(-)
```

**Dépendances (parents):**

- `f9390bc22548912552179e0706090997b650b1e7`

**Voir le diff complet:**

```bash
git show 9c10440
```

---

### 3. 02dcc3a - fix: remove sample data from DAG and sync with active map

**Hash complet:** `02dcc3afaf467d32084b538835f1a8bb43140d21`

**Date:** 2025-10-22T20:11:45+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Remove SAMPLE_TAG_GRAPH initialization - DAG starts empty
- Add check for loaded map before showing tags
- Display informative message when no map is loaded
- Hide floating add button when no map exists
- Export useMindMapStore for cross-component usage

The DAG now properly reflects the active mind map state and shows
appropriate empty states when no map is loaded.
```

**Fichiers modifiés (3):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 36 ++++++++++++++++++++-------
 apps/web/src/hooks/useMindmap.ts              |  5 ++++
 apps/web/src/hooks/useTagGraph.ts             |  5 ++--
 3 files changed, 34 insertions(+), 12 deletions(-)
```

**Dépendances (parents):**

- `9c104405fc1923dec9e3b0be31d7796091003022`

**Voir le diff complet:**

```bash
git show 02dcc3a
```

---

### 4. 143551a - fix: correct import path casing for useMindmap

**Hash complet:** `143551a32c9e61b9d5a334e56833fef4e884c975`

**Date:** 2025-10-22T20:14:15+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Fix import from useMindMap to useMindmap (lowercase 'm')
- Update imports in TagLayersPanelDAG and useMindMapDAGSync
- Resolves module export error
```

**Fichiers modifiés (3):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useMindMapDAGSync.ts`
- `apps/web/src/hooks/useMindmap.ts`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx |   2 +-
 apps/web/src/hooks/useMindMapDAGSync.ts       |   2 +-
 apps/web/src/hooks/useMindmap.ts              | 443 --------------------------
 3 files changed, 2 insertions(+), 445 deletions(-)
```

**Dépendances (parents):**

- `02dcc3afaf467d32084b538835f1a8bb43140d21`

**Voir le diff complet:**

```bash
git show 143551a
```

---

### 5. 2cc5bd7 - feat: implement real-time tag synchronization between MindMap and DAG

**Hash complet:** `2cc5bd709675c5be358c2aa8f897545d82fbf27f`

**Date:** 2025-10-22T20:21:23+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Auto-create tags in DAG when added to nodes
- Emit events when tags are added/removed from nodes
- Make event bus globally available
- Add QuickTagTest component for testing synchronization
- Tags now appear immediately in the DAG panel when added

The system now properly syncs tags bidirectionally:
- Adding a tag to a node creates it in the DAG if it doesn't exist
- Removing a tag updates both systems
- Real-time updates without manual refresh
```

**Fichiers modifiés (5):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `apps/web/src/layouts/MainLayout.tsx`
- `apps/web/src/utils/eventBus.ts`

**Statistiques:**

```
apps/web/src/components/QuickTagTest.tsx | 119 +++++++++++++++++++++++++++++++
 apps/web/src/hooks/useMindmap.ts         |  18 +++++
 apps/web/src/hooks/useTagGraph.ts        |  13 ++++
 apps/web/src/layouts/MainLayout.tsx      |   5 ++
 apps/web/src/utils/eventBus.ts           |   8 ++-
 5 files changed, 162 insertions(+), 1 deletion(-)
```

**Voir le diff complet:**

```bash
git show 2cc5bd7
```

---

### 6. bd80777 - feat: ensure tag synchronization is always active

**Hash complet:** `bd8077708fe3be65b03be04aaa921116b4d0b00a`

**Date:** 2025-10-22T20:22:31+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Add TagSyncInitializer component to initialize sync on app startup
- Place initializer in App component to ensure it's always active
- Hooks are now initialized regardless of which components are rendered

This ensures that tag synchronization between MindMap and DAG
is active from the moment the app starts.
```

**Fichiers modifiés (2):**

- `apps/web/src/App.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`

**Statistiques:**

```
apps/web/src/App.tsx                           |  5 +++++
 apps/web/src/components/TagSyncInitializer.tsx | 24 ++++++++++++++++++++++++
 2 files changed, 29 insertions(+)
```

**Dépendances (parents):**

- `2cc5bd709675c5be358c2aa8f897545d82fbf27f`

**Voir le diff complet:**

```bash
git show bd80777
```

---

### 7. ff436ab - debug: add extensive logging for tag synchronization

**Hash complet:** `ff436ab37e316aa2a523f6f69cf47c64c61b37a6`

**Date:** 2025-10-22T20:26:11+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `debug`

**Description:**

```
- Add console logs to track event emission and reception
- Import eventBus directly in useMindmap hook
- Log tag creation and association steps
- Verify event listeners are registered

This helps diagnose why tags are not appearing in the DAG panel
when added to nodes.
```

**Fichiers modifiés (4):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `apps/web/src/utils/eventBus.ts`

**Statistiques:**

```
apps/web/src/components/QuickTagTest.tsx | 12 ++++++++++--
 apps/web/src/hooks/useMindmap.ts         | 13 +++++--------
 apps/web/src/hooks/useTagGraph.ts        | 13 +++++++++++--
 apps/web/src/utils/eventBus.ts           |  3 +++
 4 files changed, 29 insertions(+), 12 deletions(-)
```

**Dépendances (parents):**

- `bd8077708fe3be65b03be04aaa921116b4d0b00a`

**Voir le diff complet:**

```bash
git show ff436ab
```

---

### 8. f95d337 - debug: add more logging to track tag panel updates

**Hash complet:** `f95d3373ee01d28965884f15dce25c72e763cf7f`

**Date:** 2025-10-22T20:27:04+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `debug`

**Description:**

```
- Log tag count changes in TagLayersPanelDAG
- Track listener registration in TagSyncInitializer
- Show active listeners count on initialization

This helps identify if the panel is re-rendering when tags are added.
```

**Fichiers modifiés (2):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx  |  7 +++++++
 apps/web/src/components/TagSyncInitializer.tsx | 16 +++++++++++-----
 2 files changed, 18 insertions(+), 5 deletions(-)
```

**Dépendances (parents):**

- `ff436ab37e316aa2a523f6f69cf47c64c61b37a6`

**Voir le diff complet:**

```bash
git show f95d337
```

---

### 9. f6d6b2d - debug: add direct event test button and improve logging

**Hash complet:** `f6d6b2dfd23f63387aee3d46722bfb3d4beb955f`

**Date:** 2025-10-22T20:28:04+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `debug`

**Description:**

```
- Add 'Test direct événement' button to emit node:tagged directly
- Import eventBus in QuickTagTest component
- This helps test if event system is working independently of MindMap

To test synchronization:
1. Open browser console (F12)
2. Click 'Test direct événement' button
3. Check if new tags appear in the panel
4. Look for console logs showing event flow
```

**Fichiers modifiés (1):**

- `apps/web/src/components/QuickTagTest.tsx`

**Statistiques:**

```
apps/web/src/components/QuickTagTest.tsx | 30 ++++++++++++++++++++++++++++++
 1 file changed, 30 insertions(+)
```

**Dépendances (parents):**

- `f95d3373ee01d28965884f15dce25c72e763cf7f`

**Voir le diff complet:**

```bash
git show f6d6b2d
```

---

### 10. 52ec3f8 - fix: resolve tag synchronization issues

**Hash complet:** `52ec3f8703bd716e8507d01f3f16c3799a13fdd7`

**Date:** 2025-10-22T20:33:07+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Add reset button to clear persisted tags from localStorage
- Fix multiple listener registrations by removing useEffect dependencies
- Access stores directly in event callbacks to get current state
- Import useNodeTagsStore for direct access

The synchronization now works correctly:
- No more duplicate listeners
- Events properly update the tag list
- Reset button allows clearing old persisted tags

To test:
1. Click 'Réinitialiser tous les tags' to clear old data
2. Add tags using the test panel
3. Click 'Test direct événement' to verify sync
```

**Fichiers modifiés (2):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/components/QuickTagTest.tsx | 29 ++++++++++++++++++++++++
 apps/web/src/hooks/useTagGraph.ts        | 38 ++++++++++++++++++++++----------
 2 files changed, 55 insertions(+), 12 deletions(-)
```

**Dépendances (parents):**

- `f6d6b2dfd23f63387aee3d46722bfb3d4beb955f`

**Voir le diff complet:**

```bash
git show 52ec3f8
```

---

### 11. 554c75c - fix: synchroniser les tags uniquement avec la carte active

**Hash complet:** `554c75cf88141f5e5d1d8fda6905366bdb4920d8`

**Date:** 2025-10-22T20:48:14+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Suppression de la persistance des tags entre sessions
- Les tags sont maintenant effacés au démarrage et quand aucune carte n'est chargée
- Synchronisation complète avec la carte active uniquement
- Les tags sont chargés depuis les nœuds de la carte
- Nettoyage automatique du localStorage au démarrage

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (4):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`
- `apps/web/src/hooks/useNodeTags.ts`
- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx  | 50 ++++++++++++-----
 apps/web/src/components/TagSyncInitializer.tsx | 10 ++++
 apps/web/src/hooks/useNodeTags.ts              | 37 +------------
 apps/web/src/hooks/useTagGraph.ts              | 77 ++++++++++++++++++++++----
 4 files changed, 113 insertions(+), 61 deletions(-)
```

**Dépendances (parents):**

- `c2c73afcd4568ea71a7a20e1b23c61902e508af9`

**Voir le diff complet:**

```bash
git show 554c75c
```

---

### 12. ba2df9e - feat(sync): implémentation complète de la synchronisation des tags

**Hash complet:** `ba2df9ea6b3ab1ade1b6b50ffda693721e8f0eed`

**Date:** 2025-10-23T05:27:45+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Synchronisation bidirectionnelle entre useOpenFiles et useMindmap
- Émission d'événements node:tagged depuis NodeProperties et AddTagCommand
- Ajout de logs détaillés pour le débogage de la chaîne de synchronisation
- Composant QuickTagTest pour tester la synchronisation en temps réel
- Suppression de la persistance des tags pour une gestion dynamique

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (10):**

- `apps/web/src/App.tsx`
- `apps/web/src/components/NodeProperties.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useOpenFiles.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `packages/core/src/commands.d.ts.map`
- `packages/core/src/commands.js`
- `packages/core/src/commands.js.map`
- `packages/core/src/commands.ts`

**Statistiques:**

```
apps/web/src/App.tsx                          | 12 ++++++++
 apps/web/src/components/NodeProperties.tsx    | 21 +++++++++++++
 apps/web/src/components/TagLayersPanelDAG.tsx | 32 ++++++++++++++++++++
 apps/web/src/hooks/useMindmap.ts              | 43 ++++++++++++++++++++++++++-
 apps/web/src/hooks/useOpenFiles.ts            |  1 +
 apps/web/src/hooks/useTagGraph.ts             | 34 ++++++++++++++++-----
 packages/core/src/commands.d.ts.map           |  2 +-
 packages/core/src/commands.js                 | 14 ++++++++-
 packages/core/src/commands.js.map             |  2 +-
 packages/core/src/commands.ts                 | 16 +++++++++-
 10 files changed, 164 insertions(+), 13 deletions(-)
```

**Dépendances (parents):**

- `554c75cf88141f5e5d1d8fda6905366bdb4920d8`

**Voir le diff complet:**

```bash
git show ba2df9e
```

---

### 13. dad1af9 - feat: enhance tag display and drag-drop on mind map

**Hash complet:** `dad1af97ac5c38eab02a0febae2321f2daa5a971`

**Date:** 2025-10-23T09:34:34+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Add TagInputWithParent component for improved tag selection
- Implement useTagDragDrop hook for tag drag-drop functionality
- Update MindMapNode with enhanced tag rendering
- Improve NodeProperties with tag management
- Refactor useColorInference, useFileOperations, and useMindMapDAGSync
- Update TagGraph and TagLayersPanelDAG with latest features
- Remove deprecated useMindmap hook
- Enhance event bus and file operations

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (66):**

- `apps/web/src/App.tsx`
- `apps/web/src/components/ImageManager.tsx`
- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/components/MindMapCanvas.tsx`
- `apps/web/src/components/MindMapEdge.tsx`
- `apps/web/src/components/MindMapNode.tsx`
- `apps/web/src/components/NodeContextMenu.tsx`
- `apps/web/src/components/NodeExplorer.tsx`
- `apps/web/src/components/NodeProperties.tsx`
- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/PlatformDebug.tsx`
- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/components/Sidebar.tsx`
- `apps/web/src/components/StatusBar.tsx`
- `apps/web/src/components/StickerPicker.tsx`
- `apps/web/src/components/TagGraph.tsx`
- `apps/web/src/components/TagInputWithParent.tsx`
- `apps/web/src/components/TagLayersPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`
- ... et 46 autres fichiers

**Statistiques:**

```
apps/web/src/App.tsx                               |   38 +-
 apps/web/src/components/ImageManager.tsx           |   35 +-
 apps/web/src/components/MenuBar.tsx                |   86 +-
 apps/web/src/components/MindMapCanvas.tsx          |   63 +-
 apps/web/src/components/MindMapEdge.tsx            |    4 +-
 apps/web/src/components/MindMapNode.tsx            |  176 ++-
 apps/web/src/components/NodeContextMenu.tsx        |  196 ++--
 apps/web/src/components/NodeExplorer.tsx           |   13 +-
 apps/web/src/components/NodeProperties.tsx         | 1180 +++++++++++---------
 apps/web/src/components/NodeTagPanel.tsx           |   60 +-
 apps/web/src/components/PlatformDebug.tsx          |   41 +-
 apps/web/src/components/QuickTagTest.tsx           |   80 +-
 apps/web/src/components/Sidebar.tsx                |   41 +-
 apps/web/src/components/StatusBar.tsx              |   94 +-
 apps/web/src/components/StickerPicker.tsx          |   87 +-
 apps/web/src/components/TagGraph.tsx               |  157 ++-
 apps/web/src/components/TagInputWithParent.tsx     |  115 ++
 apps/web/src/components/TagLayersPanel.tsx         |  116 +-
 apps/web/src/components/TagLayersPanelDAG.tsx      |  153 ++-
 apps/web/src/components/TagSyncInitializer.tsx     |    2 +-
 apps/web/src/components/TemplateGallery.tsx        |   50 +-
 apps/web/src/components/ThemeSelector.tsx          |  141 ++-
 apps/web/src/components/Toolbar.tsx                |   36 +-
 .../src/components/dialogs/InsertImageDialog.tsx   |    8 +-
 .../src/components/dialogs/InsertStickerDialog.tsx |    2 +-
 apps/web/src/hooks/useAssets.ts                    |   70 +-
 apps/web/src/hooks/useCanvasOptions.ts             |    8 +-
 apps/web/src/hooks/useColorInference.ts            |  190 ++--
 apps/web/src/hooks/useColumnCollapse.ts            |   11 +-
 apps/web/src/hooks/useColumnResize.ts              |    2 -
 apps/web/src/hooks/useContextMenuHandlers.ts       |    1 -
 apps/web/src/hooks/useDragAndDrop.ts               |    3 +-
 apps/web/src/hooks/useEditMode.ts                  |    4 +-
 apps/web/src/hooks/useFileOperations.ts            | 1121 ++++++++++---------
 apps/web/src/hooks/useFlowInstance.ts              |    6 +-
 apps/web/src/hooks/useKeyboardNavigation.ts        |   15 +-
 apps/web/src/hooks/useMindMapDAGSync.ts            |   69 +-
 apps/web/src/hooks/useMindmap.ts                   |  501 ---------
 apps/web/src/hooks/useNodeTags.ts                  |  304 ++---
 apps/web/src/hooks/useOpenFiles.ts                 |  139 ++-
 apps/web/src/hooks/usePlatform.ts                  |   19 +-
 apps/web/src/hooks/useReactFlowEdges.ts            |   27 +-
 apps/web/src/hooks/useReactFlowNodes.ts            |   71 +-
 apps/web/src/hooks/useShortcuts.ts                 |   17 +-
 apps/web/src/hooks/useTagDragDrop.ts               |  152 +++
 apps/web/src/hooks/useTagGraph.ts                  |  539 +++++----
 apps/web/src/hooks/useTagLayers.ts                 |   80 +-
 apps/web/src/hooks/useTemplates.ts                 |   66 +-
 apps/web/src/hooks/useThemes.ts                    |   58 +-
 apps/web/src/hooks/useViewport.ts                  |    4 +-
 apps/web/src/layouts/MainLayout.tsx                |   62 +-
 apps/web/src/pages/Settings.tsx                    |   59 +-
 apps/web/src/pages/SettingsAppearanceSection.tsx   |  188 ++--
 apps/web/src/pages/SettingsInteractionSection.tsx  |  140 +--
 apps/web/src/pages/SettingsShortcutsSection.tsx    |  137 +--
 apps/web/src/parsers/FreeMindParser.ts             |   44 +-
 apps/web/src/types/dag.ts                          |   16 +-
 apps/web/src/types/nodeTag.ts                      |    2 +-
 apps/web/src/utils/backgroundPatterns.ts           |    1 -
 apps/web/src/utils/cn.ts                           |    2 +-
 apps/web/src/utils/colorUtils.ts                   |    4 +-
 apps/web/src/utils/eventBus.ts                     |   11 +-
 apps/web/src/utils/inputUtils.ts                   |   17 +-
 apps/web/src/utils/nodeUtils.ts                    |   11 +-
 apps/web/src/utils/shortcutUtils.ts                |  103 +-
 apps/web/src/utils/toast.ts                        |    7 +-
 66 files changed, 3658 insertions(+), 3597 deletions(-)
```

**Dépendances (parents):**

- `afed6f3f147e0ab3972a6d63bd51c289025ae96b`

**Voir le diff complet:**

```bash
git show dad1af9
```

---

### 14. 5bc52ed - refactor: consolidate tag creation logic into shared utility function

**Hash complet:** `5bc52ed2f673933cb5527ac7c56e578b83f7e80e`

**Date:** 2025-10-23T13:10:19+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Created tagUtils.ts with createAndAssociateTag() and helper functions
- generateTagId() for consistent tag ID generation
- getColorForTag() for deterministic color assignment based on label
- createTag() for complete DagTag object creation with proper structure
- Updated NodeTagPanel to use shared utility (fixes DAG panel sync)
- Updated TagLayersPanelDAG to use shared utility for consistency
- Tags created via context menu now include proper color and structure
- Fixed resetTagDrag function ordering in TagLayersPanelDAG
- Eliminates code duplication and ensures single source of truth

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (3):**

- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/utils/tagUtils.ts`

**Statistiques:**

```
apps/web/src/components/NodeTagPanel.tsx      |  16 +--
 apps/web/src/components/TagLayersPanelDAG.tsx | 149 ++++++++++++++++++++------
 apps/web/src/utils/tagUtils.ts                | 100 +++++++++++++++++
 3 files changed, 221 insertions(+), 44 deletions(-)
```

**Dépendances (parents):**

- `dad1af97ac5c38eab02a0febae2321f2daa5a971`

**Voir le diff complet:**

```bash
git show 5bc52ed
```

---

### 15. 5ae7784 - fix: sync DAG panel when tag is created via context menu

**Hash complet:** `5ae7784f5ca1cdf31369b9166240a52824151965`

**Date:** 2025-10-23T13:16:20+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- NodeTagPanel now emits 'tag:created' event after tag creation
- TagLayersPanelDAG listens to 'tag:created' and resynchronizes
- Fixes issue where tags created via context menu weren't appearing in DAG panel
- Ensures tags are properly synchronized across all views

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/NodeTagPanel.tsx      | 12 +++++++++++-
 apps/web/src/components/TagLayersPanelDAG.tsx | 12 +++++++++++-
 2 files changed, 22 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `7689f5c76a3b5108de71f2bd2411838dfd40147b`

**Voir le diff complet:**

```bash
git show 5ae7784
```

---

### 16. c4269c7 - debug: add logging to track tag creation flow

**Hash complet:** `c4269c7f328e4a4a38350507361ba6f296a14b3c`

**Date:** 2025-10-23T13:29:46+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `debug`

**Description:**

```
- Added console logs in NodeTagPanel to verify tag creation
- Modified tag:created event handler in TagLayersPanelDAG
- Removed unnecessary syncFromMindMap call since tags share Zustand store
- Logging will help identify where tags are lost in the flow

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/NodeTagPanel.tsx      | 5 +++++
 apps/web/src/components/TagLayersPanelDAG.tsx | 8 +++-----
 2 files changed, 8 insertions(+), 5 deletions(-)
```

**Dépendances (parents):**

- `c9c60435f8110e6d288d4fe130472c64ffe016da`

**Voir le diff complet:**

```bash
git show c4269c7
```

---

### 17. 4d2409c - fix: preserve tags created via UI when syncing from mindmap

**Hash complet:** `4d2409cc0aa18d7d9c5c3a1bd3cfc844eb32fadd`

**Date:** 2025-10-23T13:32:44+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Removed clearTags() call that was deleting all tags during sync
- syncFromMindMap now merges tags instead of clearing them
- Only adds tags from MindMap that don't already exist in store
- Preserves tags created via dropdown menu (which aren't in MindMap)
- Fixes issue where tags created via context menu disappeared after sync

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/hooks/useTagGraph.ts | 26 ++++++++++++++------------
 1 file changed, 14 insertions(+), 12 deletions(-)
```

**Dépendances (parents):**

- `564fae00398befcabc9ebc844f8a55492ad39171`

**Voir le diff complet:**

```bash
git show 4d2409c
```

---

### 18. f39ccd7 - debug: add comprehensive logging for tag creation in DAG panel

**Hash complet:** `f39ccd791a6ada797858bd63e6a322b2cb063aba`

**Date:** 2025-10-23T13:40:36+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `debug`

**Description:**

```
- Added logging in useTagGraphStore.addTag() to trace tag additions
- Added logging in getRootTags() to show all tags and root tags
- Added logging in renderListView() to trace rendering flow
- Added logging in renderTag() to trace individual tag rendering
- Added logging in addTagWithSync() to trace synchronization
- Added logging in handleCreateTag() to trace form submission

Helps diagnose why tags created via dropdown menu don't appear in arborescence

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (10):**

- `apps/web/src/App.tsx`
- `apps/web/src/components/MindMapNode.tsx`
- `apps/web/src/components/TagDragGhost.tsx`
- `apps/web/src/components/TagLayersPanelDAG.css`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/contexts/TagDragDropContext.tsx`
- `apps/web/src/hooks/useTagDragDrop.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `apps/web/src/layouts/MainLayout.css`
- `apps/web/src/layouts/MainLayout.tsx`

**Statistiques:**

```
apps/web/src/App.tsx                          | 28 ++++++----
 apps/web/src/components/MindMapNode.tsx       | 73 ++++++++++++++++++++++-----
 apps/web/src/components/TagDragGhost.tsx      | 43 ++++++++++++++++
 apps/web/src/components/TagLayersPanelDAG.css |  2 +-
 apps/web/src/components/TagLayersPanelDAG.tsx | 24 +++++++++
 apps/web/src/contexts/TagDragDropContext.tsx  | 35 +++++++++++++
 apps/web/src/hooks/useTagDragDrop.ts          | 72 +++++++++++++++++---------
 apps/web/src/hooks/useTagGraph.ts             | 40 ++++++++++++++-
 apps/web/src/layouts/MainLayout.css           |  6 +--
 apps/web/src/layouts/MainLayout.tsx           |  5 --
 10 files changed, 269 insertions(+), 59 deletions(-)
```

**Dépendances (parents):**

- `4d2409cc0aa18d7d9c5c3a1bd3cfc844eb32fadd`

**Voir le diff complet:**

```bash
git show f39ccd7
```

---

### 19. 1fdaffb - fix: ensure tags created via MindMapCanvas are added to DAG store

**Hash complet:** `1fdaffba3392a641eb4090a8ab18543ed96322f0`

**Date:** 2025-10-23T13:44:22+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Added useTagGraph hook to MindMapCanvas
- Added createAndAssociateTag call in onAddTag handler
- Tags created via node context menu are now synced to DAG panel
- This fixes tags not appearing in "Tags et calques" arborescence

Issue: MindMapCanvas was creating tags only in MindMap, not in DAG store.
Solution: Use createAndAssociateTag to ensure tags are added to both.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapCanvas.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapCanvas.tsx | 13 +++++++++++++
 1 file changed, 13 insertions(+)
```

**Dépendances (parents):**

- `f39ccd791a6ada797858bd63e6a322b2cb063aba`

**Voir le diff complet:**

```bash
git show 1fdaffb
```

---

### 20. af2a230 - fix: properly save and restore node tags in bigmind.json

**Hash complet:** `af2a230182e8738b9a8e3ceb82b997964816fb31`

**Date:** 2025-10-23T19:42:13+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Add tags property to saved node data in bigmind.json
- Restore node-tag associations by calling syncFromDAG after importing tags
- Ensures tags on individual nodes are persisted and restored correctly
- Fixes issue where tags would be visible in bigmind.json but not displayed after reopening file

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useFileOperations.ts`

**Statistiques:**

```
apps/web/src/hooks/useFileOperations.ts | 11 +++++++++++
 1 file changed, 11 insertions(+)
```

**Dépendances (parents):**

- `04b9e13895aa80f6599ec4d8c514d154fc1b200d`

**Voir le diff complet:**

```bash
git show af2a230
```

---

### 21. a8125e7 - refactor: simplify deleteTagWithSync to only modify store

**Hash complet:** `a8125e7576b78cd12d469289b9a296f0a5a9e3a2`

**Date:** 2025-10-23T20:06:53+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Remove updateNodeTags logic that tried to modify node.tags
- Source of truth is now exclusively useNodeTagsStore
- deleteTag only modifies: DAG state and node-tag associations
- Prepare for full centralization of tag data

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/hooks/useTagGraph.ts | 26 +++-----------------------
 1 file changed, 3 insertions(+), 23 deletions(-)
```

**Dépendances (parents):**

- `7d08e5e0dc0d73973264bb979c6021322aa862e4`

**Voir le diff complet:**

```bash
git show a8125e7
```

---

### 22. f4d91d8 - refactor: centralize tag modifications through useNodeTagsStore

**Hash complet:** `f4d91d826c0350520543911c5b3f9aa7910a1a85`

**Date:** 2025-10-23T20:10:37+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Add setNodeTags method to useNodeTagsStore for updating node tags atomically
- Replace all updateNodeTags calls with setNodeTagsList in TagLayersPanel
- Use only useNodeTagsStore as single source of truth for tag operations
- Remove dependency on useOpenFiles.updateNodeTags in TagLayersPanel
- Add helpers getNodeTagsList and setNodeTagsList for store access

Key changes:
- setNodeTags handles adding/removing tags efficiently
- TagLayersPanel now delegates all modifications to the store
- Simplifies state synchronization (no need to update node.tags separately)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/TagLayersPanel.tsx`
- `apps/web/src/hooks/useNodeTags.ts`

**Statistiques:**

```
apps/web/src/components/TagLayersPanel.tsx | 13 +++++++------
 apps/web/src/hooks/useNodeTags.ts          | 23 +++++++++++++++++++++++
 2 files changed, 30 insertions(+), 6 deletions(-)
```

**Dépendances (parents):**

- `fdc3512819c959e2492ff33724b4d59e4d4ff747`

**Voir le diff complet:**

```bash
git show f4d91d8
```

---

### 23. 1fd9740 - refactor: complete centralization of tag data - single source of truth

**Hash complet:** `1fd9740615f21827d67c6a4a547b78af4e70c99b`

**Date:** 2025-10-23T20:15:08+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
SUMMARY OF REFACTORING:
=====================

Problem: Tags were stored in multiple places causing sync issues:
- node.tags (from XMind file)
- useNodeTagsStore (in-memory associations)
- useTagGraphStore (DAG)

Solution: useNodeTagsStore is now the single source of truth

Changes made:
1. ✅ Simplified deleteTagWithSync to only modify the store
2. ✅ Added setNodeTags method to atomically update node tags
3. ✅ Replaced updateNodeTags calls with setNodeTagsList in TagLayersPanel
4. ✅ Made MindMapNode read from useNodeTagsStore instead of props

How it works now:
- When you delete a tag via the hierarchy
  → deleteTag() → removeTagFromAllNodes()
    → useNodeTagsStore updated
      → MindMapNode re-renders with new tags from store
        → Tag disappears from the node! ✨

Benefits:
✅ Single source of truth (no sync issues)
✅ Consistent state across all components
✅ Simpler logic (no need to update multiple places)
✅ Re-renders work correctly

Testing:
Try deleting a tag from the hierarchy - it should now disappear
from all nodes immediately!

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (0):**

**Dépendances (parents):**

- `4efae279c65d35d35a3bf5850b2f052b48aa72a1`

**Voir le diff complet:**

```bash
git show 1fd9740
```

---

### 24. fc270d6 - refactor: unify tag addition through addTagToNodeSync

**Hash complet:** `fc270d66cc7197d0e4e84887f9484e0532ddf493`

**Date:** 2025-10-23T20:20:12+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Create addTagToNodeSync that properly updates useNodeTagsStore
- Replace associateTagToNode with addTagToNode in MenuBar.tsx
- Both code paths (dropdown menu and NodeTagPanel) now use same function
- Ensures tag additions sync correctly to MindMapNode display

Key fix:
- associateTagToNode was only updating DAG, not useNodeTagsStore
- Now all tag operations go through unified sync functions:
  - addTagToNode: adds tag to node (updates store)
  - deleteTag: removes tag (updates store)
  - setNodeTags: replaces all tags (updates store)

Result: Tag additions via dropdown menu now work correctly!

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/components/MenuBar.tsx | 4 ++--
 apps/web/src/hooks/useTagGraph.ts   | 8 ++++++++
 2 files changed, 10 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `1fd9740615f21827d67c6a4a547b78af4e70c99b`

**Voir le diff complet:**

```bash
git show fc270d6
```

---

### 25. 5123b7e - refactor: unify tag addition - both paths use sync.tagNode()

**Hash complet:** `5123b7e52a193a99b78e24cf1b8f9bccba35599d`

**Date:** 2025-10-23T20:22:16+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
KEY FIX: MenuBar and NodeTagPanel now use the SAME function

Before:
- NodeTagPanel → sync.tagNode() → updates store + node.tags ✅
- MenuBar → addTagToNode() → only updates store ❌ (MISSING node.tags update)

After:
- NodeTagPanel → sync.tagNode() → updates everything ✅
- MenuBar → sync.tagNode() → updates everything ✅

What sync.tagNode() does:
1. Verify tag exists
2. Add to useNodeTagsStore
3. Update node.tags via openFiles.updateNodeTags()
4. Emit event for synchronization

This ensures:
✅ Tag additions work from both dropdown and NodeTagPanel
✅ node.tags stays in sync
✅ MindMapNode reads from store (always correct)
✅ Single source of truth

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/components/MenuBar.tsx |  6 ++++--
 apps/web/src/hooks/useTagGraph.ts   | 17 +++++++++++++++--
 2 files changed, 19 insertions(+), 4 deletions(-)
```

**Dépendances (parents):**

- `fc270d66cc7197d0e4e84887f9484e0532ddf493`

**Voir le diff complet:**

```bash
git show 5123b7e
```

---

### 26. 6d9a969 - refactor: unify tag operations in NodeContextMenu - use centralized sync functions

**Hash complet:** `6d9a9699d5cf1e8cb43108a1f79d30aca24f6783`

**Date:** 2025-10-23T20:28:01+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Updated MindMapCanvas.tsx onAddTag handler to use sync.tagNode() instead of
  AddTagCommand
- Updated MindMapCanvas.tsx onRemoveTag handler to use sync.untagNode() instead of
  RemoveTagCommand
- Removed unused imports: AddTagCommand, RemoveTagCommand, createAndAssociateTag,
  useTagGraph
- This ensures tag addition via right-click context menu uses the SAME code path
  as other methods
- All tag operations now go through unified functions that update useNodeTagsStore,
  node.tags, and emit events

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapCanvas.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapCanvas.tsx | 40 +++++++++----------------------
 1 file changed, 11 insertions(+), 29 deletions(-)
```

**Dépendances (parents):**

- `5123b7e52a193a99b78e24cf1b8f9bccba35599d`

**Voir le diff complet:**

```bash
git show 6d9a969
```

---

### 27. 4a05c39 - fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

**Hash complet:** `4a05c393c8bf137aee235734cc87e436f28f4da1`

**Date:** 2025-10-25T09:58:39+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
**Problème:** Les nœuds créés n'étaient pas visibles sur la carte mentale, bien qu'ils existaient dans l'explorateur de nœuds.

**Cause:** Duplication entre `rootNode` et `nodes[rootId]`. Quand on crée un enfant, `AddNodeCommand` met à jour `nodes[parentId].children`, mais `useReactFlowNodes` utilisait la référence séparée `rootNode` qui n'était pas synchronisée.

**Solutions apportées:**
1. **useReactFlowNodes.ts**: Utiliser TOUJOURS le nœud du dictionnaire (`nodes[rootNodeId]`) au lieu de `rootNode` séparé
2. **useOpenFiles.ts**: Assurer que le nœud racine a les propriétés `x`, `y`, `width`, `height` définies lors de sa création
3. **commands.ts**: Ajouter la propriété `tags: []` aux nouveaux nœuds créés
4. **useOpenFiles.ts**: Augmenter le rayon de positionnement des enfants du root (200 → 350) pour éviter les chevauchements

Les nœuds sont maintenant:
✅ Correctement créés avec toutes les propriétés requises
✅ Synchronisés avec le dictionnaire principal
✅ Visibles sur la carte sans chevauchement

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (3):**

- `apps/web/src/hooks/useOpenFiles.ts`
- `apps/web/src/hooks/useReactFlowNodes.ts`
- `packages/core/src/commands.ts`

**Statistiques:**

```
apps/web/src/hooks/useOpenFiles.ts      | 68 +++++++++++++++++++++++++++++----
 apps/web/src/hooks/useReactFlowNodes.ts |  9 ++++-
 packages/core/src/commands.ts           |  1 +
 3 files changed, 69 insertions(+), 9 deletions(-)
```

**Voir le diff complet:**

```bash
git show 4a05c39
```

---

### 28. a6fbac2 - chore: initialize feat/tags-clean branch - clean starting point without node repositioning

**Hash complet:** `a6fbac26fbff8cf0e7182da11c4b81ac9f031e20`

**Date:** 2025-10-25T10:16:32+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `chore`

**Description:**

```
This branch contains all tag-related work and improvements, but excludes the
problematic node repositioning feature that was implemented in feat/free-node-placement.

✅ Includes:
- Complete tag synchronization system
- Tag display on mind map
- Tag layer management
- Recent files menu
- All tag refactoring improvements

❌ Excludes:
- Free node placement implementation
- Force-directed layout algorithm
- Node repositioning features

This is the clean baseline for continuing tag-related development.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (0):**

**Voir le diff complet:**

```bash
git show a6fbac2
```

---

## Phase 3: Affichage UI des Tags {#3_display}

**Commits dans cette phase:** 10

### 1. c2c73af - fix: always show tags panel regardless of map state

**Hash complet:** `c2c73afcd4568ea71a7a20e1b23c61902e508af9`

**Date:** 2025-10-22T20:37:14+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Remove map loaded check - tags are independent of maps
- Always display tag management interface
- Show floating add button at all times
- Add debug logging for localStorage content before reset

Tags are now a global feature that can be managed independently
of whether a specific mind map is loaded.
```

**Fichiers modifiés (2):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/QuickTagTest.tsx      |  4 ++++
 apps/web/src/components/TagLayersPanelDAG.tsx | 34 ++++++++++-----------------
 2 files changed, 16 insertions(+), 22 deletions(-)
```

**Dépendances (parents):**

- `52ec3f8703bd716e8507d01f3f16c3799a13fdd7`

**Voir le diff complet:**

```bash
git show c2c73af
```

---

### 2. ea71f6e - feat(ui): affichage des tags sur les nœuds de la carte

**Hash complet:** `ea71f6e0a3ff144cd1f29f64f35e271ff0dfb306`

**Date:** 2025-10-23T05:35:00+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Ajout de l'affichage visuel des tags sous forme de badges bleus sous le titre des nœuds
- Les tags sont affichés dans un conteneur flex avec wrap pour s'adapter à la largeur
- Style des badges : fond bleu (#3B82F6), texte blanc, bordure subtile
- Limitation de la largeur des badges à 80px avec ellipsis pour les tags longs
- Affichage conditionnel uniquement si le nœud a des tags
- Utilisation de la propriété `nodeTags` déjà disponible dans les données du nœud
- Correction de la clé unique pour les tags (utilisation du tag comme clé au lieu de l'index)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 47 +++++++++++++++++++++++++++------
 1 file changed, 39 insertions(+), 8 deletions(-)
```

**Dépendances (parents):**

- `ba2df9ea6b3ab1ade1b6b50ffda693721e8f0eed`

**Voir le diff complet:**

```bash
git show ea71f6e
```

---

### 3. 6570432 - fix(ui): amélioration du centrage horizontal des tags

**Hash complet:** `65704327fd03a09761fa019f3a7f79115aacaad9`

**Date:** 2025-10-23T05:57:44+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Ajout de justify-center pour centrer les tags dans leur conteneur
- whiteSpace: nowrap pour garder les tags sur une ligne
- minWidth: max-content pour adapter le conteneur à la largeur totale des tags
- display: inline-block pour chaque badge
- Augmentation maxWidth des badges à 100px
- Les tags dépassent maintenant équitablement à gauche et à droite du nœud

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `62c999dc63a2066efbbc95f25c9775f3d4b50985`

**Voir le diff complet:**

```bash
git show 6570432
```

---

### 4. fc5c2e7 - fix(ui): affichage complet des tags sans troncature

**Hash complet:** `fc5c2e748c0ae982344b97e826687b83ce08ec0e`

**Date:** 2025-10-23T06:03:07+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Retrait de maxWidth: '100px' qui limitait la largeur des badges
- Retrait de overflow: 'hidden' et textOverflow: 'ellipsis'
- Les tags s'affichent maintenant dans leur intégralité
- whiteSpace: 'nowrap' conservé pour éviter les retours à la ligne dans un tag
- Les tags longs dépasseront naturellement à gauche et à droite du nœud

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 3 ---
 1 file changed, 3 deletions(-)
```

**Dépendances (parents):**

- `84b81a8b4f33f69866c2584756cf246df0378f5c`

**Voir le diff complet:**

```bash
git show fc5c2e7
```

---

### 5. 7689f5c - fix: ensure parent property is omitted when tag has no parent

**Hash complet:** `7689f5c76a3b5108de71f2bd2411838dfd40147b`

**Date:** 2025-10-23T13:13:00+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Only add 'parents' property to DagTag if parentTagId is provided
- This ensures tags created without parents match the original behavior
- Fixes DAG panel display for tags created via context menu

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/utils/tagUtils.ts`

**Statistiques:**

```
apps/web/src/utils/tagUtils.ts | 11 +++++++++--
 1 file changed, 9 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `5bc52ed2f673933cb5527ac7c56e578b83f7e80e`

**Voir le diff complet:**

```bash
git show 7689f5c
```

---

### 6. 8c136ca - feat: add drag and drop phantom for tag hierarchy

**Hash complet:** `8c136ca954905dbfe926e5e80b0fc229d8e9b311`

**Date:** 2025-10-23T14:02:39+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Added mousePosition state tracking during tag drag
- Display visual phantom (fixed position) following cursor
- Green phantom for copy mode (Alt key), orange for move mode
- Shows "📋 Copier" for copy or "✂️ Déplacer" for move
- Phantom follows cursor position with smooth positioning
- Includes glow effect and backdrop blur for visibility

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 32 +++++++++++++++++++++++++++
 1 file changed, 32 insertions(+)
```

**Dépendances (parents):**

- `ee6c03b93e77270cfd05f6020e42bbe6e94df1c9`

**Voir le diff complet:**

```bash
git show 8c136ca
```

---

### 7. 9a2fc98 - feat: improve tag drag phantom and add refresh button

**Hash complet:** `9a2fc985364ee3963066a2dfc483b009f742c684`

**Date:** 2025-10-23T14:05:41+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Modified drag phantom to display original tag appearance with transparency
- Phantom now shows tag color and label with opacity: 0.4
- Added discrete refresh button in bottom-right corner of tag panel
- Refresh button is gray, very subtle with hover effect
- Button has cyclic behavior to force UI refresh on demand

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 87 ++++++++++++++++++---------
 1 file changed, 58 insertions(+), 29 deletions(-)
```

**Dépendances (parents):**

- `8c136ca954905dbfe926e5e80b0fc229d8e9b311`

**Voir le diff complet:**

```bash
git show 9a2fc98
```

---

### 8. 37376ee - feat: centralize tag labels from DAG store in MindMapNode

**Hash complet:** `37376eea2f72fecab9b27eebaf98a2992591b72f`

**Date:** 2025-10-23T14:29:29+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Added useTagGraph hook to MindMapNode
- Created getTagLabel() function to fetch tag label from store
- Display tag labels instead of IDs on nodes
- When tag is renamed in arborescence, all nodes automatically show new label
- Fixes issue where tag renames didn't propagate to nodes

This makes tag information centralized in the DAG store.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 13 +++++++++++--
 1 file changed, 11 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `ae4b61739419638445c78dac3408f3394aa2bf8f`

**Voir le diff complet:**

```bash
git show 37376ee
```

---

### 9. 43f9f51 - feat: centralize tag colors from DAG store in MindMapNode

**Hash complet:** `43f9f5176c416909de372e49617a69370e162e45`

**Date:** 2025-10-23T14:31:49+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Added getTagColor() function to fetch tag color from store
- Display tag color from centralized DAG store on nodes
- When tag color changes in arborescence, nodes automatically update
- Ensures tag information (label + color) is fully centralized

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 9 ++++++++-
 1 file changed, 8 insertions(+), 1 deletion(-)
```

**Dépendances (parents):**

- `37376eea2f72fecab9b27eebaf98a2992591b72f`

**Voir le diff complet:**

```bash
git show 43f9f51
```

---

### 10. 7d08e5e - fix: properly remove tags from nodes when deleting from hierarchy

**Hash complet:** `7d08e5e0dc0d73973264bb979c6021322aa862e4`

**Date:** 2025-10-23T20:02:32+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Use updateNodeTags() to properly update node state in useOpenFiles
- Ensures React re-renders components that display node tags
- Remove tag from each affected node's tags array
- Calls updateNodeTags with filtered tags array to trigger state update
- Fixes issue where deleted tags were still visible on nodes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/hooks/useTagGraph.ts | 14 ++++++++------
 1 file changed, 8 insertions(+), 6 deletions(-)
```

**Dépendances (parents):**

- `1cc53daff67c08d9281971d9b7c6dcc6484a0dfb`

**Voir le diff complet:**

```bash
git show 7d08e5e
```

---

## Phase 4: Positionnement Visuel {#4_positioning}

**Commits dans cette phase:** 13

### 1. 69abee4 - feat(ui): repositionnement des tags sur le bord droit des nœuds

**Hash complet:** `69abee4b50dd6c605305e482ba54bfe0ef39d198`

**Date:** 2025-10-23T05:46:31+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Les tags sont maintenant positionnés à cheval sur le bord droit du nœud
- Positionnement absolu avec right: -8px pour chevaucher la bordure
- Centrage vertical avec transform: translateY(-50%)
- Organisation en colonne verticale avec gap de 1px
- Amélioration de l'ombre portée pour plus de lisibilité
- Augmentation de la largeur max des badges à 100px

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/MindMapNode.tsx`
- `apps/web/src/hooks/useReactFlowNodes.ts`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 81 +++++++++++++++++++--------------
 apps/web/src/hooks/useReactFlowNodes.ts |  1 +
 2 files changed, 49 insertions(+), 33 deletions(-)
```

**Dépendances (parents):**

- `e6c87b55f7ca3d569984e03eb8b653cd94b8ecf4`

**Voir le diff complet:**

```bash
git show 69abee4
```

---

### 2. eaedf0c - fix(ui): repositionnement des tags sur le bord inférieur centré

**Hash complet:** `eaedf0cd89375089a031159b52277957e9208d2c`

**Date:** 2025-10-23T05:51:16+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Les tags sont maintenant positionnés à cheval sur le bord inférieur du nœud
- Positionnement avec bottom: -8px pour chevaucher la bordure inférieure
- Centrage horizontal parfait avec left: 50% et transform: translateX(-50%)
- Organisation en ligne horizontale (flex-row) au lieu de colonne
- Le milieu de la ligne des tags est aligné avec le milieu du nœud (axe X)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 14 +++++++-------
 1 file changed, 7 insertions(+), 7 deletions(-)
```

**Dépendances (parents):**

- `69abee4b50dd6c605305e482ba54bfe0ef39d198`

**Voir le diff complet:**

```bash
git show eaedf0c
```

---

### 3. 62c999d - fix(ui): alignement précis des tags sur la bordure inférieure

**Hash complet:** `62c999dc63a2066efbbc95f25c9775f3d4b50985`

**Date:** 2025-10-23T05:54:33+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Position bottom: 0 pour placer le conteneur au niveau de la bordure
- Transform translateY(50%) pour descendre les tags de la moitié de leur hauteur
- Le centre vertical des tags est maintenant exactement sur la bordure inférieure
- Transform translateX(-50%) maintenu pour le centrage horizontal parfait
- Résultat : les tags sont parfaitement centrés en X et leur milieu en Y est sur la bordure

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `eaedf0cd89375089a031159b52277957e9208d2c`

**Voir le diff complet:**

```bash
git show 62c999d
```

---

### 4. 84b81a8 - fix(ui): correction définitive du centrage géométrique des tags

**Hash complet:** `84b81a8b4f33f69866c2584756cf246df0378f5c`

**Date:** 2025-10-23T06:01:23+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Utilisation de left: 0 et right: 0 pour étendre le conteneur sur toute la largeur du nœud
- justifyContent: center pour centrer les tags dans la largeur complète (200px)
- Suppression de translateX(-50%) qui causait un décalage incorrect
- Conservation de translateY(50%) pour le positionnement vertical à cheval
- Les tags sont maintenant centrés par rapport au vrai centre du nœud (milieu entre bord gauche et droit)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 10 ++++++----
 1 file changed, 6 insertions(+), 4 deletions(-)
```

**Dépendances (parents):**

- `65704327fd03a09761fa019f3a7f79115aacaad9`

**Voir le diff complet:**

```bash
git show 84b81a8
```

---

### 5. 2ad5e9a - fix(ui): positionnement précis du milieu vertical des tags sur la bordure

**Hash complet:** `2ad5e9ad6455068a0173e1161e9bbecdf828ed06`

**Date:** 2025-10-23T06:05:26+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Changement de bottom: '-1px' à bottom: '0' pour un alignement exact
- Avec transform: translateY(50%), le conteneur descend de 50% de sa hauteur
- Résultat : le milieu vertical des badges est exactement sur la bordure inférieure du nœud
- Les tags sont à moitié au-dessus et à moitié en-dessous de la bordure

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `fc5c2e748c0ae982344b97e826687b83ce08ec0e`

**Voir le diff complet:**

```bash
git show 2ad5e9a
```

---

### 6. f851261 - fix(ui): positionnement cohérent des tags pour tous les nœuds

**Hash complet:** `f851261acd08788ab7aa783930038066d298ee21`

**Date:** 2025-10-23T06:13:50+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Changement de bottom: '-8px' à bottom: '0' pour partir de la bordure
- Utilisation de transform: translateY(calc(50% + 8px)) au lieu de translateY(50%)
- Cette approche garantit que tous les nœuds ont leurs tags positionnés de la même manière
- Les tags sont à cheval sur la bordure (50%) + descendent de 8px supplémentaires
- Retrait des logs de débogage

Résout le problème où les tags étaient à l'intérieur du nœud pour certains nœuds
et correctement positionnés pour d'autres.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 10 ++--------
 1 file changed, 2 insertions(+), 8 deletions(-)
```

**Dépendances (parents):**

- `5c8e9211265801c68bdd9389ddc366d23763db62`

**Voir le diff complet:**

```bash
git show f851261
```

---

### 7. 33b169d - fix(ui): empêcher les tags d'agrandir la hauteur du nœud

**Hash complet:** `33b169d0e4aca944f5ec4f285beec8d749be9e99`

**Date:** 2025-10-23T06:16:36+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Ajout de overflow: 'visible' au conteneur principal du nœud
- Cela permet aux tags en position absolute de déborder sans forcer le nœud à s'agrandir
- Le nœud garde maintenant sa hauteur d'origine même avec des tags affichés
- Les tags sont complètement en dehors du flux du document

Résout le problème où l'ajout de tags agrandissait verticalement le nœud.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 15 ++++++++-------
 1 file changed, 8 insertions(+), 7 deletions(-)
```

**Dépendances (parents):**

- `f851261acd08788ab7aa783930038066d298ee21`

**Voir le diff complet:**

```bash
git show 33b169d
```

---

### 8. d87432e - fix(ui): wrapper hauteur 0 pour empêcher agrandissement du nœud

**Hash complet:** `d87432ee30552eca937c71ac7f1fccdd668bba32`

**Date:** 2025-10-23T06:19:30+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Création d'un wrapper externe avec height: 0 qui ne contribue PAS à la hauteur du nœud
- Le wrapper a overflow: visible pour permettre aux tags de déborder
- Conteneur interne position: relative pour le positionnement des tags
- Ajout de pointerEvents: none sur le wrapper et auto sur les tags pour les interactions
- Cette structure à deux niveaux garantit que les tags n'affectent pas la hauteur du nœud

Solution définitive au problème d'agrandissement vertical du nœud lors de l'ajout de tags.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 67 +++++++++++++++++++--------------
 1 file changed, 39 insertions(+), 28 deletions(-)
```

**Dépendances (parents):**

- `33b169d0e4aca944f5ec4f285beec8d749be9e99`

**Voir le diff complet:**

```bash
git show d87432e
```

---

### 9. 1f38451 - feat(ui): descente du centre Y du tag de 20% sous la bordure

**Hash complet:** `1f38451f37ecc2b777c53ec49e6c87cebaa1481e`

**Date:** 2025-10-23T06:27:02+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Changement de translateY(50%) à translateY(70%)
- translateY(70%) = translateY(50% + 20%)
- Le centre vertical du tag est maintenant positionné à 20% de la hauteur du tag en dessous de la bordure inférieure
- Environ 30% du tag visible au-dessus de la bordure, 70% en-dessous

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Dépendances (parents):**

- `8741f7fb931662b8a0070448c12d28d9b2350e0c`

**Voir le diff complet:**

```bash
git show 1f38451
```

---

### 10. 48dc7f1 - fix(ui): correction positionnement tag à cheval avec valeur pixels

**Hash complet:** `48dc7f17d0025df7a8dd63e21bb2abdc622e3c2e`

**Date:** 2025-10-23T06:32:21+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Changement de translateY(70%) à translateY(calc(50% + 4px))
- translateY(50%) met le centre du tag sur la bordure (à cheval)
- + 4px descend le centre de ~20% de la hauteur du tag (~18px)
- Résultat: environ 30% du tag au-dessus de la bordure, 70% en dessous
- Le tag est maintenant correctement à cheval sur la bordure

Le problème précédent: translateY(70%) calculait 70% de la hauteur du conteneur,
pas du tag, ce qui le plaçait complètement en dessous.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Dépendances (parents):**

- `1f38451f37ecc2b777c53ec49e6c87cebaa1481e`

**Voir le diff complet:**

```bash
git show 48dc7f1
```

---

### 11. 152e280 - fix(ui): remontage du tag pour positionnement à cheval correct

**Hash complet:** `152e2802c8f5e443375072d8ff535a90ccc3b7e3`

**Date:** 2025-10-23T06:43:28+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Changement de translateY(calc(50% + 4px)) à translateY(-5px)
- Le wrapper est à bottom: 0 (sur la bordure)
- translateY(-5px) remonte le tag de 5px au-dessus de la bordure
- Avec une hauteur de tag ~18px : ~5px au-dessus (28%), ~13px en dessous (72%)
- Ratio proche de 30/70 comme demandé
- Le tag est maintenant visiblement à cheval sur la bordure

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Dépendances (parents):**

- `48dc7f17d0025df7a8dd63e21bb2abdc622e3c2e`

**Voir le diff complet:**

```bash
git show 152e280
```

---

### 12. d0c8232 - index on feat/tags-clean: a6fbac2 chore: initialize feat/tags-clean branch - clean starting point without node repositioning

**Hash complet:** `d0c823253387d9b2e9afe57c1925a685113ae003`

**Date:** 2025-10-25T10:26:33+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `other`

**Fichiers modifiés (0):**

**Dépendances (parents):**

- `a6fbac26fbff8cf0e7182da11c4b81ac9f031e20`

**Voir le diff complet:**

```bash
git show d0c8232
```

---

### 13. 63a1fab - WIP on feat/tags-clean: a6fbac2 chore: initialize feat/tags-clean branch - clean starting point without node repositioning

**Hash complet:** `63a1fabbd61983348b29456362565ef557650c0a`

**Date:** 2025-10-25T10:26:33+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `other`

**Fichiers modifiés (0):**

**Statistiques:**

```
apps/web/src/hooks/useOpenFiles.ts      | 4 ++++
 apps/web/src/hooks/useReactFlowNodes.ts | 9 ++++++++-
 packages/core/src/commands.ts           | 1 +
 3 files changed, 13 insertions(+), 1 deletion(-)
```

**Dépendances (parents):**

- `a6fbac26fbff8cf0e7182da11c4b81ac9f031e20`
- `d0c823253387d9b2e9afe57c1925a685113ae003`

**Voir le diff complet:**

```bash
git show 63a1fab
```

---

## Phase 5: Améliorations UI & Styling {#5_ui_enhancement}

**Commits dans cette phase:** 9

### 1. ddf83df - style: update create tag button to use accent color

**Hash complet:** `ddf83df3ff07da764e6fea9e3945f9ac8c2d7f34`

**Date:** 2025-10-23T13:17:07+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `style`

**Description:**

```
- Changed create-tag button to use var(--accent-color) for consistency
- Use outline style with accent color (transparent background)
- On hover: fill background with accent color and white text
- Matches the design pattern of other buttons in the application

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/NodeTagPanel.css`

**Statistiques:**

```
apps/web/src/components/NodeTagPanel.css | 11 +++++------
 1 file changed, 5 insertions(+), 6 deletions(-)
```

**Dépendances (parents):**

- `5ae7784f5ca1cdf31369b9166240a52824151965`

**Voir le diff complet:**

```bash
git show ddf83df
```

---

### 2. 15a2310 - style: update tag panel buttons to match settings button style

**Hash complet:** `15a2310a749a7ca1cb4c12f8c4e61f1b4b2009f4`

**Date:** 2025-10-23T13:19:48+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `style`

**Description:**

```
- Updated create-tag-btn to use same gradient style as settings button
- Updated btn-primary to use accent color gradient instead of solid blue
- Border: 1px solid var(--accent-color)
- Background: gradient with accent color mixed with white (12% to 8%)
- Hover: darker gradient (18% to 12%) matching other UI buttons
- Ensures consistency across all accent-color based buttons

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/NodeTagPanel.css`

**Statistiques:**

```
apps/web/src/components/NodeTagPanel.css | 43 +++++++++++++++++++++++---------
 1 file changed, 31 insertions(+), 12 deletions(-)
```

**Dépendances (parents):**

- `ddf83df3ff07da764e6fea9e3945f9ac8c2d7f34`

**Voir le diff complet:**

```bash
git show 15a2310
```

---

### 3. 204b7f4 - style: update add tag button to match accent color button style

**Hash complet:** `204b7f41e282727bf529083f0de33d347496264d`

**Date:** 2025-10-23T13:24:55+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `style`

**Description:**

```
- Added Plus icon from lucide-react to match other buttons
- Changed button background to use gradient with accent color
- Updated styling to match settings button pattern
- Border: 1px solid var(--accent-color) when enabled
- Background: gradient (12% to 8%) when enabled, light gray when disabled
- Proper padding and font weight for consistency
- Added visual feedback with cursor and disabled state

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagInputWithParent.tsx`

**Statistiques:**

```
apps/web/src/components/TagInputWithParent.tsx | 21 +++++++++++++++------
 1 file changed, 15 insertions(+), 6 deletions(-)
```

**Dépendances (parents):**

- `15a2310a749a7ca1cb4c12f8c4e61f1b4b2009f4`

**Voir le diff complet:**

```bash
git show 204b7f4
```

---

### 4. c9c6043 - style: add icon to create button inside tag dropdown menu

**Hash complet:** `c9c60435f8110e6d288d4fe130472c64ffe016da`

**Date:** 2025-10-23T13:25:44+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `style`

**Description:**

```
- Added Plus icon to the 'Créer' button in the new tag form
- Updated button styles to use flexbox with gap for icon/text spacing
- Maintains consistency with other buttons in the application
- Applied to both btn-primary and btn-secondary for uniformity

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/NodeTagPanel.css`
- `apps/web/src/components/NodeTagPanel.tsx`

**Statistiques:**

```
apps/web/src/components/NodeTagPanel.css | 3 +++
 apps/web/src/components/NodeTagPanel.tsx | 3 ++-
 2 files changed, 5 insertions(+), 1 deletion(-)
```

**Dépendances (parents):**

- `204b7f41e282727bf529083f0de33d347496264d`

**Voir le diff complet:**

```bash
git show c9c6043
```

---

### 5. ee6c03b - refactor: use blue as default color for all tags

**Hash complet:** `ee6c03b93e77270cfd05f6020e42bbe6e94df1c9`

**Date:** 2025-10-23T14:00:31+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Changed getColorForTag() to always return blue (#3B82F6)
- All tags now have consistent default blue color
- Removed deterministic color assignment based on label

This ensures visual consistency across all tags in the DAG panel

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/utils/tagUtils.ts`

**Statistiques:**

```
apps/web/src/utils/tagUtils.ts | 9 +++++----
 1 file changed, 5 insertions(+), 4 deletions(-)
```

**Dépendances (parents):**

- `1fdaffba3392a641eb4090a8ab18543ed96322f0`

**Voir le diff complet:**

```bash
git show ee6c03b
```

---

### 6. fcbec4f - feat: add single/double-click actions for tags in hierarchy

**Hash complet:** `fcbec4f08f3a8b404bd5ef02a8019cd77f06f868`

**Date:** 2025-10-23T14:13:51+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Single click on tag: select all nodes that have this tag
- Double click on tag: enter inline edit mode to rename
- Save rename with Enter key or blur (click outside)
- Input styled with accent color border
- Prevents propagation of clicks when editing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 64 ++++++++++++++++++++++++++-
 1 file changed, 62 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `d718620353dbc5a5e8c67b77007b13269a12d566`

**Voir le diff complet:**

```bash
git show fcbec4f
```

---

### 7. ae4b617 - style: reduce font size for inline tag edit input

**Hash complet:** `ae4b61739419638445c78dac3408f3394aa2bf8f`

**Date:** 2025-10-23T14:25:03+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `style`

**Description:**

```
- Changed fontSize from 'inherit' to '11px' for tag rename input
- Makes inline editing less intrusive and more refined

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**Voir le diff complet:**

```bash
git show ae4b617
```

---

### 8. 58c89fe - feat: add color picker and smart visibility toggle for tags

**Hash complet:** `58c89fe3304d293ebafacec9af234b3aef3faf1d`

**Date:** 2025-10-23T14:57:25+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
Changes:
- Added color picker: click on colored square to change tag color
- Added smart visibility toggle on eye icon:
  - When hiding tag: saves visibility state of descendants
  - When showing tag: restores descendants to their initial state
  - Children that were visible → become visible again
  - Children that were hidden → stay hidden
- Added hover effects on color indicator (scale up)
- Added tooltips for visibility button and color indicator
- Added descendantVisibilityState field to DagTag type

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (2):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/types/dag.ts`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 109 +++++++++++++++++++++++++-
 apps/web/src/types/dag.ts                     |   3 +
 2 files changed, 110 insertions(+), 2 deletions(-)
```

**Dépendances (parents):**

- `43f9f5176c416909de372e49617a69370e162e45`

**Voir le diff complet:**

```bash
git show 58c89fe
```

---

### 9. 6809738 - feat: implement comprehensive data persistence for BigMind

**Hash complet:** `6809738c85211658165c35698dac94675513b0d9`

**Date:** 2025-10-23T19:23:30+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Add tag layers (visibility, opacity, colors) to bigmind.json persistence
- Add assets library per-map to bigmind.json persistence
- Add all canvas options to bigmind.json (nodesConnectable, elementsSelectable, followSelection)
- Restore tag layers state on file load with proper Zustand setState
- Restore assets library on file load for shared maps
- Restore complete canvas options state on file load
- Implement for both standard and fallback XMind parsers
- Ensures all BigMind-specific data survives save/load cycle

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useFileOperations.ts`

**Statistiques:**

```
apps/web/src/hooks/useFileOperations.ts | 187 ++++++++++++++++++++++++++++++++
 1 file changed, 187 insertions(+)
```

**Dépendances (parents):**

- `7ec3dd6f5b095544369f2fa2d084da78c6f6aefe`

**Voir le diff complet:**

```bash
git show 6809738
```

---

## Phase 6: Création de Tags & Utilitaires {#6_tag_creation}

**Commits dans cette phase:** 3

### 1. 564fae0 - debug: add detailed logging in createAndAssociateTag

**Hash complet:** `564fae00398befcabc9ebc844f8a55492ad39171`

**Date:** 2025-10-23T13:30:13+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `debug`

**Description:**

```
- Log tag creation details (id, label, parents, nodeIds)
- Log node association step
- Helps identify if tags are created and associated correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/utils/tagUtils.ts`

**Statistiques:**

```
apps/web/src/utils/tagUtils.ts | 9 +++++++++
 1 file changed, 9 insertions(+)
```

**Dépendances (parents):**

- `c4269c7f328e4a4a38350507361ba6f296a14b3c`

**Voir le diff complet:**

```bash
git show 564fae0
```

---

### 2. 7ec3dd6 - fix: persist and restore tags in file save/load

**Hash complet:** `7ec3dd6f5b095544369f2fa2d084da78c6f6aefe`

**Date:** 2025-10-23T19:14:36+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Added tag and link export from useTagGraph to bigmind.json
- Added tag and link import when opening files
- Tags are now fully saved and restored with complete DAG structure

Save flow:
- exportActiveXMind() now calls useTagGraph.getState().exportTags()
- Tags and links are included in bigmind.json alongside node data
- Fully retrocompatible with XMind format

Load flow:
- openXMindFile() reads tags and links from bigmind.json
- Calls useTagGraph.importTags() to restore complete DAG structure
- Tags are available immediately after file opens

This fixes the issue where tags created in the DAG panel would
disappear after save/load cycle.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/hooks/useFileOperations.ts`

**Statistiques:**

```
apps/web/src/hooks/useFileOperations.ts | 25 +++++++++++++++++++++++++
 1 file changed, 25 insertions(+)
```

**Voir le diff complet:**

```bash
git show 7ec3dd6
```

---

### 3. fdc3512 - refactor: add centralized tag reader helper in TagLayersPanel

**Hash complet:** `fdc3512819c959e2492ff33724b4d59e4d4ff747`

**Date:** 2025-10-23T20:08:12+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `refactor`

**Description:**

```
- Import useNodeTagsStore for reading tags from single source of truth
- Create getNodeTagsList helper to read tags from store instead of node.tags
- Replace first node.tags usage with getNodeTagsList
- Prepare for full migration from node.tags to store

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanel.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanel.tsx | 11 ++++++++---
 1 file changed, 8 insertions(+), 3 deletions(-)
```

**Dépendances (parents):**

- `a8125e7576b78cd12d469289b9a296f0a5a9e3a2`

**Voir le diff complet:**

```bash
git show fdc3512
```

---

## Phase 7: Centralisation Store {#7_centralization}

**Commits dans cette phase:** 3

### 1. d9c251d - feat: enhance Edit menu with tag copy/paste support

**Hash complet:** `d9c251db1abd2ced72f68d2adb9f91db0944e2f7`

**Date:** 2025-10-23T18:56:27+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Added context-aware copy/paste for both nodes and tags
- Copier un tag: copy tag reference from tags context
- Coller un tag: apply tag to selected nodes in canvas context
- Couper un tag: copy tag and prepare for moving to other nodes
- Support multi-node selection when pasting tags
- Intelligent feedback messages based on context and selection

Node operations:
- Copier un nœud: copy node and its children
- Coller un nœud: paste as child of selected node
- Couper un nœud: copy + remove node

Tag operations:
- Copier un tag: store tag reference for pasting
- Coller un tag: associate tag with selected nodes
- Couper un tag: prepare tag for reassignment

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MenuBar.tsx`

**Statistiques:**

```
apps/web/src/components/MenuBar.tsx | 74 ++++++++++++++++++++++++++++---------
 1 file changed, 57 insertions(+), 17 deletions(-)
```

**Dépendances (parents):**

- `7cf8931f3386243618d8c684f7c956362f6aa96b`

**Voir le diff complet:**

```bash
git show d9c251d
```

---

### 2. 04b9e13 - fix: correct store access in file export - fix bigmind.json save issue

**Hash complet:** `04b9e13895aa80f6599ec4d8c514d154fc1b200d`

**Date:** 2025-10-23T19:35:48+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Export useTagGraphStore for direct access in serialization
- Export useAssetStore for direct access in serialization
- Replace useTagGraph.getState() with useTagGraphStore.getState()
- Replace useAssets.getState() and useAssets.setState() with useAssetStore equivalents
- Remove unused imports (useTagGraph hook and useAssets hook)
- Fixes TypeError where hooks were being called as if they were Zustand stores
- Fixes missing bigmind.json file in saved archive

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (3):**

- `apps/web/src/hooks/useAssets.ts`
- `apps/web/src/hooks/useFileOperations.ts`
- `apps/web/src/hooks/useTagGraph.ts`

**Statistiques:**

```
apps/web/src/hooks/useAssets.ts         |  6 ++++++
 apps/web/src/hooks/useFileOperations.ts | 16 ++++++++--------
 apps/web/src/hooks/useTagGraph.ts       |  7 ++++++-
 3 files changed, 20 insertions(+), 9 deletions(-)
```

**Voir le diff complet:**

```bash
git show 04b9e13
```

---

### 3. 4efae27 - fix: MindMapNode reads tags from useNodeTagsStore instead of props

**Hash complet:** `4efae279c65d35d35a3bf5850b2f052b48aa72a1`

**Date:** 2025-10-23T20:14:37+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `fix`

**Description:**

```
- Import useNodeTagsStore for reading node tags
- Change nodeTags to read from store.getNodeTags(nodeId) instead of data.tags
- Ensures node component re-renders when tags are modified via store
- Tags now disappear from nodes immediately when deleted in hierarchy

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Statistiques:**

```
apps/web/src/components/MindMapNode.tsx | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
```

**Dépendances (parents):**

- `f4d91d826c0350520543911c5b3f9aa7910a1a85`

**Voir le diff complet:**

```bash
git show 4efae27
```

---

## Phase 8: Menus & Interactions {#8_menus}

**Commits dans cette phase:** 1

### 1. 7cf8931 - feat: implement Edit menu with context-aware actions

**Hash complet:** `7cf8931f3386243618d8c684f7c956362f6aa96b`

**Date:** 2025-10-23T18:53:50+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Added useEditMenuContext hook to track focus (canvas vs tags)
- Updated MindMapCanvas to emit context when focused/unfocused
- Updated TagLayersPanelDAG to emit context when focused/unfocused
- Implemented Annuler (Undo) with Ctrl+Z
- Implemented Refaire (Redo) with Ctrl+Y
- Implemented Couper (Cut) with Ctrl+X for canvas nodes
- Implemented Copier (Copy) with Ctrl+C for canvas nodes
- Implemented Coller (Paste) with Ctrl+V for canvas nodes
- Implemented Supprimer (Delete) with Delete key for canvas nodes
- Implemented Sélectionner tout (Select All) with Ctrl+A
- Actions are context-aware and provide appropriate feedback
- Future implementations for tag operations noted

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (4):**

- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/components/MindMapCanvas.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useEditMenuContext.ts`

**Statistiques:**

```
apps/web/src/components/MenuBar.tsx           | 100 ++++++++++++++++++++++++++
 apps/web/src/components/MindMapCanvas.tsx     |   5 +-
 apps/web/src/components/TagLayersPanelDAG.tsx |   9 ++-
 apps/web/src/hooks/useEditMenuContext.ts      |  18 +++++
 4 files changed, 129 insertions(+), 3 deletions(-)
```

**Voir le diff complet:**

```bash
git show 7cf8931
```

---

## Phase 9: Persistence & Fichiers {#9_persistence}

**Commits dans cette phase:** 1

### 1. afed6f3 - feat(ui): ajout bouton + dans l'en-tête du panneau Tags & Calques

**Hash complet:** `afed6f3f147e0ab3972a6d63bd51c289025ae96b`

**Date:** 2025-10-23T06:52:57+02:00

**Auteur:** guthubrx <githubrx@runbox.com>

**Type:** `feature`

**Description:**

```
- Ajout d'un bouton Plus dans l'en-tête à côté des boutons de vue
- Facilite la découverte de la création de tags
- Le bouton ouvre le formulaire de création de tag avec option de parent
- Conditionné par isMapLoaded (carte chargée)
- Améliore l'accessibilité de la fonctionnalité de création de tags

Complète le FAB existant en offrant un accès plus visible.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Fichiers modifiés (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Statistiques:**

```
apps/web/src/components/TagLayersPanelDAG.tsx | 10 ++++++++++
 1 file changed, 10 insertions(+)
```

**Dépendances (parents):**

- `152e2802c8f5e443375072d8ff535a90ccc3b7e3`

**Voir le diff complet:**

```bash
git show afed6f3
```

---
