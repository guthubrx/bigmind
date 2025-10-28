/**
 * Registry for Node Style Computers
 * Allows plugins to register functions that compute node styles synchronously
 */

export interface NodeStyleContext {
  nodeId: string;
  nodes: Record<string, any>;
  rootId: string;
  level: number;
  isPrimary: boolean;
}

export interface ComputedNodeStyle {
  backgroundColor?: string;
  textColor?: string;
}

type StyleComputerFn = (nodeData: any, context: NodeStyleContext) => ComputedNodeStyle | undefined;

class NodeStyleRegistry {
  private computers: Array<{ pluginId: string; fn: StyleComputerFn; priority: number }> = [];

  /**
   * Register a style computer function
   * @param pluginId - ID of the plugin registering the function
   * @param fn - Function that computes styles for a node
   * @param priority - Priority (lower = earlier, default 10)
   * @returns Unregister function
   */
  register(pluginId: string, fn: StyleComputerFn, priority: number = 10): () => void {
    this.computers.push({ pluginId, fn, priority });
    // Sort by priority
    this.computers.sort((a, b) => a.priority - b.priority);

    // Return unregister function
    return () => {
      this.computers = this.computers.filter(c => c.fn !== fn);
    };
  }

  /**
   * Compute styles for a node by calling all registered computers
   * Later computers can override earlier ones
   */
  compute(nodeData: any, context: NodeStyleContext): ComputedNodeStyle {
    let result: ComputedNodeStyle = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const computer of this.computers) {
      try {
        const computed = computer.fn(nodeData, context);
        if (computed) {
          result = { ...result, ...computed };
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[NodeStyleRegistry] Error in ${computer.pluginId}:`, error);
      }
    }

    return result;
  }

  /**
   * Get all registered computers (for debugging)
   */
  getRegistered(): string[] {
    return this.computers.map(c => c.pluginId);
  }

  /**
   * Clear all registered computers
   */
  clear(): void {
    this.computers = [];
  }
}

// Global singleton instance
export const nodeStyleRegistry = new NodeStyleRegistry();
