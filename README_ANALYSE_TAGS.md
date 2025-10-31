# DOCUMENTATION ANALYSE TAGS - MODE D'EMPLOI

**Date:** 2025-10-25
**Auteur:** Analyse automatisée des commits tags
**Objectif:** Guide complet pour réimplémenter le système de tags

---

## FICHIERS GÉNÉRÉS

Cette analyse a produit 5 fichiers principaux:

### 1. `ANALYSE_TAGS_EXHAUSTIVE.md` (4115 lignes)

**Contenu:** Analyse détaillée de chaque commit (76 commits)
**Organisation:** Par phases (11 phases)
**Détails par commit:**

- Hash complet et court
- Date et auteur
- Type de commit
- Description complète
- Fichiers modifiés (liste exhaustive)
- Statistiques (lignes ajoutées/supprimées)
- Dépendances (parents git)
- Commande pour voir le diff

**Usage:** Référence complète pour comprendre chaque modification

---

### 2. `PLAN_ACTION_TAGS.md`

**Contenu:** Plan stratégique de réimplémentation
**Organisation:** Par phases avec priorités
**Informations:**

- Objectifs de chaque phase
- Commits critiques détaillés
- Dépendances bloquantes
- Tests requis
- Ordre d'implémentation recommandé
- Planning estimé (10 jours)
- Fichiers critiques à créer/modifier
- Dépendances npm

**Usage:** Roadmap pour la réimplémentation

---

### 3. `ORDRE_IMPLEMENTATION.md`

**Contenu:** Liste séquentielle des 76 commits
**Organisation:** Ordre chronologique strict
**Détails par commit:**

- Numéro d'ordre
- Hash et sujet
- Date
- Fichiers impactés
- Commandes git pour extraire le code
- Checklist de progression

**Usage:** Guide pas-à-pas pour réimplémenter dans l'ordre exact

---

### 4. `MAPPING_FICHIERS_COMMITS.md`

**Contenu:** Mapping inverse fichiers → commits
**Organisation:** Par fichiers modifiés
**Sections:**

- Fichiers les plus modifiés (top 20)
- Organisation par catégorie
- Historique complet de chaque fichier
- Commandes pour voir l'historique

**Usage:** Savoir quels commits ont touché quel fichier

---

### 5. `README_ANALYSE_TAGS.md` (ce fichier)

**Contenu:** Documentation et mode d'emploi
**Usage:** Point d'entrée de la documentation

---

## STATISTIQUES GLOBALES

### Vue d'ensemble

- **Total commits analysés:** 76
- **Période:** 2025-09-29 → 2025-10-25 (26 jours)
- **Fichiers uniques modifiés:** 154
- **Lignes ajoutées:** 40,104
- **Lignes supprimées:** 6,367
- **Impact net:** +33,737 lignes

### Répartition par type de commit

- **fix:** 32 commits (42%) - Corrections de bugs
- **feature:** 21 commits (28%) - Nouvelles fonctionnalités
- **refactor:** 9 commits (12%) - Refactoring
- **debug:** 6 commits (8%) - Commits de debug
- **style:** 5 commits (7%) - Styling/UI
- **other:** 2 commits (3%) - Divers
- **chore:** 1 commit (1%) - Maintenance

### Répartition par phase

1. **Phase 1 - Foundation DAG:** 1 commit (CRITIQUE)
2. **Phase 2 - Synchronisation:** 28 commits (CRITIQUE)
3. **Phase 3 - Affichage UI:** 10 commits (HAUTE)
4. **Phase 4 - Positionnement:** 13 commits (HAUTE)
5. **Phase 5 - UI Enhancement:** 9 commits (MOYENNE)
6. **Phase 6 - Tag Creation:** 3 commits (HAUTE)
7. **Phase 7 - Centralisation:** 3 commits (CRITIQUE)
8. **Phase 8 - Menus:** 1 commit (MOYENNE)
9. **Phase 9 - Persistence:** 1 commit (CRITIQUE)
10. **Phase 10 - Refactoring:** (inclus dans autres)
11. **Phase 11 - Bug Fixes:** 7 commits (VARIABLE)

### Fichiers par catégorie

