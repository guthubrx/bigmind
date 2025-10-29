/**
 * Keyboard Manager
 * Global keyboard shortcut handling with platform detection
 */

import { commandRegistry } from './CommandRegistry';
import { commandExecutor } from './CommandExecutor';
import type { Command, CommandContext } from './types';

/**
 * Platform type
 */
type Platform = 'mac' | 'windows' | 'linux';

/**
 * Shortcut configuration
 */
export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

class KeyboardManager {
  private static instance: KeyboardManager;
  private platform: Platform;
  private shortcuts = new Map<string, string>(); // normalized shortcut -> commandId
  private enabled = true;
  private contextStack: CommandContext[] = [];

  private constructor() {
    this.platform = this.detectPlatform();
    this.setupGlobalListener();
  }

  static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  /**
   * Detect platform
   */
  private detectPlatform(): Platform {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('win')) return 'windows';
    return 'linux';
  }

  /**
   * Setup global keydown listener
   */
  private setupGlobalListener(): void {
    document.addEventListener('keydown', this.handleKeydown.bind(this), true);
  }

  /**
   * Handle keydown event
   */
  private async handleKeydown(event: KeyboardEvent): Promise<void> {
    if (!this.enabled) return;

    // Don't intercept if typing in input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow some common shortcuts even in inputs
      const allowedInInputs = ['Escape', 'F1', 'F2', 'F3'];
      if (!allowedInInputs.includes(event.key)) {
        return;
      }
    }

    // Normalize shortcut
    const shortcut = this.normalizeShortcut({
      key: event.key,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    });

    // Find command for this shortcut
    const commandId = this.shortcuts.get(shortcut);
    if (!commandId) return;

    // Get command
    const command = commandRegistry.get(commandId);
    if (!command) return;

    // Check when clause
    const context = this.getCurrentContext();
    if (command.when && !this.evaluateWhenClause(command.when, context)) {
      return;
    }

    // Execute command
    event.preventDefault();
    event.stopPropagation();

    try {
      await commandExecutor.execute(commandId, context);
    } catch (error) {
      console.error(`Failed to execute command ${commandId}:`, error);
    }
  }

  /**
   * Register shortcut for command
   */
  registerShortcut(commandId: string, shortcut: string | ShortcutConfig): void {
    const normalized =
      typeof shortcut === 'string' ? this.parseShortcut(shortcut) : this.normalizeShortcut(shortcut);

    // Check for conflicts
    const existing = this.shortcuts.get(normalized);
    if (existing && existing !== commandId) {
      console.warn(
        `Shortcut conflict: ${normalized} already registered for ${existing}, overwriting with ${commandId}`
      );
    }

    this.shortcuts.set(normalized, commandId);
  }

  /**
   * Unregister shortcut
   */
  unregisterShortcut(shortcut: string | ShortcutConfig): void {
    const normalized =
      typeof shortcut === 'string' ? this.parseShortcut(shortcut) : this.normalizeShortcut(shortcut);

    this.shortcuts.delete(normalized);
  }

  /**
   * Parse shortcut string (e.g., "Cmd+K", "Ctrl+Shift+P")
   */
  private parseShortcut(shortcut: string): string {
    const parts = shortcut.split('+').map((p) => p.trim());
    const config: ShortcutConfig = { key: '' };

    for (const part of parts) {
      const lower = part.toLowerCase();

      if (lower === 'ctrl' || lower === 'control') {
        config.ctrl = true;
      } else if (lower === 'alt' || lower === 'option') {
        config.alt = true;
      } else if (lower === 'shift') {
        config.shift = true;
      } else if (lower === 'cmd' || lower === 'meta' || lower === 'command') {
        config.meta = true;
      } else {
        config.key = part;
      }
    }

    return this.normalizeShortcut(config);
  }

  /**
   * Normalize shortcut to consistent string
   */
  private normalizeShortcut(config: ShortcutConfig): string {
    const parts: string[] = [];

    // Order: Ctrl, Alt, Shift, Meta, Key
    if (config.ctrl) parts.push('Ctrl');
    if (config.alt) parts.push('Alt');
    if (config.shift) parts.push('Shift');
    if (config.meta) parts.push('Meta');

    // Normalize key
    let key = config.key;
    if (key.length === 1) {
      key = key.toUpperCase();
    }

    parts.push(key);

    return parts.join('+');
  }

  /**
   * Get platform-specific shortcut label
   * Converts Ctrl -> Cmd on Mac, etc.
   */
  getPlatformShortcutLabel(shortcut: string): string {
    if (this.platform === 'mac') {
      return shortcut
        .replace(/Ctrl\+/g, '⌘')
        .replace(/Alt\+/g, '⌥')
        .replace(/Shift\+/g, '⇧')
        .replace(/Meta\+/g, '⌘');
    }

    return shortcut;
  }

  /**
   * Enable/disable keyboard handling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Push context onto stack
   */
  pushContext(context: CommandContext): void {
    this.contextStack.push(context);
  }

  /**
   * Pop context from stack
   */
  popContext(): CommandContext | undefined {
    return this.contextStack.pop();
  }

  /**
   * Get current context (top of stack)
   */
  private getCurrentContext(): CommandContext {
    return this.contextStack[this.contextStack.length - 1] || {};
  }

  /**
   * Evaluate when clause
   */
  private evaluateWhenClause(whenClause: string, context: CommandContext): boolean {
    // Simple implementation - can be extended
    return whenClause in context && Boolean(context[whenClause]);
  }

  /**
   * Register all shortcuts from commands in registry
   */
  syncWithRegistry(): void {
    const commands = commandRegistry.getAll();

    for (const command of commands) {
      if (command.shortcut) {
        const shortcuts = Array.isArray(command.shortcut)
          ? command.shortcut
          : [command.shortcut];

        for (const shortcut of shortcuts) {
          this.registerShortcut(command.id, shortcut);
        }
      }
    }
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): Map<string, string> {
    return new Map(this.shortcuts);
  }

  /**
   * Check for shortcut conflicts
   */
  getConflicts(): Array<{ shortcut: string; commands: string[] }> {
    const conflicts: Array<{ shortcut: string; commands: string[] }> = [];
    const byShortcut = new Map<string, string[]>();

    // Group commands by shortcut
    for (const [shortcut, commandId] of this.shortcuts.entries()) {
      const commands = byShortcut.get(shortcut) || [];
      commands.push(commandId);
      byShortcut.set(shortcut, commands);
    }

    // Find conflicts (multiple commands for same shortcut)
    for (const [shortcut, commands] of byShortcut.entries()) {
      if (commands.length > 1) {
        conflicts.push({ shortcut, commands });
      }
    }

    return conflicts;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    document.removeEventListener('keydown', this.handleKeydown.bind(this), true);
    this.shortcuts.clear();
    this.contextStack = [];
  }
}

// Export singleton instance
export const keyboardManager = KeyboardManager.getInstance();
