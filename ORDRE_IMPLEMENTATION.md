# ORDRE D'IMPLÉMENTATION DÉTAILLÉ - TAGS

**Total:** 76 commits
**Méthodologie:** Suivre strictement cet ordre pour la réimplémentation

---

## 1. a72e060 - feat(ui): horizontal mindmap layout (left/right split), dynamic node-height spacing, side handles

**Date:** 2025-09-29
**Hash:** a72e060fa8fd1beade7ad78e6fb5266470c37ccc

**Fichiers (0):**

**Commandes:**

```bash
# Voir le commit complet
git show a72e060

# Voir les changements dans un fichier spécifique
```

**Impact:** 81 files changed, 15137 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 2. f9390bc - feat(dag): implémentation complète du système DAG sémantique pour les tags

**Date:** 2025-10-22
**Hash:** f9390bc22548912552179e0706090997b650b1e7

**Fichiers (112):**

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
- ... et 102 autres

**Commandes:**

```bash
# Voir le commit complet
git show f9390bc

# Voir les changements dans un fichier spécifique
git show f9390bc:.cursorindexingignore
```

**Impact:** 112 files changed, 17334 insertions(+), 1691 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 3. 9c10440 - feat: implement dynamic DAG-MindMap synchronization

**Date:** 2025-10-22
**Hash:** 9c104405fc1923dec9e3b0be31d7796091003022

**Fichiers (10):**

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

**Commandes:**

```bash
# Voir le commit complet
git show 9c10440

# Voir les changements dans un fichier spécifique
git show 9c10440:apps/web/docs/dag-sync-mindmap.md
```

**Impact:** 10 files changed, 1581 insertions(+), 30 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 4. 02dcc3a - fix: remove sample data from DAG and sync with active map

**Date:** 2025-10-22
**Hash:** 02dcc3afaf467d32084b538835f1a8bb43140d21

**Fichiers (3):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 02dcc3a

# Voir les changements dans un fichier spécifique
git show 02dcc3a:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 3 files changed, 34 insertions(+), 12 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 5. 143551a - fix: correct import path casing for useMindmap

**Date:** 2025-10-22
**Hash:** 143551a32c9e61b9d5a334e56833fef4e884c975

**Fichiers (3):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useMindMapDAGSync.ts`
- `apps/web/src/hooks/useMindmap.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 143551a

# Voir les changements dans un fichier spécifique
git show 143551a:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 3 files changed, 2 insertions(+), 445 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 6. 2cc5bd7 - feat: implement real-time tag synchronization between MindMap and DAG

**Date:** 2025-10-22
**Hash:** 2cc5bd709675c5be358c2aa8f897545d82fbf27f

**Fichiers (5):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `apps/web/src/layouts/MainLayout.tsx`
- `apps/web/src/utils/eventBus.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 2cc5bd7

# Voir les changements dans un fichier spécifique
git show 2cc5bd7:apps/web/src/components/QuickTagTest.tsx
```

