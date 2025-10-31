/**
 * Security Module
 * Code signing and verification for plugin distribution
 * Phase 4 - Sprint 1 - CORE
 */

// Key Management
export { KeyManager, getKeyManager } from './KeyManager';
export type { KeyPair, SerializedKeyPair, PublicKeyInfo } from './KeyManager';

// Signing
export { Signer, createSigner, quickSign, quickSignManifest } from './Signer';
export type { SignatureResult, SignOptions } from './Signer';

// Verification
export { Verifier, createVerifier, quickVerify, quickVerifyManifest } from './Verifier';
export type { VerificationResult, VerifyOptions } from './Verifier';
