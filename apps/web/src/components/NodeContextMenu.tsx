/**
 * FR: Menu contextuel pour les nœuds
 * EN: Context menu for nodes
 */

import React, { useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Clipboard,
  MoreHorizontal,
  GitBranch
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
  canPaste
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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
    </div>
  );
}

export default NodeContextMenu;
