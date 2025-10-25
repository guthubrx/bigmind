# ROADMAP COMPLÈTE DES TAGS - v0.1.3 à HEAD

## 1. SYSTÈME DAG (Graphe Orienté Acyclique)

### f9390bc - FONDATION: Implémentation complète du système DAG sémantique

**Date:** Wed Oct 22 19:41:58 2025
**Hash:** f9390bc22548912552179e0706090997b650b1e7
**Type:** [DAG] [System] [Core]

**Fichiers modifiés (majeurs):**

- apps/web/src/types/dag.ts (NEW - types sémantiques)
- apps/web/src/hooks/useTagGraph.ts (NEW - Store Zustand)
- apps/web/src/components/TagGraph.tsx (NEW - Visualisation D3.js)
- apps/web/src/components/TagLayersPanel.tsx (NEW - Panneau hiérarchique)
- apps/web/src/components/TagLayersPanelDAG.tsx (NEW - Panneau DAG visuel)

**Description:**
Migration d'un système hiérarchique vers un DAG permettant les multi-parents.
Implémente 3 types de relations: is-type-of, is-related-to, is-part-of.
Visualisation interactive avec D3.js et layout Sugiyama vertical.
Store Zustand persistant avec localStorage.

**Dépendances:** Point de départ pour tous les tags

---

### 9c10440 - Synchronisation DAG-MindMap (Event bus + Associations)

**Date:** Wed Oct 22 20:06:29 2025
**Hash:** 9c104405fc1923dec9e3b0be31d7796091003022
**Type:** [DAG] [Sync] [System]

**Fichiers modifiés:**

