// UI Constants
export const UI_CONSTANTS = {
  NODE_WIDTH: 120,
  NODE_HEIGHT: 40,
  NODE_RADIUS: 20,
  MIN_GEN_GAP: 29,
  DEFAULT_GEN_GAP: 50,
  DEFAULT_V_GAP: 20,
  DEFAULT_DROP_TOLERANCE: 10,
  DEFAULT_COLLAPSE_DURATION: 300,
  TOGGLE_BUTTON_OFFSET: 10,
  TOGGLE_BUTTON_RADIUS: 12,
  MAX_RECENT_FILES: 10,
  DEFAULT_SIDEBAR_WIDTH: 300,
  MIN_SIDEBAR_WIDTH: 200,
  MAX_SIDEBAR_WIDTH: 600,
} as const

// File Types
export const FILE_TYPES = {
  FREEMIND: '.mm',
  XMIND: '.xmind',
  JSON: '.json',
} as const

// MIME Types
export const MIME_TYPES = {
  FREEMIND: 'text/xml',
  XMIND: 'application/zip',
  JSON: 'application/json',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  PREFS: 'bm2:prefs',
} as const

// CSS Classes
export const CSS_CLASSES = {
  NODE_TOGGLE: 'node-toggle',
  ROOT_SIDE_TOGGLE: 'root-side-toggle',
  TAG_MUTED: 'tag-muted',
} as const

// Default Values
export const DEFAULTS = {
  THEME: 'light',
  LANGUAGE: 'fr',
  ACCENT_COLOR: '#3b82f6',
  ZOOM: 1,
} as const
