/**
 * FR: Panneau de calques de tags avec vue DAG et vue liste
 * EN: Tag layers panel with DAG view and list view
 */

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Tag,
  Network,
  List,
  Plus,
  Search,
  X,
  FileWarning
} from 'lucide-react';
import { useTagGraph } from '../hooks/useTagGraph';
import { TagGraph } from './TagGraph';
import { DagTag, TagRelationType } from '../types/dag';
import { useMindMapStore } from '../hooks/useMindmap';
import './TagLayersPanel.css';

export function TagLayersPanelDAG() {
  const mindMap = useMindMapStore();
  const {
    tags,
    selectedTagId,
    graphView,
    addTag,
    deleteTag,
    selectTag,
    setGraphView,
    createRelation,
    getRootTags,
    getAncestors,
    getDescendants,
  } = useTagGraph();

  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagParent, setNewTagParent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagDetails, setShowTagDetails] = useState(false);

  // FR: Filtrer les tags selon la recherche
  // EN: Filter tags according to search
  const filteredTags = tags.filter(tag =>
    tag.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FR: Obtenir les détails d'un tag
  // EN: Get tag details
  const selectedTag = tags.find(t => t.id === selectedTagId);

  // FR: Créer un nouveau tag avec synchronisation
  // EN: Create a new tag with synchronization
  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;

    const newTag: DagTag = {
      id: newTagLabel.toLowerCase().replace(/\s+/g, '-'),
      label: newTagLabel,
      parents: newTagParent ? [newTagParent] : undefined,
      visible: true,
      nodeIds: [], // Initialisé vide
    };

    addTag(newTag); // Utilise maintenant addTagWithSync
    setNewTagLabel('');
    setNewTagParent(null);
    setShowNewTagForm(false);
  };

  // FR: Gestionnaire pour les événements du graphe avec synchronisation
  // EN: Handler for graph events with synchronization
  const handleNodeClick = (node: any) => {
    selectTag(node.id); // Utilise selectTagWithSync
    setShowTagDetails(true);
  };

  const handleNodeDoubleClick = (node: any) => {
    // FR: Ouvrir le panneau d'édition du tag
    // EN: Open tag edit panel
    selectTag(node.id);
    setShowTagDetails(true);
  };

  const handleLinkCreate = (source: string, target: string, type: TagRelationType) => {
    createRelation(source, target, type);
  };

  // FR: Rendu de la vue liste avec lignes d'arborescence
  // EN: Render list view with tree lines
  // FR: Vérifier si une carte est chargée
  // EN: Check if a map is loaded
  const isMapLoaded = mindMap.mindMap !== null;

  const renderListView = () => {
    const renderTag = (tag: DagTag, level = 0, isLast = false, parentLines: boolean[] = []) => {
      const children = tags.filter(t => t.parents?.includes(tag.id));

      return (
        <div key={tag.id} className="tag-list-item" style={{ position: 'relative' }}>
          <div
            className={`tag-row ${selectedTagId === tag.id ? 'selected' : ''}`}
            onClick={() => selectTag(tag.id)}
            style={{ paddingLeft: `${level * 24 + 20}px`, position: 'relative' }}
          >
            {/* FR: Lignes d'arborescence */}
            {/* EN: Tree lines */}
            {level > 0 && (
              <div className="tree-structure" style={{ left: 0, width: `${level * 24 + 20}px` }}>
                {/* FR: Lignes verticales continues des niveaux parents */}
                {/* EN: Continuous vertical lines from parent levels */}
                {parentLines.map((showLine, i) =>
                  showLine && i < level - 1 && (
                    <div
                      key={`v-${i}`}
                      className="tree-line tree-line-vertical"
                      style={{ left: `${i * 24 + 20}px` }}
                    />
                  )
                )}

                {/* FR: Ligne de connexion (L ou T) */}
                {/* EN: Connection line (L or T) */}
                <div
                  className={`tree-line ${isLast ? 'tree-line-corner' : 'tree-line-branch'}`}
                  style={{
                    left: `${(level - 1) * 24 + 20}px`,
                  }}
                />
              </div>
            )}

            <button
              className="visibility-btn"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle visibility
              }}
            >
              {tag.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>

            <div
              className="color-indicator"
              style={{ backgroundColor: tag.color || '#3B82F6' }}
            />

            <span className="tag-label">{tag.label}</span>

            {/* FR: Badges pour parents, enfants et nœuds associés */}
            {/* EN: Badges for parents, children and associated nodes */}
            {tag.parents && tag.parents.length > 1 && (
              <span className="badge" title="Parents multiples">
                {tag.parents.length}P
              </span>
            )}
            {children.length > 0 && (
              <span className="badge" title="Enfants">
                {children.length}E
              </span>
            )}
            {tag.nodeIds && tag.nodeIds.length > 0 && (
              <span className="badge" title="Nœuds associés" style={{ backgroundColor: '#10b981' }}>
                {tag.nodeIds.length}N
              </span>
            )}

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteTag(tag.id);
              }}
            >
              <X size={12} />
            </button>
          </div>

          {/* FR: Rendu récursif des enfants avec état des lignes */}
          {/* EN: Recursive rendering of children with line state */}
          {children.map((child, index) => {
            const newParentLines = [...parentLines];
            // Ajouter une ligne verticale pour ce niveau si ce n'est pas le dernier élément
            newParentLines[level] = !isLast;
            return renderTag(
              child,
              level + 1,
              index === children.length - 1,
              newParentLines
            );
          })}
        </div>
      );
    };

    const rootTags = getRootTags();

    return (
      <div className="tags-list-view">
        {rootTags.length === 0 && filteredTags.length === 0 ? (
          <div className="empty-state">
            <Tag size={24} />
            <p>Aucun tag</p>
            <button
              className="btn-primary"
              onClick={() => setShowNewTagForm(true)}
            >
              Créer un tag
            </button>
          </div>
        ) : (
          <>
            {rootTags.map((tag, index) => renderTag(tag, 0, index === rootTags.length - 1))}
            {filteredTags.filter(t => !rootTags.includes(t) && (!t.parents || t.parents.length === 0))
              .map(tag => renderTag(tag))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="tag-layers-panel-dag">
      {/* FR: En-tête avec bascule de vue */}
      {/* EN: Header with view toggle */}
      <div className="panel-header">
        <div className="header-title">
          <Tag size={16} />
          <span>Tags & Calques</span>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${graphView === 'list' ? 'active' : ''}`}
            onClick={() => setGraphView('list')}
            title="Vue liste"
          >
            <List size={16} />
          </button>
          <button
            className={`toggle-btn ${graphView === 'graph' ? 'active' : ''}`}
            onClick={() => setGraphView('graph')}
            title="Vue graphe"
          >
            <Network size={16} />
          </button>
        </div>
      </div>

      {/* FR: Barre de recherche */}
      {/* EN: Search bar */}
      <div className="search-bar">
        <Search size={14} />
        <input
          type="text"
          placeholder="Rechercher un tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-btn"
            onClick={() => setSearchQuery('')}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* FR: Contenu principal */}
      {/* EN: Main content */}
      <div className="panel-content">
        {!isMapLoaded ? (
          <div className="empty-state">
            <FileWarning size={32} />
            <p style={{ fontWeight: 600 }}>Aucune carte chargée</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              Chargez ou créez une carte mentale pour gérer les tags
            </p>
          </div>
        ) : graphView === 'list' ? (
          renderListView()
        ) : (
          <div className="graph-container">
            <TagGraph
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onLinkCreate={handleLinkCreate}
            />
          </div>
        )}
      </div>

      {/* FR: Formulaire de création de tag */}
      {/* EN: Tag creation form */}
      {showNewTagForm && (
        <div className="modal-overlay" onClick={() => setShowNewTagForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nouveau tag</h3>
            <input
              type="text"
              placeholder="Nom du tag"
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              autoFocus
            />
            <select
              value={newTagParent || ''}
              onChange={(e) => setNewTagParent(e.target.value || null)}
            >
              <option value="">Sans parent</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.label}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowNewTagForm(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateTag}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FR: Panneau de détails du tag */}
      {/* EN: Tag details panel */}
      {showTagDetails && selectedTag && (
        <div className="tag-details-panel">
          <div className="details-header">
            <h3>{selectedTag.label}</h3>
            <button
              className="close-btn"
              onClick={() => setShowTagDetails(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <label>ID:</label>
              <span>{selectedTag.id}</span>
            </div>

            <div className="detail-row">
              <label>Parents:</label>
              <div className="tag-list">
                {selectedTag.parents?.map(parentId => {
                  const parent = tags.find(t => t.id === parentId);
                  return parent ? (
                    <span
                      key={parentId}
                      className="tag-chip"
                      onClick={() => selectTag(parentId)}
                    >
                      {parent.label}
                    </span>
                  ) : null;
                }) || <span className="empty">Aucun</span>}
              </div>
            </div>

            <div className="detail-row">
              <label>Enfants:</label>
              <div className="tag-list">
                {tags.filter(t => t.parents?.includes(selectedTag.id)).map(child => (
                  <span
                    key={child.id}
                    className="tag-chip"
                    onClick={() => selectTag(child.id)}
                  >
                    {child.label}
                  </span>
                )) || <span className="empty">Aucun</span>}
              </div>
            </div>

            <div className="detail-row">
              <label>Nœuds associés:</label>
              <span>{selectedTag.nodeIds?.length || 0}</span>
            </div>
          </div>

          <div className="details-actions">
            <button
              className="btn-danger"
              onClick={() => {
                deleteTag(selectedTag.id);
                setShowTagDetails(false);
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* FR: Bouton flottant pour ajouter un tag */}
      {/* EN: Floating button to add a tag */}
      {isMapLoaded && (
        <button
          type="button"
          className="fab"
          onClick={() => setShowNewTagForm(true)}
          title="Créer un tag"
        >
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}

export default TagLayersPanelDAG;