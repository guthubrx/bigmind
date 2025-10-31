/**
 * DependencyResolver Tests
 * Phase 4 - Sprint 3
 */

import { describe, it, expect } from 'vitest';
import { DependencyResolver, createDependencyResolver } from '../DependencyResolver';
import type { PluginManifest } from '@cartae/plugin-system';

describe('DependencyResolver', () => {
  // Helper to create manifest
  const createManifest = (id: string, version: string, deps: Record<string, string> = {}): PluginManifest => ({
    id,
    name: id,
    version,
    description: 'Test plugin',
    author: { name: 'Test Author' },
    entrypoint: './index.js',
    dependencies: deps,
  });

  describe('Simple Resolution', () => {
    it('should resolve plugin with no dependencies', async () => {
      const resolver = new DependencyResolver();
      const manifest = createManifest('plugin-a', '1.0.0');
      const available = new Map();

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies).toHaveLength(0);
      expect(result.installOrder).toHaveLength(0);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should resolve plugin with one dependency', async () => {
      const resolver = new DependencyResolver();
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '1.0.0' });

      const depManifest = createManifest('plugin-b', '1.0.0');
      const available = new Map([
        ['plugin-b', [depManifest]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies).toHaveLength(1);
      expect(result.dependencies[0].id).toBe('plugin-b');
      expect(result.installOrder).toEqual(['plugin-b']);
    });

    it('should resolve transitive dependencies', async () => {
      const resolver = new DependencyResolver();
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '1.0.0' });

      const depB = createManifest('plugin-b', '1.0.0', { 'plugin-c': '1.0.0' });
      const depC = createManifest('plugin-c', '1.0.0');

      const available = new Map([
        ['plugin-b', [depB]],
        ['plugin-c', [depC]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies).toHaveLength(2);
      expect(result.installOrder).toContain('plugin-b');
      expect(result.installOrder).toContain('plugin-c');

      // plugin-c should be installed before plugin-b
      expect(result.installOrder.indexOf('plugin-c')).toBeLessThan(
        result.installOrder.indexOf('plugin-b')
      );
    });
  });

  describe('Version Resolution', () => {
    it('should resolve latest compatible version', async () => {
      const resolver = new DependencyResolver({ strategy: 'latest' });
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '^1.0.0' });

      const available = new Map([
        ['plugin-b', [
          createManifest('plugin-b', '1.0.0'),
          createManifest('plugin-b', '1.1.0'),
          createManifest('plugin-b', '1.2.0'),
        ]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies[0].resolved).toBe('1.2.0');
    });

    it('should respect lockfile when using locked strategy', async () => {
      const resolver = new DependencyResolver({
        strategy: 'locked',
        lockfile: { 'plugin-b': '1.0.0' },
      });

      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '^1.0.0' });

      const available = new Map([
        ['plugin-b', [
          createManifest('plugin-b', '1.0.0'),
          createManifest('plugin-b', '1.2.0'),
        ]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies[0].resolved).toBe('1.0.0');
    });

    it('should filter out prereleases by default', async () => {
      const resolver = new DependencyResolver({ allowPrerelease: false });
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '^1.0.0' });

      const available = new Map([
        ['plugin-b', [
          createManifest('plugin-b', '1.0.0'),
          createManifest('plugin-b', '1.1.0-alpha.1'),
          createManifest('plugin-b', '1.0.5'),
        ]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies[0].resolved).toBe('1.0.5');
    });

    it('should allow prereleases when enabled', async () => {
      const resolver = new DependencyResolver({ allowPrerelease: true });
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '^1.0.0' });

      const available = new Map([
        ['plugin-b', [
          createManifest('plugin-b', '1.0.0'),
          createManifest('plugin-b', '1.1.0-alpha.1'),
        ]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies[0].resolved).toBe('1.1.0-alpha.1');
    });
  });

  describe('Conflict Detection', () => {
    it('should detect version conflicts', async () => {
      const resolver = new DependencyResolver();

      // plugin-a depends on plugin-c@^1.0.0
      // plugin-b depends on plugin-c@^2.0.0
      // This should create a conflict
      const manifest = createManifest('plugin-root', '1.0.0', {
        'plugin-a': '1.0.0',
        'plugin-b': '1.0.0',
      });

      const depA = createManifest('plugin-a', '1.0.0', { 'plugin-c': '^1.0.0' });
      const depB = createManifest('plugin-b', '1.0.0', { 'plugin-c': '^2.0.0' });
      const depC1 = createManifest('plugin-c', '1.0.0');
      const depC2 = createManifest('plugin-c', '2.0.0');

      const available = new Map([
        ['plugin-a', [depA]],
        ['plugin-b', [depB]],
        ['plugin-c', [depC1, depC2]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.conflicts[0].plugin).toBe('plugin-c');
    });

    it('should not conflict when versions are compatible', async () => {
      const resolver = new DependencyResolver();

      const manifest = createManifest('plugin-root', '1.0.0', {
        'plugin-a': '1.0.0',
        'plugin-b': '1.0.0',
      });

      const depA = createManifest('plugin-a', '1.0.0', { 'plugin-c': '^1.0.0' });
      const depB = createManifest('plugin-b', '1.0.0', { 'plugin-c': '^1.1.0' });
      const depC = createManifest('plugin-c', '1.2.0');

      const available = new Map([
        ['plugin-a', [depA]],
        ['plugin-b', [depB]],
        ['plugin-c', [depC]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('Cycle Detection', () => {
    it('should detect circular dependencies', async () => {
      const resolver = new DependencyResolver();

      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '1.0.0' });
      const depB = createManifest('plugin-b', '1.0.0', { 'plugin-c': '1.0.0' });
      const depC = createManifest('plugin-c', '1.0.0', { 'plugin-a': '1.0.0' });

      const available = new Map([
        ['plugin-a', [manifest]],
        ['plugin-b', [depB]],
        ['plugin-c', [depC]],
      ]);

      await expect(resolver.resolve(manifest, available)).rejects.toThrow('Circular dependency');
    });
  });

  describe('Error Handling', () => {
    it('should throw when dependency not found', async () => {
      const resolver = new DependencyResolver();
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '1.0.0' });
      const available = new Map();

      await expect(resolver.resolve(manifest, available)).rejects.toThrow('not found');
    });

    it('should throw when no compatible version found', async () => {
      const resolver = new DependencyResolver();
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '^2.0.0' });

      const available = new Map([
        ['plugin-b', [createManifest('plugin-b', '1.0.0')]],
      ]);

      await expect(resolver.resolve(manifest, available)).rejects.toThrow('No compatible version');
    });
  });

  describe('Lockfile Generation', () => {
    it('should generate lockfile from resolved dependencies', async () => {
      const resolver = new DependencyResolver();
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '^1.0.0' });

      const available = new Map([
        ['plugin-b', [
          createManifest('plugin-b', '1.0.0'),
          createManifest('plugin-b', '1.2.0'),
        ]],
      ]);

      const result = await resolver.resolve(manifest, available);
      const lockfile = resolver.generateLockfile(result.dependencies);

      expect(lockfile['plugin-b']).toBe('1.2.0');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle diamond dependency', async () => {
      const resolver = new DependencyResolver();

      // Root depends on A and B
      // A depends on C
      // B depends on C
      // C should only be installed once
      const manifest = createManifest('root', '1.0.0', {
        'plugin-a': '1.0.0',
        'plugin-b': '1.0.0',
      });

      const depA = createManifest('plugin-a', '1.0.0', { 'plugin-c': '^1.0.0' });
      const depB = createManifest('plugin-b', '1.0.0', { 'plugin-c': '^1.0.0' });
      const depC = createManifest('plugin-c', '1.0.0');

      const available = new Map([
        ['plugin-a', [depA]],
        ['plugin-b', [depB]],
        ['plugin-c', [depC]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies).toHaveLength(3);

      // plugin-c should appear only once
      const cCount = result.dependencies.filter(d => d.id === 'plugin-c').length;
      expect(cCount).toBe(1);
    });

    it('should handle deep dependency tree', async () => {
      const resolver = new DependencyResolver();

      // A -> B -> C -> D -> E
      const manifest = createManifest('plugin-a', '1.0.0', { 'plugin-b': '1.0.0' });
      const depB = createManifest('plugin-b', '1.0.0', { 'plugin-c': '1.0.0' });
      const depC = createManifest('plugin-c', '1.0.0', { 'plugin-d': '1.0.0' });
      const depD = createManifest('plugin-d', '1.0.0', { 'plugin-e': '1.0.0' });
      const depE = createManifest('plugin-e', '1.0.0');

      const available = new Map([
        ['plugin-b', [depB]],
        ['plugin-c', [depC]],
        ['plugin-d', [depD]],
        ['plugin-e', [depE]],
      ]);

      const result = await resolver.resolve(manifest, available);

      expect(result.dependencies).toHaveLength(4);
      expect(result.installOrder).toHaveLength(4);

      // Install order should be E, D, C, B
      expect(result.installOrder[0]).toBe('plugin-e');
      expect(result.installOrder[3]).toBe('plugin-b');
    });
  });

  describe('Helper Functions', () => {
    it('should create resolver via helper', () => {
      const resolver = createDependencyResolver();
      expect(resolver).toBeInstanceOf(DependencyResolver);
    });

    it('should create resolver with options', () => {
      const resolver = createDependencyResolver({ strategy: 'locked' });
      expect(resolver).toBeInstanceOf(DependencyResolver);
    });
  });
});
