/**
 * AssetVersioning Tests
 * Phase 4 - Sprint 2
 */

import { describe, it, expect } from 'vitest';
import { AssetVersioning, createAssetVersioning } from '../AssetVersioning';

describe('AssetVersioning', () => {
  const cdnUrl = 'https://cdn.bigmind.app';
  const version = '1.0.0';

  describe('Constructor', () => {
    it('should create asset versioning', () => {
      const versioning = new AssetVersioning(cdnUrl, version);
      expect(versioning.getVersion()).toBe(version);
    });
  });

  describe('Asset Management', () => {
    it('should add asset to manifest', () => {
      const versioning = new AssetVersioning(cdnUrl, version);
      const assetInfo = {
        path: 'file.js',
        url: `${cdnUrl}/file.abc123.js`,
        hash: 'abc123def456',
        size: 1024,
        integrity: 'sha384-...',
      };

      versioning.addAsset('file.js', assetInfo);
      expect(versioning.getAssetUrl('file.js')).toBe(assetInfo.url);
    });

    it('should generate versioned URL', () => {
      const versioning = new AssetVersioning(cdnUrl, version);
      const url = versioning.generateVersionedUrl('file.js', 'abc123def456');

      expect(url).toContain(cdnUrl);
      expect(url).toContain('abc123');
      expect(url).toMatch(/\.js$/);
    });

    it('should get asset integrity', () => {
      const versioning = new AssetVersioning(cdnUrl, version);
      const integrity = 'sha384-xyz';

      versioning.addAsset('file.js', {
        path: 'file.js',
        url: `${cdnUrl}/file.js`,
        hash: 'abc',
        size: 100,
        integrity,
      });

      expect(versioning.getAssetIntegrity('file.js')).toBe(integrity);
    });

    it('should return null for non-existent asset', () => {
      const versioning = new AssetVersioning(cdnUrl, version);
      expect(versioning.getAssetUrl('nonexistent.js')).toBeNull();
      expect(versioning.getAssetIntegrity('nonexistent.js')).toBeNull();
    });

    it('should get all assets', () => {
      const versioning = new AssetVersioning(cdnUrl, version);

      versioning.addAsset('file1.js', {
        path: 'file1.js',
        url: `${cdnUrl}/file1.js`,
        hash: 'abc',
        size: 100,
        integrity: 'sha384-abc',
      });

      versioning.addAsset('file2.js', {
        path: 'file2.js',
        url: `${cdnUrl}/file2.js`,
        hash: 'def',
        size: 200,
        integrity: 'sha384-def',
      });

      const assets = versioning.getAllAssets();
      expect(Object.keys(assets)).toHaveLength(2);
      expect(assets['file1.js']).toBeDefined();
      expect(assets['file2.js']).toBeDefined();
    });
  });

  describe('Manifest Export/Import', () => {
    it('should export manifest as JSON', () => {
      const versioning = new AssetVersioning(cdnUrl, version);
      versioning.addAsset('file.js', {
        path: 'file.js',
        url: `${cdnUrl}/file.js`,
        hash: 'abc123',
        size: 1024,
        integrity: 'sha384-xyz',
      });

      const json = versioning.exportManifest();
      const manifest = JSON.parse(json);

      expect(manifest.version).toBe(version);
      expect(manifest.assets['file.js']).toBeDefined();
      expect(manifest.generatedAt).toBeTruthy();
    });

    it('should load manifest from JSON', () => {
      const originalVersioning = new AssetVersioning(cdnUrl, version);
      originalVersioning.addAsset('file.js', {
        path: 'file.js',
        url: `${cdnUrl}/file.js`,
        hash: 'abc123',
        size: 1024,
        integrity: 'sha384-xyz',
      });

      const json = originalVersioning.exportManifest();
      const loadedVersioning = AssetVersioning.loadManifest(json, cdnUrl);

      expect(loadedVersioning.getVersion()).toBe(version);
      expect(loadedVersioning.getAssetUrl('file.js')).toBe(`${cdnUrl}/file.js`);
    });
  });

  describe('Helper Functions', () => {
    it('should create asset versioning via helper', () => {
      const versioning = createAssetVersioning(cdnUrl, version);
      expect(versioning).toBeInstanceOf(AssetVersioning);
      expect(versioning.getVersion()).toBe(version);
    });
  });
});
