/**
 * FR: Preset Tailwind CSS pour BigMind - Configuration flat design
 * EN: Tailwind CSS preset for BigMind - Flat design configuration
 */

import type { Config } from 'tailwindcss';
import { colors, spacing, fontSize, fontWeight, borderRadius, boxShadow } from './tokens';

export const bigmindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // FR: Couleurs personnalisées BigMind
        // EN: Custom BigMind colors
        ...colors,
        // FR: Couleurs de fond selon le thème
        // EN: Background colors according to theme
        background: {
          DEFAULT: colors.white,
          secondary: colors.gray[50],
          tertiary: colors.gray[100],
        },
        // FR: Couleurs de texte selon le thème
        // EN: Text colors according to theme
        foreground: {
          DEFAULT: colors.gray[900],
          secondary: colors.gray[600],
          tertiary: colors.gray[500],
          muted: colors.gray[400],
        },
        // FR: Couleurs de bordure
        // EN: Border colors
        border: {
          DEFAULT: colors.gray[200],
          secondary: colors.gray[300],
          focus: colors.accent[500],
        },
        // FR: Couleurs d'état (hover, active, etc.)
        // EN: State colors (hover, active, etc.)
        state: {
          hover: colors.gray[100],
          active: colors.gray[200],
          focus: colors.accent[50],
          disabled: colors.gray[300],
        },
      },
      spacing: {
        ...spacing,
      },
      fontSize: {
        ...fontSize,
      },
      fontWeight: {
        ...fontWeight,
      },
      borderRadius: {
        ...borderRadius,
      },
      boxShadow: {
        ...boxShadow,
      },
      zIndex: {
        hide: '-1',
        auto: 'auto',
        base: '0',
        docked: '10',
        dropdown: '1000',
        sticky: '1100',
        banner: '1200',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        skipLink: '1600',
        toast: '1700',
        tooltip: '1800',
      },
    },
  },
  // FR: Plugins Tailwind personnalisés
  // EN: Custom Tailwind plugins
  plugins: [
    // FR: Plugin pour les utilitaires personnalisés
    // EN: Plugin for custom utilities
    // eslint-disable-next-line func-names
    function customUtilities({ addUtilities }: any) {
      const newUtilities = {
        // FR: Utilitaires pour les nœuds de mind map
        // EN: Utilities for mind map nodes
        '.node-base': {
          '@apply bg-background border border-border rounded-md shadow-sm': {},
        },
        '.node-selected': {
          '@apply border-accent-500 shadow-md': {},
        },
        '.node-hover': {
          '@apply hover:bg-state-hover transition-colors duration-150': {},
        },
        // FR: Utilitaires pour les boutons
        // EN: Utilities for buttons
        '.btn-primary': {
          // eslint-disable-next-line max-len
          '@apply bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 disabled:bg-state-disabled disabled:text-foreground-tertiary':
            {},
        },
        '.btn-secondary': {
          // eslint-disable-next-line max-len
          '@apply bg-background-secondary text-foreground border border-border hover:bg-state-hover active:bg-state-active':
            {},
        },
        // FR: Utilitaires pour le canvas
        // EN: Utilities for canvas
        '.canvas-bg': {
          '@apply bg-background-secondary': {},
        },
        '.canvas-grid': {
          '@apply bg-grid-pattern': {},
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
