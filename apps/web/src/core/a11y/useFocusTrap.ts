/**
 * useFocusTrap Hook
 * Traps focus within a container (for modals, dialogs)
 * Phase 3 - Sprint 5 - Accessibility
 */

import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  /** Whether the trap is active */
  enabled?: boolean;
  /** Element to focus when trap activates */
  initialFocus?: HTMLElement | null;
  /** Element to return focus to when trap deactivates */
  returnFocus?: HTMLElement | null;
  /** Allow Escape key to disable trap */
  escapeDeactivates?: boolean;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
}

/**
 * Hook to trap focus within a container
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, initialFocus, returnFocus, escapeDeactivates = true, onEscape } = options;

  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable
    if (initialFocus) {
      initialFocus.focus();
    } else {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escapeDeactivates) {
        e.preventDefault();
        if (onEscape) {
          onEscape();
        }
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab on first element -> go to last
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element -> go to first
      if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Handle focus leaving the container
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      // If focus moves outside container, bring it back
      if (!container.contains(target)) {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      // Return focus to previous element
      const elementToFocus = returnFocus || previousFocusRef.current;
      if (elementToFocus && document.body.contains(elementToFocus)) {
        elementToFocus.focus();
      }
    };
  }, [enabled, initialFocus, returnFocus, escapeDeactivates, onEscape]);

  return containerRef;
}
