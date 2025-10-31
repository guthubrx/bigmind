/**
 * Command Executor
 * Handles command execution with context and error handling
 */

import { commandRegistry } from './CommandRegistry';
import type { Command, CommandContext, CommandResult } from './types';

export class CommandExecutor {
  private static instance: CommandExecutor;

  private executionHistory: Array<{ commandId: string; timestamp: Date; result: CommandResult }> =
    [];

  private maxHistorySize = 100;

  private constructor() {}

  static getInstance(): CommandExecutor {
    if (!CommandExecutor.instance) {
      CommandExecutor.instance = new CommandExecutor();
    }
    return CommandExecutor.instance;
  }

  /**
   * Execute a command by ID
   */
  async execute(
    commandId: string,
    context?: CommandContext,
    ...args: any[]
  ): Promise<CommandResult> {
    const command = commandRegistry.get(commandId);

    if (!command) {
      const error = new Error(`Command not found: ${commandId}`);
      this.addToHistory(commandId, { success: false, error });
      return { success: false, error };
    }

    // Check when clause
    if (command.when && !this.evaluateWhenClause(command.when, context)) {
      const error = new Error(`Command ${commandId} not available in current context`);
      this.addToHistory(commandId, { success: false, error });
      return { success: false, error };
    }

    try {
      const result = await command.handler(...args);
      const commandResult = { success: true, result };
      this.addToHistory(commandId, commandResult);
      return commandResult;
    } catch (error) {
      const commandResult = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      this.addToHistory(commandId, commandResult);
      return commandResult;
    }
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeMany(commandIds: string[], context?: CommandContext): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const commandId of commandIds) {
      const result = await this.execute(commandId, context);
      results.push(result);

      // Stop on first failure
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Get execution history
   */
  getHistory(): Array<{ commandId: string; timestamp: Date; result: CommandResult }> {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Add to history with size limit
   */
  private addToHistory(commandId: string, result: CommandResult): void {
    this.executionHistory.push({
      commandId,
      timestamp: new Date(),
      result,
    });

    // Keep only last N items
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  /**
   * Evaluate when clause
   * Simple implementation - can be extended with expression parser
   */
  private evaluateWhenClause(whenClause: string, context?: CommandContext): boolean {
    if (!context) return false;

    // Simple key existence check
    // Example: "activeElement" checks if context.activeElement exists
    // TODO: Implement full expression parser (e.g., "editorHasFocus && !readOnly")
    return whenClause in context && Boolean(context[whenClause]);
  }
}

// Export singleton instance
export const commandExecutor = CommandExecutor.getInstance();
