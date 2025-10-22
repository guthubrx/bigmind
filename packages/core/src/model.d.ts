/**
 * FR: Modèles de données pour BigMind - Nœuds, cartes mentales, styles
 * EN: Data models for BigMind - Nodes, mind maps, styles
 */
import type { NodeAsset, AssetLibrary } from './assets';
export type NodeID = string;
export interface NodeStyle {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
}
export interface MindNode {
    id: NodeID;
    parentId: NodeID | null;
    title: string;
    notes?: string;
    collapsed?: boolean;
    style?: NodeStyle;
    children: NodeID[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    assets?: NodeAsset[];
    tags?: string[];
}
export interface MindMapMeta {
    name: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    version: string;
    author?: string;
    description?: string;
}
export interface MindMap {
    id: string;
    rootId: NodeID;
    nodes: Record<NodeID, MindNode>;
    meta: MindMapMeta;
    themeColors?: string[];
    assetLibrary?: AssetLibrary;
    themeId?: string;
}
export interface SelectionState {
    selectedNodes: NodeID[];
    primaryNode: NodeID | null;
    mode: 'single' | 'multiple';
}
export interface HistoryState {
    commands: Command[];
    currentIndex: number;
    limit: number;
}
export interface Command {
    execute(state: MindMap): MindMap;
    undo(state: MindMap): MindMap;
    description: string;
    timestamp: number;
}
export declare class NodeFactory {
    /**
     * FR: Créer un nouveau nœud
     * EN: Create a new node
     */
    static createNode(title: string, parentId?: NodeID | null, style?: NodeStyle): MindNode;
    /**
     * FR: Créer une carte mentale vide
     * EN: Create an empty mind map
     */
    static createEmptyMindMap(name?: string): MindMap;
}
export declare class NodeUtils {
    /**
     * FR: Obtenir tous les nœuds enfants d'un nœud
     * EN: Get all child nodes of a node
     */
    static getChildren(map: MindMap, nodeId: NodeID): MindNode[];
    /**
     * FR: Obtenir tous les descendants d'un nœud (récursif)
     * EN: Get all descendants of a node (recursive)
     */
    static getDescendants(map: MindMap, nodeId: NodeID): MindNode[];
    /**
     * FR: Obtenir le chemin vers la racine
     * EN: Get path to root
     */
    static getPathToRoot(map: MindMap, nodeId: NodeID): MindNode[];
    /**
     * FR: Vérifier si un nœud est un descendant d'un autre
     * EN: Check if a node is a descendant of another
     */
    static isDescendant(map: MindMap, ancestorId: NodeID, descendantId: NodeID): boolean;
}
export declare const TagUtils: {
    /**
     * FR: Obtenir tous les tags uniques utilisés dans la carte
     * EN: Get all unique tags used in the map
     */
    getAllTags(map: MindMap): string[];
    /**
     * FR: Obtenir tous les nœuds ayant un tag spécifique
     * EN: Get all nodes with a specific tag
     */
    getNodesByTag(map: MindMap, tag: string): MindNode[];
    /**
     * FR: Obtenir tous les nœuds ayant tous les tags spécifiés
     * EN: Get all nodes with all specified tags
     */
    getNodesByTags(map: MindMap, tags: string[]): MindNode[];
    /**
     * FR: Compter le nombre de nœuds ayant un tag spécifique
     * EN: Count nodes with a specific tag
     */
    countNodesByTag(map: MindMap, tag: string): number;
    /**
     * FR: Obtenir un dictionnaire tag -> nombre de nœuds
     * EN: Get a dictionary tag -> node count
     */
    getTagCounts(map: MindMap): Record<string, number>;
};
//# sourceMappingURL=model.d.ts.map