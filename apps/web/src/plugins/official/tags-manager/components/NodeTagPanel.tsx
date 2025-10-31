/**
 * FR: Panneau pour ajouter/retirer rapidement des tags sur un nœud
 * EN: Panel for quickly adding/removing tags from a node
 */

import React, { useState, useMemo } from 'react';
import { useTagStore } from '../hooks/useTagStore';
import { useMindMapDAGSync } from '../../../../hooks/useMindMapDAGSync';
import { useAppSettings } from '../../../../hooks/useAppSettings';
import { getNextColorFromPalette } from '../../../../themes/colorPalettes';
import { X, Plus, Sparkles } from 'lucide-react';
import { DagTag } from '../../../../types/dag';
import './NodeTagPanel.css';

interface NodeTagPanelProps {
  nodeId: string;
}

function NodeTagPanel({ nodeId }: NodeTagPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const allTags = useTagStore(state => Object.values(state.tags));
  const addTag = useTagStore(state => state.addTag);
  const getNodeTags = useTagStore(state => state.getNodeTags);
  const { tagNodeSync, untagNodeSync } = useMindMapDAGSync();
  const defaultTagPaletteId = useAppSettings(state => state.defaultTagPaletteId);

  // FR: allTags est nécessaire pour déclencher le recalcul quand les tags changent
  // EN: allTags is necessary to trigger recalculation when tags change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nodeTagIds = useMemo(() => getNodeTags(nodeId), [nodeId, getNodeTags, allTags]);

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

  const getTagColor = (): string => {
    // FR: Utiliser la palette par défaut des tags
    // EN: Use the default tags palette
    // TODO: Récupérer la palette spécifique de la carte si elle est définie
    const paletteId = defaultTagPaletteId;

    // FR: Récupérer toutes les couleurs déjà utilisées (filtrer les undefined)
    // EN: Get all colors already in use (filter out undefined)
    const usedColors = allTags
      .map(tag => tag.color)
      .filter((color): color is string => Boolean(color));

    // FR: Obtenir la prochaine couleur la moins utilisée
    // EN: Get the next least-used color
    return getNextColorFromPalette(paletteId, usedColors);
  };

  const getNoTagsMessage = (): string => {
    if (
      searchQuery.trim() &&
      allTags.some(t => t.label.toLowerCase() === searchQuery.toLowerCase())
    ) {
      return 'Tag already assigned to this node';
    }
    if (allTags.length === nodeTagIds.length) {
      return 'All tags are already assigned';
    }
    return 'No tags match your search';
  };

  const handleCreateNewTag = () => {
    if (!searchQuery.trim()) return;

    const newTagId = `tag-${Date.now()}`;
    const newTag: DagTag = {
      id: newTagId,
      label: searchQuery.trim(),
      color: getTagColor(),
      parentIds: [],
      children: [],
      relations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addTag(newTag);
    tagNodeSync(nodeId, newTagId);
    setSearchQuery('');
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
        <div className="search-with-create">
          <input
            type="text"
            className="tag-search-input"
            placeholder="Search or create..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim() && filteredAvailableTags.length === 0) {
                handleCreateNewTag();
              }
            }}
          />
          {searchQuery.trim() && filteredAvailableTags.length === 0 && (
            <button
              type="button"
              className="create-tag-btn"
              onClick={handleCreateNewTag}
              title={`Create "${searchQuery.trim()}"`}
            >
              <Sparkles size={14} />
            </button>
          )}
        </div>

        {filteredAvailableTags.length > 0 && (
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
        )}
        {filteredAvailableTags.length === 0 && (
          <div className="no-tags-message">{getNoTagsMessage()}</div>
        )}
      </div>
    </div>
  );
}

export default NodeTagPanel;
