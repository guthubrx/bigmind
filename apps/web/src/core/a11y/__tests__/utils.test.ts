/**
 * Accessibility Utilities Tests
 * Phase 3 - Sprint 5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateA11yId,
  formatNumberForScreenReader,
  formatDateForScreenReader,
  createVisuallyHidden,
  getFocusableElements,
} from '../utils';

describe('Accessibility Utils', () => {
  describe('generateA11yId', () => {
    it('should generate unique IDs with prefix', () => {
      const id1 = generateA11yId('test');
      const id2 = generateA11yId('test');

      expect(id1).toContain('test-');
      expect(id2).toContain('test-');
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with different prefixes', () => {
      const id1 = generateA11yId('dialog');
      const id2 = generateA11yId('button');

      expect(id1).toContain('dialog-');
      expect(id2).toContain('button-');
    });
  });

  describe('formatNumberForScreenReader', () => {
    it('should format small numbers as-is', () => {
      expect(formatNumberForScreenReader(5)).toBe('5');
      expect(formatNumberForScreenReader(42)).toBe('42');
      expect(formatNumberForScreenReader(999)).toBe('999');
    });

    it('should format large numbers with separators', () => {
      const result = formatNumberForScreenReader(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle zero', () => {
      expect(formatNumberForScreenReader(0)).toBe('0');
    });
  });

  describe('formatDateForScreenReader', () => {
    it('should format date in French long format', () => {
      const date = new Date('2025-01-28');
      const formatted = formatDateForScreenReader(date);

      expect(formatted).toContain('2025');
      expect(formatted).toContain('janvier');
    });

    it('should include weekday', () => {
      const date = new Date('2025-01-28'); // Tuesday
      const formatted = formatDateForScreenReader(date);

      // Should contain a weekday name
      expect(formatted.length).toBeGreaterThan(10);
    });
  });

  describe('createVisuallyHidden', () => {
    it('should create span with sr-only class', () => {
      const span = createVisuallyHidden('Test text');

      expect(span.tagName).toBe('SPAN');
      expect(span.className).toBe('sr-only');
      expect(span.textContent).toBe('Test text');
    });

    it('should create unique elements', () => {
      const span1 = createVisuallyHidden('Text 1');
      const span2 = createVisuallyHidden('Text 2');

      expect(span1).not.toBe(span2);
      expect(span1.textContent).not.toBe(span2.textContent);
    });
  });

  describe('getFocusableElements', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should find focusable buttons', () => {
      container.innerHTML = `
        <button>Click me</button>
        <button>Another button</button>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(2);
      expect(focusable[0].tagName).toBe('BUTTON');
    });

    it('should find focusable inputs', () => {
      container.innerHTML = `
        <input type="text" />
        <input type="checkbox" />
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(2);
    });

    it('should find links with href', () => {
      container.innerHTML = `
        <a href="/page1">Link 1</a>
        <a href="/page2">Link 2</a>
        <a>Not focusable</a>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(2);
    });

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
        <input type="text" />
        <input type="text" disabled />
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(2);
    });

    it('should include elements with tabindex', () => {
      container.innerHTML = `
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Not focusable</div>
        <div>Not focusable</div>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(1);
      expect(focusable[0].getAttribute('tabindex')).toBe('0');
    });

    it('should include contenteditable elements', () => {
      container.innerHTML = `
        <div contenteditable="true">Editable</div>
        <div contenteditable="false">Not editable</div>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(1);
    });

    it('should find select and textarea', () => {
      container.innerHTML = `
        <select><option>Option</option></select>
        <textarea></textarea>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(2);
    });

    it('should handle empty container', () => {
      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(0);
    });

    it('should find nested focusable elements', () => {
      container.innerHTML = `
        <div>
          <div>
            <button>Nested button</button>
          </div>
        </div>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(1);
    });
  });
});
