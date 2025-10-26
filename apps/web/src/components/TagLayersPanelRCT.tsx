/**
 * FR: Panneau de visualisation hiérarchique des tags avec react-complex-tree
 * EN: Hierarchical tag visualization panel with react-complex-tree
 */

import React, { useMemo, useCallback } from 'react';
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
} from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useTagGraph } from '../hooks/useTagGraph';
import { useNodeTags } from '../hooks/useNodeTags';
import { DagTag, RelationType } from '../types/dag';
import { Trash2, Eye, EyeOff, ArrowRight, Link2, Package } from 'lucide-react';
import './TagLayersPanelRCT.css';

// FR: Pas besoin d'interface custom, on utilise TreeItem directement
// EN: No need for custom interface, use TreeItem directly
type TagTreeItem = TreeItem<DagTag>;

function TagLayersPanelRCT() {
  const tags = useTagGraph((state: any) => Object.values(state.tags) as DagTag[]);
  const removeTag = useTagGraph((state: any) => state.removeTag);
  const isTagHidden = useTagGraph((state: any) => state.isTagHidden);
  const toggleTagVisibility = useTagGraph((state: any) => state.toggleTagVisibility);
  const addParent = useTagGraph((state: any) => state.addParent);
  const getLinksBetween = useTagGraph((state: any) => state.getLinksBetween);
  const getNodeTags = useNodeTags((state: any) => state.getTagNodes);

  // FR: Convertir les DagTag en TreeItem pour react-complex-tree
  // EN: Convert DagTag to TreeItem for react-complex-tree
  const treeItems = useMemo<Record<string, TagTreeItem>>(() => {
    const items: Record<string, TagTreeItem> = {
      root: {
        index: 'root',
        children: [] as string[],
        data: {
          id: 'root',
          label: 'Root',
          parentIds: [],
          children: [],
          relations: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        isFolder: true,
        canMove: false,
        canRename: false,
      },
    };

    // FR: Ajouter tous les tags
    // EN: Add all tags
    tags.forEach((tag: DagTag) => {
      items[tag.id] = {
        index: tag.id,
        children: tag.children || [],
        data: tag,
        isFolder: tag.children && tag.children.length > 0,
        canMove: true,
        canRename: true,
      };
    });

    // FR: Construire la hiérarchie - tags racine sous root
    // EN: Build hierarchy - root tags under root
    const rootTags = tags.filter((tag: DagTag) => !tag.parentIds || tag.parentIds.length === 0);
    items.root.children = rootTags.map((tag: DagTag) => tag.id);

    return items;
  }, [tags]);

  // FR: Data provider pour react-complex-tree
  // EN: Data provider for react-complex-tree
  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(treeItems, (item, newName) => ({
        ...item,
        data: { ...item.data, label: newName },
      })),
    [treeItems]
  );

  // FR: Obtenir le titre d'un item
  // EN: Get item title
  const getItemTitle = useCallback((item: TreeItem<DagTag>) => item.data.label, []);

  // FR: Gérer le drag-drop
  // EN: Handle drag-drop
  const onDrop = useCallback(
    (items: TreeItem<DagTag>[], target: any) => {
      // eslint-disable-next-line no-console
      console.log('[RCT] Drop:', items, 'onto', target);
      if (items.length > 0 && target && target.targetItem !== 'root') {
        const draggedId = items[0].index as string;
        const targetId = target.targetItem as string;
        if (draggedId !== targetId) {
          addParent(draggedId, targetId);
        }
      }
    },
    [addParent]
  );

  // FR: Rendu personnalisé des nœuds
  // EN: Custom node rendering
  const renderItem = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ item, depth, arrow }: any) => {
      if (item.index === 'root') return null;

      const tag = item.data;
      const hidden = isTagHidden(tag.id);
      const nodeCount = getNodeTags(tag.id)?.length || 0;
      const childCount = tag.children?.length || 0;

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

      return (
        <div
          className={`rct-tag-item ${hidden ? 'hidden' : ''}`}
          style={{ paddingLeft: `${depth * 24}px` }}
        >
          {arrow}

          {relationIcon && <div className="rct-relation-icon">{relationIcon}</div>}

          <button
            type="button"
            className="rct-tag-visibility-btn"
            onClick={e => {
              e.stopPropagation();
              toggleTagVisibility(tag.id);
            }}
            title={hidden ? 'Show tag' : 'Hide tag'}
          >
            {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          <div
            className="rct-tag-badge"
            style={{ backgroundColor: tag.color || '#3b82f6' }}
            role="button"
            tabIndex={0}
            onClick={e => {
              e.stopPropagation();
              // TODO: Color picker
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Color picker
              }
            }}
          >
            <span className="rct-tag-label">{tag.label.substring(0, 20)}</span>
            {(childCount > 0 || nodeCount > 0) && (
              <div className="rct-tag-counts">
                {childCount > 0 && (
                  <span className="count-badge count-children">{childCount}E</span>
                )}
                {nodeCount > 0 && <span className="count-badge count-nodes">{nodeCount}N</span>}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rct-tag-delete-btn"
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
      );
    },
    [isTagHidden, getNodeTags, getLinksBetween, toggleTagVisibility, removeTag]
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
      <div className="tag-layers-header">
        <h3>Tags</h3>
        <span className="tag-count">{tags.length}</span>
      </div>

      <div className="tag-layers-tree-rct">
        <UncontrolledTreeEnvironment
          dataProvider={dataProvider}
          getItemTitle={getItemTitle}
          viewState={{}}
          canDragAndDrop
          canDropOnFolder
          canReorderItems
          onDrop={onDrop}
          renderItem={renderItem}
        >
          <Tree treeId="tag-tree" rootItem="root" treeLabel="Tag Hierarchy" />
        </UncontrolledTreeEnvironment>
      </div>
    </div>
  );
}

export default TagLayersPanelRCT;
