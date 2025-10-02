import { create } from 'zustand';

// FR: Définition des palettes de couleurs disponibles
// EN: Available color palettes definition
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

// FR: Palettes de couleurs prédéfinies
// EN: Predefined color palettes
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'vibrant',
    name: 'Vibrant',
    colors: [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ],
    description: 'Couleurs vives et énergiques pour stimuler la créativité',
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: [
      '#FFB3BA',
      '#FFDFBA',
      '#FFFFBA',
      '#BAFFC9',
      '#BAE1FF',
      '#E6B3FF',
      '#FFB3E6',
      '#B3FFE6',
      '#FFE6B3',
      '#E6FFB3',
    ],
    description: 'Teintes douces et apaisantes pour un environnement calme',
  },
  {
    id: 'ocean',
    name: 'Océan',
    colors: [
      '#006994',
      '#0088A3',
      '#00A8CC',
      '#4ECDC4',
      '#96CEB4',
      '#45B7D1',
      '#74B9FF',
      '#0984E3',
      '#6C5CE7',
      '#A29BFE',
    ],
    description: 'Nuances bleues et vertes inspirées de la mer',
  },
  {
    id: 'sunset',
    name: 'Coucher de soleil',
    colors: [
      '#FF7675',
      '#FD79A8',
      '#FDCB6E',
      '#E17055',
      '#D63031',
      '#E84393',
      '#FDCB6E',
      '#E17055',
      '#D63031',
      '#E84393',
    ],
    description: 'Chaudes teintes orange et rose du crépuscule',
  },
  {
    id: 'forest',
    name: 'Forêt',
    colors: [
      '#2D5016',
      '#4A7C59',
      '#6B8E23',
      '#8FBC8F',
      '#98FB98',
      '#90EE90',
      '#7CFC00',
      '#32CD32',
      '#228B22',
      '#006400',
    ],
    description: 'Vertes naturelles évoquant la végétation',
  },
  {
    id: 'royal',
    name: 'Royal',
    colors: [
      '#6C5CE7',
      '#A29BFE',
      '#74B9FF',
      '#0984E3',
      '#00B894',
      '#00CEC9',
      '#FDCB6E',
      '#E17055',
      '#D63031',
      '#E84393',
    ],
    description: 'Couleurs riches et élégantes pour un look sophistiqué',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: [
      '#2C3E50',
      '#34495E',
      '#7F8C8D',
      '#95A5A6',
      '#BDC3C7',
      '#D5DBDB',
      '#E8F4F8',
      '#F8F9FA',
      '#ECF0F1',
      '#D6DBDF',
    ],
    description: 'Nuances de gris pour un style minimaliste',
  },
  {
    id: 'rainbow',
    name: 'Arc-en-ciel',
    colors: [
      '#FF0000',
      '#FF8000',
      '#FFFF00',
      '#80FF00',
      '#00FF00',
      '#00FF80',
      '#00FFFF',
      '#0080FF',
      '#0000FF',
      '#8000FF',
    ],
    description: 'Spectre complet des couleurs pour maximum de contraste',
  },
  // --- Pastel additions ---
  {
    id: 'pastel2',
    name: 'Pastel doux',
    colors: [
      '#F8C8DC',
      '#FCE4CF',
      '#FFF4C2',
      '#D7F9D7',
      '#D6EEFF',
      '#E7D9FF',
      '#FCD7E1',
      '#DFF3F3',
      '#F6E6C9',
      '#EAF7D5',
    ],
    description: 'Pastels très légers et aérés',
  },
  {
    id: 'candy',
    name: 'Candy Pastel',
    colors: [
      '#FFC1CC',
      '#FFD6A5',
      '#FDFFB6',
      '#CAFFBF',
      '#BDE0FE',
      '#A0C4FF',
      '#BDB2FF',
      '#FFC6FF',
      '#FFDFD3',
      '#E2F0CB',
    ],
    description: 'Palette sucrée type bonbons, douce et joyeuse',
  },
  {
    id: 'mutedPastel',
    name: 'Pastel feutré',
    colors: [
      '#E8C9C1',
      '#E9D9C7',
      '#EDE6C8',
      '#D9E5CF',
      '#D6E3EC',
      '#DCD6EA',
      '#E9CFDA',
      '#D4EDEA',
      '#EFE2D0',
      '#E6F0D9',
    ],
    description: 'Tons pastels désaturés, élégants et calmes',
  },
  {
    id: 'gelato',
    name: 'Gelato',
    colors: [
      '#F7C8C2',
      '#F9D8B7',
      '#FAE9B0',
      '#D7F0C2',
      '#CFE8F8',
      '#D7D0FA',
      '#F8CBDC',
      '#D5F5F3',
      '#F2E1C6',
      '#E9F6D8',
    ],
    description: 'Inspiration glaces italiennes, tendre et estivale',
  },
  {
    id: 'blossom',
    name: 'Blossom',
    colors: [
      '#FAD0D7',
      '#FFD9C2',
      '#FFF0B3',
      '#D9F2C7',
      '#CCE8F6',
      '#E5D9FF',
      '#F9D6E5',
      '#D9F4EF',
      '#F7E6CC',
      '#EAF7E2',
    ],
    description: 'Florale, légère, idéale pour des cartes douces',
  },
  {
    id: 'sorbet',
    name: 'Sorbet',
    colors: [
      '#FFCCD5',
      '#FFE5B4',
      '#FFF3B0',
      '#CDECCF',
      '#C7E9FF',
      '#D9D4FF',
      '#FFD6E7',
      '#CFF5F2',
      '#F6E3C7',
      '#E7F5D9',
    ],
    description: 'Pastels fruités avec une pointe de fraîcheur',
  },
  {
    id: 'nordicPastel',
    name: 'Nordic pastel',
    colors: [
      '#E4D9FF',
      '#D8E2DC',
      '#FFE5D9',
      '#FFCAD4',
      '#F4ACB7',
      '#E2ECE9',
      '#CCE2CB',
      '#BEE1E6',
      '#E3D5CA',
      '#EDEDE9',
    ],
    description: 'Pastels scandinaves, épurés et modernes',
  },
  // --- Linux/theme-inspired palettes ---
  {
    id: 'dracula',
    name: 'Dracula',
    colors: [
      '#282A36',
      '#44475A',
      '#F8F8F2',
      '#6272A4',
      '#8BE9FD',
      '#50FA7B',
      '#FFB86C',
      '#FF79C6',
      '#BD93F9',
      '#FF5555',
    ],
    description: 'Palette sombre emblématique du thème Dracula',
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    colors: [
      '#282828',
      '#3C3836',
      '#504945',
      '#665C54',
      '#BDAE93',
      '#FBF1C7',
      '#CC241D',
      '#98971A',
      '#D79921',
      '#458588',
    ],
    description: 'Teintes terreuses contrastées (dark)',
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    colors: [
      '#FBF1C7',
      '#EBDBB2',
      '#D5C4A1',
      '#BDAE93',
      '#665C54',
      '#CC241D',
      '#98971A',
      '#D79921',
      '#458588',
      '#B16286',
    ],
    description: 'Teintes terreuses adoucies (light)',
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: [
      '#2E3440',
      '#3B4252',
      '#434C5E',
      '#4C566A',
      '#8FBCBB',
      '#88C0D0',
      '#81A1C1',
      '#5E81AC',
      '#BF616A',
      '#D08770',
    ],
    description: 'Froid et apaisant, inspiré des paysages nordiques',
  },
  {
    id: 'solarized',
    name: 'Solarized Dark',
    colors: [
      '#002B36',
      '#073642',
      '#586E75',
      '#657B83',
      '#839496',
      '#93A1A1',
      '#B58900',
      '#CB4B16',
      '#DC322F',
      '#268BD2',
    ],
    description: 'Classique à contraste maîtrisé (dark)',
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    colors: [
      '#282C34',
      '#353B45',
      '#3E4451',
      '#545862',
      '#61AFEF',
      '#98C379',
      '#E5C07B',
      '#E06C75',
      '#C678DD',
      '#56B6C2',
    ],
    description: 'Palette élégante issue de One Dark',
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: [
      '#272822',
      '#3E3D32',
      '#75715E',
      '#F8F8F2',
      '#66D9EF',
      '#A6E22E',
      '#E6DB74',
      '#F92672',
      '#AE81FF',
      '#FD971F',
    ],
    description: 'Classique vif et contrasté des éditeurs de code',
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    colors: [
      '#1E1E2E',
      '#181825',
      '#313244',
      '#45475A',
      '#89B4FA',
      '#A6E3A1',
      '#F9E2AF',
      '#F38BA8',
      '#CBA6F7',
      '#94E2D5',
    ],
    description: 'Gamme chaude et cosy (mocha)',
  },
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    colors: [
      '#EFF1F5',
      '#E6E9EF',
      '#DCE0E8',
      '#CCD0DA',
      '#1E66F5',
      '#40A02B',
      '#DF8E1D',
      '#D20F39',
      '#8839EF',
      '#04A5E5',
    ],
    description: 'Version claire délicate et soignée (latte)',
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    colors: [
      '#1A1B26',
      '#24283B',
      '#414868',
      '#565F89',
      '#7AA2F7',
      '#9ECE6A',
      '#E0AF68',
      '#F7768E',
      '#BB9AF7',
      '#7DCFFF',
    ],
    description: 'Nocturne néon, inspiré de Tokyo Night',
  },
];

