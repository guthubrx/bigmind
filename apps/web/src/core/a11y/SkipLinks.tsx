/**
 * SkipLinks Component
 * Provides keyboard navigation shortcuts to skip to main content
 * Phase 3 - Sprint 5 - Accessibility
 */

import React from 'react';
import './SkipLinks.css';

export interface SkipLink {
  /** ID of the target element */
  targetId: string;
  /** Label for the skip link */
  label: string;
}

export interface SkipLinksProps {
  /** Array of skip links to render */
  links?: SkipLink[];
}

const DEFAULT_LINKS: SkipLink[] = [
  { targetId: 'main-content', label: 'Passer au contenu principal' },
  { targetId: 'main-navigation', label: 'Passer à la navigation' },
];

/**
 * SkipLinks - Accessibility navigation shortcuts
 *
 * Usage:
 * ```tsx
 * <SkipLinks />
 * <nav id="main-navigation">...</nav>
 * <main id="main-content">...</main>
 * ```
 */
export function SkipLinks({ links = DEFAULT_LINKS }: SkipLinksProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    const target = document.getElementById(targetId);
    if (!target) {
      console.warn(`[SkipLinks] Target element #${targetId} not found`);
      return;
    }

    // Focus the target element
    target.focus();

    // If target is not naturally focusable, make it focusable temporarily
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener(
        'blur',
        () => {
          target.removeAttribute('tabindex');
        },
        { once: true }
      );
    }

    // Scroll to target
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="skip-links" aria-label="Liens de navigation rapide">
      {links.map(link => (
        <a
          key={link.targetId}
          href={`#${link.targetId}`}
          className="skip-link"
          onClick={e => handleClick(e, link.targetId)}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
