/**
 * FR: Définitions des palettes de couleurs pour les nœuds et tags (CORE - minimal)
 * EN: Color palette definitions for nodes and tags (CORE - minimal)
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // 10 couleurs
}

/**
 * FR: Palette de fallback si aucune palette n'est chargée
 * EN: Fallback palette if no palette is loaded
 */
const FALLBACK_PALETTE: ColorPalette = {
  id: '__fallback__',
  name: 'Fallback',
  description: 'Default gray palette when no plugins are loaded',
  colors: [
    '#9ca3af', // Gray-400
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
    '#9ca3af',
  ],
};

/**
 * FR: Registre global des palettes (alimenté par les plugins)
 * EN: Global palette registry (populated by plugins)
 */
const paletteRegistry: Map<string, ColorPalette> = new Map();

/**
 * FR: Rétrocompatibilité - exporter toutes les palettes comme avant
 * EN: Backward compatibility - export all palettes as before
 */
export const COLOR_PALETTES: Record<string, ColorPalette> = {};

/**
 * FR: Mettre à jour COLOR_PALETTES depuis le registre
 * EN: Update COLOR_PALETTES from registry
 */
function updateColorPalettes() {
  Object.keys(COLOR_PALETTES).forEach(key => delete COLOR_PALETTES[key]);
  paletteRegistry.forEach((palette, id) => {
    COLOR_PALETTES[id] = palette;
  });
}

/**
 * FR: Enregistrer une palette (utilisé par les plugins)
 * EN: Register a palette (used by plugins)
 */
export function registerPalette(palette: ColorPalette): void {
  paletteRegistry.set(palette.id, palette);
  updateColorPalettes();
}

/**
 * FR: Désenregistrer une palette (utilisé par les plugins)
 * EN: Unregister a palette (used by plugins)
 */
export function unregisterPalette(paletteId: string): void {
  paletteRegistry.delete(paletteId);
  updateColorPalettes();
}

/**
 * FR: Enregistrer plusieurs palettes à la fois
 * EN: Register multiple palettes at once
 */
export function registerPalettes(palettes: ColorPalette[]): void {
  palettes.forEach(palette => paletteRegistry.set(palette.id, palette));
  updateColorPalettes();
}

/**
 * FR: Obtenir une palette par son ID
 * EN: Get a palette by its ID
 */
export function getPalette(paletteId: string): ColorPalette {
  const palette = paletteRegistry.get(paletteId);
  if (palette) return palette;

  // Si la palette demandée n'existe pas, retourner la première palette disponible
  const firstPalette = paletteRegistry.values().next().value;
  return firstPalette || FALLBACK_PALETTE;
}

/**
 * FR: Obtenir la liste de toutes les palettes
 * EN: Get list of all palettes
 */
export function getAllPalettes(): ColorPalette[] {
  return Array.from(paletteRegistry.values());
}

/**
 * FR: Vérifier si une palette existe
 * EN: Check if a palette exists
 */
export function hasPalette(paletteId: string): boolean {
  return paletteRegistry.has(paletteId);
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
