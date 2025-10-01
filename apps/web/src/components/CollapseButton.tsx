/**
 * FR: Bouton de collapse pour les colonnes
 * EN: Collapse button for columns
 */

import React from 'react';
import { useAppSettings } from '../hooks/useAppSettings';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

function CollapseButton({
  isCollapsed,
  onToggle,
  direction = 'left',
  className = '',
}: CollapseButtonProps) {
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

  const accentColor = useAppSettings(s => s.accentColor);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`collapse-button flex items-center justify-center w-3 h-5 rounded-sm 
        transition-colors duration-200 ${className}`}
      style={{
        border: `1px solid ${accentColor}`,
        background: [
          'linear-gradient(90deg, ',
          `color-mix(in srgb, ${accentColor} 28%, white) 0%, `,
          `color-mix(in srgb, ${accentColor} 18%, white) 100%)`,
        ].join(''),
      }}
      title={isCollapsed ? 'Expand column' : 'Collapse column'}
    >
      {getIcon()}
    </button>
  );
}

export default CollapseButton;
