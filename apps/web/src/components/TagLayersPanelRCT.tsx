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
import { useTagStore } from '../hooks/useTagStore';
import { DagTag, RelationType } from '../types/dag';
import { Trash2, Eye, EyeOff, ArrowRight, Link2, Package } from 'lucide-react';
import './TagLayersPanelRCT.css';

// FR: Pas besoin d'interface custom, on utilise TreeItem directement
// EN: No need for custom interface, use TreeItem directly
type TagTreeItem = TreeItem<DagTag>;

function TagLayersPanelRCT() {
  // FR: Utiliser le store complet pour forcer la réactivité
  // EN: Use full store to force reactivity
  const tagsObject = useTagStore(state => state.tags);
  const tags = Object.values(tagsObject);
  const removeTag = useTagStore(state => state.removeTag);
  const addTag = useTagStore(state => state.addTag);
  const isTagHidden = useTagStore(state => state.isTagHidden);
  const toggleTagVisibility = useTagStore(state => state.toggleTagVisibility);
  const addParent = useTagStore(state => state.addParent);
  const getLinksBetween = useTagStore(state => state.getLinksBetween);
  const getTagNodes = useTagStore(state => state.getTagNodes);
  const tagNodeMap = useTagStore(state => state.tagNodeMap);

  // FR: Nettoyer les parentIds orphelins
  // EN: Clean orphaned parentIds
  const cleanOrphanedParents = useCallback(() => {
    const validTagIds = new Set(tags.map(t => t.id));
    let fixedCount = 0;

    tags.forEach(tag => {
      const invalidParents = tag.parentIds.filter(parentId => !validTagIds.has(parentId));
      if (invalidParents.length > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `[TagLayersPanelRCT] Fixing tag "${tag.label}": removing invalid parents`,
          invalidParents
        );
        const validParents = tag.parentIds.filter(parentId => validTagIds.has(parentId));
        const updatedTag = { ...tag, parentIds: validParents };
        addTag(updatedTag); // Update via addTag
        fixedCount += 1;
      }
    });

    if (fixedCount > 0) {
      // eslint-disable-next-line no-alert
      alert(`Nettoyé ${fixedCount} tag(s) avec parents orphelins`);
    } else {
      // eslint-disable-next-line no-alert
      alert('Aucun parent orphelin trouvé');
    }
  }, [tags, addTag]);

  // FR: Synchroniser les tags manquants depuis useNodeTags vers useTagGraph
  // EN: Sync missing tags from useNodeTags to useTagGraph
  const syncMissingTags = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('[TagLayersPanelRCT] Syncing missing tags...');
    // eslint-disable-next-line no-console
    console.log('[TagLayersPanelRCT] Current tags in TagGraph:', tags);
    // eslint-disable-next-line no-console
    console.log('[TagLayersPanelRCT] TagNodeMap:', tagNodeMap);

    const existingTagIds = new Set(tags.map(t => t.id));
    const allTagIds = new Set(Object.keys(tagNodeMap));

    const missingTagIds = Array.from(allTagIds).filter(id => !existingTagIds.has(id));

    // eslint-disable-next-line no-console
    console.log('[TagLayersPanelRCT] Missing tag IDs:', missingTagIds);

    const colors = [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f97316',
    ];

    missingTagIds.forEach((tagId, index) => {
      const newTag: DagTag = {
        id: tagId,
        label: `Tag ${tagId.substring(4, 8)}`, // Fallback label
        color: colors[index % colors.length],
        parentIds: [],
        children: [],
        relations: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      // eslint-disable-next-line no-console
      console.log('[TagLayersPanelRCT] Creating missing tag:', newTag);
      addTag(newTag);
    });

    if (missingTagIds.length > 0) {
      // Nettoyer les parents orphelins après avoir créé les tags
      setTimeout(() => cleanOrphanedParents(), 200);
      // eslint-disable-next-line no-alert
      alert(`Synchronisé ${missingTagIds.length} tag(s) manquant(s)`);
    } else {
      // eslint-disable-next-line no-alert
      alert('Tous les tags sont déjà synchronisés');
    }
  }, [tags, tagNodeMap, addTag, cleanOrphanedParents]);

  // FR: Convertir les DagTag en TreeItem pour react-complex-tree
  // EN: Convert DagTag to TreeItem for react-complex-tree
  const treeItems = useMemo<Record<string, TagTreeItem>>(() => {
    // eslint-disable-next-line no-console
    console.log('[TagLayersPanelRCT] Building tree with', tags.length, 'tags:', tags);
    // eslint-disable-next-line no-console
    console.log('[TagLayersPanelRCT] Tags object:', tags.map(t => ({ id: t.id, label: t.label, parentIds: t.parentIds })));

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
      const hasChildren = tag.children && tag.children.length > 0;
      items[tag.id] = {
        index: tag.id,
        children: tag.children || [],
        data: tag,
        isFolder: hasChildren,
        canMove: true,
        canRename: true,
      };
    });

    // FR: Construire la hiérarchie - Seuls les tags SANS parent à la racine
    // EN: Build hierarchy - Only tags WITHOUT parent at root
    const rootTags = tags.filter((tag: DagTag) => !tag.parentIds || tag.parentIds.length === 0);
    items.root.children = rootTags.map((tag: DagTag) => tag.id);

    // eslint-disable-next-line no-console
    console.log(
      '[TagLayersPanelRCT] Root tags (no parent):',
      rootTags.map(t => t.label)
    );
    // eslint-disable-next-line no-console
    console.log(
      '[TagLayersPanelRCT] All tags with parents:',
      tags
        .filter(t => t.parentIds && t.parentIds.length > 0)
        .map(t => `${t.label} (parents: ${t.parentIds.join(', ')})`)
    );

    return items;
  }, [tags]);

  // FR: Clé stable pour forcer le refresh seulement quand les IDs changent
  // EN: Stable key to force refresh only when IDs change
  const treeKey = useMemo(() => {
    const sortedIds = tags.map(t => t.id).sort();
    return sortedIds.join(',');
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

  // FR: Contrôler si un item peut être déposé sur une cible
  // EN: Control if an item can be dropped on a target
  const canDropAt = useCallback((items: TreeItem<DagTag>[], target: any) => {
    // Ne pas permettre de déposer sur la racine
    if (target.targetType === 'root') return false;
    // Ne pas permettre de déposer un tag sur lui-même
    if (items.length > 0 && items[0].index === target.targetItem) return false;
    return true;
  }, []);

  // FR: Gérer le drag-drop pour créer des filiations
  // EN: Handle drag-drop to create parent-child relationships
  const onDrop = useCallback(
    (items: TreeItem<DagTag>[], target: any) => {
      // eslint-disable-next-line no-console
      console.log('[RCT] Drop:', items, 'onto', target);

      if (items.length > 0 && target && target.targetItem !== 'root') {
        const draggedId = items[0].index as string;
        const targetId = target.targetItem as string;

        if (draggedId !== targetId) {
          const draggedTag = tags.find(t => t.id === draggedId);
          const targetTag = tags.find(t => t.id === targetId);

          if (draggedTag && targetTag) {
            // eslint-disable-next-line no-console
            console.log(
              `[RCT] Creating parent-child: "${draggedTag.label}" → "${targetTag.label}"`
            );
            addParent(draggedId, targetId);

            // Message de confirmation
            setTimeout(() => {
              const msg = `✓ "${draggedTag.label}" → enfant de "${targetTag.label}"`;
              // eslint-disable-next-line no-alert
              alert(msg);
            }, 100);
          }
        }
      }
    },
    [addParent, tags]
  );

  // FR: Rendu personnalisé des nœuds
  // EN: Custom node rendering
  const renderItem = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ item, depth, arrow }: any) => {
      if (item.index === 'root') return null;

      const tag = item.data;
      const hidden = isTagHidden(tag.id);
      const nodeCount = getTagNodes(tag.id)?.length || 0;
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
    [isTagHidden, getTagNodes, getLinksBetween, toggleTagVisibility, removeTag]
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
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          <button
            type="button"
            onClick={syncMissingTags}
            className="sync-tags-btn"
            title="Synchroniser les tags manquants"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Sync
          </button>
          <button
            type="button"
            onClick={cleanOrphanedParents}
            className="clean-tags-btn"
            title="Nettoyer les parents orphelins"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clean
          </button>
        </div>
        <span className="tag-count">{tags.length}</span>
      </div>

      <div className="tag-layers-tree-rct">
        <UncontrolledTreeEnvironment
          key={treeKey}
          dataProvider={dataProvider}
          getItemTitle={getItemTitle}
          viewState={{}}
          canDragAndDrop
          canDropOnFolder
          canReorderItems
          canDropAt={canDropAt}
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
