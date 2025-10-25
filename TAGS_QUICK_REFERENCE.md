# AIDE-MÉMOIRE RAPIDE - SYSTÈME DE TAGS

## Où lire quoi?

```
Je veux...                                Document à lire
─────────────────────────────────────────────────────────────────
1. Vue d'ensemble rapide                  TAGS_IMPLEMENTATION_SUMMARY (5 min)
2. Tous les commits un par un             TAGS_ROADMAP_COMPLETE (scan)
3. Comprendre l'architecture              TAGS_DEPENDENCIES (careful read)
4. Trouver un commit spécifique           TAGS_ROADMAP_COMPLETE (Ctrl+F)
5. Ajouter une feature                    TAGS_DEPENDENCIES (points critiques)
6. Déboguer un problème de sync           TAGS_DEPENDENCIES (fluxes critiques)
7. Refactorer                             TAGS_IMPLEMENTATION_SUMMARY (patterns)
8. Tout comprendre                        READ ALL, IN THIS ORDER
```

## Les 3 Stores (Architecture Storage)

```
┌─────────────────────────────────────┐
│   useTagGraph (DAG Structure)       │  ← Tags + links avec relations
├─────────────────────────────────────┤
│   useNodeTags (NODE-TAG MAPPING)    │  ← SINGLE SOURCE OF TRUTH ⭐
├─────────────────────────────────────┤
│   node.tags (XMind/bigmind.json)    │  ← Persisted data
└─────────────────────────────────────┘
```

**Règle d'or:** MindMapNode DOIT lire depuis useNodeTags, JAMAIS node.tags

## Les 3 Fonctions Critiques

```javascript
// 1. CRÉER UN TAG (centralisé, réutilisable)
await createAndAssociateTag(nodeId, tagLabel);
// Fait: ID unique, couleur déterministe, sync auto

// 2. AJOUTER À NŒUD (single code path)
sync.tagNode(nodeId, tagId);
// Fait: Store update, node.tags update, event emit

// 3. SUPPRIMER DE NŒUD
sync.untagNode(nodeId, tagId);
// Fait: Retire de store et node.tags
```

## Architecture 3-Couches

```
LAYER 3: UI (Components)
    ├─ MindMapNode (reads from useNodeTags)
    ├─ TagLayersPanelDAG (manage hierarchy)
    └─ NodeTagPanel (quick add/remove)
                ▲
LAYER 2: Sync (Hooks)
    ├─ eventBus ('node:tagged', 'node:untagged', 'tag:created')
    ├─ useMindMapDAGSync (listens to events)
    └─ sync.tagNode() / sync.untagNode()
                ▲
LAYER 1: Storage (Stores)
    ├─ useTagGraph (DAG)
    ├─ useNodeTags (ASSOCIATIONS - SOURCE UNIQUE)
    └─ node.tags (persistent)
```

## Commits Essentiels (Min 8)

| #   | Hash    | Focus          | Why                       |
| --- | ------- | -------------- | ------------------------- |
| 1   | f9390bc | DAG System     | Foundation of everything  |
| 2   | 9c10440 | Sync System    | Event bus + associations  |
| 3   | ea71f6e | Display        | First tags on nodes       |
| 4   | 69abee4 | Display Polish | Final positioning         |
| 5   | 4efae27 | Store-First    | MindMapNode from store ⭐ |
| 6   | 5bc52ed | Creation       | createAndAssociateTag     |
| 7   | 5123b7e | Unification    | sync.tagNode unified ⭐   |
| 8   | 7ec3dd6 | Persistence    | Save/load tags            |

**⭐ = Clé de voûte (à comprendre absolument)**

## Checklist: Avant de modifier

- [ ] Lire point "POINTS CRITIQUES" dans TAGS_DEPENDENCIES.md
- [ ] Utiliser createAndAssociateTag() pour création
- [ ] Utiliser sync.tagNode() pour add/remove
- [ ] MindMapNode lit depuis useNodeTags uniquement
- [ ] Émettre eventBus.emit après changements
- [ ] Tester save/load cycle (persistence)
- [ ] Vérifier sync DAG ↔ MindMap
- [ ] Valider contre checklist dans TAGS_DEPENDENCIES.md

## Déboguer: 3 Endroits à Checker

```javascript
// 1. Store state
useNodeTagsStore.getState().getNodeTags(nodeId);

// 2. DAG state
useTagGraphStore.getState().tags;

// 3. Persisted data
localStorage.getItem('bigmind-data');
```

## Les 5 Patterns à Mémoriser

### Pattern 1: Store-First (4efae27)

```typescript
// PAS BON
const nodeTags = node.tags;

// BON
const nodeTags = useNodeTagsStore(state => state.getNodeTags(nodeId));
```

### Pattern 2: Centralized Creation (5bc52ed)

```typescript
// PARTOUT tu dois créer? Appelle:
await createAndAssociateTag(nodeId, label);
```

### Pattern 3: Unified Operations (5123b7e)

```typescript
// Pour add/remove: TOUJOURS sync.*
sync.tagNode(nodeId, tagId);
sync.untagNode(nodeId, tagId);
```

### Pattern 4: Event-Driven (ba2df9e)

```typescript
// Après changement: TOUJOURS émettre
eventBus.emit('tag:created', { ... });
```

### Pattern 5: Multi-Level Persistence

```typescript
// Sauvegarder 3 niveaux:
// 1. DAG structure (useTagGraph.exportTags)
// 2. Node associations (node.tags)
// 3. UI state (colors, visibility)
```

## FLUXES: Clique → Données → UI

### Flow 1: Create Tag

