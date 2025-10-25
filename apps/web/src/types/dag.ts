/**
 * FR: Types sémantiques pour le système DAG
 * EN: Semantic types for DAG system
 */

/**
 * FR: Types de relations dans le DAG
 * EN: Relationship types in DAG
 */
export enum RelationType {
  // FR: Relation de hiérarchie (parent-enfant)
  // EN: Hierarchy relationship (parent-child)
  IS_TYPE_OF = 'is-type-of',

  // FR: Relation générique
  // EN: Generic relationship
  IS_RELATED_TO = 'is-related-to',

  // FR: Relation de composition
  // EN: Composition relationship
  IS_PART_OF = 'is-part-of',
}

/**
 * FR: Interface pour les tags dans le DAG
 * EN: Interface for tags in DAG
 */
export interface DagTag {
  id: string;
  label: string;
  color?: string;
  // FR: Identifiants des parents (multi-parent DAG)
  // EN: Parent identifiers (multi-parent DAG)
  parentIds: string[];
  // FR: Identifiants des enfants (calculés ou explicit)
  // EN: Child identifiers (calculated or explicit)
  children: string[];
  relations: DagLink[];
  createdAt?: number;
  updatedAt?: number;
}

/**
 * FR: Interface pour les liens dans le DAG
 * EN: Interface for links in DAG
 */
export interface DagLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  metadata?: Record<string, any>;
}

/**
 * FR: Interface pour l'état du store DAG
 * EN: Interface for DAG store state
 */
export interface DagState {
  tags: Record<string, DagTag>;
  links: DagLink[];
}

/**
 * FR: Utilitaires pour validation du DAG
 * EN: Utilities for DAG validation
 */
export const DagValidation = {
  /**
   * FR: Vérifier s'il y a un cycle dans le DAG
   * EN: Check if there's a cycle in the DAG
   */
  hasCycle(tags: Record<string, DagTag>, startId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const visit = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const tag = tags[nodeId];
      if (!tag) return false;

      let hasCycleFound = false;
      tag.children.forEach(childId => {
        if (hasCycleFound) return;
        if (!visited.has(childId)) {
          if (visit(childId)) {
            hasCycleFound = true;
          }
        } else if (recursionStack.has(childId)) {
          hasCycleFound = true;
        }
      });

      recursionStack.delete(nodeId);
      return hasCycleFound;
    };

    return visit(startId);
  },

  /**
   * FR: Valider la structure DAG complète
   * EN: Validate complete DAG structure
   */
  validateDAG(tags: Record<string, DagTag>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // FR: Vérifier l'intégrité des références
    // EN: Check reference integrity
    const tagEntries = Object.entries(tags);
    for (let i = 0; i < tagEntries.length; i += 1) {
      const [tagId, tag] = tagEntries[i];
      if (tag.id !== tagId) {
        errors.push(`Tag ID mismatch: ${tagId} vs ${tag.id}`);
      }

      // FR: Vérifier que tous les parents existent
      // EN: Check that all parents exist
      const parentIds = tag.parentIds || [];
      for (let j = 0; j < parentIds.length; j += 1) {
        const parentId = parentIds[j];
        if (!tags[parentId]) {
          errors.push(`Tag ${tagId} references non-existent parent ${parentId}`);
        } else if (!tags[parentId].children.includes(tagId)) {
          errors.push(`Parent ${parentId} does not include ${tagId} in children`);
        }
      }

      // FR: Vérifier que tous les enfants existent et nous listent comme parent
      // EN: Check that all children exist and list us as parent
      const childIds = tag.children;
      for (let j = 0; j < childIds.length; j += 1) {
        const childId = childIds[j];
        if (!tags[childId]) {
          errors.push(`Tag ${tagId} references non-existent child ${childId}`);
        } else if (!tags[childId].parentIds.includes(tagId)) {
          errors.push(`Child ${childId} does not include ${tagId} in parentIds`);
        }
      }

      // FR: Vérifier les cycles
      // EN: Check for cycles
      if (this.hasCycle(tags, tagId)) {
        errors.push(`Cycle detected starting from tag ${tagId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * FR: Obtenir tous les ancêtres d'une balise
   * EN: Get all ancestors of a tag
   */
  getAncestors(tags: Record<string, DagTag>, tagId: string): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const tag = tags[currentId];
      if (tag?.parentIds && tag.parentIds.length > 0) {
        tag.parentIds.forEach(parentId => {
          if (!ancestors.includes(parentId)) {
            ancestors.push(parentId);
          }
          traverse(parentId);
        });
      }
    };

    traverse(tagId);
    return ancestors;
  },

  /**
   * FR: Obtenir tous les descendants d'une balise
   * EN: Get all descendants of a tag
   */
  getDescendants(tags: Record<string, DagTag>, tagId: string): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const tag = tags[currentId];
      tag?.children.forEach(childId => {
        descendants.push(childId);
        traverse(childId);
      });
    };

    traverse(tagId);
    return descendants;
  },
};
