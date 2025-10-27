/**
 * FR: Explorateur de nœuds de la carte
 * EN: Map node explorer
 */

import React, { useState, useCallback } from 'react';
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

// FR: Composant NodeItem memoïzé pour optimiser le rendu récursif
// EN: Memoized NodeItem component to optimize recursive rendering
interface NodeItemProps {
  nodeId: string;
  level: number;
  node: any;
  hasChildren: boolean;
  isExpanded: boolean;
  IconComponent: React.ComponentType<any>;
  onToggleExpansion: (nodeId: string) => void;
  renderChildren: () => React.ReactNode;
}

const NodeItem = React.memo<NodeItemProps>(
  ({
    nodeId,
    level,
    node,
    hasChildren,
    isExpanded,
    IconComponent,
    onToggleExpansion,
    renderChildren,
  }) => (
    <div key={nodeId} className="node-item">
      <div
        className="node-row"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          // FR: Sélectionner le nœud (à implémenter)
          // EN: Select the node (to implement)
        }}
        onKeyPress={() => {
          // FR: Sélectionner le nœud avec clavier
          // EN: Select the node with keyboard
        }}
        role="button"
        tabIndex={0}
      >
        {hasChildren ? (
          <button
            type="button"
            className="expand-button"
            onClick={e => {
              e.stopPropagation();
              onToggleExpansion(nodeId);
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

        <IconComponent className="icon-small node-icon" />
        <span className="node-title">{node.title}</span>
      </div>

      {hasChildren && isExpanded && <div className="node-children">{renderChildren()}</div>}
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.nodeId === nextProps.nodeId &&
    prevProps.level === nextProps.level &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.node.title === nextProps.node.title &&
    prevProps.hasChildren === nextProps.hasChildren
);

function NodeExplorer() {
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive) || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root'])); // Étendre le nœud racine par défaut

  // FR: Memoïzer toggleNodeExpansion pour éviter de recréer renderNode
  // EN: Memoize toggleNodeExpansion to avoid recreating renderNode
  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  // FR: Memoïzer getNodeIcon pour éviter les recalculs
  // EN: Memoize getNodeIcon to avoid recalculations
  const getNodeIcon = useCallback((nodeId: string) => {
    const icons = [Circle, Square, Triangle, Star, Heart];
    const index = nodeId.length % icons.length;
    return icons[index];
  }, []);

  // FR: Fonction de rendu optimisée avec composant memoïzé
  // EN: Optimized render function with memoized component
  const renderNode = useCallback(
    (nodeId: string, level: number = 0): React.ReactNode => {
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
        <NodeItem
          key={nodeId}
          nodeId={nodeId}
          level={level}
          node={node}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          IconComponent={IconComponent}
          onToggleExpansion={toggleNodeExpansion}
          renderChildren={() =>
            node.children?.map((childId: string) => renderNode(childId, level + 1)) || []
          }
        />
      );
    },
    [activeFile, expandedNodes, getNodeIcon, toggleNodeExpansion]
  );

  if (!activeFile) {
    return (
      <div className="node-explorer">
        <div className="panel-header">
          <span>Explorateur de nœuds</span>
        </div>
        <div className="panel-content">
          <div className="no-file-message">
            <p>Aucun fichier ouvert</p>
            <p>Ouvrez un fichier .mm ou .xmind pour voir l&apos;arborescence</p>
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
}

export default NodeExplorer;
