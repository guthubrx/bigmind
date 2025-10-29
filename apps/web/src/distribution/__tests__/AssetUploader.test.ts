/**
 * AssetUploader Tests
 * Phase 4 - Sprint 2
 */

import { describe, it, expect, vi } from 'vitest';
import { AssetUploader, createAssetUploader } from '../AssetUploader';

describe('AssetUploader', () => {
  const cdnUrl = 'https://cdn.bigmind.app';

  describe('Constructor', () => {
    it('should create uploader without API key', () => {
      const uploader = new AssetUploader(cdnUrl);
      expect(uploader).toBeInstanceOf(AssetUploader);
    });

    it('should create uploader with API key', () => {
      const uploader = new AssetUploader(cdnUrl, 'secret-key');
      expect(uploader).toBeInstanceOf(AssetUploader);
    });
  });

  describe('upload', () => {
    it('should upload Uint8Array content', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const content = new Uint8Array([1, 2, 3, 4, 5]);

      const result = await uploader.upload('test/file.txt', content);

      expect(result.url).toBe(`${cdnUrl}/test/file.txt`);
      expect(result.hash).toBeTruthy();
      expect(result.size).toBe(5);
      expect(result.integrity).toMatch(/^sha384-/);
    });

    // Skip Blob test in Node.js (Blob.arrayBuffer not available)
    it.skip('should upload Blob content', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const content = new Blob(['hello world'], { type: 'text/plain' });

      const result = await uploader.upload('test/file.txt', content);

      expect(result.url).toBe(`${cdnUrl}/test/file.txt`);
      expect(result.size).toBe(11);
      expect(result.integrity).toMatch(/^sha384-/);
    });

    it('should call progress callback', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const content = new Uint8Array([1, 2, 3]);
      const onProgress = vi.fn();

      await uploader.upload('test/file.txt', content, { onProgress });

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('should respect content type option', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const content = new Uint8Array([1, 2, 3]);

      const result = await uploader.upload('test/file.txt', content, {
        contentType: 'application/octet-stream',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('uploadBatch', () => {
    it('should upload multiple files', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const files = [
        { path: 'file1.txt', content: new Uint8Array([1, 2, 3]) },
        { path: 'file2.txt', content: new Uint8Array([4, 5, 6]) },
      ];

      const results = await uploader.uploadBatch(files);

      expect(results).toHaveLength(2);
      expect(results[0].url).toBe(`${cdnUrl}/file1.txt`);
      expect(results[1].url).toBe(`${cdnUrl}/file2.txt`);
    });

    it('should handle empty batch', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const results = await uploader.uploadBatch([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete asset', async () => {
      const uploader = new AssetUploader(cdnUrl);
      const deleted = await uploader.delete('test/file.txt');
      expect(deleted).toBe(true);
    });
  });

  describe('createAssetUploader', () => {
    it('should create uploader via helper', () => {
      const uploader = createAssetUploader(cdnUrl);
      expect(uploader).toBeInstanceOf(AssetUploader);
    });

    it('should create uploader with API key via helper', () => {
      const uploader = createAssetUploader(cdnUrl, 'secret-key');
      expect(uploader).toBeInstanceOf(AssetUploader);
    });
  });
});
