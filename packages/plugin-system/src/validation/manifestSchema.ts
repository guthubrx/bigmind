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
            email: { type: 'string', nullable: true },
            url: { type: 'string', nullable: true },
          },
          required: ['name'],
        },
      ],
    },
    bigmindVersion: { type: 'string', nullable: true },
    main: { type: 'string' },
    permissions: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    icon: { type: 'string', nullable: true },
    homepage: { type: 'string', nullable: true },
    repository: { type: 'string', nullable: true },
    license: { type: 'string', nullable: true },
    keywords: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    contributes: {
      type: 'object',
      nullable: true,
      properties: {
        commands: { type: 'array', items: { type: 'object' }, nullable: true },
        menus: { type: 'array', items: { type: 'object' }, nullable: true },
        themes: { type: 'array', items: { type: 'object' }, nullable: true },
        templates: { type: 'array', items: { type: 'object' }, nullable: true },
        fileFormats: { type: 'array', items: { type: 'object' }, nullable: true },
      },
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
