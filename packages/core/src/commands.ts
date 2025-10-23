/**
 * FR: Commandes pour le pattern Command (undo/redo)
 * EN: Commands for Command pattern (undo/redo)
 */

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

// FR: Commande pour ajouter un tag à un nœud
// EN: Command to add a tag to a node
export class AddTagCommand implements Command {
  private wasAdded: boolean = false;

  constructor(
    private nodeId: NodeID,
    private tag: string
  ) {}

  execute(state: MindMap): MindMap {
    console.log('🏷️ AddTagCommand: Début de l\'exécution - nœud:', this.nodeId, 'tag:', this.tag);

    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) {
        console.log('❌ AddTagCommand: Nœud non trouvé:', this.nodeId);
        return;
      }

      // FR: Initialiser le tableau de tags si nécessaire
      // EN: Initialize tags array if needed
      if (!node.tags) {
        node.tags = [];
        console.log('🏷️ AddTagCommand: Tags initialisés pour le nœud:', this.nodeId);
      }

      // FR: Ajouter le tag seulement s'il n'existe pas déjà
      // EN: Add tag only if it doesn't already exist
      if (!node.tags.includes(this.tag)) {
        node.tags.push(this.tag);
        this.wasAdded = true;
        console.log('✅ AddTagCommand: Tag ajouté - nœud:', this.nodeId, 'tag:', this.tag);

        // FR: Émettre l'événement pour la synchronisation avec le DAG
        // EN: Emit event for DAG synchronization
        console.log('🔥 AddTagCommand: Émission de node:tagged - nœud:', this.nodeId, 'tag:', this.tag);
        // Note: L'événement sera émis par le composant parent qui utilise cette commande
      } else {
        console.log('ℹ️ AddTagCommand: Tag déjà présent - nœud:', this.nodeId, 'tag:', this.tag);
      }
    });
  }

  undo(state: MindMap): MindMap {
    if (!this.wasAdded) return state;

    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node || !node.tags) return;

      // FR: Retirer le tag
      // EN: Remove the tag
      node.tags = node.tags.filter(t => t !== this.tag);
    });
  }

  get description(): string {
    return `Ajouter le tag "${this.tag}"`;
  }

  get timestamp(): number {
    return Date.now();
  }
}

// FR: Commande pour retirer un tag d'un nœud
// EN: Command to remove a tag from a node
export class RemoveTagCommand implements Command {
  private wasRemoved: boolean = false;

  constructor(
    private nodeId: NodeID,
    private tag: string
  ) {}

  execute(state: MindMap): MindMap {
    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node || !node.tags) return;

      // FR: Retirer le tag s'il existe
      // EN: Remove tag if it exists
      if (node.tags.includes(this.tag)) {
        node.tags = node.tags.filter(t => t !== this.tag);
        this.wasRemoved = true;
      }
    });
  }

  undo(state: MindMap): MindMap {
    if (!this.wasRemoved) return state;

    return produce(state, draft => {
      const node = draft.nodes[this.nodeId];
      if (!node) return;

      // FR: Réajouter le tag
      // EN: Re-add the tag
      if (!node.tags) {
        node.tags = [];
      }
      if (!node.tags.includes(this.tag)) {
        node.tags.push(this.tag);
      }
    });
  }

  get description(): string {
    return `Retirer le tag "${this.tag}"`;
  }

  get timestamp(): number {
    return Date.now();
  }
}
