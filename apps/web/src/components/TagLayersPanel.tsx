/**
 * FR: Panneau de calques de tags avec arborescence des nœuds (style Photoshop)
 * EN: Tag layers panel with node tree (Photoshop style)
 */

import React, { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  Tag,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  FileText,
  Layers as LayersIcon
} from 'lucide-react';
import { useTagLayers } from '../hooks/useTagLayers';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import './TagLayersPanel.css';

function TagLayersPanel() {
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive));
  const renameTagInAllNodes = useOpenFiles(state => state.renameTagInAllNodes);
  const updateNodeTags = useOpenFiles(state => state.updateNodeTags);
  const setSelectedNodeId = useSelection(s => s.setSelectedNodeId);
  const setSelectedNodeIds = useSelection(s => s.setSelectedNodeIds);
  const {
    layers,
    nodeVisibility,
    toggleLayerVisibility,
    toggleNodeVisibility,
    setLayerColor,
    setLayerOpacity,
    showOnlyLayer,
    showAllLayers,
    hideAllLayers,
    initializeLayer,
    moveTagToParent,
    addTagToGroupNodes
  } = useTagLayers();

  // FR: Menu contextuel pour l'opacité
  // EN: Context menu for opacity
  const [contextMenu, setContextMenu] = useState<{
    tag: string;
    x: number;
    y: number;
  } | null>(null);

  const [opacitySlider, setOpacitySlider] = useState<{
    tag: string;
    opacity: number;
  } | null>(null);

  // FR: Tags et groupes avec enfants pour l'arborescence
  // EN: Tags and groups with children for tree structure
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  // FR: État pour le drag & drop
  // EN: State for drag & drop
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [dragOverTag, setDragOverTag] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<{ tag: string; position: 'before' | 'after' | 'inside' } | null>(null);

  // FR: État pour forcer le recalcul de l'arborescence
  // EN: State to force tree recalculation
  const [treeVersion, setTreeVersion] = useState(0);

  // FR: Fonction pour sélectionner un nœud et le centrer
  // EN: Function to select a node and center it
  const selectNode = (nodeId: string) => {
    // Sélectionner le nœud
    setSelectedNodeId(nodeId);

    // Déclencher un événement personnalisé pour le focus avec zoom
    const focusEvent = new CustomEvent('node-focus', {
      detail: { nodeId },
    });
    window.dispatchEvent(focusEvent);
  };

  // FR: Fonction pour sélectionner tous les nœuds d'un groupe (incluant les sous-groupes)
  // EN: Function to select all nodes in a group (including subgroups)
  const selectGroup = (tag: string) => {
    if (!activeFile?.content?.nodes) return;

    const getAllNodesForTag = (currentTag: string): string[] => {
      const nodes: string[] = [];

      // FR: Trouver tous les nœuds qui ont ce tag comme tag le plus spécifique
      // EN: Find all nodes that have this tag as their most specific tag
      Object.entries(activeFile.content.nodes).forEach(([nodeId, node]: [string, any]) => {
        if (node.tags && Array.isArray(node.tags) && node.tags.length > 0) {
          // FR: Trier les tags par spécificité (les plus longs d'abord)
          // EN: Sort tags by specificity (longest first)
          const sortedTags = [...node.tags].sort((a, b) => b.length - a.length);

          // FR: Trouver le tag le plus spécifique pour ce nœud
          // EN: Find the most specific tag for this node
          let mostSpecificTag: string | null = null;

          for (const nodeTag of sortedTags) {
            // FR: Vérifier si ce tag n'est pas un parent d'un tag plus spécifique déjà trouvé
            // EN: Check if this tag is not a parent of a more specific tag already found
            if (!mostSpecificTag || !mostSpecificTag.startsWith(nodeTag + '>')) {
              mostSpecificTag = nodeTag;
              break;
            }
          }

          // FR: Compter le nœud seulement si son tag le plus spécifique est le tag actuel
          // EN: Count node only if its most specific tag is the current tag
          if (mostSpecificTag === currentTag) {
            nodes.push(nodeId);
          }
        }
      });

      // FR: Ajouter les nœuds des sous-groupes
      // EN: Add nodes from subgroups
      const childrenTags = fullHierarchy.childrenMap[currentTag];
      if (childrenTags) {
        childrenTags.forEach(childTag => {
          nodes.push(...getAllNodesForTag(childTag));
        });
      }

      return nodes;
    };

    const nodeIds = getAllNodesForTag(tag);
    if (nodeIds.length > 0) {
      setSelectedNodeIds(nodeIds);

      // FR: Centrer sur le premier nœud du groupe
      // EN: Center on the first node of the group
      const focusEvent = new CustomEvent('node-focus', {
        detail: { nodeId: nodeIds[0] },
      });
      window.dispatchEvent(focusEvent);
    }
  };

  // FR: Extraire tous les tags uniques du fichier actif et de la structure des layers
  // EN: Extract all unique tags from active file and layers structure
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();

    // FR: Ajouter les tags des nœuds
    // EN: Add tags from nodes
    if (activeFile?.content?.nodes) {
      Object.values(activeFile.content.nodes).forEach((node: any) => {
        if (node.tags && Array.isArray(node.tags)) {
          node.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
    }

    // FR: Ajouter les tags de la structure des layers (pour la hiérarchie visuelle)
    // EN: Add tags from layers structure (for visual hierarchy)
    Object.keys(layers).forEach(tag => tagsSet.add(tag));

    return Array.from(tagsSet).sort();
  }, [activeFile, layers]);

  // FR: Organiser les tags et nœuds en hiérarchie complète
  // EN: Organize tags and nodes in complete hierarchy
  const fullHierarchy = React.useMemo(() => {
    if (!activeFile?.content?.nodes) {
      return {
        rootTags: [],
        childrenMap: {},
        nodesByTag: {},
        nodesWithoutTag: []
      };
    }

    const rootTags: string[] = [];
    const childrenMap: Record<string, string[]> = {};
    const nodesByTag: Record<string, any[]> = {};
    const nodesWithoutTag: any[] = [];

    // FR: Organiser les tags en hiérarchie
    // EN: Organize tags in hierarchy
    allTags.forEach(tag => {
      if (tag.includes('>')) {
        const parts = tag.split('>');
        const parent = parts.slice(0, -1).join('>');
        if (!childrenMap[parent]) {
          childrenMap[parent] = [];
        }
        childrenMap[parent].push(tag);
      } else {
        rootTags.push(tag);
      }
    });

    // FR: Organiser les nœuds par tag
    // EN: Organize nodes by tag
    Object.values(activeFile.content.nodes).forEach((node: any) => {
      if (node.tags && Array.isArray(node.tags) && node.tags.length > 0) {
        // FR: Trier les tags par spécificité (les plus longs d'abord)
        // EN: Sort tags by specificity (longest first)
        const sortedTags = [...node.tags].sort((a, b) => b.length - a.length);

        // FR: Trouver le tag le plus spécifique pour ce nœud
        // EN: Find the most specific tag for this node
        let mostSpecificTag: string | null = null;

        for (const tag of sortedTags) {
          // FR: Vérifier si ce tag n'est pas un parent d'un tag plus spécifique déjà trouvé
          // EN: Check if this tag is not a parent of a more specific tag already found
          if (!mostSpecificTag || !mostSpecificTag.startsWith(tag + '>')) {
            mostSpecificTag = tag;
            break;
          }
        }

        if (mostSpecificTag) {
          if (!nodesByTag[mostSpecificTag]) {
            nodesByTag[mostSpecificTag] = [];
          }
          nodesByTag[mostSpecificTag].push(node);
        }
      } else {
        // FR: Nœuds sans tag vont dans Background
        // EN: Nodes without tags go to Background
        nodesWithoutTag.push(node);
      }
    });

    return { rootTags, childrenMap, nodesByTag, nodesWithoutTag };
  }, [activeFile, allTags, treeVersion]);

  // FR: Initialiser les calques pour tous les tags
  // EN: Initialize layers for all tags
  useEffect(() => {
    allTags.forEach(tag => {
      initializeLayer(tag);
    });
  }, [allTags, initializeLayer]);

  // FR: Fermer le menu contextuel au clic extérieur
  // EN: Close context menu on outside click
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setOpacitySlider(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // FR: Écouter l'événement pour ajouter un tag à un groupe de nœuds
  // EN: Listen for event to add tag to a group of nodes
  useEffect(() => {
    const handleAddTagToGroup = (event: CustomEvent<{ sourceTag: string; targetTag: string }>) => {
      const { sourceTag, targetTag } = event.detail;

      if (!activeFile?.content?.nodes) return;

      // FR: Trouver tous les nœuds qui ont le tag source
      // EN: Find all nodes that have the source tag
      const nodesToUpdate: string[] = [];
      Object.entries(activeFile.content.nodes).forEach(([nodeId, node]: [string, any]) => {
        if (node.tags && Array.isArray(node.tags) && node.tags.includes(sourceTag)) {
          nodesToUpdate.push(nodeId);
        }
      });

      // FR: Mettre à jour chaque nœud pour ajouter le tag cible
      // EN: Update each node to add the target tag
      nodesToUpdate.forEach(nodeId => {
        const node = activeFile.content.nodes[nodeId];
        const currentTags = node.tags || [];

        // FR: Ajouter le tag cible s'il n'est pas déjà présent
        // EN: Add target tag if not already present
        if (!currentTags.includes(targetTag)) {
          const newTags = [...currentTags, targetTag];
          updateNodeTags(nodeId, newTags);
        }
      });

      console.log(`✅ Tag "${targetTag}" ajouté à ${nodesToUpdate.length} nœuds du groupe "${sourceTag}"`);
    };

    // FR: Ajouter l'écouteur d'événement
    // EN: Add event listener
    const eventHandler = (e: Event) => handleAddTagToGroup(e as CustomEvent);
    window.addEventListener('bigmind:addTagToGroup', eventHandler as EventListener);

    return () => {
      window.removeEventListener('bigmind:addTagToGroup', eventHandler as EventListener);
    };
  }, [activeFile, updateNodeTags]);

  const toggleTagExpanded = (tag: string) => {
    setExpandedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  // FR: Rendu d'un nœud dans l'arbre
  // EN: Render a node in the tree
  const renderNode = (node: any, level: number) => {
    const isVisible = nodeVisibility[node.id] !== false; // Par défaut visible

    return (
      <div
        key={node.id}
        className={`node-item ${!isVisible ? 'hidden' : ''}`}
        style={{ paddingLeft: `${level * 20 + 28}px` }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          setDraggedNode(node.id);
        }}
        onDragEnd={() => {
          setDraggedNode(null);
        }}
        onClick={() => selectNode(node.id)}
        title="Cliquer pour sélectionner ce nœud"
      >
        {/* FR: Œil de visibilité pour le nœud */}
        {/* EN: Visibility eye for the node */}
        <button
          type="button"
          className="visibility-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleNodeVisibility(node.id);
          }}
          title={isVisible ? "Masquer ce nœud" : "Afficher ce nœud"}
          style={{ padding: 0, width: 16, height: 16 }}
        >
          {isVisible ? (
            <Eye className="icon-small" style={{ width: 12, height: 12 }} />
          ) : (
            <EyeOff className="icon-small" style={{ width: 12, height: 12, opacity: 0.4 }} />
          )}
        </button>
        <FileText className="icon-small" style={{ width: 12, height: 12, color: '#94a3b8' }} />
        <span className="node-name">{node.title || 'Sans titre'}</span>
      </div>
    );
  };

  // FR: Déterminer l'état visuel d'un tag en tenant compte de l'héritage parent
  // EN: Determine visual state of a tag considering parent inheritance
  const getVisualState = (tag: string) => {
    const layer = layers[tag];
    if (!layer) return { isVisible: true, isInherited: false };

    // FR: Utiliser la fonction du hook pour vérifier la visibilité avec héritage
    // EN: Use hook function to check visibility with inheritance
    const isVisible = useTagLayers.getState().isTagVisibleWithInheritance(tag);

    // FR: Déterminer si la visibilité est héritée
    // EN: Determine if visibility is inherited
    let isInherited = false;
    if (!isVisible && layer.originalVisible) {
      // FR: Le tag est masqué mais son état original est visible → héritage
      // EN: Tag is hidden but its original state is visible → inheritance
      isInherited = true;
    }

    return { isVisible, isInherited };
  };

  const renderTag = (tag: string, level = 0) => {
    // FR: S'assurer que le layer est initialisé
    // EN: Ensure the layer is initialized
    if (!layers[tag]) {
      initializeLayer(tag);
    }
    const layer = layers[tag];
    if (!layer) return null;

    const hasChildren = fullHierarchy.childrenMap[tag]?.length > 0;
    const hasNodes = fullHierarchy.nodesByTag[tag]?.length > 0;
    const hasContent = hasChildren || hasNodes;
    const isExpanded = expandedTags.has(tag);
    const displayName = layer.parent ? tag.split('>').pop() : tag;

    // FR: Obtenir l'état visuel avec héritage
    // EN: Get visual state with inheritance
    const visualState = getVisualState(tag);

    // FR: Compter les nœuds qui ont ce tag comme tag le plus spécifique
    // EN: Count nodes that have this tag as their most specific tag
    let totalNodeCount = 0;
    if (activeFile?.content?.nodes) {
      Object.values(activeFile.content.nodes).forEach((node: any) => {
        if (node.tags && Array.isArray(node.tags) && node.tags.length > 0) {
          // FR: Trier les tags par spécificité (les plus longs d'abord)
          // EN: Sort tags by specificity (longest first)
          const sortedTags = [...node.tags].sort((a, b) => b.length - a.length);

          // FR: Trouver le tag le plus spécifique pour ce nœud
          // EN: Find the most specific tag for this node
          let mostSpecificTag: string | null = null;

          for (const nodeTag of sortedTags) {
            // FR: Vérifier si ce tag n'est pas un parent d'un tag plus spécifique déjà trouvé
            // EN: Check if this tag is not a parent of a more specific tag already found
            if (!mostSpecificTag || !mostSpecificTag.startsWith(nodeTag + '>')) {
              mostSpecificTag = nodeTag;
              break;
            }
          }

          // FR: Compter le nœud seulement si son tag le plus spécifique est le tag actuel
          // EN: Count node only if its most specific tag is the current tag
          if (mostSpecificTag === tag) {
            totalNodeCount++;
          }
        }
      });
    }

    return (
      <React.Fragment key={tag}>
        {/* FR: Indicateur de drop avant */}
        {/* EN: Drop indicator before */}
        {dropPosition?.tag === tag && dropPosition.position === 'before' && (
          <div
            className="drop-indicator"
            style={{
              paddingLeft: `${level * 20 + 8}px`,
              height: '2px',
              background: '#3b82f6',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
              margin: '1px 0'
            }}
          />
        )}

        <div
          className={`layer-item ${layer.visible ? '' : 'hidden'} ${dragOverTag === tag && dropPosition?.position === 'inside' ? 'drag-over' : ''} ${draggedTag === tag ? 'dragging' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          draggable
          onClick={() => selectGroup(tag)}
          title="Cliquer pour sélectionner tous les nœuds de ce groupe"
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            setDraggedTag(tag);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            // FR: Accepter aussi les nœuds glissés
            // EN: Also accept dragged nodes
            if ((draggedTag && draggedTag !== tag) || draggedNode) {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const height = rect.height;

              // FR: Déterminer la position de drop selon la position de la souris
              // EN: Determine drop position based on mouse position
              let position: 'before' | 'after' | 'inside';
              if (y < height * 0.25) {
                position = 'before';
              } else if (y > height * 0.75) {
                position = 'after';
              } else {
                position = 'inside';
              }

              setDragOverTag(tag);
              setDropPosition({ tag, position });
            }
          }}
          onDragLeave={() => {
            setDragOverTag(null);
            setDropPosition(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // FR: Gérer le déplacement d'un nœud vers un groupe
            // EN: Handle moving a node to a group
            if (draggedNode && activeFile?.content?.nodes) {
              const node = activeFile.content.nodes[draggedNode];
              if (node) {
                // FR: Retirer tous les anciens tags et ajouter le nouveau
                // EN: Remove all old tags and add the new one
                const oldTags = node.tags || [];
                const newTags = [tag];

                // FR: Mettre à jour les tags du nœud
                // EN: Update node tags
                updateNodeTags(draggedNode, newTags);

                // FR: Initialiser le nouveau tag si nécessaire
                // EN: Initialize new tag if necessary
                initializeLayer(tag);

                // FR: Afficher un message (optionnel)
                console.log(`Nœud "${node.title}" déplacé de [${oldTags.join(', ')}] vers [${tag}]`);
              }
            }
            // FR: Gérer le déplacement d'un tag vers un autre tag
            // EN: Handle moving a tag to another tag
            else if (draggedTag && draggedTag !== tag && dropPosition) {
              if (dropPosition.position === 'inside') {
                // FR: D'abord ajouter le tag cible aux nœuds du groupe glissé
                // EN: First add target tag to nodes in the dragged group
                addTagToGroupNodes(draggedTag, tag);

                // FR: Déplacer le tag glissé sous ce tag (comme enfant) pour créer la hiérarchie visuelle
                // EN: Move dragged tag under this tag (as child) to create visual hierarchy
                const newTag = moveTagToParent(draggedTag, tag);

                // FR: Forcer le recalcul de l'arborescence
                // EN: Force tree recalculation
                setTreeVersion(prev => prev + 1);

                // FR: Étendre le parent pour voir le nouveau sous-tag
                // EN: Expand parent to see the new sub-tag
                setExpandedTags(prev => {
                  const newExpanded = new Set(prev);
                  newExpanded.add(tag);
                  return newExpanded;
                });

                console.log(`📁 Groupe "${draggedTag}" déplacé dans "${tag}" → hiérarchie visuelle créée`);
              } else {
                // FR: Pour 'before' ou 'after', mettre au même niveau que le tag cible
                // EN: For 'before' or 'after', put at the same level as target tag
                const targetLayer = layers[tag];
                const parentTag = targetLayer?.parent || null;
                const newTag = moveTagToParent(draggedTag, parentTag);

                // FR: Forcer le recalcul de l'arborescence
                // EN: Force tree recalculation
                setTreeVersion(prev => prev + 1);

                // TODO: Implémenter l'ordre avant/après dans la liste
              }
            }

            setDraggedTag(null);
            setDraggedNode(null);
            setDragOverTag(null);
            setDropPosition(null);
          }}
          onDragEnd={() => {
            setDraggedTag(null);
            setDraggedNode(null);
            setDragOverTag(null);
            setDropPosition(null);
          }}
        >
          {/* FR: Bouton d'expansion pour les parents avec contenu */}
          {/* EN: Expand button for parents with content */}
          {hasContent ? (
            <button
              type="button"
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleTagExpanded(tag);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="icon-small" />
              ) : (
                <ChevronRight className="icon-small" />
              )}
            </button>
          ) : (
            <div style={{ width: 16 }} />
          )}

          {/* FR: Œil de visibilité (style Photoshop avec héritage) */}
          {/* EN: Visibility eye (Photoshop style with inheritance) */}
          <button
            type="button"
            className="visibility-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerVisibility(tag);
            }}
            title={visualState.isVisible ?
              "Masquer" :
              visualState.isInherited ?
                "Masqué par héritage (parent)" :
                "Afficher"
            }
          >
            {visualState.isVisible ? (
              <Eye className="icon-small" />
            ) : (
              <EyeOff
                className="icon-small"
                style={{
                  opacity: visualState.isInherited ? 0.2 : 0.4
                }}
              />
            )}
          </button>

          {/* FR: Indicateur de couleur */}
          {/* EN: Color indicator */}
          <div
            className="color-indicator"
            style={{ backgroundColor: layer.color }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = layer.color;
              input.onchange = (e) => {
                setLayerColor(tag, (e.target as HTMLInputElement).value);
              };
              input.click();
            }}
            title="Changer la couleur"
          />

          {/* FR: Nom du calque */}
          {/* EN: Layer name */}
          <span
            className="layer-name"
            onDoubleClick={() => showOnlyLayer(tag)}
            title="Double-clic pour isoler"
          >
            {displayName}
          </span>

          {/* FR: Compteur de nœuds totaux */}
          {/* EN: Total node counter */}
          {totalNodeCount > 0 && (
            <span className="node-count">{totalNodeCount}</span>
          )}

          {/* FR: Menu contextuel pour l'opacité */}
          {/* EN: Context menu for opacity */}
          <button
            type="button"
            className="more-btn"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({
                tag,
                x: e.currentTarget.getBoundingClientRect().left,
                y: e.currentTarget.getBoundingClientRect().bottom
              });
            }}
            title="Plus d'options"
          >
            <MoreVertical className="icon-small" />
          </button>
        </div>

        {/* FR: Afficher les enfants et nœuds si le parent est étendu */}
        {/* EN: Show children and nodes if parent is expanded */}
        {hasContent && isExpanded && (
          <>
            {/* FR: D'abord les sous-tags */}
            {/* EN: Sub-tags first */}
            {fullHierarchy.childrenMap[tag]?.map(childTag =>
              renderTag(childTag, level + 1)
            )}

            {/* FR: Puis les nœuds directs de ce tag */}
            {/* EN: Then direct nodes of this tag */}
            {fullHierarchy.nodesByTag[tag]?.map(node =>
              renderNode(node, level + 1)
            )}
          </>
        )}

        {/* FR: Indicateur de drop après */}
        {/* EN: Drop indicator after */}
        {dropPosition?.tag === tag && dropPosition.position === 'after' && (
          <div
            className="drop-indicator"
            style={{
              paddingLeft: `${level * 20 + 8}px`,
              height: '2px',
              background: '#3b82f6',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
              margin: '1px 0'
            }}
          />
        )}
      </React.Fragment>
    );
  };

  // FR: Rendu du groupe Background pour les nœuds sans tag
  // EN: Render Background group for nodes without tags
  const renderBackgroundGroup = () => {
    const hasNodesWithoutTag = fullHierarchy.nodesWithoutTag.length > 0;
    const isExpanded = expandedTags.has('__background__');

    if (!hasNodesWithoutTag) return null;

    return (
      <div className="background-group">
        <div
          className={`layer-item background-layer ${dragOverTag === '__background__' ? 'drag-over' : ''}`}
          style={{ paddingLeft: '8px' }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedNode) {
              setDragOverTag('__background__');
            }
          }}
          onDragLeave={() => {
            setDragOverTag(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // FR: Si un nœud est déposé dans Background, retirer tous ses tags
            // EN: If a node is dropped in Background, remove all its tags
            if (draggedNode && activeFile?.content?.nodes) {
              const node = activeFile.content.nodes[draggedNode];
              if (node && node.tags && node.tags.length > 0) {
                // FR: Retirer tous les tags du nœud
                // EN: Remove all tags from the node
                updateNodeTags(draggedNode, []);

                // FR: Afficher un message (optionnel)
                console.log(`Nœud "${node.title}" déplacé dans Background (tags retirés)`);
              }
            }

            setDraggedNode(null);
            setDragOverTag(null);
          }}
        >
          {/* FR: Bouton d'expansion */}
          {/* EN: Expand button */}
          <button
            type="button"
            className="expand-btn"
            onClick={() => toggleTagExpanded('__background__')}
          >
            {isExpanded ? (
              <ChevronDown className="icon-small" />
            ) : (
              <ChevronRight className="icon-small" />
            )}
          </button>

          {/* FR: Icône de calque */}
          {/* EN: Layer icon */}
          <LayersIcon className="icon-small" style={{ width: 14, height: 14, color: '#64748b' }} />

          {/* FR: Nom du groupe */}
          {/* EN: Group name */}
          <span className="layer-name" style={{ fontStyle: 'italic', color: '#64748b' }}>
            Background
          </span>

          {/* FR: Compteur de nœuds */}
          {/* EN: Node counter */}
          <span className="node-count">{fullHierarchy.nodesWithoutTag.length}</span>
        </div>

        {/* FR: Afficher les nœuds sans tag si étendu */}
        {/* EN: Show nodes without tags if expanded */}
        {isExpanded && (
          fullHierarchy.nodesWithoutTag.map(node =>
            renderNode(node, 1)
          )
        )}
      </div>
    );
  };

  if (!activeFile) {
    return (
      <div style={{ padding: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        Aucun fichier ouvert
      </div>
    );
  }

  return (
    <div className="tag-layers-panel">
      {/* FR: En-tête simple */}
      {/* EN: Simple header */}
      <div className="layers-header">
        <span className="header-title">
          <Tag className="icon-small" />
          Calques
        </span>
      </div>

      {/* FR: Liste des calques */}
      {/* EN: Layers list */}
      <div
        className="layers-list"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();

          if (draggedTag) {
            // FR: Déplacer le tag glissé à la racine (sans parent)
            // EN: Move dragged tag to root (no parent)
            const newTag = moveTagToParent(draggedTag, null);

            // FR: Forcer le recalcul de l'arborescence
            // EN: Force tree recalculation
            setTreeVersion(prev => prev + 1);
          }

          setDraggedTag(null);
          setDragOverTag(null);
        }}>
        {(allTags.length === 0 && fullHierarchy.nodesWithoutTag.length === 0) ? (
          <div className="no-tags">
            <Tag size={24} />
            <p>Aucun élément dans la carte</p>
            <span>Ajoutez des nœuds ou des tags</span>
          </div>
        ) : (
          <>
            {/* FR: D'abord les tags racines */}
            {/* EN: Root tags first */}
            {fullHierarchy.rootTags.map(tag => renderTag(tag))}

            {/* FR: Puis le groupe Background en bas */}
            {/* EN: Then Background group at bottom */}
            {renderBackgroundGroup()}
          </>
        )}
      </div>

      {/* FR: Actions rapides en bas */}
      {/* EN: Quick actions at bottom */}
      {allTags.length > 0 && (
        <div className="quick-actions">
          <button
            type="button"
            className="action-btn"
            onClick={showAllLayers}
            title="Tout afficher"
          >
            <Eye className="icon-small" />
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={hideAllLayers}
            title="Tout masquer"
          >
            <EyeOff className="icon-small" />
          </button>
        </div>
      )}

      {/* FR: Menu contextuel flottant pour l'opacité */}
      {/* EN: Floating context menu for opacity */}
      {contextMenu && layers[contextMenu.tag] && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#475569' }}>
            Transparence
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={layers[contextMenu.tag].opacity * 100}
              onChange={(e) => {
                setLayerOpacity(contextMenu.tag, parseInt(e.target.value) / 100);
              }}
              style={{ width: '120px' }}
            />
            <span style={{ fontSize: '11px', minWidth: '30px', color: '#64748b' }}>
              {Math.round(layers[contextMenu.tag].opacity * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TagLayersPanel;