/**
 * DependencyGraph Tests
 * Phase 4 - Sprint 3
 */

import { describe, it, expect } from 'vitest';
import { DependencyGraph, createDependencyGraph } from '../DependencyGraph';

describe('DependencyGraph', () => {
  describe('Node Management', () => {
    it('should add node to graph', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);

      const node = graph.getNode('plugin-a');
      expect(node).toBeDefined();
      expect(node?.id).toBe('plugin-a');
      expect(node?.version).toBe('1.0.0');
      expect(node?.dependencies).toEqual(['plugin-b']);
    });

    it('should return null for non-existent node', () => {
      const graph = new DependencyGraph();
      expect(graph.getNode('nonexistent')).toBeNull();
    });

    it('should get all nodes', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0');
      graph.addNode('plugin-b', '2.0.0');

      const nodes = graph.getAllNodes();
      expect(nodes).toHaveLength(2);
      expect(nodes.map(n => n.id)).toContain('plugin-a');
      expect(nodes.map(n => n.id)).toContain('plugin-b');
    });

    it('should check if node exists', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0');

      expect(graph.hasNode('plugin-a')).toBe(true);
      expect(graph.hasNode('plugin-b')).toBe(false);
    });

    it('should remove node from graph', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0');

      const removed = graph.removeNode('plugin-a');
      expect(removed).toBe(true);
      expect(graph.hasNode('plugin-a')).toBe(false);
    });

    it('should return false when removing non-existent node', () => {
      const graph = new DependencyGraph();
      expect(graph.removeNode('nonexistent')).toBe(false);
    });

    it('should clear graph', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0');
      graph.addNode('plugin-b', '2.0.0');

      graph.clear();
      expect(graph.getAllNodes()).toHaveLength(0);
    });
  });

  describe('Dependencies', () => {
    it('should get direct dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b', 'plugin-c']);

      const deps = graph.getDependencies('plugin-a');
      expect(deps).toHaveLength(2);
      expect(deps).toContain('plugin-b');
      expect(deps).toContain('plugin-c');
    });

    it('should return empty array for node with no dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0');

      expect(graph.getDependencies('plugin-a')).toHaveLength(0);
    });

    it('should get transitive dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-c']);
      graph.addNode('plugin-c', '1.0.0');

      const transitive = graph.getTransitiveDependencies('plugin-a');
      expect(transitive.size).toBe(2);
      expect(transitive.has('plugin-b')).toBe(true);
      expect(transitive.has('plugin-c')).toBe(true);
    });

    it('should not include self in transitive dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0');

      const transitive = graph.getTransitiveDependencies('plugin-a');
      expect(transitive.has('plugin-a')).toBe(false);
    });
  });

  describe('Cycle Detection', () => {
    it('should detect direct cycle', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-a']);

      const cycle = graph.detectCycles();
      expect(cycle).not.toBeNull();
      expect(cycle?.cycle).toContain('plugin-a');
      expect(cycle?.cycle).toContain('plugin-b');
    });

    it('should detect indirect cycle', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-c']);
      graph.addNode('plugin-c', '1.0.0', ['plugin-a']);

      const cycle = graph.detectCycles();
      expect(cycle).not.toBeNull();
      expect(cycle?.cycle.length).toBeGreaterThan(0);
    });

    it('should return null when no cycles exist', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-c']);
      graph.addNode('plugin-c', '1.0.0');

      expect(graph.detectCycles()).toBeNull();
    });
  });

  describe('Topological Sort', () => {
    it('should compute topological sort', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-c']);
      graph.addNode('plugin-c', '1.0.0');

      const sorted = graph.topologicalSort();
      expect(sorted).not.toBeNull();
      expect(sorted).toHaveLength(3);

      // plugin-c should come before plugin-b, plugin-b before plugin-a
      const indexC = sorted!.indexOf('plugin-c');
      const indexB = sorted!.indexOf('plugin-b');
      const indexA = sorted!.indexOf('plugin-a');

      expect(indexC).toBeLessThan(indexB);
      expect(indexB).toBeLessThan(indexA);
    });

    it('should return null when cycle exists', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-a']);

      expect(graph.topologicalSort()).toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should get graph statistics', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b', 'plugin-c']);
      graph.addNode('plugin-b', '1.0.0');
      graph.addNode('plugin-c', '1.0.0');

      const stats = graph.getStats();
      expect(stats.nodeCount).toBe(3);
      expect(stats.edgeCount).toBe(2);
      expect(stats.hasCycles).toBe(false);
    });

    it('should detect cycles in statistics', () => {
      const graph = new DependencyGraph();
      graph.addNode('plugin-a', '1.0.0', ['plugin-b']);
      graph.addNode('plugin-b', '1.0.0', ['plugin-a']);

      const stats = graph.getStats();
      expect(stats.hasCycles).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should create graph via helper', () => {
      const graph = createDependencyGraph();
      expect(graph).toBeInstanceOf(DependencyGraph);
    });
  });
});
