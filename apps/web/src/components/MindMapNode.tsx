/**
 * FR: Composant de nœud de carte mentale personnalisé
 * EN: Custom mind map node component
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useMindmap } from '../hooks/useMindmap';
import { useSelection } from '../hooks/useSelection';
import { useAppSettings } from '../hooks/useAppSettings';
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
  const { actions } = useMindmap();
  const selectedNodeId = useSelection((s) => s.selectedNodeId);
  const setSelectedNodeId = useSelection((s) => s.setSelectedNodeId);
  const accentColor = useAppSettings((s) => s.accentColor);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // FR: Démarrer l'édition
  // EN: Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditValue(data.title);
    actions.setEditMode(data.id, 'title');
  }, [actions, data.id, data.title]);

  // FR: Arrêter l'édition
  // EN: Stop editing
  const stopEditing = useCallback(() => {
    if (editValue.trim() && editValue !== data.title) {
      actions.updateNodeTitle(data.id, editValue.trim());
    }
    setIsEditing(false);
    actions.setEditMode(null, null);
  }, [actions, data.id, data.title, editValue]);

  // FR: Gérer la touche Entrée
  // EN: Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing();
    } else if (e.key === 'Escape') {
      setEditValue(data.title);
      stopEditing();
    }
  };

  // FR: Gérer le clic pour sélectionner
  // EN: Handle click to select
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.selectNodes([data.id], 'single');
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

  return (
    <div
      className={`
        mindmap-node
        ${data.isSelected ? 'selected' : ''}
        ${isEditing ? 'editing' : ''}
        ${data.isPrimary ? '' : ''}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      style={{
        position: 'relative',
        backgroundColor: data.style?.backgroundColor || 'white',
        color: data.style?.textColor || 'black',
        fontSize: data.style?.fontSize || 14,
        fontWeight: data.style?.fontWeight || 'normal',
        borderColor: data.style?.borderColor || '#e5e7eb',
        borderStyle: data.style?.borderStyle || 'solid',
        borderWidth: 1,
        borderRadius: data.style?.borderRadius || 8,
        boxSizing: 'border-box',
        width: 200,
        padding: '8px 12px',
        outline: isCurrentlySelected
          ? `3px dashed ${accentColor}`
          : data.isPrimary
          ? `2px solid ${accentColor}`
          : undefined,
        outlineOffset: isCurrentlySelected ? 4 : data.isPrimary ? 2 : undefined,
      }}
    >
      {/* FR: Handles d'entrée (côté logique) */}
      {/* EN: Input handles (logical side) */}
      {data.isPrimary ? (
        // la racine n'a pas de parent -> pas de target
        <></>
      ) : (
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
            onChange={(e) => setEditValue(e.target.value)}
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
          <span className="text-center break-words">
            {data.title}
          </span>
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
                  position: 'absolute', left: -12, top: '50%', transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--accent-color)', color: '#fff', borderRadius: 9999,
                  fontSize: 10, lineHeight: '14px', width: 16, height: 16, textAlign: 'center', pointerEvents: 'none'
                }}
              >
                {(data as any).childCounts?.left ?? 0}
              </span>
              <span
                aria-label="Nombre d'enfants à droite"
                style={{
                  position: 'absolute', right: -12, top: '50%', transform: 'translate(50%, -50%)',
                  backgroundColor: 'var(--accent-color)', color: '#fff', borderRadius: 9999,
                  fontSize: 10, lineHeight: '14px', width: 16, height: 16, textAlign: 'center', pointerEvents: 'none'
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
              style={{
                position: 'absolute', top: '50%',
                ...sideStyle,
                backgroundColor: 'var(--accent-color)', color: '#fff', borderRadius: 9999,
                fontSize: 10, lineHeight: '14px', width: 16, height: 16, textAlign: 'center', pointerEvents: 'none'
              } as any}
            >
              {data.children?.length || 0}
            </span>
          </>
        );
      })()}

      {/* FR: Indicateur de sélection */}
      {/* EN: Selection indicator */}
      {data.isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

export default MindMapNode;
