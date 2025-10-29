/**
 * VersionResolver Tests
 * Phase 4 - Sprint 3
 */

import { describe, it, expect } from 'vitest';
import { VersionResolver, createVersionResolver } from '../VersionResolver';

describe('VersionResolver', () => {
  const resolver = new VersionResolver();

  describe('Version Parsing', () => {
    it('should parse valid semver', () => {
      const parsed = resolver.parse('1.2.3');
      expect(parsed).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: undefined,
        build: undefined,
      });
    });

    it('should parse version with prerelease', () => {
      const parsed = resolver.parse('1.2.3-alpha.1');
      expect(parsed?.prerelease).toEqual(['alpha', '1']);
    });

    it('should parse version with build', () => {
      const parsed = resolver.parse('1.2.3+build.123');
      expect(parsed?.build).toBe('build.123');
    });

    it('should parse version with v prefix', () => {
      const parsed = resolver.parse('v1.2.3');
      expect(parsed?.major).toBe(1);
    });

    it('should return null for invalid version', () => {
      expect(resolver.parse('invalid')).toBeNull();
    });
  });

  describe('Version Comparison', () => {
    it('should compare major versions', () => {
      expect(resolver.compare('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(resolver.compare('1.0.0', '2.0.0')).toBeLessThan(0);
    });

    it('should compare minor versions', () => {
      expect(resolver.compare('1.2.0', '1.1.0')).toBeGreaterThan(0);
    });

    it('should compare patch versions', () => {
      expect(resolver.compare('1.0.2', '1.0.1')).toBeGreaterThan(0);
    });

    it('should return 0 for equal versions', () => {
      expect(resolver.compare('1.2.3', '1.2.3')).toBe(0);
    });

    it('should treat prerelease as lower than release', () => {
      expect(resolver.compare('1.0.0-alpha', '1.0.0')).toBeLessThan(0);
    });

    it('should compare prerelease versions', () => {
      expect(resolver.compare('1.0.0-alpha.2', '1.0.0-alpha.1')).toBeGreaterThan(0);
    });
  });

  describe('Version Satisfaction', () => {
    it('should satisfy exact version', () => {
      expect(resolver.satisfies('1.2.3', '1.2.3')).toBe(true);
      expect(resolver.satisfies('1.2.3', '1.2.4')).toBe(false);
    });

    it('should satisfy caret range', () => {
      expect(resolver.satisfies('1.2.3', '^1.0.0')).toBe(true);
      expect(resolver.satisfies('1.9.9', '^1.0.0')).toBe(true);
      expect(resolver.satisfies('2.0.0', '^1.0.0')).toBe(false);
    });

    it('should satisfy tilde range', () => {
      expect(resolver.satisfies('1.2.3', '~1.2.0')).toBe(true);
      expect(resolver.satisfies('1.2.9', '~1.2.0')).toBe(true);
      expect(resolver.satisfies('1.3.0', '~1.2.0')).toBe(false);
    });

    it('should satisfy wildcard', () => {
      expect(resolver.satisfies('1.2.3', '1.2.*')).toBe(true);
      expect(resolver.satisfies('1.3.0', '1.2.*')).toBe(false);
    });

    it('should satisfy comparison operators', () => {
      expect(resolver.satisfies('1.2.3', '>=1.0.0')).toBe(true);
      expect(resolver.satisfies('1.2.3', '>1.0.0')).toBe(true);
      expect(resolver.satisfies('1.2.3', '<=2.0.0')).toBe(true);
      expect(resolver.satisfies('1.2.3', '<2.0.0')).toBe(true);
    });
  });

  describe('Prerelease Detection', () => {
    it('should detect prerelease versions', () => {
      expect(resolver.isPrerelease('1.0.0-alpha')).toBe(true);
      expect(resolver.isPrerelease('1.0.0')).toBe(false);
    });
  });

  describe('Version Increment', () => {
    it('should increment major version', () => {
      expect(resolver.increment('1.2.3', 'major')).toBe('2.0.0');
    });

    it('should increment minor version', () => {
      expect(resolver.increment('1.2.3', 'minor')).toBe('1.3.0');
    });

    it('should increment patch version', () => {
      expect(resolver.increment('1.2.3', 'patch')).toBe('1.2.4');
    });
  });

  describe('Latest Version', () => {
    it('should get latest version from array', () => {
      const versions = ['1.0.0', '1.2.0', '1.1.0', '2.0.0'];
      expect(resolver.getLatest(versions)).toBe('2.0.0');
    });

    it('should return null for empty array', () => {
      expect(resolver.getLatest([])).toBeNull();
    });
  });

  describe('Version Sorting', () => {
    it('should sort versions ascending', () => {
      const versions = ['2.0.0', '1.0.0', '1.5.0', '1.2.0'];
      const sorted = resolver.sort(versions);
      expect(sorted).toEqual(['1.0.0', '1.2.0', '1.5.0', '2.0.0']);
    });
  });

  describe('Helper Functions', () => {
    it('should create resolver via helper', () => {
      const r = createVersionResolver();
      expect(r).toBeInstanceOf(VersionResolver);
    });
  });
});
