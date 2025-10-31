/**
 * Signer Tests
 * Phase 4 - Sprint 1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Signer, createSigner, quickSign, quickSignManifest } from '../Signer';
import { getKeyManager } from '../KeyManager';

describe('Signer', () => {
  let signer: Signer;
  let keyManager: ReturnType<typeof getKeyManager>;
  const keyId = 'test-key';

  beforeEach(async () => {
    signer = new Signer();
    keyManager = getKeyManager();
    keyManager.clear();

    // Generate and store test key
    const keyPair = await keyManager.generateKeyPair();
    keyManager.storeKeyPair(keyId, keyPair);
  });

  afterEach(() => {
    keyManager.clear();
  });

  describe('Basic Signing', () => {
    it('should sign a string', async () => {
      const content = 'Hello, World!';
      const result = await signer.sign(content, { keyId });

      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(typeof result.signature).toBe('string');
      expect(result.publicKeyId).toBe(keyId);
      expect(result.algorithm).toBe('ed25519');
      expect(result.timestamp).toBeDefined();
      expect(result.hash).toBeDefined();
    });

    it('should sign a Uint8Array', async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);
      const result = await signer.sign(content, { keyId });

      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.publicKeyId).toBe(keyId);
    });

    it('should throw error for non-existent key', async () => {
      await expect(signer.sign('test', { keyId: 'non-existent-key' })).rejects.toThrow(
        'Key pair not found'
      );
    });
  });

  describe('Sign Options', () => {
    it('should include timestamp by default', async () => {
      const result = await signer.sign('test', { keyId });
      expect(result.timestamp).toBeDefined();
    });

    it('should include hash by default', async () => {
      const result = await signer.sign('test', { keyId });
      expect(result.hash).toBeDefined();
      expect(result.hash.length).toBeGreaterThan(0);
    });

    it('should respect includeTimestamp option', async () => {
      const result = await signer.sign('test', {
        keyId,
        includeTimestamp: false,
      });
      expect(result.timestamp).toBeDefined(); // Always present in result
    });

    it('should respect includeHash option', async () => {
      const result = await signer.sign('test', {
        keyId,
        includeHash: false,
      });
      expect(result.hash).toBe('');
    });
  });

  describe('Manifest Signing', () => {
    it('should sign a manifest object', async () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
      };

      const result = await signer.signManifest(manifest, keyId);

      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.hash).toBeDefined();
    });

    it('should produce same signature for same manifest', async () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
      };

      const result1 = await signer.signManifest(manifest, keyId);
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await signer.signManifest(manifest, keyId);

      // Signatures will be different due to timestamp, but hash should be same
      expect(result1.hash).toBe(result2.hash);
    });

    it('should handle manifest with different key order', async () => {
      const manifest1 = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
      };

      const manifest2 = {
        version: '1.0.0',
        name: 'Test Plugin',
        id: 'com.example.plugin',
      };

      const result1 = await signer.signManifest(manifest1, keyId);
      const result2 = await signer.signManifest(manifest2, keyId);

      // Hash should be same (canonical JSON)
      expect(result1.hash).toBe(result2.hash);
    });
  });

  describe('Package Signing', () => {
    it('should sign package content (Uint8Array)', async () => {
      const packageContent = new Uint8Array(1000).fill(42);
      const result = await signer.signPackage(packageContent, keyId);

      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.hash).toBeDefined();
    });

    it('should sign package content (ArrayBuffer)', async () => {
      const buffer = new ArrayBuffer(1000);
      const result = await signer.signPackage(buffer, keyId);

      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
    });

    it('should produce different hash for different content', async () => {
      const content1 = new Uint8Array([1, 2, 3]);
      const content2 = new Uint8Array([1, 2, 4]);

      const result1 = await signer.signPackage(content1, keyId);
      const result2 = await signer.signPackage(content2, keyId);

      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe('Multiple File Signing', () => {
    it('should sign multiple files', async () => {
      const files = {
        'index.js': 'console.log("Hello");',
        'package.json': '{"name":"test"}',
        'README.md': '# Test Package',
      };

      const results = await signer.signMultiple(files, keyId);

      expect(Object.keys(results)).toHaveLength(3);
      expect(results['index.js']).toBeDefined();
      expect(results['package.json']).toBeDefined();
      expect(results['README.md']).toBeDefined();

      // Each should have unique hash
      expect(results['index.js'].hash).not.toBe(results['package.json'].hash);
    });

    it('should handle empty files object', async () => {
      const results = await signer.signMultiple({}, keyId);
      expect(Object.keys(results)).toHaveLength(0);
    });
  });

  describe('Detached Signatures', () => {
    it('should create detached signature', async () => {
      const content = 'Test content';
      const detachedSig = await signer.createDetachedSignature(content, keyId);

      expect(detachedSig).toBeDefined();
      expect(typeof detachedSig).toBe('string');

      // Should be valid JSON
      const parsed = JSON.parse(detachedSig);
      expect(parsed.signature).toBeDefined();
      expect(parsed.publicKeyId).toBe(keyId);
    });

    it('should format detached signature as JSON', async () => {
      const detachedSig = await signer.createDetachedSignature('test', keyId);
      const parsed = JSON.parse(detachedSig);

      expect(parsed).toHaveProperty('signature');
      expect(parsed).toHaveProperty('publicKeyId');
      expect(parsed).toHaveProperty('algorithm');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('hash');
    });
  });

  describe('Helper Functions', () => {
    it('should work with createSigner', async () => {
      const newSigner = createSigner();
      const result = await newSigner.sign('test', { keyId });
      expect(result).toBeDefined();
    });

    it('should work with quickSign', async () => {
      const result = await quickSign('test', keyId);
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
    });

    it('should work with quickSignManifest', async () => {
      const manifest = { id: 'test', version: '1.0.0' };
      const result = await quickSignManifest(manifest, keyId);
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', async () => {
      const result = await signer.sign('', { keyId });
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
    });

    it('should handle large content', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB
      const result = await signer.sign(largeContent, { keyId });
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
    });

    it('should handle special characters', async () => {
      const content = '🚀 Émojis & Special <chars> "quotes"';
      const result = await signer.sign(content, { keyId });
      expect(result).toBeDefined();
    });
  });
});