**Impact:** 5 files changed, 162 insertions(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 7. bd80777 - feat: ensure tag synchronization is always active

**Date:** 2025-10-22
**Hash:** bd8077708fe3be65b03be04aaa921116b4d0b00a

**Fichiers (2):**

- `apps/web/src/App.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show bd80777

# Voir les changements dans un fichier spécifique
git show bd80777:apps/web/src/App.tsx
```

**Impact:** 2 files changed, 29 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 8. ff436ab - debug: add extensive logging for tag synchronization

**Date:** 2025-10-22
**Hash:** ff436ab37e316aa2a523f6f69cf47c64c61b37a6

**Fichiers (4):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagGraph.ts`
- `apps/web/src/utils/eventBus.ts`

**Commandes:**

```bash
# Voir le commit complet
git show ff436ab

# Voir les changements dans un fichier spécifique
git show ff436ab:apps/web/src/components/QuickTagTest.tsx
```

**Impact:** 4 files changed, 29 insertions(+), 12 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 9. f95d337 - debug: add more logging to track tag panel updates

**Date:** 2025-10-22
**Hash:** f95d3373ee01d28965884f15dce25c72e763cf7f

**Fichiers (2):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show f95d337

# Voir les changements dans un fichier spécifique
git show f95d337:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 2 files changed, 18 insertions(+), 5 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 10. f6d6b2d - debug: add direct event test button and improve logging

**Date:** 2025-10-22
**Hash:** f6d6b2dfd23f63387aee3d46722bfb3d4beb955f

**Fichiers (1):**

- `apps/web/src/components/QuickTagTest.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show f6d6b2d

# Voir les changements dans un fichier spécifique
git show f6d6b2d:apps/web/src/components/QuickTagTest.tsx
```

**Impact:** 1 file changed, 30 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 11. 52ec3f8 - fix: resolve tag synchronization issues

**Date:** 2025-10-22
**Hash:** 52ec3f8703bd716e8507d01f3f16c3799a13fdd7

**Fichiers (2):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 52ec3f8

# Voir les changements dans un fichier spécifique
git show 52ec3f8:apps/web/src/components/QuickTagTest.tsx
```

**Impact:** 2 files changed, 55 insertions(+), 12 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 12. c2c73af - fix: always show tags panel regardless of map state

**Date:** 2025-10-22
**Hash:** c2c73afcd4568ea71a7a20e1b23c61902e508af9

**Fichiers (2):**

- `apps/web/src/components/QuickTagTest.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show c2c73af

# Voir les changements dans un fichier spécifique
git show c2c73af:apps/web/src/components/QuickTagTest.tsx
```

**Impact:** 2 files changed, 16 insertions(+), 22 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 13. 554c75c - fix: synchroniser les tags uniquement avec la carte active

**Date:** 2025-10-22
**Hash:** 554c75cf88141f5e5d1d8fda6905366bdb4920d8

**Fichiers (4):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/components/TagSyncInitializer.tsx`
- `apps/web/src/hooks/useNodeTags.ts`
- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 554c75c

# Voir les changements dans un fichier spécifique
git show 554c75c:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 4 files changed, 113 insertions(+), 61 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 14. ba2df9e - feat(sync): implémentation complète de la synchronisation des tags

**Date:** 2025-10-23
**Hash:** ba2df9ea6b3ab1ade1b6b50ffda693721e8f0eed

**Fichiers (10):**

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

**Commandes:**

```bash
# Voir le commit complet
git show ba2df9e

# Voir les changements dans un fichier spécifique
git show ba2df9e:apps/web/src/App.tsx
```

**Impact:** 10 files changed, 164 insertions(+), 13 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 15. ea71f6e - feat(ui): affichage des tags sur les nœuds de la carte

**Date:** 2025-10-23
**Hash:** ea71f6e0a3ff144cd1f29f64f35e271ff0dfb306

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show ea71f6e

# Voir les changements dans un fichier spécifique
git show ea71f6e:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 39 insertions(+), 8 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 16. e6c87b5 - fix(ui): correction clé unique pour les tags

**Date:** 2025-10-23
**Hash:** e6c87b55f7ca3d569984e03eb8b653cd94b8ecf4

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show e6c87b5

# Voir les changements dans un fichier spécifique
git show e6c87b5:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 2 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 17. 69abee4 - feat(ui): repositionnement des tags sur le bord droit des nœuds

**Date:** 2025-10-23
**Hash:** 69abee4b50dd6c605305e482ba54bfe0ef39d198

**Fichiers (2):**

- `apps/web/src/components/MindMapNode.tsx`
- `apps/web/src/hooks/useReactFlowNodes.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 69abee4

# Voir les changements dans un fichier spécifique
git show 69abee4:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 2 files changed, 49 insertions(+), 33 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 18. eaedf0c - fix(ui): repositionnement des tags sur le bord inférieur centré

**Date:** 2025-10-23
**Hash:** eaedf0cd89375089a031159b52277957e9208d2c

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show eaedf0c

# Voir les changements dans un fichier spécifique
git show eaedf0c:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 7 insertions(+), 7 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 19. 62c999d - fix(ui): alignement précis des tags sur la bordure inférieure

**Date:** 2025-10-23
**Hash:** 62c999dc63a2066efbbc95f25c9775f3d4b50985

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 62c999d

# Voir les changements dans un fichier spécifique
git show 62c999d:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 2 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 20. 6570432 - fix(ui): amélioration du centrage horizontal des tags

**Date:** 2025-10-23
**Hash:** 65704327fd03a09761fa019f3a7f79115aacaad9

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 6570432

# Voir les changements dans un fichier spécifique
git show 6570432:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 5 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 21. 84b81a8 - fix(ui): correction définitive du centrage géométrique des tags

**Date:** 2025-10-23
**Hash:** 84b81a8b4f33f69866c2584756cf246df0378f5c

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 84b81a8

# Voir les changements dans un fichier spécifique
git show 84b81a8:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 6 insertions(+), 4 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 22. fc5c2e7 - fix(ui): affichage complet des tags sans troncature

**Date:** 2025-10-23
**Hash:** fc5c2e748c0ae982344b97e826687b83ce08ec0e

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show fc5c2e7

# Voir les changements dans un fichier spécifique
git show fc5c2e7:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 3 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 23. 2ad5e9a - fix(ui): positionnement précis du milieu vertical des tags sur la bordure

**Date:** 2025-10-23
**Hash:** 2ad5e9ad6455068a0173e1161e9bbecdf828ed06

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 2ad5e9a

# Voir les changements dans un fichier spécifique
git show 2ad5e9a:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 2 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 24. 5c8e921 - feat(ui): descente des tags de 20% de la hauteur du nœud

**Date:** 2025-10-23
**Hash:** 5c8e9211265801c68bdd9389ddc366d23763db62

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 5c8e921

# Voir les changements dans un fichier spécifique
git show 5c8e921:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 2 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 25. f851261 - fix(ui): positionnement cohérent des tags pour tous les nœuds

**Date:** 2025-10-23
**Hash:** f851261acd08788ab7aa783930038066d298ee21

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show f851261

# Voir les changements dans un fichier spécifique
git show f851261:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 2 insertions(+), 8 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 26. 33b169d - fix(ui): empêcher les tags d'agrandir la hauteur du nœud

**Date:** 2025-10-23
**Hash:** 33b169d0e4aca944f5ec4f285beec8d749be9e99

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 33b169d

# Voir les changements dans un fichier spécifique
git show 33b169d:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 8 insertions(+), 7 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 27. d87432e - fix(ui): wrapper hauteur 0 pour empêcher agrandissement du nœud

**Date:** 2025-10-23
**Hash:** d87432ee30552eca937c71ac7f1fccdd668bba32

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show d87432e

# Voir les changements dans un fichier spécifique
git show d87432e:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 39 insertions(+), 28 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 28. 8741f7f - fix(ui): réalignement vertical du tag sur la bordure du nœud

**Date:** 2025-10-23
**Hash:** 8741f7fb931662b8a0070448c12d28d9b2350e0c

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 8741f7f

# Voir les changements dans un fichier spécifique
git show 8741f7f:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 1 insertion(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 29. 1f38451 - feat(ui): descente du centre Y du tag de 20% sous la bordure

**Date:** 2025-10-23
**Hash:** 1f38451f37ecc2b777c53ec49e6c87cebaa1481e

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 1f38451

# Voir les changements dans un fichier spécifique
git show 1f38451:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 1 insertion(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 30. 48dc7f1 - fix(ui): correction positionnement tag à cheval avec valeur pixels

**Date:** 2025-10-23
**Hash:** 48dc7f17d0025df7a8dd63e21bb2abdc622e3c2e

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 48dc7f1

# Voir les changements dans un fichier spécifique
git show 48dc7f1:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 1 insertion(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 31. 152e280 - fix(ui): remontage du tag pour positionnement à cheval correct

**Date:** 2025-10-23
**Hash:** 152e2802c8f5e443375072d8ff535a90ccc3b7e3

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 152e280

# Voir les changements dans un fichier spécifique
git show 152e280:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 1 insertion(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 32. afed6f3 - feat(ui): ajout bouton + dans l'en-tête du panneau Tags & Calques

**Date:** 2025-10-23
**Hash:** afed6f3f147e0ab3972a6d63bd51c289025ae96b

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show afed6f3

# Voir les changements dans un fichier spécifique
git show afed6f3:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 10 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 33. dad1af9 - feat: enhance tag display and drag-drop on mind map

**Date:** 2025-10-23
**Hash:** dad1af97ac5c38eab02a0febae2321f2daa5a971

**Fichiers (66):**

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
- ... et 56 autres

**Commandes:**

```bash
# Voir le commit complet
git show dad1af9

# Voir les changements dans un fichier spécifique
git show dad1af9:apps/web/src/App.tsx
```

**Impact:** 66 files changed, 3658 insertions(+), 3597 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 34. 5bc52ed - refactor: consolidate tag creation logic into shared utility function

**Date:** 2025-10-23
**Hash:** 5bc52ed2f673933cb5527ac7c56e578b83f7e80e

**Fichiers (3):**

- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/utils/tagUtils.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 5bc52ed

# Voir les changements dans un fichier spécifique
git show 5bc52ed:apps/web/src/components/NodeTagPanel.tsx
```

**Impact:** 3 files changed, 221 insertions(+), 44 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 35. 7689f5c - fix: ensure parent property is omitted when tag has no parent

**Date:** 2025-10-23
**Hash:** 7689f5c76a3b5108de71f2bd2411838dfd40147b

**Fichiers (1):**

- `apps/web/src/utils/tagUtils.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 7689f5c

# Voir les changements dans un fichier spécifique
git show 7689f5c:apps/web/src/utils/tagUtils.ts
```

**Impact:** 1 file changed, 9 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 36. 5ae7784 - fix: sync DAG panel when tag is created via context menu

**Date:** 2025-10-23
**Hash:** 5ae7784f5ca1cdf31369b9166240a52824151965

**Fichiers (2):**

- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 5ae7784

# Voir les changements dans un fichier spécifique
git show 5ae7784:apps/web/src/components/NodeTagPanel.tsx
```

**Impact:** 2 files changed, 22 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 37. ddf83df - style: update create tag button to use accent color

**Date:** 2025-10-23
**Hash:** ddf83df3ff07da764e6fea9e3945f9ac8c2d7f34

**Fichiers (1):**

- `apps/web/src/components/NodeTagPanel.css`

**Commandes:**

```bash
# Voir le commit complet
git show ddf83df

# Voir les changements dans un fichier spécifique
git show ddf83df:apps/web/src/components/NodeTagPanel.css
```

**Impact:** 1 file changed, 5 insertions(+), 6 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 38. 15a2310 - style: update tag panel buttons to match settings button style

**Date:** 2025-10-23
**Hash:** 15a2310a749a7ca1cb4c12f8c4e61f1b4b2009f4

**Fichiers (1):**

- `apps/web/src/components/NodeTagPanel.css`

**Commandes:**

```bash
# Voir le commit complet
git show 15a2310

# Voir les changements dans un fichier spécifique
git show 15a2310:apps/web/src/components/NodeTagPanel.css
```

**Impact:** 1 file changed, 31 insertions(+), 12 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 39. 204b7f4 - style: update add tag button to match accent color button style

**Date:** 2025-10-23
**Hash:** 204b7f41e282727bf529083f0de33d347496264d

**Fichiers (1):**

- `apps/web/src/components/TagInputWithParent.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 204b7f4

# Voir les changements dans un fichier spécifique
git show 204b7f4:apps/web/src/components/TagInputWithParent.tsx
```

**Impact:** 1 file changed, 15 insertions(+), 6 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 40. c9c6043 - style: add icon to create button inside tag dropdown menu

**Date:** 2025-10-23
**Hash:** c9c60435f8110e6d288d4fe130472c64ffe016da

**Fichiers (2):**

- `apps/web/src/components/NodeTagPanel.css`
- `apps/web/src/components/NodeTagPanel.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show c9c6043

# Voir les changements dans un fichier spécifique
git show c9c6043:apps/web/src/components/NodeTagPanel.css
```

**Impact:** 2 files changed, 5 insertions(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 41. c4269c7 - debug: add logging to track tag creation flow

**Date:** 2025-10-23
**Hash:** c4269c7f328e4a4a38350507361ba6f296a14b3c

**Fichiers (2):**

- `apps/web/src/components/NodeTagPanel.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show c4269c7

# Voir les changements dans un fichier spécifique
git show c4269c7:apps/web/src/components/NodeTagPanel.tsx
```

**Impact:** 2 files changed, 8 insertions(+), 5 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 42. 564fae0 - debug: add detailed logging in createAndAssociateTag

**Date:** 2025-10-23
**Hash:** 564fae00398befcabc9ebc844f8a55492ad39171

**Fichiers (1):**

- `apps/web/src/utils/tagUtils.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 564fae0

# Voir les changements dans un fichier spécifique
git show 564fae0:apps/web/src/utils/tagUtils.ts
```

**Impact:** 1 file changed, 9 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 43. 4d2409c - fix: preserve tags created via UI when syncing from mindmap

**Date:** 2025-10-23
**Hash:** 4d2409cc0aa18d7d9c5c3a1bd3cfc844eb32fadd

**Fichiers (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 4d2409c

# Voir les changements dans un fichier spécifique
git show 4d2409c:apps/web/src/hooks/useTagGraph.ts
```

**Impact:** 1 file changed, 14 insertions(+), 12 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 44. f39ccd7 - debug: add comprehensive logging for tag creation in DAG panel

**Date:** 2025-10-23
**Hash:** f39ccd791a6ada797858bd63e6a322b2cb063aba

**Fichiers (10):**

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

**Commandes:**

```bash
# Voir le commit complet
git show f39ccd7

# Voir les changements dans un fichier spécifique
git show f39ccd7:apps/web/src/App.tsx
```

**Impact:** 10 files changed, 269 insertions(+), 59 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 45. 1fdaffb - fix: ensure tags created via MindMapCanvas are added to DAG store

**Date:** 2025-10-23
**Hash:** 1fdaffba3392a641eb4090a8ab18543ed96322f0

**Fichiers (1):**

- `apps/web/src/components/MindMapCanvas.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 1fdaffb

# Voir les changements dans un fichier spécifique
git show 1fdaffb:apps/web/src/components/MindMapCanvas.tsx
```

**Impact:** 1 file changed, 13 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 46. ee6c03b - refactor: use blue as default color for all tags

**Date:** 2025-10-23
**Hash:** ee6c03b93e77270cfd05f6020e42bbe6e94df1c9

**Fichiers (1):**

- `apps/web/src/utils/tagUtils.ts`

**Commandes:**

```bash
# Voir le commit complet
git show ee6c03b

# Voir les changements dans un fichier spécifique
git show ee6c03b:apps/web/src/utils/tagUtils.ts
```

**Impact:** 1 file changed, 5 insertions(+), 4 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 47. 8c136ca - feat: add drag and drop phantom for tag hierarchy

**Date:** 2025-10-23
**Hash:** 8c136ca954905dbfe926e5e80b0fc229d8e9b311

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 8c136ca

# Voir les changements dans un fichier spécifique
git show 8c136ca:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 32 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 48. 9a2fc98 - feat: improve tag drag phantom and add refresh button

**Date:** 2025-10-23
**Hash:** 9a2fc985364ee3963066a2dfc483b009f742c684

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 9a2fc98

# Voir les changements dans un fichier spécifique
git show 9a2fc98:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 58 insertions(+), 29 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 49. d718620 - fix: keep exact label when copying tags in hierarchy

**Date:** 2025-10-23
**Hash:** d718620353dbc5a5e8c67b77007b13269a12d566

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show d718620

# Voir les changements dans un fichier spécifique
git show d718620:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 1 insertion(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 50. fcbec4f - feat: add single/double-click actions for tags in hierarchy

**Date:** 2025-10-23
**Hash:** fcbec4f08f3a8b404bd5ef02a8019cd77f06f868

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show fcbec4f

# Voir les changements dans un fichier spécifique
git show fcbec4f:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 62 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 51. ae4b617 - style: reduce font size for inline tag edit input

**Date:** 2025-10-23
**Hash:** ae4b61739419638445c78dac3408f3394aa2bf8f

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show ae4b617

# Voir les changements dans un fichier spécifique
git show ae4b617:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 1 insertion(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 52. 37376ee - feat: centralize tag labels from DAG store in MindMapNode

**Date:** 2025-10-23
**Hash:** 37376eea2f72fecab9b27eebaf98a2992591b72f

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 37376ee

# Voir les changements dans un fichier spécifique
git show 37376ee:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 11 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 53. 43f9f51 - feat: centralize tag colors from DAG store in MindMapNode

**Date:** 2025-10-23
**Hash:** 43f9f5176c416909de372e49617a69370e162e45

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 43f9f51

# Voir les changements dans un fichier spécifique
git show 43f9f51:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 8 insertions(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 54. 58c89fe - feat: add color picker and smart visibility toggle for tags

**Date:** 2025-10-23
**Hash:** 58c89fe3304d293ebafacec9af234b3aef3faf1d

**Fichiers (2):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/types/dag.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 58c89fe

# Voir les changements dans un fichier spécifique
git show 58c89fe:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 2 files changed, 110 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 55. 5c36134 - fix: remove duplicate getDescendants function declaration

**Date:** 2025-10-23
**Hash:** 5c361344dbbe293123fc987578eff080343dca56

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanelDAG.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 5c36134

# Voir les changements dans un fichier spécifique
git show 5c36134:apps/web/src/components/TagLayersPanelDAG.tsx
```

**Impact:** 1 file changed, 16 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 56. 7cf8931 - feat: implement Edit menu with context-aware actions

**Date:** 2025-10-23
**Hash:** 7cf8931f3386243618d8c684f7c956362f6aa96b

**Fichiers (4):**

- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/components/MindMapCanvas.tsx`
- `apps/web/src/components/TagLayersPanelDAG.tsx`
- `apps/web/src/hooks/useEditMenuContext.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 7cf8931

# Voir les changements dans un fichier spécifique
git show 7cf8931:apps/web/src/components/MenuBar.tsx
```

**Impact:** 4 files changed, 129 insertions(+), 3 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 57. d9c251d - feat: enhance Edit menu with tag copy/paste support

**Date:** 2025-10-23
**Hash:** d9c251db1abd2ced72f68d2adb9f91db0944e2f7

**Fichiers (1):**

- `apps/web/src/components/MenuBar.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show d9c251d

# Voir les changements dans un fichier spécifique
git show d9c251d:apps/web/src/components/MenuBar.tsx
```

**Impact:** 1 file changed, 57 insertions(+), 17 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 58. 7ec3dd6 - fix: persist and restore tags in file save/load

**Date:** 2025-10-23
**Hash:** 7ec3dd6f5b095544369f2fa2d084da78c6f6aefe

**Fichiers (1):**

- `apps/web/src/hooks/useFileOperations.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 7ec3dd6

# Voir les changements dans un fichier spécifique
git show 7ec3dd6:apps/web/src/hooks/useFileOperations.ts
```

**Impact:** 1 file changed, 25 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 59. 6809738 - feat: implement comprehensive data persistence for BigMind

**Date:** 2025-10-23
**Hash:** 6809738c85211658165c35698dac94675513b0d9

**Fichiers (1):**

- `apps/web/src/hooks/useFileOperations.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 6809738

# Voir les changements dans un fichier spécifique
git show 6809738:apps/web/src/hooks/useFileOperations.ts
```

**Impact:** 1 file changed, 187 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 60. 04b9e13 - fix: correct store access in file export - fix bigmind.json save issue

**Date:** 2025-10-23
**Hash:** 04b9e13895aa80f6599ec4d8c514d154fc1b200d

**Fichiers (3):**

- `apps/web/src/hooks/useAssets.ts`
- `apps/web/src/hooks/useFileOperations.ts`
- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 04b9e13

# Voir les changements dans un fichier spécifique
git show 04b9e13:apps/web/src/hooks/useAssets.ts
```

**Impact:** 3 files changed, 20 insertions(+), 9 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 61. af2a230 - fix: properly save and restore node tags in bigmind.json

**Date:** 2025-10-23
**Hash:** af2a230182e8738b9a8e3ceb82b997964816fb31

**Fichiers (1):**

- `apps/web/src/hooks/useFileOperations.ts`

**Commandes:**

```bash
# Voir le commit complet
git show af2a230

# Voir les changements dans un fichier spécifique
git show af2a230:apps/web/src/hooks/useFileOperations.ts
```

**Impact:** 1 file changed, 11 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 62. 10dfba6 - fix: enable sidebar scrolling to show all content including tags

**Date:** 2025-10-23
**Hash:** 10dfba6e663277e7efa6231a17e64272a7034a2d

**Fichiers (3):**

- `apps/web/src/App.css`
- `apps/web/src/components/NodeProperties.css`
- `apps/web/src/components/Sidebar.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 10dfba6

# Voir les changements dans un fichier spécifique
git show 10dfba6:apps/web/src/App.css
```

**Impact:** 3 files changed, 31 insertions(+), 34 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 63. 1cc53da - fix: remove tag from node when deleted in tag hierarchy

**Date:** 2025-10-23
**Hash:** 1cc53daff67c08d9281971d9b7c6dcc6484a0dfb

**Fichiers (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 1cc53da

# Voir les changements dans un fichier spécifique
git show 1cc53da:apps/web/src/hooks/useTagGraph.ts
```

**Impact:** 1 file changed, 21 insertions(+)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 64. 7d08e5e - fix: properly remove tags from nodes when deleting from hierarchy

**Date:** 2025-10-23
**Hash:** 7d08e5e0dc0d73973264bb979c6021322aa862e4

**Fichiers (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 7d08e5e

# Voir les changements dans un fichier spécifique
git show 7d08e5e:apps/web/src/hooks/useTagGraph.ts
```

**Impact:** 1 file changed, 8 insertions(+), 6 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 65. a8125e7 - refactor: simplify deleteTagWithSync to only modify store

**Date:** 2025-10-23
**Hash:** a8125e7576b78cd12d469289b9a296f0a5a9e3a2

**Fichiers (1):**

- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show a8125e7

# Voir les changements dans un fichier spécifique
git show a8125e7:apps/web/src/hooks/useTagGraph.ts
```

**Impact:** 1 file changed, 3 insertions(+), 23 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 66. fdc3512 - refactor: add centralized tag reader helper in TagLayersPanel

**Date:** 2025-10-23
**Hash:** fdc3512819c959e2492ff33724b4d59e4d4ff747

**Fichiers (1):**

- `apps/web/src/components/TagLayersPanel.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show fdc3512

# Voir les changements dans un fichier spécifique
git show fdc3512:apps/web/src/components/TagLayersPanel.tsx
```

**Impact:** 1 file changed, 8 insertions(+), 3 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 67. f4d91d8 - refactor: centralize tag modifications through useNodeTagsStore

**Date:** 2025-10-23
**Hash:** f4d91d826c0350520543911c5b3f9aa7910a1a85

**Fichiers (2):**

- `apps/web/src/components/TagLayersPanel.tsx`
- `apps/web/src/hooks/useNodeTags.ts`

**Commandes:**

```bash
# Voir le commit complet
git show f4d91d8

# Voir les changements dans un fichier spécifique
git show f4d91d8:apps/web/src/components/TagLayersPanel.tsx
```

**Impact:** 2 files changed, 30 insertions(+), 6 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 68. 4efae27 - fix: MindMapNode reads tags from useNodeTagsStore instead of props

**Date:** 2025-10-23
**Hash:** 4efae279c65d35d35a3bf5850b2f052b48aa72a1

**Fichiers (1):**

- `apps/web/src/components/MindMapNode.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 4efae27

# Voir les changements dans un fichier spécifique
git show 4efae27:apps/web/src/components/MindMapNode.tsx
```

**Impact:** 1 file changed, 4 insertions(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 69. 1fd9740 - refactor: complete centralization of tag data - single source of truth

**Date:** 2025-10-23
**Hash:** 1fd9740615f21827d67c6a4a547b78af4e70c99b

**Fichiers (0):**

**Commandes:**

```bash
# Voir le commit complet
git show 1fd9740

# Voir les changements dans un fichier spécifique
```

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 70. fc270d6 - refactor: unify tag addition through addTagToNodeSync

**Date:** 2025-10-23
**Hash:** fc270d66cc7197d0e4e84887f9484e0532ddf493

**Fichiers (2):**

- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show fc270d6

# Voir les changements dans un fichier spécifique
git show fc270d6:apps/web/src/components/MenuBar.tsx
```

**Impact:** 2 files changed, 10 insertions(+), 2 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 71. 5123b7e - refactor: unify tag addition - both paths use sync.tagNode()

**Date:** 2025-10-23
**Hash:** 5123b7e52a193a99b78e24cf1b8f9bccba35599d

**Fichiers (2):**

- `apps/web/src/components/MenuBar.tsx`
- `apps/web/src/hooks/useTagGraph.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 5123b7e

# Voir les changements dans un fichier spécifique
git show 5123b7e:apps/web/src/components/MenuBar.tsx
```

**Impact:** 2 files changed, 19 insertions(+), 4 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 72. 6d9a969 - refactor: unify tag operations in NodeContextMenu - use centralized sync functions

**Date:** 2025-10-23
**Hash:** 6d9a9699d5cf1e8cb43108a1f79d30aca24f6783

**Fichiers (1):**

- `apps/web/src/components/MindMapCanvas.tsx`

**Commandes:**

```bash
# Voir le commit complet
git show 6d9a969

# Voir les changements dans un fichier spécifique
git show 6d9a969:apps/web/src/components/MindMapCanvas.tsx
```

**Impact:** 1 file changed, 11 insertions(+), 29 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 73. 4a05c39 - fix: résoudre le problème d'invisibilité des nœuds nouvellement créés

**Date:** 2025-10-25
**Hash:** 4a05c393c8bf137aee235734cc87e436f28f4da1

**Fichiers (3):**

- `apps/web/src/hooks/useOpenFiles.ts`
- `apps/web/src/hooks/useReactFlowNodes.ts`
- `packages/core/src/commands.ts`

**Commandes:**

```bash
# Voir le commit complet
git show 4a05c39

# Voir les changements dans un fichier spécifique
git show 4a05c39:apps/web/src/hooks/useOpenFiles.ts
```

**Impact:** 3 files changed, 69 insertions(+), 9 deletions(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 74. a6fbac2 - chore: initialize feat/tags-clean branch - clean starting point without node repositioning

**Date:** 2025-10-25
**Hash:** a6fbac26fbff8cf0e7182da11c4b81ac9f031e20

**Fichiers (0):**

**Commandes:**

```bash
# Voir le commit complet
git show a6fbac2

# Voir les changements dans un fichier spécifique
```

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 75. d0c8232 - index on feat/tags-clean: a6fbac2 chore: initialize feat/tags-clean branch - clean starting point without node repositioning

**Date:** 2025-10-25
**Hash:** d0c823253387d9b2e9afe57c1925a685113ae003

**Fichiers (0):**

**Commandes:**

```bash
# Voir le commit complet
git show d0c8232

# Voir les changements dans un fichier spécifique
```

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---

## 76. 63a1fab - WIP on feat/tags-clean: a6fbac2 chore: initialize feat/tags-clean branch - clean starting point without node repositioning

**Date:** 2025-10-25
**Hash:** 63a1fabbd61983348b29456362565ef557650c0a

**Fichiers (0):**

**Commandes:**

```bash
# Voir le commit complet
git show 63a1fab

# Voir les changements dans un fichier spécifique
```

**Impact:** 3 files changed, 13 insertions(+), 1 deletion(-)

**Checklist:**

- [ ] Code extrait et analysé
- [ ] Modifications appliquées
- [ ] Tests passent
- [ ] Commit créé

---
