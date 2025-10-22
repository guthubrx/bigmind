/**
 * FR: Composant de test pour vérifier la synchronisation des tags
 * EN: Test component to verify tag synchronization
 */

import React, { useState } from 'react';
import { useMindMapStore } from '../hooks/useMindmap';
import { useTagGraph } from '../hooks/useTagGraph';
import { Tag, Plus } from 'lucide-react';

export function QuickTagTest() {
  const mindMap = useMindMapStore();
  const { tags } = useTagGraph();
  const [newTagName, setNewTagName] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  // Obtenir le premier nœud disponible pour le test
  const firstNode = mindMap.mindMap?.nodes
    ? Object.values(mindMap.mindMap.nodes)[0]
    : null;

  const handleAddTag = () => {
    if (!newTagName || !firstNode) return;

    console.log('🏷️ Ajout du tag:', newTagName, 'au nœud:', firstNode.id);
    mindMap.actions.addTagToNode(firstNode.id, newTagName.toLowerCase().replace(/\s+/g, '-'));
    setNewTagName('');
  };

  if (!mindMap.mindMap) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      width: '250px'
    }}>
      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
        🧪 Test de synchronisation
      </div>

      {firstNode && (
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
          Nœud test: <strong>{firstNode.title}</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="Nouveau tag..."
          style={{
            flex: 1,
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
        />
        <button
          type="button"
          onClick={handleAddTag}
          style={{
            padding: '4px 8px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#64748b' }}>
        Tags dans le DAG: <strong>{tags.length}</strong>
      </div>

      {firstNode?.tags && firstNode.tags.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          Tags du nœud:
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
            {firstNode.tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '2px 6px',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  borderRadius: '8px',
                  fontSize: '10px',
                  color: '#2563eb'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickTagTest;