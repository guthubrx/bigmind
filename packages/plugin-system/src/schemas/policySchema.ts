/**
 * Policy Schema - JSON Schema for policy validation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Ajv from 'ajv';

/**
 * JSON Schema for Policy document
 */
const policySchema = {
  type: 'object',
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+$' },
    id: { type: 'string', nullable: true },
    statement: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          effect: { type: 'string', enum: ['Allow', 'Deny'] },
          action: {
            anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          },
          resource: {
            anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
            nullable: true,
          },
          condition: {
            type: 'object',
            nullable: true,
            properties: {
              NumericEquals: { type: 'object', nullable: true },
              NumericNotEquals: { type: 'object', nullable: true },
              NumericLessThan: { type: 'object', nullable: true },
              NumericLessThanEquals: { type: 'object', nullable: true },
              NumericGreaterThan: { type: 'object', nullable: true },
              NumericGreaterThanEquals: { type: 'object', nullable: true },
              StringEquals: { type: 'object', nullable: true },
              StringNotEquals: { type: 'object', nullable: true },
              StringLike: { type: 'object', nullable: true },
              Bool: { type: 'object', nullable: true },
              DateEquals: { type: 'object', nullable: true },
              DateNotEquals: { type: 'object', nullable: true },
              DateLessThan: { type: 'object', nullable: true },
              DateGreaterThan: { type: 'object', nullable: true },
              ArrayContains: { type: 'object', nullable: true },
            },
            additionalProperties: false,
          },
        },
        required: ['effect', 'action'],
        additionalProperties: false,
      },
    },
  },
  required: ['version', 'statement'],
  additionalProperties: false,
};

const ajv = new Ajv();
const validate = ajv.compile(policySchema);

/**
 * Validate a policy document
 */
export function validatePolicy(policy: any): { valid: boolean; errors: string[] } {
  const valid = validate(policy);

  if (!valid) {
    const errors = validate.errors?.map(err => `${err.instancePath} ${err.message}`) || [];

    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Export schema for documentation
 */
export { policySchema };
