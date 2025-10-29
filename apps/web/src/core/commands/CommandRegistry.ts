/**
 * Command Registry
 * Central registry for all commands (core + plugins)
 */

import type { Command } from './types';

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands = new Map<string, Command>();
  private listeners = new Set<() => void>();

  private constructor() {}

  static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  /**
   * Register a command
   */
  register(command: Command): () => void {
    if (this.commands.has(command.id)) {
      console.warn(`Command ${command.id} already registered, overwriting`);
    }

    this.commands.set(command.id, command);
    this.notifyListeners();

    // Return unregister function
    return () => this.unregister(command.id);
  }

  /**
   * Unregister a command
   */
  unregister(commandId: string): void {
    if (this.commands.delete(commandId)) {
      this.notifyListeners();
    }
  }

  /**
   * Get command by ID
   */
  get(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }

  /**
   * Get all commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getByCategory(category: string): Command[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  /**
   * Get commands by plugin
   */
  getByPlugin(pluginId: string): Command[] {
    return this.getAll().filter((cmd) => cmd.pluginId === pluginId);
  }

  /**
   * Check if command exists
   */
  has(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('Error in command registry listener:', error);
      }
    });
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
    this.notifyListeners();
  }

  /**
   * Get registry stats
   */
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    byPlugin: Record<string, number>;
  } {
    const stats = {
      total: this.commands.size,
      byCategory: {} as Record<string, number>,
      byPlugin: {} as Record<string, number>,
    };

    for (const command of this.commands.values()) {
      // Count by category
      if (command.category) {
        stats.byCategory[command.category] = (stats.byCategory[command.category] || 0) + 1;
      }

      // Count by plugin
      if (command.pluginId) {
        stats.byPlugin[command.pluginId] = (stats.byPlugin[command.pluginId] || 0) + 1;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const commandRegistry = CommandRegistry.getInstance();
