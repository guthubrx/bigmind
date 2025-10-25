# PLAN D'ACTION EXHAUSTIF - RÉIMPLÉMENTATION TAGS

**Date:** 2025-10-25
**Basé sur:** Analyse de 76 commits (v0.1.3 → feat/tags-clean)
**Objectif:** Redévelopper le système de tags complet, fonction par fonction

---

## MÉTHODOLOGIE

### Principe de réimplémentation

1. **Ordre strict:** Suivre l'ordre chronologique des phases
2. **Dépendances:** Respecter les dépendances entre commits
3. **Tests:** Tester chaque fonction avant de passer à la suivante
4. **Validation:** Vérifier que tout fonctionne avant d'ajouter la suite

### Structure du plan

Chaque phase contient:

- **Objectif:** Ce que cette phase doit accomplir
- **Commits:** Liste des commits dans l'ordre d'implémentation
- **Ordre strict:** Numérotation exacte pour l'implémentation
- **Dépendances bloquantes:** Ce qui doit être fait avant
- **Tests requis:** Ce qu'il faut vérifier
- **Fichiers impactés:** Liste complète des fichiers à modifier/créer

---

## STATISTIQUES GLOBALES

- **Total commits:** 76
- **Fichiers modifiés:** 154
- **Lignes ajoutées:** 40,104
- **Lignes supprimées:** 6,367
- **Net:** +33,737 lignes

### Répartition par type

- **fix:** 32 commits (42%)
- **feature:** 21 commits (28%)
- **refactor:** 9 commits (12%)
- **debug:** 6 commits (8%)
- **style:** 5 commits (7%)
- **other:** 2 commits (3%)
- **chore:** 1 commit (1%)

---

## PHASE 1: FOUNDATION - SYSTÈME DAG

**Commits:** 1 | **Priorité:** CRITIQUE | **Dépendances:** Aucune

### Objectif

Créer la base complète du système de tags avec DAG (Directed Acyclic Graph) sémantique.
C'est la fondation sur laquelle tout le reste repose.

### Commits dans l'ordre

#### 1.1 - f9390bc - feat(dag): implémentation complète du système DAG sémantique pour les tags

**Date:** 2025-10-22 19:41:58
**Type:** feature
**Hash complet:** f9390bc22548912552179e0706090997b650b1e7

**Description complète:**

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

**Fichiers créés (nouveaux):**

1. `apps/web/src/components/TagGraph.tsx` - Visualisation D3.js du DAG
2. `apps/web/src/components/TagLayersPanel.css` - Styles pour panneau tags
3. `apps/web/src/components/TagLayersPanel.tsx` - Panneau principal tags/calques
4. `apps/web/src/components/TagLayersPanelDAG.css` - Styles pour vue DAG
5. `apps/web/src/components/TagLayersPanelDAG.tsx` - Composant vue DAG
6. `apps/web/src/components/StickerPicker.tsx` - Sélecteur de stickers
7. `apps/web/src/components/TemplateGallery.tsx` - Galerie de templates
8. `apps/web/src/components/ThemeSelector.tsx` - Sélecteur de thèmes
9. `apps/web/src/components/dialogs/InsertImageDialog.tsx` - Dialog insertion image
10. `apps/web/src/components/dialogs/InsertStickerDialog.tsx` - Dialog insertion sticker
11. `apps/web/src/data/tags.json` - Données de test pour tags
12. `apps/web/src/hooks/useTagGraph.ts` - Hook gestion graphe tags
13. `apps/web/src/hooks/useTagLayers.ts` - Hook gestion calques tags
14. `apps/web/src/hooks/useTemplates.ts` - Hook gestion templates
15. `apps/web/src/hooks/useThemes.ts` - Hook gestion thèmes
16. `apps/web/src/types/dag.ts` - Types TypeScript pour DAG
17. `apps/web/src/utils/shortcutUtils.ts` - Utilitaires raccourcis clavier
18. `apps/web/src/pages/SettingsAppearanceSection.tsx` - Section apparence settings
19. `apps/web/src/pages/SettingsInteractionSection.tsx` - Section interaction settings
20. `apps/web/src/pages/SettingsShortcutsSection.tsx` - Section raccourcis settings

**Fichiers modifiés (existants):**

