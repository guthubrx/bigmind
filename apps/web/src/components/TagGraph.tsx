/**
 * FR: Composant de visualisation du graphe DAG avec SVG
 * EN: DAG graph visualization component with SVG
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTagStore } from '../hooks/useTagStore';
import { DagTag, RelationType } from '../types/dag';
import './TagGraph.css';

interface NodePosition {
  x: number;
  y: number;
}

function TagGraph() {
  const tags = useTagStore(state => Object.values(state.tags));
  const getChildren = useTagStore(state => state.getChildren);
  const getParents = useTagStore(state => state.getParents);
  const getLinksBetween = useTagStore(state => state.getLinksBetween);

  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [focusedTagId, setFocusedTagId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Create stable dependency key based on tag IDs
  const tagIdKey = useMemo(() => tags.map(t => t.id).join(','), [tags]);

  // FR: Calculer les positions des nœuds avec un algorithme hiérarchique simple
  // EN: Calculate node positions with simple hierarchical algorithm
  // Note: Using tagIdKey to prevent infinite loops from getChildren/getParents changing refs
  useEffect(() => {
    if (tags.length === 0) {
      setPositions({});
      return;
    }

    // FR: Grouper par niveau de profondeur
    // EN: Group by depth level
    const levels: Map<number, string[]> = new Map();
    const visited = new Set<string>();
    const depth = new Map<string, number>();

    const assignDepth = (tagId: string, d: number) => {
      if (visited.has(tagId)) return;
      visited.add(tagId);
      depth.set(tagId, d);

      // FR: Gérer plusieurs parents
      // EN: Handle multiple parents
      getParents(tagId).forEach((parent: DagTag) => {
        assignDepth(parent.id, d - 1);
      });

      getChildren(tagId).forEach((child: DagTag) => {
        assignDepth(child.id, d + 1);
      });
    };

    tags.forEach((tag: DagTag) => {
      if (!visited.has(tag.id)) {
        assignDepth(tag.id, 0);
      }
    });

    // FR: Grouper par niveau
    // EN: Group by level
    depth.forEach((d: number, tagId: string) => {
      const level = d + 100; // Offset pour éviter les négatifs
      if (!levels.has(level)) {
        levels.set(level, []);
      }
      levels.get(level)!.push(tagId);
    });

    // FR: Calculer les positions
    // EN: Calculate positions
    const newPositions: Record<string, NodePosition> = {};
    let maxWidth = 0;

    Array.from(levels.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([, nodeIds]: [number, string[]], levelIndex: number) => {
        const y = levelIndex * 120;
        const width = nodeIds.length * 180;
        maxWidth = Math.max(maxWidth, width);

        nodeIds.forEach((nodeId: string, index: number) => {
          const x = index * 180 - (nodeIds.length * 180) / 2 + maxWidth / 2;
          newPositions[nodeId] = { x, y };
        });
      });

    setPositions(newPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagIdKey, getChildren, getParents]);

  // FR: Gérer le zoom avec la molette
  // EN: Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  // FR: Gérer le glisser-déposer de la canvas
  // EN: Handle canvas drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === 'g') {
      const nodeId = (e.currentTarget as any).dataset?.nodeId;
      if (nodeId) {
        setDraggingNode(nodeId);
      } else {
        setIsDraggingCanvas(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    } else {
      setIsDraggingCanvas(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const evt = e as React.MouseEvent;
      if (isDraggingCanvas) {
        const dx = evt.clientX - lastMousePos.x;
        const dy = evt.clientY - lastMousePos.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: evt.clientX, y: evt.clientY });
      }

      if (draggingNode) {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = (evt.clientX - rect.left - pan.x) / zoom;
        const y = (evt.clientY - rect.top - pan.y) / zoom;

        setPositions(prev => ({
          ...prev,
          [draggingNode]: { x, y },
        }));
      }
    },
    [isDraggingCanvas, draggingNode, lastMousePos, pan, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
    setDraggingNode(null);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Keyboard navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedTagId) {
        if (e.key === 'Tab' && tags.length > 0) {
          e.preventDefault();
          setFocusedTagId(tags[0].id);
        }
        return;
      }

      const currentTag = tags.find(t => t.id === focusedTagId);
      if (!currentTag) return;

      // eslint-disable-next-line no-fallthrough
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const children = getChildren(currentTag.id);
          if (children.length > 0) {
            setFocusedTagId(children[0].id);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const parents = getParents(currentTag.id);
          if (parents.length > 0) {
            setFocusedTagId(parents[0].id);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const children = getChildren(currentTag.id);
          if (children.length > 0) {
            setFocusedTagId(children[0].id);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const parents = getParents(currentTag.id);
          if (parents.length > 0) {
            setFocusedTagId(parents[0].id);
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          // Center view on this tag
          if (positions[focusedTagId]) {
            const pos = positions[focusedTagId];
            setPan({ x: 600 - pos.x * zoom, y: 400 - pos.y * zoom });
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setFocusedTagId(null);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTagId, positions, zoom, getChildren, getParents, tags]);

  // FR: Déterminer le style d'un lien selon son type
  // EN: Determine link style based on its type
  const getLinkStyle = (
    sourceId: string,
    targetId: string
  ): {
    marker: string;
    stroke: string;
    strokeDasharray: string | undefined;
  } => {
    const links = getLinksBetween(sourceId, targetId);

    // S'il n'y a pas de lien explicite, utiliser le style hiérarchique par défaut
    if (links.length === 0) {
      return {
        marker: 'url(#arrowhead-hierarchy)',
        stroke: '#666',
        strokeDasharray: undefined,
      };
    }

    // Utiliser le premier lien (il ne devrait y en avoir qu'un normalement)
    const link = links[0];

    switch (link.type) {
      case RelationType.IS_TYPE_OF:
        return {
          marker: 'url(#arrowhead-hierarchy)',
          stroke: '#666',
          strokeDasharray: undefined,
        };
      case RelationType.IS_RELATED_TO:
        return {
          marker: 'url(#arrowhead-related)',
          stroke: '#3b82f6',
          strokeDasharray: '5,5',
        };
      case RelationType.IS_PART_OF:
        return {
          marker: 'url(#arrowhead-part)',
          stroke: '#22c55e',
          strokeDasharray: undefined,
        };
      default:
        return {
          marker: 'url(#arrowhead)',
          stroke: '#ccc',
          strokeDasharray: undefined,
        };
    }
  };

  if (tags.length === 0) {
    return (
      <div className="tag-graph-empty">
        <p>Aucun tag créé. Commencez par ajouter des tags.</p>
      </div>
    );
  }

  const viewWidth = 1200;
  const viewHeight = 800;

  return (
    <div className="tag-graph-container">
      <svg
        ref={svgRef}
        className="tag-graph-svg"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <defs>
          {/* FR: Marqueur par défaut (hérité) */}
          {/* EN: Default marker (legacy) */}
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>

          {/* FR: IS_TYPE_OF - Flèche pleine classique (hiérarchique) */}
          {/* EN: IS_TYPE_OF - Classic filled arrow (hierarchical) */}
          <marker
            id="arrowhead-hierarchy"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>

          {/* FR: IS_RELATED_TO - Flèche ouverte (relation générique) */}
          {/* EN: IS_RELATED_TO - Open arrow (generic relation) */}
          <marker
            id="arrowhead-related"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L10,3 L0,6" fill="none" stroke="#3b82f6" strokeWidth="2" />
          </marker>

          {/* FR: IS_PART_OF - Diamant (composition) */}
          {/* EN: IS_PART_OF - Diamond (composition) */}
          <marker
            id="arrowhead-part"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="4"
            orient="auto"
          >
            <polygon points="0,4 4,0 8,4 4,8" fill="#22c55e" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* FR: Liens (arêtes) */}
          {/* EN: Links (edges) */}
          {tags.map((tag: DagTag) => {
            const sourcePos = positions[tag.id];
            if (!sourcePos) return null;

            return getChildren(tag.id).map((child: DagTag) => {
              const targetPos = positions[child.id];
              if (!targetPos) return null;

              const linkStyle = getLinkStyle(tag.id, child.id);

              return (
                <line
                  key={`link-${tag.id}-${child.id}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={linkStyle.stroke}
                  strokeWidth="2"
                  strokeDasharray={linkStyle.strokeDasharray}
                  markerEnd={linkStyle.marker}
                />
              );
            });
          })}

          {/* FR: Nœuds (tags) */}
          {/* EN: Nodes (tags) */}
          {tags.map((tag: DagTag) => {
            const pos = positions[tag.id];
            if (!pos) return null;

            const bgColor = tag.color || '#3b82f6';
            const isDragging = draggingNode === tag.id;
            const isFocused = focusedTagId === tag.id;

            const getStrokeColor = (): string => {
              if (isDragging) return '#000';
              return isFocused ? '#3b82f6' : 'none';
            };

            const getStrokeWidth = (): string => {
              if (isDragging) return '2';
              return isFocused ? '3' : '0';
            };

            return (
              <g
                key={`node-${tag.id}`}
                data-node-id={tag.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`tag-node ${isDragging ? 'dragging' : ''} ${isFocused ? 'focused' : ''}`}
              >
                {/* Focus ring when selected via keyboard */}
                {isFocused && (
                  <circle
                    cx="0"
                    cy="0"
                    r="65"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="4,2"
                    opacity="0.6"
                  />
                )}

                {/* Nœud rectangle */}
                <rect
                  x="-50"
                  y="-25"
                  width="100"
                  height="50"
                  rx="4"
                  fill={bgColor}
                  stroke={getStrokeColor()}
                  strokeWidth={getStrokeWidth()}
                  className="tag-node-rect"
                  style={{ cursor: 'move' }}
                />

                {/* Texte */}
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  className="tag-node-text"
                  pointerEvents="none"
                >
                  {tag.label.substring(0, 20)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* FR: Contrôles de zoom */}
      {/* EN: Zoom controls */}
      <div className="tag-graph-controls">
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
          title="Zoom out"
          className="control-button"
        >
          −
        </button>
        <span className="zoom-level">{(zoom * 100).toFixed(0)}%</span>
        <button
          type="button"
          onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          title="Zoom in"
          className="control-button"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset view"
          className="control-button"
        >
          Reset
        </button>
      </div>

      {/* FR: Légende des types de relations */}
      {/* EN: Relation types legend */}
      <div className="tag-graph-legend">
        <div className="legend-title">Types de relations</div>
        <div className="legend-items">
          <div className="legend-item">
            <svg width="60" height="20" style={{ marginRight: '8px' }}>
              <line x1="0" y1="10" x2="50" y2="10" stroke="#666" strokeWidth="2" />
              <polygon points="50,10 45,8 45,12" fill="#666" />
            </svg>
            <span>IS_TYPE_OF (Hiérarchie)</span>
          </div>
          <div className="legend-item">
            <svg width="60" height="20" style={{ marginRight: '8px' }}>
              <line
                x1="0"
                y1="10"
                x2="50"
                y2="10"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <path d="M45,8 L50,10 L45,12" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
            <span>IS_RELATED_TO (Relation)</span>
          </div>
          <div className="legend-item">
            <svg width="60" height="20" style={{ marginRight: '8px' }}>
              <line x1="0" y1="10" x2="42" y2="10" stroke="#22c55e" strokeWidth="2" />
              <polygon points="42,10 38,7 46,10 38,13" fill="#22c55e" />
            </svg>
            <span>IS_PART_OF (Composition)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TagGraph;
