# GRAPHE DES DÉPENDANCES - SYSTÈME DE TAGS

## ARCHITECTURE GÉNÉRALE

```
┌─────────────────────────────────────────────────────────────────┐
│                       SYSTÈME DAG COMPLET                        │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                    ┌─────────┼─────────┐
                    │         │         │
                    v         v         v
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ useTagGraph  │  │ useNodeTags  │  │ Event Bus    │
    │ (DAG Store)  │  │ (Associations)│  │ (Sync)       │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                │                 │
            └────────────────┼─────────────────┘
                             │
                    ┌────────v────────┐
                    │  MindMapNode    │
                    │  (Display)      │
                    └─────────────────┘
                             │
                    ┌────────v────────┐
                    │  Canvas + Nodes │
                    │  (Visual Output)│
                    └─────────────────┘
```

## DÉPENDANCES DÉTAILLÉES

### NIVEAU 1 - FONDATION (f9390bc)

```
f9390bc (DAG System)
├── types/dag.ts (NEW)
│   └── Defines: DagTag, DagLink, RelationType, etc.
│
├── hooks/useTagGraph.ts (NEW)
│   ├── Uses: Zustand store
│   ├── Exports: createTag, deleteTag, linkTags, etc.
│   └── Persists: localStorage (tags + links)
│
├── components/TagGraph.tsx (NEW)
│   ├── Depends on: useTagGraph
│   ├── Uses: D3.js + d3-dag
│   └── Renders: Graphical DAG visualization
│
└── components/TagLayersPanel.tsx + TagLayersPanelDAG.tsx (NEW)
    ├── Depends on: useTagGraph
    ├── Displays: Hierarchical tag list + DAG graph
    └── Exports: Tag management UI
```

### NIVEAU 2 - SYNCHRONISATION (9c10440)

```
9c10440 (DAG-MindMap Sync)
├── utils/eventBus.ts (NEW)
│   ├── Emits: 'node:tagged', 'node:untagged', 'tag:created'
│   └── Global: eventBus.on(), eventBus.emit()
│
├── hooks/useNodeTags.ts (NEW)
│   ├── Depends on: useTagGraph, useOpenFiles
│   ├── Stores: node-to-tags mappings (optimized indexes)
│   ├── Exports: getNodeTags(), addTagToNode(), removeTagFromNode()
│   └── KEY: Single source of truth (see Phase 5)
│
├── hooks/useMindMapDAGSync.ts (NEW)
│   ├── Depends on: useNodeTags, eventBus, useTagGraph
│   ├── Listens: 'node:tagged', 'node:untagged'
│   └── Syncs: MindMap ← → DAG (bidirectional)
│
└── components/NodeTagPanel.tsx (NEW)
    ├── Depends on: useNodeTags, useTagGraph, eventBus
    ├── Emits: 'tag:created' after tag creation
    └── UI: Add/remove tags from selected node
```

### NIVEAU 3 - AFFICHAGE (ea71f6e → 69abee4)

```
ea71f6e (Initial Display)
└── MindMapNode.tsx
    ├── Version 1: Shows nodeTags from data.props
    ├── Uses: Badge style with blue color
    └── Position: Under title (flex wrap)

    ↓ Evolution through positioning commits ↓

69abee4 (Final Display)
└── MindMapNode.tsx
    ├── Version N: Tags à cheval sur bord droit
    ├── Position: right: -8px, translateY(-50%)
    ├── Layout: Vertical column with gap: 1px
    └── Style: Ombre portée pour lisibilité
```

### NIVEAU 4 - PERSISTANCE (7ec3dd6 → af2a230)

```
7ec3dd6 (Tag Persistence Base)
├── Depends on: useTagGraph, useOpenFiles
├── Exports tags: useTagGraph.getState().exportTags()
├── Imports tags: useTagGraph.importTags(data)
└── Storage: bigmind.json alongside node data

    ↓

6809738 (Comprehensive Persistence)
├── Adds: tag layers (visibility, opacity, colors)
├── Adds: assets library per-map
├── Adds: canvas options (all UI state)
├── Restores: All with Zustand setState()
└── Covers: Standard + fallback XMind parsers

    ↓

af2a230 (Node-Level Tags)
├── Saves: node.tags in bigmind.json
├── Restores: via syncFromDAG()
└── Ensures: Individual node tags persist
```

