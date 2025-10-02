/**
 * FR: Layout principal de BigMind avec framesets
 * EN: Main BigMind layout with framesets
 */

import React from 'react';
import MenuBar from '../components/MenuBar';
import FileTabs from '../components/FileTabs';
import NodeExplorer from '../components/NodeExplorer';
import MindMapCanvas from '../components/MindMapCanvas';
import NodeProperties from '../components/NodeProperties';
import StatusBar from '../components/StatusBar';
import CollapseButton from '../components/CollapseButton';
import { useColumnCollapse } from '../hooks/useColumnCollapse';
import './MainLayout.css';

// Constants for column keys
const COLUMN_KEYS = {
  FILES: 'files',
  EXPLORER: 'explorer',
  PROPERTIES: 'properties',
} as const;

type ColumnKey = (typeof COLUMN_KEYS)[keyof typeof COLUMN_KEYS];

interface LayoutColumnProps {
  title: string;
  columnKey: ColumnKey;
  isCollapsed: boolean;
  onToggle: (key: ColumnKey) => void;
  children: React.ReactNode;
  direction?: 'left' | 'right';
  ariaLabel?: string;
}

const LayoutColumn: React.FC<LayoutColumnProps> = React.memo(
  ({ title, columnKey, isCollapsed, onToggle, children, direction = 'left', ariaLabel }) => (
    <div
      className={`layout-column ${isCollapsed ? 'collapsed' : ''}`}
      role="region"
      aria-label={ariaLabel || title}
    >
      <div className="column-header">
        <span className="column-title">{title}</span>
        <CollapseButton
          isCollapsed={isCollapsed}
          onToggle={() => onToggle(columnKey)}
          direction={direction}
          aria-label={`${isCollapsed ? 'Développer' : 'Réduire'} ${title}`}
        />
      </div>
      {isCollapsed ? (
        <div className="vertical-title">
          <span className="vertical-text">{title.toUpperCase()}</span>
        </div>
      ) : (
        children
      )}
    </div>
  )
);

LayoutColumn.displayName = 'LayoutColumn';

const MainLayout: React.FC = React.memo(() => {
  const { toggleColumn, isCollapsed } = useColumnCollapse();

  const handleToggleColumn = React.useCallback(
    (columnKey: ColumnKey) => {
      toggleColumn(columnKey);
    },
    [toggleColumn]
  );

  return (
    <div className="main-layout" role="application" aria-label="BigMind Application">
      {/* FR: Frameset vertical 1 - Layout principal */}
      {/* EN: Vertical frameset 1 - Main layout */}
      <div className="frameset-vertical-1">
        {/* FR: Top Bar supprimée */}
        {/* EN: Top Bar removed */}

        {/* FR: Barre de menu */}
        {/* EN: Menu bar */}
        <div className="menu-bar-container">
          <MenuBar />
        </div>

        {/* FR: Frameset horizontal 2 - Zone principale */}
        {/* EN: Horizontal frameset 2 - Main area */}
        <div className="frameset-horizontal-2">
          {/* FR: Colonne de fichiers ouverts */}
          {/* EN: Open files column */}
          <LayoutColumn
            title="Fichiers"
            columnKey={COLUMN_KEYS.FILES}
            isCollapsed={isCollapsed('files')}
            onToggle={handleToggleColumn}
            direction="left"
            ariaLabel="Fichiers ouverts"
          >
            <FileTabs />
          </LayoutColumn>

          {/* FR: Frameset horizontal 3 - Zone de travail */}
          {/* EN: Horizontal frameset 3 - Work area */}
          <div className="frameset-horizontal-3">
            {/* FR: Frameset vertical 4 - Zone centrale */}
            {/* EN: Vertical frameset 4 - Central area */}
            <div className="frameset-vertical-4">
              {/* FR: Frameset horizontal 5 - Zone de carte */}
              {/* EN: Horizontal frameset 5 - Map area */}
              <div className="frameset-horizontal-5">
                {/* FR: Colonne explorateur de nœuds */}
                {/* EN: Node explorer column */}
                <LayoutColumn
                  title="Explorateur"
                  columnKey={COLUMN_KEYS.EXPLORER}
                  isCollapsed={isCollapsed('explorer')}
                  onToggle={handleToggleColumn}
                  direction="left"
                  ariaLabel="Explorateur de nœuds"
                >
                  <NodeExplorer />
                </LayoutColumn>

                {/* FR: Carte mentale */}
                {/* EN: Mind map */}
                <div className="mindmap-column" role="main" aria-label="Zone de carte mentale">
                  <MindMapCanvas />
                </div>

                {/* FR: Colonne de propriétés du nœud sélectionné */}
                {/* EN: Selected node properties column */}
                <LayoutColumn
                  title="Propriétés"
                  columnKey={COLUMN_KEYS.PROPERTIES}
                  isCollapsed={isCollapsed('properties')}
                  onToggle={handleToggleColumn}
                  direction="right"
                  ariaLabel="Propriétés du nœud"
                >
                  <NodeProperties />
                </LayoutColumn>
              </div>

              {/* FR: Barre d'onglets des feuilles XMind (en bas, au-dessus de la status bar) */}
              {/* EN: XMind sheets tab bar (bottom, above status bar) */}
              <div className="tab-bar-container">
                <FileTabs type="tab-bar" />
              </div>
            </div>
          </div>
        </div>

        {/* FR: Barre de statut */}
        {/* EN: Status bar */}
        <div className="status-bar-container">
          <StatusBar />
        </div>
      </div>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;
