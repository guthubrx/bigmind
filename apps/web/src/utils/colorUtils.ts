/**
 * Utilitaires pour la gestion des couleurs
 */

/**
 * Génère une couleur pastel basée sur une couleur d'accent
 * @param accentColor - Couleur d'accent (format hex)
 * @param alpha - Transparence (0-1)
 * @returns Couleur RGBA
 */
export function getPastelBackground(accentColor: string, alpha: number = 0.06): string {
  const hex = (accentColor || '#3b82f6').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 59;
  const g = parseInt(hex.substring(2, 4), 16) || 130;
  const b = parseInt(hex.substring(4, 6), 16) || 246;
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Convertit une couleur hex en RGB
 * @param hex - Couleur hex (avec ou sans #)
 * @returns Objet avec r, g, b
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

/**
 * Génère une couleur contrastée (blanc ou noir) pour un fond donné
 * @param backgroundColor - Couleur de fond
 * @returns Couleur de texte contrastée
 */
export function getContrastColor(backgroundColor: string): string {
  const { r, g, b } = hexToRgb(backgroundColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * Alias pour getContrastColor (compatibilité)
 * @param backgroundColor - Couleur de fond
 * @returns Couleur de texte optimale
 */
export function getOptimalTextColor(backgroundColor: string): string {
  return getContrastColor(backgroundColor);
}

/**
 * Éclaircit une couleur hexadécimale
 * @param hex - Couleur hex (avec ou sans #)
 * @param factor - Facteur d'éclaircissement (0-1, où 1 = blanc pur)
 * @returns Couleur éclaircie en hex
 */
export function lightenHexColor(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);

  // Éclaircir en mélangeant avec du blanc
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);

  // Convertir en hex
  const toHex = (n: number) => {
    const hex = Math.min(255, Math.max(0, n)).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