### NIVEAU 5 - CENTRALISATION (CRITICAL PHASE 5)

```
Critical Path for Single Source of Truth:

PROBLEM STATE (Multiple sources):
  ├── node.tags (from XMind file)
  ├── useNodeTagsStore (in-memory copy)
  └── useTagGraphStore (DAG graph)
  └─→ Sync issues, data inconsistency

4efae27 (MindMapNode from store) - ENTRY POINT
└── MindMapNode.tsx now reads from store.getNodeTags(nodeId)
    └─→ Component re-renders when store updates

    ↓

1fd9740 (Single Source of Truth - CONCEPTUAL)
├── Identifies: useNodeTagsStore = SOURCE OF TRUTH
├── Removes: duplicate node.tags reading
└── Ensures: All components read from single place

    ↓

f4d91d8 (useNodeTagsStore.setNodeTags)
├── Adds: atomic update method
├── Replaces: updateNodeTags calls with setNodeTagsList
└── Ensures: TagLayersPanel uses ONLY store

    ↓

a8125e7 (Simplify deleteTag)
├── Removes: updateNodeTags logic
├── Modifies ONLY: DAG state + node-tag associations
└── Source: useNodeTagsStore (exclusively)

    ↓

fdc3512 (Centralized tag reader)
├── Creates: getNodeTagsList() helper
├── Replaces: node.tags usage
└── Prepares: Full migration complete

RESULT: useNodeTagsStore = ONLY truth source ✨
```

### NIVEAU 6 - TAG CRÉATION ET ASSOCIATION (5bc52ed)

```
5bc52ed (Consolidate Creation) - CRITICAL
├── Creates: tagUtils.ts with shared functions
├── Functions:
│   ├── createAndAssociateTag(nodeId, tagLabel)
│   ├── generateTagId() - consistent IDs
│   ├── getColorForTag(label) - deterministic colors
│   └── createTag() - complete DagTag object
│
├── Used by:
│   ├── NodeTagPanel.tsx (context menu tagging)
│   ├── TagLayersPanelDAG.tsx (DAG panel)
│   └── MindMapCanvas.tsx (context menu)
│
└── Benefit: Single code path, no duplication

    ↓

1fdaffb (Add to DAG on Canvas)
├── MindMapCanvas.onAddTag uses createAndAssociateTag()
├── Ensures: Tags appear in DAG panel
└── Fixes: Tags created via context menu sync

    ↓

4d2409c (Preserve tags during sync)
├── Removes: clearTags() call (was deleting tags)
├── Changes: syncFromMindMap merges instead of replaces
└── Preserves: Tags created via dropdown UI
```

### NIVEAU 7 - TAG OPERATIONS UNIFICATION

```
fc270d6 (First unification)
└── Introduces: addTagToNodeSync()

    ↓

5123b7e (CRITICAL - sync.tagNode())
├── Makes: MenuBar + NodeTagPanel use SAME function
├── Before:
│   ├── NodeTagPanel → sync.tagNode() ✅ (complete)
│   └── MenuBar → addTagToNode() ❌ (missing node.tags)
│
├── After:
│   ├── NodeTagPanel → sync.tagNode() ✅
│   └── MenuBar → sync.tagNode() ✅
│
├── What sync.tagNode() does:
│   1. Verify tag exists
│   2. Add to useNodeTagsStore
│   3. Update node.tags via openFiles.updateNodeTags()
│   4. Emit event for synchronization
│
└── Result: Single code path everywhere ✨

    ↓

6d9a969 (Context menu unification)
├── MindMapCanvas.onAddTag → sync.tagNode()
├── MindMapCanvas.onRemoveTag → sync.untagNode()
├── Removes: AddTagCommand, RemoveTagCommand
└── Result: ALL paths unified
```

### NIVEAU 8 - PANEL INTERACTIONS (fcbec4f, 8c136ca, 58c89fe)

```
fcbec4f (Click actions)
├── Single-click: Select all nodes with this tag
├── Double-click: Inline edit mode for renaming
└── Depends on: useSelection hook

8c136ca (Drag-drop phantom)
├── Visual feedback during drag
├── Green (copy) vs Orange (move)
└── Depends on: mousePosition tracking

58c89fe (Color picker + visibility)
├── Click color square: Change tag color
├── Smart visibility toggle with descendant state saving
├── Depends on: useTagGraph.updateTag()
└── Adds: descendantVisibilityState to DagTag
```

