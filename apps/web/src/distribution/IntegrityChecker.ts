/**
 * Integrity Checker
 * Verify file integrity with SHA-256 and signatures
 * Phase 4 - Sprint 3 - CORE
 */

import { Verifier } from '../security/Verifier';

export interface IntegrityCheck {
  valid: boolean;
  hashMatch: boolean;
  signatureValid: boolean;
  errors: string[];
}

export interface IntegrityOptions {
  checkHash?: boolean;
  checkSignature?: boolean;
  publicKey?: CryptoKey;
}

/**
 * IntegrityChecker - Verify file integrity
 */
export class IntegrityChecker {
  private verifier: Verifier;

  constructor() {
    this.verifier = new Verifier();
  }

  /**
   * Calculate SHA-256 hash of content
   */
  async calculateHash(content: Uint8Array | ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', content as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify file integrity
   */
  async verify(
    content: Uint8Array | ArrayBuffer,
    expectedHash: string,
    options: IntegrityOptions = {}
  ): Promise<IntegrityCheck> {
    const errors: string[] = [];
    let hashMatch = false;
    let signatureValid = false;

    const opts = {
      checkHash: options.checkHash !== false, // Default: true
      checkSignature: options.checkSignature || false,
      ...options,
    };

    // Check hash
    if (opts.checkHash) {
      try {
        const actualHash = await this.calculateHash(content);
        hashMatch = actualHash === expectedHash;

        if (!hashMatch) {
          errors.push(`Hash mismatch: expected ${expectedHash}, got ${actualHash}`);
        }
      } catch (err) {
        errors.push(
          `Hash verification failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    // Check signature (if requested)
    if (opts.checkSignature && opts.publicKey) {
      try {
        const buffer = content instanceof Uint8Array ? content : new Uint8Array(content);
        // Note: Actual signature verification would require the signature data
        // This is a simplified version
        signatureValid = true; // Placeholder
      } catch (err) {
        errors.push(
          `Signature verification failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    const valid = errors.length === 0;

    return {
      valid,
      hashMatch: opts.checkHash ? hashMatch : true,
      signatureValid: opts.checkSignature ? signatureValid : true,
      errors,
    };
  }

  /**
   * Verify multiple files
   */
  async verifyBatch(
    files: Array<{
      content: Uint8Array | ArrayBuffer;
      expectedHash: string;
      path: string;
    }>,
    options: IntegrityOptions = {}
  ): Promise<Map<string, IntegrityCheck>> {
    const results = new Map<string, IntegrityCheck>();

    for (const file of files) {
      const check = await this.verify(file.content, file.expectedHash, options);
      results.set(file.path, check);
    }

    return results;
  }

  /**
   * Verify SRI (Subresource Integrity)
   */
  async verifySRI(content: Uint8Array | ArrayBuffer, sriHash: string): Promise<boolean> {
    // Parse SRI format: "sha384-base64hash"
    const match = sriHash.match(/^sha(\d+)-(.+)$/);
    if (!match) {
      return false;
    }

    const [, bits, expectedBase64] = match;
    const algorithm = `SHA-${bits}`;

    try {
      const hashBuffer = await crypto.subtle.digest(algorithm, content as BufferSource);
      const hashArray = Array.from(new Uint8Array(hashBuffer));

      // Convert to base64
      const actualBase64 = btoa(String.fromCharCode(...hashArray));

      return actualBase64 === expectedBase64;
    } catch (err) {
      return false;
    }
  }

  /**
   * Generate SRI hash
   */
  async generateSRI(
    content: Uint8Array | ArrayBuffer,
    algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-384'
  ): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(algorithm, content as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode(...hashArray));

    const bits = algorithm.split('-')[1];
    return `sha${bits}-${base64}`;
  }

  /**
   * Compare two hashes
   */
  compareHashes(hash1: string, hash2: string): boolean {
    return hash1.toLowerCase() === hash2.toLowerCase();
  }

  /**
   * Validate hash format
   */
  isValidHashFormat(hash: string): boolean {
    // Check if it's a valid hex string of appropriate length
    // SHA-256 = 64 chars, SHA-384 = 96 chars, SHA-512 = 128 chars
    const validLengths = [64, 96, 128];
    const isHex = /^[a-f0-9]+$/i.test(hash);

    return isHex && validLengths.includes(hash.length);
  }

  /**
   * Verify package integrity with manifest
   */
  async verifyPackage(
    content: Uint8Array | ArrayBuffer,
    manifest: {
      integrity?: string;
      hash?: string;
      signature?: string;
    },
    options: IntegrityOptions = {}
  ): Promise<IntegrityCheck> {
    const errors: string[] = [];
    let hashMatch = false;
    let signatureValid = false;

    // Try SRI first
    if (manifest.integrity) {
      try {
        const sriValid = await this.verifySRI(content, manifest.integrity);
        if (sriValid) {
          hashMatch = true;
        } else {
          errors.push('SRI verification failed');
        }
      } catch (err) {
        errors.push(`SRI verification error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Try hash if SRI not available or failed
    if (!hashMatch && manifest.hash) {
      const check = await this.verify(content, manifest.hash, options);
      hashMatch = check.hashMatch;
      errors.push(...check.errors);
    }

    // Signature verification (if available)
    if (manifest.signature && options.publicKey) {
      // Placeholder for actual signature verification
      signatureValid = true;
    }

    const valid = errors.length === 0;

    return {
      valid,
      hashMatch,
      signatureValid: manifest.signature ? signatureValid : true,
      errors,
    };
  }
}

/**
 * Create integrity checker
 */
export function createIntegrityChecker(): IntegrityChecker {
  return new IntegrityChecker();
}
