/**
 * Manifest validation using JSON Schema
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Ajv from 'ajv';

/**
 * JSON Schema for plugin manifest
 */
const manifestSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+$' },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+' },
    description: { type: 'string' },
    author: {
      anyOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: ['string', 'null'] },
            url: { type: ['string', 'null'] },
          },
          required: ['name'],
        },
      ],
    },
    bigmindVersion: { type: ['string', 'null'] },
    main: { type: 'string' },
    permissions: {
      anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    },
    icon: { type: ['string', 'null'] },
    homepage: { type: ['string', 'null'] },
    repository: { type: ['string', 'null'] },
    license: { type: ['string', 'null'] },
    keywords: {
      anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    },
    contributes: {
      anyOf: [
        {
          type: 'object',
          properties: {
            commands: {
              anyOf: [{ type: 'array', items: { type: 'object' } }, { type: 'null' }],
            },
            menus: {
              anyOf: [{ type: 'array', items: { type: 'object' } }, { type: 'null' }],
            },
            themes: {
              anyOf: [{ type: 'array', items: { type: 'object' } }, { type: 'null' }],
            },
            templates: {
              anyOf: [{ type: 'array', items: { type: 'object' } }, { type: 'null' }],
            },
            fileFormats: {
              anyOf: [{ type: 'array', items: { type: 'object' } }, { type: 'null' }],
            },
          },
        },
        { type: 'null' },
      ],
    },
  },
  required: ['id', 'name', 'version', 'description', 'author', 'main'],
  additionalProperties: true,
};

const ajv = new Ajv();
const validate = ajv.compile(manifestSchema);

/**
 * Validate a plugin manifest
 */
export function validateManifest(manifest: any): { valid: boolean; errors: string[] } {
  const valid = validate(manifest);

  if (!valid) {
    const errors = validate.errors?.map(err => `${err.instancePath} ${err.message}`) || [];

    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
