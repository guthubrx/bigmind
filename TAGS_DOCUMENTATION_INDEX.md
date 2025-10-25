# INDEX - DOCUMENTATION COMPLÈTE DES TAGS

## Documents générés

Ce répertoire contient une documentation exhaustive du système de tags implémenté entre v0.1.3 et HEAD.

### 1. TAGS_IMPLEMENTATION_SUMMARY.md (Commencer ici!)

**Durée de lecture:** 15-20 minutes
**Public:** Développeurs de tous niveaux

Résumé exécutif avec:

- Architecture en 3 couches (stockage, sync, affichage)
- 9 phases d'implémentation
- 8 commits critiques à comprendre
- 5 patterns architecturaux clés
- Points forts et points à améliorer
- Notes de maintenance

**À lire en premier pour comprendre le "pourquoi".**

---

### 2. TAGS_ROADMAP_COMPLETE.md (Débutants → Experts)

**Durée de lecture:** 30-40 minutes
**Public:** Développeurs, mainteneurs

Document le plus détaillé avec:

- **14 sections** classées par thème
- Pour chaque commit: hash, date, fichiers modifiés, description 2-3 lignes
- **65+ commits** documentés individuellement
- Catégories: [Display] [DAG] [Sync] [Persistence] [Panel] [Colors] [Hierarchy]
- Chrono

logie d'implémentation recommandée (9 phases)

- Sommaire par thème (compter commits per category)
- Dépendances entre commits

**Référence complète pour retrouver un commit spécifique.**

---

### 3. TAGS_DEPENDENCIES.md (Architectes, Advanced)

**Durée de lecture:** 20-25 minutes
**Public:** Architectes, mainteneurs séniors

Graphe des dépendances avec:

- Diagramme ASCII de l'architecture générale
- Dépendances détaillées par niveau (1-9)
- 4 flux critiques expliqués (create, delete, change color, rename)
- Points critiques à respecter (5 items)
- Validation checklist
- Fluxes de données avec ASCII diagrams

**Pour comprendre "comment" les pièces s'emboîtent.**

---

## GUIDE DE NAVIGATION

### Scénario 1: "Je dois ajouter une nouvelle feature aux tags"

1. Lire: TAGS_IMPLEMENTATION_SUMMARY.md (architecture)
2. Checker: TAGS_DEPENDENCIES.md (points critiques)
3. Consulter: TAGS_ROADMAP_COMPLETE.md (pour patterns spécifiques)
4. Implémenter en suivant les patterns de 5123b7e, 5bc52ed, 6d9a969

### Scénario 2: "Les tags ne se synchro pas correctement"

1. Lire: TAGS_DEPENDENCIES.md (section FLUXES CRITIQUES)
2. Vérifier: useNodeTagsStore vs useTagGraph (single source issue?)
3. Consulter: TAGS_ROADMAP_COMPLETE.md (commits de sync: 2cc5bd7, ba2df9e, etc.)
4. Checker la validation checklist dans TAGS_DEPENDENCIES.md

### Scénario 3: "Je dois refactor une partie des tags"

1. Lire: TAGS_DEPENDENCIES.md (section POINTS CRITIQUES)
2. Étudier: Les commits critiques dans TAGS_IMPLEMENTATION_SUMMARY.md
3. Vérifier: Vous respectez les patterns (store-first, centralized creation, unified ops)
4. Valider: La checklist dans TAGS_DEPENDENCIES.md

### Scénario 4: "Je veux comprendre toute l'histoire"

1. Commencer: TAGS_IMPLEMENTATION_SUMMARY.md (9 phases)
2. Appro fondir: TAGS_ROADMAP_COMPLETE.md (commits détaillés)
3. Maîtriser: TAGS_DEPENDENCIES.md (architecture profonde)

---

## STATISTIQUES

| Métrique                 | Valeur                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| Total commits documentés | 65+                                                                          |
| Fichiers créés/modifiés  | 20+                                                                          |
| Lignes de code           | ~3000+                                                                       |
| Phases implémentation    | 9                                                                            |
| Commits critiques        | 8                                                                            |
| Patterns clés            | 5                                                                            |
| Hooks créés              | 4+ (useTagGraph, useNodeTags, useMindMapDAGSync, useTagLayers)               |
| Components créés         | 5+ (TagGraph, TagLayersPanel, TagLayersPanelDAG, NodeTagPanel, QuickTagTest) |
| Types fichiers           | 1 (types/dag.ts)                                                             |
| Utils créés              | 2+ (eventBus, tagUtils)                                                      |

---

## CONCEPTS CLÉS PAR DOCUMENT

### TAGS_IMPLEMENTATION_SUMMARY.md

- **Source unique de vérité:** useNodeTagsStore (not node.tags, not useTagGraph)
- **Création centralisée:** createAndAssociateTag()
- **Operations unifiées:** sync.tagNode()/sync.untagNode()
- **Event-driven:** eventBus pour bidirectional sync
- **Multi-level persistence:** DAG + node associations + UI state

### TAGS_ROADMAP_COMPLETE.md

- **Ordre chronologique:** f9390bc → HEAD
- **Thèmes:** Display, DAG, Sync, Persistence, Panels, Colors, Hierarchy
- **Granularité:** Commit-level avec fichiers et descriptions
- **Tracabilité:** Chaque change peut être trouvé rapidement

### TAGS_DEPENDENCIES.md

- **Layered architecture:** Storage → Sync → Display
- **Critical fluxes:** 4 opérations principales documentées
- **Patterns:** Store-first, centralized, unified, event-driven
- **Validation:** Checklist pour s'assurer rien n'est cassé

