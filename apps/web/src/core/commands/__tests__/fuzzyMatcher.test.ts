/**
 * Tests for fuzzyMatcher
 * Fuzzy search with Levenshtein distance algorithm
 */

import { describe, it, expect } from 'vitest';
import { fuzzyScore, findMatches, fuzzySearch } from '../fuzzyMatcher';
import type { Command } from '../types';

describe('fuzzyScore', () => {
  it('should return 1 for exact match', () => {
    expect(fuzzyScore('save', 'save')).toBe(1);
    expect(fuzzyScore('SAVE', 'save')).toBe(1);
  });

  it('should return 0.9 for starts-with match', () => {
    expect(fuzzyScore('sav', 'save')).toBe(0.9);
    expect(fuzzyScore('sa', 'save file')).toBe(0.9);
  });

  it('should return 0.7 for contains match', () => {
    expect(fuzzyScore('ave', 'save')).toBe(0.7);
    expect(fuzzyScore('file', 'save file')).toBe(0.7);
  });

  it('should return 0 for no match', () => {
    expect(fuzzyScore('xyz', 'save')).toBe(0);
    expect(fuzzyScore('abc', 'def')).toBe(0);
  });

  it('should handle case insensitivity', () => {
    expect(fuzzyScore('SaVe', 'save')).toBe(1);
    expect(fuzzyScore('SAVE', 'Save File')).toBe(0.9);
  });

  it('should score fuzzy matches', () => {
    const score = fuzzyScore('sav', 'save file');
    // "sav" starts with "save file" so should get 0.9
    expect(score).toBe(0.9);
  });
});

describe('findMatches', () => {
  it('should find exact substring matches', () => {
    const matches = findMatches('save', 'save file');
    expect(matches).toEqual([{ start: 0, end: 4 }]);
  });

  it('should find matches case-insensitively', () => {
    const matches = findMatches('SAVE', 'save file');
    expect(matches).toEqual([{ start: 0, end: 4 }]);
  });

  it('should return empty array for no match', () => {
    const matches = findMatches('xyz', 'save file');
    expect(matches).toEqual([]);
  });

  it('should find fuzzy character matches', () => {
    const matches = findMatches('sf', 'save file');
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe('fuzzySearch', () => {
  const commands: Command[] = [
    {
      id: 'file.save',
      title: 'Save File',
      category: 'File',
      handler: () => {},
    },
    {
      id: 'file.open',
      title: 'Open File',
      category: 'File',
      handler: () => {},
    },
    {
      id: 'edit.copy',
      title: 'Copy',
      category: 'Edit',
      handler: () => {},
    },
    {
      id: 'edit.paste',
      title: 'Paste',
      category: 'Edit',
      handler: () => {},
    },
  ];

  it('should return all commands for empty query', () => {
    const results = fuzzySearch(commands, '');
    expect(results).toHaveLength(4);
    expect(results.every(r => r.score === 1)).toBe(true);
  });

  it('should filter commands by title', () => {
    const results = fuzzySearch(commands, 'save');
    expect(results).toHaveLength(1);
    expect(results[0].command.id).toBe('file.save');
  });

  it('should sort by score descending', () => {
    const results = fuzzySearch(commands, 'file');
    expect(results.length).toBeGreaterThan(0);
    // First result should have highest score
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('should match by category', () => {
    const results = fuzzySearch(commands, 'edit');
    expect(results.length).toBeGreaterThan(0);
    // Should include copy and paste
    const ids = results.map(r => r.command.id);
    expect(ids).toContain('edit.copy');
    expect(ids).toContain('edit.paste');
  });

  it('should handle partial matches', () => {
    const results = fuzzySearch(commands, 'cop');
    expect(results.some(r => r.command.id === 'edit.copy')).toBe(true);
  });

  it('should return empty for no matches', () => {
    const results = fuzzySearch(commands, 'xyz123');
    expect(results).toHaveLength(0);
  });

  it('should include match positions', () => {
    const results = fuzzySearch(commands, 'save');
    expect(results[0].matches.length).toBeGreaterThan(0);
  });
});
