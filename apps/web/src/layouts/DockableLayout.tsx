/**
 * FR: Layout avec panneaux dockables (style Photoshop)
 * EN: Dockable panels layout (Photoshop style)
 */

import React, { useRef, useCallback } from 'react';
import { Layout, Model, TabNode, IJsonModel, Actions, DockLocation } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import MenuBar from '../components/MenuBar';
import FileTabs from '../components/FileTabs';
import NodeExplorer from '../components/NodeExplorer';
import MindMapCanvas from '../components/MindMapCanvas';
import NodeProperties from '../components/NodeProperties';
import TagLayersPanelRCT from '../components/TagLayersPanelRCT';
import StatusBar from '../components/StatusBar';
import { useTagStore } from '../hooks/useTagStore';
import './DockableLayout.css';

// FR: Configuration initiale du layout
// EN: Initial layout configuration
const DEFAULT_LAYOUT: IJsonModel = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableMaximize: true,
    tabSetEnableDivide: true,
    tabSetEnableDrop: true,
    tabSetEnableDrag: true,
    tabEnableDrag: true,
    borderEnableDrop: true,
    tabSetMinWidth: 100,
    tabSetMinHeight: 100,
    splitterSize: 8,
    enableEdgeDock: true,
    enableRotateBorderIcons: false,
  },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      // FR: Colonne gauche avec Fichiers et Explorateur
      // EN: Left column with Files and Explorer
      {
        type: 'tabset',
        weight: 15,
        selected: 0,
        enableDivide: true,
        children: [
          {
            type: 'tab',
            name: 'Fichiers',
            component: 'files',
            enableClose: false,
          },
          {
            type: 'tab',
            name: 'Explorateur',
            component: 'explorer',
            enableClose: false,
          },
        ],
      },
      // FR: Canvas au centre (pas de division pour le canvas)
      // EN: Canvas in the center (no division for canvas)
      {
        type: 'tabset',
        weight: 55,
        enableTabStrip: false,
        enableDivide: false,
        children: [
          {
            type: 'tab',
            name: 'Canvas',
            component: 'canvas',
            enableClose: false,
          },
        ],
      },
      // FR: Colonne droite avec Propriétés en haut et Tags en bas
      // EN: Right column with Properties on top and Tags on bottom
      {
        type: 'column',
        weight: 30,
        children: [
          {
            type: 'tabset',
            weight: 50,
            enableDivide: true,
            children: [
              {
                type: 'tab',
                name: 'Propriétés',
                component: 'properties',
                enableClose: false,
              },
            ],
          },
          {
            type: 'tabset',
            weight: 50,
            enableDivide: true,
            children: [
              {
                type: 'tab',
                name: 'Tags & Layers',
                component: 'tags',
                enableClose: false,
              },
            ],
          },
        ],
      },
    ],
  },
};

const STORAGE_KEY = 'bigmind_layout_config_v2'; // v2 pour forcer le nouveau layout par défaut

function DockableLayout() {
  const layoutRef = useRef<Layout>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const tagsCount = useTagStore(state => Object.keys(state.tags).length);
  const [isDragging, setIsDragging] = React.useState(false);

  // FR: Détecter la position de la souris pendant le drag pour illuminer la bonne zone
  // EN: Detect mouse position during drag to illuminate the right zone
  React.useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // FR: Trouver tous les tabsets sous la souris
      // EN: Find all tabsets under mouse
      const tabsets = mainEl.querySelectorAll('.flexlayout__tabset_content');
      tabsets.forEach(tabset => {
        const rect = tabset.getBoundingClientRect();
        const mouseY = e.clientY;
        const midY = rect.top + rect.height / 2;

        // FR: Ajouter classe selon si souris est en haut ou en bas
        // EN: Add class based on whether mouse is on top or bottom
        if (mouseY >= rect.top && mouseY <= rect.bottom) {
          if (mouseY < midY) {
            tabset.classList.add('drop-zone-top-active');
            tabset.classList.remove('drop-zone-bottom-active');
          } else {
            tabset.classList.add('drop-zone-bottom-active');
            tabset.classList.remove('drop-zone-top-active');
          }
        } else {
          tabset.classList.remove('drop-zone-top-active', 'drop-zone-bottom-active');
        }
      });
    };

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => {
      setIsDragging(false);
      // FR: Nettoyer toutes les classes
      // EN: Clean up all classes
      const tabsets = mainEl.querySelectorAll('.flexlayout__tabset_content');
      tabsets.forEach(tabset => {
        tabset.classList.remove('drop-zone-top-active', 'drop-zone-bottom-active');
      });
    };

    mainEl.addEventListener('mousemove', handleMouseMove);
    mainEl.addEventListener('dragstart', handleDragStart, true);
    mainEl.addEventListener('dragend', handleDragEnd, true);

    return () => {
      mainEl.removeEventListener('mousemove', handleMouseMove);
      mainEl.removeEventListener('dragstart', handleDragStart, true);
      mainEl.removeEventListener('dragend', handleDragEnd, true);
    };
  }, [isDragging]);

  // FR: Charger la configuration sauvegardée ou utiliser la configuration par défaut
  // EN: Load saved configuration or use default configuration
  const getInitialModel = useCallback((): Model => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedLayout = JSON.parse(saved);
        return Model.fromJson(parsedLayout);
      }
    } catch (e) {
      console.warn('Failed to load layout config:', e);
    }
    return Model.fromJson(DEFAULT_LAYOUT);
  }, []);

  const [model] = React.useState(getInitialModel);

  // FR: Sauvegarder la configuration dans localStorage
  // EN: Save configuration to localStorage
  const onModelChange = useCallback((newModel: Model) => {
    try {
      const json = newModel.toJson();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
    } catch (e) {
      console.warn('Failed to save layout config:', e);
    }
  }, []);

  // FR: Factory pour créer les composants des panneaux
  // EN: Factory to create panel components
  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();

    switch (component) {
      case 'files':
        return (
          <div className="panel-content">
            <FileTabs />
          </div>
        );

      case 'explorer':
        return (
          <div className="panel-content">
            <NodeExplorer />
          </div>
        );

      case 'canvas':
        return (
          <div className="panel-content canvas-panel">
            <MindMapCanvas />
          </div>
        );

      case 'properties':
        return (
          <div className="panel-content">
            <NodeProperties />
          </div>
        );

      case 'tags':
        return (
          <div className="panel-content">
            <TagLayersPanelRCT />
          </div>
        );

      default:
        return <div className="panel-content">Unknown component: {component}</div>;
    }
  }, []);

  // FR: Rendu personnalisé du nom des onglets
  // EN: Custom tab name rendering
  const onRenderTab = useCallback(
    (node: TabNode, renderValues: any) => {
      if (node.getComponent() === 'tags') {
        renderValues.content = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Tags & Layers</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px',
                height: '16px',
                padding: '0 4px',
                background: 'var(--accent-color)',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '600',
                color: 'white',
              }}
            >
              {tagsCount}
            </span>
          </div>
        );
      }
    },
    [tagsCount]
  );

  // FR: Action personnalisée pour gérer le split 50/50
  // EN: Custom action to handle 50/50 split
  const onAction = useCallback((action: any) => {
    // FR: Si on ajoute un noeud avec BOTTOM ou TOP, ajuster le weight pour 50/50
    // EN: If adding a node with BOTTOM or TOP, adjust weight for 50/50
    if (action.type === 'FlexLayout_AddNode') {
      const location = action.data?.location;
      if (location === 'bottom' || location === 'top') {
        // FR: Forcer le weight à 50 pour un split équilibré
        // EN: Force weight to 50 for balanced split
        if (action.data && !action.data.weight) {
          action.data.weight = 50;
        }
      }
    }
    return action;
  }, []);

  // FR: Rendu personnalisé du header du tabset pour ajouter boutons de split
  // EN: Custom tabset header rendering to add split buttons
  const onRenderTabSet = useCallback(
    (tabSetNode: any, renderValues: any) => {
      // Ne pas ajouter de boutons sur le canvas
      const tabs = tabSetNode.getChildren();
      if (tabs.length > 0 && tabs[0].getComponent() === 'canvas') {
        return;
      }

      renderValues.stickyButtons = [
        <button
          key="split-horizontal"
          type="button"
          className="flexlayout__tab_toolbar_button"
          title="Diviser horizontalement (côte à côté)"
          onClick={() => {
            model.doAction(
              Actions.addNode(
                {
                  type: 'tab',
                  name: 'Nouveau',
                  component: 'properties',
                },
                tabSetNode.getId(),
                DockLocation.RIGHT,
                0
              )
            );
          }}
          style={{
            padding: '4px 8px',
            fontSize: '16px',
            background: 'transparent',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--fg-secondary)',
            marginLeft: '4px',
          }}
        >
          ⬌
        </button>,
        <button
          key="split-vertical"
          type="button"
          className="flexlayout__tab_toolbar_button"
          title="Diviser verticalement (l'un sous l'autre)"
          onClick={() => {
            model.doAction(
              Actions.addNode(
                {
                  type: 'tab',
                  name: 'Nouveau',
                  component: 'properties',
                },
                tabSetNode.getId(),
                DockLocation.BOTTOM,
                0
              )
            );
          }}
          style={{
            padding: '4px 8px',
            fontSize: '16px',
            background: 'transparent',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--fg-secondary)',
            marginLeft: '4px',
          }}
        >
          ⬍
        </button>,
      ];
    },
    [model]
  );

  return (
    <div className="dockable-layout">
      {/* FR: Barre de menu */}
      {/* EN: Menu bar */}
      <div className="dockable-menu-bar">
        <MenuBar />
      </div>

      {/* FR: Zone principale avec panneaux flexibles */}
      {/* EN: Main area with flexible panels */}
      <div ref={mainRef} className="dockable-main">
        <Layout
          ref={layoutRef}
          model={model}
          factory={factory}
          onModelChange={onModelChange}
          onRenderTab={onRenderTab}
          onRenderTabSet={onRenderTabSet}
          onAction={onAction}
        />
      </div>

      {/* FR: Barre d'onglets des feuilles XMind */}
      {/* EN: XMind sheets tab bar */}
      <div className="dockable-tab-bar">
        <FileTabs type="tab-bar" />
      </div>

      {/* FR: Barre de statut */}
      {/* EN: Status bar */}
      <div className="dockable-status-bar">
        <StatusBar />
      </div>
    </div>
  );
}

export default DockableLayout;
