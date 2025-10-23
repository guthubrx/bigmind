/**
 * FR: Composant factorisé pour créer un tag avec sélection de parent optionnel
 * EN: Factorized component to create a tag with optional parent selection
 */

import React, { useState } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';

interface TagInputWithParentProps {
  /**
   * FR: Callback appelé lors de l'ajout d'un tag
   * EN: Callback called when adding a tag
   */
  onAddTag: (tagLabel: string, parentId?: string) => void;

  /**
   * FR: Placeholder pour l'input de tag
   * EN: Placeholder for tag input
   */
  placeholder?: string;

  /**
   * FR: Afficher le sélecteur de parent
   * EN: Show parent selector
   */
  showParentSelector?: boolean;

  /**
   * FR: Style inline pour le conteneur
   * EN: Inline style for container
   */
  style?: React.CSSProperties;
}

export function TagInputWithParent({
  onAddTag,
  placeholder = 'Ajouter un tag...',
  showParentSelector = true,
  style,
}: TagInputWithParentProps) {
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagParent, setNewTagParent] = useState<string | null>(null);
  const { tags } = useTagGraph();

  const handleAddTag = () => {
    if (!newTagLabel.trim()) return;

    onAddTag(newTagLabel.trim(), newTagParent || undefined);
    setNewTagLabel('');
    setNewTagParent(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={newTagLabel}
          className="input"
          placeholder={placeholder}
          onChange={e => setNewTagLabel(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn"
          onClick={handleAddTag}
          disabled={!newTagLabel.trim()}
          style={{
            padding: '8px 16px',
            background: newTagLabel.trim() ? 'var(--accent-color)' : '#e2e8f0',
            color: newTagLabel.trim() ? '#fff' : '#94a3b8',
            border: 'none',
            borderRadius: 6,
            cursor: newTagLabel.trim() ? 'pointer' : 'not-allowed',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Ajouter
        </button>
      </div>

      {showParentSelector && tags.length > 0 && (
        <select
          value={newTagParent || ''}
          onChange={e => setNewTagParent(e.target.value || null)}
          className="input"
          style={{
            fontSize: 12,
            padding: '6px 8px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#374151',
          }}
        >
          <option value="">Sans parent</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
