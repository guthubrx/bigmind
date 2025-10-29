/**
 * Tests for ThemeManager
 * Theme state management and CSS variable generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager } from '../ThemeManager';
import { lightTheme, darkTheme } from '../defaultThemes';

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = ThemeManager.getInstance();
    // Reset to light theme
    manager.setTheme('light');
    localStorage.clear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      const theme = manager.getTheme();

      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('colors');
    });

    it('should return a copy of theme', () => {
      const theme1 = manager.getTheme();
      const theme2 = manager.getTheme();

      expect(theme1).toEqual(theme2);
      expect(theme1).not.toBe(theme2); // Different references
    });
  });

  describe('setTheme', () => {
    it('should set light theme', () => {
      manager.setTheme('light');

      const theme = manager.getTheme();
      expect(theme.id).toBe('light');
      expect(theme.mode).toBe('light');
    });

    it('should set dark theme', () => {
      manager.setTheme('dark');

      const theme = manager.getTheme();
      expect(theme.id).toBe('dark');
      expect(theme.mode).toBe('dark');
    });

    it('should save theme to localStorage', () => {
      manager.setTheme('dark');

      expect(localStorage.getItem('bigmind-theme')).toBe('dark');
    });

    it('should apply CSS variables', () => {
      manager.setTheme('light');

      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-bg')
        .trim();

      expect(bgColor).toBe(lightTheme.colors.bg);
    });

    it('should set data-theme attribute', () => {
      manager.setTheme('dark');

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle unknown theme', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.setTheme('unknown');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown theme: unknown')
      );

      // Should fall back to light theme
      expect(manager.getTheme().id).toBe('light');

      consoleSpy.mockRestore();
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on theme change', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.setTheme('dark');

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ id: 'dark' }));
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.setTheme('dark');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      manager.setTheme('light');
      // Should not be called again
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in listeners', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      manager.subscribe(errorListener);
      manager.subscribe(normalListener);

      manager.setTheme('dark');

      // Both should be called despite error
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getCSSVariable', () => {
    it('should get CSS variable value', () => {
      manager.setTheme('light');

      const value = manager.getCSSVariable('color-bg');
      expect(value).toBe(lightTheme.colors.bg);
    });
  });

  describe('setCSSVariable', () => {
    it('should set CSS variable', () => {
      manager.setCSSVariable('test-var', '#ff0000');

      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--test-var')
        .trim();

      expect(value).toBe('#ff0000');
    });
  });

  describe('CSS variable generation', () => {
    it('should generate color variables', () => {
      manager.setTheme('light');

      const fg = manager.getCSSVariable('color-fg');
      const bg = manager.getCSSVariable('color-bg');
      const accent = manager.getCSSVariable('color-accent');

      expect(fg).toBe(lightTheme.colors.fg);
      expect(bg).toBe(lightTheme.colors.bg);
      expect(accent).toBe(lightTheme.colors.accent);
    });

    it('should generate spacing variables', () => {
      manager.setTheme('light');

      const sm = manager.getCSSVariable('spacing-sm');
      const md = manager.getCSSVariable('spacing-md');
      const lg = manager.getCSSVariable('spacing-lg');

      expect(sm).toBe(lightTheme.spacing.sm);
      expect(md).toBe(lightTheme.spacing.md);
      expect(lg).toBe(lightTheme.spacing.lg);
    });

    it('should convert camelCase to kebab-case', () => {
      manager.setTheme('light');

      const accentHover = manager.getCSSVariable('color-accent-hover');
      expect(accentHover).toBe(lightTheme.colors.accentHover);
    });
  });
});
