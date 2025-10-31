/**
 * FR: Panneau de visualisation hiérarchique des tags avec react-arborist
 * EN: Hierarchical tag visualization panel with react-arborist
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { Tree, NodeRendererProps, TreeApi } from 'react-arborist';
import { useTagStore } from '../hooks/useTagStore';
import { DagTag, RelationType } from '../../../../types/dag';
import { Trash2, Eye, EyeOff, ArrowRight, Link2, Package, ChevronRight } from 'lucide-react';
import './TagLayersPanelRCT.css';

// FR: Interface pour les données de l'arbre
// EN: Interface for tree data
interface TagTreeNode {
  id: string;
  name: string;
  children?: TagTreeNode[];
  data: DagTag;
}

function TagLayersPanelRCT() {
  const tagsObject = useTagStore(state => state.tags);
  const tags = Object.values(tagsObject);
  const rootOrder = useTagStore(state => state.rootOrder);
  const removeTag = useTagStore(state => state.removeTag);
  const isTagHidden = useTagStore(state => state.isTagHidden);
  const toggleTagVisibility = useTagStore(state => state.toggleTagVisibility);
  const addParent = useTagStore(state => state.addParent);
  const removeParent = useTagStore(state => state.removeParent);
  const reorderChildren = useTagStore(state => state.reorderChildren);
  const getLinksBetween = useTagStore(state => state.getLinksBetween);
  // FR: Sélecteur réactif pour le mapping tag→noeuds
  // EN: Reactive selector for tag→nodes mapping
  const tagNodeMap = useTagStore(state => state.tagNodeMap);

  const treeRef = useRef<TreeApi<TagTreeNode>>(null);

  // FR: Convertir les tags en structure d'arbre
  // EN: Convert tags to tree structure
  const treeData = useMemo<TagTreeNode[]>(() => {
    const buildNode = (tag: DagTag): TagTreeNode => {
      const childTags = tag.children
        .map(childId => tags.find(t => t.id === childId))
        .filter((t): t is DagTag => t !== undefined);

      return {
        id: tag.id,
        name: tag.label,
        data: tag,
        // FR: IMPORTANT: Toujours définir children (même vide) pour permettre le drop
        // EN: IMPORTANT: Always define children (even empty) to allow drop
        children: childTags.length > 0 ? childTags.map(buildNode) : [],
      };
    };

    // FR: Obtenir uniquement les tags racines (sans parent)
    // EN: Get only root tags (without parent)
    const rootTags = tags.filter(tag => !tag.parentIds || tag.parentIds.length === 0);

    // FR: Trier les tags racines selon rootOrder
    // EN: Sort root tags according to rootOrder
    const sortedRootTags = rootTags.sort((a, b) => {
      const indexA = rootOrder.indexOf(a.id);
      const indexB = rootOrder.indexOf(b.id);
      // FR: Si un tag n'est pas dans rootOrder, le mettre à la fin
      // EN: If a tag is not in rootOrder, put it at the end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return sortedRootTags.map(buildNode);
  }, [tags, rootOrder]);

  // FR: Composant de rendu personnalisé pour chaque nœud
  // EN: Custom render component for each node
  const Node = useCallback(
    ({ node, style, dragHandle }: NodeRendererProps<TagTreeNode>) => {
      const tag = node.data.data;
      const hidden = isTagHidden(tag.id);
      const nodeCount = tagNodeMap[tag.id]?.size || 0;
      const childCount = tag.children?.length || 0;

      // FR: Obtenir les noms des enfants pour le tooltip
      // EN: Get children names for tooltip
      const childrenNames =
        tag.children
          ?.map((childId: string) => {
            const childTag = tags.find(t => t.id === childId);
            return childTag?.label || childId;
          })
          .join(', ') || '';

      // FR: Déterminer l'icône de relation avec le parent
      // EN: Determine relation icon with parent
      let relationIcon: React.ReactNode = null;
      if (tag.parentIds && tag.parentIds.length > 0) {
        const parentId = tag.parentIds[0];
        const links = getLinksBetween(parentId, tag.id);
        if (links && links.length > 0) {
          const link = links[0];
          switch (link.type) {
            case RelationType.IS_RELATED_TO:
              relationIcon = <Link2 size={12} style={{ color: '#3b82f6' }} />;
              break;
            case RelationType.IS_PART_OF:
              relationIcon = <Package size={12} style={{ color: '#22c55e' }} />;
              break;
            default:
              relationIcon = <ArrowRight size={12} style={{ color: '#666' }} />;
          }
        } else {
          relationIcon = <ArrowRight size={12} style={{ color: '#666' }} />;
        }
      }

      // FR: Déterminer le type de drop (sur le nœud ou entre les nœuds)
      // EN: Determine drop type (on node or between nodes)
      const dropPosition = node.state.willReceiveDrop ? 'true' : 'false';

      return (
        <div
          style={style}
          ref={dragHandle}
          className={`arborist-node ${hidden ? 'hidden' : ''}`}
          data-drop-target={dropPosition}
          onClick={() => node.isInternal && node.toggle()}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (node.isInternal) node.toggle();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {/* FR: Colonne fixe pour les yeux */}
          {/* EN: Fixed column for eyes */}
          <div className="eye-column">
            <button
              type="button"
              className="eye-btn"
              onClick={e => {
                e.stopPropagation();
                toggleTagVisibility(tag.id);
              }}
              title={hidden ? 'Show tag' : 'Hide tag'}
            >
              {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* FR: Contenu du nœud */}
          {/* EN: Node content */}
          <div className="node-content">
            {/* FR: Flèche d'expansion */}
            {/* EN: Expansion arrow */}
            <div className="expansion-arrow">
              {node.isInternal && childCount > 0 && (
                <ChevronRight
                  size={16}
                  style={{
                    transform: node.isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              )}
            </div>

            {/* FR: Icône de relation */}
            {/* EN: Relation icon */}
            {relationIcon && <div className="relation-icon">{relationIcon}</div>}

            {/* FR: Badge du tag */}
            {/* EN: Tag badge */}
            <div className="tag-badge" style={{ backgroundColor: tag.color || '#3b82f6' }}>
              <span className="tag-label">{tag.label.substring(0, 20)}</span>
              {(childCount > 0 || nodeCount > 0) && (
                <div className="tag-counts">
                  {childCount > 0 && (
                    <span
                      className="count-badge count-children"
                      title={`Enfants: ${childrenNames}`}
                    >
                      {childCount}E
                    </span>
                  )}
                  {nodeCount > 0 && <span className="count-badge count-nodes">{nodeCount}N</span>}
                </div>
              )}
            </div>

            {/* FR: Bouton supprimer */}
            {/* EN: Delete button */}
            <button
              type="button"
              className="delete-btn"
              onClick={e => {
                e.stopPropagation();
                // eslint-disable-next-line no-alert
                if (window.confirm(`Delete tag "${tag.label}"?`)) {
                  removeTag(tag.id);
                }
              }}
              title="Delete tag"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      );
    },
    [isTagHidden, tagNodeMap, getLinksBetween, toggleTagVisibility, removeTag, tags]
  );

  // FR: Gérer le drop
  // EN: Handle drop
  const onMove = useCallback(
    ({
      dragIds,
      parentId,
      index,
    }: {
      dragIds: string[];
      parentId: string | null;
      index: number;
    }) => {
      if (dragIds.length === 0) return;

      const draggedId = dragIds[0];
      const draggedTag = tags.find(t => t.id === draggedId);
      if (!draggedTag) return;

      // FR: Déterminer le parent actuel
      // EN: Determine current parent
      const currentParentId =
        draggedTag.parentIds && draggedTag.parentIds.length > 0 ? draggedTag.parentIds[0] : null;

      // eslint-disable-next-line no-console
      //   '[Arborist] Move:',
      //   draggedTag.label,
      //   'from parent:',
      //   currentParentId,
      //   'to parent:',
      //   parentId,
      //   'at index:',
      //   index
      // );

      // FR: Si le parent change → créer relation parent-enfant
      // EN: If parent changes → create parent-child relationship
      if (currentParentId !== parentId) {
        // eslint-disable-next-line no-console

        // FR: Enlever TOUS les anciens parents
        // EN: Remove ALL old parents
        if (draggedTag.parentIds && draggedTag.parentIds.length > 0) {
          draggedTag.parentIds.forEach(oldParentId => {
            // eslint-disable-next-line no-console
            removeParent(draggedId, oldParentId);
          });
        }

        // FR: Ajouter au nouveau parent (si pas null = racine)
        // EN: Add to new parent (if not null = root)
        if (parentId) {
          // eslint-disable-next-line no-console
          addParent(draggedId, parentId);
        } else {
          // eslint-disable-next-line no-console
        }
      } else {
        // FR: Même parent → réordonner les enfants
        // EN: Same parent → reorder children
        // eslint-disable-next-line no-console
        reorderChildren(parentId, draggedId, index);
      }
    },
    [tags, addParent, removeParent, reorderChildren]
  );

  if (tags.length === 0) {
    return (
      <div className="tag-layers-empty">
        <p>Aucun tag. Créez-en un dans le panneau DAG.</p>
      </div>
    );
  }

  return (
    <div className="tag-layers-panel-rct">
      <div className="tag-layers-tree-arborist">
        <Tree
          ref={treeRef}
          data={treeData}
          openByDefault={false}
          width="100%"
          height={600}
          indent={8}
          rowHeight={36}
          overscanCount={10}
          onMove={onMove}
          disableDrop={() => false}
          disableEdit
        >
          {Node}
        </Tree>
      </div>
    </div>
  );
}

export default TagLayersPanelRCT;
