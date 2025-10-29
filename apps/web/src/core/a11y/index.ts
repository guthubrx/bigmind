/**
 * Accessibility (a11y) Module
 * Phase 3 - Sprint 5
 *
 * Provides hooks, components, and utilities for WCAG 2.1 compliance
 */

// Hooks
export { useFocusTrap } from './useFocusTrap';

// Components
export { SkipLinks } from './SkipLinks';
export type { SkipLinksProps, SkipLink } from './SkipLinks';

// Announcer
export { announcer, announce, announceAssertive } from './announcer';

// Utilities
export {
  generateA11yId,
  isVisibleToScreenReader,
  getAccessibleLabel,
  isFocusVisible,
  getFocusableElements,
  createVisuallyHidden,
  formatNumberForScreenReader,
  formatDateForScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
} from './utils';
