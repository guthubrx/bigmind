/**
 * Types for Command System
 * VSCode-style command palette with fuzzy matching
 */

/**
 * Command definition
 */
export interface Command {
  /** Unique command ID (e.g., "file.save") */
  id: string;
  /** Display title */
  title: string;
  /** Category for grouping (e.g., "File", "Edit") */
  category?: string;
  /** Icon name or component */
  icon?: string;
  /** Keyboard shortcut */
  shortcut?: string | string[];
  /** When clause (context expression) */
  when?: string;
  /** Plugin that registered this command */
  pluginId?: string;
  /** Command handler function */
  handler: (...args: any[]) => any | Promise<any>;
}

/**
 * Command match result (for search)
 */
export interface CommandMatch {
  command: Command;
  /** Match score (0-1, higher = better) */
  score: number;
  /** Matched parts for highlighting */
  matches: Array<{ start: number; end: number }>;
}

/**
 * Command execution context
 */
export interface CommandContext {
  /** Currently focused element */
  activeElement?: Element;
  /** Current selection */
  selection?: any;
  /** Additional context data */
  [key: string]: any;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  result?: any;
  error?: Error;
}
