/**
 * Command System
 * VSCode-style command registry and execution
 */

export { commandRegistry, CommandRegistry } from './CommandRegistry';
export { commandExecutor, CommandExecutor } from './CommandExecutor';
export { keyboardManager } from './KeyboardManager';
export { fuzzySearch, fuzzyScore, findMatches } from './fuzzyMatcher';
export { CommandPalette, useCommandPalette } from './CommandPalette';
export type {
  Command,
  CommandMatch,
  CommandContext,
  CommandResult,
} from './types';
export type { ShortcutConfig } from './KeyboardManager';