---

## FICHIERS DE CODE À CONSULTER

### Tier 1: Foundation (À lire absolument)

- `types/dag.ts` - Type definitions
- `hooks/useTagGraph.ts` - DAG store
- `hooks/useNodeTags.ts` - Single source of truth
- `utils/eventBus.ts` - Event communication

### Tier 2: Display & Interaction

- `components/MindMapNode.tsx` - Tag rendering
- `components/TagLayersPanelDAG.tsx` - Tag management UI
- `components/NodeTagPanel.tsx` - Quick tagging

### Tier 3: Operations & Utils

- `utils/tagUtils.ts` - Reusable functions
- `hooks/useTagGraph.ts` - Operations (create, delete, update)
- `hooks/useMindMapDAGSync.ts` - Sync logic

### Tier 4: Persistence

- `hooks/useFileOperations.ts` - Save/load logic
- `hooks/useTagLayers.ts` - Visibility/opacity persistence

---

## FAQ RÉPONDUES PAR DOCUMENTS

### Q: Où est stocké l'état des tags?

**Réponse dans:** TAGS_IMPLEMENTATION_SUMMARY.md (Architecture 3 couches)

- useTagGraph pour DAG structure
- useNodeTags pour associations (SOURCE UNIQUE)
- node.tags pour persistence

### Q: Comment ajouter un tag?

**Réponse dans:** TAGS_DEPENDENCIES.md (FLUX 1)

- createAndAssociateTag() pour création
- sync.tagNode() pour association

### Q: Pourquoi il y a 3 commits d'unification (fc270d6, 5123b7e, 6d9a969)?

**Réponse dans:** TAGS_ROADMAP_COMPLETE.md (Section 11. TAG OPERATIONS UNIFICATION)

- Progression vers single code path

### Q: Comment ça persiste entre sessions?

**Réponse dans:** TAGS_ROADMAP_COMPLETE.md (Section 5. PERSISTANCE)

- importTags/exportTags dans bigmind.json

### Q: Pourquoi MindMapNode lit du store et pas des props?

**Réponse dans:** TAGS_IMPLEMENTATION_SUMMARY.md (Commit 2. 4efae27)

- Clé de voûte 1: Store-first design

### Q: C'est quoi la "single source of truth"?

**Réponse dans:** TAGS_ROADMAP_COMPLETE.md (Section 6. CENTRALISATION)

- useNodeTagsStore = seulement place de vérité
- Élimine sync bugs

---

## COMMANDS UTILES

```bash
# Voir un commit spécifique
git show f9390bc --stat

# Voir tous les commits depuis v0.1.3
git log v0.1.3..HEAD --oneline

# Chercher commits mentionnant "tag"
git log v0.1.3..HEAD --grep="tag" --oneline

# Voir le diff d'un commit
git show 5123b7e

# Comparer deux commits
git diff f9390bc 4efae27

# Trouver le fichier history
git log -p apps/web/src/hooks/useNodeTags.ts
```

---

## PATTERNS À MÉMORISER

### Pattern 1: Ne pas lire depuis node.tags

```typescript
// MAUVAIS
const tags = node.tags;

// BON
const tags = useNodeTagsStore(state => state.getNodeTags(nodeId));
```

### Pattern 2: Créer un tag centralisé

```typescript
// MAUVAIS
const tag = { id: generateId(), label, color: 'blue' };
useTagGraph.addTag(tag);

// BON
await createAndAssociateTag(nodeId, label);
// Fait: ID génération, couleur déterministe, sync auto
```

### Pattern 3: Ajouter tag à nœud

```typescript
// MAUVAIS (AddTagCommand, múltiples code paths)
addTagToNode(nodeId, tagId);

// BON (single path everywhere)
sync.tagNode(nodeId, tagId);
```

### Pattern 4: Émettre après changement

```typescript
useTagGraph.addTag(tag);
eventBus.emit('tag:created', { tagId: tag.id, label: tag.label });
```

### Pattern 5: Sauvegarder tags

```typescript
// Level 1: DAG structure
const dagData = useTagGraphStore.getState().exportTags();
bigmindData.tags = dagData;

// Level 2: Node associations
bigmindData.nodes[nodeId].tags = node.tags;

// Level 3: UI state (visibility, colors, etc.)
bigmindData.tagLayers = useTagGraphStore.getState().getLayers();
```

---

## NOTES SPÉCIALES

### Pourquoi "feat/tags-clean"?

Cette branche été créée pour nettoyer et refactoriser le système de tags après l'implémentation initiale. Elle représente la version "clean" avec single source of truth.

### Commits WIP et INDEX:

Les commits 63a1fab et d0c8232 sont des commits WIP/INDEX (git stash metadata). À ignorer.

### Réinitialisation de branche:

Le commit a6fbac2 réinitialise la branche à un point propre, utilisé comme base pour la refactorisation.

---

## RESSOURCES EXTERNES

- D3.js documentation: https://d3js.org/
- d3-dag: https://erikbrinkman.github.io/d3-dag/
- Zustand store: https://zustand-demo.vercel.app/
- XMind format: https://github.com/xmind-ltd/xmind-sdk

---

## VERSION & META

- **Documentation générée:** 2025-10-25
- **Basée sur:** v0.1.3 → HEAD (feat/tags-clean)
- **Format:** Markdown
- **Langage codebase:** TypeScript/React
- **Total documents:** 4 (ce document + 3 autres)
- **Éntiement dans le français:** Oui

---

**Besoin d'aide?** Référez-vous à la section "GUIDE DE NAVIGATION" ci-dessus basée sur votre scénario.
