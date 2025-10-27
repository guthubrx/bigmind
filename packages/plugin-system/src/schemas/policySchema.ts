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
    id: { type: ['string', 'null'] },
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
            anyOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } },
              { type: 'null' },
            ],
          },
          condition: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  NumericEquals: { type: 'object' },
                  NumericNotEquals: { type: 'object' },
                  NumericLessThan: { type: 'object' },
                  NumericLessThanEquals: { type: 'object' },
                  NumericGreaterThan: { type: 'object' },
                  NumericGreaterThanEquals: { type: 'object' },
                  StringEquals: { type: 'object' },
                  StringNotEquals: { type: 'object' },
                  StringLike: { type: 'object' },
                  Bool: { type: 'object' },
                  DateEquals: { type: 'object' },
                  DateNotEquals: { type: 'object' },
                  DateLessThan: { type: 'object' },
                  DateGreaterThan: { type: 'object' },
                  ArrayContains: { type: 'object' },
                },
                additionalProperties: false,
              },
              { type: 'null' },
            ],
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
