# Synchronisation DAG-MindMap

## Vue d'ensemble

Le système de synchronisation permet une communication bidirectionnelle entre le graphe sémantique DAG et la MindMap. Les modifications dans l'un se répercutent automatiquement dans l'autre.

## Architecture

### 1. Bus d'événements (`eventBus.ts`)
- Système de communication centralisé
- File d'événements avec traitement asynchrone
- Support des désabonnements automatiques

### 2. Store des associations (`useNodeTags.ts`)
- Gestion des associations nœud-tag
- Index bidirectionnels pour accès rapide
- Persistance locale avec Zustand

### 3. Hook de synchronisation (`useMindMapDAGSync.ts`)
- Orchestrateur principal de la synchronisation
- Gestion des conflits et de l'état de synchronisation
- Méthodes utilitaires pour l'interaction

## Événements disponibles

### Depuis la MindMap
- `node:tagged` - Un nœud reçoit un tag
- `node:untagged` - Un tag est retiré d'un nœud
- `node:updated` - Un nœud est modifié
- `node:deleted` - Un nœud est supprimé

### Depuis le DAG
- `tag:added` - Un nouveau tag est créé
- `tag:removed` - Un tag est supprimé
- `tag:selected` - Un tag est sélectionné
- `tag:updated` - Un tag est modifié

### Système
- `sync:refresh` - Demande de rafraîchissement global
- `node:selected` - Sélection multiple de nœuds

## Utilisation

### 1. Tagging d'un nœud depuis la MindMap

```tsx
import { useMindMapDAGSync } from '../hooks/useMindMapDAGSync';

function MyComponent() {
  const sync = useMindMapDAGSync();

  // Ajouter un tag à un nœud
  const handleTagNode = (nodeId: string, tagId: string) => {
    sync.tagNode(nodeId, tagId);
  };

  // Retirer un tag d'un nœud
  const handleUntagNode = (nodeId: string, tagId: string) => {
    sync.untagNode(nodeId, tagId);
  };
}
```

### 2. Utilisation du panneau de tagging

```tsx
import { NodeTagPanel } from '../components/NodeTagPanel';

function MindMapCanvas() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <>
      {/* Votre canvas de MindMap */}
      {selectedNode && (
        <NodeTagPanel
          nodeId={selectedNode.id}
          position={{ x: 100, y: 100 }}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </>
  );
}
```

### 3. Mise en surbrillance des nœuds depuis le DAG

```tsx
// Dans le composant TagLayersPanelDAG
const handleTagSelect = (tagId: string) => {
  selectTag(tagId); // Émet automatiquement l'événement
};
```

## Flux de données

### MindMap → DAG
1. L'utilisateur ajoute un tag à un nœud
2. `nodeTags.addNodeTag()` met à jour l'association
3. `eventBus.emit('node:tagged')` notifie le DAG
4. Le DAG met à jour ses compteurs de nœuds associés

### DAG → MindMap
1. L'utilisateur sélectionne un tag dans le graphe
2. `selectTagWithSync()` émet l'événement
3. La MindMap reçoit la liste des nœuds à mettre en surbrillance
4. Les nœuds sont visuellement mis en évidence

## Persistance

Les données sont persistées à trois niveaux :
1. **Tags** : Store Zustand avec persist middleware
2. **Associations** : Store NodeTags avec indexation
3. **MindMap** : Store principal de la carte mentale

## Optimisations

### Performance
- Index bidirectionnels pour accès O(1)
- File d'événements pour éviter les blocages
- Flag `isSyncing` pour éviter les boucles

### UX
- Mise à jour temps réel sans rechargement
- Animations fluides lors des sélections
- Badges de comptage sur les tags

## Exemples d'intégration

### Afficher les tags d'un nœud

```tsx
const nodeTags = sync.getNodeTags(nodeId);
nodeTags.forEach(tag => {
  console.log(`Tag: ${tag.label}, Couleur: ${tag.color}`);
});
```

### Obtenir tous les nœuds d'un tag

```tsx
const nodes = sync.getTaggedNodes(tagId);
console.log(`${nodes.length} nœuds utilisent ce tag`);
```

### Rafraîchir manuellement

```tsx
sync.refreshSync(); // Force un rafraîchissement global
```

## Dépannage

### Les modifications ne se synchronisent pas
1. Vérifier que le bus d'événements est initialisé
2. Confirmer que les hooks sont montés
3. Vérifier la console pour les erreurs

### Performance dégradée
1. Limiter le nombre d'événements émis
2. Utiliser le debouncing pour les mises à jour fréquentes
3. Nettoyer les écouteurs non utilisés

## Évolutions futures

- [ ] Synchronisation avec base de données distante
- [ ] Support du multi-utilisateur
- [ ] Historique des modifications
- [ ] Import/Export des associations
- [ ] API REST pour intégration externe