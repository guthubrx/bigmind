/**
 * FR: Composant de nœud de carte mentale personnalisé
 * EN: Custom mind map node component
 */

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useMindmap } from '../hooks/useMindmap';
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
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  };
  children: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface MindMapNodeData extends MindNode {
  isSelected: boolean;
  isPrimary: boolean;
  direction?: number; // -1 gauche, +1 droite
}

const MindMapNode: React.FC<NodeProps<MindMapNodeData>> = ({ data, selected }) => {
  const { actions, editMode } = useMindmap();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // FR: Démarrer l'édition
  // EN: Start editing
  const startEditing = () => {
    setIsEditing(true);
    setEditValue(data.title);
    actions.setEditMode(data.id, 'title');
  };

  // FR: Arrêter l'édition
  // EN: Stop editing
  const stopEditing = () => {
    if (editValue.trim() && editValue !== data.title) {
      actions.updateNodeTitle(data.id, editValue.trim());
    }
    setIsEditing(false);
    actions.setEditMode(null, null);
  };

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
  }, [selected, data.isSelected]);

  return (
    <div
      className={`
        mindmap-node
        ${data.isSelected ? 'selected' : ''}
        ${isEditing ? 'editing' : ''}
        ${data.isPrimary ? 'ring-2 ring-accent-500' : ''}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      style={{
        backgroundColor: data.style?.backgroundColor || 'white',
        color: data.style?.textColor || 'black',
        fontSize: data.style?.fontSize || 14,
        fontWeight: data.style?.fontWeight || 'normal',
        borderColor: data.style?.borderColor || '#e5e7eb',
        borderStyle: data.style?.borderStyle || 'solid',
        borderRadius: data.style?.borderRadius || 8,
        width: 200,
        padding: '8px 12px',
      }}
    >
      {/* FR: Handles d'entrée (côté logique) */}
      {/* EN: Input handles (logical side) */}
      {data.isPrimary ? (
        // La racine peut recevoir des liens des deux côtés
        <>
          <Handle id="left" type="target" position={Position.Left} className="opacity-0" />
          <Handle id="right" type="target" position={Position.Right} className="opacity-0" />
        </>
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
      {data.isPrimary ? (
        <>
          <Handle id="left" type="source" position={Position.Left} className="opacity-0" />
          <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
        </>
      ) : (
        <Handle
          id={data.direction === -1 ? 'left' : 'right'}
          type="source"
          position={data.direction === -1 ? Position.Left : Position.Right}
          className="opacity-0"
        />
      )}

      {/* FR: Indicateur de sélection */}
      {/* EN: Selection indicator */}
      {data.isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

export default MindMapNode;
