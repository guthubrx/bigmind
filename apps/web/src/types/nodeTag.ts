/**
 * FR: Types pour l'association entre nœuds de la MindMap et tags du DAG
 * EN: Types for association between MindMap nodes and DAG tags
 */

export interface NodeTag {
  nodeId: string;
  tagId: string;
  appliedAt?: number; // timestamp
}

export interface TaggedNode {
  nodeId: string;
  nodeLabel: string;
  tags: string[]; // tag IDs
  path: string[]; // chemin dans la MindMap
}

export interface TagUsage {
  tagId: string;
  nodeIds: string[];
  count: number;
}

export interface TagGraphData {
  tags: Array<{
    id: string;
    label: string;
    color?: string;
    parents?: string[];
    visible?: boolean;
  }>;
  links: Array<{
    parent: string;
    child: string;
    type?: string;
  }>;
  usage: Record<string, string[]>; // tagId -> nodeIds[]
}

export interface SyncEvent {
  type: 'add' | 'remove' | 'update';
  source: 'mindmap' | 'dag';
  nodeId?: string;
  tagId?: string;
  tags?: string[];
  timestamp: number;
}