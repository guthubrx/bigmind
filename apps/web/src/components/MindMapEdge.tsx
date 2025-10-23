/**
 * FR: Composant d'arête de carte mentale personnalisé
 * EN: Custom mind map edge component
 */

import React from 'react';
import { getBezierPath } from '@xyflow/react';

interface MindMapEdgeData {
  isSelected: boolean;
}

type EdgeCompProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: any;
  targetPosition?: any;
  data?: MindMapEdgeData;
  selected?: boolean;
};

function MindMapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeCompProps) {
  // FR: Calculer le chemin de l'arête
  // EN: Calculate edge path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* FR: Ombre de l'arête */}
      {/* EN: Edge shadow */}
      <path
        id={`${id}-shadow`}
        className="mindmap-connection"
        d={edgePath}
        stroke="rgba(0, 0, 0, 0.1)"
        strokeWidth="4"
        fill="none"
        style={{
          filter: 'blur(2px)',
        }}
      />

      {/* FR: Arête principale */}
      {/* EN: Main edge */}
      <path
        id={id}
        className={`mindmap-connection ${selected || data?.isSelected ? 'selected' : ''}`}
        d={edgePath}
        stroke={selected || data?.isSelected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={selected || data?.isSelected ? 3 : 2}
        fill="none"
        style={{
          cursor: 'pointer',
        }}
      />

      {/* FR: Point de connexion au centre */}
      {/* EN: Connection point in center */}
      <circle
        cx={(sourceX + targetX) / 2}
        cy={(sourceY + targetY) / 2}
        r="3"
        fill={selected || data?.isSelected ? '#3b82f6' : '#e5e7eb'}
        className="opacity-0 hover:opacity-100 transition-opacity duration-200"
      />
    </>
  );
}

export default MindMapEdge;
