# 🏗️ PLAN D'ACTION COMPLET - REDÉVELOPPER TOUS LES TAGS

**Dernière mise à jour:** 25 octobre 2025
**Statut:** Plan d'implémentation exhaustif
**Commits à faire:** 70+ commits structurés en phases

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture générale](#architecture-générale)
3. [12 Phases d'implémentation](#12-phases-dimplémentation)
4. [Checklist par phase](#checklist-par-phase)
5. [Stratégie de commits](#stratégie-de-commits)
6. [Testing & Validation](#testing--validation)

---

## Vue d'ensemble

### Objectif

Redévelopper l'ensemble du système de tags de Cartae (70+ commits) en partant de v0.1.3 (`feat/tags-clean` current).

### Résumé des phases

```
PHASE 1:  DAG System Foundation (1 commit)
PHASE 2:  DAG-MindMap Sync System (2 commits)
PHASE 3:  Tag Display on Nodes (11 commits - itératif)
PHASE 4:  Persistence & File Operations (3 commits)
PHASE 5:  Centralization - Single Source of Truth (4 COMMITS CRITIQUES)
PHASE 6:  Tag Creation & Association Utilities (5 commits)
PHASE 7:  Unified Tag Operations (3 commits)
PHASE 8:  Panel Interactions & Drag-Drop (5 commits)
PHASE 9:  Colors & Styling (5 commits)
PHASE 10: Copy/Paste & Menu Operations (2 commits)
PHASE 11: Display Polish & Refinement (6 commits - itératif)
PHASE 12: Synchronization Finalization (5+ commits)
```

### Dépendances critiques

```
f9390bc (DAG Foundation)
    ↓
9c10440 (Sync System)
    ↓
2cc5bd7 (Real-time Sync)
    ↓
[MUST HAPPEN BEFORE PHASE 5]:
ea71f6e (Display Tags) + 7ec3dd6 (Persistence) + 4efae27 (Store-First)
    ↓
[PHASE 5 - CRITICAL]:
1fd9740 + f4d91d8 + a8125e7 + 4efae27 (Single Source of Truth)
    ↓
[THEN]:
5bc52ed + 5123b7e + 6d9a969 (Unification)
    ↓
[FINALLY]:
All other commits (Display polish, interactions, etc)
```

---

## Architecture générale

### 3-Layer Architecture

```
┌─────────────────────────────────────────────┐
│ LAYER 3: DISPLAY (Interface)                │
├─────────────────────────────────────────────┤
│ MindMapNode (render tags)                   │
│ TagLayersPanelDAG (hierarchy UI)            │
│ NodeTagPanel (quick tagging)                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ LAYER 2: SYNCHRONIZATION (Flux)             │
├─────────────────────────────────────────────┤
│ eventBus (global events)                    │
│ useMindMapDAGSync (listeners)               │
│ sync.tagNode() / sync.untagNode() (unified) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ LAYER 1: STORAGE (Data)                     │
├─────────────────────────────────────────────┤
│ useTagGraph (DAG store - Zustand)           │
│ useNodeTags (Associations - SINGLE SOURCE)  │
│ node.tags (XMind/cartae.json)              │
└─────────────────────────────────────────────┘
```

---

## 12 PHASES D'IMPLÉMENTATION

### ⭐ PHASE 1: DAG SYSTEM FOUNDATION

**Objectif:** Créer le système DAG sémantique de base.
**Durée estimée:** 1-2 heures
**Commits:** 1
**Commit clé:** `f9390bc`

#### Commit 1️⃣: f9390bc - feat(dag): Implémentation complète du système DAG sémantique

**Date originale:** Wed Oct 22 19:41:58 2025

**Fichiers à créer:**

```
apps/web/src/types/dag.ts
apps/web/src/hooks/useTagGraph.ts
apps/web/src/components/TagGraph.tsx
apps/web/src/components/TagLayersPanel.tsx
apps/web/src/components/TagLayersPanelDAG.tsx
```

**Description détaillée:**

1. **types/dag.ts** - Types sémantiques
   - `DagTag` interface (id, label, parent, children, relations)
   - `DagLink` interface (source, target, type)
   - `RelationType` enum (is-type-of, is-related-to, is-part-of)
   - Utilitaires pour DAG validation

2. **hooks/useTagGraph.ts** - Store Zustand
   - State: tags (Record<string, DagTag>), links (DagLink[])
   - Actions: addTag, removeTag, addLink, removeLink, updateTag
   - Persistence: localStorage avec key 'cartae-tags'
   - Methods: getTag, getAllTags, getChildren, getParents, validateDAG

3. **components/TagGraph.tsx** - Visualisation D3.js
   - Render avec d3-dag pour layout Sugiyama
   - Interactive: drag nodes, create links with Shift+click
   - Color: tags par couleur assignée
   - Events: on click, double-click, drag

4. **components/TagLayersPanel.tsx** - Liste hiérarchique
   - Tree view des tags (hiérarchie)
   - Expand/collapse nodes
   - Drag-drop pour réorganiser
   - Détails panel avec info tag

5. **components/TagLayersPanelDAG.tsx** - Vue DAG
   - Affiche TagGraph
   - Controls: zoom, pan, reset view
   - Toggle entre list/graph view

**Tests à faire:**

- ✅ DAG creation avec tags
- ✅ No cycles possible
- ✅ Multi-parent support
- ✅ Persistence (localStorage survit reload)
- ✅ D3 rendering correct

**Commit message:**

```
feat(dag): implémentation complète du système DAG sémantique

- Types sémantiques pour DAG (DagTag, DagLink, RelationType)
- Store Zustand useTagGraph avec localStorage
- Visualisation D3.js interactive avec d3-dag
- Panneau hiérarchique (list + graph view)
- Support multi-parents et cycle detection
- Données de test incluses

Commit: f9390bc
```

---

### ⭐ PHASE 2: DAG-MINDMAP SYNCHRONISATION SYSTEM

**Objectif:** Synchroniser DAG et MindMap bidirectionnellement.
**Durée estimée:** 2-3 heures
**Commits:** 2
**Commits clés:** `9c10440`, `2cc5bd7`

#### Commit 1️⃣: 9c10440 - feat: Implement dynamic DAG-MindMap synchronization

**Fichiers à créer:**

```
apps/web/src/hooks/useNodeTags.ts
apps/web/src/utils/eventBus.ts
apps/web/src/hooks/useMindMapDAGSync.ts
apps/web/src/components/NodeTagPanel.tsx
apps/web/docs/dag-sync-mindmap.md
```

**Description:**

1. **hooks/useNodeTags.ts** - Store associations (FUTURE SOURCE OF TRUTH)
   - State: nodeTagMap (Record<nodeId, Set<tagId>>)
   - Index: tagNodeMap (Record<tagId, Set<nodeId>>)
   - Actions: tagNode, untagNode, getNodeTags, getTagNodes
   - Persistence: localStorage

2. **utils/eventBus.ts** - Central event bus
   - Events disponibles:
     - `node:tagged` (nodeId, tagId)
     - `node:untagged` (nodeId, tagId)
     - `node:updated` (nodeId, updates)
     - `node:deleted` (nodeId)
     - `tag:created` (tagId, label)
     - `tag:removed` (tagId)
     - `tag:updated` (tagId, updates)
     - `sync:refresh`
   - Methods: on, emit, off

3. **hooks/useMindMapDAGSync.ts** - Synchronisation logique
   - Listeners bidirectionnels
   - MindMap → DAG sync
   - DAG → MindMap sync
   - Conflit resolution

4. **components/NodeTagPanel.tsx** - Quick tagging UI
   - Liste des tags disponibles
   - Add/remove tags rapidement
   - Search/filter
   - Icons pour visual feedback

5. **docs/dag-sync-mindmap.md** - Documentation architecture

**Tests:**

- ✅ Tag node depuis MindMap
- ✅ Node appears dans DAG
- ✅ Remove tag depuis DAG
- ✅ Node updated en MindMap
- ✅ Events firing correctly

**Commit:**

```
feat: implement dynamic DAG-MindMap synchronization

- Store useNodeTags pour associations nœud-tag
- Event bus centralisé pour communication
- Hook useMindMapDAGSync pour listeners
- UI NodeTagPanel pour quick tagging
- Documentation architecture

Commits: 9c10440
```

#### Commit 2️⃣: 2cc5bd7 - feat: Implement real-time tag synchronization

**Fichiers à modifier:**

```
apps/web/src/hooks/useMindMapDAGSync.ts (enhance)
apps/web/src/components/TagLayersPanelDAG.tsx (add sync)
apps/web/src/hooks/useNodeTags.ts (enhance)
```

**Description:**

- Real-time sync sans délai
- Performance optimized (debounce si nécessaire)
- Bidirectional completeness
- Edge cases handling

**Commit:**

```
feat: implement real-time tag synchronization between MindMap and DAG

- Real-time listeners pour tous les events
- Sync optimisé sans bottleneck
- Bidirectional completeness
- Edge cases (deleted nodes, etc)

Commits: 2cc5bd7
```

---

### ⭐ PHASE 3: TAG DISPLAY ON NODES (VISUAL)

**Objectif:** Afficher visuellement les tags sur les nœuds.
**Durée estimée:** 3-4 heures
**Commits:** 11 (itératif - chaque commit améliore le positionnement)
**First commit:** `ea71f6e`
**Last commit:** `69abee4`

#### Commits 1-11: ea71f6e → 69abee4 (Itératif positionnement)

Ce processus est **itératif avec testing continu**. Chaque commit améliore légèrement le positionnement/style.

**Point de départ:** ea71f6e - feat(ui): affichage des tags sur les nœuds de la carte

**Fichiers à modifier/créer:**

```
apps/web/src/components/MindMapNode.tsx (PRINCIPAL)
apps/web/src/components/MindMapNode.css (styles)
```

**Étapes du positionnement:**

```
Step 1 (ea71f6e): Initial display
  └─ Tags affichés simple à côté du nœud

Step 2-5: Vertical alignment
  └─ Tags alignés au bord inférieur
  └─ Centrage vertical progressif
  └─ Padding/margin adjustments

Step 6-8: Horizontal positioning
  └─ Tags à droite du nœud
  └─ Centrage horizontal avec translateX
  └─ Right positioning avec pixels fixes

Step 9-11: Final polish
  └─ Icons/colors
  └─ Truncation prevention
  └─ Final spacing
```

**Strategy:** Chaque commit = 1 improvement

**Commit 1:** ea71f6e - Display tags basic

```
feat(ui): affichage des tags sur les nœuds de la carte

- Tags affichés en liste à côté des nœuds
- Basic styling avec background badge
- Click to remove functionality
```

**Commits 2-11:** Positionnement itératif

```
fix(ui): [description spécifique du problème résolu]

- Chaque commit résout UN problème
- Test en temps réel dans dev
- Commit quand visuellement correct
```

**Test à chaque étape:**

- ✅ Tags visibles
- ✅ Position correcte (verticalement aligné)
- ✅ No overflow/truncation
- ✅ Clickable/removable
- ✅ Multiple tags spacing
- ✅ Icons appear

---

### ⭐ PHASE 4: PERSISTENCE & FILE OPERATIONS

**Objectif:** Sauvegarder et restaurer les tags.
**Durée estimée:** 2 heures
**Commits:** 3
**Commits clés:** `7ec3dd6`, `6809738`, `af2a230`

#### Commit 1️⃣: 7ec3dd6 - fix: Persist and restore tags in file save/load

**Fichiers à modifier:**

```
apps/web/src/hooks/useFileOperations.ts
apps/web/src/hooks/useOpenFiles.ts (export/import)
packages/core/src/xmind-parser.ts (si nécessaire)
```

**Description:**

- Export useTagGraph state → cartae.json
- Export useNodeTags state → cartae.json
- Import on file load
- Restore structure complète

**Commit:**

```
fix: persist and restore tags in file save/load

- Export DAG structure vers cartae.json
- Export associations vers cartae.json
- Import et restore on load
- Full structure restoration
```

#### Commit 2️⃣: 6809738 - feat: Implement comprehensive data persistence

**Description:**

- 3 levels of persistence
- DAG structure persistence
- Node associations persistence
- UI state persistence

#### Commit 3️⃣: af2a230 - fix: Properly save and restore node tags

**Description:**

- Retrocompat avec XMind format
- Proper node.tags array handling
- Merge logic for updates

---

### 🔴 PHASE 5: CENTRALIZATION - SINGLE SOURCE OF TRUTH

**⚠️ CRITICAL PHASE - Order matters!**

**Objectif:** Établir `useNodeTags` comme source unique de vérité.
**Durée estimée:** 2 heures
**Commits:** 4 (MUST be in this order)
**Order:** `4efae27` → `1fd9740` → `f4d91d8` → `a8125e7`

#### Commit 1️⃣: 4efae27 - fix: MindMapNode reads tags from useNodeTagsStore

**Files:**

```
apps/web/src/components/MindMapNode.tsx
```

**Change:**

```typescript
// BEFORE (wrong - source of truth fragmentation)
const nodeTags = data.tags; // from props

// AFTER (correct - single source)
const nodeTags = useNodeTags(state => state.getNodeTags(data.id));
```

**Impact:** MindMapNode now always reads from store, not props.

**Commit:**

```
fix: MindMapNode reads tags from useNodeTagsStore instead of props

- Component re-renders when store updates
- No more prop drilling for tags
- Tags visible immediately after changes
```

#### Commit 2️⃣: 1fd9740 - refactor: complete centralization of tag data

**Description:** Document + code explaining single source of truth

**Files:**

```
ARCHITECTURAL_DECISION_RECORD.md (new)
```

**Content:**

```
# ADR: Single Source of Truth for Node Tags

## Problem
Tags stored in 3 places:
- node.tags (original data)
- useNodeTags (associations)
- MindMapNode component state
→ Sync bugs, inconsistency

## Solution
useNodeTagsStore = SINGLE SOURCE OF TRUTH
- All reads from store
- All writes go through store
- No prop drilling

## Implementation
- MindMapNode reads from store only
- All operations use store.tagNode()
- Persist/restore from store
```

#### Commit 3️⃣: f4d91d8 - refactor: Centralize tag modifications through useNodeTagsStore

**Files:**

```
apps/web/src/hooks/useNodeTags.ts (enhance)
apps/web/src/utils/tagUtils.ts (create)
```

**Functions to create:**

```typescript
// In tagUtils.ts
export const sync = {
  tagNode(nodeId: string, tagId: string),
  untagNode(nodeId: string, tagId: string),
  // These update store + emit events
};
```

**Commit:**

```
refactor: centralize tag modifications through useNodeTagsStore

- Create sync.tagNode() for all tag additions
- Create sync.untagNode() for all tag removals
- All operations flow through store
- Events emitted after changes
```

#### Commit 4️⃣: a8125e7 - refactor: Simplify deleteTagWithSync to only modify store

**Files:**

```
apps/web/src/utils/tagUtils.ts
apps/web/src/components/TagLayersPanelDAG.tsx
```

**Change:**

- Deleting tag from hierarchy automatically removes from all nodes
- Uses sync.untagNode() internally
- Simple and consistent

**Commit:**

```
refactor: simplify deleteTagWithSync to only modify store

- Tag deletion uses unified sync function
- Automatic cascade to nodes
- No separate node.tags manipulation
```

---

### ⭐ PHASE 6: TAG CREATION & ASSOCIATION UTILITIES

**Objectif:** Créer fonctions réutilisables pour create/associate.
**Durée estimée:** 1.5 heures
**Commits:** 5
**Commits clés:** `5bc52ed`, `1fdaffb`, `4d2409c`

#### Commit 1️⃣: 5bc52ed - refactor: Consolidate tag creation logic

**Files:**

```
apps/web/src/utils/tagUtils.ts (create)
```

**Functions:**

```typescript
export function createAndAssociateTag(
  nodeId: string,
  tagLabel: string,
  parentId?: string
): Promise<string>;

export function generateTagId(): string;

export function getColorForTag(tagLabel: string): string;

export function createTag(label: string, parentId?: string): DagTag;
```

**Commit:**

```
refactor: consolidate tag creation logic into shared utility function

- createAndAssociateTag() central function
- Deterministic color assignment
- Consistent ID generation
- Single reusable path
```

#### Commit 2️⃣: 1fdaffb - fix: Ensure tags created via MindMapCanvas are added to DAG

**Files:**

```
apps/web/src/components/NodeTagPanel.tsx
```

**Change:**

- Use createAndAssociateTag() not manual creation
- Ensures all tags go through proper path

#### Commit 3️⃣: 4d2409c - fix: Preserve tags created via UI when syncing from mindmap

**Change:**

- Tags created via UI are preserved
- No loss on sync refresh

---

### ⭐ PHASE 7: UNIFIED TAG OPERATIONS

**Objectif:** Unifier ALL tag operations via sync functions.
**Durée estimée:** 1 heure
**Commits:** 3
**Order:** `fc270d6` → `5123b7e` → `6d9a969`

#### Commit 1️⃣: fc270d6 - refactor: Unify tag addition through addTagToNodeSync

**Files:**

```
apps/web/src/utils/tagUtils.ts
apps/web/src/hooks/useOpenFiles.ts
```

**Change:**

```typescript
// All paths now use:
sync.tagNode(nodeId, tagId);

// Instead of:
// - addTagToNode() (old MenuBar path)
// - AddTagCommand (old command path)
// - Manual store updates (old scattered paths)
```

#### Commit 2️⃣: 5123b7e - refactor: Unify tag addition - both paths use sync.tagNode()

**Files:**

```
apps/web/src/components/NodeTagPanel.tsx
apps/web/src/components/MenuBar.tsx
```

**Change:**

- NodeTagPanel → sync.tagNode()
- MenuBar → sync.tagNode()
- Same function, same behavior

#### Commit 3️⃣: 6d9a969 - refactor: Unify tag operations in NodeContextMenu

**Files:**

```
apps/web/src/components/NodeContextMenu.tsx
```

**Change:**

- Context menu → sync.tagNode() / sync.untagNode()
- No separate paths
- All operations identical

**Commits:**

```
refactor: unify tag operations in NodeContextMenu

- Context menu uses sync.tagNode()
- All add/remove paths now unified
- Single behavior everywhere
```

---

### ⭐ PHASE 8: PANEL INTERACTIONS & DRAG-DROP

**Objectif:** Interactions riches dans les panneaux.
**Durée estimée:** 2.5 heures
**Commits:** 5
**Commits clés:** `8c136ca`, `fcbec4f`, `58c89fe`

#### Commit 1️⃣: 8c136ca - feat: Add drag and drop phantom for tag hierarchy

**Files:**

```
apps/web/src/components/TagLayersPanelDAG.tsx (enhance)
apps/web/src/styles/tag-drag.css (new)
```

**Features:**

- Drag visual feedback (phantom element)
- Drop target highlighting
- Smooth animations

#### Commit 2️⃣: fcbec4f - feat: Add single/double-click actions for tags in hierarchy

**Files:**

```
apps/web/src/components/TagLayersPanelDAG.tsx (enhance)
```

**Features:**

- Single-click: select/edit
- Double-click: edit mode
- Keyboard support (Enter to save, Esc to cancel)

#### Commit 3️⃣: 9a2fc98 - feat: Improve tag drag phantom and add refresh button

**Files:**

```
apps/web/src/components/TagLayersPanelDAG.tsx (enhance)
```

**Features:**

- Better visual feedback during drag
- Refresh button to re-sync

#### Commit 4️⃣: 58c89fe - feat: Add color picker and smart visibility toggle for tags

**Files:**

```
apps/web/src/components/TagLayersPanelDAG.tsx (enhance)
apps/web/src/components/ColorPickerPopover.tsx (new)
```

**Features:**

- Color picker for each tag
- Visibility toggle (show/hide tags)
- Icons for visual cues

---

### ⭐ PHASE 9: COLORS & STYLING

**Objectif:** Gestion des couleurs des tags.
**Durée estimée:** 1.5 heures
**Commits:** 5
**Commits clés:** `ee6c03b`, `43f9f51`, `37376ee`

#### Commit 1️⃣: ee6c03b - refactor: Use blue as default color for all tags

**Files:**

```
apps/web/src/utils/tagUtils.ts
apps/web/src/types/dag.ts
```

**Change:**

- Default color: #3b82f6 (blue)
- Consistent across all tags
- Custom colors via picker

#### Commit 2️⃣: 43f9f51 - feat: Centralize tag colors from DAG store in MindMapNode

**Files:**

```
apps/web/src/components/MindMapNode.tsx (enhance)
```

**Change:**

- MindMapNode reads color from store
- Not from props or computed
- Single source for color

#### Commit 3️⃣: 37376ee - feat: Centralize tag labels from DAG store

**Files:**

```
apps/web/src/components/MindMapNode.tsx (enhance)
```

**Change:**

- Labels also from store
- Always fresh from source

#### Commit 4️⃣: Style updates (ddf83df, 15a2310, 204b7f4, c9c6043)

**Files:**

```
apps/web/src/styles/ (multiple)
```

**Changes:**

- Button styling with accent color
- Consistent visual language
- UI polish

---

### ⭐ PHASE 10: COPY/PASTE & MENU OPERATIONS

**Objectif:** Copy/paste des tags + menu operations.
**Durée estimée:** 1 heure
**Commits:** 2
**Commits clés:** `d9c251d`, `d718620`

#### Commit 1️⃣: d718620 - fix: Keep exact label when copying tags in hierarchy

**Files:**

```
apps/web/src/components/TagLayersPanelDAG.tsx
```

#### Commit 2️⃣: d9c251d - feat: Enhance Edit menu with tag copy/paste support

**Files:**

```
apps/web/src/components/MenuBar.tsx
```

**Features:**

- Copy tag (Cmd+C)
- Paste tag (Cmd+V)
- Clipboard management

---

### ⭐ PHASE 11: DISPLAY POLISH & REFINEMENT

**Objectif:** Affichage final des tags sur nœuds.
**Durée estimée:** 2 heures
**Commits:** 6 (itératif)
**Commits:** e6c87b5, 69abee4, ...

**These are the final positioning commits from PHASE 3 extended:**

**Commits 1-6:** Fine-tuning visual positioning

```
fix(ui): correction clé unique pour les tags
fix(ui): repositionnement des tags sur le bord droit des nœuds
fix(ui): affichage complet des tags sans troncature
fix(ui): correction définitive du centrage géométrique des tags
fix(ui): amélioration du centrage horizontal des tags
fix(ui): alignement précis des tags sur la bordure inférieure
```

**Strategy:** Test each change visually, commit when correct

---

### ⭐ PHASE 12: SYNCHRONIZATION FINALIZATION

**Objectif:** Finaliser et optimiser la synchronisation.
**Durée estimée:** 2-3 heures
**Commits:** 5+
**Commits clés:** `ba2df9e`, `52ec3f8`, `bd80777`

#### Commit 1️⃣: 02dcc3a - fix: Remove sample data from DAG and sync with active map

#### Commit 2️⃣: bd80777 - feat: Ensure tag synchronization is always active

#### Commit 3️⃣: ba2df9e - feat(sync): Implémentation complète de la synchronisation des tags

**Description:**

- Complete sync implementation
- All edge cases handled
- Bidirectional consistency
- Event driven updates

#### Commit 4️⃣: 52ec3f8 - fix: Resolve tag synchronization issues

**Description:**

- Fix sync edge cases
- Performance optimization
- Stability improvements

#### Commit 5️⃣: c2c73af - fix: Always show tags panel regardless of map state

---

## CHECKLIST PAR PHASE

### PHASE 1 Checklist

- [ ] DAG types créés (DagTag, DagLink, RelationType)
- [ ] useTagGraph store opérationnel
- [ ] TagGraph component rend D3
- [ ] TagLayersPanel affiche hiérarchie
- [ ] TagLayersPanelDAG affiche graphe
- [ ] Persistence localStorage works
- [ ] No cycles détecté
- [ ] Multi-parent support functional
- **COMMIT:** `f9390bc`

### PHASE 2 Checklist

- [ ] useNodeTags store créé
- [ ] eventBus fully opérationnel
- [ ] useMindMapDAGSync listeners work
- [ ] NodeTagPanel displays
- [ ] Can tag node from panel
- [ ] Tag removed removes association
- [ ] Events fire correctly
- **COMMIT:** `9c10440` + `2cc5bd7`

### PHASE 3 Checklist (Per commit)

- [ ] Tags visible on nodes
- [ ] Position correct (vertical)
- [ ] Position correct (horizontal)
- [ ] No overflow/truncation
- [ ] Multiple tags spacing OK
- [ ] Remove functionality works
- [ ] Icons appear
- **COMMITS:** ea71f6e → 69abee4 (11 commits, each tested)

### PHASE 4 Checklist

- [ ] Save exports tags
- [ ] Load imports tags
- [ ] Associations restored
- [ ] Full structure preserved
- [ ] XMind retrocompat
- **COMMITS:** 7ec3dd6, 6809738, af2a230

### PHASE 5 Checklist (CRITICAL)

- [ ] MindMapNode reads from store
- [ ] Re-renders on store change
- [ ] sync.tagNode() unified
- [ ] sync.untagNode() unified
- [ ] No prop-based tags left
- [ ] Single source of truth working
- **COMMITS (in order):** 4efae27 → 1fd9740 → f4d91d8 → a8125e7

### PHASE 6 Checklist

- [ ] createAndAssociateTag() works
- [ ] Tags created via all paths
- [ ] Colors assigned deterministic
- [ ] IDs consistent
- **COMMITS:** 5bc52ed, 1fdaffb, 4d2409c

### PHASE 7 Checklist

- [ ] All paths use sync functions
- [ ] NodeTagPanel unified
- [ ] MenuBar unified
- [ ] ContextMenu unified
- [ ] Same behavior everywhere
- **COMMITS:** fc270d6 → 5123b7e → 6d9a969

### PHASE 8 Checklist

- [ ] Drag-drop works
- [ ] Phantom visual feedback
- [ ] Click actions work
- [ ] Color picker opens
- [ ] Visibility toggle works
- **COMMITS:** 8c136ca, fcbec4f, 9a2fc98, 58c89fe

### PHASE 9 Checklist

- [ ] Blue default color
- [ ] Colors centralized
- [ ] Labels centralized
- [ ] UI styling consistent
- [ ] Visual polish complete
- **COMMITS:** ee6c03b, 43f9f51, 37376ee, etc.

### PHASE 10 Checklist

- [ ] Copy/paste works
- [ ] Exact labels preserved
- [ ] Menu operations work
- **COMMITS:** d718620, d9c251d

### PHASE 11 Checklist

- [ ] Tags positioned perfect
- [ ] No visual issues
- [ ] All spacing correct
- [ ] All alignment correct
- **COMMITS:** e6c87b5, 69abee4, etc. (6 commits)

### PHASE 12 Checklist

- [ ] Sync always active
- [ ] No sample data
- [ ] Complete implementation
- [ ] Edge cases handled
- [ ] Performance good
- [ ] Stable
- **COMMITS:** 02dcc3a, bd80777, ba2df9e, 52ec3f8, c2c73af

---

## STRATÉGIE DE COMMITS

### Règles d'or

1. **UN commit = UNE fonction complète**
   - Ne pas avoir de "work in progress" commits sur main branch
   - Chaque commit doit être fonctionnellement complet

2. **COMMITS RÉGULIERS**
   - Après chaque phase complétée
   - Test avant commit
   - Descriptive messages

3. **FORMAT DES MESSAGES**

   ```
   feat/fix/refactor: [description courte]

   - Detail 1
   - Detail 2
   - Detail 3

   Phase: [number] - [name]
   Commits in phase: X/Y
   ```

4. **BRANCHING STRATEGY**
   - Work on `feat/tags-system` branch
   - Merge to `feat/tags-clean` when phase complete
   - Tag releases

---

## TESTING & VALIDATION

### À tester après chaque commit

```
Fonctionnel:
- ✅ Feature fonctionne
- ✅ Pas de regressions
- ✅ Pas de warnings/errors console

UI:
- ✅ Visuel correct
- ✅ Pas de glitches
- ✅ Responsive OK

Performance:
- ✅ No lag
- ✅ Fast interactions
- ✅ Memory usage OK
```

### Commandes de test

```bash
# Dev
pnpm dev

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit

# Build
pnpm build
```

---

## RÉSUMÉ EXÉCUTIF

| Phase     | Commits | Durée      | Status                         |
| --------- | ------- | ---------- | ------------------------------ |
| 1         | 1       | 1-2h       | Foundation                     |
| 2         | 2       | 2-3h       | Sync System                    |
| 3         | 11      | 3-4h       | Display (Itératif)             |
| 4         | 3       | 2h         | Persistence                    |
| 5         | 4       | 2h         | **CRITICAL - Source of Truth** |
| 6         | 5       | 1.5h       | Creation Utils                 |
| 7         | 3       | 1h         | Unification                    |
| 8         | 5       | 2.5h       | Interactions                   |
| 9         | 5       | 1.5h       | Colors & Styling               |
| 10        | 2       | 1h         | Copy/Paste                     |
| 11        | 6       | 2h         | Polish (Itératif)              |
| 12        | 5+      | 2-3h       | Finalization                   |
| **TOTAL** | **52+** | **20-25h** | **Complete system**            |

---

## NEXT STEPS

1. **Lire ce plan en détail** (30 min)
2. **Commencer PHASE 1** (faire commit f9390bc)
3. **Après chaque phase:** push et commit
4. **Checkpoint validation:** après PHASE 5
5. **Final testing:** après PHASE 12

**START WITH:** `git checkout -b feat/tags-system && pnpm dev`

Good luck! 🚀
