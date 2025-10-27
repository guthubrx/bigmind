/**
 * FR: Explorateur de nœuds de la carte
 * EN: Map node explorer
 */

import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Circle,
  Square,
  Triangle,
  Star,
  Heart,
} from 'lucide-react';
import { useOpenFiles } from '../hooks/useOpenFiles';
import './NodeExplorer.css';

const NodeExplorer: React.FC = () => {
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive) || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root'])); // Étendre le nœud racine par défaut

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeIcon = (nodeId: string) => {
    // FR: Logique simple pour assigner des icônes
    // EN: Simple logic to assign icons
    const icons = [Circle, Square, Triangle, Star, Heart];
    const index = nodeId.length % icons.length;
    return icons[index];
  };

  const renderNode = (nodeId: string, level: number = 0) => {
    if (!activeFile?.content?.nodes) {
      return null;
    }

    const node = activeFile.content.nodes[nodeId];
    if (!node) {
      return null;
    }

    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const IconComponent = getNodeIcon(nodeId);

    return (
      <div key={nodeId} className="node-item">
        <div
          className="node-row"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            // FR: Sélectionner le nœud (à implémenter)
            // EN: Select the node (to implement)
          }}
        >
          {/* FR: Icône d'expansion */}
          {/* EN: Expansion icon */}
          {hasChildren ? (
            <button
              className="expand-button"
              onClick={e => {
                e.stopPropagation();
                toggleNodeExpansion(nodeId);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="icon-small" />
              ) : (
                <ChevronRight className="icon-small" />
              )}
            </button>
          ) : (
            <div className="expand-spacer" />
          )}

          {/* FR: Icône du nœud */}
          {/* EN: Node icon */}
          <IconComponent className="icon-small node-icon" />

          {/* FR: Titre du nœud */}
          {/* EN: Node title */}
          <span className="node-title">{node.title}</span>
        </div>

        {/* FR: Enfants du nœud */}
        {/* EN: Node children */}
        {hasChildren && isExpanded && (
          <div className="node-children">
            {node.children.map((childId: string) => renderNode(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!activeFile) {
    return (
      <div className="node-explorer">
        <div className="panel-header">
          <span>Explorateur de nœuds</span>
        </div>
        <div className="panel-content">
          <div className="no-file-message">
            <p>Aucun fichier ouvert</p>
            <p>Ouvrez un fichier .mm ou .xmind pour voir l'arborescence</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="node-explorer">
      <div className="panel-header">
        <span>Explorateur de nœuds</span>
        <span className="file-name-small">{activeFile.name}</span>
      </div>

      <div className="panel-content">
        {/* FR: Barre de recherche */}
        {/* EN: Search bar */}
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un nœud..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* FR: Liste des nœuds */}
        {/* EN: Node list */}
        <div className="node-list">
          {activeFile.content?.rootNode?.id && renderNode(activeFile.content.rootNode.id)}
        </div>
      </div>
    </div>
  );
};

export default NodeExplorer;
