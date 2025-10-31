/**
 * FR: Composant pour afficher les tags sur un nœud
 * EN: Component to display tags on a node
 */

import React from 'react';
import { useTagStore } from '../hooks/useTagStore';
import { useShallow } from 'zustand/react/shallow';
import { X } from 'lucide-react';
import './MindMapNodeTags.css';

interface MindMapNodeTagsProps {
  nodeId: string;
  onRemoveTag?: (tagId: string) => void;
}

function MindMapNodeTags({ nodeId, onRemoveTag }: MindMapNodeTagsProps) {
  // FR: Sélecteur optimisé avec useShallow pour comparaison structurelle
  // EN: Optimized selector with useShallow for structural comparison
  const tags = useTagStore(
    useShallow(state => {
      const nodeTagIds = state.getNodeTags(nodeId);
      return nodeTagIds.map(tagId => state.tags[tagId]).filter(Boolean);
    })
  );

  const handleTagDragStart = (e: React.DragEvent, tagId: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'tag',
        tagId,
        sourceNodeId: nodeId,
        tagLabel: tags.find((t: any) => t.id === tagId)?.label || '',
      })
    );
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="node-tags-container">
      {tags.map(tag => (
        <div
          key={tag.id}
          className="node-tag-badge"
          style={{ backgroundColor: tag.color || '#3b82f6' }}
          title={tag.label}
          draggable
          onDragStart={e => handleTagDragStart(e, tag.id)}
          role="button"
          tabIndex={0}
        >
          <span className="tag-label">{tag.label}</span>
          {onRemoveTag && (
            <button
              type="button"
              className="remove-tag-btn"
              onClick={e => {
                e.stopPropagation();
                onRemoveTag(tag.id);
              }}
              aria-label={`Remove ${tag.label}`}
            >
              <X size={6} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default MindMapNodeTags;
