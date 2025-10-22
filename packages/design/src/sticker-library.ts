/**
 * FR: Bibliothèque de stickers prédéfinis pour BigMind
 * EN: Sticker library for BigMind
 */

import { StickerAsset, StickerCategory } from '@bigmind/core';

/**
 * FR: Stickers de priorité
 * EN: Priority stickers
 */
const priorityStickers: readonly StickerAsset[] = [
  {
    id: 'priority-critical',
    type: 'sticker',
    name: 'Critique',
    category: StickerCategory.PRIORITY,
    icon: 'AlertCircle',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#ef4444',
    tags: ['priorité', 'urgent', 'critique', 'rouge'],
  },
  {
    id: 'priority-high',
    type: 'sticker',
    name: 'Haute',
    category: StickerCategory.PRIORITY,
    icon: 'Triangle',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#f97316',
    tags: ['priorité', 'haute', 'orange'],
  },
  {
    id: 'priority-medium',
    type: 'sticker',
    name: 'Moyenne',
    category: StickerCategory.PRIORITY,
    icon: 'Minus',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#fbbf24',
    tags: ['priorité', 'moyenne', 'jaune'],
  },
  {
    id: 'priority-low',
    type: 'sticker',
    name: 'Basse',
    category: StickerCategory.PRIORITY,
    icon: 'ChevronDown',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#3b82f6',
    tags: ['priorité', 'basse', 'bleu'],
  },
];

/**
 * FR: Stickers de statut
 * EN: Status stickers
 */
const statusStickers: readonly StickerAsset[] = [
  {
    id: 'status-todo',
    type: 'sticker',
    name: 'À faire',
    category: StickerCategory.STATUS,
    icon: 'Circle',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#e5e7eb',
    tags: ['statut', 'à faire', 'todo', 'gris'],
  },
  {
    id: 'status-in-progress',
    type: 'sticker',
    name: 'En cours',
    category: StickerCategory.STATUS,
    icon: 'CircleDot',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#3b82f6',
    tags: ['statut', 'en cours', 'progress', 'bleu'],
  },
  {
    id: 'status-done',
    type: 'sticker',
    name: 'Fait',
    category: StickerCategory.STATUS,
    icon: 'CheckCircle2',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#22c55e',
    tags: ['statut', 'fait', 'complété', 'vert'],
  },
  {
    id: 'status-blocked',
    type: 'sticker',
    name: 'Bloqué',
    category: StickerCategory.STATUS,
    icon: 'XCircle',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#ef4444',
    tags: ['statut', 'bloqué', 'arrêté', 'rouge'],
  },
  {
    id: 'status-on-hold',
    type: 'sticker',
    name: 'En attente',
    category: StickerCategory.STATUS,
    icon: 'PauseCircle',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#f59e0b',
    tags: ['statut', 'attente', 'pause', 'orange'],
  },
];

/**
 * FR: Stickers de progression
 * EN: Progress stickers
 */
const progressStickers: readonly StickerAsset[] = [
  {
    id: 'progress-0',
    type: 'sticker',
    name: '0%',
    category: StickerCategory.PROGRESS,
    icon: 'Percent',
    iconType: 'lucide',
    customizable: false,
    defaultColor: '#9ca3af',
    tags: ['progression', '0%', 'vide'],
  },
  {
    id: 'progress-25',
    type: 'sticker',
    name: '25%',
    category: StickerCategory.PROGRESS,
    icon: 'Quarter',
    iconType: 'lucide',
    customizable: false,
    defaultColor: '#f97316',
    tags: ['progression', '25%', 'quart'],
  },
  {
    id: 'progress-50',
    type: 'sticker',
    name: '50%',
    category: StickerCategory.PROGRESS,
    icon: 'HalfSquare',
    iconType: 'lucide',
    customizable: false,
    defaultColor: '#fbbf24',
    tags: ['progression', '50%', 'moitié'],
  },
  {
    id: 'progress-75',
    type: 'sticker',
    name: '75%',
    category: StickerCategory.PROGRESS,
    icon: 'ThreeQuarter',
    iconType: 'lucide',
    customizable: false,
    defaultColor: '#84cc16',
    tags: ['progression', '75%', 'trois quarts'],
  },
  {
    id: 'progress-100',
    type: 'sticker',
    name: '100%',
    category: StickerCategory.PROGRESS,
    icon: 'CheckSquare2',
    iconType: 'lucide',
    customizable: false,
    defaultColor: '#22c55e',
    tags: ['progression', '100%', 'complet'],
  },
];

/**
 * FR: Stickers d'émotion
 * EN: Emotion stickers
 */
const emotionStickers: readonly StickerAsset[] = [
  {
    id: 'emotion-happy',
    type: 'sticker',
    name: 'Heureux',
    category: StickerCategory.EMOTION,
    icon: 'SmilePlus',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#fbbf24',
    tags: ['émotion', 'heureux', 'sourire', 'positif'],
  },
  {
    id: 'emotion-confused',
    type: 'sticker',
    name: 'Confus',
    category: StickerCategory.EMOTION,
    icon: 'HelpCircle',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#f59e0b',
    tags: ['émotion', 'confus', 'point interrogation'],
  },
  {
    id: 'emotion-sad',
    type: 'sticker',
    name: 'Triste',
    category: StickerCategory.EMOTION,
    icon: 'SmileMinus',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#3b82f6',
    tags: ['émotion', 'triste', 'négatif'],
  },
  {
    id: 'emotion-excited',
    type: 'sticker',
    name: 'Enthousiaste',
    category: StickerCategory.EMOTION,
    icon: 'Zap',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#ec4899',
    tags: ['émotion', 'enthousiaste', 'excité', 'énergie'],
  },
];

