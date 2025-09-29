/**
 * FR: Bouton de collapse pour les colonnes
 * EN: Collapse button for columns
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({ 
  isCollapsed, 
  onToggle, 
  direction = 'left',
  className = ''
}) => {
  const getIcon = () => {
    switch (direction) {
      case 'left':
        return isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />;
      case 'right':
        return isCollapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />;
      case 'up':
        return isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
      case 'down':
        return isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
      default:
        return isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />;
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`
        collapse-button
        flex items-center justify-center
        w-3 h-5
        bg-gray-100 hover:bg-gray-200
        border border-gray-300
        rounded-sm
        transition-colors duration-200
        ${className}
      `}
      title={isCollapsed ? 'Expand column' : 'Collapse column'}
    >
      {getIcon()}
    </button>
  );
};

export default CollapseButton;
