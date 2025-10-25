/**
 * FR: Composant pour afficher les tags sur un nœud
 * EN: Component to display tags on a node
 */

import React, { useMemo } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { useNodeTags } from '../hooks/useNodeTags';
import { X } from 'lucide-react';
import './MindMapNodeTags.css';

interface MindMapNodeTagsProps {
  nodeId: string;
  direction?: number;
  onRemoveTag?: (tagId: string) => void;
}

function MindMapNodeTags({ nodeId, direction, onRemoveTag }: MindMapNodeTagsProps) {
  const getAllTags = useTagGraph(state => state.getAllTags);
  const getNodeTags = useNodeTags(state => state.getNodeTags);

  const tags = useMemo(() => {
    const allTags = getAllTags();
    const tagIds = getNodeTags(nodeId);
    return allTags.filter(tag => tagIds.includes(tag.id));
  }, [getAllTags, getNodeTags, nodeId]);

  if (tags.length === 0) {
    return null;
  }

  // FR: Si direction est -1 (nœud à gauche), afficher les tags à droite. Sinon à gauche.
  // EN: If direction is -1 (node on left), show tags on right. Otherwise on left.
  const isOnLeft = direction === -1;
  const containerClass = isOnLeft
    ? 'node-tags-container node-tags-right'
    : 'node-tags-container node-tags-left';

  return (
    <div className={containerClass}>
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
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default MindMapNodeTags;
