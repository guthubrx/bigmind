/**
 * Key Manager
 * Manages Ed25519 key pairs for code signing
 * Phase 4 - Sprint 1 - CORE
 */

import * as ed25519 from '@noble/ed25519';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface SerializedKeyPair {
  publicKey: string; // Base64
  privateKey: string; // Base64
}

export interface PublicKeyInfo {
  id: string; // Key identifier (e.g., "dev:john@example.com")
  publicKey: string; // Base64
  algorithm: 'ed25519';
  createdAt: string; // ISO date
  expiresAt?: string; // Optional expiration
}

/**
 * KeyManager - Manages cryptographic keys for code signing
 */
export class KeyManager {
  private static instance: KeyManager;

  private keys: Map<string, KeyPair> = new Map();

  private publicKeys: Map<string, PublicKeyInfo> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  /**
   * Generate a new Ed25519 key pair
   */
  async generateKeyPair(): Promise<KeyPair> {
    // Generate random 32 bytes for private key
    const privateKey = new Uint8Array(32);
    crypto.getRandomValues(privateKey);

    const publicKey = await ed25519.getPublicKeyAsync(privateKey);

    return {
      publicKey,
      privateKey,
    };
  }

  /**
   * Store a key pair with an identifier
   */
  storeKeyPair(id: string, keyPair: KeyPair): void {
    this.keys.set(id, keyPair);

    // Also store public key info
    this.publicKeys.set(id, {
      id,
      publicKey: this.toBase64(keyPair.publicKey),
      algorithm: 'ed25519',
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Retrieve a key pair by identifier
   */
  getKeyPair(id: string): KeyPair | null {
    return this.keys.get(id) || null;
  }

  /**
   * Get public key info
   */
  getPublicKeyInfo(id: string): PublicKeyInfo | null {
    return this.publicKeys.get(id) || null;
  }

  /**
   * Register a public key (for verification only)
   */
  registerPublicKey(info: PublicKeyInfo): void {
    this.publicKeys.set(info.id, info);
  }

  /**
   * Get all registered public keys
   */
  getAllPublicKeys(): PublicKeyInfo[] {
    return Array.from(this.publicKeys.values());
  }

  /**
   * Remove a key pair
   */
  removeKeyPair(id: string): boolean {
    return this.keys.delete(id);
  }

  /**
   * Serialize key pair to base64 strings
   */
  serializeKeyPair(keyPair: KeyPair): SerializedKeyPair {
    return {
      publicKey: this.toBase64(keyPair.publicKey),
      privateKey: this.toBase64(keyPair.privateKey),
    };
  }

  /**
   * Deserialize key pair from base64 strings
   */
  deserializeKeyPair(serialized: SerializedKeyPair): KeyPair {
    return {
      publicKey: this.fromBase64(serialized.publicKey),
      privateKey: this.fromBase64(serialized.privateKey),
    };
  }

  /**
   * Export key pair to JSON (for secure storage)
   */
  exportKeyPair(id: string): string | null {
    const keyPair = this.keys.get(id);
    if (!keyPair) {
      return null;
    }

    const publicKeyInfo = this.publicKeys.get(id);

    return JSON.stringify({
      id,
      keyPair: this.serializeKeyPair(keyPair),
      publicKeyInfo,
    });
  }

  /**
   * Import key pair from JSON
   */
  importKeyPair(json: string): boolean {
    try {
      const data = JSON.parse(json);
      const keyPair = this.deserializeKeyPair(data.keyPair);

      this.keys.set(data.id, keyPair);

      if (data.publicKeyInfo) {
        this.publicKeys.set(data.id, data.publicKeyInfo);
      }

      return true;
    } catch (error) {
      console.error('[KeyManager] Failed to import key pair:', error);
      return false;
    }
  }

  /**
   * Check if a public key is registered
   */
  hasPublicKey(id: string): boolean {
    return this.publicKeys.has(id);
  }

  /**
   * Check if a public key is expired
   */
  isPublicKeyExpired(id: string): boolean {
    const info = this.publicKeys.get(id);
    if (!info || !info.expiresAt) {
      return false;
    }

    return new Date(info.expiresAt) < new Date();
  }

  /**
   * Convert Uint8Array to base64
   */
  private toBase64(bytes: Uint8Array): string {
    // Use btoa with binary string conversion
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  }

  /**
   * Convert base64 to Uint8Array
   */
  private fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Clear all keys (for testing/cleanup)
   */
  clear(): void {
    this.keys.clear();
    this.publicKeys.clear();
  }

  /**
   * Get key count
   */
  getKeyCount(): number {
    return this.keys.size;
  }

  /**
   * Get public key count
   */
  getPublicKeyCount(): number {
    return this.publicKeys.size;
  }
}

/**
 * Get the global KeyManager instance
 */
export function getKeyManager(): KeyManager {
  return KeyManager.getInstance();
}