- **Components:** 29 fichiers
- **Hooks:** 29 fichiers
- **Packages:** 48 fichiers
- **Racine & Config:** 25 fichiers
- **Utils:** 9 fichiers
- **Autres (src):** 7 fichiers
- **Pages:** 5 fichiers
- **Types:** 2 fichiers

---

## MÉTHODOLOGIE DE RÉIMPLÉMENTATION

### Approche recommandée

#### Option A: Séquentielle stricte (recommandée)

1. Suivre `ORDRE_IMPLEMENTATION.md` ligne par ligne
2. Pour chaque commit:
   - Lire la description dans `ANALYSE_TAGS_EXHAUSTIVE.md`
   - Extraire le code avec `git show <hash>`
   - Analyser les changements
   - Appliquer les modifications
   - Tester
   - Créer un commit
3. Avantage: Reproduction exacte, moins de bugs
4. Durée estimée: 10 jours

#### Option B: Par phases (plus rapide)

1. Suivre `PLAN_ACTION_TAGS.md`
2. Implémenter une phase complète à la fois
3. Avantage: Plus rapide, vision globale
4. Durée estimée: 5-7 jours
5. Risque: Plus de bugs, moins de fidélité

#### Option C: Par fichiers (expert)

1. Utiliser `MAPPING_FICHIERS_COMMITS.md`
2. Recréer chaque fichier en analysant tous ses commits
3. Avantage: Compréhension profonde de chaque fichier
4. Durée estimée: 7-8 jours
5. Prérequis: Bonne connaissance du codebase

---

## COMMANDES GIT UTILES

### Voir un commit spécifique

```bash
# Voir le diff complet
git show <hash>

# Voir seulement les stats
git show --stat <hash>

# Voir seulement les fichiers modifiés
git diff-tree --no-commit-id --name-only -r <hash>
```

### Extraire le code d'un commit

```bash
# Voir un fichier spécifique après le commit
git show <hash>:<chemin/vers/fichier>

# Comparer avant/après
git diff <hash>^ <hash> -- <fichier>
```

### Voir l'historique d'un fichier

```bash
# Tous les commits qui ont modifié ce fichier
git log --oneline -- <fichier>

# Avec les diffs
git log -p -- <fichier>
```

### Rechercher dans les commits

```bash
# Chercher un mot dans les messages
git log --grep="tag" -i

# Chercher dans le code
git log -S "useTagLayers"
```

---

## COMMITS CRITIQUES (PRIORITÉ ABSOLUE)

Ces commits DOIVENT être implémentés en premier:

### 1. f9390bc - DAG Foundation (JOUR 1)

```bash
git show f9390bc
```

**Importance:** 🔴 BLOQUANT - Tout dépend de ce commit
**Durée:** 8h
**Fichiers créés:** 20+ nouveaux fichiers
**Impact:** Base complète du système

### 2. 2cc5bd7 - Real-time Sync (JOUR 2)

```bash
git show 2cc5bd7
```

**Importance:** 🔴 CRITIQUE - Synchronisation bidirectionnelle
**Durée:** 3h
**Dépend de:** f9390bc

### 3. ea71f6e - Affichage UI (JOUR 4)

```bash
git show ea71f6e
```

**Importance:** 🟠 HAUTE - Premier rendu visuel
**Durée:** 2h
**Dépend de:** Phase 2 complète

### 4. 1fd9740 - Centralisation Store (JOUR 6)

```bash
git show 1fd9740
```

**Importance:** 🔴 CRITIQUE - Source unique de vérité
**Durée:** 4h
**Dépend de:** Phase 6

### 5. af2a230 - Persistence (JOUR 8)

```bash
git show af2a230
```

**Importance:** 🔴 CRITIQUE - Save/load
**Durée:** 3h
**Dépend de:** Phase 7

---

## DÉPENDANCES NPM

### À installer

```bash
# Packages principaux
pnpm add d3 d3-dag zustand

# Types TypeScript
pnpm add -D @types/d3 @types/d3-dag

# Si manquants
pnpm add @radix-ui/react-select
pnpm add @radix-ui/react-dialog
pnpm add lucide-react
```

### Versions utilisées (référence)

