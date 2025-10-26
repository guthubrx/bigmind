/**
 * FR: Barre latérale de BigMind
 * EN: BigMind sidebar
 */

import React, { useState } from 'react';
import { FileText, Palette, Layers, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';

const Sidebar: React.FC = () => {
  const { mindMap, selection } = useMindmap();
  const [activeTab, setActiveTab] = useState<'outline' | 'styles' | 'layers'>('outline');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // FR: Basculer l'expansion d'un nœud
  // EN: Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // FR: Rendu récursif des nœuds
  // EN: Recursive node rendering
  const renderNode = (nodeId: string, level: number = 0) => {
    const node = mindMap?.nodes[nodeId];
    if (!node) return null;

    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children.length > 0;
    const isSelected = selection.selectedNodes.includes(nodeId);

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`
            flex items-center py-1 px-2 rounded cursor-pointer
            ${isSelected ? 'bg-accent-100 text-accent-900' : 'hover:bg-gray-100'}
            ${level > 0 ? 'ml-4' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            // FR: Sélectionner le nœud
            // EN: Select the node
            // TODO: Implémenter la sélection
          }}
        >
          {/* FR: Icône d'expansion */}
          {/* EN: Expansion icon */}
          {hasChildren ? (
            <button
              onClick={e => {
                e.stopPropagation();
                toggleNodeExpansion(nodeId);
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4 mr-1" />
          )}

          {/* FR: Titre du nœud */}
          {/* EN: Node title */}
          <span className="text-sm truncate flex-1">{node.title}</span>

          {/* FR: Indicateur de sélection */}
          {/* EN: Selection indicator */}
          {isSelected && <div className="w-2 h-2 bg-accent-500 rounded-full ml-2" />}
        </div>

        {/* FR: Enfants du nœud */}
        {/* EN: Node children */}
        {hasChildren && isExpanded && (
          <div>{node.children.map(childId => renderNode(childId, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="sidebar">
      {/* FR: En-tête de la barre latérale */}
      {/* EN: Sidebar header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {mindMap?.meta.name || 'Carte mentale'}
        </h2>
        <p className="text-sm text-foreground-tertiary">
          {Object.keys(mindMap?.nodes || {}).length} nœuds
        </p>
      </div>

      {/* FR: Onglets */}
      {/* EN: Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('outline')}
          className={`
            flex-1 px-4 py-2 text-sm font-medium
            ${
              activeTab === 'outline'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-foreground-tertiary hover:text-foreground'
            }
          `}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Plan
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`
            flex-1 px-4 py-2 text-sm font-medium
            ${
              activeTab === 'styles'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-foreground-tertiary hover:text-foreground'
            }
          `}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Styles
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`
            flex-1 px-4 py-2 text-sm font-medium
            ${
              activeTab === 'layers'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-foreground-tertiary hover:text-foreground'
            }
          `}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Calques
        </button>
      </div>

      {/* FR: Contenu des onglets */}
      {/* EN: Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'outline' && (
          <div className="p-4">
            {/* FR: Barre de recherche */}
            {/* EN: Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
              <input
                type="text"
                placeholder="Rechercher dans la carte..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>

            {/* FR: Liste des nœuds */}
            {/* EN: Node list */}
            <div className="space-y-1">{mindMap && renderNode(mindMap.rootId)}</div>
          </div>
        )}

        {activeTab === 'styles' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Styles de nœuds</h3>

            {/* FR: TODO: Implémenter les styles */}
            {/* EN: TODO: Implement styles */}
            <div className="text-sm text-foreground-tertiary">Styles à implémenter</div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Calques</h3>

            {/* FR: TODO: Implémenter les calques */}
            {/* EN: TODO: Implement layers */}
            <div className="text-sm text-foreground-tertiary">Calques à implémenter</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
