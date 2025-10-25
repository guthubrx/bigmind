/**
 * FR: Panneau DAG des tags avec vue graphique et liste
 * EN: DAG tag panel with graph and list views
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { eventBus } from '../utils/eventBus';
import TagGraph from './TagGraph';
import TagLayersPanel from './TagLayersPanel';
import { Plus, Eye, EyeOff } from 'lucide-react';
import './TagLayersPanelDAG.css';

export type ViewMode = 'graph' | 'list';

interface TagLayersPanelDAGProps {
  onClose?: () => void;
}

function TagLayersPanelDAG({ onClose }: TagLayersPanelDAGProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const addTag = useTagGraph((state: any) => state.addTag);
  const getAllTags = useTagGraph((state: any) => state.getAllTags);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateColor = (): string => {
    const colors = [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#06b6d4',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddTag = useCallback(() => {
    if (newTagName.trim()) {
      const tagId = `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      addTag({
        id: tagId,
        label: newTagName.trim(),
        children: [],
        relations: [],
        color: generateColor(),
      });
      setNewTagName('');
      setShowNewTagInput(false);
      // Émettre un événement pour synchroniser avec la MindMap
      eventBus.emit('tag:created', { tagId, label: newTagName.trim() });
      eventBus.emit('sync:refresh', {});
    }
  }, [newTagName, addTag]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowNewTagInput(false);
    }
  };

  const tagCount = getAllTags().length;
  const validation = useTagGraph((state: any) => state.validateDAG)();

  return (
    <div className="tag-layers-dag-container">
      {/* FR: En-tête */}
      {/* EN: Header */}
      <div className="tag-layers-dag-header">
        <div className="header-left">
          <h2>Tags & Layers</h2>
          {!validation.valid && (
            <div className="validation-warning" title={validation.errors.join('\n')}>
              ⚠️ Errors
            </div>
          )}
        </div>

        <div className="header-right">
          {/* FR: Toggle vues */}
          {/* EN: Toggle views */}
          <div className="view-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
              title="Graph view"
              aria-label="Show graph view"
            >
              <EyeOff size={16} />
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
              aria-label="Show list view"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* FR: Bouton créer tag */}
          {/* EN: Create tag button */}
          <button
            type="button"
            className="create-tag-btn"
            onClick={() => {
              setShowNewTagInput(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            title="Create new tag"
            aria-label="Create new tag"
          >
            <Plus size={16} />
          </button>

          {onClose && (
            <button type="button" className="close-btn" onClick={onClose} aria-label="Close panel">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* FR: Panneau de création de tag */}
      {/* EN: Tag creation panel */}
      {showNewTagInput && (
        <div className="new-tag-input-container">
          <input
            ref={inputRef}
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTagName.trim()) {
                setShowNewTagInput(false);
              }
            }}
            placeholder="New tag name..."
            className="new-tag-input"
            maxLength={100}
          />
          <button
            type="button"
            className="create-confirm-btn"
            onClick={handleAddTag}
            disabled={!newTagName.trim()}
          >
            Create
          </button>
          <button
            type="button"
            className="create-cancel-btn"
            onClick={() => setShowNewTagInput(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* FR: Statistiques */}
      {/* EN: Statistics */}
      <div className="tag-stats">
        <span className="stat-item">
          <span className="stat-label">Tags:</span>
          <span className="stat-value">{tagCount}</span>
        </span>
      </div>

      {/* FR: Contenu principal */}
      {/* EN: Main content */}
      <div className="tag-layers-dag-content">
        {viewMode === 'graph' ? <TagGraph /> : <TagLayersPanel />}
      </div>
    </div>
  );
}

export default TagLayersPanelDAG;
