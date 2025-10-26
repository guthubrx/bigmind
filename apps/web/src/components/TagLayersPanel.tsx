/**
 * FR: Panneau de visualisation hiérarchique des tags
 * EN: Hierarchical tag visualization panel
 */

import React, { useState, useRef, useMemo } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { useNodeTags } from '../hooks/useNodeTags';
import { DagTag, RelationType } from '../types/dag';
import { ChevronDown, ChevronRight, Trash2, Eye, EyeOff, ArrowRight, Link2, Package } from 'lucide-react';
import TagContextMenu from './TagContextMenu';
import './TagLayersPanel.css';

interface ExpandedState {
  [tagId: string]: boolean;
}

function TagTreeNode({
  tag,
  expanded,
  onToggle,
  onDelete,
  onColorChange,
  depth,
  parentId,
  expandedState,
  onToggleChild,
}: {
  tag: DagTag;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onColorChange: (tagId: string, color: string) => void;
  depth: number;
  parentId?: string;
  expandedState: ExpandedState;
  onToggleChild: (tagId: string) => void;
}) {
  const getChildren = useTagGraph((state: any) => state.getChildren);
  const getChildCount = useTagGraph((state: any) => state.getChildCount);
  const isTagHidden = useTagGraph((state: any) => state.isTagHidden);
  const toggleTagVisibility = useTagGraph((state: any) => state.toggleTagVisibility);
  const createRelation = useTagGraph((state: any) => state.createRelation);
  const addParent = useTagGraph((state: any) => state.addParent);
  const addTag = useTagGraph((state: any) => state.addTag);
  const updateTag = useTagGraph((state: any) => state.updateTag);
  const getTagNodes = useNodeTags((state: any) => state.getTagNodes);
  const getLinksBetween = useTagGraph((state: any) => state.getLinksBetween);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [dragOverTagId, setDragOverTagId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ tag: DagTag; x: number; y: number } | null>(
    null
  );
  const children = getChildren(tag.id);
  const hasChildren = children.length > 0;
  const hidden = isTagHidden(tag.id);
  const childCount = getChildCount(tag.id);
  const getDescendantCount = useTagGraph((state: any) => state.getDescendantCount);
  const descendantCount = getDescendantCount(tag.id);
  const nodeCount = useMemo(() => {
    const nodeIds = getTagNodes(tag.id);
    return nodeIds ? nodeIds.length : 0;
  }, [tag.id, getTagNodes]);
  const relationCount = tag.relations ? tag.relations.length : 0;
  const createdDate = tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : 'Unknown';
  const modifiedDate = tag.updatedAt ? new Date(tag.updatedAt).toLocaleDateString() : 'Unknown';

  // FR: Déterminer le type de relation avec le parent
  // EN: Determine relation type with parent
  const getRelationIcon = (): {
    icon: React.ReactElement;
    color: string;
    label: string;
  } | null => {
    if (!parentId) return null;

    const links = getLinksBetween(parentId, tag.id);
    if (links.length === 0) {
      // Par défaut, relation hiérarchique (IS_TYPE_OF)
      return {
        icon: <ArrowRight size={12} />,
        color: '#666',
        label: 'Hierarchical (IS_TYPE_OF)',
      };
    }

    const link = links[0];
    switch (link.type) {
      case RelationType.IS_TYPE_OF:
        return {
          icon: <ArrowRight size={12} />,
          color: '#666',
          label: 'Hierarchical (IS_TYPE_OF)',
        };
      case RelationType.IS_RELATED_TO:
        return {
          icon: <Link2 size={12} />,
          color: '#3b82f6',
          label: 'Related (IS_RELATED_TO)',
        };
      case RelationType.IS_PART_OF:
        return {
          icon: <Package size={12} />,
          color: '#22c55e',
          label: 'Part of (IS_PART_OF)',
        };
      default:
        return null;
    }
  };

  const relationIcon = getRelationIcon();

  // FR: Obtenir la classe CSS pour les lignes de connexion
  // EN: Get CSS class for connection lines
  const getRelationClass = (childId: string): string => {
    const links = getLinksBetween(tag.id, childId);
    if (links.length === 0) {
      return 'relation-is-type-of'; // Par défaut
    }

    const link = links[0];
    switch (link.type) {
      case RelationType.IS_TYPE_OF:
        return 'relation-is-type-of';
      case RelationType.IS_RELATED_TO:
        return 'relation-is-related-to';
      case RelationType.IS_PART_OF:
        return 'relation-is-part-of';
      default:
        return '';
    }
  };

  const getDetailedStats = (): string => {
    const stats = [
      `Name: ${tag.label}`,
      `Direct children: ${childCount}`,
      `All descendants: ${descendantCount}`,
      `Used in ${nodeCount} node${nodeCount !== 1 ? 's' : ''}`,
      `Relations: ${relationCount}`,
      `Created: ${createdDate}`,
      `Modified: ${modifiedDate}`,
    ];
    return stats.join('\n');
  };

  const handleColorClick = () => {
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(tag.id, e.target.value);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTagVisibility(tag.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      tag,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDuplicate = (duplicateTag: DagTag) => {
    const newTagId = `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTag: DagTag = {
      ...duplicateTag,
      id: newTagId,
      label: `${duplicateTag.label} (copy)`,
      parentIds: [],
      children: [],
      relations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addTag(newTag);
  };

  const handleRename = (tagId: string, newLabel: string) => {
    updateTag(tagId, { label: newLabel });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
    setDragOverTagId(tag.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTagId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTagId(null);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const draggedData = JSON.parse(data);
      if (draggedData.type === 'tag' && draggedData.tagId && draggedData.tagId !== tag.id) {
        // FR: Drop normal → Le tag devient fils (IS_TYPE_OF par défaut)
        // EN: Regular drop → Tag becomes child (IS_TYPE_OF by default)
        addParent(draggedData.tagId, tag.id);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <div className="tag-tree-node">
      <div className={`tag-tree-node-content ${hidden ? 'hidden' : ''}`}>
        {hasChildren && (
          <button
            type="button"
            className="tree-toggle-btn"
            onClick={onToggle}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!hasChildren && <div className="tree-toggle-spacer" />}

        {relationIcon && (
          <div
            className="relation-icon"
            style={{ color: relationIcon.color }}
            title={relationIcon.label}
          >
            {relationIcon.icon}
          </div>
        )}

        <div
          className={`tag-node-badge ${dragOverTagId === tag.id ? 'drag-over' : ''}`}
          style={{ backgroundColor: tag.color || '#3b82f6' }}
          onClick={handleColorClick}
          onContextMenu={handleContextMenu}
          draggable
          onDragStart={e => {
            e.dataTransfer!.effectAllowed = 'copy';
            e.dataTransfer!.setData(
              'application/json',
              JSON.stringify({ type: 'tag', tagId: tag.id, tagLabel: tag.label })
            );
          }}
          onDragEnd={e => {
            e.dataTransfer!.dropEffect = 'none';
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          title={getDetailedStats()}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleColorClick();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault();
              onDelete();
            } else if (e.ctrlKey && e.key === 'c') {
              e.preventDefault();
              navigator.clipboard.writeText(tag.label);
            } else if (e.ctrlKey && e.key === 'd') {
              e.preventDefault();
              handleDuplicate(tag);
            } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
              e.preventDefault();
              handleContextMenu(e as any);
            }
          }}
        >
          <div className="tag-label-with-counts">
            <span className="tag-label">{tag.label.substring(0, 20)}</span>
            {(childCount > 0 || nodeCount > 0) && (
              <div className="tag-counts">
                {childCount > 0 && (
                  <span className="count-badge count-children">{childCount}E</span>
                )}
                {nodeCount > 0 && <span className="count-badge count-nodes">{nodeCount}N</span>}
              </div>
            )}
          </div>
          <input
            ref={colorInputRef}
            type="color"
            value={tag.color || '#3b82f6'}
            onChange={handleColorChange}
            style={{ display: 'none' }}
            aria-label={`Change color for ${tag.label}`}
          />
        </div>

        <button
          type="button"
          className="tag-visibility-btn"
          onClick={handleToggleVisibility}
          title={hidden ? 'Show tag' : 'Hide tag'}
          aria-label={`${hidden ? 'Show' : 'Hide'} ${tag.label}`}
        >
          {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>

        <button
          type="button"
          className="tag-delete-btn"
          onClick={onDelete}
          title="Delete tag"
          aria-label={`Delete ${tag.label}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && children.length > 0 && (
        <div>
          {children.map((child: DagTag) => (
            <div key={child.id} className={`tag-tree-children ${getRelationClass(child.id)}`}>
              <TagTreeNode
                tag={child}
                expanded={expandedState[child.id] ?? true}
                onToggle={() => onToggleChild(child.id)}
                onDelete={() => {
                  // Will be handled by parent
                }}
                onColorChange={onColorChange}
                depth={depth + 1}
                parentId={tag.id}
                expandedState={expandedState}
                onToggleChild={onToggleChild}
              />
            </div>
          ))}
        </div>
      )}

      {contextMenu && contextMenu.tag.id === tag.id && (
        <TagContextMenu
          tag={tag}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onDuplicate={handleDuplicate}
          onColorChange={onColorChange}
          onRename={handleRename}
        />
      )}
    </div>
  );
}

function TagLayersPanel() {
  const tags = useTagGraph((state: any) => Object.values(state.tags) as DagTag[]);
  const removeTag = useTagGraph((state: any) => state.removeTag);
  const updateTag = useTagGraph((state: any) => state.updateTag);

  // FR: État d'expansion pour TOUS les tags, pas juste les racines
  // EN: Expansion state for ALL tags, not just roots
  const [expandedState, setExpandedState] = useState<ExpandedState>({});

  // FR: Mémoriser la clé des tags pour éviter les boucles infinies
  // EN: Memoize tag key to avoid infinite loops
  const tagIdsKey = React.useMemo(() => tags.map(t => t.id).sort().join(','), [tags]);

  // FR: Initialiser l'état d'expansion pour les nouveaux tags
  // EN: Initialize expansion state for new tags
  React.useEffect(() => {
    const tagIds = tagIdsKey.split(',').filter(Boolean);
    setExpandedState(prev => {
      let changed = false;
      const newState = { ...prev };

      tagIds.forEach((tagId: string) => {
        if (!(tagId in newState)) {
          newState[tagId] = true; // Par défaut: expanded
          changed = true;
        }
      });

      return changed ? newState : prev;
    });
  }, [tagIdsKey]);

  // FR: Obtenir les balises racine (sans parent)
  // EN: Get root tags (without parent)
  const rootTags = tags.filter((tag: DagTag) => !tag.parentIds || tag.parentIds.length === 0);

  const handleToggle = (tagId: string) => {
    setExpandedState(prev => ({
      ...prev,
      [tagId]: !prev[tagId],
    }));
  };

  const handleDelete = (tagId: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this tag?')) {
      removeTag(tagId);
    }
  };

  const handleColorChange = (tagId: string, color: string) => {
    updateTag(tagId, { color });
  };

  if (tags.length === 0) {
    return (
      <div className="tag-layers-empty">
        <p>Aucun tag. Créez-en un dans le panneau DAG.</p>
      </div>
    );
  }

  return (
    <div className="tag-layers-panel">
      <div className="tag-layers-header">
        <h3>Tags Hierarchy</h3>
        <span className="tag-count">{tags.length}</span>
      </div>

      <div className="tag-layers-tree">
        {rootTags.map((tag: DagTag) => (
          <TagTreeNode
            key={tag.id}
            tag={tag}
            expanded={expandedState[tag.id] ?? true}
            onToggle={() => handleToggle(tag.id)}
            onDelete={() => handleDelete(tag.id)}
            onColorChange={handleColorChange}
            depth={0}
            expandedState={expandedState}
            onToggleChild={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default TagLayersPanel;
