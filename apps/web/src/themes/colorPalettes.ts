/**
 * FR: Définitions des palettes de couleurs pour les nœuds et tags
 * EN: Color palette definitions for nodes and tags
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // 10 couleurs
}

/**
 * FR: Palettes de couleurs prédéfinies
 * EN: Predefined color palettes
 */
export const COLOR_PALETTES: Record<string, ColorPalette> = {
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Couleurs vives et énergiques',
    colors: [
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#ef4444', // Red
      '#f59e0b', // Orange
      '#eab308', // Yellow
      '#84cc16', // Lime
      '#10b981', // Green
      '#14b8a6', // Teal
      '#06b6d4', // Cyan
    ],
  },

  pastel: {
    id: 'pastel',
    name: 'Pastel',
    description: 'Couleurs douces et apaisantes',
    colors: [
      '#93c5fd', // Light Blue
      '#c4b5fd', // Light Purple
      '#f9a8d4', // Light Pink
      '#fca5a5', // Light Red
      '#fdba74', // Light Orange
      '#fde047', // Light Yellow
      '#bef264', // Light Lime
      '#86efac', // Light Green
      '#5eead4', // Light Teal
      '#67e8f9', // Light Cyan
    ],
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    description: 'Tons naturels et terreux',
    colors: [
      '#92400e', // Brown
      '#78350f', // Dark Brown
      '#854d0e', // Amber Brown
      '#713f12', // Yellow Brown
      '#365314', // Dark Green
      '#14532d', // Forest Green
      '#064e3b', // Teal Green
      '#134e4a', // Deep Teal
      '#1e3a8a', // Navy Blue
      '#1e40af', // Deep Blue
    ],
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Couleurs électriques et lumineuses',
    colors: [
      '#22d3ee', // Neon Cyan
      '#a78bfa', // Neon Purple
      '#f472b6', // Neon Pink
      '#fb923c', // Neon Orange
      '#facc15', // Neon Yellow
      '#4ade80', // Neon Green
      '#2dd4bf', // Neon Teal
      '#60a5fa', // Neon Blue
      '#c084fc', // Neon Violet
      '#fb7185', // Neon Rose
    ],
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Nuances de bleu et de vert',
    colors: [
      '#0c4a6e', // Deep Blue
      '#075985', // Ocean Blue
      '#0369a1', // Sky Blue
      '#0891b2', // Cyan Blue
      '#0d9488', // Teal
      '#059669', // Sea Green
      '#047857', // Deep Green
      '#065f46', // Forest Green
      '#134e4a', // Dark Teal
      '#164e63', // Dark Cyan
    ],
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Couleurs chaudes du coucher de soleil',
    colors: [
      '#7c2d12', // Dark Red
      '#991b1b', // Red
      '#9a3412', // Orange Red
      '#c2410c', // Orange
      '#d97706', // Amber
      '#ca8a04', // Gold
      '#a16207', // Yellow
      '#854d0e', // Brown
      '#78350f', // Dark Brown
      '#713f12', // Copper
    ],
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Verts de la forêt',
    colors: [
      '#14532d', // Dark Green
      '#166534', // Forest Green
      '#15803d', // Green
      '#16a34a', // Bright Green
      '#22c55e', // Light Green
      '#4ade80', // Lime Green
      '#86efac', // Pale Green
      '#bbf7d0', // Very Light Green
      '#84cc16', // Yellow Green
      '#65a30d', // Olive Green
    ],
  },

  berry: {
    id: 'berry',
    name: 'Berry',
    description: 'Tons de baies et de fruits',
    colors: [
      '#881337', // Deep Pink
      '#9f1239', // Rose
      '#be123c', // Red Rose
      '#db2777', // Pink
      '#ec4899', // Hot Pink
      '#f472b6', // Light Pink
      '#a21caf', // Purple
      '#c026d3', // Magenta
      '#d946ef', // Fuchsia
      '#e879f9', // Light Fuchsia
    ],
  },

  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Nuances de gris',
    colors: [
      '#0f172a', // Very Dark
      '#1e293b', // Dark
      '#334155', // Medium Dark
      '#475569', // Medium
      '#64748b', // Medium Light
      '#94a3b8', // Light Medium
      '#cbd5e1', // Light
      '#e2e8f0', // Very Light
      '#f1f5f9', // Extra Light
      '#f8fafc', // Almost White
    ],
  },

  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Arc-en-ciel complet',
    colors: [
      '#ef4444', // Red
      '#f97316', // Orange
      '#f59e0b', // Amber
      '#eab308', // Yellow
      '#84cc16', // Lime
      '#10b981', // Green
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#ec4899', // Pink
    ],
  },

  autumn: {
    id: 'autumn',
    name: 'Autumn',
    description: 'Couleurs automnales',
    colors: [
      '#7c2d12', // Rust
      '#9a3412', // Burnt Orange
      '#c2410c', // Orange
      '#ea580c', // Bright Orange
      '#dc2626', // Red
      '#b91c1c', // Dark Red
      '#92400e', // Brown
      '#78350f', // Dark Brown
      '#854d0e', // Amber Brown
      '#a16207', // Gold Brown
    ],
  },

  spring: {
    id: 'spring',
    name: 'Spring',
    description: 'Couleurs printanières',
    colors: [
      '#fef3c7', // Pale Yellow
      '#fde68a', // Light Yellow
      '#fcd34d', // Yellow
      '#bbf7d0', // Pale Green
      '#86efac', // Light Green
      '#4ade80', // Green
      '#f9a8d4', // Light Pink
      '#f472b6', // Pink
      '#c4b5fd', // Light Purple
      '#a78bfa', // Purple
    ],
  },
};

/**
 * FR: Obtenir une palette par son ID
 * EN: Get a palette by its ID
 */
export function getPalette(paletteId: string): ColorPalette {
  return COLOR_PALETTES[paletteId] || COLOR_PALETTES.vibrant;
}

/**
 * FR: Obtenir la liste de toutes les palettes
 * EN: Get list of all palettes
 */
export function getAllPalettes(): ColorPalette[] {
  return Object.values(COLOR_PALETTES);
}

/**
 * FR: Obtenir la prochaine couleur disponible dans une palette
 * EN: Get the next available color from a palette
 *
 * @param paletteId - ID de la palette
 * @param usedColors - Couleurs déjà utilisées
 * @returns La couleur la moins utilisée dans la palette
 */
export function getNextColorFromPalette(paletteId: string, usedColors: string[]): string {
  const palette = getPalette(paletteId);

  // Compter l'utilisation de chaque couleur
  const colorUsage = new Map<string, number>();
  palette.colors.forEach(color => colorUsage.set(color, 0));

  usedColors.forEach(color => {
    if (colorUsage.has(color)) {
      colorUsage.set(color, (colorUsage.get(color) || 0) + 1);
    }
  });

  // Trouver la couleur la moins utilisée
  let minUsage = Infinity;
  let selectedColor = palette.colors[0];

  palette.colors.forEach(color => {
    const usage = colorUsage.get(color) || 0;
    if (usage < minUsage) {
      minUsage = usage;
      selectedColor = color;
    }
  });

  return selectedColor;
}