1. `apps/web/package.json` - Ajout dépendances (d3, d3-dag, etc.)
2. `apps/web/src/App.css` - Styles globaux
3. `apps/web/src/components/MindMapCanvas.tsx` - Intégration tags dans canvas
4. `apps/web/src/components/MindMapNode.tsx` - Support tags dans nœuds
5. `apps/web/src/components/NodeContextMenu.tsx` - Menu contextuel avec tags
6. `apps/web/src/components/NodeProperties.css` - Styles propriétés nœuds
7. `apps/web/src/components/NodeProperties.tsx` - Panneau propriétés avec tags
8. `apps/web/src/components/Sidebar.tsx` - Intégration panneau tags
9. `apps/web/src/hooks/useMindmap.ts` - Support tags dans mindmap
10. `apps/web/src/hooks/useOpenFiles.ts` - Gestion fichiers avec tags
11. `apps/web/src/hooks/useReactFlowNodes.ts` - Nœuds ReactFlow avec tags
12. `apps/web/src/layouts/MainLayout.css` - Layout pour tags
13. `apps/web/src/layouts/MainLayout.tsx` - Layout principal
14. `apps/web/src/pages/Settings.css` - Styles settings
15. `apps/web/src/pages/Settings.tsx` - Page settings

**Dépendances npm à installer:**

```bash
pnpm add d3 d3-dag @types/d3 @types/d3-dag
```

**Structure de données (types/dag.ts):**

```typescript
export interface Tag {
  id: string;
  label: string;
  color: string;
  parents?: string[]; // IDs des parents
  relationTypes?: { [parentId: string]: 'is-type-of' | 'is-related-to' | 'is-part-of' };
}

export interface DAGNode {
  id: string;
  tag: Tag;
  children: DAGNode[];
  parents: DAGNode[];
}
```

**Store Zustand (useTagLayers.ts):**

- État: tags, selectedTag, viewMode ('hierarchy' | 'graph')
- Actions: addTag, updateTag, deleteTag, addRelation, removeRelation, detectCycles
- Persistence: localStorage

**Tests requis:**

- [ ] Créer un tag simple
- [ ] Créer une hiérarchie parent-enfant
- [ ] Créer des multi-parents
- [ ] Vérifier détection de cycles
- [ ] Tester les 3 types de relations
- [ ] Basculer entre vue liste et graphe
- [ ] Drag & drop pour réorganiser
- [ ] Shift+clic pour créer des liens
- [ ] Zoom/pan dans le graphe
- [ ] Persistence dans localStorage

**Dépendances bloquantes:** Aucune (commit fondateur)

**Bloque les phases suivantes:** Toutes les autres phases dépendent de celle-ci

---

## PHASE 2: SYNCHRONISATION MINDMAP-DAG

**Commits:** 28 | **Priorité:** CRITIQUE | **Dépendances:** Phase 1

### Objectif

Établir la synchronisation bidirectionnelle entre la MindMap et le panneau DAG des tags.
Les modifications dans l'un doivent se refléter dans l'autre en temps réel.

### Commits dans l'ordre

#### 2.1 - 9c10440 - feat: implement dynamic DAG-MindMap synchronization

**Date:** 2025-10-22 20:06:29
**Hash:** 9c104405fc1923dec9e3b0be31d7796091003022

**Description:**

- Synchronisation dynamique entre DAG et MindMap
- Listener sur changements de la carte active
- Mise à jour automatique du panneau tags

**Fichiers modifiés:**

- `apps/web/src/hooks/useTagLayers.ts`
- `apps/web/src/components/TagLayersPanel.tsx`
- `apps/web/src/hooks/useMindmap.ts`

**Implémentation:**

1. Ajouter event emitter dans useMindmap
2. Créer listener dans useTagLayers
3. Synchroniser tags quand la carte change

**Tests:**

- [ ] Ouvrir une carte → tags se chargent
- [ ] Changer de carte → tags se mettent à jour
- [ ] Fermer carte → tags se vident

**Dépendances:** Phase 1 complète

---

#### 2.2 - 02dcc3a - fix: remove sample data from DAG and sync with active map

**Date:** 2025-10-22 20:11:45
**Hash:** 02dcc3afaf467d32084b538835f1a8bb43140d21

**Description:**

- Retrait des données de test
- Utilisation des vraies données de la carte active
- Nettoyage du store

**Fichiers modifiés:**

- `apps/web/src/data/tags.json` (vider)
- `apps/web/src/hooks/useTagLayers.ts`

**Tests:**

- [ ] Aucune donnée de test au démarrage
- [ ] Tags proviennent uniquement de la carte

---

#### 2.3 - 143551a - fix: correct import path casing for useMindmap

**Date:** 2025-10-22 20:14:15
**Hash:** 143551a32c9e61b9d5a334e56833fef4e884c975

**Description:**

- Correction casse import useMindmap
- Fix erreur module not found

**Fichiers modifiés:**

- Fichiers avec imports useMindmap

**Tests:**

