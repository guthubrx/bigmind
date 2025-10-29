/**
 * Dependency Resolver
 * Resolves plugin dependencies with conflict detection
 * Phase 4 - Sprint 3 - CORE
 */

import type { PluginManifest } from '@bigmind/plugin-system';
import { DependencyGraph } from './DependencyGraph';
import { VersionResolver } from './VersionResolver';

export interface ResolvedDependency {
  id: string;
  version: string;
  resolved: string; // Actual version installed
  manifest?: PluginManifest;
}

export interface ResolutionResult {
  dependencies: ResolvedDependency[];
  installOrder: string[];
  conflicts: DependencyConflict[];
}

export interface DependencyConflict {
  plugin: string;
  requiredBy: string[];
  versions: string[];
  resolved?: string;
}

export interface ResolverOptions {
  strategy?: 'latest' | 'locked' | 'range';
  allowPrerelease?: boolean;
  lockfile?: Record<string, string>;
}

/**
 * DependencyResolver - Resolve plugin dependencies
 */
export class DependencyResolver {
  private versionResolver: VersionResolver;
  private options: Required<ResolverOptions>;

  constructor(options: ResolverOptions = {}) {
    this.versionResolver = new VersionResolver();
    this.options = {
      strategy: options.strategy || 'latest',
      allowPrerelease: options.allowPrerelease || false,
      lockfile: options.lockfile || {},
    };
  }

  /**
   * Resolve dependencies for a plugin
   */
  async resolve(
    manifest: PluginManifest,
    availablePlugins: Map<string, PluginManifest[]>
  ): Promise<ResolutionResult> {
    const graph = new DependencyGraph();
    const resolved = new Map<string, ResolvedDependency>();
    const conflicts: DependencyConflict[] = [];

    // Add root plugin
    const rootDeps = this.extractDependencies(manifest);
    graph.addNode(manifest.id, manifest.version, rootDeps.map(d => d.id));

    // Resolve dependencies recursively
    await this.resolveDependencies(
      manifest.id,
      manifest,
      availablePlugins,
      graph,
      resolved,
      conflicts
    );

    // Check for cycles
    const cycleInfo = graph.detectCycles();
    if (cycleInfo) {
      throw new Error(`Circular dependency detected: ${cycleInfo.cycle.join(' -> ')}`);
    }

    // Get install order
    const installOrder = graph.topologicalSort();
    if (!installOrder) {
      throw new Error('Failed to compute install order');
    }

    // Remove root plugin from install order
    const filteredOrder = installOrder.filter(id => id !== manifest.id);

    return {
      dependencies: Array.from(resolved.values()),
      installOrder: filteredOrder,
      conflicts,
    };
  }

  /**
   * Recursively resolve dependencies
   */
  private async resolveDependencies(
    parentId: string,
    parentManifest: PluginManifest,
    availablePlugins: Map<string, PluginManifest[]>,
    graph: DependencyGraph,
    resolved: Map<string, ResolvedDependency>,
    conflicts: DependencyConflict[]
  ): Promise<void> {
    const dependencies = this.extractDependencies(parentManifest);

    for (const dep of dependencies) {
      // Check if already resolved
      if (resolved.has(dep.id)) {
        const existing = resolved.get(dep.id)!;

        // Check for version conflict
        // We need to check if the RESOLVED version satisfies the new range requirement
        if (!this.versionResolver.satisfies(existing.resolved, dep.version)) {
          this.addConflict(conflicts, dep.id, parentId, dep.version, existing.version);
        }

        continue;
      }

      // Get available versions
      const versions = availablePlugins.get(dep.id) || [];
      if (versions.length === 0) {
        throw new Error(`Dependency not found: ${dep.id}`);
      }

      // Resolve version
      const resolvedVersion = this.resolveVersion(dep.id, dep.version, versions);
      if (!resolvedVersion) {
        throw new Error(`No compatible version found for ${dep.id}@${dep.version}`);
      }

      const depManifest = versions.find(v => v.version === resolvedVersion);
      if (!depManifest) {
        throw new Error(`Manifest not found for ${dep.id}@${resolvedVersion}`);
      }

      // Add to resolved set
      resolved.set(dep.id, {
        id: dep.id,
        version: dep.version,
        resolved: resolvedVersion,
        manifest: depManifest,
      });

      // Add to graph
      const childDeps = this.extractDependencies(depManifest);
      graph.addNode(dep.id, resolvedVersion, childDeps.map(d => d.id));

      // Recurse
      await this.resolveDependencies(
        dep.id,
        depManifest,
        availablePlugins,
        graph,
        resolved,
        conflicts
      );
    }
  }

  /**
   * Extract dependencies from manifest
   */
  private extractDependencies(manifest: PluginManifest): Array<{ id: string; version: string }> {
    const deps: Array<{ id: string; version: string }> = [];

    if (manifest.dependencies) {
      for (const [id, version] of Object.entries(manifest.dependencies)) {
        deps.push({ id, version });
      }
    }

    return deps;
  }

  /**
   * Resolve version based on strategy
   */
  private resolveVersion(
    pluginId: string,
    versionRange: string,
    available: PluginManifest[]
  ): string | null {
    // Check lockfile first
    if (this.options.strategy === 'locked' && this.options.lockfile[pluginId]) {
      const locked = this.options.lockfile[pluginId];
      if (this.versionResolver.satisfies(locked, versionRange)) {
        return locked;
      }
    }

    // Filter by version range
    const compatibleVersions = available
      .map(m => m.version)
      .filter(v => this.versionResolver.satisfies(v, versionRange));

    if (compatibleVersions.length === 0) {
      return null;
    }

    // Filter prereleases if needed
    const filtered = this.options.allowPrerelease
      ? compatibleVersions
      : compatibleVersions.filter(v => !this.versionResolver.isPrerelease(v));

    if (filtered.length === 0) {
      return null;
    }

    // Sort and pick latest
    const sorted = filtered.sort((a, b) =>
      this.versionResolver.compare(a, b)
    );

    return sorted[sorted.length - 1];
  }

  /**
   * Add conflict to list
   */
  private addConflict(
    conflicts: DependencyConflict[],
    pluginId: string,
    requiredBy: string,
    newVersion: string,
    existingVersion: string
  ): void {
    let conflict = conflicts.find(c => c.plugin === pluginId);

    if (!conflict) {
      conflict = {
        plugin: pluginId,
        requiredBy: [],
        versions: [],
      };
      conflicts.push(conflict);
    }

    if (!conflict.requiredBy.includes(requiredBy)) {
      conflict.requiredBy.push(requiredBy);
    }

    if (!conflict.versions.includes(newVersion)) {
      conflict.versions.push(newVersion);
    }

    if (!conflict.versions.includes(existingVersion)) {
      conflict.versions.push(existingVersion);
    }
  }

  /**
   * Generate lockfile from resolved dependencies
   */
  generateLockfile(resolved: ResolvedDependency[]): Record<string, string> {
    const lockfile: Record<string, string> = {};

    for (const dep of resolved) {
      lockfile[dep.id] = dep.resolved;
    }

    return lockfile;
  }
}

/**
 * Create dependency resolver
 */
export function createDependencyResolver(options?: ResolverOptions): DependencyResolver {
  return new DependencyResolver(options);
}
