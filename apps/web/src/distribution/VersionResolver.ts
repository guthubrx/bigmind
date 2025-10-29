/**
 * Version Resolver
 * SemVer version resolution and comparison
 * Phase 4 - Sprint 3 - CORE
 */

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string[];
  build?: string;
}

/**
 * VersionResolver - SemVer operations
 */
export class VersionResolver {
  /**
   * Parse semantic version
   */
  parse(version: string): ParsedVersion | null {
    // Remove leading 'v'
    const clean = version.startsWith('v') ? version.slice(1) : version;

    // Regex for SemVer: major.minor.patch[-prerelease][+build]
    const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    const match = clean.match(regex);

    if (!match) {
      return null;
    }

    const [, major, minor, patch, prerelease, build] = match;

    return {
      major: parseInt(major, 10),
      minor: parseInt(minor, 10),
      patch: parseInt(patch, 10),
      prerelease: prerelease ? prerelease.split('.') : undefined,
      build,
    };
  }

  /**
   * Compare two versions
   * Returns: -1 (a < b), 0 (a === b), 1 (a > b)
   */
  compare(a: string, b: string): number {
    const vA = this.parse(a);
    const vB = this.parse(b);

    if (!vA || !vB) {
      throw new Error(`Invalid version: ${!vA ? a : b}`);
    }

    // Compare major.minor.patch
    if (vA.major !== vB.major) {
      return vA.major - vB.major;
    }

    if (vA.minor !== vB.minor) {
      return vA.minor - vB.minor;
    }

    if (vA.patch !== vB.patch) {
      return vA.patch - vB.patch;
    }

    // Compare prerelease
    // Version without prerelease > version with prerelease
    if (!vA.prerelease && vB.prerelease) {
      return 1;
    }

    if (vA.prerelease && !vB.prerelease) {
      return -1;
    }

    if (vA.prerelease && vB.prerelease) {
      return this.comparePrereleases(vA.prerelease, vB.prerelease);
    }

    // Build metadata is ignored in precedence
    return 0;
  }

  /**
   * Compare prerelease identifiers
   */
  private comparePrereleases(a: string[], b: string[]): number {
    const maxLen = Math.max(a.length, b.length);

    for (let i = 0; i < maxLen; i++) {
      const identA = a[i];
      const identB = b[i];

      // Longer prerelease array > shorter
      if (identA === undefined) {
        return -1;
      }

      if (identB === undefined) {
        return 1;
      }

      // Numeric comparison
      const numA = parseInt(identA, 10);
      const numB = parseInt(identB, 10);

      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) {
          return numA - numB;
        }
      } else if (!isNaN(numA)) {
        // Numeric identifier < alphanumeric
        return -1;
      } else if (!isNaN(numB)) {
        return 1;
      } else {
        // Lexicographic comparison
        if (identA !== identB) {
          return identA < identB ? -1 : 1;
        }
      }
    }

    return 0;
  }

  /**
   * Check if version satisfies range
   */
  satisfies(version: string, range: string): boolean {
    // Handle exact version
    if (!range.includes('^') && !range.includes('~') && !range.includes('>') && !range.includes('<') && !range.includes('*')) {
      return this.compare(version, range) === 0;
    }

    // Handle caret (^): compatible with minor versions
    if (range.startsWith('^')) {
      return this.satisfiesCaret(version, range.slice(1));
    }

    // Handle tilde (~): compatible with patch versions
    if (range.startsWith('~')) {
      return this.satisfiesTilde(version, range.slice(1));
    }

    // Handle wildcard (*)
    if (range.includes('*')) {
      return this.satisfiesWildcard(version, range);
    }

    // Handle comparison operators (>=, >, <=, <)
    if (range.includes('>=')) {
      const [_, target] = range.split('>=');
      return this.compare(version, target.trim()) >= 0;
    }

    if (range.includes('>')) {
      const [_, target] = range.split('>');
      return this.compare(version, target.trim()) > 0;
    }

    if (range.includes('<=')) {
      const [_, target] = range.split('<=');
      return this.compare(version, target.trim()) <= 0;
    }

    if (range.includes('<')) {
      const [_, target] = range.split('<');
      return this.compare(version, target.trim()) < 0;
    }

    // Fallback: exact match
    return this.compare(version, range) === 0;
  }

  /**
   * Caret range (^): ^1.2.3 := >=1.2.3 <2.0.0
   */
  private satisfiesCaret(version: string, base: string): boolean {
    const vParsed = this.parse(version);
    const bParsed = this.parse(base);

    if (!vParsed || !bParsed) {
      return false;
    }

    // Major must match
    if (vParsed.major !== bParsed.major) {
      return false;
    }

    // If major is 0, minor must match too (0.x.y)
    if (bParsed.major === 0) {
      if (vParsed.minor !== bParsed.minor) {
        return false;
      }

      // Patch must be >= base
      return vParsed.patch >= bParsed.patch;
    }

    // Version must be >= base
    return this.compare(version, base) >= 0;
  }

  /**
   * Tilde range (~): ~1.2.3 := >=1.2.3 <1.3.0
   */
  private satisfiesTilde(version: string, base: string): boolean {
    const vParsed = this.parse(version);
    const bParsed = this.parse(base);

    if (!vParsed || !bParsed) {
      return false;
    }

    // Major and minor must match
    if (vParsed.major !== bParsed.major || vParsed.minor !== bParsed.minor) {
      return false;
    }

    // Patch must be >= base
    return vParsed.patch >= bParsed.patch;
  }

  /**
   * Wildcard range: 1.2.* := >=1.2.0 <1.3.0
   */
  private satisfiesWildcard(version: string, pattern: string): boolean {
    const vParsed = this.parse(version);
    if (!vParsed) {
      return false;
    }

    const parts = pattern.split('.');

    // Match major
    if (parts[0] !== '*' && parseInt(parts[0], 10) !== vParsed.major) {
      return false;
    }

    // Match minor
    if (parts[1] && parts[1] !== '*' && parseInt(parts[1], 10) !== vParsed.minor) {
      return false;
    }

    // Match patch
    if (parts[2] && parts[2] !== '*' && parseInt(parts[2], 10) !== vParsed.patch) {
      return false;
    }

    return true;
  }

  /**
   * Check if version is prerelease
   */
  isPrerelease(version: string): boolean {
    const parsed = this.parse(version);
    return !!(parsed && parsed.prerelease);
  }

  /**
   * Increment version
   */
  increment(version: string, part: 'major' | 'minor' | 'patch'): string | null {
    const parsed = this.parse(version);
    if (!parsed) {
      return null;
    }

    switch (part) {
      case 'major':
        return `${parsed.major + 1}.0.0`;
      case 'minor':
        return `${parsed.major}.${parsed.minor + 1}.0`;
      case 'patch':
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
      default:
        return null;
    }
  }

  /**
   * Get latest version from array
   */
  getLatest(versions: string[]): string | null {
    if (versions.length === 0) {
      return null;
    }

    return versions.reduce((latest, current) => {
      return this.compare(current, latest) > 0 ? current : latest;
    });
  }

  /**
   * Sort versions ascending
   */
  sort(versions: string[]): string[] {
    return [...versions].sort((a, b) => this.compare(a, b));
  }
}

/**
 * Create version resolver
 */
export function createVersionResolver(): VersionResolver {
  return new VersionResolver();
}
