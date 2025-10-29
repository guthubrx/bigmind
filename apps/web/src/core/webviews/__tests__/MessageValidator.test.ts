/**
 * Tests for MessageValidator
 * Zod validation and payload sanitization
 */

import { describe, it, expect } from 'vitest';
import { validateMessage, validateResponse, sanitizePayload } from '../MessageValidator';

describe('validateMessage', () => {
  it('should validate valid message', () => {
    const message = {
      type: 'data.read',
      payload: { path: '/test' },
      requestId: 1,
    };

    expect(validateMessage(message)).toBe(true);
  });

  it('should validate message without requestId', () => {
    const message = {
      type: 'event:test',
      payload: { data: 'test' },
    };

    expect(validateMessage(message)).toBe(true);
  });

  it('should reject message without type', () => {
    const message = {
      payload: { data: 'test' },
    };

    expect(validateMessage(message)).toBe(false);
  });

  it('should reject non-object messages', () => {
    expect(validateMessage('string')).toBe(false);
    expect(validateMessage(123)).toBe(false);
    expect(validateMessage(null)).toBe(false);
  });

  it('should handle empty payload', () => {
    const message = {
      type: 'test',
    };

    expect(validateMessage(message)).toBe(true);
  });
});

describe('validateResponse', () => {
  it('should validate valid success response', () => {
    const response = {
      requestId: 1,
      success: true,
      data: { result: 'ok' },
    };

    expect(validateResponse(response)).toBe(true);
  });

  it('should validate valid error response', () => {
    const response = {
      requestId: 1,
      success: false,
      error: 'Something went wrong',
    };

    expect(validateResponse(response)).toBe(true);
  });

  it('should reject response without requestId', () => {
    const response = {
      success: true,
      data: 'test',
    };

    expect(validateResponse(response)).toBe(false);
  });

  it('should reject response without success field', () => {
    const response = {
      requestId: 1,
      data: 'test',
    };

    expect(validateResponse(response)).toBe(false);
  });
});

describe('sanitizePayload', () => {
  it('should remove __proto__ property', () => {
    const payload = {
      data: 'test',
      __proto__: { malicious: true },
    };

    const sanitized = sanitizePayload(payload);

    expect(sanitized).toHaveProperty('data', 'test');
    expect(sanitized).not.toHaveProperty('__proto__');
  });

  it('should remove constructor property', () => {
    const payload = {
      data: 'test',
      constructor: { malicious: true },
    };

    const sanitized = sanitizePayload(payload);

    expect(sanitized).toHaveProperty('data', 'test');
    expect(sanitized).not.toHaveProperty('constructor');
  });

  it('should remove prototype property', () => {
    const payload = {
      data: 'test',
      prototype: { malicious: true },
    };

    const sanitized = sanitizePayload(payload);

    expect(sanitized).toHaveProperty('data', 'test');
    expect(sanitized).not.toHaveProperty('prototype');
  });

  it('should sanitize nested objects', () => {
    const payload = {
      data: {
        nested: {
          __proto__: { malicious: true },
          safe: 'value',
        },
      },
    };

    const sanitized = sanitizePayload(payload);

    expect(sanitized.data.nested).toHaveProperty('safe', 'value');
    expect(sanitized.data.nested).not.toHaveProperty('__proto__');
  });

  it('should handle null and undefined', () => {
    expect(sanitizePayload(null)).toBe(null);
    expect(sanitizePayload(undefined)).toBe(undefined);
  });

  it('should handle primitive values', () => {
    expect(sanitizePayload('string')).toBe('string');
    expect(sanitizePayload(123)).toBe(123);
    expect(sanitizePayload(true)).toBe(true);
  });

  it('should handle arrays', () => {
    const payload = [
      { __proto__: 'bad', data: 'test1' },
      { constructor: 'bad', data: 'test2' },
    ];

    const sanitized = sanitizePayload(payload);

    expect(sanitized[0]).toHaveProperty('data', 'test1');
    expect(sanitized[0]).not.toHaveProperty('__proto__');
    expect(sanitized[1]).toHaveProperty('data', 'test2');
    expect(sanitized[1]).not.toHaveProperty('constructor');
  });

  it('should preserve safe properties', () => {
    const payload = {
      id: 1,
      name: 'test',
      nested: {
        value: 'safe',
        count: 42,
      },
    };

    const sanitized = sanitizePayload(payload);

    expect(sanitized).toEqual(payload);
  });
});