/**
 * FR: Stickers métier
 * EN: Business stickers
 */
const businessStickers: readonly StickerAsset[] = [
  {
    id: 'business-dollar',
    type: 'sticker',
    name: 'Budget',
    category: StickerCategory.BUSINESS,
    icon: 'DollarSign',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#22c55e',
    tags: ['métier', 'budget', 'argent', 'finance'],
  },
  {
    id: 'business-target',
    type: 'sticker',
    name: 'Objectif',
    category: StickerCategory.BUSINESS,
    icon: 'Target',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#ef4444',
    tags: ['métier', 'objectif', 'cible', 'but'],
  },
  {
    id: 'business-users',
    type: 'sticker',
    name: 'Équipe',
    category: StickerCategory.BUSINESS,
    icon: 'Users',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#3b82f6',
    tags: ['métier', 'équipe', 'personnes', 'groupe'],
  },
  {
    id: 'business-calendar',
    type: 'sticker',
    name: 'Échéance',
    category: StickerCategory.BUSINESS,
    icon: 'Calendar',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#f97316',
    tags: ['métier', 'échéance', 'date', 'calendrier'],
  },
  {
    id: 'business-briefcase',
    type: 'sticker',
    name: 'Ressource',
    category: StickerCategory.BUSINESS,
    icon: 'Briefcase',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#8b5cf6',
    tags: ['métier', 'ressource', 'document', 'travail'],
  },
];

/**
 * FR: Stickers Tech
 * EN: Tech stickers
 */
const techStickers: readonly StickerAsset[] = [
  {
    id: 'tech-cpu',
    type: 'sticker',
    name: 'Backend',
    category: StickerCategory.TECH,
    icon: 'Cpu',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#6366f1',
    tags: ['tech', 'backend', 'api', 'serveur'],
  },
  {
    id: 'tech-monitor',
    type: 'sticker',
    name: 'Frontend',
    category: StickerCategory.TECH,
    icon: 'Monitor',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#3b82f6',
    tags: ['tech', 'frontend', 'ui', 'web'],
  },
  {
    id: 'tech-database',
    type: 'sticker',
    name: 'Données',
    category: StickerCategory.TECH,
    icon: 'Database',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#10b981',
    tags: ['tech', 'données', 'base', 'db'],
  },
  {
    id: 'tech-shield',
    type: 'sticker',
    name: 'Sécurité',
    category: StickerCategory.TECH,
    icon: 'Shield',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#ef4444',
    tags: ['tech', 'sécurité', 'protection', 'auth'],
  },
  {
    id: 'tech-git',
    type: 'sticker',
    name: 'Version',
    category: StickerCategory.TECH,
    icon: 'GitBranch',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#f97316',
    tags: ['tech', 'version', 'git', 'contrôle'],
  },
];

/**
 * FR: Stickers Nature
 * EN: Nature stickers
 */
const natureStickers: readonly StickerAsset[] = [
  {
    id: 'nature-leaf',
    type: 'sticker',
    name: 'Feuille',
    category: StickerCategory.NATURE,
    icon: 'Leaf',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#22c55e',
    tags: ['nature', 'feuille', 'plante', 'vert'],
  },
  {
    id: 'nature-flower',
    type: 'sticker',
    name: 'Fleur',
    category: StickerCategory.NATURE,
    icon: 'Flower2',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#ec4899',
    tags: ['nature', 'fleur', 'beauté', 'rose'],
  },
  {
    id: 'nature-sun',
    type: 'sticker',
    name: 'Soleil',
    category: StickerCategory.NATURE,
    icon: 'Sun',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#fbbf24',
    tags: ['nature', 'soleil', 'jour', 'lumineux'],
  },
  {
    id: 'nature-cloud',
    type: 'sticker',
    name: 'Nuage',
    category: StickerCategory.NATURE,
    icon: 'Cloud',
    iconType: 'lucide',
    customizable: true,
    defaultColor: '#d1d5db',
    tags: ['nature', 'nuage', 'ciel', 'météo'],
  },
];

/**
 * FR: Liste de tous les stickers
 * EN: List of all stickers
 */
export const ALL_STICKERS = [
  ...priorityStickers,
  ...statusStickers,
  ...progressStickers,
  ...emotionStickers,
  ...businessStickers,
  ...techStickers,
  ...natureStickers,
] as const;

/**
 * FR: Obtient un sticker par son ID
 * EN: Gets a sticker by its ID
 */
export function getStickerById(id: string): StickerAsset | undefined {
  return ALL_STICKERS.find((sticker) => sticker.id === id);
}

/**
 * FR: Obtient tous les stickers d'une catégorie
 * EN: Gets all stickers of a category
 */
export function getStickersByCategory(category: StickerCategory): StickerAsset[] {
  return ALL_STICKERS.filter((sticker) => sticker.category === category);
}

/**
 * FR: Recherche des stickers par tag
 * EN: Searches stickers by tag
 */
export function searchStickersByTag(tag: string): StickerAsset[] {
  const lowerTag = tag.toLowerCase();
  return ALL_STICKERS.filter((sticker) =>
    sticker.tags.some((t) => t.toLowerCase().includes(lowerTag))
  );
}

/**
 * FR: Obtient tous les stickers personnalisables
 * EN: Gets all customizable stickers
 */
export function getCustomizableStickers(): StickerAsset[] {
  return ALL_STICKERS.filter((sticker) => sticker.customizable);
}