### NIVEAU 9 - COPY/PASTE (d9c251d)

```
d9c251d (Edit menu)
├── Copier un tag: store reference
├── Coller un tag: apply to selected nodes
├── Couper un tag: copy + prepare move
├── Depends on: useNodeTags, useTagGraph
└── Uses: MenuBar context + node selection
```

## FLUXES CRITIQUES

### FLUX 1: Créer un tag et l'ajouter à un nœud

```
User action: Right-click node → "Ajouter un tag"
    ↓
NodeTagPanel component opens
    ↓
User types tag name → createAndAssociateTag(nodeId, tagName)
    ↓
    ├─→ generateTagId() → unique ID
    ├─→ getColorForTag(name) → deterministic color
    ├─→ createTag() → DagTag object
    └─→ useTagGraph.addTag() → add to DAG store

    AND

    ├─→ useNodeTagsStore.addTagToNode()
    ├─→ openFiles.updateNodeTags() → update node.tags
    └─→ eventBus.emit('tag:created')

    ↓
TagLayersPanelDAG listens 'tag:created'
    ↓
MindMapNode re-renders (reads from useNodeTagsStore)
    ↓
Tag appears on node with correct color ✨
```

### FLUX 2: Supprimer un tag de la hiérarchie

```
User action: Click delete in TagLayersPanelDAG
    ↓
deleteTag(tagId)
    ↓
    ├─→ Get all nodes with this tag
    ├─→ useNodeTagsStore.removeTagFromNode() for each
    └─→ useTagGraph.deleteTag() (remove from DAG)

    ↓
MindMapNode re-renders (store updated)
    ↓
Tag disappears from all nodes immediately ✨
```

### FLUX 3: Changer couleur d'un tag

```
User action: Click color square in DAG panel
    ↓
Color picker opens
    ↓
User selects new color
    ↓
useTagGraph.updateTag(tagId, { color: newColor })
    ↓
MindMapNode re-renders (via getTagColor())
    ↓
Tag on all nodes shows new color ✨
```

### FLUX 4: Renommer un tag

```
User action: Double-click tag in DAG panel
    ↓
Inline edit mode activates
    ↓
User types new name → Enter
    ↓
useTagGraph.updateTag(tagId, { label: newLabel })
    ↓
MindMapNode re-renders (via getTagLabel())
    ↓
All node tags update automatically ✨
```

## POINTS CRITIQUES À RESPECTER

1. **useNodeTagsStore = Source Unique**
   - TOUT ce qui lit des tags doit lire depuis le store
   - Ne pas lire depuis node.tags directement
   - MindMapNode.tsx: MUST use store.getNodeTags(nodeId)

2. **sync.tagNode() est le chemin universel**
   - Pour ajouter un tag: appeler sync.tagNode()
   - Pas de code parallèle qui fait la même chose
   - Valable pour: MenuBar, NodeTagPanel, MindMapCanvas

3. **createAndAssociateTag est réutilisable**
   - TOUT ce qui crée des tags doit l'utiliser
   - Garantit IDs uniques et couleurs déterministes
   - Assure synchronisation automatique DAG+MindMap

4. **Event bus for bidirectional sync**
   - Emit: 'node:tagged', 'node:untagged', 'tag:created'
   - Listeners in useMindMapDAGSync and components
   - Ensures reactive updates without manual refresh

5. **Persistence: 3 niveaux**
   - DAG structure: useTagGraph.exportTags/importTags
   - Node associations: node.tags in bigmind.json
   - UI state: visibility, colors, opacity, canvas options

## VALIDATION CHECKLIST

```
✓ Tag creation always through createAndAssociateTag()
✓ Tag addition always through sync.tagNode()
✓ MindMapNode reads from useNodeTagsStore only
✓ TagLayersPanel delegates to store, not node.tags
✓ All colors/labels from DAG store (centralized)
✓ Deletion updates both store and useNodeTagsStore
✓ Events emitted for all state changes
✓ Persistence saves all 3 levels
✓ No duplicate data in multiple stores
✓ No direct node.tags writes (except initial load)
```
