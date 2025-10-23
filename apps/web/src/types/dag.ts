/**
 * FR: Types pour le système de graphe orienté acyclique (DAG) sémantique
 * EN: Types for semantic directed acyclic graph (DAG) system
 */

// FR: Type de relation sémantique entre tags
// EN: Semantic relationship type between tags
export type TagRelationType = 'is-type-of' | 'is-related-to' | 'is-part-of';

// FR: Structure d'un tag dans le DAG
// EN: DAG tag structure
export interface DagTag {
  id: string;
  label: string;
  parents?: string[]; // FR: Peut avoir plusieurs parents / EN: Can have multiple parents
  color?: string;
  description?: string;
  visible?: boolean;
  nodeIds?: string[]; // FR: IDs des nœuds MindMap associés / EN: Associated MindMap node IDs
}

// FR: Lien entre tags avec type de relation
// EN: Link between tags with relationship type
export interface TagLink {
  source: string; // FR: ID du tag parent / EN: Parent tag ID
  target: string; // FR: ID du tag enfant / EN: Child tag ID
  type: TagRelationType;
  weight?: number;
}

// FR: Structure du graphe complet
// EN: Complete graph structure
export interface TagGraph {
  tags: DagTag[];
  links?: TagLink[];
}

// FR: Nœud D3 pour la visualisation
// EN: D3 node for visualization
export interface D3TagNode extends DagTag {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  depth?: number;
  height?: number;
}

// FR: Lien D3 pour la visualisation
// EN: D3 link for visualization
export interface D3TagLink extends TagLink {
  source: D3TagNode;
  target: D3TagNode;
}

// FR: Événements du graphe
// EN: Graph events
export interface TagGraphEvents {
  onNodeClick?: (node: D3TagNode) => void;
  onNodeDoubleClick?: (node: D3TagNode) => void;
  onNodeDragStart?: (node: D3TagNode) => void;
  onNodeDrag?: (node: D3TagNode) => void;
  onNodeDragEnd?: (node: D3TagNode) => void;
  onLinkClick?: (link: D3TagLink) => void;
  onNodeHover?: (node: D3TagNode | null) => void;
  onLinkCreate?: (source: string, target: string, type: TagRelationType) => void;
}

// FR: Options de rendu du graphe
// EN: Graph rendering options
export interface TagGraphOptions {
  width?: number;
  height?: number;
  nodeRadius?: number;
  linkDistance?: number;
  chargeStrength?: number;
  showLabels?: boolean;
  showRelationTypes?: boolean;
  enableDrag?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  hideSecondaryRelations?: boolean;
}

// FR: État du store de tags DAG
// EN: DAG tags store state
export interface TagDagState {
  tags: DagTag[];
  links: TagLink[];
  selectedTagId: string | null;
  hoveredTagId: string | null;
  graphView: 'list' | 'graph';
  graphOptions: TagGraphOptions;

  // Actions
  addTag: (tag: DagTag) => void;
  updateTag: (id: string, updates: Partial<DagTag>) => void;
  deleteTag: (id: string) => void;
  addLink: (link: TagLink) => void;
  removeLink: (source: string, target: string) => void;
  selectTag: (id: string | null) => void;
  hoverTag: (id: string | null) => void;
  setGraphView: (view: 'list' | 'graph') => void;
  updateGraphOptions: (options: Partial<TagGraphOptions>) => void;
  associateTagToNode: (tagId: string, nodeId: string) => void;
  dissociateTagFromNode: (tagId: string, nodeId: string) => void;
  importTags: (graph: TagGraph) => void;
  exportTags: () => TagGraph;
  checkCycle: (source: string, target: string) => boolean;
}

// FR: Exemple de données de test
// EN: Test data example
export const SAMPLE_TAG_GRAPH: TagGraph = {
  tags: [
    { id: 'risque', label: 'Risque' },
    { id: 'technique', label: 'Technique', parents: ['risque'] },
    { id: 'communication', label: 'Communication', parents: ['risque'] },
    { id: 'securite', label: 'Sécurité', parents: ['technique', 'communication'] },
    { id: 'reseau', label: 'Réseau', parents: ['securite'] },
    { id: 'acces', label: 'Accès', parents: ['reseau'] },
  ],
};
