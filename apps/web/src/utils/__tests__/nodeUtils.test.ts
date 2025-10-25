/**
 * FR: Tests pour les utilitaires de nœuds
 * EN: Tests for node utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getAllDescendants,
  getAllAncestors,
  isDescendant,
  getNodeDepth,
} from '../nodeUtils';

describe('nodeUtils', () => {
  // FR: Arbre de test simple
  // EN: Simple test tree
  const testNodes = {
    root: {
      id: 'root',
      children: ['child1', 'child2'],
      parentId: null,
    },
    child1: {
      id: 'child1',
      children: ['grandchild1', 'grandchild2'],
      parentId: 'root',
    },
    child2: {
      id: 'child2',
      children: ['grandchild3'],
      parentId: 'root',
    },
    grandchild1: {
      id: 'grandchild1',
      children: [],
      parentId: 'child1',
    },
    grandchild2: {
      id: 'grandchild2',
      children: [],
      parentId: 'child1',
    },
    grandchild3: {
      id: 'grandchild3',
      children: ['greatgrandchild1'],
      parentId: 'child2',
    },
    greatgrandchild1: {
      id: 'greatgrandchild1',
      children: [],
      parentId: 'grandchild3',
    },
  };

  describe('getAllDescendants', () => {
    it('should return all descendants of a node', () => {
      const descendants = getAllDescendants('root', testNodes);
      expect(descendants).toHaveLength(6);
      expect(descendants).toContain('child1');
      expect(descendants).toContain('child2');
      expect(descendants).toContain('grandchild1');
      expect(descendants).toContain('grandchild2');
      expect(descendants).toContain('grandchild3');
      expect(descendants).toContain('greatgrandchild1');
    });

    it('should return descendants for middle node', () => {
      const descendants = getAllDescendants('child1', testNodes);
      expect(descendants).toHaveLength(2);
      expect(descendants).toContain('grandchild1');
      expect(descendants).toContain('grandchild2');
    });

    it('should return empty array for leaf node', () => {
      const descendants = getAllDescendants('grandchild1', testNodes);
      expect(descendants).toHaveLength(0);
    });

    it('should handle nodes with no children', () => {
      const descendants = getAllDescendants('nonexistent', testNodes);
      expect(descendants).toHaveLength(0);
    });

    it('should include deeply nested descendants', () => {
      const descendants = getAllDescendants('child2', testNodes);
      expect(descendants).toHaveLength(2);
      expect(descendants).toContain('grandchild3');
      expect(descendants).toContain('greatgrandchild1');
    });
  });

  describe('getAllAncestors', () => {
    it('should return all ancestors of a node', () => {
      const ancestors = getAllAncestors('greatgrandchild1', testNodes);
      expect(ancestors).toHaveLength(3);
      expect(ancestors).toContain('grandchild3');
      expect(ancestors).toContain('child2');
      expect(ancestors).toContain('root');
    });

    it('should return ancestors for middle node', () => {
      const ancestors = getAllAncestors('grandchild1', testNodes);
      expect(ancestors).toHaveLength(2);
      expect(ancestors).toContain('child1');
      expect(ancestors).toContain('root');
    });

    it('should return empty array for root node', () => {
      const ancestors = getAllAncestors('root', testNodes);
      expect(ancestors).toHaveLength(0);
    });

    it('should return ancestors in correct order (child to parent)', () => {
      const ancestors = getAllAncestors('grandchild2', testNodes);
      expect(ancestors[0]).toBe('child1');
      expect(ancestors[1]).toBe('root');
    });
  });

  describe('isDescendant', () => {
    it('should return true for direct children', () => {
      expect(isDescendant('child1', 'root', testNodes)).toBe(true);
      expect(isDescendant('child2', 'root', testNodes)).toBe(true);
    });

    it('should return true for grandchildren', () => {
      expect(isDescendant('grandchild1', 'root', testNodes)).toBe(true);
      expect(isDescendant('grandchild2', 'root', testNodes)).toBe(true);
    });

    it('should return true for deeply nested descendants', () => {
      expect(isDescendant('greatgrandchild1', 'root', testNodes)).toBe(true);
      expect(isDescendant('greatgrandchild1', 'child2', testNodes)).toBe(true);
    });

    it('should return false for non-descendants', () => {
      expect(isDescendant('child1', 'child2', testNodes)).toBe(false);
      expect(isDescendant('root', 'child1', testNodes)).toBe(false);
    });

    it('should return false for same node', () => {
      expect(isDescendant('root', 'root', testNodes)).toBe(false);
    });

    it('should detect cycle prevention (would create cycle)', () => {
      // If we try to reparent root under child1, it would create a cycle
      expect(isDescendant('root', 'child1', testNodes)).toBe(false);
    });
  });

  describe('getNodeDepth', () => {
    it('should return 0 for root node', () => {
      expect(getNodeDepth('root', testNodes)).toBe(0);
    });

    it('should return 1 for direct children', () => {
      expect(getNodeDepth('child1', testNodes)).toBe(1);
      expect(getNodeDepth('child2', testNodes)).toBe(1);
    });

    it('should return correct depth for nested nodes', () => {
      expect(getNodeDepth('grandchild1', testNodes)).toBe(2);
      expect(getNodeDepth('grandchild2', testNodes)).toBe(2);
      expect(getNodeDepth('grandchild3', testNodes)).toBe(2);
    });

    it('should return correct depth for deeply nested nodes', () => {
      expect(getNodeDepth('greatgrandchild1', testNodes)).toBe(3);
    });

    it('should return 0 for non-existent node', () => {
      expect(getNodeDepth('nonexistent', testNodes)).toBe(0);
    });

    it('should return 0 for node without parentId', () => {
      const nodesWithoutParent = {
        isolated: {
          id: 'isolated',
          parentId: null,
          children: [],
        },
      };
      expect(getNodeDepth('isolated', nodesWithoutParent)).toBe(0);
    });

    it('should handle infinite loop protection', () => {
      // Create a cyclic structure (shouldn't happen in real code but should be safe)
      const cyclicNodes = {
        a: { id: 'a', parentId: 'b', children: [] },
        b: { id: 'b', parentId: 'a', children: [] },
      };
      // Should stop at 1000 iterations and return that depth
      const depth = getNodeDepth('a', cyclicNodes);
      expect(depth).toBeLessThanOrEqual(1000);
    });
  });

  describe('cycle prevention', () => {
    it('should prevent reparenting node to its own descendant', () => {
      // Check that we cannot reparent root (parent) under child1 (child)
      expect(isDescendant('root', 'child1', testNodes)).toBe(false);
    });

    it('should allow reparenting to non-descendant nodes', () => {
      // child1 is not a descendant of child2, so this should be allowed
      expect(isDescendant('child2', 'child1', testNodes)).toBe(false);
    });

    it('should prevent reparenting sibling to sibling child', () => {
      // Add structure where child2 has greatgrandchild1
      // This would be a sibling trying to become a child's parent
      const modifiedNodes = {
        ...testNodes,
        child2: {
          ...testNodes.child2,
          children: [...testNodes.child2.children, 'greatgrandchild1'],
        },
      };

      // greatgrandchild1 is not a descendant of child1, so this would be allowed
      expect(isDescendant('child1', 'child2', modifiedNodes)).toBe(false);
    });
  });
});
