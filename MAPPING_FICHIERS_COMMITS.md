# MAPPING FICHIERS-COMMITS - TAGS

**Fichiers modifiés:** 154
**Total commits:** 76

---

## FICHIERS LES PLUS MODIFIÉS

### apps/web/src/components/MindMapNode.tsx

**Modifications:** 23 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `ea71f6e` (2025-10-23) - feat(ui): affichage des tags sur les nœuds de la carte
- `e6c87b5` (2025-10-23) - fix(ui): correction clé unique pour les tags
- `69abee4` (2025-10-23) - feat(ui): repositionnement des tags sur le bord droit des nœuds
- `eaedf0c` (2025-10-23) - fix(ui): repositionnement des tags sur le bord inférieur centré
- ... et 18 autres modifications

### apps/web/src/components/TagLayersPanelDAG.tsx

**Modifications:** 22 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `9c10440` (2025-10-22) - feat: implement dynamic DAG-MindMap synchronization
- `02dcc3a` (2025-10-22) - fix: remove sample data from DAG and sync with active map
- `143551a` (2025-10-22) - fix: correct import path casing for useMindmap
- `f95d337` (2025-10-22) - debug: add more logging to track tag panel updates
- ... et 17 autres modifications

### apps/web/src/hooks/useTagGraph.ts

**Modifications:** 17 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `9c10440` (2025-10-22) - feat: implement dynamic DAG-MindMap synchronization
- `02dcc3a` (2025-10-22) - fix: remove sample data from DAG and sync with active map
- `2cc5bd7` (2025-10-22) - feat: implement real-time tag synchronization between MindMap and DAG
- `ff436ab` (2025-10-22) - debug: add extensive logging for tag synchronization
- ... et 12 autres modifications

### apps/web/src/hooks/useMindmap.ts

**Modifications:** 7 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `02dcc3a` (2025-10-22) - fix: remove sample data from DAG and sync with active map
- `143551a` (2025-10-22) - fix: correct import path casing for useMindmap
- `2cc5bd7` (2025-10-22) - feat: implement real-time tag synchronization between MindMap and DAG
- `ff436ab` (2025-10-22) - debug: add extensive logging for tag synchronization
- ... et 2 autres modifications

### apps/web/src/components/NodeTagPanel.tsx

**Modifications:** 6 commits

- `9c10440` (2025-10-22) - feat: implement dynamic DAG-MindMap synchronization
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `5bc52ed` (2025-10-23) - refactor: consolidate tag creation logic into shared utility function
- `5ae7784` (2025-10-23) - fix: sync DAG panel when tag is created via context menu
- `c9c6043` (2025-10-23) - style: add icon to create button inside tag dropdown menu
- ... et 1 autres modifications

### apps/web/src/components/QuickTagTest.tsx

**Modifications:** 6 commits

- `2cc5bd7` (2025-10-22) - feat: implement real-time tag synchronization between MindMap and DAG
- `ff436ab` (2025-10-22) - debug: add extensive logging for tag synchronization
- `f6d6b2d` (2025-10-22) - debug: add direct event test button and improve logging
- `52ec3f8` (2025-10-22) - fix: resolve tag synchronization issues
- `c2c73af` (2025-10-22) - fix: always show tags panel regardless of map state
- ... et 1 autres modifications

### apps/web/src/components/MindMapCanvas.tsx

**Modifications:** 5 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `1fdaffb` (2025-10-23) - fix: ensure tags created via MindMapCanvas are added to DAG store
- `7cf8931` (2025-10-23) - feat: implement Edit menu with context-aware actions
- `6d9a969` (2025-10-23) - refactor: unify tag operations in NodeContextMenu - use centralized sync functions

### apps/web/src/components/MenuBar.tsx

**Modifications:** 5 commits

- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `7cf8931` (2025-10-23) - feat: implement Edit menu with context-aware actions
- `d9c251d` (2025-10-23) - feat: enhance Edit menu with tag copy/paste support
- `fc270d6` (2025-10-23) - refactor: unify tag addition through addTagToNodeSync
- `5123b7e` (2025-10-23) - refactor: unify tag addition - both paths use sync.tagNode()

### apps/web/src/hooks/useFileOperations.ts

**Modifications:** 5 commits

- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `7ec3dd6` (2025-10-23) - fix: persist and restore tags in file save/load
- `6809738` (2025-10-23) - feat: implement comprehensive data persistence for BigMind
- `04b9e13` (2025-10-23) - fix: correct store access in file export - fix bigmind.json save issue
- `af2a230` (2025-10-23) - fix: properly save and restore node tags in bigmind.json

### apps/web/src/components/TagLayersPanel.tsx

**Modifications:** 4 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `fdc3512` (2025-10-23) - refactor: add centralized tag reader helper in TagLayersPanel
- `f4d91d8` (2025-10-23) - refactor: centralize tag modifications through useNodeTagsStore

### apps/web/src/hooks/useOpenFiles.ts

**Modifications:** 4 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `ba2df9e` (2025-10-23) - feat(sync): implémentation complète de la synchronisation des tags
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `4a05c39` (2025-10-25) - fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

### apps/web/src/hooks/useReactFlowNodes.ts

**Modifications:** 4 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `69abee4` (2025-10-23) - feat(ui): repositionnement des tags sur le bord droit des nœuds
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `4a05c39` (2025-10-25) - fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

### apps/web/src/layouts/MainLayout.tsx

**Modifications:** 4 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `2cc5bd7` (2025-10-22) - feat: implement real-time tag synchronization between MindMap and DAG
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `f39ccd7` (2025-10-23) - debug: add comprehensive logging for tag creation in DAG panel

