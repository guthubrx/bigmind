/**
 * ManifestLoader Tests
 * Phase 3 - Sprint 4
 */

import { describe, it, expect } from 'vitest';
import {
  loadManifest,
  getAllAvailableManifests,
  validateManifest,
} from '../ManifestLoader';

describe('ManifestLoader', () => {
  describe('getAllAvailableManifests', () => {
    it('should load all available manifests via glob', () => {
      const manifests = getAllAvailableManifests();

      // Should have at least the 5 core plugins
      expect(manifests.length).toBeGreaterThanOrEqual(5);

      // Check that all manifests have required fields
      manifests.forEach((loaded) => {
        expect(loaded.manifest).toBeDefined();
        expect(loaded.manifest.id).toBeDefined();
        expect(loaded.manifest.name).toBeDefined();
        expect(loaded.manifest.version).toBeDefined();
        expect(loaded.pluginPath).toBeDefined();
      });
    });

    it('should load tags-manager manifest', () => {
      const manifests = getAllAvailableManifests();
      const tagsManager = manifests.find(
        (m) => m.manifest.id === 'com.bigmind.tags-manager'
      );

      expect(tagsManager).toBeDefined();
      expect(tagsManager?.manifest.name).toBe('Tags Manager');
      expect(tagsManager?.manifest.version).toBe('1.0.0');
      expect(tagsManager?.manifest.icon).toBe('🏷️');
      expect(tagsManager?.manifest.category).toBe('productivity');
    });

    it('should load export-manager manifest', () => {
      const manifests = getAllAvailableManifests();
      const exportManager = manifests.find(
        (m) => m.manifest.id === 'com.bigmind.export-manager'
      );

      expect(exportManager).toBeDefined();
      expect(exportManager?.manifest.name).toBe('Export Manager');
      expect(exportManager?.manifest.icon).toBe('📤');
    });

    it('should load palette-settings manifest', () => {
      const manifests = getAllAvailableManifests();
      const paletteSettings = manifests.find(
        (m) => m.manifest.id === 'com.bigmind.palette-settings'
      );

      expect(paletteSettings).toBeDefined();
      expect(paletteSettings?.manifest.name).toBe('Palette Settings');
    });

    it('should load color-palettes-collection manifest', () => {
      const manifests = getAllAvailableManifests();
      const colorPalettes = manifests.find(
        (m) => m.manifest.id === 'com.bigmind.color-palettes-collection'
      );

      expect(colorPalettes).toBeDefined();
      expect(colorPalettes?.manifest.name).toBe('Color Palettes Collection');
      expect(colorPalettes?.manifest.featured).toBe(true);
    });

    it('should load xmind-compatibility manifest', () => {
      const manifests = getAllAvailableManifests();
      const xmindCompat = manifests.find(
        (m) => m.manifest.id === 'com.xmind.compatibility'
      );

      expect(xmindCompat).toBeDefined();
      expect(xmindCompat?.manifest.name).toBe('XMind Compatibility');
    });
  });

  describe('loadManifest', () => {
    it('should load manifest from specific path', async () => {
      const result = await loadManifest('src/plugins/core/tags-manager');

      expect(result).toBeDefined();
      expect(result?.manifest.id).toBe('com.bigmind.tags-manager');
    });

    it('should return null for non-existent path', async () => {
      const result = await loadManifest('src/plugins/non-existent');

      expect(result).toBeNull();
    });
  });

  describe('validateManifest', () => {
    it('should validate a complete manifest', () => {
      const manifest = {
        id: 'com.test.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        author: { name: 'Test Author', email: 'test@example.com' },
        main: 'index.js',
        description: 'Test description',
      };

      expect(validateManifest(manifest as any)).toBe(true);
    });

    it('should reject manifest without id', () => {
      const manifest = {
        name: 'Test Plugin',
        version: '1.0.0',
        author: { name: 'Test Author' },
        main: 'index.js',
      };

      expect(validateManifest(manifest as any)).toBe(false);
    });

    it('should reject manifest with invalid id format', () => {
      const manifest = {
        id: 'INVALID ID WITH SPACES',
        name: 'Test Plugin',
        version: '1.0.0',
        author: { name: 'Test Author' },
        main: 'index.js',
      };

      expect(validateManifest(manifest as any)).toBe(false);
    });

    it('should reject manifest with invalid version format', () => {
      const manifest = {
        id: 'com.test.plugin',
        name: 'Test Plugin',
        version: 'invalid',
        author: { name: 'Test Author' },
        main: 'index.js',
      };

      expect(validateManifest(manifest as any)).toBe(false);
    });

    it('should accept valid semver versions', () => {
      const tests = ['1.0.0', '2.1.3', '10.20.30', '1.0.0-alpha', '1.0.0+build'];

      tests.forEach((version) => {
        const manifest = {
          id: 'com.test.plugin',
          name: 'Test Plugin',
          version,
          author: { name: 'Test Author' },
          main: 'index.js',
        };

        expect(validateManifest(manifest as any)).toBe(true);
      });
    });
  });

  describe('manifest structure', () => {
    it('should have uiContributions for tags-manager', () => {
      const manifests = getAllAvailableManifests();
      const tagsManager = manifests.find(
        (m) => m.manifest.id === 'com.bigmind.tags-manager'
      );

      expect(tagsManager?.manifest.uiContributions).toBeDefined();
      expect(tagsManager?.manifest.uiContributions?.panels).toBeDefined();
      expect(tagsManager?.manifest.uiContributions?.nodePropertiesTabs).toBeDefined();
    });

    it('should have commands for export-manager', () => {
      const manifests = getAllAvailableManifests();
      const exportManager = manifests.find(
        (m) => m.manifest.id === 'com.bigmind.export-manager'
      );

      expect(exportManager?.manifest.uiContributions?.commands).toBeDefined();
      expect(exportManager?.manifest.uiContributions?.commands?.length).toBeGreaterThan(
        0
      );
    });

    it('should have marketing content', () => {
      const manifests = getAllAvailableManifests();

      manifests.forEach((loaded) => {
        expect(loaded.manifest.tagline).toBeDefined();
        expect(loaded.manifest.benefits).toBeDefined();
        expect(loaded.manifest.useCases).toBeDefined();
        expect(loaded.manifest.features).toBeDefined();
      });
    });
  });
});
