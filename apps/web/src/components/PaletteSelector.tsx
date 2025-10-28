/**
 * FR: Sélecteur de palette avec aperçu des couleurs
 * EN: Palette selector with color preview
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ColorPalette } from '../themes/colorPalettes';
import './PaletteSelector.css';

interface PaletteSelectorProps {
  palettes: ColorPalette[];
  value: string;
  onChange: (paletteId: string) => void;
  'aria-label'?: string;
}

function PaletteSelector({ palettes, value, onChange, 'aria-label': ariaLabel }: PaletteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPalette = palettes.find(p => p.id === value) || palettes[0];

  // FR: Fermer le dropdown quand on clique ailleurs
  // EN: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (paletteId: string) => {
    onChange(paletteId);
    setIsOpen(false);
  };

  // FR: Si aucune palette n'est disponible
  // EN: If no palette is available
  if (!selectedPalette || palettes.length === 0) {
    return (
      <div className="palette-selector" ref={containerRef}>
        <div className="palette-selector-button" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <div className="palette-selector-preview">
            <span className="palette-selector-name">Aucune palette (activez le plugin)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="palette-selector" ref={containerRef}>
      <button
        type="button"
        className="palette-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <div className="palette-selector-preview">
          <div className="palette-selector-colors">
            {selectedPalette.colors.slice(0, 5).map((color) => (
              <div
                key={`${selectedPalette.id}-${color}`}
                className="palette-selector-color-dot"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="palette-selector-name">{selectedPalette.name}</span>
        </div>
        <ChevronDown className={`palette-selector-icon ${isOpen ? 'open' : ''}`} size={16} />
      </button>

      {isOpen && (
        <div className="palette-selector-dropdown">
          {palettes.map(palette => (
            <button
              key={palette.id}
              type="button"
              className={`palette-selector-option ${palette.id === value ? 'selected' : ''}`}
              onClick={() => handleSelect(palette.id)}
            >
              <div className="palette-selector-option-preview">
                <div className="palette-selector-option-colors">
                  {palette.colors.map((color) => (
                    <div
                      key={`${palette.id}-${color}`}
                      className="palette-selector-option-color"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="palette-selector-option-info">
                  <span className="palette-selector-option-name">{palette.name}</span>
                  <span className="palette-selector-option-description">{palette.description}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaletteSelector;