### apps/web/src/components/NodeTagPanel.css

**Modifications:** 4 commits

- `9c10440` (2025-10-22) - feat: implement dynamic DAG-MindMap synchronization
- `ddf83df` (2025-10-23) - style: update create tag button to use accent color
- `15a2310` (2025-10-23) - style: update tag panel buttons to match settings button style
- `c9c6043` (2025-10-23) - style: add icon to create button inside tag dropdown menu

### apps/web/src/hooks/useNodeTags.ts

**Modifications:** 4 commits

- `9c10440` (2025-10-22) - feat: implement dynamic DAG-MindMap synchronization
- `554c75c` (2025-10-22) - fix: synchroniser les tags uniquement avec la carte active
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `f4d91d8` (2025-10-23) - refactor: centralize tag modifications through useNodeTagsStore

### apps/web/src/utils/eventBus.ts

**Modifications:** 4 commits

- `9c10440` (2025-10-22) - feat: implement dynamic DAG-MindMap synchronization
- `2cc5bd7` (2025-10-22) - feat: implement real-time tag synchronization between MindMap and DAG
- `ff436ab` (2025-10-22) - debug: add extensive logging for tag synchronization
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map

### apps/web/src/App.tsx

**Modifications:** 4 commits

- `bd80777` (2025-10-22) - feat: ensure tag synchronization is always active
- `ba2df9e` (2025-10-23) - feat(sync): implémentation complète de la synchronisation des tags
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map
- `f39ccd7` (2025-10-23) - debug: add comprehensive logging for tag creation in DAG panel

### apps/web/src/components/TagSyncInitializer.tsx

**Modifications:** 4 commits

- `bd80777` (2025-10-22) - feat: ensure tag synchronization is always active
- `f95d337` (2025-10-22) - debug: add more logging to track tag panel updates
- `554c75c` (2025-10-22) - fix: synchroniser les tags uniquement avec la carte active
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map

### apps/web/src/utils/tagUtils.ts

**Modifications:** 4 commits

- `5bc52ed` (2025-10-23) - refactor: consolidate tag creation logic into shared utility function
- `7689f5c` (2025-10-23) - fix: ensure parent property is omitted when tag has no parent
- `564fae0` (2025-10-23) - debug: add detailed logging in createAndAssociateTag
- `ee6c03b` (2025-10-23) - refactor: use blue as default color for all tags

### apps/web/src/components/NodeProperties.tsx

**Modifications:** 3 commits

- `f9390bc` (2025-10-22) - feat(dag): implémentation complète du système DAG sémantique pour les tags
- `ba2df9e` (2025-10-23) - feat(sync): implémentation complète de la synchronisation des tags
- `dad1af9` (2025-10-23) - feat: enhance tag display and drag-drop on mind map

---

## TOUS LES FICHIERS (par catégorie)

### Autres (src)

- `apps/web/src/layouts/MainLayout.tsx` (4 modifications)
- `apps/web/src/App.tsx` (4 modifications)
- `apps/web/src/App.css` (2 modifications)
- `apps/web/src/layouts/MainLayout.css` (2 modifications)
- `apps/web/src/data/tags.json` (1 modifications)
- `apps/web/src/parsers/FreeMindParser.ts` (1 modifications)
- `apps/web/src/contexts/TagDragDropContext.tsx` (1 modifications)

### Components

- `apps/web/src/components/MindMapNode.tsx` (23 modifications)
- `apps/web/src/components/TagLayersPanelDAG.tsx` (22 modifications)
- `apps/web/src/components/NodeTagPanel.tsx` (6 modifications)
- `apps/web/src/components/QuickTagTest.tsx` (6 modifications)
- `apps/web/src/components/MindMapCanvas.tsx` (5 modifications)
- `apps/web/src/components/MenuBar.tsx` (5 modifications)
- `apps/web/src/components/TagLayersPanel.tsx` (4 modifications)
- `apps/web/src/components/NodeTagPanel.css` (4 modifications)
- `apps/web/src/components/TagSyncInitializer.tsx` (4 modifications)
- `apps/web/src/components/NodeProperties.tsx` (3 modifications)
- `apps/web/src/components/Sidebar.tsx` (3 modifications)
- `apps/web/src/components/TagLayersPanelDAG.css` (3 modifications)
- `apps/web/src/components/NodeContextMenu.tsx` (2 modifications)
- `apps/web/src/components/NodeProperties.css` (2 modifications)
- `apps/web/src/components/StickerPicker.tsx` (2 modifications)
- `apps/web/src/components/TagGraph.tsx` (2 modifications)
- `apps/web/src/components/TemplateGallery.tsx` (2 modifications)
- `apps/web/src/components/ThemeSelector.tsx` (2 modifications)
- `apps/web/src/components/dialogs/InsertImageDialog.tsx` (2 modifications)
- `apps/web/src/components/dialogs/InsertStickerDialog.tsx` (2 modifications)
- `apps/web/src/components/TagInputWithParent.tsx` (2 modifications)
- `apps/web/src/components/TagLayersPanel.css` (1 modifications)
- `apps/web/src/components/ImageManager.tsx` (1 modifications)
- `apps/web/src/components/MindMapEdge.tsx` (1 modifications)
- `apps/web/src/components/NodeExplorer.tsx` (1 modifications)
- `apps/web/src/components/PlatformDebug.tsx` (1 modifications)
- `apps/web/src/components/StatusBar.tsx` (1 modifications)
- `apps/web/src/components/Toolbar.tsx` (1 modifications)
- `apps/web/src/components/TagDragGhost.tsx` (1 modifications)

### Hooks

