import React, { useEffect, useRef } from 'react';

interface NodeContextMenuProps {
  _nodeId?: string;
  x: number;
  y: number;
  onClose: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

function NodeContextMenu({
  _nodeId,
  x,
  y,
  onClose,
  onCollapse,
  onExpand,
  onDelete,
  onCopy,
  onPaste,
}: NodeContextMenuProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const nodeId = _nodeId;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '180px',
      }}
    >
      {onCollapse && (
        <button
          type="button"
          onClick={() => {
            onCollapse();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Collapse
        </button>
      )}
      {onExpand && (
        <button
          type="button"
          onClick={() => {
            onExpand();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Expand
        </button>
      )}
      {onCopy && (
        <button
          type="button"
          onClick={() => {
            onCopy();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Copy
        </button>
      )}
      {onPaste && (
        <button
          type="button"
          onClick={() => {
            onPaste();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Paste
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => {
            onDelete();
            onClose();
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#dc2626',
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default NodeContextMenu;