type AppSettingsState = {
  accentColor: string;
  setAccentColor: (color: string) => void;
  selectedPalette: string;
  setSelectedPalette: (paletteId: string) => void;
  dragTolerance: number;
  setDragTolerance: (tolerance: number) => void;
  columnBorderThickness: number;
  setColumnBorderThickness: (thickness: number) => void;
  // FR: États de collapse des sous-sections des paramètres de carte
  // EN: Collapse states for map settings subsections
  colorsSectionCollapsed: boolean;
  setColorsSectionCollapsed: (collapsed: boolean) => void;
  linksSectionCollapsed: boolean;
  setLinksSectionCollapsed: (collapsed: boolean) => void;
  load: () => void;
};

const STORAGE_KEY = 'bigmind_app_settings';

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  accentColor: '#3b82f6',
  selectedPalette: 'vibrant',
  dragTolerance: 30,
  columnBorderThickness: 1.5, // Épaisseur par défaut des bordures en pixels
  // FR: Par défaut, les sous-sections sont fermées
  // EN: By default, subsections are collapsed
  colorsSectionCollapsed: true,
  linksSectionCollapsed: true,
  setAccentColor: (color: string) => {
    set({ accentColor: color });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.accentColor = color;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
    // Update CSS variable globally
    try {
      document.documentElement.style.setProperty('--accent-color', color);
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  setSelectedPalette: (paletteId: string) => {
    set({ selectedPalette: paletteId });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.selectedPalette = paletteId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  setDragTolerance: (tolerance: number) => {
    set({ dragTolerance: tolerance });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.dragTolerance = tolerance;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  setColumnBorderThickness: (thickness: number) => {
    // Limiter l'épaisseur entre 1px et 3px
    const clampedThickness = Math.max(1, Math.min(3, thickness));
    set({ columnBorderThickness: clampedThickness });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.columnBorderThickness = clampedThickness;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  setColorsSectionCollapsed: (collapsed: boolean) => {
    set({ colorsSectionCollapsed: collapsed });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.colorsSectionCollapsed = collapsed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  setLinksSectionCollapsed: (collapsed: boolean) => {
    set({ linksSectionCollapsed: collapsed });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.linksSectionCollapsed = collapsed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj.accentColor) {
          get().setAccentColor(obj.accentColor);
        }
        if (obj.selectedPalette) {
          set({ selectedPalette: obj.selectedPalette });
        }
        if (obj.dragTolerance !== undefined) {
          set({ dragTolerance: obj.dragTolerance });
        }
        if (obj.columnBorderThickness !== undefined) {
          set({ columnBorderThickness: obj.columnBorderThickness });
        }
        if (obj.colorsSectionCollapsed !== undefined) {
          set({ colorsSectionCollapsed: obj.colorsSectionCollapsed });
        }
        if (obj.linksSectionCollapsed !== undefined) {
          set({ linksSectionCollapsed: obj.linksSectionCollapsed });
        }
      } else {
        // initialize CSS var with default
        document.documentElement.style.setProperty('--accent-color', get().accentColor);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  },
}));