- `apps/web/src/hooks/useTagGraph.ts` (17 modifications)
- `apps/web/src/hooks/useMindmap.ts` (7 modifications)
- `apps/web/src/hooks/useFileOperations.ts` (5 modifications)
- `apps/web/src/hooks/useOpenFiles.ts` (4 modifications)
- `apps/web/src/hooks/useReactFlowNodes.ts` (4 modifications)
- `apps/web/src/hooks/useNodeTags.ts` (4 modifications)
- `apps/web/src/hooks/useAssets.ts` (3 modifications)
- `apps/web/src/hooks/useMindMapDAGSync.ts` (3 modifications)
- `apps/web/src/hooks/useColumnResize.ts` (2 modifications)
- `apps/web/src/hooks/useTagLayers.ts` (2 modifications)
- `apps/web/src/hooks/useTemplates.ts` (2 modifications)
- `apps/web/src/hooks/useThemes.ts` (2 modifications)
- `apps/web/src/hooks/useTagDragDrop.ts` (2 modifications)
- `apps/web/src/hooks/__tests__/useAssets.test.ts` (1 modifications)
- `apps/web/src/hooks/__tests__/useTemplates.test.ts` (1 modifications)
- `apps/web/src/hooks/__tests__/useThemes.test.ts` (1 modifications)
- `apps/web/src/hooks/useCanvasOptions.ts` (1 modifications)
- `apps/web/src/hooks/useColorInference.ts` (1 modifications)
- `apps/web/src/hooks/useColumnCollapse.ts` (1 modifications)
- `apps/web/src/hooks/useContextMenuHandlers.ts` (1 modifications)
- `apps/web/src/hooks/useDragAndDrop.ts` (1 modifications)
- `apps/web/src/hooks/useEditMode.ts` (1 modifications)
- `apps/web/src/hooks/useFlowInstance.ts` (1 modifications)
- `apps/web/src/hooks/useKeyboardNavigation.ts` (1 modifications)
- `apps/web/src/hooks/usePlatform.ts` (1 modifications)
- `apps/web/src/hooks/useReactFlowEdges.ts` (1 modifications)
- `apps/web/src/hooks/useShortcuts.ts` (1 modifications)
- `apps/web/src/hooks/useViewport.ts` (1 modifications)
- `apps/web/src/hooks/useEditMenuContext.ts` (1 modifications)

### Packages

- `packages/core/src/commands.ts` (3 modifications)
- `packages/core/src/commands.d.ts.map` (2 modifications)
- `packages/core/src/commands.js` (2 modifications)
- `packages/core/src/commands.js.map` (2 modifications)
- `packages/core/package.json` (1 modifications)
- `packages/core/src/assets.d.ts` (1 modifications)
- `packages/core/src/assets.d.ts.map` (1 modifications)
- `packages/core/src/assets.js` (1 modifications)
- `packages/core/src/assets.js.map` (1 modifications)
- `packages/core/src/assets.ts` (1 modifications)
- `packages/core/src/commands.d.ts` (1 modifications)
- `packages/core/src/commands/history.d.ts` (1 modifications)
- `packages/core/src/commands/history.js` (1 modifications)
- `packages/core/src/index.d.ts` (1 modifications)
- `packages/core/src/index.d.ts.map` (1 modifications)
- `packages/core/src/index.js` (1 modifications)
- `packages/core/src/index.js.map` (1 modifications)
- `packages/core/src/index.ts` (1 modifications)
- `packages/core/src/model.d.ts` (1 modifications)
- `packages/core/src/model.d.ts.map` (1 modifications)
- `packages/core/src/model.js` (1 modifications)
- `packages/core/src/model.js.map` (1 modifications)
- `packages/core/src/model.ts` (1 modifications)
- `packages/core/src/parsers/freemind.d.ts` (1 modifications)
- `packages/core/src/parsers/freemind.js` (1 modifications)
- `packages/core/src/parsers/xmind-phase2.d.ts` (1 modifications)
- `packages/core/src/parsers/xmind-phase2.d.ts.map` (1 modifications)
- `packages/core/src/parsers/xmind-phase2.js` (1 modifications)
- `packages/core/src/parsers/xmind-phase2.js.map` (1 modifications)
- `packages/core/src/parsers/xmind-phase2.ts` (1 modifications)
- `packages/core/src/parsers/xmind.d.ts` (1 modifications)
- `packages/core/src/parsers/xmind.d.ts.map` (1 modifications)
- `packages/core/src/parsers/xmind.js` (1 modifications)
- `packages/core/src/parsers/xmind.js.map` (1 modifications)
- `packages/core/src/templates.d.ts` (1 modifications)
- `packages/core/src/templates.d.ts.map` (1 modifications)
- `packages/core/src/templates.js` (1 modifications)
- `packages/core/src/templates.js.map` (1 modifications)
- `packages/core/src/templates.ts` (1 modifications)
- `packages/core/src/themes.d.ts` (1 modifications)
- `packages/core/src/themes.d.ts.map` (1 modifications)
- `packages/core/src/themes.js` (1 modifications)
- `packages/core/src/themes.js.map` (1 modifications)
- `packages/core/src/themes.ts` (1 modifications)
- `packages/design/src/index.ts` (1 modifications)
- `packages/design/src/sticker-library.ts` (1 modifications)
- `packages/design/src/template-presets.ts` (1 modifications)
- `packages/design/src/theme-presets.ts` (1 modifications)

### Pages

- `apps/web/src/pages/Settings.tsx` (2 modifications)
- `apps/web/src/pages/SettingsAppearanceSection.tsx` (2 modifications)
- `apps/web/src/pages/SettingsInteractionSection.tsx` (2 modifications)
- `apps/web/src/pages/SettingsShortcutsSection.tsx` (2 modifications)
- `apps/web/src/pages/Settings.css` (1 modifications)

