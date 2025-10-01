/**
 * FR: Utilitaires pour la manipulation des couleurs
 * EN: Utilities for color manipulation
 */

/**
 * FR: Éclaircir une couleur hex en la mélangeant avec du blanc
 * EN: Lighten a hex color by blending it with white
 * @param hex - Couleur hexadécimale (#RGB ou #RRGGBB)
 * @param ratio - Ratio de mélange (0-1, 0=couleur originale, 1=blanc)
 * @returns Couleur éclaircie en format hexadécimal
 */
export function lightenHexColor(hex: string, ratio: number = 0.6): string {
  try {
    const clean = hex.replace('#', '');
    const isShort = clean.length === 3;
    const r = parseInt(isShort ? clean[0] + clean[0] : clean.substring(0, 2), 16);
    const g = parseInt(isShort ? clean[1] + clean[1] : clean.substring(2, 4), 16);
    const b = parseInt(isShort ? clean[2] + clean[2] : clean.substring(4, 6), 16);
    const lr = Math.round(r + (255 - r) * ratio);
    const lg = Math.round(g + (255 - g) * ratio);
    const lb = Math.round(b + (255 - b) * ratio);
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
  } catch (_e) {
    return hex;
  }
}

/**
 * FR: Calculer la luminosité relative d'une couleur hex selon WCAG
 * EN: Calculate relative luminance of a hex color according to WCAG
 * @param hex - Couleur hexadécimale (#RGB ou #RRGGBB)
 * @returns Luminosité relative (0-1, 0=noir, 1=blanc)
 */
export function getRelativeLuminance(hex: string): number {
  try {
    const clean = hex.replace('#', '');
    const isShort = clean.length === 3;
    const r = parseInt(isShort ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
    const g = parseInt(isShort ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
    const b = parseInt(isShort ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;

    // FR: Formule de luminosité relative selon WCAG
    // EN: Relative luminance formula according to WCAG
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  } catch (_e) {
    return 0.5; // FR: Valeur par défaut si erreur de parsing
  }
}

/**
 * FR: Choisir la couleur de texte optimale (noir ou blanc) selon la luminosité du fond
 * EN: Choose optimal text color (black or white) based on background luminance
 * @param backgroundColor - Couleur de fond hexadécimale
 * @returns '#000000' pour fond clair, '#ffffff' pour fond foncé
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);
  // FR: Seuil de 0.5 : plus clair = texte noir, plus foncé = texte blanc
  // EN: Threshold of 0.5: lighter = black text, darker = white text
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

