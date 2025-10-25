/**
 * FR: Panneau pour ajouter/retirer rapidement des tags sur un nœud
 * EN: Panel for quickly adding/removing tags from a node
 */

import React, { useState, useMemo } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { useNodeTags } from '../hooks/useNodeTags';
import { useMindMapDAGSync } from '../hooks/useMindMapDAGSync';
import { X, Plus } from 'lucide-react';
import './NodeTagPanel.css';

interface NodeTagPanelProps {
  nodeId: string;
}

function NodeTagPanel({ nodeId }: NodeTagPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const allTags = useTagGraph(state => state.getAllTags());
  const nodeTags = useNodeTags();
  const { tagNodeSync, untagNodeSync } = useMindMapDAGSync();

  const nodeTagIds = useMemo(() => nodeTags.getNodeTags(nodeId), [nodeId, nodeTags]);

  const filteredAvailableTags = useMemo(
    () =>
      allTags.filter(
        tag =>
          !nodeTagIds.includes(tag.id) &&
          tag.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allTags, nodeTagIds, searchQuery]
  );

  const currentNodeTags = useMemo(
    () => allTags.filter(tag => nodeTagIds.includes(tag.id)),
    [allTags, nodeTagIds]
  );

  const handleAddTag = (tagId: string) => {
    tagNodeSync(nodeId, tagId);
  };

  const handleRemoveTag = (tagId: string) => {
    untagNodeSync(nodeId, tagId);
  };

  return (
    <div className="node-tag-panel">
      <div className="node-tag-panel-header">
        <h4>Tags for node</h4>
        <span className="tag-badge-count">{nodeTagIds.length}</span>
      </div>

      {/* Existing tags */}
      {currentNodeTags.length > 0 && (
        <div className="node-tag-section">
          <div className="section-title">Current tags</div>
          <div className="tag-list">
            {currentNodeTags.map(tag => (
              <div
                key={tag.id}
                className="tag-item"
                style={{ backgroundColor: tag.color || '#3b82f6' }}
              >
                <span className="tag-label">{tag.label}</span>
                <button
                  type="button"
                  className="remove-tag-btn"
                  onClick={() => handleRemoveTag(tag.id)}
                  aria-label={`Remove ${tag.label}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available tags */}
      <div className="node-tag-section">
        <div className="section-title">Available tags</div>
        <input
          type="text"
          className="tag-search-input"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        {filteredAvailableTags.length > 0 ? (
          <div className="tag-list">
            {filteredAvailableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className="tag-add-btn"
                onClick={() => handleAddTag(tag.id)}
                style={{
                  borderColor: tag.color || '#3b82f6',
                  color: tag.color || '#3b82f6',
                }}
                title={tag.label}
              >
                <Plus size={14} />
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="no-tags-message">
            {allTags.length === nodeTagIds.length
              ? 'All tags are already assigned'
              : 'No tags match your search'}
          </div>
        )}
      </div>
    </div>
  );
}

export default NodeTagPanel;