### Racine & Config

- `.cursorindexingignore` (1 modifications)
- `.gitignore` (1 modifications)
- `CHANGELOG_PHASE2.md` (1 modifications)
- `PHASE2_COMPLETION_REPORT.md` (1 modifications)
- `PHASE2_FILES_INDEX.md` (1 modifications)
- `PHASE2_INTEGRATION_GUIDE.md` (1 modifications)
- `PHASE2_PROGRESS.md` (1 modifications)
- `PHASE2_QUICKSTART.md` (1 modifications)
- `apps/web/package.json` (1 modifications)
- `apps/web/vite.config.ts` (1 modifications)
- `commit-branch.sh` (1 modifications)
- `logs/sessions/chat_input.txt` (1 modifications)
- `logs/sessions/commit_context.json` (1 modifications)
- `logs/sessions/current_session.json` (1 modifications)
- `logs/sessions/example_export.json` (1 modifications)
- `logs/sessions/session_20251002_143637.json` (1 modifications)
- `pnpm-lock.yaml` (1 modifications)
- `scripts/10-ai-session-tracker.sh` (1 modifications)
- `scripts/11-conversation-auto-logger.sh` (1 modifications)
- `scripts/12-chat-logger.sh` (1 modifications)
- `scripts/13-ai-history-parser.sh` (1 modifications)
- `scripts/15-manual-chat-logger.sh` (1 modifications)
- `tests/phase2.spec.ts` (1 modifications)
- `tsconfig.base.json` (1 modifications)
- `apps/web/docs/dag-sync-mindmap.md` (1 modifications)

### Types

- `apps/web/src/types/dag.ts` (3 modifications)
- `apps/web/src/types/nodeTag.ts` (2 modifications)

### Utils

- `apps/web/src/utils/eventBus.ts` (4 modifications)
- `apps/web/src/utils/tagUtils.ts` (4 modifications)
- `apps/web/src/utils/colorUtils.ts` (2 modifications)
- `apps/web/src/utils/shortcutUtils.ts` (2 modifications)
- `apps/web/src/utils/backgroundPatterns.ts` (1 modifications)
- `apps/web/src/utils/cn.ts` (1 modifications)
- `apps/web/src/utils/inputUtils.ts` (1 modifications)
- `apps/web/src/utils/nodeUtils.ts` (1 modifications)
- `apps/web/src/utils/toast.ts` (1 modifications)

---

## DÉTAILS COMPLETS PAR FICHIER

### apps/web/src/components/MindMapNode.tsx

**Total modifications:** 23

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ea71f6e` - 2025-10-23
   feat(ui): affichage des tags sur les nœuds de la carte
4. `e6c87b5` - 2025-10-23
   fix(ui): correction clé unique pour les tags
5. `69abee4` - 2025-10-23
   feat(ui): repositionnement des tags sur le bord droit des nœuds
6. `eaedf0c` - 2025-10-23
   fix(ui): repositionnement des tags sur le bord inférieur centré
7. `62c999d` - 2025-10-23
   fix(ui): alignement précis des tags sur la bordure inférieure
8. `6570432` - 2025-10-23
   fix(ui): amélioration du centrage horizontal des tags
9. `84b81a8` - 2025-10-23
   fix(ui): correction définitive du centrage géométrique des tags
10. `fc5c2e7` - 2025-10-23
    fix(ui): affichage complet des tags sans troncature
11. `2ad5e9a` - 2025-10-23
    fix(ui): positionnement précis du milieu vertical des tags sur la bordure
12. `5c8e921` - 2025-10-23
    feat(ui): descente des tags de 20% de la hauteur du nœud
13. `f851261` - 2025-10-23
    fix(ui): positionnement cohérent des tags pour tous les nœuds
14. `33b169d` - 2025-10-23
    fix(ui): empêcher les tags d'agrandir la hauteur du nœud
15. `d87432e` - 2025-10-23
    fix(ui): wrapper hauteur 0 pour empêcher agrandissement du nœud
16. `8741f7f` - 2025-10-23
    fix(ui): réalignement vertical du tag sur la bordure du nœud
17. `1f38451` - 2025-10-23
    feat(ui): descente du centre Y du tag de 20% sous la bordure
18. `48dc7f1` - 2025-10-23
    fix(ui): correction positionnement tag à cheval avec valeur pixels
19. `152e280` - 2025-10-23
    fix(ui): remontage du tag pour positionnement à cheval correct
20. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
21. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel
22. `37376ee` - 2025-10-23
    feat: centralize tag labels from DAG store in MindMapNode
23. `43f9f51` - 2025-10-23
    feat: centralize tag colors from DAG store in MindMapNode
24. `4efae27` - 2025-10-23
    fix: MindMapNode reads tags from useNodeTagsStore instead of props

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/MindMapNode.tsx
```

---

### apps/web/src/components/TagLayersPanelDAG.tsx

**Total modifications:** 22

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `02dcc3a` - 2025-10-22
   fix: remove sample data from DAG and sync with active map
5. `143551a` - 2025-10-22
   fix: correct import path casing for useMindmap
6. `f95d337` - 2025-10-22
   debug: add more logging to track tag panel updates
7. `c2c73af` - 2025-10-22
   fix: always show tags panel regardless of map state
8. `554c75c` - 2025-10-22
   fix: synchroniser les tags uniquement avec la carte active
9. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
10. `afed6f3` - 2025-10-23
    feat(ui): ajout bouton + dans l'en-tête du panneau Tags & Calques
11. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
12. `5bc52ed` - 2025-10-23
    refactor: consolidate tag creation logic into shared utility function
13. `5ae7784` - 2025-10-23
    fix: sync DAG panel when tag is created via context menu
14. `c4269c7` - 2025-10-23
    debug: add logging to track tag creation flow
15. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel
16. `8c136ca` - 2025-10-23
    feat: add drag and drop phantom for tag hierarchy
17. `9a2fc98` - 2025-10-23
    feat: improve tag drag phantom and add refresh button
18. `d718620` - 2025-10-23
    fix: keep exact label when copying tags in hierarchy
19. `fcbec4f` - 2025-10-23
    feat: add single/double-click actions for tags in hierarchy
20. `ae4b617` - 2025-10-23
    style: reduce font size for inline tag edit input
21. `58c89fe` - 2025-10-23
    feat: add color picker and smart visibility toggle for tags
22. `5c36134` - 2025-10-23
    fix: remove duplicate getDescendants function declaration
23. `7cf8931` - 2025-10-23
    feat: implement Edit menu with context-aware actions

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagLayersPanelDAG.tsx
```

---

### apps/web/src/hooks/useTagGraph.ts

**Total modifications:** 17

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `02dcc3a` - 2025-10-22
   fix: remove sample data from DAG and sync with active map
5. `2cc5bd7` - 2025-10-22
   feat: implement real-time tag synchronization between MindMap and DAG
6. `ff436ab` - 2025-10-22
   debug: add extensive logging for tag synchronization
7. `52ec3f8` - 2025-10-22
   fix: resolve tag synchronization issues
8. `554c75c` - 2025-10-22
   fix: synchroniser les tags uniquement avec la carte active
9. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
10. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
11. `4d2409c` - 2025-10-23
    fix: preserve tags created via UI when syncing from mindmap
12. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel
13. `04b9e13` - 2025-10-23
    fix: correct store access in file export - fix bigmind.json save issue
14. `1cc53da` - 2025-10-23
    fix: remove tag from node when deleted in tag hierarchy
15. `7d08e5e` - 2025-10-23
    fix: properly remove tags from nodes when deleting from hierarchy
16. `a8125e7` - 2025-10-23
    refactor: simplify deleteTagWithSync to only modify store
17. `fc270d6` - 2025-10-23
    refactor: unify tag addition through addTagToNodeSync
18. `5123b7e` - 2025-10-23
    refactor: unify tag addition - both paths use sync.tagNode()

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useTagGraph.ts
```

---

### apps/web/src/hooks/useMindmap.ts

**Total modifications:** 7

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `02dcc3a` - 2025-10-22
   fix: remove sample data from DAG and sync with active map
4. `143551a` - 2025-10-22
   fix: correct import path casing for useMindmap
5. `2cc5bd7` - 2025-10-22
   feat: implement real-time tag synchronization between MindMap and DAG
6. `ff436ab` - 2025-10-22
   debug: add extensive logging for tag synchronization
7. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
8. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useMindmap.ts
```

---

### apps/web/src/components/NodeTagPanel.tsx

**Total modifications:** 6

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
5. `5bc52ed` - 2025-10-23
   refactor: consolidate tag creation logic into shared utility function
6. `5ae7784` - 2025-10-23
   fix: sync DAG panel when tag is created via context menu
7. `c9c6043` - 2025-10-23
   style: add icon to create button inside tag dropdown menu
8. `c4269c7` - 2025-10-23
   debug: add logging to track tag creation flow

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/NodeTagPanel.tsx
```

---

### apps/web/src/components/QuickTagTest.tsx

**Total modifications:** 6

**Historique:**

6. `2cc5bd7` - 2025-10-22
   feat: implement real-time tag synchronization between MindMap and DAG
7. `ff436ab` - 2025-10-22
   debug: add extensive logging for tag synchronization
8. `f6d6b2d` - 2025-10-22
   debug: add direct event test button and improve logging
9. `52ec3f8` - 2025-10-22
   fix: resolve tag synchronization issues
10. `c2c73af` - 2025-10-22
    fix: always show tags panel regardless of map state
11. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/QuickTagTest.tsx
```

---

### apps/web/src/components/MindMapCanvas.tsx

**Total modifications:** 5

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
4. `1fdaffb` - 2025-10-23
   fix: ensure tags created via MindMapCanvas are added to DAG store
5. `7cf8931` - 2025-10-23
   feat: implement Edit menu with context-aware actions
6. `6d9a969` - 2025-10-23
   refactor: unify tag operations in NodeContextMenu - use centralized sync functions

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/MindMapCanvas.tsx
```

---

### apps/web/src/components/MenuBar.tsx

**Total modifications:** 5

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
34. `7cf8931` - 2025-10-23
    feat: implement Edit menu with context-aware actions
35. `d9c251d` - 2025-10-23
    feat: enhance Edit menu with tag copy/paste support
36. `fc270d6` - 2025-10-23
    refactor: unify tag addition through addTagToNodeSync
37. `5123b7e` - 2025-10-23
    refactor: unify tag addition - both paths use sync.tagNode()

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/MenuBar.tsx
```

---

### apps/web/src/hooks/useFileOperations.ts

**Total modifications:** 5

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
34. `7ec3dd6` - 2025-10-23
    fix: persist and restore tags in file save/load
35. `6809738` - 2025-10-23
    feat: implement comprehensive data persistence for BigMind
36. `04b9e13` - 2025-10-23
    fix: correct store access in file export - fix bigmind.json save issue
37. `af2a230` - 2025-10-23
    fix: properly save and restore node tags in bigmind.json

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useFileOperations.ts
```