```
User clicks + button → NodeTagPanel opens
User types "Bug" → createAndAssociateTag(nodeId, "Bug")
  ├─ generateTagId() → "tag_abc123"
  ├─ getColorForTag("Bug") → "#3B82F6"
  ├─ createTag() → DagTag object
  ├─ useTagGraph.addTag()
  └─ eventBus.emit('tag:created')
Tag appears in DAG panel ✓
MindMapNode re-renders (reads from store) ✓
Tag visible on node ✓
```

### Flow 2: Delete Tag

```
User clicks delete in DAG panel → deleteTag(tagId)
  ├─ Get all nodes with this tag
  ├─ useNodeTagsStore.removeTagFromNode() [each node]
  └─ useTagGraph.deleteTag()
MindMapNode re-renders ✓
Tag gone from all nodes ✓
```

### Flow 3: Change Color

```
User clicks color square → Color picker opens
User selects "#FF0000" → useTagGraph.updateTag(tagId, { color })
MindMapNode re-renders (via getTagColor()) ✓
All nodes show red tag ✓
```

### Flow 4: Rename Tag

```
User double-clicks tag → Inline edit opens
User types "Feature" → useTagGraph.updateTag(tagId, { label })
MindMapNode re-renders (via getTagLabel()) ✓
All nodes show "Feature" ✓
```

## Fichiers Clés (Par Couche)

### LAYER 1: Storage

- `types/dag.ts` - Type definitions
- `hooks/useTagGraph.ts` - DAG (5000+ lines)
- `hooks/useNodeTags.ts` - UNIQUE SOURCE ⭐

### LAYER 2: Sync

- `utils/eventBus.ts` - Event communication
- `hooks/useMindMapDAGSync.ts` - Listeners
- `utils/tagUtils.ts` - Helper functions

### LAYER 3: Display

- `components/MindMapNode.tsx` - Tag rendering
- `components/TagLayersPanelDAG.tsx` - DAG UI
- `components/NodeTagPanel.tsx` - Quick add

### LAYER 4: Persistence

- `hooks/useFileOperations.ts` - Save/load

## Les 9 Phases (Quick Timeline)

```
Phase 1: DAG System foundation (f9390bc)
    ↓
Phase 2: Sync system + event bus (9c10440, 2cc5bd7)
    ↓
Phase 3: Display on nodes (ea71f6e → 69abee4)
    ↓
Phase 4: Persistence (7ec3dd6, 6809738, af2a230)
    ↓
Phase 5: SINGLE SOURCE OF TRUTH (4efae27, 1fd9740, f4d91d8, a8125e7)
    ↓
Phase 6: Centralized operations (5bc52ed, 5123b7e, 6d9a969)
    ↓
Phase 7: Panel interactions (fcbec4f, 8c136ca, 58c89fe)
    ↓
Phase 8: Copy/paste (d9c251d)
    ↓
Phase 9: Cleanup & fixes (1cc53da, fdc3512, ...)
```

## FAQ en 30 Secondes

**Q: Pourquoi useNodeTags est special?**
A: C'est la SEULE source de vérité pour nœud-tag mappings. Tout le reste lit d'ici.

**Q: Pourquoi pas node.tags directly?**
A: node.tags vient du fichier XMind/bigmind.json. Ça change lentement. Store est réactif.

**Q: Comment je sais si sync est cassé?**
A: Un tag que tu ajoutes n'apparaît pas dans DAG panel ou nœud? Check eventBus.emit().

**Q: Je dois refactorer, par où commencer?**
A: 1) Lis patterns en haut. 2) Lis TAGS_DEPENDENCIES.md "POINTS CRITIQUES". 3) Fais la checklist.

**Q: C'est quoi l'avantage du DAG vs. juste une liste?**
A: Multi-parent relations. Un tag peut être "sous" plusieurs autres tags. Plus flexible.

## Git Commands Utiles

```bash
# Voir timeline complet
git log v0.1.3..HEAD --oneline | grep -i tag

# Voir un commit specifique
git show f9390bc --stat

# Voir les fichiers changés pour les tags
git log v0.1.3..HEAD --name-only | grep -i tag

# Comparer 2 commits
git diff f9390bc 4efae27 -- apps/web/src/components/MindMapNode.tsx

# Voir qui a touché useNodeTags
git log -p apps/web/src/hooks/useNodeTags.ts | head -100
```

## Statistiques Clés

| Métrique             | Valeur              |
| -------------------- | ------------------- |
| **Commits totaux**   | 65+                 |
| **Fichiers créés**   | 10+                 |
| **Hooks créés**      | 4                   |
| **Components créés** | 5                   |
| **Utils/helpers**    | 2                   |
| **Types fichiers**   | 1                   |
| **Lignes de code**   | ~3000               |
| **Temps de dev**     | ~2 semaines         |
| **Documentation**    | 4 files, 1882 lines |

## Points Forts

✅ Single source of truth (no sync bugs)
✅ Reusable functions (no duplication)
✅ Event-driven (no polling)
✅ Full persistence (save/load works)
✅ Visual integration (tags on nodes)
✅ Rich interactions (colors, visibility, drag)
✅ Semantic relations (multi-parent DAG)

## Points à Améliorer

❌ Test coverage (write tests!)
❌ Performance (large hierarchies)
❌ Accessibility (ESLint warnings)
❌ Documentation (user docs)
❌ Error handling (graceful degradation)
❌ Undo/redo (not integrated)

---

**Keep this file open while developing!**

**Last updated:** 2025-10-25
**Documentation completeness:** 95%
**Total content:** 1882 lines across 4 documents
