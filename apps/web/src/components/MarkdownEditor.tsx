/**
 * FR: Éditeur markdown avec ByteMD
 * EN: Markdown editor with ByteMD
 */

import React, { useState } from 'react';
import { Editor, Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import breaks from '@bytemd/plugin-breaks';
import { Eye, Edit3 } from 'lucide-react';

// FR: Import des styles ByteMD
// EN: Import ByteMD styles
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

// FR: Configuration des plugins
// EN: Plugin configuration
const plugins = [
  gfm(), // GitHub Flavored Markdown (tables, strikethrough, etc.)
  highlight(), // Coloration syntaxique des blocs de code
  breaks(), // Support des line breaks
];

function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Ajouter des notes...',
  height,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="bytemd-editor-wrapper" style={height ? { height: `${height}px` } : undefined}>
      {/* FR: Bouton toggle mode */}
      {/* EN: Mode toggle button */}
      <div className="bytemd-mode-toggle">
        <button
          type="button"
          className={`bytemd-mode-btn ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => setMode('edit')}
          title="Mode édition"
        >
          <Edit3 size={14} />
          <span>Éditer</span>
        </button>
        <button
          type="button"
          className={`bytemd-mode-btn ${mode === 'preview' ? 'active' : ''}`}
          onClick={() => setMode('preview')}
          title="Mode lecture"
        >
          <Eye size={14} />
          <span>Aperçu</span>
        </button>
      </div>

      {/* FR: Éditeur ou Viewer selon le mode */}
      {/* EN: Editor or Viewer based on mode */}
      <div className="bytemd-content">
        {mode === 'edit' ? (
          <Editor
            value={value}
            plugins={plugins}
            onChange={v => onChange(v)}
            placeholder={placeholder}
            mode="tab"
            locale={{
              write: 'Éditer',
              preview: 'Aperçu',
            }}
          />
        ) : (
          <div className="bytemd-viewer-container">
            <Viewer value={value} plugins={plugins} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkdownEditor;