---

### apps/web/src/components/TagLayersPanel.tsx

**Total modifications:** 4

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
4. `fdc3512` - 2025-10-23
   refactor: add centralized tag reader helper in TagLayersPanel
5. `f4d91d8` - 2025-10-23
   refactor: centralize tag modifications through useNodeTagsStore

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagLayersPanel.tsx
```

---

### apps/web/src/hooks/useOpenFiles.ts

**Total modifications:** 4

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
4. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
5. `4a05c39` - 2025-10-25
   fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useOpenFiles.ts
```

---

### apps/web/src/hooks/useReactFlowNodes.ts

**Total modifications:** 4

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `69abee4` - 2025-10-23
   feat(ui): repositionnement des tags sur le bord droit des nœuds
4. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
5. `4a05c39` - 2025-10-25
   fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useReactFlowNodes.ts
```

---

### apps/web/src/layouts/MainLayout.tsx

**Total modifications:** 4

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `2cc5bd7` - 2025-10-22
   feat: implement real-time tag synchronization between MindMap and DAG
4. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
5. `f39ccd7` - 2025-10-23
   debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/layouts/MainLayout.tsx
```

---

### apps/web/src/components/NodeTagPanel.css

**Total modifications:** 4

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `ddf83df` - 2025-10-23
   style: update create tag button to use accent color
5. `15a2310` - 2025-10-23
   style: update tag panel buttons to match settings button style
6. `c9c6043` - 2025-10-23
   style: add icon to create button inside tag dropdown menu

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/NodeTagPanel.css
```

---

### apps/web/src/hooks/useNodeTags.ts

**Total modifications:** 4

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `554c75c` - 2025-10-22
   fix: synchroniser les tags uniquement avec la carte active
5. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
6. `f4d91d8` - 2025-10-23
   refactor: centralize tag modifications through useNodeTagsStore

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useNodeTags.ts
```

---

### apps/web/src/utils/eventBus.ts

**Total modifications:** 4

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `2cc5bd7` - 2025-10-22
   feat: implement real-time tag synchronization between MindMap and DAG
5. `ff436ab` - 2025-10-22
   debug: add extensive logging for tag synchronization
6. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/eventBus.ts
```

---

### apps/web/src/App.tsx

**Total modifications:** 4

**Historique:**

7. `bd80777` - 2025-10-22
   feat: ensure tag synchronization is always active
8. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
9. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
10. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/App.tsx
```

---

### apps/web/src/components/TagSyncInitializer.tsx

**Total modifications:** 4

**Historique:**

7. `bd80777` - 2025-10-22
   feat: ensure tag synchronization is always active
8. `f95d337` - 2025-10-22
   debug: add more logging to track tag panel updates
9. `554c75c` - 2025-10-22
   fix: synchroniser les tags uniquement avec la carte active
10. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagSyncInitializer.tsx
```

---

### apps/web/src/utils/tagUtils.ts

**Total modifications:** 4

**Historique:**

34. `5bc52ed` - 2025-10-23
    refactor: consolidate tag creation logic into shared utility function
35. `7689f5c` - 2025-10-23
    fix: ensure parent property is omitted when tag has no parent
36. `564fae0` - 2025-10-23
    debug: add detailed logging in createAndAssociateTag
37. `ee6c03b` - 2025-10-23
    refactor: use blue as default color for all tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/tagUtils.ts
```

---

### apps/web/src/components/NodeProperties.tsx

**Total modifications:** 3

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
4. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/NodeProperties.tsx
```

---

### apps/web/src/components/Sidebar.tsx

**Total modifications:** 3

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
4. `10dfba6` - 2025-10-23
   fix: enable sidebar scrolling to show all content including tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/Sidebar.tsx
```

---

### apps/web/src/components/TagLayersPanelDAG.css

**Total modifications:** 3

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `f39ccd7` - 2025-10-23
   debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagLayersPanelDAG.css
```

---

### apps/web/src/hooks/useAssets.ts

**Total modifications:** 3

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
4. `04b9e13` - 2025-10-23
   fix: correct store access in file export - fix bigmind.json save issue

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useAssets.ts
```

---

### apps/web/src/types/dag.ts

**Total modifications:** 3

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map
4. `58c89fe` - 2025-10-23
   feat: add color picker and smart visibility toggle for tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/types/dag.ts
```

---

### packages/core/src/commands.ts

**Total modifications:** 3

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags
4. `4a05c39` - 2025-10-25
   fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands.ts
```

---

### apps/web/src/hooks/useMindMapDAGSync.ts

**Total modifications:** 3

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `143551a` - 2025-10-22
   fix: correct import path casing for useMindmap
5. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useMindMapDAGSync.ts
```

---

### apps/web/src/App.css

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `10dfba6` - 2025-10-23
   fix: enable sidebar scrolling to show all content including tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/App.css
```

---

### apps/web/src/components/NodeContextMenu.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/NodeContextMenu.tsx
```

---

### apps/web/src/components/NodeProperties.css

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `10dfba6` - 2025-10-23
   fix: enable sidebar scrolling to show all content including tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/NodeProperties.css
```

---

### apps/web/src/components/StickerPicker.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/StickerPicker.tsx
```

---

### apps/web/src/components/TagGraph.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagGraph.tsx
```

---

### apps/web/src/components/TemplateGallery.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TemplateGallery.tsx
```

---

### apps/web/src/components/ThemeSelector.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/ThemeSelector.tsx
```

---

### apps/web/src/components/dialogs/InsertImageDialog.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/dialogs/InsertImageDialog.tsx
```

---

### apps/web/src/components/dialogs/InsertStickerDialog.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/dialogs/InsertStickerDialog.tsx
```

