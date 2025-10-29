/**
 * IntegrityChecker Tests
 * Phase 4 - Sprint 3
 */

import { describe, it, expect } from 'vitest';
import { IntegrityChecker, createIntegrityChecker } from '../IntegrityChecker';

describe('IntegrityChecker', () => {
  const checker = new IntegrityChecker();

  describe('Hash Calculation', () => {
    it('should calculate SHA-256 hash', async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);
      const hash = await checker.calculateHash(content);

      expect(hash).toBeTypeOf('string');
      expect(hash).toHaveLength(64); // SHA-256 = 64 hex chars
    });

    it('should produce consistent hashes', async () => {
      const content = new Uint8Array([1, 2, 3]);
      const hash1 = await checker.calculateHash(content);
      const hash2 = await checker.calculateHash(content);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', async () => {
      const content1 = new Uint8Array([1, 2, 3]);
      const content2 = new Uint8Array([4, 5, 6]);

      const hash1 = await checker.calculateHash(content1);
      const hash2 = await checker.calculateHash(content2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Integrity Verification', () => {
    it('should verify matching hash', async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);
      const expectedHash = await checker.calculateHash(content);

      const result = await checker.verify(content, expectedHash);
      expect(result.valid).toBe(true);
      expect(result.hashMatch).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect hash mismatch', async () => {
      const content = new Uint8Array([1, 2, 3]);
      const wrongHash = 'a'.repeat(64);

      const result = await checker.verify(content, wrongHash);
      expect(result.valid).toBe(false);
      expect(result.hashMatch).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should skip hash check when disabled', async () => {
      const content = new Uint8Array([1, 2, 3]);
      const wrongHash = 'wrong';

      const result = await checker.verify(content, wrongHash, { checkHash: false });
      expect(result.valid).toBe(true);
      expect(result.hashMatch).toBe(true);
    });
  });

  describe('Batch Verification', () => {
    it('should verify multiple files', async () => {
      const file1 = new Uint8Array([1, 2, 3]);
      const file2 = new Uint8Array([4, 5, 6]);

      const hash1 = await checker.calculateHash(file1);
      const hash2 = await checker.calculateHash(file2);

      const results = await checker.verifyBatch([
        { content: file1, expectedHash: hash1, path: 'file1.txt' },
        { content: file2, expectedHash: hash2, path: 'file2.txt' },
      ]);

      expect(results.size).toBe(2);
      expect(results.get('file1.txt')?.valid).toBe(true);
      expect(results.get('file2.txt')?.valid).toBe(true);
    });

    it('should handle empty batch', async () => {
      const results = await checker.verifyBatch([]);
      expect(results.size).toBe(0);
    });
  });

  describe('SRI Verification', () => {
    it('should verify valid SRI hash', async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);
      const sriHash = await checker.generateSRI(content);

      const valid = await checker.verifySRI(content, sriHash);
      expect(valid).toBe(true);
    });

    it('should reject invalid SRI format', async () => {
      const content = new Uint8Array([1, 2, 3]);
      const valid = await checker.verifySRI(content, 'invalid-format');
      expect(valid).toBe(false);
    });

    it('should generate SRI with different algorithms', async () => {
      const content = new Uint8Array([1, 2, 3]);

      const sri256 = await checker.generateSRI(content, 'SHA-256');
      const sri384 = await checker.generateSRI(content, 'SHA-384');
      const sri512 = await checker.generateSRI(content, 'SHA-512');

      expect(sri256).toMatch(/^sha256-/);
      expect(sri384).toMatch(/^sha384-/);
      expect(sri512).toMatch(/^sha512-/);
    });
  });

  describe('Hash Utilities', () => {
    it('should compare hashes case-insensitively', () => {
      expect(checker.compareHashes('ABC', 'abc')).toBe(true);
      expect(checker.compareHashes('ABC', 'DEF')).toBe(false);
    });

    it('should validate hash format', () => {
      expect(checker.isValidHashFormat('a'.repeat(64))).toBe(true); // SHA-256
      expect(checker.isValidHashFormat('a'.repeat(96))).toBe(true); // SHA-384
      expect(checker.isValidHashFormat('a'.repeat(128))).toBe(true); // SHA-512
      expect(checker.isValidHashFormat('invalid')).toBe(false);
      expect(checker.isValidHashFormat('gggg' + 'a'.repeat(60))).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should create checker via helper', () => {
      const c = createIntegrityChecker();
      expect(c).toBeInstanceOf(IntegrityChecker);
    });
  });
});
