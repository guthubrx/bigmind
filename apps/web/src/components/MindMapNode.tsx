/**
 * FR: Composant de nœud de carte mentale personnalisé
 * EN: Custom mind map node component
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useMindmap } from '../hooks/useMindmap';
import { useSelection } from '../hooks/useSelection';
import { useAppSettings } from '../hooks/useAppSettings';
import { useEditMode } from '../hooks/useEditMode';
import { useMindMapDAGSync } from '../hooks/useMindMapDAGSync';
import { useOpenFiles } from '../hooks/useOpenFiles';
import MindMapNodeTags from './MindMapNodeTags';

interface DragTagData {
  type: 'tag';
  tagId: string;
  tagLabel: string;
  sourceNodeId?: string;
}
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
    fontFamily?: string;
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
  computedStyle?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

type Props = { data: MindMapNodeData; selected?: boolean };

function MindMapNode({ data, selected }: Props) {
  const { actions } = useMindmap();
  const selectedNodeId = useSelection(s => s.selectedNodeId);
  const setSelectedNodeId = useSelection(s => s.setSelectedNodeId);
  const accentColor = useAppSettings(s => s.accentColor);
  const getCurrentTheme = useAppSettings(s => s.getCurrentTheme);
  const currentTheme = getCurrentTheme();
  const setEditMode = useEditMode(s => s.setEditMode);
  const { untagNodeSync, tagNodeSync } = useMindMapDAGSync();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  const [isDragOverNode, setIsDragOverNode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // FR: Récupérer les paramètres par défaut globaux et du fichier actif
  // EN: Get global default settings and active file settings
  const defaultNodeFontSize = useAppSettings(s => s.defaultNodeFontSize);
  const defaultNodeWidth = useAppSettings(s => s.defaultNodeWidth);
  const defaultNodeFontFamily = useAppSettings(s => s.defaultNodeFontFamily);
  const getActiveFile = useOpenFiles(s => s.getActiveFile);
  const activeFile = getActiveFile();

  // FR: Calculer les valeurs avec hiérarchie : nœud > fichier > global
  // EN: Calculate values with hierarchy: node > file > global
  const getEffectiveFontSize = useCallback(
    (isPrimary: boolean): number => {
      if (data.style?.fontSize) return data.style.fontSize;
      if (activeFile?.content?.defaultNodeStyle?.fontSize) {
        return activeFile.content.defaultNodeStyle.fontSize;
      }
      return isPrimary ? 24 : defaultNodeFontSize || 14;
    },
    [data.style?.fontSize, activeFile, defaultNodeFontSize]
  );

  const getEffectiveWidth = useCallback((): number => {
    if (data.width) return data.width;
    if (activeFile?.content?.defaultNodeStyle?.width) {
      return activeFile.content.defaultNodeStyle.width;
    }
    return defaultNodeWidth || 200;
  }, [data.width, activeFile, defaultNodeWidth]);

  const getEffectiveFontFamily = useCallback((): string => {
    if (data.style?.fontFamily) return data.style.fontFamily;
    if (activeFile?.content?.defaultNodeStyle?.fontFamily) {
      return activeFile.content.defaultNodeStyle.fontFamily;
    }
    return defaultNodeFontFamily || 'inherit';
  }, [data.style, activeFile, defaultNodeFontFamily]);

  // FR: Gérer le drag over (afficher feedback visuel)
  // EN: Handle drag over (show visual feedback)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    const dataJson = e.dataTransfer.getData('application/json');
    if (!dataJson) return;

    try {
      const dragData: DragTagData = JSON.parse(dataJson);
      if (dragData.type === 'tag') {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOverNode(true);
      }
    } catch {
      // Ignore invalid data
    }
  }, []);

  // FR: Gérer le drag leave (retirer feedback visuel)
  // EN: Handle drag leave (remove visual feedback)
  const handleDragLeave = useCallback(() => {
    setIsDragOverNode(false);
  }, []);

  // FR: Gérer le drop (ajouter le tag au nœud)
  // EN: Handle drop (add tag to node)
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOverNode(false);

      const dataJson = e.dataTransfer.getData('application/json');
      if (!dataJson) return;

      try {
        const dragData: DragTagData = JSON.parse(dataJson);
        if (dragData.type === 'tag') {
          // Add tag to target node
          tagNodeSync(data.id, dragData.tagId);

          // If dragging from another node with Ctrl held, remove from source (move instead of copy)
          if (dragData.sourceNodeId && dragData.sourceNodeId !== data.id && e.ctrlKey) {
            untagNodeSync(dragData.sourceNodeId, dragData.tagId);
          }
        }
      } catch {
        // Ignore invalid data
      }
    },
    [data.id, tagNodeSync, untagNodeSync]
  );

  // FR: Calculer la luminosité relative d'une couleur hex
  // EN: Calculate relative luminance of a hex color
  const getRelativeLuminance = useCallback((hex: string): number => {
    try {
      const clean = hex.replace('#', '');
      const isShort = clean.length === 3;
      const r = parseInt(isShort ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
      const g = parseInt(isShort ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
      const b = parseInt(isShort ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;

      const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    } catch {
      return 0.5;
    }
  }, []);

  // FR: Choisir la couleur de texte optimale (noir ou blanc)
  // EN: Choose optimal text color (black or white)
  const getOptimalTextColor = useCallback(
    (backgroundColor: string): string => {
      const luminance = getRelativeLuminance(backgroundColor);
      return luminance > 0.5 ? '#000000' : '#ffffff';
    },
    [getRelativeLuminance]
  );

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
      actions.updateNodeTitle(data.id, editValue.trim());
    }
    setIsEditing(false);
    setEditMode(false, null);
  }, [actions, data.id, data.title, editValue, setEditMode]);

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
    const event = new CustomEvent('node-context-menu', {
      detail: { x: e.clientX, y: e.clientY, nodeId: data.id },
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

  const isCurrentlySelected = !!(selected || data.isSelected || selectedNodeId === data.id);

  // FR: Calculer le shadow selon l'état (memoïzé)
  // EN: Calculate shadow based on state (memoized)
  const boxShadow = useMemo(() => {
    if (isDragOverNode) {
      return `inset 0 0 10px ${accentColor}40, 0 0 20px ${accentColor}40`;
    }
    if ((data as any).isSiblingReorder) {
      return 'none';
    }
    if ((data as any).isValidDragTarget && (data as any).dropPosition === 'center') {
      return '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)';
    }
    if ((data as any).isValidDragTarget) {
      return '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)';
    }
    if ((data as any).isInvalidDragTarget) {
      return '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)';
    }
    if ((data as any).isDragTarget) {
      return `0 0 20px ${accentColor}, 0 0 40px ${accentColor}80, 0 0 60px ${accentColor}40`;
    }
    return 'none';
  }, [isDragOverNode, data, accentColor]);

  // FR: Calculer outline selon l'état
  // EN: Calculate outline based on state
  let outline: string | undefined;
  let outlineOffset: number | undefined;
  if ((data as any).isGhost) {
    outline = '2px dashed #666666';
    outlineOffset = 2;
  } else if ((data as any).isSiblingReorder) {
    // FR: Réordonnancement de siblings - outline VERT en pointillé
    // EN: Sibling reorder - GREEN dashed outline
    outline = '3px dashed rgb(34, 197, 94)';
    outlineOffset = 4;
  } else if ((data as any).isValidDragTarget && (data as any).dropPosition === 'center') {
    // FR: Reparenting (zone centrale) - outline BLEU
    // EN: Reparenting (center zone) - BLUE outline
    outline = '3px dashed rgb(59, 130, 246)';
    outlineOffset = 4;
  } else if ((data as any).isValidDragTarget) {
    outline = '3px dashed rgb(34, 197, 94)';
    outlineOffset = 4;
  } else if ((data as any).isInvalidDragTarget) {
    outline = '3px dashed rgb(239, 68, 68)';
    outlineOffset = 4;
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

  // FR: Déterminer la couleur de fond (memoïzée)
  // EN: Determine background color (memoized)
  const bgColor = useMemo(() => {
    if ((data as any).isSiblingReorder) {
      return 'rgba(34, 197, 94, 0.05)';
    }
    if ((data as any).isValidDragTarget && (data as any).dropPosition === 'center') {
      return 'rgba(59, 130, 246, 0.1)';
    }
    if ((data as any).isValidDragTarget) {
      return 'rgba(34, 197, 94, 0.1)';
    }
    if ((data as any).isInvalidDragTarget) {
      return 'rgba(239, 68, 68, 0.05)';
    }
    if ((data as any).isDragTarget) {
      return `${accentColor}20`;
    }
    if (data.isPrimary) {
      return accentColor;
    }
    return (
      data.computedStyle?.backgroundColor ||
      data.style?.backgroundColor ||
      (data.style as any)?.fill ||
      (data.style as any)?.background ||
      (data.style as any)?.bgColor ||
      currentTheme.colors.nodeBackground
    );
  }, [data, accentColor, currentTheme.colors.nodeBackground]);

  // FR: Déterminer l'opacité (memoïzée)
  // EN: Determine opacity (memoized)
  const nodeOpacity = useMemo(() => {
    if ((data as any).isHiddenByTag) return 0.15;
    if ((data as any).isGhost) return 0.4;
    if ((data as any).isBeingDragged) return 0.6;
    if ((data as any).isDescendantOfDragged) return 0.3;
    return 1;
  }, [data]);

  // FR: Déterminer la couleur du texte (memoïzée)
  // EN: Determine text color (memoized)
  const textColor = useMemo(
    () =>
      data.isPrimary
        ? getOptimalTextColor(accentColor)
        : data.computedStyle?.textColor ||
          data.style?.textColor ||
          (data.style as any)?.color ||
          currentTheme.colors.nodeText,
    [data, accentColor, getOptimalTextColor, currentTheme.colors.nodeText]
  );

  return (
    <div
      className={`
        mindmap-node
        ${data.isSelected ? 'selected' : ''}
        ${isEditing ? 'editing' : ''}
        ${data.isPrimary ? '' : ''}
        ${isDragOverNode ? 'drag-over-tag' : ''}
        ${(data as any).isValidDragTarget ? 'valid-reparent-target' : ''}
        ${(data as any).isInvalidDragTarget ? 'invalid-reparent-target' : ''}
        ${(data as any).isBeingDragged ? 'node-dropping' : ''}
        ${(data as any).isDragTarget ? 'node-receive-drop' : ''}
        ${(data as any).isDescendantOfDragged ? 'node-descendant-dropping' : ''}
      `}
      role="button"
      tabIndex={(data as any).isGhost ? -1 : 0}
      onKeyDown={(data as any).isGhost ? undefined : onKeyActivate}
      onClick={(data as any).isGhost ? undefined : handleClick}
      onDoubleClick={(data as any).isGhost ? undefined : handleDoubleClick}
      onContextMenu={(data as any).isGhost ? undefined : handleContextMenu}
      onDragOver={(data as any).isGhost ? undefined : handleDragOver}
      onDragLeave={(data as any).isGhost ? undefined : handleDragLeave}
      onDrop={(data as any).isGhost ? undefined : handleDrop}
      style={{
        position: 'relative',
        overflow: 'visible',
        backgroundColor: bgColor,
        opacity: nodeOpacity,
        color: textColor,
        fontSize: getEffectiveFontSize(data.isPrimary),
        fontFamily: getEffectiveFontFamily(),
        fontWeight: data.isPrimary
          ? data.style?.fontWeight || 'bold'
          : data.style?.fontWeight || 'normal',
        borderColor: isDragOverNode ? accentColor : data.style?.borderColor || '#e5e7eb',
        borderStyle: isDragOverNode ? 'dashed' : data.style?.borderStyle || 'solid',
        borderWidth: isDragOverNode ? 2 : 1,
        borderRadius: data.style?.borderRadius || 8,
        boxSizing: 'border-box',
        width: getEffectiveWidth(),
        padding: '8px 12px',
        outline,
        outlineOffset,
        boxShadow,
        transition: 'all 0.2s ease',
      }}
    >
      {/* FR: Handles d'entrée (côté logique) */}
      {/* EN: Input handles (logical side) */}
      {!data.isPrimary && (
        <Handle
          id={data.direction === -1 ? 'right' : 'left'}
          type="target"
          position={data.direction === -1 ? Position.Right : Position.Left}
          className="opacity-0"
        />
      )}

      {/* FR: Contenu du nœud */}
      {/* EN: Node content */}
      <div className="flex items-center justify-center h-full">
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
              color: data.isPrimary ? '#ffffff' : data.style?.textColor || 'black',
              fontSize: getEffectiveFontSize(data.isPrimary),
              fontFamily: getEffectiveFontFamily(),
              fontWeight: data.isPrimary
                ? data.style?.fontWeight || 'bold'
                : data.style?.fontWeight || 'normal',
            }}
          />
        ) : (
          <span className="text-center break-words">{data.title}</span>
        )}
      </div>

      {/* FR: Handles de sortie sur le côté logique (gauche/droite) */}
      {/* EN: Output handles on logical side (left/right) */}
      {(() => {
        const hasChildren = Array.isArray(data.children) && data.children.length > 0;
        if (!hasChildren) return null;
        if (data.isPrimary) {
          return (
            <>
              <Handle id="left" type="source" position={Position.Left} className="opacity-0" />
              <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
              <span
                aria-label="Nombre d'enfants à gauche"
                style={{
                  position: 'absolute',
                  left: -12,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--accent-color)',
                  color: '#fff',
                  borderRadius: 9999,
                  fontSize: 10,
                  lineHeight: '14px',
                  width: 16,
                  height: 16,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {(data as any).childCounts?.left ?? 0}
              </span>
              <span
                aria-label="Nombre d'enfants à droite"
                style={{
                  position: 'absolute',
                  right: -12,
                  top: '50%',
                  transform: 'translate(50%, -50%)',
                  backgroundColor: 'var(--accent-color)',
                  color: '#fff',
                  borderRadius: 9999,
                  fontSize: 10,
                  lineHeight: '14px',
                  width: 16,
                  height: 16,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {(data as any).childCounts?.right ?? 0}
              </span>
            </>
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
              style={
                {
                  position: 'absolute',
                  top: '50%',
                  ...sideStyle,
                  backgroundColor: 'var(--accent-color)',
                  color: '#fff',
                  borderRadius: 9999,
                  fontSize: 10,
                  lineHeight: '14px',
                  width: 16,
                  height: 16,
                  textAlign: 'center',
                  pointerEvents: 'none',
                } as any
              }
            >
              {data.children?.length || 0}
            </span>
          </>
        );
      })()}

      {/* FR: Indicateur de sélection */}
      {/* EN: Selection indicator */}
      {data.isSelected && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500
                     rounded-full border-2 border-white"
        />
      )}

      {/* FR: Tags affichés sur le nœud */}
      {/* EN: Tags displayed on node */}
      <MindMapNodeTags nodeId={data.id} onRemoveTag={tagId => untagNodeSync(data.id, tagId)} />

      {/* FR: Indicateur de position de drop pour réordonnancement de siblings */}
      {/* EN: Drop position indicator for sibling reordering */}
      {(data as any).isSiblingReorder && (data as any).dropPosition === 'before' && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'rgb(34, 197, 94)',
            borderRadius: '2px 2px 0 0',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5)',
            zIndex: 10,
          }}
        />
      )}
      {(data as any).isSiblingReorder && (data as any).dropPosition === 'after' && (
        <div
          style={{
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'rgb(34, 197, 94)',
            borderRadius: '0 0 2px 2px',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5)',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

// FR: Wrapper avec React.memo pour éviter les re-renders inutiles
// EN: Wrap with React.memo to avoid unnecessary re-renders
export default React.memo(
  MindMapNode,
  (prevProps, nextProps) =>
    // FR: Comparer uniquement les props qui affectent le rendu
    // EN: Compare only props that affect rendering
    prevProps.data === nextProps.data && prevProps.selected === nextProps.selected
);
