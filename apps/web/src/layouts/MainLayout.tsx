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
import Sidebar from '../components/Sidebar';
import StatusBar from '../components/StatusBar';
import CollapseButton from '../components/CollapseButton';
import { ResizeHandle } from '../components/ResizeHandle';
import { useColumnCollapse } from '../hooks/useColumnCollapse';
import { useColumnResize } from '../hooks/useColumnResize';
import { cn } from '../utils/cn';
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
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (event: React.MouseEvent) => void;
  isResizing?: boolean;
  showResizeHandle?: boolean;
  resizeHandlePosition?: 'left' | 'right';
}

const LayoutColumn: React.FC<LayoutColumnProps> = React.memo(
  ({
    title,
    columnKey,
    isCollapsed,
    onToggle,
    children,
    direction = 'left',
    ariaLabel,
    width,
    minWidth,
    maxWidth,
    onResize,
    isResizing = false,
    showResizeHandle = true,
    resizeHandlePosition = 'right',
  }) => {
    const [isNearBorder, setIsNearBorder] = React.useState(false);
    const [borderSide, setBorderSide] = React.useState<'left' | 'right' | null>(null);

    // Zone de tolérance en pixels autour de la bordure
    const TOLERANCE = 15;

    const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
      if (isCollapsed || !showResizeHandle) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const columnWidth = rect.width;

      // Vérifier si on est proche de la bordure (à l'intérieur de la colonne)
      const nearLeft = x <= TOLERANCE && resizeHandlePosition === 'left';
      const nearRight = x >= columnWidth - TOLERANCE && resizeHandlePosition === 'right';

      if (nearLeft || nearRight) {
        setIsNearBorder(true);
        setBorderSide(nearLeft ? 'left' : 'right');
      } else {
        setIsNearBorder(false);
        setBorderSide(null);
      }
    }, [isCollapsed, showResizeHandle, resizeHandlePosition, TOLERANCE]);

    const handleMouseLeave = React.useCallback(() => {
      setIsNearBorder(false);
      setBorderSide(null);
    }, []);

    // Ajouter des zones de détection invisibles autour des bordures
    const renderBorderZones = () => {
      if (isCollapsed || !showResizeHandle) return null;

      return (
        <>
          {resizeHandlePosition === 'left' && (
            <div
              className="border-detection-zone border-detection-left"
              onMouseEnter={() => {
                setIsNearBorder(true);
                setBorderSide('left');
              }}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'absolute',
                left: '-15px',
                top: 0,
                bottom: 0,
                width: '15px',
                zIndex: 45,
                cursor: 'col-resize'
              }}
            />
          )}
          {resizeHandlePosition === 'right' && (
            <div
              className="border-detection-zone border-detection-right"
              onMouseEnter={() => {
                setIsNearBorder(true);
                setBorderSide('right');
              }}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'absolute',
                right: '-15px',
                top: 0,
                bottom: 0,
                width: '15px',
                zIndex: 45,
                cursor: 'col-resize'
              }}
            />
          )}
        </>
      );
    };

    const columnStyle: React.CSSProperties = isCollapsed
      ? {}
      : {
          width: width ? `${width}px` : undefined,
          minWidth: minWidth ? `${minWidth}px` : undefined,
          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        };

    return (
      <div
        className={cn(
          'layout-column',
          `${columnKey}-column`,
          isCollapsed ? 'collapsed' : '',
          'resizable-column',
          isResizing && 'resizing',
          isNearBorder && 'near-border'
        )}
        role="region"
        aria-label={ariaLabel || title}
        style={columnStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {renderBorderZones()}
        {showResizeHandle && resizeHandlePosition === 'left' && !isCollapsed && onResize && (
          <ResizeHandle onMouseDown={onResize} isDragging={isResizing} isHovered={isNearBorder && borderSide === 'left'} position="left" />
        )}

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
          <div className="column-content" style={{ flex: 1, overflow: 'hidden' }}>
            {children}
          </div>
        )}

        {showResizeHandle && resizeHandlePosition === 'right' && !isCollapsed && onResize && (
          <ResizeHandle onMouseDown={onResize} isDragging={isResizing} isHovered={isNearBorder && borderSide === 'right'} position="right" />
        )}
      </div>
    );
  }
);

LayoutColumn.displayName = 'LayoutColumn';

const MainLayout: React.FC = React.memo(() => {
  const { toggleColumn, isCollapsed } = useColumnCollapse();
  const { columnSizes, isDragging, startResize, COLUMN_SIZE_LIMITS, borderThickness } = useColumnResize();

  const handleToggleColumn = React.useCallback(
    (columnKey: ColumnKey) => {
      toggleColumn(columnKey);
    },
    [toggleColumn]
  );

  return (
    <div
      className="main-layout"
      role="application"
      aria-label="BigMind Application"
      style={{ '--column-border-thickness': `${borderThickness}px` } as React.CSSProperties}
    >
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
            width={columnSizes.files}
            minWidth={COLUMN_SIZE_LIMITS.files.min}
            maxWidth={COLUMN_SIZE_LIMITS.files.max}
            onResize={e => startResize('files', e)}
            isResizing={isDragging === 'files'}
            showResizeHandle
            resizeHandlePosition="right"
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
                  width={columnSizes.explorer}
                  minWidth={COLUMN_SIZE_LIMITS.explorer.min}
                  maxWidth={COLUMN_SIZE_LIMITS.explorer.max}
                  onResize={e => startResize('explorer', e)}
                  isResizing={isDragging === 'explorer'}
                  showResizeHandle
                  resizeHandlePosition="right"
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
                  width={columnSizes.properties}
                  minWidth={COLUMN_SIZE_LIMITS.properties.min}
                  maxWidth={COLUMN_SIZE_LIMITS.properties.max}
                  onResize={e => startResize('properties', e)}
                  isResizing={isDragging === 'properties'}
                  showResizeHandle
                  resizeHandlePosition="left"
                >
                  <Sidebar />
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
