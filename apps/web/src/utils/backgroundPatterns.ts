/**
 * FR: Utilitaires pour les motifs de fond de la carte mentale
 * EN: Utilities for mind map background patterns
 */

export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'lines';

export interface BackgroundPatternStyle {
  position?: 'absolute';
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  pointerEvents?: 'none';
  opacity?: number;
  zIndex?: number;
  backgroundImage?: string;
  backgroundSize?: string;
}

/**
 * FR: Générer le style CSS pour un motif de fond
 * EN: Generate CSS style for a background pattern
 * @param pattern - Type de motif
 * @param opacity - Opacité du motif (0-1)
 * @returns Objet de style CSS
 */
export function getBackgroundPatternStyle(
  pattern: BackgroundPattern,
  opacity: number = 0.3
): BackgroundPatternStyle {
  if (!pattern || pattern === 'none') return {};

  const baseStyle: BackgroundPatternStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    opacity,
    zIndex: 0,
  };

  switch (pattern) {
    case 'dots':
      return {
        ...baseStyle,
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'grid':
      return {
        ...baseStyle,
        backgroundImage: `
          linear-gradient(to right, #000 1px, transparent 1px),
          linear-gradient(to bottom, #000 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      };
    case 'lines':
      return {
        ...baseStyle,
        backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    default:
      return {};
  }
}
