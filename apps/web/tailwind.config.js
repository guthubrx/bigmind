/**
 * FR: Configuration Tailwind CSS pour BigMind
 * EN: Tailwind CSS configuration for BigMind
 */

import { bigmindPreset } from '@bigmind/design';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [bigmindPreset],
  theme: {
    extend: {
      // FR: Configuration personnalisée pour le canvas
      // EN: Custom configuration for canvas
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
};
