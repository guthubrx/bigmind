/**
 * Message Validator
 * Validates messages using Zod schemas
 */

import { z } from 'zod';

/**
 * Schema for bridge messages
 */
export const BridgeMessageSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
  requestId: z.number().optional(),
});

/**
 * Schema for bridge responses
 */
export const BridgeResponseSchema = z.object({
  requestId: z.number(),
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

/**
 * Validate incoming message
 */
export function validateMessage(message: unknown): boolean {
  try {
    BridgeMessageSchema.parse(message);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate response message
 */
export function validateResponse(response: unknown): boolean {
  try {
    BridgeResponseSchema.parse(response);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize message payload
 * Removes potentially dangerous properties
 */
export function sanitizePayload(payload: any): any {
  if (typeof payload !== 'object' || payload === null) {
    return payload;
  }

  // Remove __proto__, constructor, prototype
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const cleaned = { ...payload };

  for (const key of dangerous) {
    delete cleaned[key];
  }

  // Recursively sanitize nested objects
  for (const key in cleaned) {
    if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = sanitizePayload(cleaned[key]);
    }
  }

  return cleaned;
}
