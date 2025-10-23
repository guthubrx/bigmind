/**
 * FR: Composant de nœud de carte mentale personnalisé
 * EN: Custom mind map node component
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import { useAppSettings } from '../hooks/useAppSettings';
import { useEditMode } from '../hooks/useEditMode';
import { useTagLayers } from '../hooks/useTagLayers';
import NodeContextMenu from './NodeContextMenu';
// FR: Types locaux pour le développement
// EN: Local types for development
export interface MindNode {
  id: string;
  parentId: string | null;
  title: string;
  notes?: string;
  collapsed?: boolean;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderStyle?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  };
  children: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface MindMapNodeData extends MindNode {
  isSelected: boolean;
  isPrimary: boolean;
  direction?: number; // -1 gauche, +1 droite
  // FR: Styles calculés dynamiquement (non destructifs)
  // EN: Dynamically computed styles (non-destructive)
  computedStyle?: {
    backgroundColor?: string;
    textColor?: string;
  };
  tags?: string[]; // FR: Tags associés au nœud / EN: Tags associated with the node
}

type Props = { data: MindMapNodeData; selected?: boolean };

function MindMapNode({ data, selected }: Props) {
  const updateActiveFileNode = useOpenFiles(s => s.updateActiveFileNode);
  const selectedNodeId = useSelection(s => s.selectedNodeId);
  const setSelectedNodeId = useSelection(s => s.setSelectedNodeId);
  const copyNode = useOpenFiles(s => s.copyNode);
  const pasteNode = useOpenFiles(s => s.pasteNode);
  const canPaste = useOpenFiles(s => s.canPaste);
  const accentColor = useAppSettings(s => s.accentColor);
  const setEditMode = useEditMode(s => s.setEditMode);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // FR: Gestion des calques de tags (toujours actif)
  // EN: Tag layers management (always enabled)
  const { isNodeVisible, getNodeOpacity } = useTagLayers();
  const nodeTags = data.tags || [];

  // FR: Log pour débugger l'affichage des tags
  // EN: Debug log for tag display
  if (nodeTags.length > 0) {
    console.log('🏷️ MindMapNode: Nœud avec tags -', data.title, ':', nodeTags);
  }

  const shouldShow = isNodeVisible(nodeTags);
  const layerOpacity = getNodeOpacity(nodeTags);

  // FR: Calculer la luminosité relative d'une couleur hex (0-1, 0=noir, 1=blanc)
  // EN: Calculate relative luminance of a hex color (0-1, 0=black, 1=white)
  const getRelativeLuminance = useCallback((hex: string): number => {
    try {
      const clean = hex.replace('#', '');
      const isShort = clean.length === 3;
      const r = parseInt(isShort ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
      const g = parseInt(isShort ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
      const b = parseInt(isShort ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;
      
      // FR: Formule de luminosité relative selon WCAG
      // EN: Relative luminance formula according to WCAG
      const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    } catch (_e) {
      return 0.5; // FR: Valeur par défaut si erreur de parsing
    }
  }, []);

  // FR: Choisir la couleur de texte optimale (noir ou blanc) selon la luminosité du fond
  // EN: Choose optimal text color (black or white) based on background luminance
  const getOptimalTextColor = useCallback((backgroundColor: string): string => {
    const luminance = getRelativeLuminance(backgroundColor);
    // FR: Seuil de 0.5 : plus clair = texte noir, plus foncé = texte blanc
    // EN: Threshold of 0.5: lighter = black text, darker = white text
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, [getRelativeLuminance]);

  // FR: Obtenir la couleur de fond du nœud
  // EN: Get node background color
  const getNodeBackgroundColor = useCallback((): string => {
    return data.isPrimary 
      ? accentColor 
      : (data.computedStyle?.backgroundColor ||
         data.style?.backgroundColor ||
         (data.style as any)?.fill ||
         (data.style as any)?.background ||
         (data.style as any)?.bgColor ||
         'white');
  }, [data.style, data.computedStyle, data.isPrimary, accentColor]);

  // FR: Démarrer l'édition
  // EN: Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditValue(data.title);
    setEditMode(true, data.id);
  }, [data.title, data.id, setEditMode]);

  // FR: Arrêter l'édition
  // EN: Stop editing
  const stopEditing = useCallback(() => {
    if (editValue.trim() && editValue !== data.title) {
      updateActiveFileNode(data.id, { title: editValue.trim() });
    }
    setIsEditing(false);
    setEditMode(false, null);
  }, [updateActiveFileNode, data.id, data.title, editValue, setEditMode]);

  // FR: Gérer la touche Entrée
  // EN: Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      stopEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setEditValue(data.title);
      stopEditing();
    }
  };

  // FR: Gérer le clic pour sélectionner
  // EN: Handle click to select
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(data.id);
  };

  // FR: Gérer le double-clic pour éditer
  // EN: Handle double-click to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing();
  };

  // FR: Gérer le clic droit pour le menu contextuel
  // EN: Handle right-click for context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // FR: Émettre un événement personnalisé vers le canvas parent
    // EN: Emit custom event to parent canvas
    // La sélection du nœud sera gérée par le canvas pour synchroniser avec le mode follow
    const event = new CustomEvent('node-context-menu', {
      detail: { x: e.clientX, y: e.clientY, nodeId: data.id }
    });
    window.dispatchEvent(event);
  };

  // FR: Synchroniser editValue avec data.title quand il change (sauf si on est en train d'éditer)
  // EN: Sync editValue with data.title when it changes (except when editing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(data.title);
    }
  }, [data.title, isEditing]);

  // FR: Focus sur l'input quand l'édition commence
  // EN: Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // FR: Démarrer l'édition avec F2
  // EN: Start editing with F2
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2' && (selected || data.isSelected)) {
        startEditing();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selected, data.isSelected, startEditing]);

  // FR: Écouter les événements de clignotement depuis l'explorateur
  // EN: Listen for blinking events from the explorer
  useEffect(() => {
    const handleNodeBlink = (event: CustomEvent) => {
      if (event.detail.nodeId === data.id) {
        setIsBlinking(true);
        // Arrêter le clignotement après 1.5 secondes
        setTimeout(() => {
          setIsBlinking(false);
        }, 1500);
      }
    };

    window.addEventListener('node-blink', handleNodeBlink as EventListener);
    return () => {
      window.removeEventListener('node-blink', handleNodeBlink as EventListener);
    };
  }, [data.id]);

  const isCurrentlySelected = !!(selected || data.isSelected || selectedNodeId === data.id);

  let outline: string | undefined;
  let outlineOffset: number | undefined;
  if ((data as any).isGhost) {
    outline = `2px dashed #666666`;
    outlineOffset = 2;
  } else if ((data as any).isDragTarget) {
    outline = `3px dashed ${accentColor}`;
    outlineOffset = 4;
  } else if (isCurrentlySelected) {
    outline = `3px dashed ${accentColor}`;
    outlineOffset = 4;
  } else if (data.isPrimary) {
    outline = `2px solid ${accentColor}`;
    outlineOffset = 2;
  }

  const onKeyActivate = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedNodeId(data.id);
    }
  };

  // FR: Ne pas rendre le nœud s'il est caché par les calques
  // EN: Don't render node if hidden by layers
  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`
        mindmap-node
        ${data.isSelected ? 'selected' : ''}
        ${isEditing ? 'editing' : ''}
        ${data.isPrimary ? '' : ''}
        ${isBlinking ? 'blinking' : ''}
      `}
      role="button"
      tabIndex={(data as any).isGhost ? -1 : 0}
      onKeyDown={(data as any).isGhost ? undefined : onKeyActivate}
      onClick={(data as any).isGhost ? undefined : handleClick}
      onDoubleClick={(data as any).isGhost ? undefined : handleDoubleClick}
      onContextMenu={(data as any).isGhost ? undefined : handleContextMenu}
      style={{
        position: 'relative',
        // FR: Style spécial pour le nœud racine
        // EN: Special style for root node
        backgroundColor: (data as any).isDragTarget
          ? `${accentColor}20` // Fond semi-transparent de la couleur d'accent
          : (data.isPrimary 
            ? accentColor 
            : (data.computedStyle?.backgroundColor ||
               data.style?.backgroundColor ||
               (data.style as any)?.fill ||
               (data.style as any)?.background ||
               (data.style as any)?.bgColor ||
               'white')),
        // FR: Effet de transparence pour les descendants du nœud qu'on glisse, le nœud fantôme et le nœud en cours de drag, et calques
        // EN: Transparency effect for descendants of dragged node, ghost node, node being dragged, and layers
        opacity: (data as any).isGhost ? 0.4 :
                 ((data as any).isBeingDragged ? 0.6 :
                  ((data as any).isDescendantOfDragged ? 0.3 : layerOpacity)),
        // FR: Couleur du texte - contraste automatique pour la racine, sinon selon le style ou contraste automatique
        // EN: Text color - automatic contrast for root, otherwise according to style or automatic contrast
        color: data.isPrimary 
          ? getOptimalTextColor(accentColor)
          : (data.computedStyle?.textColor || data.style?.textColor || (data.style as any)?.color || 'black'),
        fontSize: data.isPrimary 
          ? (data.style?.fontSize || 24) 
          : (data.style?.fontSize || 14),
        fontWeight: data.isPrimary 
          ? (data.style?.fontWeight || 'bold') 
          : (data.style?.fontWeight || 'normal'),
        borderColor: data.style?.borderColor || '#e5e7eb',
        borderStyle: data.style?.borderStyle || 'solid',
        borderWidth: 1,
        borderRadius: data.style?.borderRadius || 8,
        boxSizing: 'border-box',
        width: 200,
        padding: '8px 12px',
        outline,
        outlineOffset,
        boxShadow: (data as any).isDragTarget
          ? `0 0 20px ${accentColor}, 0 0 40px ${accentColor}80, 0 0 60px ${accentColor}40`
          : 'none',
      }}
    >
      {/* FR: Handles d'entrée (côté logique) */}
      {/* EN: Input handles (logical side) */}
      {data.isPrimary ? null : (
        <Handle
          id={data.direction === -1 ? 'right' : 'left'}
          type="target"
          position={data.direction === -1 ? Position.Right : Position.Left}
          className="opacity-0"
        />
      )}

      {/* FR: Contenu du nœud */}
      {/* EN: Node content */}
      <div className={`flex flex-col items-center h-full ${data.isPrimary ? 'justify-center' : 'justify-center'}`}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={stopEditing}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-center"
            style={{
              color: data.isPrimary
                ? '#ffffff'
                : (data.style?.textColor || 'black'),
              fontSize: data.isPrimary
                ? (data.style?.fontSize || 24)
                : (data.style?.fontSize || 14),
              fontWeight: data.isPrimary
                ? (data.style?.fontWeight || 'bold')
                : (data.style?.fontWeight || 'normal'),
            }}
          />
        ) : (
          <span className="text-center break-words">{data.title}</span>
        )}
      </div>

      {/* FR: Affichage des tags sur le bord droit du nœud */}
      {/* EN: Display tags on the right edge of the node */}
      {nodeTags && nodeTags.length > 0 && (
        <div
          className="absolute flex flex-col gap-1"
          style={{
            right: '-8px', // Position à cheval sur le bord
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          {nodeTags.map((tag: string) => (
            <span
              key={tag}
              className="tag-badge"
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '12px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100px',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              title={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      )}


      {/* FR: Handles de sortie sur le côté logique (gauche/droite) */}
      {/* EN: Output handles on logical side (left/right) */}
      {(() => {
        const hasChildren = Array.isArray(data.children) && data.children.length > 0;
        if (!hasChildren) return null;
        if (data.isPrimary) {
          return (
            <div>
              <Handle id="left" type="source" position={Position.Left} className="opacity-0" />
              <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
              <span
                aria-label="Nombre d'enfants à gauche"
                onClick={(e) => {
                  e.stopPropagation();
                  const node = useOpenFiles.getState().openFiles.find(f => f.isActive)?.content?.nodes?.[data.id];
                  if (node) {
                    updateActiveFileNode(data.id, { collapsed: !node.collapsed });
                  }
                }}
                style={{
                  position: 'absolute',
                  left: -12,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: getNodeBackgroundColor(),
                  color: getOptimalTextColor(getNodeBackgroundColor()),
                  borderRadius: 9999,
                  fontSize: 10,
                  lineHeight: '14px',
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
              >
                {(data as any).childCounts?.left ?? 0}
              </span>
              <span
                aria-label="Nombre d'enfants à droite"
                onClick={(e) => {
                  e.stopPropagation();
                  const node = useOpenFiles.getState().openFiles.find(f => f.isActive)?.content?.nodes?.[data.id];
                  if (node) {
                    updateActiveFileNode(data.id, { collapsed: !node.collapsed });
                  }
                }}
                style={{
                  position: 'absolute',
                  right: -12,
                  top: '50%',
                  transform: 'translate(50%, -50%)',
                  backgroundColor: getNodeBackgroundColor(),
                  color: getOptimalTextColor(getNodeBackgroundColor()),
                  borderRadius: 9999,
                  fontSize: 10,
                  lineHeight: '14px',
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(50%, -50%) scale(1)';
                }}
              >
                {(data as any).childCounts?.right ?? 0}
              </span>
            </div>
          );
        }
        const isLeft = data.direction === -1;
        const sideStyle = isLeft
          ? { left: -12, transform: 'translate(-50%, -50%)' }
          : { right: -12, transform: 'translate(50%, -50%)' };
        return (
          <>
            <Handle
              id={isLeft ? 'left' : 'right'}
              type="source"
              position={isLeft ? Position.Left : Position.Right}
              className="opacity-0"
            />
            <span
              aria-label="Nombre d'enfants"
              onClick={(e) => {
                e.stopPropagation();
                const node = useOpenFiles.getState().openFiles.find(f => f.isActive)?.content?.nodes?.[data.id];
                if (node) {
                  updateActiveFileNode(data.id, { collapsed: !node.collapsed });
                }
              }}
              style={
                {
                  position: 'absolute',
                  top: '50%',
                  ...sideStyle,
                  backgroundColor: getNodeBackgroundColor(),
                  color: getOptimalTextColor(getNodeBackgroundColor()),
                  borderRadius: 9999,
                  fontSize: 10,
                  lineHeight: '14px',
                  width: 16,
                  height: 16,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                } as any
              }
              onMouseEnter={(e) => {
                const currentTransform = sideStyle.transform;
                e.currentTarget.style.transform = currentTransform.replace('scale(1)', 'scale(1.1)') || currentTransform + ' scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = sideStyle.transform;
              }}
            >
              {(data as any).childCounts?.total ?? 0}
            </span>
          </>
        );
      })()}

      {/* FR: Indicateur de sélection */}
      {/* EN: Selection indicator */}
      {data.isSelected ? (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"
          style={{ borderWidth: 2, borderStyle: 'solid', borderColor: '#fff' }}
        />
      ) : null}
    </div>
  );
}

export default MindMapNode;
