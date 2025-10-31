/**
 * Screen Reader Announcer
 * Announces messages to screen readers using ARIA live regions
 * Phase 3 - Sprint 5 - Accessibility
 */

type PolitenessLevel = 'polite' | 'assertive';

class ScreenReaderAnnouncer {
  private liveRegionPolite: HTMLElement | null = null;

  private liveRegionAssertive: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize ARIA live regions
   */
  private initialize() {
    // Create polite live region
    this.liveRegionPolite = document.createElement('div');
    this.liveRegionPolite.setAttribute('role', 'status');
    this.liveRegionPolite.setAttribute('aria-live', 'polite');
    this.liveRegionPolite.setAttribute('aria-atomic', 'true');
    this.liveRegionPolite.className = 'sr-only';
    document.body.appendChild(this.liveRegionPolite);

    // Create assertive live region
    this.liveRegionAssertive = document.createElement('div');
    this.liveRegionAssertive.setAttribute('role', 'alert');
    this.liveRegionAssertive.setAttribute('aria-live', 'assertive');
    this.liveRegionAssertive.setAttribute('aria-atomic', 'true');
    this.liveRegionAssertive.className = 'sr-only';
    document.body.appendChild(this.liveRegionAssertive);
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, politeness: PolitenessLevel = 'polite') {
    const region = politeness === 'assertive' ? this.liveRegionAssertive : this.liveRegionPolite;

    if (!region) {
      console.warn('[Announcer] Live region not initialized');
      return;
    }

    // Clear previous message
    region.textContent = '';

    // Announce new message after a brief delay
    // This ensures screen readers detect the change
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  }

  /**
   * Cleanup live regions
   */
  destroy() {
    if (this.liveRegionPolite?.parentNode) {
      this.liveRegionPolite.parentNode.removeChild(this.liveRegionPolite);
    }
    if (this.liveRegionAssertive?.parentNode) {
      this.liveRegionAssertive.parentNode.removeChild(this.liveRegionAssertive);
    }
    this.liveRegionPolite = null;
    this.liveRegionAssertive = null;
  }
}

// Singleton instance
export const announcer = new ScreenReaderAnnouncer();

/**
 * Announce a message to screen readers (polite)
 */
export function announce(message: string) {
  announcer.announce(message, 'polite');
}

/**
 * Announce a message to screen readers (assertive/urgent)
 */
export function announceAssertive(message: string) {
  announcer.announce(message, 'assertive');
}
