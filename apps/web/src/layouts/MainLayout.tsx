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
import TagLayersPanelDAG from '../components/TagLayersPanelDAG';
import StatusBar from '../components/StatusBar';
import CollapseButton from '../components/CollapseButton';
import { useColumnCollapse } from '../hooks/useColumnCollapse';
import './MainLayout.css';

function MainLayout() {
  const { toggleColumn, isCollapsed } = useColumnCollapse();

  return (
    <div className="main-layout">
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
          <div className={`files-column ${isCollapsed('files') ? 'collapsed' : ''}`}>
            <div className="column-header">
              <span className="column-title">Fichiers</span>
              <CollapseButton
                isCollapsed={isCollapsed('files')}
                onToggle={() => toggleColumn('files')}
                direction="left"
              />
            </div>
            {isCollapsed('files') && (
              <div className="vertical-title">
                <span className="vertical-text">FICHIERS</span>
              </div>
            )}
            {!isCollapsed('files') && <FileTabs />}
          </div>

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
                <div
                  className={`node-explorer-column ${isCollapsed('explorer') ? 'collapsed' : ''}`}
                >
                  <div className="column-header">
                    <span className="column-title">Explorateur</span>
                    <CollapseButton
                      isCollapsed={isCollapsed('explorer')}
                      onToggle={() => toggleColumn('explorer')}
                      direction="left"
                    />
                  </div>
                  {isCollapsed('explorer') && (
                    <div className="vertical-title">
                      <span className="vertical-text">EXPLORATEUR</span>
                    </div>
                  )}
                  {!isCollapsed('explorer') && <NodeExplorer />}
                </div>

                {/* FR: Carte mentale */}
                {/* EN: Mind map */}
                <div className="mindmap-column">
                  <MindMapCanvas />
                </div>

                {/* FR: Colonne de propriétés du nœud sélectionné */}
                {/* EN: Selected node properties column */}
                <div
                  className={`properties-column ${isCollapsed('properties') ? 'collapsed' : ''}`}
                >
                  <div className="column-header">
                    <span className="column-title">Propriétés</span>
                    <CollapseButton
                      isCollapsed={isCollapsed('properties')}
                      onToggle={() => toggleColumn('properties')}
                      direction="right"
                    />
                  </div>
                  {isCollapsed('properties') && (
                    <div className="vertical-title">
                      <span className="vertical-text">PROPRIÉTÉS</span>
                    </div>
                  )}
                  {!isCollapsed('properties') && <NodeProperties />}
                </div>

                {/* FR: Colonne DAG des tags */}
                {/* EN: Tags DAG column */}
                <div className={`tags-column ${isCollapsed('tags') ? 'collapsed' : ''}`}>
                  <div className="column-header">
                    <span className="column-title">Tags & Layers</span>
                    <CollapseButton
                      isCollapsed={isCollapsed('tags')}
                      onToggle={() => toggleColumn('tags')}
                      direction="right"
                    />
                  </div>
                  {isCollapsed('tags') && (
                    <div className="vertical-title">
                      <span className="vertical-text">TAGS</span>
                    </div>
                  )}
                  {!isCollapsed('tags') && <TagLayersPanelDAG />}
                </div>
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

      {/* FR: Composant de debug pour la plateforme (temporaire) */}
      {/* EN: Platform debug component (temporary) */}
      {/* <PlatformDebug /> */}
    </div>
  );
}

export default MainLayout;