```json
{
  "d3": "^7.8.5",
  "d3-dag": "^1.1.0",
  "zustand": "^4.4.1"
}
```

---

## STRUCTURE DES FICHIERS CRÉÉS

### Nouveaux composants

```
apps/web/src/components/
├── TagLayersPanel.tsx         (panneau principal)
├── TagLayersPanel.css
├── TagLayersPanelDAG.tsx      (vue DAG)
├── TagLayersPanelDAG.css
├── TagGraph.tsx               (graphe D3)
├── StickerPicker.tsx
├── TemplateGallery.tsx
├── ThemeSelector.tsx
└── dialogs/
    ├── InsertImageDialog.tsx
    └── InsertStickerDialog.tsx
```

### Nouveaux hooks

```
apps/web/src/hooks/
├── useTagLayers.ts            (store Zustand principal)
├── useTagGraph.ts             (gestion graphe)
├── useTemplates.ts
└── useThemes.ts
```

### Types

```
apps/web/src/types/
└── dag.ts                     (types DAG)
```

### Utilitaires

```
apps/web/src/utils/
└── shortcutUtils.ts
```

### Data

```
apps/web/src/data/
└── tags.json                  (données de test)
```

---

## TESTS REQUIS PAR PHASE

### Phase 1: DAG Foundation

- [ ] Créer un tag simple
- [ ] Créer une hiérarchie parent-enfant
- [ ] Créer des multi-parents
- [ ] Vérifier détection de cycles
- [ ] Tester les 3 types de relations (is-type-of, is-related-to, is-part-of)
- [ ] Basculer entre vue liste et graphe
- [ ] Drag & drop pour réorganiser
- [ ] Shift+clic pour créer des liens
- [ ] Zoom/pan dans le graphe
- [ ] Persistence dans localStorage

### Phase 2: Synchronisation

- [ ] Ouvrir une carte → tags se chargent
- [ ] Changer de carte → tags se mettent à jour
- [ ] Fermer carte → tags se vident
- [ ] Ajouter tag dans MindMap → apparaît dans DAG
- [ ] Modifier tag dans DAG → se met à jour dans MindMap
- [ ] Supprimer tag → disparaît des deux côtés
- [ ] Ouvrir plusieurs cartes → seule carte active synchronisée

### Phase 3: Affichage UI

- [ ] Tags apparaissent sur les nœuds
- [ ] Couleur correcte
- [ ] Label lisible
- [ ] Clés React uniques (pas de warnings)

### Phase 4: Positionnement

- [ ] Tags centrés horizontalement
- [ ] Tags à cheval sur bordure inférieure (50/50)
- [ ] Pas d'agrandissement du nœud
- [ ] Cohérent sur tous les types de nœuds
- [ ] Pas de troncature du texte

### Phase 9: Persistence

- [ ] Sauvegarder fichier avec tags
- [ ] Recharger fichier → tags restaurés
- [ ] Export/import cartae.json
- [ ] Tags sur nœuds correctement sauvegardés

---

## PATTERNS DE CODE IMPORTANTS

### Pattern 1: Store Zustand avec persistence

```typescript
// apps/web/src/hooks/useTagLayers.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TagLayersState {
  tags: Tag[];
  selectedTag: string | null;
  viewMode: 'hierarchy' | 'graph';
  // ... autres
}

export const useTagLayers = create<TagLayersState>()(
  persist(
    (set, get) => ({
      tags: [],
      selectedTag: null,
      viewMode: 'hierarchy',
      // ... actions
    }),
    {
      name: 'tag-layers-storage',
    }
  )
);
```

### Pattern 2: Synchronisation événements

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

### Pattern 3: Positionnement tags sur nœuds

```typescript
// apps/web/src/components/MindMapNode.tsx
<div
  className="tags-container"
  style={{
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translate(-50%, 50%)',
    display: 'flex',
    gap: '4px',
    height: 0,
    overflow: 'visible',
    pointerEvents: 'none'
  }}
>
  {node.tags?.map(tagId => (
    <div
      key={tagId}
      className="tag-badge"
      style={{
        backgroundColor: getTagColor(tagId),
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
        whiteSpace: 'nowrap'
      }}
    >
      {getTagLabel(tagId)}
    </div>
  ))}
</div>
```

