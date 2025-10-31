/**
 * Signature Verifier
 * Verifies Ed25519 signatures on plugin packages and manifests
 * Phase 4 - Sprint 1 - CORE
 */

import * as ed25519 from '@noble/ed25519';
import { getKeyManager } from './KeyManager';
import type { SignatureResult } from './Signer';

export interface VerificationResult {
  valid: boolean;
  publicKeyId: string;
  timestamp?: string;
  hash?: string;
  errors: string[];
  warnings: string[];
}

export interface VerifyOptions {
  checkTimestamp?: boolean; // Verify timestamp is recent (default: false)
  maxAge?: number; // Maximum age in milliseconds (default: 24h)
  checkHash?: boolean; // Verify content hash (default: true)
}

/**
 * Verifier - Verifies code signatures
 */
export class Verifier {
  private keyManager = getKeyManager();

  /**
   * Verify a signature
   */
  async verify(
    content: string | Uint8Array,
    signatureResult: SignatureResult,
    options: VerifyOptions = {}
  ): Promise<VerificationResult> {
    const {
      checkTimestamp = false,
      maxAge = 24 * 60 * 60 * 1000, // 24 hours
      checkHash = true,
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if public key is registered
    if (!this.keyManager.hasPublicKey(signatureResult.publicKeyId)) {
      errors.push(`Public key not registered: ${signatureResult.publicKeyId}`);
      return {
        valid: false,
        publicKeyId: signatureResult.publicKeyId,
        errors,
        warnings,
      };
    }

    // Get public key
    const publicKeyInfo = this.keyManager.getPublicKeyInfo(signatureResult.publicKeyId);
    if (!publicKeyInfo) {
      errors.push('Public key info not found');
      return {
        valid: false,
        publicKeyId: signatureResult.publicKeyId,
        errors,
        warnings,
      };
    }

    // Check if key is expired
    if (this.keyManager.isPublicKeyExpired(signatureResult.publicKeyId)) {
      errors.push('Public key is expired');
      return {
        valid: false,
        publicKeyId: signatureResult.publicKeyId,
        timestamp: signatureResult.timestamp,
        errors,
        warnings,
      };
    }

    // Convert content to Uint8Array
    const contentBytes = typeof content === 'string' ? this.stringToBytes(content) : content;

    // Verify hash if present and requested
    if (checkHash && signatureResult.hash) {
      const contentHash = await this.hashContent(contentBytes);
      if (contentHash !== signatureResult.hash) {
        errors.push('Content hash mismatch - content may have been tampered with');
        return {
          valid: false,
          publicKeyId: signatureResult.publicKeyId,
          timestamp: signatureResult.timestamp,
          hash: signatureResult.hash,
          errors,
          warnings,
        };
      }
    }

    // Check timestamp age if requested
    if (checkTimestamp && signatureResult.timestamp) {
      const signatureAge = Date.now() - new Date(signatureResult.timestamp).getTime();
      if (signatureAge > maxAge) {
        warnings.push(`Signature is old (${Math.round(signatureAge / (60 * 60 * 1000))}h)`);
      }

      if (signatureAge < 0) {
        errors.push('Signature timestamp is in the future');
        return {
          valid: false,
          publicKeyId: signatureResult.publicKeyId,
          timestamp: signatureResult.timestamp,
          errors,
          warnings,
        };
      }
    }

    // Decode signature and public key
    let signature: Uint8Array;
    let publicKey: Uint8Array;

    try {
      signature = this.fromBase64(signatureResult.signature);
      publicKey = this.fromBase64(publicKeyInfo.publicKey);
    } catch (error) {
      errors.push(
        `Invalid base64 encoding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        valid: false,
        publicKeyId: signatureResult.publicKeyId,
        timestamp: signatureResult.timestamp,
        errors,
        warnings,
      };
    }

    // Verify signature (message is signed as-is, timestamp is metadata only)
    const message = contentBytes;

    // Verify signature
    try {
      const isValid = await ed25519.verifyAsync(signature, message, publicKey);

      if (!isValid) {
        errors.push('Signature verification failed - invalid signature');
      }

      return {
        valid: isValid,
        publicKeyId: signatureResult.publicKeyId,
        timestamp: signatureResult.timestamp,
        hash: signatureResult.hash,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(
        `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        valid: false,
        publicKeyId: signatureResult.publicKeyId,
        timestamp: signatureResult.timestamp,
        errors,
        warnings,
      };
    }
  }

  /**
   * Verify a plugin manifest signature
   */
  async verifyManifest(
    manifest: unknown,
    signatureResult: SignatureResult,
    options?: VerifyOptions
  ): Promise<VerificationResult> {
    // Serialize manifest to canonical JSON (same as signing)
    const manifestJson = this.canonicalizeJSON(manifest);

    return this.verify(manifestJson, signatureResult, options);
  }

  /**
   * Verify a plugin package signature
   */
  async verifyPackage(
    packageContent: Uint8Array | ArrayBuffer,
    signatureResult: SignatureResult,
    options?: VerifyOptions
  ): Promise<VerificationResult> {
    const content =
      packageContent instanceof ArrayBuffer ? new Uint8Array(packageContent) : packageContent;

    return this.verify(content, signatureResult, options);
  }

  /**
   * Verify multiple signatures (for multi-file packages)
   */
  async verifyMultiple(
    files: Record<string, string | Uint8Array>,
    signatures: Record<string, SignatureResult>,
    options?: VerifyOptions
  ): Promise<Record<string, VerificationResult>> {
    const results: Record<string, VerificationResult> = {};

    for (const [filename, content] of Object.entries(files)) {
      const signature = signatures[filename];
      if (!signature) {
        results[filename] = {
          valid: false,
          publicKeyId: '',
          errors: [`No signature found for file: ${filename}`],
          warnings: [],
        };
        continue;
      }

      results[filename] = await this.verify(content, signature, options);
    }

    return results;
  }

  /**
   * Verify a detached signature file
   */
  async verifyDetachedSignature(
    content: string | Uint8Array,
    signatureFileContent: string,
    options?: VerifyOptions
  ): Promise<VerificationResult> {
    try {
      const signatureResult: SignatureResult = JSON.parse(signatureFileContent);
      return await this.verify(content, signatureResult, options);
    } catch (error) {
      return {
        valid: false,
        publicKeyId: '',
        errors: [
          `Failed to parse signature file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings: [],
      };
    }
  }

  /**
   * Batch verify multiple items
   */
  async verifyBatch(
    items: Array<{
      content: string | Uint8Array;
      signature: SignatureResult;
      options?: VerifyOptions;
    }>
  ): Promise<VerificationResult[]> {
    return Promise.all(items.map(item => this.verify(item.content, item.signature, item.options)));
  }

  /**
   * Check if all verifications passed
   */
  allValid(results: VerificationResult[]): boolean {
    return results.every(result => result.valid);
  }

  /**
   * Get summary of verification results
   */
  getSummary(results: VerificationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  } {
    return {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    };
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
   * Canonicalize JSON (same as Signer)
   */
  private canonicalizeJSON(obj: unknown): string {
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
   * Convert Uint8Array to base64
   */
  private toBase64(bytes: Uint8Array): string {
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  }
}

/**
 * Create a new verifier instance
 */
export function createVerifier(): Verifier {
  return new Verifier();
}

/**
 * Quick verify helper (uses default verifier)
 */
const defaultVerifier = new Verifier();

export async function quickVerify(
  content: string | Uint8Array,
  signature: SignatureResult,
  options?: VerifyOptions
): Promise<VerificationResult> {
  return defaultVerifier.verify(content, signature, options);
}

export async function quickVerifyManifest(
  manifest: unknown,
  signature: SignatureResult,
  options?: VerifyOptions
): Promise<VerificationResult> {
  return defaultVerifier.verifyManifest(manifest, signature, options);
}