- [ ] Pas d'erreur de compilation
- [ ] Imports fonctionnent

---

#### 2.4 - 2cc5bd7 - feat: implement real-time tag synchronization between MindMap and DAG

**Date:** 2025-10-22 20:21:23
**Hash:** 2cc5bd709675c5be358c2aa8f897545d82fbf27f

**Description:**

- Synchronisation temps réel
- Event system pour propagation
- Mise à jour bidirectionnelle

**Fichiers modifiés:**

- `apps/web/src/hooks/useMindmap.ts`
- `apps/web/src/hooks/useTagLayers.ts`

**Implémentation:**

```typescript
// Dans useMindmap
const emitTagsChanged = () => {
  window.dispatchEvent(
    new CustomEvent('mindmap:tags-changed', {
      detail: { tags: getCurrentTags() },
    })
  );
};

// Dans useTagLayers
useEffect(() => {
  const handleTagsChanged = (e: CustomEvent) => {
    setTags(e.detail.tags);
  };
  window.addEventListener('mindmap:tags-changed', handleTagsChanged);
  return () => window.removeEventListener('mindmap:tags-changed', handleTagsChanged);
}, []);
```

**Tests:**

- [ ] Ajouter tag dans MindMap → apparaît dans DAG
- [ ] Modifier tag dans DAG → se met à jour dans MindMap
- [ ] Supprimer tag → disparaît des deux côtés

---

#### 2.5 - bd80777 - feat: ensure tag synchronization is always active

**Date:** 2025-10-22 20:22:31
**Hash:** bd8077708fe3be65b03be04aaa921116b4d0b00a

**Description:**

- Garantir que la sync est toujours active
- Pas de condition qui la désactive

**Fichiers modifiés:**

- `apps/web/src/hooks/useTagLayers.ts`

**Tests:**

- [ ] Sync fonctionne dans tous les cas

---

#### 2.6 - ff436ab - debug: add extensive logging for tag synchronization

**Date:** 2025-10-22 20:26:11
**Hash:** ff436ab37e316aa2a523f6f69cf47c64c61b37a6

**Description:**

- Ajout logs debug pour tracer la sync
- Console.log à chaque étape

**Fichiers modifiés:**

- `apps/web/src/hooks/useTagLayers.ts`
- `apps/web/src/hooks/useMindmap.ts`

**Note:** Ces logs seront retirés plus tard (commits debug)

---

#### 2.7 - f95d337 - debug: add more logging to track tag panel updates

**Date:** 2025-10-22 20:27:04
**Hash:** f95d3373ee01d28965884f15dce25c72e763cf7f

**Fichiers modifiés:**

- `apps/web/src/components/TagLayersPanel.tsx`

---

#### 2.8 - f6d6b2d - debug: add direct event test button and improve logging

**Date:** 2025-10-22 20:28:04
**Hash:** f6d6b2dfd23f63387aee3d46722bfb3d4beb955f

**Description:**

- Bouton de test pour déclencher events manuellement
- Aide au debugging

**Fichiers modifiés:**

- `apps/web/src/components/TagLayersPanel.tsx`

---

#### 2.9 - 52ec3f8 - fix: resolve tag synchronization issues

**Date:** 2025-10-22 20:33:07
**Hash:** 52ec3f8703bd716e8507d01f3f16c3799a13fdd7

**Description:**

- Correction problèmes de sync
- Fix race conditions
- Meilleure gestion du lifecycle

**Fichiers modifiés:**

- `apps/web/src/hooks/useTagLayers.ts`
- `apps/web/src/hooks/useMindmap.ts`

**Tests:**

- [ ] Pas de perte de données
- [ ] Pas de duplications
- [ ] Sync cohérente

---

#### 2.10 - c2c73af - fix: always show tags panel regardless of map state

**Date:** 2025-10-22 20:37:14
**Hash:** c2c73afcd4568ea71a7a20e1b23c61902e508af9

**Description:**

- Panneau tags toujours visible
- Même sans carte ouverte

**Fichiers modifiés:**

- `apps/web/src/components/Sidebar.tsx`

---

#### 2.11 - 554c75c - fix: synchroniser les tags uniquement avec la carte active

**Date:** 2025-10-22 20:48:14
**Hash:** 554c75cf88141f5e5d1d8fda6905366bdb4920d8

**Description:**

- Ne sync que la carte active
- Éviter confusion multi-cartes

**Fichiers modifiés:**

- `apps/web/src/hooks/useTagLayers.ts`

**Tests:**

- [ ] Ouvrir plusieurs cartes
- [ ] Vérifier que seule la carte active est synchronisée

---

