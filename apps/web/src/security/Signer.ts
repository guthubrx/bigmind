/**
 * Code Signer
 * Signs plugin packages and manifests using Ed25519
 * Phase 4 - Sprint 1 - CORE
 */

import * as ed25519 from '@noble/ed25519';
import { getKeyManager, type KeyPair } from './KeyManager';

export interface SignatureResult {
  signature: string; // Base64 encoded signature
  publicKeyId: string; // Key identifier
  algorithm: 'ed25519';
  timestamp: string; // ISO date
  hash: string; // SHA-256 hash of signed content
}

export interface SignOptions {
  keyId: string; // Key identifier to use
  includeTimestamp?: boolean; // Include timestamp in signature (default: true)
  includeHash?: boolean; // Include content hash (default: true)
}

/**
 * Signer - Signs code and manifests
 */
export class Signer {
  private keyManager = getKeyManager();

  /**
   * Sign a string or buffer
   */
  async sign(content: string | Uint8Array, options: SignOptions): Promise<SignatureResult> {
    const { keyId, includeTimestamp = true, includeHash = true } = options;

    // Get key pair
    const keyPair = this.keyManager.getKeyPair(keyId);
    if (!keyPair) {
      throw new Error(`Key pair not found for id: ${keyId}`);
    }

    // Convert content to Uint8Array
    const contentBytes = typeof content === 'string' ? this.stringToBytes(content) : content;

    // Sign the message directly (do NOT append timestamp to message)
    // Timestamp is only for metadata, not part of signed content
    const signature = await ed25519.signAsync(contentBytes, keyPair.privateKey);

    // Calculate hash if requested
    const hash = includeHash ? await this.hashContent(contentBytes) : '';

    return {
      signature: this.toBase64(signature),
      publicKeyId: keyId,
      algorithm: 'ed25519',
      timestamp: new Date().toISOString(),
      hash,
    };
  }

  /**
   * Sign a plugin manifest
   */
  async signManifest(manifest: unknown, keyId: string): Promise<SignatureResult> {
    // Serialize manifest to canonical JSON
    const manifestJson = this.canonicalizeJSON(manifest);

    return this.sign(manifestJson, {
      keyId,
      includeTimestamp: true,
      includeHash: true,
    });
  }

  /**
   * Sign a plugin package (file content)
   */
  async signPackage(packageContent: Uint8Array | ArrayBuffer, keyId: string): Promise<SignatureResult> {
    const content = packageContent instanceof ArrayBuffer
      ? new Uint8Array(packageContent)
      : packageContent;

    return this.sign(content, {
      keyId,
      includeTimestamp: true,
      includeHash: true,
    });
  }

  /**
   * Sign multiple files (for SBOM or multi-file packages)
   */
  async signMultiple(
    files: Record<string, string | Uint8Array>,
    keyId: string
  ): Promise<Record<string, SignatureResult>> {
    const signatures: Record<string, SignatureResult> = {};

    for (const [filename, content] of Object.entries(files)) {
      signatures[filename] = await this.sign(content, { keyId });
    }

    return signatures;
  }

  /**
   * Create a detached signature (signature in separate file)
   */
  async createDetachedSignature(
    content: string | Uint8Array,
    keyId: string
  ): Promise<string> {
    const result = await this.sign(content, { keyId });

    // Return signature file content (JSON)
    return JSON.stringify(result, null, 2);
  }

  /**
   * Hash content using SHA-256
   */
  private async hashContent(content: Uint8Array): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', content);
    const hashArray = new Uint8Array(hashBuffer);
    return this.toBase64(hashArray);
  }

  /**
   * Canonicalize JSON for consistent signing
   * (alphabetical key ordering, no whitespace)
   */
  private canonicalizeJSON(obj: unknown): string {
    // Sort keys recursively
    const sortKeys = (o: any): any => {
      if (Array.isArray(o)) {
        return o.map(sortKeys);
      }

      if (o && typeof o === 'object') {
        return Object.keys(o)
          .sort()
          .reduce((result, key) => {
            result[key] = sortKeys(o[key]);
            return result;
          }, {} as any);
      }

      return o;
    };

    return JSON.stringify(sortKeys(obj));
  }

  /**
   * Convert string to Uint8Array
   */
  private stringToBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * Convert Uint8Array to base64
   */
  private toBase64(bytes: Uint8Array): string {
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  }
}

/**
 * Create a new signer instance
 */
export function createSigner(): Signer {
  return new Signer();
}

/**
 * Quick sign helper (uses default signer)
 */
const defaultSigner = new Signer();

export async function quickSign(
  content: string | Uint8Array,
  keyId: string
): Promise<SignatureResult> {
  return defaultSigner.sign(content, { keyId });
}

export async function quickSignManifest(
  manifest: unknown,
  keyId: string
): Promise<SignatureResult> {
  return defaultSigner.signManifest(manifest, keyId);
}
