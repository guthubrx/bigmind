/**
 * Migration Manager
 * Handles schema migrations for plugin data with automatic path finding
 */

/* eslint-disable max-classes-per-file */

import type { MigrationFunction } from './fileFormat';

/**
 * Migration path entry
 */
interface MigrationPathEntry {
  from: string;
  to: string;
  migrator: MigrationFunction;
}

/**
 * Migration graph node for path finding
 */
interface GraphNode {
  version: string;
  edges: Array<{ to: string; migrator: MigrationFunction }>;
}

/**
 * Migration Manager
 * Manages versioned migrations with automatic path calculation
 */
export class MigrationManager {
  private migrations: Map<string, MigrationPathEntry> = new Map();

  private graph: Map<string, GraphNode> = new Map();

  /**
   * Register a migration from one version to another
   */
  registerMigration(fromVersion: string, toVersion: string, migrator: MigrationFunction): void {
    const key = `${fromVersion}->${toVersion}`;

    // Store migration
    this.migrations.set(key, { from: fromVersion, to: toVersion, migrator });

    // Update graph
    if (!this.graph.has(fromVersion)) {
      this.graph.set(fromVersion, { version: fromVersion, edges: [] });
    }

    const node = this.graph.get(fromVersion)!;
    // Remove existing edge if any
    node.edges = node.edges.filter(e => e.to !== toVersion);
    // Add new edge
    node.edges.push({ to: toVersion, migrator });
  }

  /**
   * Find migration path from one version to another
   * Uses breadth-first search to find shortest path
   */
  private findMigrationPath(fromVersion: string, toVersion: string): MigrationPathEntry[] | null {
    // Direct migration exists
    const directKey = `${fromVersion}->${toVersion}`;
    if (this.migrations.has(directKey)) {
      return [this.migrations.get(directKey)!];
    }

    // BFS to find shortest path
    const queue: Array<{ version: string; path: MigrationPathEntry[] }> = [
      { version: fromVersion, path: [] },
    ];
    const visited = new Set<string>([fromVersion]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = this.graph.get(current.version);

      if (!node) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const edge of node.edges) {
        if (visited.has(edge.to)) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const newPath = [
          ...current.path,
          {
            from: current.version,
            to: edge.to,
            migrator: edge.migrator,
          },
        ];

        if (edge.to === toVersion) {
          return newPath;
        }

        visited.add(edge.to);
        queue.push({ version: edge.to, path: newPath });
      }
    }

    // No path found
    return null;
  }

  /**
   * Execute migration from one version to another
   * Automatically finds and executes migration path
   */
  async migrate(
    data: any,
    fromVersion: string,
    toVersion: string
  ): Promise<{
    data: any;
    migrationHistory: string[];
    success: boolean;
    error?: string;
  }> {
    // Already at target version
    if (fromVersion === toVersion) {
      return {
        data,
        migrationHistory: [],
        success: true,
      };
    }

    // Find migration path
    const path = this.findMigrationPath(fromVersion, toVersion);

    if (!path) {
      return {
        data,
        migrationHistory: [],
        success: false,
        error: `No migration path found from ${fromVersion} to ${toVersion}`,
      };
    }

    // Execute migrations in sequence
    let currentData = data;
    const history: string[] = [];

    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const step of path) {
        const migrationKey = `${step.from}->${step.to}`;
        // eslint-disable-next-line no-console
        // console.log(`[MigrationManager] Executing migration: ${migrationKey}`);

        // eslint-disable-next-line no-await-in-loop
        currentData = await step.migrator(currentData);
        history.push(migrationKey);
      }

      return {
        data: currentData,
        migrationHistory: history,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[MigrationManager] Migration failed:', errorMessage);

      return {
        data: currentData,
        migrationHistory: history,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if migration is possible
   */
  canMigrate(fromVersion: string, toVersion: string): boolean {
    if (fromVersion === toVersion) return true;
    return this.findMigrationPath(fromVersion, toVersion) !== null;
  }

  /**
   * Get all registered migrations
   */
  getRegisteredMigrations(): Array<{ from: string; to: string }> {
    return Array.from(this.migrations.values()).map(m => ({
      from: m.from,
      to: m.to,
    }));
  }

  /**
   * Clear all migrations (useful for testing)
   */
  clear(): void {
    this.migrations.clear();
    this.graph.clear();
  }
}

/**
 * Global migration manager registry
 * Maps plugin ID to its migration manager
 */
class MigrationManagerRegistry {
  private managers: Map<string, MigrationManager> = new Map();

  /**
   * Get or create migration manager for a plugin
   */
  getManager(pluginId: string): MigrationManager {
    if (!this.managers.has(pluginId)) {
      this.managers.set(pluginId, new MigrationManager());
    }
    return this.managers.get(pluginId)!;
  }

  /**
   * Clear manager for a plugin
   */
  clearManager(pluginId: string): void {
    this.managers.delete(pluginId);
  }

  /**
   * Clear all managers
   */
  clearAll(): void {
    this.managers.clear();
  }
}

// Singleton registry
export const migrationRegistry = new MigrationManagerRegistry();
