/**
 * KeyManager Tests
 * Phase 4 - Sprint 1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyManager, getKeyManager } from '../KeyManager';

describe('KeyManager', () => {
  let keyManager: KeyManager;

  beforeEach(() => {
    keyManager = KeyManager.getInstance();
    keyManager.clear();
  });

  afterEach(() => {
    keyManager.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = KeyManager.getInstance();
      const instance2 = KeyManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should work with getKeyManager helper', () => {
      const instance1 = getKeyManager();
      const instance2 = KeyManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Key Generation', () => {
    it('should generate a key pair', async () => {
      const keyPair = await keyManager.generateKeyPair();

      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey.length).toBe(32); // Ed25519 public key is 32 bytes
      expect(keyPair.privateKey.length).toBe(32); // Ed25519 private key is 32 bytes
    });

    it('should generate different key pairs', async () => {
      const keyPair1 = await keyManager.generateKeyPair();
      const keyPair2 = await keyManager.generateKeyPair();

      expect(keyPair1.publicKey).not.toEqual(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toEqual(keyPair2.privateKey);
    });
  });

  describe('Key Storage', () => {
    it('should store and retrieve key pair', async () => {
      const keyPair = await keyManager.generateKeyPair();
      const keyId = 'dev:test@example.com';

      keyManager.storeKeyPair(keyId, keyPair);

      const retrieved = keyManager.getKeyPair(keyId);
      expect(retrieved).toEqual(keyPair);
    });

    it('should return null for non-existent key', () => {
      const retrieved = keyManager.getKeyPair('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should store public key info when storing key pair', async () => {
      const keyPair = await keyManager.generateKeyPair();
      const keyId = 'dev:test@example.com';

      keyManager.storeKeyPair(keyId, keyPair);

      const publicKeyInfo = keyManager.getPublicKeyInfo(keyId);
      expect(publicKeyInfo).toBeDefined();
      expect(publicKeyInfo?.id).toBe(keyId);
      expect(publicKeyInfo?.algorithm).toBe('ed25519');
      expect(publicKeyInfo?.publicKey).toBeDefined();
      expect(publicKeyInfo?.createdAt).toBeDefined();
    });

    it('should remove key pair', async () => {
      const keyPair = await keyManager.generateKeyPair();
      const keyId = 'dev:test@example.com';

      keyManager.storeKeyPair(keyId, keyPair);
      const removed = keyManager.removeKeyPair(keyId);

      expect(removed).toBe(true);
      expect(keyManager.getKeyPair(keyId)).toBeNull();
    });
  });

  describe('Public Key Registration', () => {
    it('should register public key info', () => {
      const publicKeyInfo = {
        id: 'marketplace:bigmind',
        publicKey: 'base64encodedkey',
        algorithm: 'ed25519' as const,
        createdAt: new Date().toISOString(),
      };

      keyManager.registerPublicKey(publicKeyInfo);

      const retrieved = keyManager.getPublicKeyInfo(publicKeyInfo.id);
      expect(retrieved).toEqual(publicKeyInfo);
    });

    it('should check if public key exists', () => {
      const publicKeyInfo = {
        id: 'marketplace:bigmind',
        publicKey: 'base64encodedkey',
        algorithm: 'ed25519' as const,
        createdAt: new Date().toISOString(),
      };

      expect(keyManager.hasPublicKey(publicKeyInfo.id)).toBe(false);

      keyManager.registerPublicKey(publicKeyInfo);

      expect(keyManager.hasPublicKey(publicKeyInfo.id)).toBe(true);
    });

    it('should get all public keys', () => {
      const publicKeyInfo1 = {
        id: 'key1',
        publicKey: 'base64key1',
        algorithm: 'ed25519' as const,
        createdAt: new Date().toISOString(),
      };

      const publicKeyInfo2 = {
        id: 'key2',
        publicKey: 'base64key2',
        algorithm: 'ed25519' as const,
        createdAt: new Date().toISOString(),
      };

      keyManager.registerPublicKey(publicKeyInfo1);
      keyManager.registerPublicKey(publicKeyInfo2);

      const allKeys = keyManager.getAllPublicKeys();
      expect(allKeys).toHaveLength(2);
      expect(allKeys).toContainEqual(publicKeyInfo1);
      expect(allKeys).toContainEqual(publicKeyInfo2);
    });

    it('should check if public key is expired', () => {
      const expiredKey = {
        id: 'expired-key',
        publicKey: 'base64key',
        algorithm: 'ed25519' as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
      };

      keyManager.registerPublicKey(expiredKey);

      expect(keyManager.isPublicKeyExpired(expiredKey.id)).toBe(true);
    });

    it('should not consider key expired if no expiration', () => {
      const publicKeyInfo = {
        id: 'no-expiry',
        publicKey: 'base64key',
        algorithm: 'ed25519' as const,
        createdAt: new Date().toISOString(),
      };

      keyManager.registerPublicKey(publicKeyInfo);

      expect(keyManager.isPublicKeyExpired(publicKeyInfo.id)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize key pair', async () => {
      const keyPair = await keyManager.generateKeyPair();

      const serialized = keyManager.serializeKeyPair(keyPair);
      expect(serialized.publicKey).toBeDefined();
      expect(serialized.privateKey).toBeDefined();
      expect(typeof serialized.publicKey).toBe('string');
      expect(typeof serialized.privateKey).toBe('string');

      const deserialized = keyManager.deserializeKeyPair(serialized);
      expect(deserialized.publicKey).toEqual(keyPair.publicKey);
      expect(deserialized.privateKey).toEqual(keyPair.privateKey);
    });

    it('should export and import key pair', async () => {
      const keyPair = await keyManager.generateKeyPair();
      const keyId = 'dev:test@example.com';

      keyManager.storeKeyPair(keyId, keyPair);

      const exported = keyManager.exportKeyPair(keyId);
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      // Clear and import
      keyManager.clear();
      const imported = keyManager.importKeyPair(exported!);
      expect(imported).toBe(true);

      const retrieved = keyManager.getKeyPair(keyId);
      expect(retrieved).toEqual(keyPair);
    });

    it('should return null when exporting non-existent key', () => {
      const exported = keyManager.exportKeyPair('non-existent');
      expect(exported).toBeNull();
    });

    it('should handle invalid import', () => {
      const result = keyManager.importKeyPair('invalid json');
      expect(result).toBe(false);
    });
  });

  describe('Key Counts', () => {
    it('should return correct key count', async () => {
      expect(keyManager.getKeyCount()).toBe(0);

      const keyPair1 = await keyManager.generateKeyPair();
      keyManager.storeKeyPair('key1', keyPair1);
      expect(keyManager.getKeyCount()).toBe(1);

      const keyPair2 = await keyManager.generateKeyPair();
      keyManager.storeKeyPair('key2', keyPair2);
      expect(keyManager.getKeyCount()).toBe(2);
    });

    it('should return correct public key count', () => {
      expect(keyManager.getPublicKeyCount()).toBe(0);

      keyManager.registerPublicKey({
        id: 'key1',
        publicKey: 'base64key1',
        algorithm: 'ed25519',
        createdAt: new Date().toISOString(),
      });

      expect(keyManager.getPublicKeyCount()).toBe(1);
    });
  });
});
