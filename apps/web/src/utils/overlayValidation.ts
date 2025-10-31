/**
 * FR: Validation et typage des overlays JSON stockés en localStorage
 * EN: Validation and typing of JSON overlays stored in localStorage
 */

// FR: Interface pour les modifications de nœud dans l'overlay
// EN: Interface for node modifications in the overlay
export interface OverlayNodeData {
  title?: string;
  notes?: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderStyle?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontFamily?: string;
  };
}

// FR: Interface pour le style par défaut des nœuds
// EN: Interface for default node style
export interface DefaultNodeStyle {
  fontSize?: number;
  width?: number;
  fontFamily?: string;
}

// FR: Interface complète de l'overlay
// EN: Complete overlay interface
export interface MindMapOverlay {
  nodes?: Record<string, OverlayNodeData>;
  nodePaletteId?: string;
  tagPaletteId?: string;
  defaultNodeStyle?: DefaultNodeStyle;
}

/**
 * FR: Valider qu'une valeur est un objet (et non null ou array)
 * EN: Validate that a value is an object (and not null or array)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * FR: Valider le style d'un nœud
 * EN: Validate node style
 */
function validateNodeStyle(style: unknown): OverlayNodeData['style'] | undefined {
  if (!isPlainObject(style)) return undefined;

  const validStyle: OverlayNodeData['style'] = {};
  let hasValidField = false;

  if (typeof style.backgroundColor === 'string') {
    validStyle.backgroundColor = style.backgroundColor;
    hasValidField = true;
  }
  if (typeof style.textColor === 'string') {
    validStyle.textColor = style.textColor;
    hasValidField = true;
  }
  if (typeof style.borderColor === 'string') {
    validStyle.borderColor = style.borderColor;
    hasValidField = true;
  }
  if (typeof style.borderStyle === 'string') {
    validStyle.borderStyle = style.borderStyle;
    hasValidField = true;
  }
  if (typeof style.borderRadius === 'number' && !Number.isNaN(style.borderRadius)) {
    validStyle.borderRadius = style.borderRadius;
    hasValidField = true;
  }
  if (typeof style.fontSize === 'number' && !Number.isNaN(style.fontSize)) {
    validStyle.fontSize = style.fontSize;
    hasValidField = true;
  }
  if (
    typeof style.fontWeight === 'string' &&
    ['normal', 'medium', 'semibold', 'bold'].includes(style.fontWeight)
  ) {
    validStyle.fontWeight = style.fontWeight as 'normal' | 'medium' | 'semibold' | 'bold';
    hasValidField = true;
  }
  if (typeof style.fontFamily === 'string') {
    validStyle.fontFamily = style.fontFamily;
    hasValidField = true;
  }

  return hasValidField ? validStyle : undefined;
}

/**
 * FR: Valider les données d'un nœud dans l'overlay
 * EN: Validate node data in the overlay
 */
function validateNodeData(nodeData: unknown): OverlayNodeData | undefined {
  if (!isPlainObject(nodeData)) return undefined;

  const validNode: OverlayNodeData = {};
  let hasValidField = false;

  if (typeof nodeData.title === 'string') {
    validNode.title = nodeData.title;
    hasValidField = true;
  }
  if (typeof nodeData.notes === 'string') {
    validNode.notes = nodeData.notes;
    hasValidField = true;
  }
  if (nodeData.style !== undefined) {
    const validStyle = validateNodeStyle(nodeData.style);
    if (validStyle) {
      validNode.style = validStyle;
      hasValidField = true;
    }
  }

  return hasValidField ? validNode : undefined;
}

/**
 * FR: Valider le style par défaut des nœuds
 * EN: Validate default node style
 */
function validateDefaultNodeStyle(style: unknown): DefaultNodeStyle | undefined {
  if (!isPlainObject(style)) return undefined;

  const validStyle: DefaultNodeStyle = {};
  let hasValidField = false;

  if (typeof style.fontSize === 'number' && !Number.isNaN(style.fontSize)) {
    validStyle.fontSize = style.fontSize;
    hasValidField = true;
  }
  if (typeof style.width === 'number' && !Number.isNaN(style.width)) {
    validStyle.width = style.width;
    hasValidField = true;
  }
  if (typeof style.fontFamily === 'string') {
    validStyle.fontFamily = style.fontFamily;
    hasValidField = true;
  }

  return hasValidField ? validStyle : undefined;
}

/**
 * FR: Valider et nettoyer un overlay complet
 * EN: Validate and sanitize a complete overlay
 */
export function validateOverlay(overlay: unknown): MindMapOverlay {
  if (!isPlainObject(overlay)) {
    return {};
  }

  const validOverlay: MindMapOverlay = {};

  // FR: Valider les nœuds
  // EN: Validate nodes
  if (isPlainObject(overlay.nodes)) {
    const validNodes: Record<string, OverlayNodeData> = {};
    Object.entries(overlay.nodes).forEach(([nodeId, nodeData]) => {
      const validNodeData = validateNodeData(nodeData);
      if (validNodeData) {
        validNodes[nodeId] = validNodeData;
      }
    });
    if (Object.keys(validNodes).length > 0) {
      validOverlay.nodes = validNodes;
    }
  }

  // FR: Valider nodePaletteId
  // EN: Validate nodePaletteId
  if (typeof overlay.nodePaletteId === 'string') {
    validOverlay.nodePaletteId = overlay.nodePaletteId;
  }

  // FR: Valider tagPaletteId
  // EN: Validate tagPaletteId
  if (typeof overlay.tagPaletteId === 'string') {
    validOverlay.tagPaletteId = overlay.tagPaletteId;
  }

  // FR: Valider defaultNodeStyle
  // EN: Validate defaultNodeStyle
  if (overlay.defaultNodeStyle !== undefined) {
    const validDefaultStyle = validateDefaultNodeStyle(overlay.defaultNodeStyle);
    if (validDefaultStyle) {
      validOverlay.defaultNodeStyle = validDefaultStyle;
    }
  }

  return validOverlay;
}

/**
 * FR: Charger et valider un overlay depuis localStorage
 * EN: Load and validate an overlay from localStorage
 */
export function loadOverlayFromStorage(key: string): MindMapOverlay {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return validateOverlay(parsed);
  } catch (error) {
    // FR: En cas d'erreur de parsing, retourner un overlay vide
    // EN: In case of parsing error, return empty overlay
    // eslint-disable-next-line no-console
    console.warn(`[overlayValidation] Erreur lors du chargement de l'overlay ${key}:`, error);
    return {};
  }
}

/**
 * FR: Sauvegarder un overlay dans localStorage
 * EN: Save an overlay to localStorage
 */
export function saveOverlayToStorage(key: string, overlay: MindMapOverlay): void {
  try {
    // FR: Valider avant de sauvegarder
    // EN: Validate before saving
    const validOverlay = validateOverlay(overlay);
    localStorage.setItem(key, JSON.stringify(validOverlay));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[overlayValidation] Erreur lors de la sauvegarde de l'overlay ${key}:`, error);
  }
}
