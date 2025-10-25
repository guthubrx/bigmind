/**
 * FR: Composant de visualisation du graphe DAG avec SVG
 * EN: DAG graph visualization component with SVG
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { DagTag } from '../types/dag';
import './TagGraph.css';

interface NodePosition {
  x: number;
  y: number;
}

function TagGraph() {
  const tags = useTagGraph((state: any) => Object.values(state.tags) as DagTag[]);
  const getChildren = useTagGraph((state: any) => state.getChildren);
  const getParents = useTagGraph((state: any) => state.getParents);

  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [focusedTagId, setFocusedTagId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Create stable dependency key based on tag IDs
  const tagIdKey = useMemo(() => {
    return tags.map(t => t.id).join(',');
  }, [tags]);

  // FR: Calculer les positions des nœuds avec un algorithme hiérarchique simple
  // EN: Calculate node positions with simple hierarchical algorithm
  // Note: Using tagIdKey to prevent infinite loops from getChildren/getParents changing refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [tagIdKey]);

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
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
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

              return (
                <line
                  key={`link-${tag.id}-${child.id}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="#ccc"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
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
    </div>
  );
}

export default TagGraph;
