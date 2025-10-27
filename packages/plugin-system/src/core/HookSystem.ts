/**
 * Hook System
 * Inspired by WordPress hooks and VS Code's event system
 */

/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

import { EventEmitter } from 'eventemitter3';

/**
 * Hook types
 */
export enum HookType {
  ACTION = 'action', // Observers notified when action occurs
  FILTER = 'filter', // Transform/modify data
  VALIDATION = 'validation', // Validate data
}

/**
 * Hook callback with metadata
 */
interface HookCallback {
  pluginId: string;
  callback: (...args: any[]) => any;
  priority: number;
}

/**
 * Hook System
 */
export class HookSystem extends EventEmitter {
  private hooks = new Map<string, HookCallback[]>();

  /**
   * Register an action hook
   * Actions are observers that are notified when something happens
   */
  registerAction(
    hookName: string,
    pluginId: string,
    callback: (...args: any[]) => void | Promise<void>,
    priority: number = 10
  ): () => void {
    return this.registerHook(HookType.ACTION, hookName, pluginId, callback, priority);
  }

  /**
   * Register a filter hook
   * Filters transform/modify data
   */
  registerFilter<T>(
    hookName: string,
    pluginId: string,
    callback: (value: T, ...args: any[]) => T | Promise<T>,
    priority: number = 10
  ): () => void {
    return this.registerHook(HookType.FILTER, hookName, pluginId, callback, priority);
  }

  /**
   * Register a validation hook
   * Validations check if data is valid
   */
  registerValidation(
    hookName: string,
    pluginId: string,
    callback: (...args: any[]) => boolean | string | Promise<boolean | string>,
    priority: number = 10
  ): () => void {
    return this.registerHook(HookType.VALIDATION, hookName, pluginId, callback, priority);
  }

  /**
   * Execute action hooks
   */
  async doAction(hookName: string, ...args: any[]): Promise<void> {
    const callbacks = this.getCallbacks(hookName);

    await Promise.all(
      callbacks.map(async ({ pluginId, callback }) => {
        try {
          await callback(...args);
        } catch (error) {
          console.error(
            `[HookSystem] Error in action hook ${hookName} (plugin: ${pluginId}):`,
            error
          );
          this.emit('hook:error', hookName, pluginId, error);
        }
      })
    );
  }

  /**
   * Apply filter hooks
   */
  async applyFilters<T>(hookName: string, value: T, ...args: any[]): Promise<T> {
    const callbacks = this.getCallbacks(hookName);
    let result = value;

    // Use reduce to apply filters sequentially
    await callbacks.reduce(async (previousPromise, { pluginId, callback }) => {
      await previousPromise;
      try {
        result = await callback(result, ...args);
      } catch (error) {
        console.error(
          `[HookSystem] Error in filter hook ${hookName} (plugin: ${pluginId}):`,
          error
        );
        this.emit('hook:error', hookName, pluginId, error);
      }
    }, Promise.resolve());

    return result;
  }

  /**
   * Run validation hooks
   */
  async validate(hookName: string, ...args: any[]): Promise<{ valid: boolean; errors: string[] }> {
    const callbacks = this.getCallbacks(hookName);
    const errors: string[] = [];

    // Use Promise.all to run validations in parallel
    await Promise.all(
      callbacks.map(async ({ pluginId, callback }) => {
        try {
          const result = await callback(...args);

          if (result === false) {
            errors.push(`Validation failed (plugin: ${pluginId})`);
          } else if (typeof result === 'string') {
            errors.push(result);
          }
        } catch (error) {
          console.error(
            `[HookSystem] Error in validation hook ${hookName} (plugin: ${pluginId}):`,
            error
          );
          errors.push(`Validation error (plugin: ${pluginId}): ${error}`);
          this.emit('hook:error', hookName, pluginId, error);
        }
      })
    );

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Remove all hooks for a plugin
   */
  removePluginHooks(pluginId: string): void {
    Array.from(this.hooks.entries()).forEach(([hookName, callbacks]) => {
      const filtered = callbacks.filter(cb => cb.pluginId !== pluginId);

      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    });

    console.log(`[HookSystem] Removed all hooks for plugin: ${pluginId}`);
  }

  /**
   * Get all hooks
   */
  getAllHooks(): Map<string, HookCallback[]> {
    return new Map(this.hooks);
  }

  /**
   * Check if hook exists
   */
  hasHook(hookName: string): boolean {
    return this.hooks.has(hookName);
  }

  // ===== Private Methods =====

  /**
   * Register a hook (generic)
   */
  private registerHook(
    type: HookType,
    hookName: string,
    pluginId: string,
    callback: (...args: any[]) => any,
    priority: number
  ): () => void {
    const fullHookName = `${type}:${hookName}`;

    if (!this.hooks.has(fullHookName)) {
      this.hooks.set(fullHookName, []);
    }

    const callbacks = this.hooks.get(fullHookName)!;
    const hookCallback: HookCallback = { pluginId, callback, priority };

    // Insert in order of priority (lower = higher priority)
    const index = callbacks.findIndex(cb => cb.priority > priority);
    if (index === -1) {
      callbacks.push(hookCallback);
    } else {
      callbacks.splice(index, 0, hookCallback);
    }

    const logMsg = `[HookSystem] Registered ${type} hook: ${hookName}`;
    console.log(`${logMsg} (plugin: ${pluginId}, priority: ${priority})`);

    // Return unregister function
    return () => {
      const idx = callbacks.indexOf(hookCallback);
      if (idx !== -1) {
        callbacks.splice(idx, 1);
        console.log(`[HookSystem] Unregistered ${type} hook: ${hookName} (plugin: ${pluginId})`);
      }
    };
  }

  /**
   * Get callbacks for a hook, sorted by priority
   */
  private getCallbacks(hookName: string): HookCallback[] {
    // Try all hook types (action, filter, validation)
    const typeValues = Object.values(HookType);
    const foundCallbacks = typeValues
      .map(type => {
        const fullHookName = `${type}:${hookName}`;
        return this.hooks.get(fullHookName);
      })
      .find(callbacks => callbacks !== undefined);

    return foundCallbacks || [];
  }
}
