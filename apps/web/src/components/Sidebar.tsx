/**
 * FR: Barre latérale de BigMind
 * EN: BigMind sidebar
 */

import React, { useState } from 'react';
import { Palette, Tag, ChevronDown, ChevronRight, Image, Sticker, MapPin, X } from 'lucide-react';
import { ImageManager } from './ImageManager';
import { StickerPicker } from './StickerPicker';
import NodeProperties from './NodeProperties';
import TagLayersPanelDAG from './TagLayersPanelDAG';
import './TagLayersPanelDAG.css';
import { TagUtils } from '@bigmind/core';

const Sidebar: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['map', 'assets', 'styles', 'tags'])
  );

  // FR: Basculer l'expansion d'une section
  // EN: Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="sidebar">
      {/* FR: Zone de contenu scrollable avec ascenseur Apple-style */}
      {/* EN: Scrollable content area with Apple-style scrollbar */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{
          padding: '12px 12px 0 12px',
          width: '100%',
          boxSizing: 'border-box',
          maxHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        {/* FR: Propriétés du nœud sélectionné - affichées directement */}
        {/* EN: Selected node properties - displayed directly */}
        <NodeProperties />

        {/* FR: Section Calques de tags (toujours visible) */}
        {/* EN: Tag layers section (always visible) */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            background: '#fafbfc',
            marginBottom: 12,
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <TagLayersPanelDAG />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
