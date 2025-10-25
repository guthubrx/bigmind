/**
 * FR: Menu contextuel pour les actions rapides sur les tags
 * EN: Context menu for quick tag actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, Copy as Duplicate, Eye, EyeOff, Edit } from 'lucide-react';
import { useTagGraph } from '../hooks/useTagGraph';
import { DagTag } from '../types/dag';
import './TagContextMenu.css';

interface TagContextMenuProps {
  tag: DagTag;
  position: { x: number; y: number };
  onClose: () => void;
  onDuplicate: (tag: DagTag) => void;
  onColorChange?: (tagId: string, color: string) => void;
  onRename?: (tagId: string, newLabel: string) => void;
}

function TagContextMenu({
  tag,
  position,
  onClose,
  onDuplicate,
  onColorChange,
  onRename,
}: TagContextMenuProps) {
  const removeTag = useTagGraph(state => state.removeTag);
  const isTagHidden = useTagGraph(state => state.isTagHidden);
  const toggleTagVisibility = useTagGraph(state => state.toggleTagVisibility);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(tag.label);
  const hidden = isTagHidden(tag.id);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDuplicate = () => {
    onDuplicate(tag);
    onClose();
  };

  const handleDelete = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete tag "${tag.label}"? This cannot be undone.`)) {
      removeTag(tag.id);
      onClose();
    }
  };

  const handleCopyLabel = () => {
    navigator.clipboard.writeText(tag.label);
    onClose();
  };

  const handleToggleVisibility = () => {
    toggleTagVisibility(tag.id);
    onClose();
  };

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== tag.label && onRename) {
      onRename(tag.id, renameValue.trim());
      setIsRenaming(false);
    }
    onClose();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onColorChange) {
      onColorChange(tag.id, e.target.value);
    }
  };

  return (
    <div
      ref={menuRef}
      className="tag-context-menu"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="tag-context-header">
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                onClose();
              }
            }}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="rename-input"
          />
        ) : (
          <span className="tag-name">{tag.label}</span>
        )}
      </div>

      <div className="tag-context-divider" />

      <button type="button" className="context-menu-item" onClick={() => setIsRenaming(true)}>
        <Edit size={14} />
        <span>Rename</span>
      </button>

      <button type="button" className="context-menu-item" onClick={handleCopyLabel}>
        <Copy size={14} />
        <span>Copy name</span>
      </button>

      <button type="button" className="context-menu-item" onClick={handleDuplicate}>
        <Duplicate size={14} />
        <span>Duplicate</span>
      </button>

      <button type="button" className="context-menu-item" onClick={handleToggleVisibility}>
        {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
        <span>{hidden ? 'Show' : 'Hide'}</span>
      </button>

      <div className="context-menu-item color-picker-item">
        <input
          type="color"
          value={tag.color || '#3b82f6'}
          onChange={handleColorChange}
          className="color-picker-input"
        />
        <span>Change color</span>
      </div>

      <div className="tag-context-divider" />

      <button type="button" className="context-menu-item delete-item" onClick={handleDelete}>
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
}

export default TagContextMenu;
