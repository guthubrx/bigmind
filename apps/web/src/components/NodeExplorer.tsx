/**
 * FR: Explorateur de nœuds de la carte
 * EN: Map node explorer
 */

import React, { useState, useEffect } from 'react';
import { 
  Search,
  ChevronDown,
  ChevronRight,
  Circle,
  Square,
  Triangle,
  Star,
  Heart
} from 'lucide-react';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import './NodeExplorer.css';

const NodeExplorer: React.FC = () => {
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set()); // Sera initialisé avec le nœud racine
  const setSelectedNodeId = useSelection((s) => s.setSelectedNodeId);

  // FR: Fonction pour sélectionner un nœud et déclencher l'effet de clignotement
  // EN: Function to select a node and trigger blinking effect
  const selectNode = (nodeId: string) => {
    // Sélectionner le nœud
    setSelectedNodeId(nodeId);
    
    // Déclencher un événement personnalisé pour l'effet de clignotement
    const blinkEvent = new CustomEvent('node-blink', {
      detail: { nodeId }
    });
    window.dispatchEvent(blinkEvent);
  };

  // FR: Initialiser l'expansion du nœud racine quand un fichier est ouvert
  // EN: Initialize root node expansion when a file is opened
  useEffect(() => {
    if (activeFile?.content?.rootNode?.id && !expandedNodes.has(activeFile.content.rootNode.id)) {
      setExpandedNodes(new Set([activeFile.content.rootNode.id]));
    }
  }, [activeFile?.content?.rootNode?.id, expandedNodes]);

  // FR: Auto-expandre les nœuds qui contiennent des résultats de recherche
  // EN: Auto-expand nodes that contain search results
  useEffect(() => {
    if (!searchTerm.trim() || !activeFile?.content?.nodes) {
      return;
    }

    const expandNodesWithMatches = (nodeId: string): string[] => {
      const node = activeFile.content.nodes[nodeId];
      if (!node) return [];

      const nodesToExpand: string[] = [];
      const searchLower = searchTerm.toLowerCase();
      
      // Vérifier si ce nœud correspond
      const titleMatches = node.title.toLowerCase().includes(searchLower);
      
      // Vérifier si des descendants correspondent
      const matchingDescendants: string[] = [];
      if (node.children) {
        node.children.forEach(childId => {
          const childMatches = expandNodesWithMatches(childId);
          if (childMatches.length > 0) {
            matchingDescendants.push(childId, ...childMatches);
          }
        });
      }
      
      // Si ce nœud correspond ou a des descendants qui correspondent, l'expandre
      if (titleMatches || matchingDescendants.length > 0) {
        nodesToExpand.push(nodeId, ...matchingDescendants);
      }

      return nodesToExpand;
    };

    if (activeFile.content.rootNode?.id) {
      const nodesToExpand = expandNodesWithMatches(activeFile.content.rootNode.id);
      if (nodesToExpand.length > 0) {
        setExpandedNodes(prev => new Set([...prev, ...nodesToExpand]));
      }
    }
  }, [searchTerm, activeFile?.content?.nodes, activeFile?.content?.rootNode?.id]);

  // FR: Ajouter des logs de debug
  // EN: Add debug logs
  console.log('🔍 NodeExplorer - activeFile:', activeFile);
  console.log('🔍 NodeExplorer - content:', activeFile?.content);
  console.log('🔍 NodeExplorer - rootNode:', activeFile?.content?.rootNode);

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

  // FR: Fonction pour vérifier si un nœud ou ses descendants correspondent à la recherche
  // EN: Function to check if a node or its descendants match the search
  const nodeMatchesSearch = (nodeId: string, searchTerm: string): boolean => {
    if (!activeFile?.content?.nodes || !searchTerm.trim()) {
      return true; // Afficher tous les nœuds si pas de recherche
    }
    
    const node = activeFile.content.nodes[nodeId];
    if (!node) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatches = node.title.toLowerCase().includes(searchLower);
    
    // Vérifier si un descendant correspond
    const hasMatchingDescendant = node.children?.some(childId => 
      nodeMatchesSearch(childId, searchTerm)
    ) || false;
    
    return titleMatches || hasMatchingDescendant;
  };

  const renderNode = (nodeId: string, level: number = 0) => {
    console.log('🌳 renderNode appelé avec:', nodeId, 'level:', level);
    if (!activeFile?.content?.nodes) {
      console.log('❌ Pas de nodes dans activeFile.content');
      return null;
    }
    
    const node = activeFile.content.nodes[nodeId];
    if (!node) {
      console.log('❌ Nœud non trouvé:', nodeId);
      return null;
    }

    console.log('✅ Nœud trouvé:', node.title, 'children:', node.children);

    // FR: Vérifier si le nœud correspond à la recherche
    // EN: Check if node matches search
    if (!nodeMatchesSearch(nodeId, searchTerm)) {
      return null;
    }

    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const IconComponent = getNodeIcon(nodeId);
    
    // FR: Vérifier si ce nœud correspond à la recherche
    // EN: Check if this node matches the search
    const searchLower = searchTerm.toLowerCase();
    const nodeMatchesSearchDirectly = node.title.toLowerCase().includes(searchLower);
    
    // FR: Vérifier si ce nœud a des descendants qui correspondent
    // EN: Check if this node has descendants that match
    const hasMatchingDescendants = node.children?.some(childId => {
      const childNode = activeFile?.content?.nodes?.[childId];
      return childNode && childNode.title.toLowerCase().includes(searchLower);
    }) || false;

    console.log('🔍 État d\'expansion:', isExpanded, 'hasChildren:', hasChildren);

    return (
      <div key={nodeId} className="node-item">
        <div
          className={`node-row ${nodeMatchesSearchDirectly ? 'search-match' : ''} ${hasMatchingDescendants && !nodeMatchesSearchDirectly ? 'search-parent' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            // FR: Sélectionner le nœud et déclencher l'effet de clignotement
            // EN: Select the node and trigger blinking effect
            console.log('Sélectionner nœud:', node.title);
            selectNode(nodeId);
          }}
        >
          {/* FR: Icône d'expansion */}
          {/* EN: Expansion icon */}
          {hasChildren ? (
            <button
              className="expand-button"
              onClick={(e) => {
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
          
          {/* FR: Indicateur du nombre de sous-nœuds */}
          {/* EN: Sub-nodes count indicator */}
          {hasChildren && (
            <span className="node-count-indicator">
              {node.children.length}
            </span>
          )}
        </div>

            {/* FR: Enfants du nœud */}
            {/* EN: Node children */}
            {hasChildren && isExpanded && (
              <div className="node-children">
                {node.children.map((childId: string) => {
                  console.log('🌳 Rendu enfant:', childId);
                  return renderNode(childId, level + 1);
                })}
              </div>
            )}
      </div>
    );
  };

  // FR: Ajouter des logs de debug
  // EN: Add debug logs
  console.log('🔍 NodeExplorer - activeFile:', activeFile);
  console.log('🔍 NodeExplorer - content:', activeFile?.content);
  console.log('🔍 NodeExplorer - rootNode:', activeFile?.content?.rootNode);

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm.trim() && (
            <div className="search-results-indicator">
              {(() => {
                // Compter le nombre de nœuds visibles
                const countVisibleNodes = (nodeId: string): number => {
                  if (!nodeMatchesSearch(nodeId, searchTerm)) return 0;
                  
                  const node = activeFile?.content?.nodes?.[nodeId];
                  if (!node) return 0;
                  
                  let count = 1; // Ce nœud est visible
                  
                  if (node.children) {
                    count += node.children.reduce((sum, childId) => 
                      sum + countVisibleNodes(childId), 0
                    );
                  }
                  
                  return count;
                };
                
                const visibleCount = activeFile?.content?.rootNode?.id ? 
                  countVisibleNodes(activeFile.content.rootNode.id) : 0;
                
                return `${visibleCount} résultat${visibleCount > 1 ? 's' : ''}`;
              })()}
            </div>
          )}
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
