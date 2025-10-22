/**
 * FR: Composant de visualisation du graphe DAG de tags avec D3.js
 * EN: DAG tag graph visualization component with D3.js
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3dag from 'd3-dag';
import { useTagGraph } from '../hooks/useTagGraph';
import {
  D3TagNode,
  D3TagLink,
  TagGraphEvents,
  TagRelationType,
} from '../types/dag';
import { Network, Eye, EyeOff } from 'lucide-react';

interface TagGraphProps extends TagGraphEvents {
  className?: string;
}

export function TagGraph({
  className = '',
  onNodeClick,
  onNodeDoubleClick,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  onLinkClick,
  onNodeHover,
  onLinkCreate,
}: TagGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const {
    tags,
    links,
    selectedTagId,
    hoveredTagId,
    graphOptions,
    selectTag,
    hoverTag,
    addLink,
    checkCycle,
  } = useTagGraph();

  const [shiftPressed, setShiftPressed] = useState(false);
  const [selectedForLink, setSelectedForLink] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState<TagRelationType>('is-type-of');

  // FR: Gérer les touches clavier pour les modes de liaison
  // EN: Handle keyboard keys for link modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftPressed(true);
      if (e.key === 'Alt') setLinkMode('is-part-of');
      if (e.ctrlKey || e.metaKey) setLinkMode('is-related-to');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
        setSelectedForLink(null);
      }
      if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta') {
        setLinkMode('is-type-of');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // FR: Créer et mettre à jour le graphe D3
  // EN: Create and update D3 graph
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = graphOptions.width || 800;
    const height = graphOptions.height || 600;

    // FR: Créer le conteneur principal avec zoom et pan
    // EN: Create main container with zoom and pan
    const g = svg.append('g');

    // FR: Préparer les données pour d3-dag
    // EN: Prepare data for d3-dag
    const nodeMap = new Map<string, D3TagNode>();
    tags.forEach(tag => {
      nodeMap.set(tag.id, { ...tag } as D3TagNode);
    });

    // FR: Construire la hiérarchie DAG
    // EN: Build DAG hierarchy
    try {
      const dag = d3dag.dagStratify<D3TagNode>()
        .id(d => d.id)
        .parentIds(d => d.parents || [])(Array.from(nodeMap.values()));

      // FR: Appliquer le layout Sugiyama
      // EN: Apply Sugiyama layout
      const layout = d3dag.sugiyama()
        .size([width * 0.8, height * 0.8])
        .layering(d3dag.layeringSimplex())
        .decross(d3dag.decrossOpt())
        .coord(d3dag.coordVert());

      layout(dag);

      // FR: Définir les marqueurs de flèche
      // EN: Define arrow markers
      const defs = svg.append('defs');

      ['is-type-of', 'is-related-to', 'is-part-of'].forEach(type => {
        defs.append('marker')
          .attr('id', `arrow-${type}`)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 25)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', type === 'is-type-of' ? '#2563EB' :
            type === 'is-part-of' ? '#6B7280' : '#8B5CF6');
      });

      // FR: Créer les liens
      // EN: Create links
      const linkSelection = g.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(dag.links())
        .enter()
        .append('path')
        .attr('d', d => {
          const source = d.source as any;
          const target = d.target as any;
          return d3dag.dagConnect(source, target);
        })
        .attr('stroke', d => {
          const link = links.find(l =>
            l.source === (d.source as any).data.id &&
            l.target === (d.target as any).data.id
          );
          return link?.type === 'is-type-of' ? '#2563EB' :
            link?.type === 'is-part-of' ? '#6B7280' : '#8B5CF6';
        })
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', d => {
          const link = links.find(l =>
            l.source === (d.source as any).data.id &&
            l.target === (d.target as any).data.id
          );
          return link?.type === 'is-related-to' ? '5,5' : 'none';
        })
        .attr('fill', 'none')
        .attr('marker-end', d => {
          const link = links.find(l =>
            l.source === (d.source as any).data.id &&
            l.target === (d.target as any).data.id
          );
          return `url(#arrow-${link?.type || 'is-type-of'})`;
        })
        .on('click', function(event, d) {
          const link = links.find(l =>
            l.source === (d.source as any).data.id &&
            l.target === (d.target as any).data.id
          );
          if (link && onLinkClick) {
            onLinkClick(link as D3TagLink);
          }
        });

      // FR: Créer les nœuds
      // EN: Create nodes
      const nodeGroup = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(dag.descendants())
        .enter()
        .append('g')
        .attr('transform', d => `translate(${(d as any).x + width * 0.1},${(d as any).y + height * 0.1})`);

      // FR: Ajouter les cercles de nœuds
      // EN: Add node circles
      nodeGroup.append('circle')
        .attr('r', graphOptions.nodeRadius || 20)
        .attr('fill', '#FFFFFF')
        .attr('stroke', d => {
          const tagData = (d as any).data as D3TagNode;
          return tagData.id === selectedTagId ? '#2563EB' :
            tagData.id === hoveredTagId ? '#60A5FA' : '#D1D5DB';
        })
        .attr('stroke-width', d => {
          const tagData = (d as any).data as D3TagNode;
          return tagData.id === selectedTagId ? 3 : 2;
        })
        .attr('cursor', 'pointer')
        .on('click', function(event, d) {
          const tagData = (d as any).data as D3TagNode;

          if (shiftPressed && selectedForLink) {
            // FR: Mode création de lien
            // EN: Link creation mode
            if (selectedForLink !== tagData.id && !checkCycle(selectedForLink, tagData.id)) {
              addLink({
                source: selectedForLink,
                target: tagData.id,
                type: linkMode,
              });
              if (onLinkCreate) {
                onLinkCreate(selectedForLink, tagData.id, linkMode);
              }
            }
            setSelectedForLink(null);
          } else if (shiftPressed) {
            setSelectedForLink(tagData.id);
          } else {
            selectTag(tagData.id);
            if (onNodeClick) {
              onNodeClick(tagData);
            }
          }
        })
        .on('dblclick', function(event, d) {
          const tagData = (d as any).data as D3TagNode;
          if (onNodeDoubleClick) {
            onNodeDoubleClick(tagData);
          }
        })
        .on('mouseenter', function(event, d) {
          const tagData = (d as any).data as D3TagNode;
          hoverTag(tagData.id);
          if (onNodeHover) {
            onNodeHover(tagData);
          }
          d3.select(this).attr('stroke', '#60A5FA');
        })
        .on('mouseleave', function(event, d) {
          const tagData = (d as any).data as D3TagNode;
          hoverTag(null);
          if (onNodeHover) {
            onNodeHover(null);
          }
          d3.select(this).attr('stroke', tagData.id === selectedTagId ? '#2563EB' : '#D1D5DB');
        });

      // FR: Ajouter les labels
      // EN: Add labels
      if (graphOptions.showLabels !== false) {
        nodeGroup.append('text')
          .text(d => (d as any).data.label)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', '12px')
          .attr('font-weight', d => {
            const tagData = (d as any).data as D3TagNode;
            return tagData.id === selectedTagId ? 'bold' : 'normal';
          })
          .attr('pointer-events', 'none')
          .attr('fill', '#111827');
      }

      // FR: Implémenter le drag & drop si activé
      // EN: Implement drag & drop if enabled
      if (graphOptions.enableDrag) {
        const dragBehavior = d3.drag<any, any>()
          .on('start', function(event, d) {
            const tagData = (d as any).data as D3TagNode;
            if (onNodeDragStart) {
              onNodeDragStart(tagData);
            }
          })
          .on('drag', function(event, d) {
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr('transform', `translate(${event.x},${event.y})`);

            const tagData = (d as any).data as D3TagNode;
            if (onNodeDrag) {
              onNodeDrag(tagData);
            }

            // FR: Mettre à jour les liens connectés
            // EN: Update connected links
            linkSelection
              .attr('d', linkData => {
                const source = linkData.source as any;
                const target = linkData.target as any;
                return d3dag.dagConnect(source, target);
              });
          })
          .on('end', function(event, d) {
            const tagData = (d as any).data as D3TagNode;
            if (onNodeDragEnd) {
              onNodeDragEnd(tagData);
            }
          });

        nodeGroup.call(dragBehavior as any);
      }

      // FR: Implémenter le zoom et pan si activés
      // EN: Implement zoom and pan if enabled
      if (graphOptions.enableZoom || graphOptions.enablePan) {
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });

        if (!graphOptions.enableZoom) {
          zoom.scaleExtent([1, 1]);
        }

        svg.call(zoom);
      }

    } catch (error) {
      console.error('Erreur lors de la construction du DAG:', error);
    }
  }, [tags, links, selectedTagId, hoveredTagId, graphOptions, shiftPressed, selectedForLink, linkMode]);

  return (
    <div className={`relative ${className}`}>
      {/* FR: Contrôles du graphe / EN: Graph controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-xs font-medium text-gray-700">Mode de lien:</div>
        <select
          value={linkMode}
          onChange={(e) => setLinkMode(e.target.value as TagRelationType)}
          className="text-xs px-2 py-1 border rounded"
        >
          <option value="is-type-of">Est un type de</option>
          <option value="is-related-to">Est relié à</option>
          <option value="is-part-of">Fait partie de</option>
        </select>

        {shiftPressed && (
          <div className="text-xs text-blue-600 font-medium">
            {selectedForLink
              ? `Sélectionnez le tag cible pour ${selectedForLink}`
              : 'Sélectionnez le tag source'}
          </div>
        )}
      </div>

      {/* FR: Légende / EN: Legend */}
      {graphOptions.showRelationTypes && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Types de relations:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#2563EB" strokeWidth="2" />
              </svg>
              <span className="text-xs">Est un type de</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
              <span className="text-xs">Est relié à</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#6B7280" strokeWidth="2" />
              </svg>
              <span className="text-xs">Fait partie de</span>
            </div>
          </div>
        </div>
      )}

      {/* FR: Canvas SVG principal / EN: Main SVG canvas */}
      <svg
        ref={svgRef}
        width={graphOptions.width || 800}
        height={graphOptions.height || 600}
        className="border border-gray-200 rounded-lg bg-gray-50"
      />
    </div>
  );
}