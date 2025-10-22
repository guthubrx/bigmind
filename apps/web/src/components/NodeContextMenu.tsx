/**
 * FR: Menu contextuel pour les nœuds
 * EN: Context menu for nodes
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Clipboard,
  MoreHorizontal,
  GitBranch,
  Tag,
  Plus,
  Minus
} from 'lucide-react';

interface NodeContextMenuProps {
  nodeId: string;
  isCollapsed: boolean;
  hasChildren: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onToggleCollapse: (nodeId: string) => void;
  onToggleCollapseSiblings: (nodeId: string) => void;
  onToggleCollapseGeneration: (nodeId: string) => void;
  onExpand: (nodeId: string) => void;
  onExpandSiblings: (nodeId: string) => void;
  onExpandGeneration: (nodeId: string) => void;
  onCopy: (nodeId: string) => void;
  onPaste: (nodeId: string) => void;
  canPaste: boolean;
  // FR: Gestion des tags
  // EN: Tag management
  nodeTags?: string[];
  allTags?: string[];
  onAddTag: (nodeId: string, tag: string) => void;
  onRemoveTag: (nodeId: string, tag: string) => void;
}

function NodeContextMenu({
  nodeId,
  isCollapsed,
  hasChildren,
  position,
  onClose,
  onToggleCollapse,
  onToggleCollapseSiblings,
  onToggleCollapseGeneration,
  onExpand,
  onExpandSiblings,
  onExpandGeneration,
  onCopy,
  onPaste,
  canPaste,
  // FR: Gestion des tags
  // EN: Tag management
  nodeTags = [],
  allTags = [],
  onAddTag,
  onRemoveTag
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleToggleCollapse = () => {
    onToggleCollapse(nodeId);
    onClose();
  };

  const handleToggleCollapseSiblings = () => {
    onToggleCollapseSiblings(nodeId);
    onClose();
  };

  const handleToggleCollapseGeneration = () => {
    onToggleCollapseGeneration(nodeId);
    onClose();
  };

  const handleExpand = () => {
    onExpand(nodeId);
    onClose();
  };

  const handleExpandSiblings = () => {
    onExpandSiblings(nodeId);
    onClose();
  };

  const handleExpandGeneration = () => {
    onExpandGeneration(nodeId);
    onClose();
  };

  const handleCopy = () => {
    onCopy(nodeId);
    onClose();
  };

  const handlePaste = () => {
    onPaste(nodeId);
    onClose();
  };

  // FR: Gestion des tags
  // EN: Tag management
  const handleAddTag = (tag: string) => {
    onAddTag(nodeId, tag);
    // FR: Ne pas fermer le menu pour permettre d'ajouter d'autres tags
    // EN: Don't close menu to allow adding more tags
  };

  const handleRemoveTag = (tag: string) => {
    onRemoveTag(nodeId, tag);
    // FR: Ne pas fermer le menu pour permettre de gérer d'autres tags
    // EN: Don't close menu to allow managing more tags
  };

  return (
    <div
      ref={menuRef}
      className="node-context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: 4,
        minWidth: 200,
        fontSize: 14
      }}
    >
      {/* FR: Replier/Déplier le nœud */}
      {/* EN: Collapse/Expand node */}
      <button
        type="button"
        onClick={hasChildren ? handleToggleCollapse : undefined}
        disabled={!hasChildren}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: hasChildren ? 'pointer' : 'not-allowed',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: hasChildren ? '#374151' : '#9ca3af'
        }}
        onMouseEnter={(e) => {
          if (hasChildren) {
            e.currentTarget.style.background = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {isCollapsed ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronUp size={16} />
        )}
        {isCollapsed ? 'Déplier' : 'Replier'}
      </button>

      {/* FR: Replier/Déplier la fratrie */}
      {/* EN: Collapse/Expand siblings */}
      <button
        type="button"
        onClick={hasChildren ? handleToggleCollapseSiblings : undefined}
        disabled={!hasChildren}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: hasChildren ? 'pointer' : 'not-allowed',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: hasChildren ? '#374151' : '#9ca3af'
        }}
        onMouseEnter={(e) => {
          if (hasChildren) {
            e.currentTarget.style.background = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <MoreHorizontal size={16} />
        {isCollapsed ? 'Déplier fratrie' : 'Replier fratrie'}
      </button>

      {/* FR: Replier toute la génération */}
      {/* EN: Collapse entire generation */}
      <button
        type="button"
        onClick={handleToggleCollapseGeneration}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: '#374151'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <GitBranch size={16} />
        Replier génération
      </button>

      {/* FR: Séparateur */}
      {/* EN: Separator */}
      <div style={{
        height: 1,
        background: '#e2e8f0',
        margin: '4px 0'
      }} />

      {/* FR: Déplier le nœud */}
      {/* EN: Expand node */}
      <button
        type="button"
        onClick={handleExpand}
        disabled={!hasChildren}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: hasChildren ? 'pointer' : 'not-allowed',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: hasChildren ? '#374151' : '#9ca3af'
        }}
        onMouseEnter={(e) => {
          if (hasChildren) {
            e.currentTarget.style.background = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ChevronDown size={16} />
        Déplier
      </button>

      {/* FR: Déplier la fratrie */}
      {/* EN: Expand siblings */}
      <button
        type="button"
        onClick={handleExpandSiblings}
        disabled={!hasChildren}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: hasChildren ? 'pointer' : 'not-allowed',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: hasChildren ? '#374151' : '#9ca3af'
        }}
        onMouseEnter={(e) => {
          if (hasChildren) {
            e.currentTarget.style.background = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <MoreHorizontal size={16} />
        Déplier fratrie
      </button>

      {/* FR: Déplier toute la génération */}
      {/* EN: Expand entire generation */}
      <button
        type="button"
        onClick={handleExpandGeneration}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: '#374151'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <GitBranch size={16} />
        Déplier génération
      </button>

      {/* FR: Séparateur */}
      {/* EN: Separator */}
      <div style={{
        height: 1,
        background: '#e2e8f0',
        margin: '4px 0'
      }} />

      {/* FR: Copier */}
      {/* EN: Copy */}
      <button
        type="button"
        onClick={handleCopy}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: '#374151'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Copy size={16} />
        Copier
      </button>

      {/* FR: Coller */}
      {/* EN: Paste */}
      <button
        type="button"
        onClick={canPaste ? handlePaste : undefined}
        disabled={!canPaste}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: canPaste ? 'pointer' : 'not-allowed',
          borderRadius: 4,
          textAlign: 'left',
          fontSize: 14,
          color: canPaste ? '#374151' : '#9ca3af'
        }}
        onMouseEnter={(e) => {
          if (canPaste) {
            e.currentTarget.style.background = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Clipboard size={16} />
        Coller
      </button>

      {/* FR: Séparateur */}
      {/* EN: Separator */}
      <div style={{
        height: 1,
        background: '#e2e8f0',
        margin: '4px 0'
      }} />

      {/* FR: Gestion des tags */}
      {/* EN: Tag management */}
      <div style={{
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 600,
        color: '#64748b',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: 4
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={14} />
          Tags
        </div>
      </div>

      {/* FR: Tags actuels du nœud */}
      {/* EN: Current node tags */}
      {nodeTags.length > 0 && (
        <>
          <div style={{
            padding: '4px 12px',
            fontSize: 11,
            color: '#64748b',
            fontWeight: 500
          }}>
            Tags actuels:
          </div>
          {nodeTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleRemoveTag(tag)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: 4,
                textAlign: 'left',
                fontSize: 13,
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={14} style={{ color: '#dc2626' }} />
                <span>{tag}</span>
              </div>
              <Minus size={14} style={{ color: '#dc2626' }} />
            </button>
          ))}
        </>
      )}

      {/* FR: Ajouter un tag existant */}
      {/* EN: Add an existing tag */}
      {allTags.length > 0 && allTags.filter(tag => !nodeTags.includes(tag)).length > 0 && (
        <>
          <div style={{
            padding: '4px 12px',
            fontSize: 11,
            color: '#64748b',
            fontWeight: 500,
            marginTop: nodeTags.length > 0 ? 8 : 0
          }}>
            Ajouter un tag:
          </div>
          {allTags
            .filter(tag => !nodeTags.includes(tag))
            .map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 4,
                  textAlign: 'left',
                  fontSize: 13,
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={14} style={{ color: '#0ea5e9' }} />
                  <span>{tag}</span>
                </div>
                <Plus size={14} style={{ color: '#0ea5e9' }} />
              </button>
            ))}
        </>
      )}

      {/* FR: Champ de saisie pour créer un nouveau tag (toujours visible) */}
      {/* EN: Input field to create a new tag (always visible) */}
      <div style={{
        padding: '4px 12px',
        fontSize: 11,
        color: '#64748b',
        fontWeight: 500,
        marginTop: (nodeTags.length > 0 || allTags.length > 0) ? 8 : 0
      }}>
        {allTags.length === 0 ? 'Ajouter un tag:' : 'Créer un nouveau tag:'}
      </div>
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '0 8px 8px 8px'
      }}>
        <input
          type="text"
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTagInput.trim()) {
              handleAddTag(newTagInput.trim());
              setNewTagInput('');
            } else if (e.key === 'Escape') {
              setNewTagInput('');
            }
          }}
          placeholder="Nom du tag..."
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            fontSize: 13,
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0ea5e9';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (newTagInput.trim()) {
              handleAddTag(newTagInput.trim());
              setNewTagInput('');
            }
          }}
          disabled={!newTagInput.trim()}
          style={{
            padding: '6px 12px',
            border: 'none',
            background: newTagInput.trim() ? '#0ea5e9' : '#e2e8f0',
            color: newTagInput.trim() ? '#fff' : '#94a3b8',
            cursor: newTagInput.trim() ? 'pointer' : 'not-allowed',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default NodeContextMenu;
