/**
 * Dependency Graph
 * Graph structure for plugin dependencies with cycle detection
 * Phase 4 - Sprint 3 - CORE
 */

export interface GraphNode {
  id: string;
  version: string;
  dependencies: string[];
}

export interface CycleInfo {
  cycle: string[];
  startIndex: number;
}

/**
 * DependencyGraph - DAG structure for dependencies
 */
export class DependencyGraph {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, Set<string>>();

  /**
   * Add node to graph
   */
  addNode(id: string, version: string, dependencies: string[] = []): void {
    this.nodes.set(id, { id, version, dependencies });

    if (!this.edges.has(id)) {
      this.edges.set(id, new Set());
    }

    for (const dep of dependencies) {
      this.edges.get(id)!.add(dep);
    }
  }

  /**
   * Get node by ID
   */
  getNode(id: string): GraphNode | null {
    return this.nodes.get(id) || null;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get direct dependencies of a node
   */
  getDependencies(id: string): string[] {
    return Array.from(this.edges.get(id) || []);
  }

  /**
   * Get all transitive dependencies
   */
  getTransitiveDependencies(id: string): Set<string> {
    const visited = new Set<string>();
    const stack = [id];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const deps = this.edges.get(current) || new Set();
      for (const dep of deps) {
        if (!visited.has(dep)) {
          stack.push(dep);
        }
      }
    }

    visited.delete(id); // Remove self
    return visited;
  }

  /**
   * Detect cycles in graph
   */
  detectCycles(): CycleInfo | null {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const cycle = this.detectCyclesDFS(nodeId, visited, recursionStack, path);
        if (cycle) {
          return cycle;
        }
      }
    }

    return null;
  }

  /**
   * DFS cycle detection helper
   */
  private detectCyclesDFS(
    nodeId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): CycleInfo | null {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = this.edges.get(nodeId) || new Set();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const cycle = this.detectCyclesDFS(neighbor, visited, recursionStack, path);
        if (cycle) {
          return cycle;
        }
      } else if (recursionStack.has(neighbor)) {
        // Found cycle
        const startIndex = path.indexOf(neighbor);
        const cycle = path.slice(startIndex);
        cycle.push(neighbor); // Complete the cycle
        return { cycle, startIndex };
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return null;
  }

  /**
   * Topological sort (install order)
   */
  topologicalSort(): string[] | null {
    // Check for cycles first
    if (this.detectCycles()) {
      return null;
    }

    const visited = new Set<string>();
    const stack: string[] = [];

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        this.topologicalSortDFS(nodeId, visited, stack);
      }
    }

    return stack.reverse();
  }

  /**
   * DFS helper for topological sort
   */
  private topologicalSortDFS(
    nodeId: string,
    visited: Set<string>,
    stack: string[]
  ): void {
    visited.add(nodeId);

    const neighbors = this.edges.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.topologicalSortDFS(neighbor, visited, stack);
      }
    }

    stack.push(nodeId);
  }

  /**
   * Check if node exists
   */
  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  /**
   * Remove node from graph
   */
  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) {
      return false;
    }

    this.nodes.delete(id);
    this.edges.delete(id);

    // Remove edges pointing to this node
    for (const edges of this.edges.values()) {
      edges.delete(id);
    }

    return true;
  }

  /**
   * Clear graph
   */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    hasCycles: boolean;
  } {
    let edgeCount = 0;
    for (const edges of this.edges.values()) {
      edgeCount += edges.size;
    }

    return {
      nodeCount: this.nodes.size,
      edgeCount,
      hasCycles: this.detectCycles() !== null,
    };
  }
}

/**
 * Create dependency graph
 */
export function createDependencyGraph(): DependencyGraph {
  return new DependencyGraph();
}
