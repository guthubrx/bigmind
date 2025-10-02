/**
 * FR: Composant pour gérer le redimensionnement des colonnes
 * EN: Component to handle column resizing
 */

import React from 'react';
import { cn } from '../utils/cn';

interface ResizeHandleProps {
  onMouseDown: (event: React.MouseEvent) => void;
  isDragging?: boolean;
  isHovered?: boolean;
  position?: 'left' | 'right';
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = React.memo(
  ({ onMouseDown, isDragging = false, isHovered = false, position = 'right', className }) => (
    <button
      type="button"
      className={cn(
        'resize-handle',
        'vertical',
        isDragging && 'dragging',
        isHovered && 'hovered',
        position === 'left' && 'left-position',
        position === 'right' && 'right-position',
        className
      )}
      onMouseDown={onMouseDown}
      aria-label="Redimensionner la colonne"
      title="Redimensionner la colonne (glisser-déposer)"
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        margin: 0,
        outline: 'none',
      }}
    >
      <div className="resize-handle-indicator" />
    </button>
  )
);

ResizeHandle.displayName = 'ResizeHandle';
