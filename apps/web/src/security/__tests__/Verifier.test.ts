/**
 * Verifier Tests
 * Phase 4 - Sprint 1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Verifier, createVerifier, quickVerify, quickVerifyManifest } from '../Verifier';
import { Signer } from '../Signer';
import { getKeyManager } from '../KeyManager';

describe('Verifier', () => {
  let verifier: Verifier;
  let signer: Signer;
  let keyManager: ReturnType<typeof getKeyManager>;
  const keyId = 'test-key';

  beforeEach(async () => {
    verifier = new Verifier();
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

  describe('Basic Verification', () => {
    it('should verify valid signature', async () => {
      const content = 'Hello, World!';
      const signature = await signer.sign(content, { keyId });
      const result = await verifier.verify(content, signature);

      expect(result.valid).toBe(true);
      expect(result.publicKeyId).toBe(keyId);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid signature', async () => {
      const content = 'Hello, World!';
      const signature = await signer.sign(content, { keyId });

      // Tamper with signature
      signature.signature = 'invalid-signature';

      const result = await verifier.verify(content, signature);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for modified content', async () => {
      const content = 'Hello, World!';
      const signature = await signer.sign(content, { keyId });

      // Try to verify with different content
      const tamperedContent = 'Hello, World!!';
      const result = await verifier.verify(tamperedContent, signature);

      expect(result.valid).toBe(false);
    });

    it('should fail for unregistered key', async () => {
      const content = 'test';
      const signature = await signer.sign(content, { keyId });

      // Clear key manager to simulate unregistered key
      keyManager.clear();

      const result = await verifier.verify(content, signature);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Public key not registered'));
    });
  });

  describe('Hash Verification', () => {
    it('should verify hash by default', async () => {
      const content = 'test content';
      const signature = await signer.sign(content, { keyId, includeHash: true });
      const result = await verifier.verify(content, signature, { checkHash: true });

      expect(result.valid).toBe(true);
    });

    it('should fail when hash mismatch', async () => {
      const content = 'test content';
      const signature = await signer.sign(content, { keyId, includeHash: true });

      // Tamper with hash
      signature.hash = 'invalid-hash';

      const result = await verifier.verify(content, signature, { checkHash: true });

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('hash mismatch'));
    });

    it('should skip hash check if disabled', async () => {
      const content = 'test content';
      const signature = await signer.sign(content, { keyId, includeHash: true });

      // Tamper with hash
      signature.hash = 'invalid-hash';

      const result = await verifier.verify(content, signature, { checkHash: false });

      // Should still pass because hash check is disabled
      // (signature itself is still valid)
      expect(result.valid).toBe(true);
    });
  });

  describe('Timestamp Verification', () => {
    it('should accept recent timestamp', async () => {
      const content = 'test';
      const signature = await signer.sign(content, { keyId });

      const result = await verifier.verify(content, signature, {
        checkTimestamp: true,
        maxAge: 60000, // 1 minute
      });

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about old timestamp', async () => {
      const content = 'test';
      const signature = await signer.sign(content, { keyId });

      // Modify timestamp to be old
      const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
      signature.timestamp = oldDate.toISOString();

      const result = await verifier.verify(content, signature, {
        checkTimestamp: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('old');
    });

    it('should fail for future timestamp', async () => {
      const content = 'test';
      const signature = await signer.sign(content, { keyId });

      // Modify timestamp to future
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in future
      signature.timestamp = futureDate.toISOString();

      const result = await verifier.verify(content, signature, {
        checkTimestamp: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('future'));
    });
  });

  describe('Key Expiration', () => {
    it('should fail for expired key', async () => {
      const content = 'test';
      const signature = await signer.sign(content, { keyId });

      // Modify public key to be expired
      const publicKeyInfo = keyManager.getPublicKeyInfo(keyId);
      if (publicKeyInfo) {
        publicKeyInfo.expiresAt = new Date(Date.now() - 1000).toISOString();
        keyManager.registerPublicKey(publicKeyInfo);
      }

      const result = await verifier.verify(content, signature);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('expired'));
    });
  });

  describe('Manifest Verification', () => {
    it('should verify manifest signature', async () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
      };

      const signature = await signer.signManifest(manifest, keyId);
      const result = await verifier.verifyManifest(manifest, signature);

      expect(result.valid).toBe(true);
    });

    it('should fail for modified manifest', async () => {
      const manifest = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
      };

      const signature = await signer.signManifest(manifest, keyId);

      // Modify manifest
      const tamperedManifest = { ...manifest, version: '2.0.0' };

      const result = await verifier.verifyManifest(tamperedManifest, signature);

      expect(result.valid).toBe(false);
    });

    it('should handle manifest with different key order', async () => {
      const manifest1 = {
        id: 'com.example.plugin',
        name: 'Test Plugin',
        version: '1.0.0',
      };

      const signature = await signer.signManifest(manifest1, keyId);

      // Same manifest, different key order
      const manifest2 = {
        version: '1.0.0',
        name: 'Test Plugin',
        id: 'com.example.plugin',
      };

      const result = await verifier.verifyManifest(manifest2, signature);

      expect(result.valid).toBe(true);
    });
  });

  describe('Package Verification', () => {
    it('should verify package signature', async () => {
      const packageContent = new Uint8Array([1, 2, 3, 4, 5]);
      const signature = await signer.signPackage(packageContent, keyId);
      const result = await verifier.verifyPackage(packageContent, signature);

      expect(result.valid).toBe(true);
    });

    it('should fail for modified package', async () => {
      const packageContent = new Uint8Array([1, 2, 3, 4, 5]);
      const signature = await signer.signPackage(packageContent, keyId);

      const tamperedContent = new Uint8Array([1, 2, 3, 4, 6]);
      const result = await verifier.verifyPackage(tamperedContent, signature);

      expect(result.valid).toBe(false);
    });
  });

  describe('Multiple File Verification', () => {
    it('should verify multiple files', async () => {
      const files = {
        'index.js': 'console.log("Hello");',
        'package.json': '{"name":"test"}',
      };

      const signatures = await signer.signMultiple(files, keyId);
      const results = await verifier.verifyMultiple(files, signatures);

      expect(results['index.js'].valid).toBe(true);
      expect(results['package.json'].valid).toBe(true);
    });

    it('should handle missing signature', async () => {
      const files = {
        'index.js': 'console.log("Hello");',
      };

      const results = await verifier.verifyMultiple(files, {});

      expect(results['index.js'].valid).toBe(false);
      expect(results['index.js'].errors).toContainEqual(
        expect.stringContaining('No signature found')
      );
    });
  });

  describe('Detached Signature Verification', () => {
    it('should verify detached signature', async () => {
      const content = 'Test content';
      const detachedSig = await signer.createDetachedSignature(content, keyId);
      const result = await verifier.verifyDetachedSignature(content, detachedSig);

      expect(result.valid).toBe(true);
    });

    it('should fail for invalid JSON', async () => {
      const result = await verifier.verifyDetachedSignature('content', 'invalid json');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('parse signature file'));
    });
  });

  describe('Batch Verification', () => {
    it('should verify batch of items', async () => {
      const items = [
        { content: 'test1', signature: await signer.sign('test1', { keyId }) },
        { content: 'test2', signature: await signer.sign('test2', { keyId }) },
      ];

      const results = await verifier.verifyBatch(items);

      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
    });

    it('should check if all valid', async () => {
      const items = [
        { content: 'test1', signature: await signer.sign('test1', { keyId }) },
        { content: 'test2', signature: await signer.sign('test2', { keyId }) },
      ];

      const results = await verifier.verifyBatch(items);
      expect(verifier.allValid(results)).toBe(true);
    });

    it('should detect invalid in batch', async () => {
      const validSig = await signer.sign('test1', { keyId });
      const invalidSig = { ...validSig, signature: 'invalid' };

      const items = [
        { content: 'test1', signature: validSig },
        { content: 'test2', signature: invalidSig },
      ];

      const results = await verifier.verifyBatch(items);
      expect(verifier.allValid(results)).toBe(false);
    });
  });

  describe('Summary', () => {
    it('should generate summary', async () => {
      const items = [
        { content: 'test1', signature: await signer.sign('test1', { keyId }) },
        { content: 'test2', signature: await signer.sign('test2', { keyId }) },
      ];

      const results = await verifier.verifyBatch(items);
      const summary = verifier.getSummary(results);

      expect(summary.total).toBe(2);
      expect(summary.valid).toBe(2);
      expect(summary.invalid).toBe(0);
    });
  });

  describe('Helper Functions', () => {
    it('should work with createVerifier', async () => {
      const newVerifier = createVerifier();
      const content = 'test';
      const signature = await signer.sign(content, { keyId });
      const result = await newVerifier.verify(content, signature);
      expect(result.valid).toBe(true);
    });

    it('should work with quickVerify', async () => {
      const content = 'test';
      const signature = await signer.sign(content, { keyId });
      const result = await quickVerify(content, signature);
      expect(result.valid).toBe(true);
    });

    it('should work with quickVerifyManifest', async () => {
      const manifest = { id: 'test', version: '1.0.0' };
      const signature = await signer.signManifest(manifest, keyId);
      const result = await quickVerifyManifest(manifest, signature);
      expect(result.valid).toBe(true);
    });
  });
});