- apps/web/src/hooks/useNodeTags.ts (NEW - Store associations)
- apps/web/src/utils/eventBus.ts (NEW - Bus d'événements)
- apps/web/src/hooks/useMindMapDAGSync.ts (NEW - Synchronisation)
- apps/web/src/components/NodeTagPanel.tsx (NEW - Panel tagging)

**Description:**
Ajoute le bus d'événements pour la communication bidirectionnelle.
Crée un store pour les associations nœud-tag avec index optimisés.
Implémente les hooks de synchronisation et NodeTagPanel.
Documente le système complet dans dag-sync-mindmap.md.

**Dépendances:** Construit sur f9390bc

---

## 2. AFFICHAGE DES TAGS (Display et UI)

### ea71f6e - Affichage des tags sur les nœuds

**Date:** Thu Oct 23 05:35:00 2025
**Hash:** ea71f6e0a3ff144cd1f29f64f35e271ff0dfb306
**Type:** [Display] [UI]

**Fichiers modifiés:**

- apps/web/src/components/MindMapNode.tsx (39 insertions)

**Description:**
Premiers badges bleus (#3B82F6) affichés sous le titre des nœuds.
Conteneur flex avec wrap pour s'adapter à la largeur.
Limitation initiale à 80px avec ellipsis pour les longs tags.

**Dépendances:** Nécessite useNodeTagsStore

---

### Commits de positionnement des tags (Suite UI)

**Sequence:** e6c87b5 → fc5c2e7 → 84b81a8 → 6570432 → 62c999d → eaedf0c → 69abee4

Chaque commit affine le positionnement:

1. **e6c87b5:** Clé unique (tag au lieu d'index)
2. **fc5c2e7:** Suppression de maxWidth pour affichage complet
3. **84b81a8:** Centrage géométrique final
4. **6570432:** Amélioration centrage horizontal
5. **62c999d:** Alignement sur bordure inférieure
6. **eaedf0c:** Repositionnement bordure inférieure centrée
7. **69abee4:** FINAL - Tags à cheval sur bord droit (right: -8px, translateY(-50%))

**Description globale:**
Évolution du positionnement de centré sous titre → cheval sur bord droit.
Utilisation d'absolu positioning et transform pour chevaucher la bordure.
Organisation en colonne verticale avec gap de 1px.

---

### afed6f3 - Tag drag-drop et affichage amélioré

**Date:** Thu Oct 23 - (approximativement)
**Hash:** afed6f3
**Type:** [Display] [UI] [Drag]

**Description:**
Améliore l'affichage des tags et ajoute support du drag-drop initial.

---

## 3. COLONNE DE DROITE / PANNEAU TAGS (Right Column UI)

### afed6f3 - Bouton + dans l'en-tête du panneau Tags & Calques

**Hash:** afed6f3
**Type:** [Panel] [UI]

Ajoute bouton de création de tags dans l'en-tête du panneau.

---

### fcbec4f - Single/Double-click actions pour tags en hiérarchie

**Date:** Thu Oct 23 14:13:51 2025
**Hash:** fcbec4f08f3a8b404bd5ef02a8019cd77f06f868
**Type:** [Panel] [Interaction]

**Fichiers modifiés:**

- apps/web/src/components/TagLayersPanelDAG.tsx (64 insertions)

**Description:**

- Single click: sélectionne tous les nœuds avec ce tag
- Double click: édition inline avec Enter pour sauver
- Input stylisé avec bordure couleur accent

**Dépendances:** Nécessite DAG panel et sélection nœuds

---

### 8c136ca - Drag and drop phantom pour hiérarchie

**Date:** Thu Oct 23 14:02:39 2025
**Hash:** 8c136ca954905dbfe926e5e80b0fc229d8e9b311
**Type:** [Panel] [DragDrop]

**Fichiers modifiés:**

- apps/web/src/components/TagLayersPanelDAG.tsx (32 insertions)

**Description:**
Phantom visuel qui suit le curseur pendant drag-drop.

- Vert pour copy (Alt key), orange pour move
- Affiche "📋 Copier" ou "✂️ Déplacer"
- Glow effect et backdrop blur

---

### 9a2fc98 - Amélioration drag phantom et bouton refresh

**Hash:** 9a2fc98
**Type:** [Panel] [DragDrop]

Améliore le visual feedback du drag-drop et ajoute bouton refresh.

---

### d718620 - Fix: Label exact lors de copy tags

**Hash:** d718620
**Type:** [Panel] [Fix]

Préserve le label exact quand on copie les tags dans la hiérarchie.

---

### 58c89fe - Color picker et smart visibility toggle

**Date:** Thu Oct 23 14:57:25 2025
**Hash:** 58c89fe3304d293ebafacec9af234b3aef3faf1d
**Type:** [Panel] [Colors] [Interaction]

**Fichiers modifiés:**

- apps/web/src/components/TagLayersPanelDAG.tsx (109 insertions)
- apps/web/src/types/dag.ts (3 insertions)

**Description:**

- Clic sur carré coloré: change couleur du tag
- Toggle visibilité intelligent:
  - Saving visibility state des descendants
  - Restoration lors du re-show
- Hover effects avec scale up
- Tooltips pour visibilité et color indicator

---

### a3f9e3f - Fix: scrollbar height calculation

**Hash:** a3f9e3f
**Type:** [Panel] [Fix]

Corrige la hauteur du scrollbar dans la right column.

---

## 4. SYNCHRONISATION TAGS (Tag Sync System)

### 2cc5bd7 - Real-time tag synchronization MindMap-DAG

**Date:** Wed Oct 22 20:21:23 2025
**Hash:** 2cc5bd709675c5be358c2aa8f897545d82fbf27f
**Type:** [Sync]

**Fichiers modifiés:**

- apps/web/src/components/QuickTagTest.tsx (NEW)
- apps/web/src/hooks/useMindmap.ts (18 insertions)
- apps/web/src/hooks/useTagGraph.ts (13 insertions)

**Description:**
Auto-crée tags dans DAG quand ajoutés aux nœuds.
Émet événements node:tagged quand tags sont ajoutés/supprimés.
Rend le bus d'événements globally available.
Tags apparaissent immédiatement dans DAG panel.

---

### ba2df9e - Synchronisation complète des tags (Implémentation finale)

**Date:** Thu Oct 23 05:27:45 2025
**Hash:** ba2df9ea6b3ab1ade1b6b50ffda693721e8f0eed
**Type:** [Sync]

**Fichiers modifiés (10 fichiers):**

- apps/web/src/components/NodeProperties.tsx (21 insertions)
- apps/web/src/components/TagLayersPanelDAG.tsx (32 insertions)
- apps/web/src/hooks/useMindmap.ts (43 insertions)
- packages/core/src/commands.ts (16 insertions)

**Description:**
Synchronisation bidirectionnelle entre useOpenFiles et useMindmap.
Émission d'événements node:tagged depuis NodeProperties et AddTagCommand.
Logs détaillés pour débogage de la chaîne de synchronisation.
Suppression de persistance pour gestion dynamique.

**Dépendances:** Construit sur 2cc5bd7

---

### 554c75c - Fix: Sync tags seulement avec carte active

**Hash:** 554c75c
**Type:** [Sync] [Fix]

Synchronise les tags uniquement avec la carte active (pas toutes).

---

### c2c73af - Fix: Always show tags panel

**Hash:** c2c73af
**Type:** [Sync] [Panel] [Fix]

Affiche toujours le panel tags regardless de map state.

---

### 52ec3f8 - Fix: Résoudre tag synchronization issues

**Date:** Wed Oct 22 20:33:07 2025
**Hash:** 52ec3f8703bd716e8507d01f3f16c3799a13fdd7
**Type:** [Sync] [Fix]

**Fichiers modifiés:**

- apps/web/src/components/QuickTagTest.tsx (29 insertions)
- apps/web/src/hooks/useTagGraph.ts (38 insertions)

**Description:**
Bouton reset pour nettoyer localStorage.
Fixe registrations multiples de listeners.
Accès direct aux stores dans event callbacks.

---

### bd80777 - Ensure tag synchronization always active

**Hash:** bd80777
**Type:** [Sync]

Vérifie que la synchronisation reste active en tout temps.

---

### ff436ab - Debug: Extensive logging pour synchronization

**Hash:** ff436ab
**Type:** [Sync] [Debug]

Ajoute logs extensifs pour tracer la synchronisation.

---

### f95d337 - Debug: More logging pour tag panel updates

**Hash:** f95d337
**Type:** [Sync] [Debug]

Logs additionnels pour les mises à jour du panel.

---

### f6d6b2d - Debug: Event test button et improved logging

**Hash:** f6d6b2d
**Type:** [Sync] [Debug]

Bouton de test pour événements directs + logs améliorés.

---

## 5. PERSISTANCE (Save/Load Tags)

### 7ec3dd6 - Persist and restore tags in file save/load

**Date:** Thu Oct 23 19:14:36 2025
**Hash:** 7ec3dd6f5b095544369f2fa2d084da78c6f6aefe
**Type:** [Persistence]

**Fichiers modifiés:**

- apps/web/src/hooks/useFileOperations.ts (25 insertions)

**Description:**
Export tags et links depuis useTagGraph vers bigmind.json.
Import tags et links lors de l'ouverture de fichiers.
Restaure structure DAG complète après load.
Retrocompatible avec format XMind.

**Save flow:**

1. exportActiveXMind() appelle useTagGraph.getState().exportTags()
2. Tags et links incluent dans bigmind.json

**Load flow:**

1. openXMindFile() lit tags et links de bigmind.json
2. Appelle useTagGraph.importTags() pour restauration DAG
3. Tags disponibles immédiatement après ouverture

---

### 6809738 - Comprehensive data persistence for BigMind

**Date:** Thu Oct 23 19:23:30 2025
**Hash:** 6809738c85211658165c35698dac94675513b0d9
**Type:** [Persistence]

**Fichiers modifiés:**

- apps/web/src/hooks/useFileOperations.ts (187 insertions)

**Description:**
Ajoute tag layers (visibility, opacity, colors) à bigmind.json.
Ajoute assets library per-map.
Ajoute all canvas options (nodesConnectable, elementsSelectable, followSelection).
Restaure states avec Zustand setState lors du load.
Implémente pour standard ET fallback XMind parsers.

---

### af2a230 - Properly save and restore node tags in bigmind.json

**Date:** Thu Oct 23 19:42:13 2025
**Hash:** af2a230182e8738b9a8e3ceb82b997964816fb31
**Type:** [Persistence] [Fix]

**Fichiers modifiés:**

- apps/web/src/hooks/useFileOperations.ts (11 insertions)

**Description:**
Ajoute tags property aux données des nœuds sauvegardés.
Appelle syncFromDAG après import des tags pour restauration.
Assure que tags sur nœuds sont persistés et restaurés correctement.

**Dépendances:** Construit sur 7ec3dd6 et 6809738

---

### 04b9e13 - Fix: Correct store access in file export

**Hash:** 04b9e13
**Type:** [Persistence] [Fix]

Corrige l'accès au store lors de l'export bigmind.json.

---

### f27cb70 - Debug: Detailed logging pour persistence

**Hash:** f27cb70
**Type:** [Persistence] [Debug]

Logs détaillés pour débogage de la persistance.

---

## 6. CENTRALISATION DES TAGS (Data Centralization)

### 1fd9740 - Complete centralization of tag data - SINGLE SOURCE OF TRUTH

**Date:** Thu Oct 23 20:15:08 2025
**Hash:** 1fd9740615f21827d67c6a4a547b78af4e70c99b
**Type:** [System] [Refactor]

**Description (CONCEPTUEL - très important):**

```
AVANT (Problème):
  Tags stockés à 3 endroits:
  - node.tags (du fichier XMind)
  - useNodeTagsStore (in-memory)
  - useTagGraphStore (DAG)
  → Problèmes de synchronisation

APRÈS (Solution):
  useNodeTagsStore = SOURCE UNIQUE DE VÉRITÉ

  Flux:
  1. Tag est supprimé via hiérarchie
  2. deleteTag() → removeTagFromAllNodes()
  3. useNodeTagsStore est updaté
  4. MindMapNode re-render avec tags depuis store
  5. Tag disparaît du nœud! ✨
```

**Bénéfices:**

- Source unique de vérité (pas de sync issues)
- État consistant across all components
- Logic plus simple (une seule place à modifier)
- Re-renders fonctionnent correctement

---

### f4d91d8 - Centralize tag modifications through useNodeTagsStore

**Date:** Thu Oct 23 20:10:37 2025
**Hash:** f4d91d826c0350520543911c5b3f9aa7910a1a85
**Type:** [System] [Refactor]

**Fichiers modifiés:**

- apps/web/src/components/TagLayersPanel.tsx (13 insertions)
- apps/web/src/hooks/useNodeTags.ts (23 insertions)

**Description:**
Ajoute setNodeTags method à useNodeTagsStore pour updates atomiques.
Remplace tous appels updateNodeTags par setNodeTagsList.
TagLayersPanel dépend maintenant SEULEMENT de useNodeTagsStore.
Simplifie la synchronisation d'état.

---

### a8125e7 - Simplify deleteTagWithSync to only modify store

**Date:** Thu Oct 23 20:06:53 2025
**Hash:** a8125e7576b78cd12d469289b9a296f0a5a9e3a2
**Type:** [System] [Refactor]

**Fichiers modifiés:**

- apps/web/src/hooks/useTagGraph.ts (26 modifications)

**Description:**
Retire la logic updateNodeTags qui essayait de modifier node.tags.
Source de vérité est maintenant EXCLUSIVEMENT useNodeTagsStore.
deleteTag modifie seulement: DAG state + node-tag associations.

---

### 4efae27 - MindMapNode reads tags from useNodeTagsStore instead of props

**Date:** Thu Oct 23 20:14:37 2025
**Hash:** 4efae279c65d35d35a3bf5850b2f052b48aa72a1
**Type:** [System] [Fix]

**Fichiers modifiés:**

- apps/web/src/components/MindMapNode.tsx (5 insertions)

**Description:**
MindMapNode lit tags depuis store.getNodeTags(nodeId) au lieu de data.tags.
Component re-render quand tags sont modifiés via store.
Tags disparaissent immédiatement du nœud lors de suppression en hiérarchie.

---

### fdc3512 - Add centralized tag reader helper in TagLayersPanel

**Date:** Thu Oct 23 20:08:12 2025
**Hash:** fdc3512819c959e2492ff33724b4d59e4d4ff747
**Type:** [System] [Refactor]

**Fichiers modifiés:**

- apps/web/src/components/TagLayersPanel.tsx (11 insertions)

**Description:**
Crée getNodeTagsList helper pour lire depuis store.
Remplace usage de node.tags.
Prépare migration complète vers store.

---

## 7. COULEURS DES TAGS (Tag Colors)

### ee6c03b - Use blue as default color for all tags

**Hash:** ee6c03b
**Type:** [Colors]

Bleu devient couleur par défaut pour tous les tags.

---

### 37376ee - Centralize tag labels from DAG store in MindMapNode

**Date:** Thu Oct 23 14:29:29 2025
**Hash:** 37376eea2f72fecab9b27eebaf98a2992591b72f
**Type:** [Colors] [Labels]

**Fichiers modifiés:**

- apps/web/src/components/MindMapNode.tsx (13 insertions)

**Description:**
Ajoute useTagGraph hook à MindMapNode.
Crée getTagLabel() pour fetcher label depuis store.
Affiche labels au lieu d'IDs sur les nœuds.
Renames en arborescence propagent automatiquement aux nœuds.

---

### 43f9f51 - Centralize tag colors from DAG store in MindMapNode

**Date:** Thu Oct 23 14:31:49 2025
**Hash:** 43f9f5176c416909de372e49617a69370e162e45
**Type:** [Colors] [Display]

**Fichiers modifiés:**

- apps/web/src/components/MindMapNode.tsx (9 insertions)

**Description:**
Ajoute getTagColor() pour fetcher color depuis store.
Change couleur dynamiquement en arborescence → nœuds updatés auto.
Information du tag (label + color) complètement centralisée.

---

## 8. TAG CREATION ET ASSOCIATION

### 5bc52ed - Consolidate tag creation logic into shared utility function

**Date:** Thu Oct 23 13:10:19 2025
**Hash:** 5bc52ed2f673933cb5527ac7c56e578b83f7e80e
**Type:** [System] [Refactor]

**Fichiers modifiés:**

- apps/web/src/utils/tagUtils.ts (NEW - 100 lignes)
- apps/web/src/components/NodeTagPanel.tsx (16 modifications)
- apps/web/src/components/TagLayersPanelDAG.tsx (149 modifications)

**Description:**
Crée tagUtils.ts avec:

- createAndAssociateTag() - fonction principale
- generateTagId() - ID generation consistante
- getColorForTag() - attribution couleur déterministe
- createTag() - création objet DagTag complet

Élimine duplication de code et assure single source of truth.

---

### 1fdaffb - Ensure tags created via MindMapCanvas are added to DAG store

**Date:** Thu Oct 23 13:44:22 2025
**Hash:** 1fdaffba3392a641eb4090a8ab18543ed96322f0
**Type:** [Sync] [Creation]

**Fichiers modifiés:**

- apps/web/src/components/MindMapCanvas.tsx (13 insertions)

**Description:**
Ajoute useTagGraph hook à MindMapCanvas.
Tags créés via context menu synchronisés au DAG panel.
Fixes issue: tags n'apparaissaient pas en arborescence.

---

### 7689f5c - Ensure parent property omitted when tag has no parent

**Hash:** 7689f5c
**Type:** [System] [Fix]

Omit parent property si tag n'a pas de parent (cleanups structure).

---

### c9c6043 - Style: Add icon to create button inside tag dropdown

**Hash:** c9c6043
**Type:** [Panel] [Style]

Ajoute icône au bouton create dans dropdown menu des tags.

---

### ddf83df - Style: Update create tag button to use accent color

**Hash:** ddf83df
**Type:** [Panel] [Style]

Bouton create tag utilise accent color.

---

### 15a2310 - Style: Update tag panel buttons to match settings button style

**Hash:** 15a2310
**Type:** [Panel] [Style]

Boutons du tag panel matchent style des boutons settings.

---

### 204b7f4 - Style: Update add tag button to match accent color

**Hash:** 204b7f4
**Type:** [Panel] [Style]

Bouton add tag utilise accent color.

---

## 9. TAG COPY/PASTE

### 5ae7784 - Fix: Sync DAG panel when tag created via context menu

**Date:** Thu Oct 23 13:16:20 2025
**Hash:** 5ae7784f5ca1cdf31369b9166240a52824151965
**Type:** [Sync] [Copy/Paste]

**Fichiers modifiés:**

- apps/web/src/components/NodeTagPanel.tsx (12 insertions)
- apps/web/src/components/TagLayersPanelDAG.tsx (12 insertions)

**Description:**
NodeTagPanel émet 'tag:created' event après création.
TagLayersPanelDAG écoute et resynchronise.
Fixes: tags créés via context menu n'apparaissaient pas en DAG.

---

### d9c251d - Enhance Edit menu with tag copy/paste support

**Date:** Thu Oct 23 18:56:27 2025
**Hash:** d9c251db1abd2ced72f68d2adb9f91db0944e2f7
**Type:** [Copy/Paste] [UI]

**Fichiers modifiés:**

- apps/web/src/components/MenuBar.tsx (74 insertions)

**Description:**
Context-aware copy/paste pour nœuds ET tags.

**Opérations tags:**

- Copier un tag: store tag reference
- Coller un tag: apply tag aux nœuds sélectionnés
- Couper un tag: copy + prepare pour move

Support multi-node selection lors du paste.
Feedback messages intelligents basés sur contexte.

---

## 10. HIÉRARCHIE ET RELATIONS

### 1cc53da - Fix: Remove tag from node when deleted in tag hierarchy

**Date:** Thu Oct 23 20:00:14 2025
**Hash:** 1cc53daff67c08d9281971d9b7c6dcc6484a0dfb
**Type:** [Hierarchy] [Fix]

**Fichiers modifiés:**

- apps/web/src/hooks/useTagGraph.ts (21 insertions)

**Description:**
Récupère tous nœuds affectés avant suppression.
Supprime tag de chaque node.tags array.
Tags disparaissent immédiatement des nœuds à la suppression.

---

### 7d08e5e - Fix: Properly remove tags from nodes when deleting from hierarchy

**Hash:** 7d08e5e
**Type:** [Hierarchy] [Fix]

Version antérieure/complémentaire de 1cc53da.

---

## 11. TAG OPERATIONS UNIFICATION

### fc270d6 - Refactor: Unify tag addition through addTagToNodeSync

**Hash:** fc270d6
**Type:** [System] [Refactor]

Unifie l'addition de tags avec addTagToNodeSync.

---

### 5123b7e - Refactor: Unify tag addition - both paths use sync.tagNode()

**Date:** Thu Oct 23 20:22:16 2025
**Hash:** 5123b7e52a193a99b78e24cf1b8f9bccba35599d
**Type:** [System] [Refactor]

**Fichiers modifiés:**

- apps/web/src/components/MenuBar.tsx (6 insertions)
- apps/web/src/hooks/useTagGraph.ts (17 insertions)

**Description (TRÈS IMPORTANT):**

```
KEY FIX: MenuBar et NodeTagPanel utilisent MÊME fonction

AVANT:
  NodeTagPanel → sync.tagNode() → updates store + node.tags ✅
  MenuBar → addTagToNode() → ONLY updates store ❌ (node.tags manquant)

APRÈS:
  NodeTagPanel → sync.tagNode() → updates everything ✅
  MenuBar → sync.tagNode() → updates everything ✅
```

**Qu'est-ce que sync.tagNode() fait:**

1. Vérifie que tag existe
2. Ajoute à useNodeTagsStore
3. Update node.tags via openFiles.updateNodeTags()
4. Émet event pour synchronisation

**Résultat:**

- Additions de tags work both paths
- node.tags stays in sync
- MindMapNode lit depuis store (always correct)
- Source unique de vérité

**Dépendances:** Dépend de 4efae27 (MindMapNode from store)

---

### 6d9a969 - Refactor: Unify tag operations in NodeContextMenu

**Date:** Thu Oct 23 20:28:01 2025
**Hash:** 6d9a9699d5cf1e8cb43108a1f79d30aca24f6783
**Type:** [System] [Refactor]

**Fichiers modifiés:**

- apps/web/src/components/MindMapCanvas.tsx (40 deletions)

**Description:**
MindMapCanvas.onAddTag utilise sync.tagNode() au lieu AddTagCommand.
MindMapCanvas.onRemoveTag utilise sync.untagNode() au lieu RemoveTagCommand.
Supprime unused imports: AddTagCommand, RemoveTagCommand.

**Résultat:**
Right-click context menu utilise MÊME code path que autres méthodes.
Toutes opérations tags passent par unified sync functions.

**Dépendances:** Construit sur 5123b7e

---

## 12. DEBUG ET LOGGING

### f39ccd7 - Debug: Comprehensive logging for tag creation

**Hash:** f39ccd7
**Type:** [Debug]

Logs complets pour tracer création de tags dans DAG panel.

---

### 4d2409c - Fix: Preserve tags created via UI when syncing from mindmap

**Date:** Thu Oct 23 13:32:44 2025
**Hash:** 4d2409cc0aa18d7d9c5c3a1bd3cfc844eb32fadd
**Type:** [Sync] [Fix]

**Fichiers modifiés:**

- apps/web/src/hooks/useTagGraph.ts (26 modifications)

**Description:**
Retire clearTags() call qui supprimait tous les tags.
syncFromMindMap fusionne tags au lieu de les nettoyer.
Ajoute seulement tags qui n'existent pas déjà.
Préserve tags créés via dropdown (qui ne sont pas dans MindMap).

---

### 564fae0 - Debug: Detailed logging in createAndAssociateTag

**Hash:** 564fae0
**Type:** [Debug]

Logs détaillés pour tracer createAndAssociateTag flow.

---

### c4269c7 - Debug: Logging to track tag creation flow

**Hash:** c4269c7
**Type:** [Debug]

Logs pour tracer flow de création de tags.

---

## 13. PANNEAUX COLONNE DE DROITE (Scrolling & Layout)

### 10dfba6 - Fix: Enable sidebar scrolling to show all content including tags

**Hash:** 10dfba6
**Type:** [Panel] [Layout]

Active scrolling dans sidebar pour afficher tout contenu + tags.

---

### d4eb571 - Fix: Improve scrollbar visibility in properties panel

**Hash:** d4eb571
**Type:** [Panel] [Layout]

Améliore visibilité scrollbar dans properties panel.

---

### 375fa41 - Style: Remove "Images" and "Stickers" titles from asset panels

**Hash:** 375fa41
**Type:** [Panel] [Style]

Retire titres "Images" et "Stickers" des asset panels.

---

### b267dd3 - Fix: Properly save and restore node tags

**Hash:** b267dd3
**Type:** [Panel] [Style]

Autre fix pour save/restore tags.

---

## 14. MENU ET EDIT OPERATIONS

### 7cf8931 - Feat: Implement Edit menu with context-aware actions

**Hash:** 7cf8931
**Type:** [Menu] [UI]

Menu Edit avec actions context-aware.

---

### d9c251d - Feat: Enhance Edit menu with tag copy/paste support

**Déjà couvert ci-dessus**

---

## SOMMAIRE PAR THÈME

### AFFICHAGE DES TAGS (11 commits)

ea71f6e, e6c87b5, fc5c2e7, 84b81a8, 6570432, 62c999d, eaedf0c, 69abee4, afed6f3, 37376ee, 43f9f51

### SYSTÈME DAG (2 commits)

f9390bc, 9c10440

### COLONNE DE DROITE (6 commits)

afed6f3, fcbec4f, 8c136ca, 9a2fc98, d718620, 58c89fe, a3f9e3f

### SYNCHRONISATION (17 commits)

2cc5bd7, ba2df9e, 554c75c, c2c73af, 52ec3f8, bd80777, ff436ab, f95d337, f6d6b2d, 5ae7784, 1fdaffb, 4d2409c, 7ec3dd6 (persistence), 1cc53da, 7d08e5e

### PERSISTANCE (3 commits majeurs)

7ec3dd6, 6809738, af2a230, 04b9e13, f27cb70

### CENTRALISATION (6 commits)

1fd9740, f4d91d8, a8125e7, 4efae27, fdc3512

### COULEURS (3 commits)

ee6c03b, 37376ee, 43f9f51

### CRÉATION ET ASSOCIATION (6 commits)

5bc52ed, 1fdaffb, 7689f5c, c9c6043, ddf83df, 15a2310, 204b7f4

### COPY/PASTE (2 commits)

5ae7784, d9c251d

### HIÉRARCHIE (2 commits)

1cc53da, 7d08e5e

### UNIFICATION OPERATIONS (3 commits)

fc270d6, 5123b7e, 6d9a969

---

## CHRONOLOGIE D'IMPLÉMENTATION RECOMMANDÉE

1. **PHASE 1 - FONDATION (DAG System)**
   - f9390bc: Implémentation DAG

2. **PHASE 2 - SYNCHRONISATION & ASSOCIATIONS**
   - 9c10440: Event bus + node-tag store
   - 2cc5bd7: Real-time sync implementation

3. **PHASE 3 - AFFICHAGE INITIAL**
   - ea71f6e: Display tags on nodes
   - 69abee4: Final positioning (right edge)

4. **PHASE 4 - PERSISTANCE**
   - 7ec3dd6: Save/load tags in bigmind.json
   - 6809738: Comprehensive data persistence
   - af2a230: Node tags persistence

5. **PHASE 5 - CENTRALISATION (CRITICAL)**
   - 4efae27: MindMapNode from store
   - 1fd9740: Single source of truth
   - f4d91d8: useNodeTagsStore setter
   - a8125e7: Simplify deleteTag

6. **PHASE 6 - TAG OPERATIONS**
   - 5bc52ed: Consolidate tag creation
   - 1fdaffb: Add to DAG on MindMapCanvas
   - 4d2409c: Preserve tags during sync
   - 5123b7e: Unify tag addition (MenuBar + NodeTagPanel)
   - 6d9a969: Unify context menu operations

7. **PHASE 7 - PANEL ET INTERACTIONS**
   - fcbec4f: Single/double-click actions
   - 58c89fe: Color picker + visibility toggle
   - 8c136ca: Drag-drop phantom

8. **PHASE 8 - COPY/PASTE & MENU**
   - d9c251d: Tag copy/paste in Edit menu

9. **PHASE 9 - NETTOYAGE & FIXES**
   - 1cc53da: Remove tags when deleted
   - fdc3512: Centralized tag reader helper
   - Tous les commits de debug/styling
