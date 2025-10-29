/**
 * Fuzzy Matcher for Command Palette
 * Implements fuzzy search with scoring
 */

import type { Command, CommandMatch } from './types';

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score
 * Returns 0-1 (higher = better match)
 */
export function fuzzyScore(query: string, target: string): number {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match
  if (queryLower === targetLower) return 1;

  // Starts with
  if (targetLower.startsWith(queryLower)) return 0.9;

  // Contains (substring match)
  if (targetLower.includes(queryLower)) return 0.7;

  // Fuzzy match with Levenshtein
  const distance = levenshteinDistance(queryLower, targetLower);
  const maxLen = Math.max(queryLower.length, targetLower.length);
  const score = 1 - distance / maxLen;

  // Only return if score is decent
  return score > 0.5 ? score * 0.6 : 0;
}

/**
 * Find match positions for highlighting
 */
export function findMatches(query: string, target: string): Array<{ start: number; end: number }> {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  const matches: Array<{ start: number; end: number }> = [];

  // Simple substring match
  let index = targetLower.indexOf(queryLower);
  if (index !== -1) {
    matches.push({ start: index, end: index + queryLower.length });
    return matches;
  }

  // Character-by-character fuzzy match
  let queryIndex = 0;
  let matchStart = -1;

  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      if (matchStart === -1) {
        matchStart = i;
      }
      queryIndex++;

      // End of query or next char doesn't match
      if (queryIndex === queryLower.length || targetLower[i + 1] !== queryLower[queryIndex]) {
        matches.push({ start: matchStart, end: i + 1 });
        matchStart = -1;
      }
    }
  }

  return matches;
}

/**
 * Search commands with fuzzy matching
 */
export function fuzzySearch(commands: Command[], query: string): CommandMatch[] {
  if (!query.trim()) {
    // Return all commands with default score
    return commands.map((command) => ({
      command,
      score: 1,
      matches: [],
    }));
  }

  const results: CommandMatch[] = [];

  for (const command of commands) {
    // Search in title and category
    const titleScore = fuzzyScore(query, command.title);
    const categoryScore = command.category ? fuzzyScore(query, command.category) * 0.8 : 0;

    // Use best score
    const score = Math.max(titleScore, categoryScore);

    if (score > 0) {
      const matches = findMatches(query, command.title);
      results.push({ command, score, matches });
    }
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  return results;
}
