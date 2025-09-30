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
}

type Props = { data: MindMapNodeData; selected?: boolean };

function MindMapNode({ data, selected }: Props) {
  const updateActiveFileNode = useOpenFiles(s => s.updateActiveFileNode);
  const selectedNodeId = useSelection(s => s.selectedNodeId);
  const setSelectedNodeId = useSelection(s => s.setSelectedNodeId);
  const accentColor = useAppSettings(s => s.accentColor);
  const setEditMode = useEditMode(s => s.setEditMode);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // FR: TODO: Implémenter le menu contextuel
    // EN: TODO: Implement context menu
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

  let outline: string | undefined;
  let outlineOffset: number | undefined;
  if (isCurrentlySelected) {
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

  return (
    <div
      className={`
        mindmap-node
        ${data.isSelected ? 'selected' : ''}
        ${isEditing ? 'editing' : ''}
        ${data.isPrimary ? '' : ''}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyActivate}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      style={{
        position: 'relative',
        // FR: Couleur de fond - supporte plusieurs clés (XMind JSON/XML): backgroundColor, fill, background, bgColor
        // EN: Background color - support multiple keys (XMind JSON/XML): backgroundColor, fill, background, bgColor
        backgroundColor:
          data.style?.backgroundColor ||
          (data.style as any)?.fill ||
          (data.style as any)?.background ||
          (data.style as any)?.bgColor ||
          'white',
        // FR: Couleur du texte - fallback sur style.color si textColor absent
        // EN: Text color - fallback to style.color if textColor is missing
        color: data.style?.textColor || (data.style as any)?.color || 'black',
        fontSize: data.style?.fontSize || 14,
        fontWeight: data.style?.fontWeight || 'normal',
        borderColor: data.style?.borderColor || '#e5e7eb',
        borderStyle: data.style?.borderStyle || 'solid',
        borderWidth: 1,
        borderRadius: data.style?.borderRadius || 8,
        boxSizing: 'border-box',
        width: 200,
        padding: '8px 12px',
        outline,
        outlineOffset,
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
              color: data.style?.textColor || 'black',
              fontSize: data.style?.fontSize || 14,
              fontWeight: data.style?.fontWeight || 'normal',
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
            <div>
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
