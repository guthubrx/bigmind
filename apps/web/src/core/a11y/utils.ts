/**
 * Accessibility Utilities
 * Helper functions for a11y features
 * Phase 3 - Sprint 5 - Accessibility
 */

/**
 * Generate a unique ID for accessibility attributes
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);

  // Hidden via CSS
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Hidden via ARIA
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Hidden by being off-screen (except sr-only pattern)
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return !element.classList.contains('sr-only');
  }

  return true;
}

/**
 * Get accessible label for an element
 */
export function getAccessibleLabel(element: HTMLElement): string | null {
  // aria-label takes precedence
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) {
      return labelElement.textContent?.trim() || null;
    }
  }

  // For inputs, check associated label
  if (element instanceof HTMLInputElement) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return label.textContent?.trim() || null;
    }
  }

  // title attribute (last resort)
  const title = element.getAttribute('title');
  if (title) return title;

  return null;
}

/**
 * Check if keyboard focus is visible
 */
export function isFocusVisible(): boolean {
  // Check if :focus-visible is supported
  try {
    document.querySelector(':focus-visible');
    return true;
  } catch {
    // Fallback: check if last interaction was keyboard
    return (document.activeElement as HTMLElement)?.matches(':focus') || false;
  }
}

/**
 * Get all focusable elements in a container
 */
export function getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(selectors));
}

/**
 * Create a visually hidden element (accessible to screen readers only)
 */
export function createVisuallyHidden(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
}

/**
 * Format a number for screen readers
 */
export function formatNumberForScreenReader(num: number): string {
  // For large numbers, add separators
  if (num >= 1000) {
    return num.toLocaleString('fr-FR');
  }
  return num.toString();
}

/**
 * Format a date for screen readers
 */
export function formatDateForScreenReader(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