---

### apps/web/src/hooks/useColumnResize.ts

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useColumnResize.ts
```

---

### apps/web/src/hooks/useTagLayers.ts

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useTagLayers.ts
```

---

### apps/web/src/hooks/useTemplates.ts

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useTemplates.ts
```

---

### apps/web/src/hooks/useThemes.ts

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useThemes.ts
```

---

### apps/web/src/layouts/MainLayout.css

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `f39ccd7` - 2025-10-23
   debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/layouts/MainLayout.css
```

---

### apps/web/src/pages/Settings.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/pages/Settings.tsx
```

---

### apps/web/src/pages/SettingsAppearanceSection.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/pages/SettingsAppearanceSection.tsx
```

---

### apps/web/src/pages/SettingsInteractionSection.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/pages/SettingsInteractionSection.tsx
```

---

### apps/web/src/pages/SettingsShortcutsSection.tsx

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/pages/SettingsShortcutsSection.tsx
```

---

### apps/web/src/utils/colorUtils.ts

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/colorUtils.ts
```

---

### apps/web/src/utils/shortcutUtils.ts

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/shortcutUtils.ts
```

---

### packages/core/src/commands.d.ts.map

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands.d.ts.map
```

---

### packages/core/src/commands.js

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands.js
```

---

### packages/core/src/commands.js.map

**Total modifications:** 2

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags
3. `ba2df9e` - 2025-10-23
   feat(sync): implémentation complète de la synchronisation des tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands.js.map
```

---

### apps/web/src/types/nodeTag.ts

**Total modifications:** 2

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization
4. `dad1af9` - 2025-10-23
   feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/types/nodeTag.ts
```

---

### apps/web/src/components/TagInputWithParent.tsx

**Total modifications:** 2

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
34. `204b7f4` - 2025-10-23
    style: update add tag button to match accent color button style

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagInputWithParent.tsx
```

---

### apps/web/src/hooks/useTagDragDrop.ts

**Total modifications:** 2

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map
34. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useTagDragDrop.ts
```

---

### .cursorindexingignore

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- .cursorindexingignore
```

---

### .gitignore

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- .gitignore
```

---

### CHANGELOG_PHASE2.md

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- CHANGELOG_PHASE2.md
```

---

### PHASE2_COMPLETION_REPORT.md

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- PHASE2_COMPLETION_REPORT.md
```

---

### PHASE2_FILES_INDEX.md

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- PHASE2_FILES_INDEX.md
```

---

### PHASE2_INTEGRATION_GUIDE.md

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- PHASE2_INTEGRATION_GUIDE.md
```

---

### PHASE2_PROGRESS.md

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- PHASE2_PROGRESS.md
```

---

### PHASE2_QUICKSTART.md

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- PHASE2_QUICKSTART.md
```

---

### apps/web/package.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/package.json
```

---

### apps/web/src/components/TagLayersPanel.css

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagLayersPanel.css
```

---

### apps/web/src/data/tags.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/data/tags.json
```

---

### apps/web/src/hooks/**tests**/useAssets.test.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/__tests__/useAssets.test.ts
```

---

### apps/web/src/hooks/**tests**/useTemplates.test.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/__tests__/useTemplates.test.ts
```

---

### apps/web/src/hooks/**tests**/useThemes.test.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/__tests__/useThemes.test.ts
```

---

### apps/web/src/pages/Settings.css

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/pages/Settings.css
```

---

### apps/web/vite.config.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/vite.config.ts
```

---

### commit-branch.sh

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- commit-branch.sh
```

---

### logs/sessions/chat_input.txt

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- logs/sessions/chat_input.txt
```

---

### logs/sessions/commit_context.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- logs/sessions/commit_context.json
```

---

### logs/sessions/current_session.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- logs/sessions/current_session.json
```

---

### logs/sessions/example_export.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- logs/sessions/example_export.json
```

---

### logs/sessions/session_20251002_143637.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- logs/sessions/session_20251002_143637.json
```

---

### packages/core/package.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/package.json
```

---

### packages/core/src/assets.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/assets.d.ts
```

---

### packages/core/src/assets.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/assets.d.ts.map
```

---

### packages/core/src/assets.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/assets.js
```

---

### packages/core/src/assets.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/assets.js.map
```

---

### packages/core/src/assets.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/assets.ts
```

---

### packages/core/src/commands.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands.d.ts
```

---

### packages/core/src/commands/history.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands/history.d.ts
```

---

### packages/core/src/commands/history.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/commands/history.js
```

---

### packages/core/src/index.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/index.d.ts
```

---

### packages/core/src/index.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/index.d.ts.map
```

---

### packages/core/src/index.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/index.js
```

---

### packages/core/src/index.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/index.js.map
```

---

### packages/core/src/index.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/index.ts
```

---

### packages/core/src/model.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/model.d.ts
```

---

### packages/core/src/model.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/model.d.ts.map
```

---

### packages/core/src/model.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/model.js
```

---

### packages/core/src/model.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/model.js.map
```

---

### packages/core/src/model.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/model.ts
```

---

### packages/core/src/parsers/freemind.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/freemind.d.ts
```

---

### packages/core/src/parsers/freemind.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/freemind.js
```

---

### packages/core/src/parsers/xmind-phase2.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind-phase2.d.ts
```

---

### packages/core/src/parsers/xmind-phase2.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind-phase2.d.ts.map
```

---

### packages/core/src/parsers/xmind-phase2.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind-phase2.js
```

---

### packages/core/src/parsers/xmind-phase2.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind-phase2.js.map
```

---

