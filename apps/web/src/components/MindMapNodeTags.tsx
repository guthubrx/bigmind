/**
 * FR: Composant pour afficher les tags sur un nœud
 * EN: Component to display tags on a node
 */

import React, { useMemo } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { useNodeTags } from '../hooks/useNodeTags';
import { DagTag } from '../types/dag';
import { X } from 'lucide-react';
import './MindMapNodeTags.css';

interface MindMapNodeTagsProps {
  nodeId: string;
  onRemoveTag?: (tagId: string) => void;
}

function MindMapNodeTags({ nodeId, onRemoveTag }: MindMapNodeTagsProps) {
  const allTags = useTagGraph(state => Object.values(state.tags) as DagTag[]);
  const tagIds = useNodeTags(state => state.getNodeTags(nodeId));

  const tags = useMemo(() => allTags.filter(tag => tagIds.includes(tag.id)), [allTags, tagIds]);

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