---

## WORKFLOW RECOMMANDÉ

### Jour 1: Setup et Foundation

1. Installer dépendances npm
2. Créer structure de fichiers (types, hooks)
3. Implémenter commit f9390bc (DAG complet)
4. Tests Phase 1

### Jour 2-3: Synchronisation

1. Implémenter commits 9c10440 à 2cc5bd7
2. Event system
3. Sync bidirectionnelle
4. Tests Phase 2

### Jour 4: Affichage

1. Implémenter ea71f6e et suivants
2. Rendu visuel tags
3. Tests Phase 3

### Jour 5: Positionnement

1. Tous les commits de positionnement
2. Ajustements CSS
3. Tests Phase 4

### Jour 6-7: Création et Store

1. Tag creation logic
2. Centralisation store
3. Tests Phases 6-7

### Jour 8: Persistence

1. Save/load
2. cartae.json format
3. Tests Phase 9

### Jour 9: Menus et Interactions

1. Context menus
2. Edit menus
3. Interactions

### Jour 10: Polish et Tests

1. Refactoring
2. Bug fixes
3. Tests complets
4. Documentation

---

## TROUBLESHOOTING

### Problème: Tags ne s'affichent pas

**Solutions:**

1. Vérifier que Phase 1 est complète
2. Vérifier sync (Phase 2)
3. Console logs pour debug
4. Vérifier le store Zustand

### Problème: Synchronisation ne fonctionne pas

**Solutions:**

1. Vérifier events (mindmap:tags-changed)
2. Vérifier lifecycle hooks
3. Tester avec bouton debug (commit f6d6b2d)
4. Logs à chaque étape

### Problème: Positionnement incorrect

**Solutions:**

1. Vérifier tous les commits Phase 4 dans l'ordre
2. CSS doit correspondre exactement
3. Tester sur différents types de nœuds

### Problème: Perte de données

**Solutions:**

1. Vérifier persistence (Phase 9)
2. localStorage fonctionne?
3. Format cartae.json correct?

---

## RESSOURCES

### Documentation git

- `man git-show`
- `man git-diff`
- `man git-log`

### Documentation packages

- D3.js: https://d3js.org/
- d3-dag: https://github.com/erikbrinkman/d3-dag
- Zustand: https://github.com/pmndrs/zustand
- ReactFlow: https://reactflow.dev/

### Fichiers de référence

- `ANALYSE_TAGS_EXHAUSTIVE.md` - Analyse détaillée
- `PLAN_ACTION_TAGS.md` - Plan stratégique
- `ORDRE_IMPLEMENTATION.md` - Ordre séquentiel
- `MAPPING_FICHIERS_COMMITS.md` - Mapping fichiers

---

## SUPPORT

### Questions fréquentes

**Q: Dans quel ordre dois-je implémenter?**
R: Suivre `ORDRE_IMPLEMENTATION.md` pour l'ordre strict chronologique, ou `PLAN_ACTION_TAGS.md` pour l'approche par phases.

**Q: Un commit dépend d'un autre, comment savoir?**
R: Voir la section "Dépendances (parents)" dans `ANALYSE_TAGS_EXHAUSTIVE.md` pour chaque commit.

**Q: Comment extraire le code d'un commit?**
R: `git show <hash>` pour voir le diff, `git show <hash>:<fichier>` pour voir un fichier spécifique.

**Q: Combien de temps ça va prendre?**
R: Estimation: 10 jours pour l'approche séquentielle, 5-7 jours pour l'approche par phases.

**Q: Puis-je sauter des commits?**
R: Non pour les commits CRITIQUES (Phase 1, 2, 7, 9). Oui pour certains commits debug ou style.

---

## CHANGELOG DE L'ANALYSE

- **2025-10-25 11:29:** Analyse initiale de 76 commits
- **2025-10-25 11:30:** Génération des 5 fichiers de documentation
- **2025-10-25 11:31:** Création de ce README

---

**Bon courage pour la réimplémentation ! 🚀**

Pour toute question, consulter d'abord les 4 autres fichiers de documentation.
