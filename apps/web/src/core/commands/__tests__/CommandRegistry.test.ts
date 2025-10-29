/**
 * Tests for CommandRegistry
 * Central registry for commands
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandRegistry } from '../CommandRegistry';
import type { Command } from '../types';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = CommandRegistry.getInstance();
    registry.clear();
  });

  describe('register', () => {
    it('should register a command', () => {
      const command: Command = {
        id: 'test.command',
        title: 'Test Command',
        handler: () => {},
      };

      registry.register(command);

      expect(registry.has('test.command')).toBe(true);
      expect(registry.get('test.command')).toEqual(command);
    });

    it('should return unregister function', () => {
      const command: Command = {
        id: 'test.command',
        title: 'Test Command',
        handler: () => {},
      };

      const unregister = registry.register(command);
      expect(registry.has('test.command')).toBe(true);

      unregister();
      expect(registry.has('test.command')).toBe(false);
    });

    it('should warn on duplicate registration', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const command: Command = {
        id: 'test.command',
        title: 'Test Command',
        handler: () => {},
      };

      registry.register(command);
      registry.register({ ...command, title: 'New Title' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('test.command already registered')
      );

      consoleSpy.mockRestore();
    });

    it('should overwrite existing command', () => {
      const command1: Command = {
        id: 'test.command',
        title: 'Old Title',
        handler: () => {},
      };

      const command2: Command = {
        id: 'test.command',
        title: 'New Title',
        handler: () => {},
      };

      registry.register(command1);
      registry.register(command2);

      expect(registry.get('test.command')?.title).toBe('New Title');
    });
  });

  describe('unregister', () => {
    it('should unregister a command', () => {
      const command: Command = {
        id: 'test.command',
        title: 'Test Command',
        handler: () => {},
      };

      registry.register(command);
      registry.unregister('test.command');

      expect(registry.has('test.command')).toBe(false);
    });

    it('should not throw on unregistering non-existent command', () => {
      expect(() => registry.unregister('non.existent')).not.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return all registered commands', () => {
      const command1: Command = {
        id: 'test.command1',
        title: 'Command 1',
        handler: () => {},
      };

      const command2: Command = {
        id: 'test.command2',
        title: 'Command 2',
        handler: () => {},
      };

      registry.register(command1);
      registry.register(command2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(command1);
      expect(all).toContainEqual(command2);
    });

    it('should return empty array when no commands', () => {
      expect(registry.getAll()).toEqual([]);
    });
  });

  describe('getByCategory', () => {
    it('should return commands by category', () => {
      registry.register({
        id: 'file.save',
        title: 'Save',
        category: 'File',
        handler: () => {},
      });

      registry.register({
        id: 'file.open',
        title: 'Open',
        category: 'File',
        handler: () => {},
      });

      registry.register({
        id: 'edit.copy',
        title: 'Copy',
        category: 'Edit',
        handler: () => {},
      });

      const fileCommands = registry.getByCategory('File');
      expect(fileCommands).toHaveLength(2);
      expect(fileCommands.every((c) => c.category === 'File')).toBe(true);
    });
  });

  describe('getByPlugin', () => {
    it('should return commands by plugin', () => {
      registry.register({
        id: 'plugin1.cmd1',
        title: 'Command 1',
        pluginId: 'plugin1',
        handler: () => {},
      });

      registry.register({
        id: 'plugin1.cmd2',
        title: 'Command 2',
        pluginId: 'plugin1',
        handler: () => {},
      });

      registry.register({
        id: 'plugin2.cmd1',
        title: 'Command 3',
        pluginId: 'plugin2',
        handler: () => {},
      });

      const plugin1Commands = registry.getByPlugin('plugin1');
      expect(plugin1Commands).toHaveLength(2);
      expect(plugin1Commands.every((c) => c.pluginId === 'plugin1')).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on register', () => {
      const listener = vi.fn();
      registry.subscribe(listener);

      registry.register({
        id: 'test.command',
        title: 'Test',
        handler: () => {},
      });

      expect(listener).toHaveBeenCalled();
    });

    it('should notify listeners on unregister', () => {
      const listener = vi.fn();

      registry.register({
        id: 'test.command',
        title: 'Test',
        handler: () => {},
      });

      registry.subscribe(listener);
      registry.unregister('test.command');

      expect(listener).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = registry.subscribe(listener);

      registry.register({
        id: 'test.command',
        title: 'Test',
        handler: () => {},
      });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      registry.register({
        id: 'test.command2',
        title: 'Test 2',
        handler: () => {},
      });

      // Should not be called again
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      registry.register({
        id: 'file.save',
        title: 'Save',
        category: 'File',
        pluginId: 'core',
        handler: () => {},
      });

      registry.register({
        id: 'file.open',
        title: 'Open',
        category: 'File',
        pluginId: 'core',
        handler: () => {},
      });

      registry.register({
        id: 'edit.copy',
        title: 'Copy',
        category: 'Edit',
        pluginId: 'plugin1',
        handler: () => {},
      });

      const stats = registry.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byCategory['File']).toBe(2);
      expect(stats.byCategory['Edit']).toBe(1);
      expect(stats.byPlugin['core']).toBe(2);
      expect(stats.byPlugin['plugin1']).toBe(1);
    });
  });
});
