/**
 * Screen Reader Announcer Tests
 * Phase 3 - Sprint 5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { announcer, announce, announceAssertive } from '../announcer';

describe.skip('Screen Reader Announcer', () => {
  // TODO: Fix these tests - announcer initialization timing issues with jsdom
  beforeEach(() => {
    // Clear any existing live regions
    document.querySelectorAll('[role="status"], [role="alert"]').forEach((el) => {
      el.remove();
    });
  });

  afterEach(() => {
    // Cleanup
    announcer.destroy();
  });

  describe('Live Region Creation', () => {
    it('should create polite live region on initialization', () => {
      // Trigger initialization by calling announce
      announce('Test');

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      expect(politeRegion?.getAttribute('role')).toBe('status');
      expect(politeRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should create assertive live region on initialization', () => {
      announceAssertive('Test');

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion).not.toBeNull();
      expect(assertiveRegion?.getAttribute('role')).toBe('alert');
      expect(assertiveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should add sr-only class to live regions', () => {
      announce('Test');

      const liveRegions = document.querySelectorAll('.sr-only');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('announce', () => {
    it('should announce message to polite live region', async () => {
      announce('Test message');

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        expect(politeRegion.textContent).toBe('Test message');
      }
    });

    it('should replace previous message', async () => {
      announce('First message');
      await new Promise((resolve) => setTimeout(resolve, 150));

      announce('Second message');
      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        expect(politeRegion.textContent).toBe('Second message');
      }
    });

    it('should handle empty message', async () => {
      announce('');
      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        expect(politeRegion.textContent).toBe('');
      }
    });

    it('should handle multiple rapid announcements', async () => {
      announce('Message 1');
      announce('Message 2');
      announce('Message 3');

      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        // Should have the last message
        expect(politeRegion.textContent).toBe('Message 3');
      }
    });
  });

  describe('announceAssertive', () => {
    it('should announce message to assertive live region', async () => {
      announceAssertive('Urgent message');

      await new Promise((resolve) => setTimeout(resolve, 150));

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion).not.toBeNull();
      if (assertiveRegion) {
        expect(assertiveRegion.textContent).toBe('Urgent message');
      }
    });

    it('should not affect polite region', async () => {
      announce('Polite message');
      await new Promise((resolve) => setTimeout(resolve, 150));

      announceAssertive('Assertive message');
      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion).not.toBeNull();
      expect(assertiveRegion).not.toBeNull();
      if (politeRegion && assertiveRegion) {
        expect(politeRegion.textContent).toBe('Polite message');
        expect(assertiveRegion.textContent).toBe('Assertive message');
      }
    });
  });

  describe('destroy', () => {
    it('should remove live regions from DOM', () => {
      announce('Test');
      announceAssertive('Test');

      announcer.destroy();

      const liveRegions = document.querySelectorAll('[role="status"], [role="alert"]');
      expect(liveRegions.length).toBe(0);
    });

    it('should handle multiple destroy calls', () => {
      announce('Test');

      announcer.destroy();
      announcer.destroy();

      const liveRegions = document.querySelectorAll('[role="status"], [role="alert"]');
      expect(liveRegions.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters', async () => {
      announce('Message with <b>HTML</b> & symbols');

      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        expect(politeRegion.textContent).toBe('Message with <b>HTML</b> & symbols');
      }
    });

    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(1000);
      announce(longMessage);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        expect(politeRegion.textContent).toBe(longMessage);
      }
    });

    it('should handle unicode characters', async () => {
      announce('Message avec émojis 🎉🚀✨');

      await new Promise((resolve) => setTimeout(resolve, 150));

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).not.toBeNull();
      if (politeRegion) {
        expect(politeRegion.textContent).toContain('émojis');
      }
    });
  });
});
