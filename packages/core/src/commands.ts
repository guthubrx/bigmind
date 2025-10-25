/**
 * FR: Commandes pour le pattern Command (undo/redo)
 * EN: Commands for Command pattern (undo/redo)
 */
/* eslint-disable max-classes-per-file, @typescript-eslint/no-unused-vars, class-methods-use-this */

import { produce } from 'immer';
import { MindMap, MindNode, NodeID, Command, NodeFactory } from './model';

// FR: Commande pour ajouter un nœud
// EN: Command to add a node
export class AddNodeCommand implements Command {
  constructor(
    private nodeId: NodeID,
    private parentId: NodeID | null,
    private title: string,
    private position: { x: number; y: number } = { x: 0, y: 0 }
  ) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      // FR: Créer le nouveau nœud
      // EN: Create the new node
      const newNode: MindNode = {
        id: this.nodeId,
        parentId: this.parentId,
        title: this.title,
        children: [],
        collapsed: false,
        x: this.position.x,
        y: this.position.y,
        width: 200,
        height: 40,
      };

      // FR: Ajouter le nœud au dictionnaire
      // EN: Add node to dictionary
      draft.nodes[this.nodeId] = newNode;

      // FR: Ajouter l'enfant au parent si nécessaire
      // EN: Add child to parent if needed
      if (this.parentId) {
        const parent = draft.nodes[this.parentId];
        if (parent) {
          parent.children.push(this.nodeId);
        }
      }
    });
  }

  undo(state: MindMap): MindMap {
    return produce(state, draft => {
      // FR: Supprimer le nœud du dictionnaire
      // EN: Remove node from dictionary
      delete draft.nodes[this.nodeId];

      // FR: Retirer l'enfant du parent si nécessaire
      // EN: Remove child from parent if needed
      if (this.parentId) {
        const parent = draft.nodes[this.parentId];
        if (parent) {
          parent.children = parent.children.filter(id => id !== this.nodeId);
        }
      }
    });
  }

  get description(): string {
    return `Ajouter le nœud "${this.title}"`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour supprimer un nœud
// EN: Command to delete a node
export class DeleteNodeCommand implements Command {
  private deletedNode: MindNode | null = null;
  private deletedChildren: MindNode[] = [];

  constructor(private nodeId: NodeID) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Sauvegarder le nœud et ses enfants pour l'undo
      // EN: Save node and its children for undo
      this.deletedNode = { ...node };
      this.deletedChildren = node.children.map(id => {
        const child = draft.nodes[id];
        return child ? { ...child } : null;
      }).filter(Boolean) as MindNode[];

      // FR: Supprimer tous les descendants récursivement
      // EN: Delete all descendants recursively
      this.deleteNodeRecursive(draft, this.nodeId);

      // FR: Retirer l'enfant du parent
      // EN: Remove child from parent
      if (node.parentId) {
        const parent = draft.nodes[node.parentId];
        if (parent) {
          parent.children = parent.children.filter(id => id !== this.nodeId);
        }
      }
    });
  }

  undo(state: MindMap): MindMap {
    if (!this.deletedNode) return state;

    return produce(state, draft => {
      // FR: Restaurer le nœud principal
      // EN: Restore main node
      if (this.deletedNode) {
        draft.nodes[this.deletedNode.id] = { ...this.deletedNode };
      }

      // FR: Restaurer les enfants
      // EN: Restore children
      this.deletedChildren.forEach(child => {
        if (child) {
          draft.nodes[child.id] = { ...child };
        }
      });

      // FR: Remettre l'enfant dans le parent
      // EN: Put child back in parent
      if (this.deletedNode && this.deletedNode.parentId) {
        const parent = draft.nodes[this.deletedNode.parentId];
        if (parent) {
          parent.children.push(this.deletedNode.id);
        }
      }
    });
  }

  private deleteNodeRecursive(draft: MindMap, nodeId: NodeID): void {
    const node = draft.nodes[nodeId];
    if (!node) return;

    // FR: Supprimer récursivement tous les enfants
    // EN: Recursively delete all children
    node.children.forEach(childId => {
      this.deleteNodeRecursive(draft, childId);
    });

    // FR: Supprimer le nœud
    // EN: Delete the node
    delete draft.nodes[nodeId];
  }

  get description(): string {
    return `Supprimer le nœud "${this.deletedNode?.title || 'inconnu'}"`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour modifier le titre d'un nœud
// EN: Command to modify node title
export class UpdateNodeTitleCommand implements Command {
  private previousTitle: string = '';

  constructor(
    private nodeId: NodeID,
    private newTitle: string
  ) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Sauvegarder l'ancien titre
      // EN: Save old title
      this.previousTitle = node.title;

      // FR: Mettre à jour le titre
      // EN: Update title
      node.title = this.newTitle;
    });
  }

  undo(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Restaurer l'ancien titre
      // EN: Restore old title
      node.title = this.previousTitle;
    });
  }

  get description(): string {
    return `Modifier le titre en "${this.newTitle}"`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour déplacer un nœud
// EN: Command to move a node
export class MoveNodeCommand implements Command {
  private previousPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    private nodeId: NodeID,
    private newPosition: { x: number; y: number }
  ) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Sauvegarder l'ancienne position
      // EN: Save old position
      this.previousPosition = { x: node.x || 0, y: node.y || 0 };

      // FR: Mettre à jour la position
      // EN: Update position
      node.x = this.newPosition.x;
      node.y = this.newPosition.y;
    });
  }

  undo(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Restaurer l'ancienne position
      // EN: Restore old position
      node.x = this.previousPosition.x;
      node.y = this.previousPosition.y;
    });
  }

  get description(): string {
    return `Déplacer le nœud vers (${this.newPosition.x}, ${this.newPosition.y})`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour changer le parent d'un nœud
// EN: Command to change node parent
export class ReparentNodeCommand implements Command {
  private previousParentId: NodeID | null = null;
  private previousIndex: number = -1;

  constructor(
    private nodeId: NodeID,
    private newParentId: NodeID | null,
    private newIndex: number = 0
  ) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Sauvegarder l'ancien parent et l'index
      // EN: Save old parent and index
      this.previousParentId = node.parentId;
      if (node.parentId) {
        const parent = draft.nodes[node.parentId];
        this.previousIndex = parent.children.indexOf(this.nodeId);
      }

      // FR: Retirer de l'ancien parent
      // EN: Remove from old parent
      if (node.parentId) {
        const oldParent = draft.nodes[node.parentId];
        if (oldParent) {
          oldParent.children = oldParent.children.filter(id => id !== this.nodeId);
        }
      }

      // FR: Ajouter au nouveau parent
      // EN: Add to new parent
      node.parentId = this.newParentId;
      if (this.newParentId) {
        const newParent = draft.nodes[this.newParentId];
        if (newParent) {
          newParent.children.splice(this.newIndex, 0, this.nodeId);
        }
      }
    });
  }

  undo(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Retirer du nouveau parent
      // EN: Remove from new parent
      if (node.parentId) {
        const currentParent = draft.nodes[node.parentId];
        if (currentParent) {
          currentParent.children = currentParent.children.filter(id => id !== this.nodeId);
        }
      }

      // FR: Remettre dans l'ancien parent
      // EN: Put back in old parent
      node.parentId = this.previousParentId;
      if (this.previousParentId) {
        const oldParent = draft.nodes[this.previousParentId];
        if (oldParent) {
          oldParent.children.splice(this.previousIndex, 0, this.nodeId);
        }
      }
    });
  }

  get description(): string {
    return `Déplacer le nœud vers un nouveau parent`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour déplacer un nœud et toute son arborescence
// EN: Command to move a node and its entire subtree
export class MoveNodeWithSubtreeCommand implements Command {
  private previousPositions: Record<NodeID, { x: number; y: number }> = {};

  constructor(
    private nodeId: NodeID,
    private newPosition: { x: number; y: number },
    private offset: { x: number; y: number } = { x: 0, y: 0 }
  ) {}

  /**
   * FR: Récupère récursivement tous les descendants d'un nœud
   * EN: Recursively get all descendants of a node
   */
  private getAllDescendants(nodeId: NodeID, nodes: Record<NodeID, MindNode>): NodeID[] {
    const descendants: NodeID[] = [];
    const node = nodes[nodeId];

    if (!node?.children) return descendants;

    const traverse = (currentNodeId: NodeID) => {
      const currentNode = nodes[currentNodeId];
      if (currentNode?.children) {
        currentNode.children.forEach(childId => {
          descendants.push(childId);
          traverse(childId);
        });
      }
    };

    traverse(nodeId);
    return descendants;
  }

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Calculer tous les descendants du nœud
      // EN: Calculate all descendants of the node
      const allNodesToMove = [this.nodeId, ...this.getAllDescendants(this.nodeId, draft.nodes)];

      // FR: Sauvegarder les positions précédentes pour undo
      // EN: Save previous positions for undo
      allNodesToMove.forEach(nodeId => {
        const currentNode = draft.nodes[nodeId];
        if (currentNode) {
          this.previousPositions[nodeId] = {
            x: currentNode.x || 0,
            y: currentNode.y || 0,
          };
        }
      });

      // FR: Appliquer la translation à tous les nœuds de l'arborescence
      // EN: Apply translation to all nodes in the subtree
      allNodesToMove.forEach(nodeId => {
        const currentNode = draft.nodes[nodeId];
        if (currentNode) {
          // FR: Pour le nœud principal, utiliser la nouvelle position
          // EN: For the main node, use the new position
          if (nodeId === this.nodeId) {
            currentNode.x = this.newPosition.x;
            currentNode.y = this.newPosition.y;
          } else {
            // FR: Pour les descendants, appliquer le même décalage
            // EN: For descendants, apply the same offset
            const originalPos = this.previousPositions[nodeId];
            if (originalPos) {
              currentNode.x = originalPos.x + this.offset.x;
              currentNode.y = originalPos.y + this.offset.y;
            }
          }
        }
      });
    });
  }

  undo(state: MindMap): MindMap {
    return produce(state, draft => {
      // FR: Restaurer toutes les positions précédentes
      // EN: Restore all previous positions
      Object.entries(this.previousPositions).forEach(([nodeId, position]) => {
        const node = draft.nodes[nodeId];
        if (node) {
          node.x = position.x;
          node.y = position.y;
        }
      });
    });
  }

  get description(): string {
    return `Déplacer le nœud vers (${this.newPosition.x}, ${this.newPosition.y})`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour réordonner les enfants (siblings) d'un même parent
// EN: Command to reorder children (siblings) of the same parent
export class ReorderSiblingCommand implements Command {
  private previousIndex: number = -1;

  constructor(
    private nodeId: NodeID,
    private targetSiblingId: NodeID,
    private insertBefore: boolean // true = insérer avant, false = insérer après
  ) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      const targetSibling = draft.nodes[this.targetSiblingId];

      if (!node || !targetSibling) {
        console.error('Node or target sibling not found');
        return;
      }

      // FR: Vérifier qu'ils ont le même parent
      // EN: Check they have the same parent
      if (node.parentId !== targetSibling.parentId) {
        console.error('Nodes do not have the same parent');
        return;
      }

      const parentId = node.parentId;
      if (!parentId) {
        console.error('Cannot reorder root node');
        return;
      }

      const parent = draft.nodes[parentId];
      if (!parent || !parent.children) {
        console.error('Parent not found or has no children');
        return;
      }

      // FR: Trouver les index actuels
      // EN: Find current indices
      const currentIndex = parent.children.indexOf(this.nodeId);
      const targetIndex = parent.children.indexOf(this.targetSiblingId);

      if (currentIndex === -1 || targetIndex === -1) {
        console.error('Node or target not found in parent children');
        return;
      }

      // FR: Sauvegarder l'index précédent pour undo
      // EN: Save previous index for undo
      this.previousIndex = currentIndex;

      // FR: Retirer le nœud de sa position actuelle
      // EN: Remove node from current position
      parent.children.splice(currentIndex, 1);

      // FR: Calculer le nouvel index après retrait
      // EN: Calculate new index after removal
      let newTargetIndex = parent.children.indexOf(this.targetSiblingId);

      // FR: Insérer avant ou après la cible
      // EN: Insert before or after target
      if (this.insertBefore) {
        parent.children.splice(newTargetIndex, 0, this.nodeId);
      } else {
        parent.children.splice(newTargetIndex + 1, 0, this.nodeId);
      }

      console.log(`🔄 Reordered ${this.nodeId}: ${currentIndex} → ${this.insertBefore ? newTargetIndex : newTargetIndex + 1}`);
    });
  }

  undo(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node || !node.parentId || this.previousIndex === -1) return;

      const parent = draft.nodes[node.parentId];
      if (!parent || !parent.children) return;

      // FR: Retirer le nœud de sa position actuelle
      // EN: Remove node from current position
      const currentIndex = parent.children.indexOf(this.nodeId);
      if (currentIndex !== -1) {
        parent.children.splice(currentIndex, 1);
      }

      // FR: Réinsérer à l'index précédent
      // EN: Reinsert at previous index
      parent.children.splice(this.previousIndex, 0, this.nodeId);
    });
  }

  get description(): string {
    return `Réordonner ${this.nodeId} ${this.insertBefore ? 'avant' : 'après'} ${this.targetSiblingId}`;
  }

  get timestamp(): number {
    return Date.now();
  }
}
