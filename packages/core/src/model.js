/**
 * FR: Modèles de données pour BigMind - Nœuds, cartes mentales, styles
 * EN: Data models for BigMind - Nodes, mind maps, styles
 */
import { nanoid } from 'nanoid';
// FR: Factory pour créer des nœuds
// EN: Factory to create nodes
export class NodeFactory {
    /**
     * FR: Créer un nouveau nœud
     * EN: Create a new node
     */
    static createNode(title, parentId = null, style) {
        return {
            id: nanoid(),
            parentId,
            title,
            children: [],
            style,
            collapsed: false,
            x: 0,
            y: 0,
            width: 200,
            height: 40,
        };
    }
    /**
     * FR: Créer une carte mentale vide
     * EN: Create an empty mind map
     */
    static createEmptyMindMap(name = 'Nouvelle carte') {
        const rootNode = NodeFactory.createNode('Racine');
        return {
            id: nanoid(),
            rootId: rootNode.id,
            nodes: {
                [rootNode.id]: rootNode,
            },
            meta: {
                name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                locale: 'fr',
                version: '1.0.0',
            },
        };
    }
}
// FR: Utilitaires pour manipuler les nœuds
// EN: Utilities to manipulate nodes
export class NodeUtils {
    /**
     * FR: Obtenir tous les nœuds enfants d'un nœud
     * EN: Get all child nodes of a node
     */
    static getChildren(map, nodeId) {
        const node = map.nodes[nodeId];
        if (!node)
            return [];
        return node.children.map(childId => map.nodes[childId]).filter((child) => child !== undefined);
    }
    /**
     * FR: Obtenir tous les descendants d'un nœud (récursif)
     * EN: Get all descendants of a node (recursive)
     */
    static getDescendants(map, nodeId) {
        const children = NodeUtils.getChildren(map, nodeId);
        const descendants = [...children];
        children.forEach(child => {
            descendants.push(...NodeUtils.getDescendants(map, child.id));
        });
        return descendants;
    }
    /**
     * FR: Obtenir le chemin vers la racine
     * EN: Get path to root
     */
    static getPathToRoot(map, nodeId) {
        const path = [];
        let currentNode = map.nodes[nodeId] || null;
        while (currentNode) {
            path.unshift(currentNode);
            currentNode = currentNode.parentId ? map.nodes[currentNode.parentId] || null : null;
        }
        return path;
    }
    /**
     * FR: Vérifier si un nœud est un descendant d'un autre
     * EN: Check if a node is a descendant of another
     */
    static isDescendant(map, ancestorId, descendantId) {
        const descendants = NodeUtils.getDescendants(map, ancestorId);
        return descendants.some(node => node.id === descendantId);
    }
}
// FR: Utilitaires pour gérer les tags
// EN: Utilities to manage tags
export const TagUtils = {
    /**
     * FR: Obtenir tous les tags uniques utilisés dans la carte
     * EN: Get all unique tags used in the map
     */
    getAllTags(map) {
        const tagsSet = new Set();
        Object.values(map.nodes).forEach(node => {
            if (node.tags) {
                node.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet).sort();
    },
    /**
     * FR: Obtenir tous les nœuds ayant un tag spécifique
     * EN: Get all nodes with a specific tag
     */
    getNodesByTag(map, tag) {
        return Object.values(map.nodes).filter(node => node.tags?.includes(tag));
    },
    /**
     * FR: Obtenir tous les nœuds ayant tous les tags spécifiés
     * EN: Get all nodes with all specified tags
     */
    getNodesByTags(map, tags) {
        return Object.values(map.nodes).filter(node => tags.every(tag => node.tags?.includes(tag)));
    },
    /**
     * FR: Compter le nombre de nœuds ayant un tag spécifique
     * EN: Count nodes with a specific tag
     */
    countNodesByTag(map, tag) {
        return TagUtils.getNodesByTag(map, tag).length;
    },
    /**
     * FR: Obtenir un dictionnaire tag -> nombre de nœuds
     * EN: Get a dictionary tag -> node count
     */
    getTagCounts(map) {
        const tags = TagUtils.getAllTags(map);
        const counts = {};
        tags.forEach(tag => {
            counts[tag] = TagUtils.countNodesByTag(map, tag);
        });
        return counts;
    }
};
//# sourceMappingURL=model.js.map