### Commits 2.12 à 2.28 (debug et sync avancée)

Les 17 commits restants de cette phase sont principalement:

- Des commits de debug (logging)
- Des fixes de synchronisation
- Des ajustements de timing
- Des corrections de bugs de sync

Je vais les documenter de manière groupée dans le rapport complet.

**Tests globaux Phase 2:**

- [ ] Sync bidirectionnelle fonctionne
- [ ] Temps réel sans lag
- [ ] Pas de perte de données
- [ ] Gestion multi-cartes correcte
- [ ] Pas de race conditions

---

## PHASE 3: AFFICHAGE UI DES TAGS

**Commits:** 10 | **Priorité:** HAUTE | **Dépendances:** Phase 1, Phase 2

### Objectif

Afficher visuellement les tags sur les nœuds de la MindMap.

### Commits dans l'ordre

#### 3.1 - ea71f6e - feat(ui): affichage des tags sur les nœuds de la carte

**Date:** 2025-10-23 05:35:00
**Hash:** ea71f6e0a3ff144cd1f29f64f35e271ff0dfb306

**Description:**

- Rendu visuel des tags sur chaque nœud
- Affichage du label
- Couleur du tag

**Fichiers modifiés:**

- `apps/web/src/components/MindMapNode.tsx`

**Implémentation:**

```typescript
// Dans MindMapNode.tsx
{node.tags?.map(tag => (
  <div
    key={tag}
    className="tag-badge"
    style={{
      backgroundColor: getTagColor(tag),
      position: 'absolute',
      // ... positionnement
    }}
  >
    {getTagLabel(tag)}
  </div>
))}
```

**Tests:**

- [ ] Tags apparaissent sur les nœuds
- [ ] Couleur correcte
- [ ] Label lisible

---

### Commits 3.2 à 3.10 (suite affichage)

Les 9 commits suivants traitent de:

- Clés uniques React (e6c87b5)
- Positionnement initial (69abee4)
- Corrections d'affichage
- Ajustements visuels

Documentés en détail dans le rapport exhaustif.

---

## PHASE 4: POSITIONNEMENT VISUEL

**Commits:** 13 | **Priorité:** HAUTE | **Dépendances:** Phase 3

### Objectif

Positionner précisément les tags sur les nœuds (border, centered, etc.)

### Liste des commits (résumé)

1. **eaedf0c** - Repositionnement bord inférieur centré
2. **62c999d** - Alignement précis bordure inférieure
3. **6570432** - Amélioration centrage horizontal
4. **84b81a8** - Correction définitive centrage géométrique
5. **fc5c2e7** - Affichage complet sans troncature
6. **2ad5e9a** - Positionnement précis milieu vertical
7. **5c8e921** - Descente 20% hauteur nœud
8. **f851261** - Positionnement cohérent tous nœuds
9. **33b169d** - Empêcher tags d'agrandir hauteur
10. **d87432e** - Wrapper hauteur 0
11. **8741f7f** - Réalignement vertical bordure
12. **1f38451** - Descente centre Y 20% sous bordure
13. **48dc7f1** - Correction positionnement à cheval pixels
14. **152e280** - Remontage tag positionnement à cheval

**Implémentation finale (après tous les commits):**

```typescript
// Position finale optimale
<div
  className="tags-container"
  style={{
    position: 'absolute',
    bottom: '-8px',  // 8px sous la bordure
    left: '50%',
    transform: 'translate(-50%, 50%)',  // Centré horizontalement, 50% à cheval
    display: 'flex',
    gap: '4px',
    height: 0,  // Ne pas agrandir le nœud
    overflow: 'visible',
    pointerEvents: 'none'
  }}
>
  {/* tags */}
</div>
```

**Tests:**

- [ ] Tags centrés horizontalement
- [ ] Tags à cheval sur bordure inférieure (50/50)
- [ ] Pas d'agrandissement du nœud
- [ ] Cohérent sur tous les types de nœuds

---

## PHASE 5: AMÉLIORATIONS UI & STYLING

**Commits:** 9 | **Priorité:** MOYENNE | **Dépendances:** Phase 4

### Liste des commits

1. **afed6f3** - Bouton + dans en-tête panneau
2. **dad1af9** - Enhance tag display et drag-drop
3. **5bc52ed** - Consolidate tag creation logic
4. **7689f5c** - Ensure parent property omitted si no parent
5. **5ae7784** - Sync DAG panel quand tag créé via context menu
6. **ddf83df** - Update create tag button accent color
7. **15a2310** - Update tag panel buttons style
8. **204b7f4** - Update add tag button accent color
9. **c9c6043** - Add icon to create button

