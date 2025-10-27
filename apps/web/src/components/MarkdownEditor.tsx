/**
 * FR: Éditeur markdown WYSIWYG
 * EN: WYSIWYG markdown editor
 */

import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

function MarkdownEditor({ value, onChange, placeholder = 'Ajouter des notes...', height = 200 }: MarkdownEditorProps) {
  return (
    <div className="markdown-editor-wrapper" data-color-mode="light">
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height={height}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
        }}
        previewOptions={{
          style: {
            padding: '12px',
          },
        }}
      />
    </div>
  );
}

export default MarkdownEditor;