### packages/core/src/parsers/xmind-phase2.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind-phase2.ts
```

---

### packages/core/src/parsers/xmind.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind.d.ts
```

---

### packages/core/src/parsers/xmind.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind.d.ts.map
```

---

### packages/core/src/parsers/xmind.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind.js
```

---

### packages/core/src/parsers/xmind.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/parsers/xmind.js.map
```

---

### packages/core/src/templates.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/templates.d.ts
```

---

### packages/core/src/templates.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/templates.d.ts.map
```

---

### packages/core/src/templates.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/templates.js
```

---

### packages/core/src/templates.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/templates.js.map
```

---

### packages/core/src/templates.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/templates.ts
```

---

### packages/core/src/themes.d.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/themes.d.ts
```

---

### packages/core/src/themes.d.ts.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/themes.d.ts.map
```

---

### packages/core/src/themes.js

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/themes.js
```

---

### packages/core/src/themes.js.map

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/themes.js.map
```

---

### packages/core/src/themes.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/core/src/themes.ts
```

---

### packages/design/src/index.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/design/src/index.ts
```

---

### packages/design/src/sticker-library.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/design/src/sticker-library.ts
```

---

### packages/design/src/template-presets.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/design/src/template-presets.ts
```

---

### packages/design/src/theme-presets.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- packages/design/src/theme-presets.ts
```

---

### pnpm-lock.yaml

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- pnpm-lock.yaml
```

---

### scripts/10-ai-session-tracker.sh

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- scripts/10-ai-session-tracker.sh
```

---

### scripts/11-conversation-auto-logger.sh

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- scripts/11-conversation-auto-logger.sh
```

---

### scripts/12-chat-logger.sh

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- scripts/12-chat-logger.sh
```

---

### scripts/13-ai-history-parser.sh

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- scripts/13-ai-history-parser.sh
```

---

### scripts/15-manual-chat-logger.sh

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- scripts/15-manual-chat-logger.sh
```

---

### tests/phase2.spec.ts

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- tests/phase2.spec.ts
```

---

### tsconfig.base.json

**Total modifications:** 1

**Historique:**

2. `f9390bc` - 2025-10-22
   feat(dag): implémentation complète du système DAG sémantique pour les tags

**Voir tous les changements:**

```bash
git log --oneline -- tsconfig.base.json
```

---

### apps/web/docs/dag-sync-mindmap.md

**Total modifications:** 1

**Historique:**

3. `9c10440` - 2025-10-22
   feat: implement dynamic DAG-MindMap synchronization

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/docs/dag-sync-mindmap.md
```

---

### apps/web/src/components/ImageManager.tsx

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/ImageManager.tsx
```

---

### apps/web/src/components/MindMapEdge.tsx

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/MindMapEdge.tsx
```

---

### apps/web/src/components/NodeExplorer.tsx

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/NodeExplorer.tsx
```

---

### apps/web/src/components/PlatformDebug.tsx

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/PlatformDebug.tsx
```

---

### apps/web/src/components/StatusBar.tsx

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/StatusBar.tsx
```

---

### apps/web/src/components/Toolbar.tsx

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/Toolbar.tsx
```

---

### apps/web/src/hooks/useCanvasOptions.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useCanvasOptions.ts
```

---

### apps/web/src/hooks/useColorInference.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useColorInference.ts
```

---

### apps/web/src/hooks/useColumnCollapse.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useColumnCollapse.ts
```

---

### apps/web/src/hooks/useContextMenuHandlers.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useContextMenuHandlers.ts
```

---

### apps/web/src/hooks/useDragAndDrop.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useDragAndDrop.ts
```

---

### apps/web/src/hooks/useEditMode.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useEditMode.ts
```

---

### apps/web/src/hooks/useFlowInstance.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useFlowInstance.ts
```

---

### apps/web/src/hooks/useKeyboardNavigation.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useKeyboardNavigation.ts
```

---

### apps/web/src/hooks/usePlatform.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/usePlatform.ts
```

---

### apps/web/src/hooks/useReactFlowEdges.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useReactFlowEdges.ts
```

---

### apps/web/src/hooks/useShortcuts.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useShortcuts.ts
```

---

### apps/web/src/hooks/useViewport.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useViewport.ts
```

---

### apps/web/src/parsers/FreeMindParser.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/parsers/FreeMindParser.ts
```

---

### apps/web/src/utils/backgroundPatterns.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/backgroundPatterns.ts
```

---

### apps/web/src/utils/cn.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/cn.ts
```

---

### apps/web/src/utils/inputUtils.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/inputUtils.ts
```

---

### apps/web/src/utils/nodeUtils.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/nodeUtils.ts
```

---

### apps/web/src/utils/toast.ts

**Total modifications:** 1

**Historique:**

33. `dad1af9` - 2025-10-23
    feat: enhance tag display and drag-drop on mind map

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/utils/toast.ts
```

---

### apps/web/src/components/TagDragGhost.tsx

**Total modifications:** 1

**Historique:**

44. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/components/TagDragGhost.tsx
```

---

### apps/web/src/contexts/TagDragDropContext.tsx

**Total modifications:** 1

**Historique:**

44. `f39ccd7` - 2025-10-23
    debug: add comprehensive logging for tag creation in DAG panel

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/contexts/TagDragDropContext.tsx
```

---

### apps/web/src/hooks/useEditMenuContext.ts

**Total modifications:** 1

**Historique:**

56. `7cf8931` - 2025-10-23
    feat: implement Edit menu with context-aware actions

**Voir tous les changements:**

```bash
git log --oneline -- apps/web/src/hooks/useEditMenuContext.ts
```

---