**Focus:** Styling, boutons, icônes, UX

---

## PHASE 6: CRÉATION DE TAGS & UTILITAIRES

**Commits:** 3 | **Priorité:** HAUTE | **Dépendances:** Phase 5

### Commits

1. **c4269c7** - debug: add logging to track tag creation flow
2. **564fae0** - debug: add detailed logging in createAndAssociateTag
3. **4d2409c** - fix: preserve tags created via UI when syncing

**Focus:** Fonction de création de tags robuste

---

## PHASE 7: CENTRALISATION STORE

**Commits:** 3 | **Priorité:** CRITIQUE | **Dépendances:** Phase 6

### Commits

1. **f39ccd7** - debug: comprehensive logging tag creation DAG panel
2. **1fdaffb** - fix: ensure tags created via MindMapCanvas added to DAG store
3. **ee6c03b** - refactor: use blue as default color

**Focus:** Store unique, source de vérité unique

---

## PHASE 8: MENUS & INTERACTIONS

**Commits:** 1 | **Priorité:** MOYENNE

### Commits

1. **fcbec4f** - feat: add single/double-click actions tags hierarchy
2. **d718620** - fix: keep exact label when copying
3. **9a2fc98** - feat: improve drag phantom + refresh button
4. **8c136ca** - feat: add drag and drop phantom
5. **ae4b617** - style: reduce font size inline edit
6. **37376ee** - feat: centralize tag labels from DAG store
7. **43f9f51** - feat: centralize tag colors from DAG store
8. **58c89fe** - feat: add color picker + smart visibility toggle

---

## PHASE 9: PERSISTENCE & FICHIERS

**Commits:** 1 | **Priorité:** CRITIQUE

### Commits principaux

1. **7ec3dd6** - fix: persist and restore tags in file save/load
2. **6809738** - feat: implement comprehensive data persistence
3. **04b9e13** - fix: correct store access in file export
4. **af2a230** - fix: properly save and restore node tags

**Implémentation:**

- Sauvegarder tags dans bigmind.json
- Restaurer tags au chargement
- Format de fichier

---

## PHASE 10: REFACTORING

**Commits:** Multiples refactor

Focus: Nettoyage, optimisation, centralisation

---

## PHASE 11: BUG FIXES & POLISH

**Commits:** 7

Corrections finales, polish, optimisations

---

## ANNEXE A: ORDRE D'IMPLÉMENTATION STRICT

### Jour 1: Foundation

1. f9390bc - DAG complet (8h)

### Jour 2: Synchronisation base

2. 9c10440 - Dynamic sync
3. 02dcc3a - Remove sample data
4. 143551a - Fix import casing
5. 2cc5bd7 - Real-time sync

### Jour 3: Synchronisation avancée

6-13. Commits debug et fixes sync

### Jour 4: Affichage

14. ea71f6e - Affichage tags sur nœuds
    15-23. Commits positionnement

### Jour 5: UI Polish

24-32. Styling et boutons

### Jour 6: Création & Store

33-45. Tag creation et centralisation

### Jour 7: Menus

46-54. Interactions et menus

### Jour 8: Persistence

55-61. Save/load

### Jour 9: Refactoring

62-69. Refactor et optimisation

### Jour 10: Polish

70-76. Bug fixes finaux

---

## ANNEXE B: FICHIERS CRITIQUES

### À créer en priorité

1. `apps/web/src/types/dag.ts`
2. `apps/web/src/hooks/useTagLayers.ts`
3. `apps/web/src/components/TagLayersPanel.tsx`
4. `apps/web/src/hooks/useTagGraph.ts`
5. `apps/web/src/components/TagGraph.tsx`

### À modifier en priorité

1. `apps/web/src/components/MindMapNode.tsx`
2. `apps/web/src/hooks/useMindmap.ts`
3. `apps/web/src/components/Sidebar.tsx`
4. `apps/web/src/hooks/useOpenFiles.ts`

---

## ANNEXE C: DÉPENDANCES NPM

```bash
pnpm add d3 d3-dag
pnpm add -D @types/d3 @types/d3-dag
```

---

## ANNEXE D: COMMANDES UTILES

### Voir un commit spécifique

```bash
git show <hash>
```

### Voir les fichiers modifiés

```bash
git show --stat <hash>
```

### Voir le diff complet

```bash
git diff <hash>^ <hash>
```

### Extraire le code d'un commit

```bash
git show <hash>:<file_path>
```

---

**FIN DU PLAN D'ACTION**

Ce document doit être utilisé en conjonction avec `ANALYSE_TAGS_EXHAUSTIVE.md` pour
avoir tous les détails de chaque commit.
