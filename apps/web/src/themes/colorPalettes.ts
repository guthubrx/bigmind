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

  flatui: {
    id: 'flatui',
    name: 'Flat UI',
    description: 'Couleurs du design Flat UI',
    colors: [
      '#1abc9c', // Turquoise
      '#2ecc71', // Emerald
      '#3498db', // Peter River
      '#9b59b6', // Amethyst
      '#34495e', // Wet Asphalt
      '#f1c40f', // Sunflower
      '#e67e22', // Carrot
      '#e74c3c', // Alizarin
      '#ecf0f1', // Clouds
      '#95a5a6', // Concrete
    ],
  },

  material: {
    id: 'material',
    name: 'Material',
    description: 'Palette Material Design',
    colors: [
      '#f44336', // Red
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#673ab7', // Deep Purple
      '#3f51b5', // Indigo
      '#2196f3', // Blue
      '#00bcd4', // Cyan
      '#4caf50', // Green
      '#ff9800', // Orange
      '#795548', // Brown
    ],
  },

  nordic: {
    id: 'nordic',
    name: 'Nordic',
    description: 'Tons scandinaves froids et élégants',
    colors: [
      '#2e3440', // Polar Night
      '#3b4252', // Dark Blue
      '#434c5e', // Medium Blue
      '#4c566a', // Light Blue
      '#d8dee9', // Snow Storm Light
      '#e5e9f0', // Snow Storm
      '#eceff4', // Snow Storm Bright
      '#8fbcbb', // Frost Teal
      '#88c0d0', // Frost Blue
      '#5e81ac', // Frost Dark Blue
    ],
  },

  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Palette de tons chauds',
    colors: [
      '#ff6b6b', // Warm Red
      '#ee5a6f', // Rose Red
      '#f06595', // Pink
      '#ff8787', // Coral
      '#ffa94d', // Orange
      '#ffd43b', // Yellow
      '#fab005', // Gold
      '#fd7e14', // Tangerine
      '#ff922b', // Peach
      '#fa5252', // Bright Red
    ],
  },

  cool: {
    id: 'cool',
    name: 'Cool',
    description: 'Palette de tons froids',
    colors: [
      '#339af0', // Sky Blue
      '#4dabf7', // Light Blue
      '#74c0fc', // Pale Blue
      '#22b8cf', // Cyan
      '#15aabf', // Teal
      '#12b886', // Green Teal
      '#20c997', // Mint
      '#51cf66', // Light Green
      '#94d82d', // Lime
      '#a9e34b', // Yellow Green
    ],
  },

  tropical: {
    id: 'tropical',
    name: 'Tropical',
    description: 'Couleurs vives tropicales',
    colors: [
      '#fd79a8', // Hot Pink
      '#fdcb6e', // Golden Yellow
      '#6c5ce7', // Purple
      '#00b894', // Mint Green
      '#00cec9', // Cyan
      '#0984e3', // Blue
      '#a29bfe', // Lavender
      '#fab1a0', // Peach
      '#ff7675', // Coral
      '#ffeaa7', // Pastel Yellow
    ],
  },

  vintage: {
    id: 'vintage',
    name: 'Vintage',
    description: 'Couleurs rétro et vintage',
    colors: [
      '#d4a574', // Tan
      '#c19a6b', // Camel
      '#8b7355', // Mocha
      '#a0826d', // Beaver
      '#b4846c', // Fallow
      '#c9a882', // Burlywood
      '#9c7a66', // Chamoisee
      '#8b6f47', // Drab
      '#704214', // Sepia
      '#8b4513', // Saddle Brown
    ],
  },

  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Couleurs professionnelles pour le business',
    colors: [
      '#1e3a8a', // Navy Blue
      '#1e40af', // Royal Blue
      '#1d4ed8', // Blue
      '#3b82f6', // Bright Blue
      '#0f766e', // Teal
      '#047857', // Green
      '#dc2626', // Red
      '#d97706', // Amber
      '#4b5563', // Gray
      '#1f2937', // Dark Gray
    ],
  },

  candy: {
    id: 'candy',
    name: 'Candy',
    description: 'Couleurs sucrées et acidulées',
    colors: [
      '#fbbf24', // Candy Yellow
      '#fb923c', // Candy Orange
      '#f472b6', // Candy Pink
      '#c084fc', // Candy Purple
      '#a78bfa', // Candy Violet
      '#60a5fa', // Candy Blue
      '#38bdf8', // Candy Sky
      '#2dd4bf', // Candy Teal
      '#34d399', // Candy Green
      '#fde047', // Candy Lemon
    ],
  },

  dracula: {
    id: 'dracula',
    name: 'Dracula',
    description: 'Thème sombre populaire avec accents vifs',
    colors: [
      '#ff5555', // Red
      '#ffb86c', // Orange
      '#f1fa8c', // Yellow
      '#50fa7b', // Green
      '#8be9fd', // Cyan
      '#bd93f9', // Purple
      '#ff79c6', // Pink
      '#6272a4', // Comment
      '#44475a', // Current Line
      '#282a36', // Background
    ],
  },

  nord: {
    id: 'nord',
    name: 'Nord',
    description: 'Palette arctique inspirée du nord',
    colors: [
      '#bf616a', // Aurora Red
      '#d08770', // Aurora Orange
      '#ebcb8b', // Aurora Yellow
      '#a3be8c', // Aurora Green
      '#88c0d0', // Frost Blue
      '#81a1c1', // Frost Light Blue
      '#5e81ac', // Frost Dark Blue
      '#b48ead', // Aurora Purple
      '#8fbcbb', // Frost Teal
      '#4c566a', // Polar Night
    ],
  },

  catppuccin: {
    id: 'catppuccin',
    name: 'Catppuccin',
    description: 'Thème pastel apaisant',
    colors: [
      '#dc8a78', // Rosewater
      '#dd7878', // Flamingo
      '#ea76cb', // Pink
      '#8839ef', // Mauve
      '#d20f39', // Red
      '#e64553', // Maroon
      '#fe640b', // Peach
      '#df8e1d', // Yellow
      '#40a02b', // Green
      '#1e66f5', // Blue
    ],
  },

  solarized: {
    id: 'solarized',
    name: 'Solarized',
    description: 'Palette de précision pour machines et personnes',
    colors: [
      '#dc322f', // Red
      '#cb4b16', // Orange
      '#b58900', // Yellow
      '#859900', // Green
      '#2aa198', // Cyan
      '#268bd2', // Blue
      '#6c71c4', // Violet
      '#d33682', // Magenta
      '#073642', // Base02
      '#002b36', // Base03
    ],
  },

  tokyonight: {
    id: 'tokyonight',
    name: 'Tokyo Night',
    description: 'Lumières du centre-ville de Tokyo la nuit',
    colors: [
      '#f7768e', // Red
      '#ff9e64', // Orange
      '#e0af68', // Yellow
      '#9ece6a', // Green
      '#73daca', // Teal
      '#7aa2f7', // Blue
      '#7dcfff', // Cyan
      '#bb9af7', // Purple
      '#c0caf5', // Foreground
      '#1a1b26', // Background
    ],
  },

  onedark: {
    id: 'onedark',
    name: 'One Dark',
    description: 'Thème sombre iconique d\'Atom',
    colors: [
      '#e06c75', // Red
      '#d19a66', // Orange
      '#e5c07b', // Yellow
      '#98c379', // Green
      '#56b6c2', // Cyan
      '#61afef', // Blue
      '#c678dd', // Purple
      '#be5046', // Dark Red
      '#abb2bf', // Foreground
      '#282c34', // Background
    ],
  },

  synthwave: {
    id: 'synthwave',
    name: 'Synthwave',
    description: 'Néon rétro des années 80',
    colors: [
      '#ff00ff', // Magenta
      '#00ffff', // Cyan
      '#ff2975', // Hot Pink
      '#f222ff', // Fuchsia
      '#8c1eff', // Purple
      '#ff901f', // Orange
      '#ffd319', // Yellow
      '#9400d3', // Dark Violet
      '#ff4500', // Orange Red
      '#ffd700', // Gold
    ],
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futur dystopique néon',
    colors: [
      '#00ff9f', // Neon Green
      '#00b8ff', // Electric Blue
      '#ff00ff', // Magenta
      '#ff5c8a', // Hot Pink
      '#bd00ff', // Purple
      '#d600ff', // Violet
      '#ffd700', // Gold
      '#ff4500', // Orange
      '#00ffff', // Cyan
      '#070f34', // Dark Blue
    ],
  },

  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Esthétique rétro-futuriste',
    colors: [
      '#ff71ce', // Hot Pink
      '#01cdfe', // Cyan
      '#05ffa1', // Mint
      '#b967ff', // Purple
      '#fffb96', // Cream
      '#ff6c11', // Orange
      '#ff10f0', // Magenta
      '#00e0ff', // Sky Blue
      '#ff90e8', // Light Pink
      '#fdff6a', // Yellow
    ],
  },

  retro60s: {
    id: 'retro60s',
    name: 'Retro 60s',
    description: 'Couleurs psychédéliques des années 60',
    colors: [
      '#c681cc', // Lavender
      '#cc6933', // Orange
      '#d3be47', // Yellow
      '#a9d33e', // Lime
      '#508fba', // Blue
      '#e86f68', // Coral
      '#83b799', // Sage
      '#c2b28f', // Tan
      '#fb2e01', // Red
      '#6fcb9f', // Turquoise
    ],
  },

  retro70s: {
    id: 'retro70s',
    name: 'Retro 70s',
    description: 'Tons terreux des années 70',
    colors: [
      '#722880', // Purple
      '#d72d51', // Red
      '#eb5c18', // Orange
      '#f08800', // Amber
      '#deb600', // Gold
      '#a68b5b', // Tan
      '#8b7d6b', // Taupe
      '#7c6a4f', // Brown
      '#c19a6b', // Camel
      '#556b2f', // Olive
    ],
  },

  retro80s: {
    id: 'retro80s',
    name: 'Retro 80s',
    description: 'Néon électrique des années 80',
    colors: [
      '#2cceff', // Cyan
      '#f80cd5', // Magenta
      '#8ce411', // Lime
      '#f7e11c', // Yellow
      '#f52909', // Red
      '#ff6ec7', // Pink
      '#00ffcc', // Teal
      '#ffff00', // Bright Yellow
      '#ff00ff', // Fuchsia
      '#00ff00', // Green
    ],
  },

  outrun: {
    id: 'outrun',
    name: 'Outrun',
    description: 'Coucher de soleil synthwave',
    colors: [
      '#ff0090', // Hot Pink
      '#ff4500', // Orange Red
      '#ff8c00', // Dark Orange
      '#ffd700', // Gold
      '#fc0fc0', // Fuchsia
      '#2de2e6', // Cyan
      '#f000ff', // Magenta
      '#ff6ec7', // Pink
      '#00ffff', // Aqua
      '#ffff00', // Yellow
    ],
  },

  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Rétro groove aux tons chauds',
    colors: [
      '#cc241d', // Red
      '#d79921', // Yellow
      '#98971a', // Green
      '#458588', // Blue
      '#b16286', // Purple
      '#d65d0e', // Orange
      '#689d6a', // Aqua
      '#fe8019', // Bright Orange
      '#fb4934', // Bright Red
      '#fabd2f', // Bright Yellow
    ],
  },

  rose: {
    id: 'rose',
    name: 'Rosé Pine',
    description: 'Tons roses doux et élégants',
    colors: [
      '#eb6f92', // Love (Rose)
      '#f6c177', // Gold
      '#ebbcba', // Rose
      '#31748f', // Pine
      '#9ccfd8', // Foam
      '#c4a7e7', // Iris
      '#e0def4', // Text
      '#6e6a86', // Subtle
      '#908caa', // Muted
      '#191724', // Base
    ],
  },

  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Couleurs officielles de GitHub',
    colors: [
      '#f85149', // Danger
      '#fb8500', // Severe
      '#d29922', // Attention
      '#3fb950', // Success
      '#1f6feb', // Accent
      '#a371f7', // Done
      '#bc4c00', // Sponsors
      '#58a6ff', // Info
      '#8957e5', // Purple
      '#0d1117', // Canvas Default
    ],
  },

  monokai: {
    id: 'monokai',
    name: 'Monokai',
    description: 'Palette Monokai classique',
    colors: [
      '#f92672', // Pink
      '#fd971f', // Orange
      '#e6db74', // Yellow
      '#a6e22e', // Green
      '#66d9ef', // Cyan
      '#ae81ff', // Purple
      '#f8f8f2', // Foreground
      '#75715e', // Comment
      '#49483e', // Selection
      '#272822', // Background
    ],
  },

  horizon: {
    id: 'horizon',
    name: 'Horizon',
    description: 'Thème chaud et vibrant',
    colors: [
      '#e95678', // Red
      '#fab795', // Peach
      '#fac29a', // Orange
      '#09f7a0', // Green
      '#25b0bc', // Turquoise
      '#59e3e3', // Cyan
      '#6c6f93', // Purple Blue
      '#b877db', // Purple
      '#f09483', // Coral
      '#21bfc2', // Aqua
    ],
  },

  ayu: {
    id: 'ayu',
    name: 'Ayu',
    description: 'Palette moderne et claire',
    colors: [
      '#f07178', // Red
      '#ffaa33', // Orange
      '#ffee99', // Yellow
      '#b8cc52', // Green
      '#95e6cb', // Cyan
      '#59c2ff', // Blue
      '#d4bfff', // Purple
      '#f29e74', // Coral
      '#39bae6', // Sky
      '#0a0e14', // Background
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
