/**
 * FR: Algorithmes de layout pour les graphes DAG
 * EN: Layout algorithms for DAG graphs
 */

import { DagTag } from '../types/dag';

export interface NodePosition {
  x: number;
  y: number;
}

export type LayoutAlgorithm = 'hierarchical' | 'circular' | 'force-directed' | 'radial';

/**
 * FR: Layout hiérarchique (parent au-dessus des enfants)
 * EN: Hierarchical layout (parents above children)
 */
export const hierarchicalLayout = (
  tags: Record<string, DagTag>,
  getChildren: (tagId: string) => DagTag[],
  getParents: (tagId: string) => DagTag[]
): Record<string, NodePosition> => {
  const positions: Record<string, NodePosition> = {};
  const levels = new Map<number, string[]>();
  const visited = new Set<string>();
  const depth = new Map<string, number>();

  const assignDepth = (tagId: string, d: number) => {
    if (visited.has(tagId)) return;
    visited.add(tagId);
    depth.set(tagId, d);

    getParents(tagId).forEach((parent: DagTag) => {
      assignDepth(parent.id, d - 1);
    });

    getChildren(tagId).forEach((child: DagTag) => {
      assignDepth(child.id, d + 1);
    });
  };

  Object.keys(tags).forEach((tagId: string) => {
    if (!visited.has(tagId)) {
      assignDepth(tagId, 0);
    }
  });

  depth.forEach((d: number, tagId: string) => {
    const level = d + 100;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level)!.push(tagId);
  });

  let maxWidth = 0;
  Array.from(levels.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([, nodeIds]: [number, string[]], levelIndex: number) => {
      const y = levelIndex * 120;
      const width = nodeIds.length * 180;
      maxWidth = Math.max(maxWidth, width);

      nodeIds.forEach((nodeId: string, index: number) => {
        const x = index * 180 - (nodeIds.length * 180) / 2 + maxWidth / 2;
        positions[nodeId] = { x, y };
      });
    });

  return positions;
};

/**
 * FR: Layout circulaire
 * EN: Circular layout
 */
export const circularLayout = (tags: Record<string, DagTag>): Record<string, NodePosition> => {
  const positions: Record<string, NodePosition> = {};
  const tagIds = Object.keys(tags);
  const radius = 200;
  const centerX = 300;
  const centerY = 200;

  tagIds.forEach((tagId: string, index: number) => {
    const angle = (index / tagIds.length) * 2 * Math.PI;
    positions[tagId] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return positions;
};

/**
 * FR: Layout radial (centré sur les racines)
 * EN: Radial layout (centered on roots)
 */
export const radialLayout = (
  tags: Record<string, DagTag>,
  getChildren: (tagId: string) => DagTag[]
): Record<string, NodePosition> => {
  const positions: Record<string, NodePosition> = {};
  const visited = new Set<string>();

  const rootTags = Object.values(tags).filter(
    (tag: DagTag) => !tag.parentIds || tag.parentIds.length === 0
  );

  let angleOffset = 0;
  const layerRadius = 120;

  const layoutNode = (tagId: string, depth: number, angle: number) => {
    if (visited.has(tagId)) return;
    visited.add(tagId);

    const radius = depth * layerRadius;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);

    positions[tagId] = { x, y };

    const children = getChildren(tagId);
    const angleStep = (2 * Math.PI) / Math.max(children.length, 1);

    children.forEach((child: DagTag, index: number) => {
      layoutNode(child.id, depth + 1, angle + index * angleStep);
    });
  };

  rootTags.forEach((root: DagTag) => {
    const angle = angleOffset;
    layoutNode(root.id, 0, angle);
    angleOffset += (2 * Math.PI) / Math.max(rootTags.length, 1);
  });

  return positions;
};

/**
 * FR: Layout force-directed (simulation physique simple)
 * EN: Force-directed layout (simple physics simulation)
 */
export const forceDirectedLayout = (
  tags: Record<string, DagTag>,
  getChildren: (tagId: string) => DagTag[],
  iterations: number = 100
): Record<string, NodePosition> => {
  const positions: Record<string, NodePosition> = {};
  const velocity: Record<string, { vx: number; vy: number }> = {};

  const tagIds = Object.keys(tags);

  // Initialize random positions
  tagIds.forEach((tagId: string) => {
    positions[tagId] = {
      x: Math.random() * 400,
      y: Math.random() * 400,
    };
    velocity[tagId] = { vx: 0, vy: 0 };
  });

  // Simulation
  for (let iter = 0; iter < iterations; iter += 1) {
    // Reset velocities
    tagIds.forEach((tagId: string) => {
      velocity[tagId] = { vx: 0, vy: 0 };
    });

    // Repulsive forces (all nodes repel each other)
    for (let i = 0; i < tagIds.length; i += 1) {
      for (let j = i + 1; j < tagIds.length; j += 1) {
        const id1 = tagIds[i];
        const id2 = tagIds[j];
        const dx = positions[id2].x - positions[id1].x;
        const dy = positions[id2].y - positions[id1].y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const force = 100 / (dist * dist);

        velocity[id1].vx -= (force * dx) / dist;
        velocity[id1].vy -= (force * dy) / dist;
        velocity[id2].vx += (force * dx) / dist;
        velocity[id2].vy += (force * dy) / dist;
      }
    }

    // Attractive forces (connected nodes attract)
    tagIds.forEach((tagId: string) => {
      const children = getChildren(tagId);
      children.forEach((child: DagTag) => {
        const dx = positions[child.id].x - positions[tagId].x;
        const dy = positions[child.id].y - positions[tagId].y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const force = (dist * dist) / 50;

        velocity[tagId].vx += (force * dx) / dist;
        velocity[tagId].vy += (force * dy) / dist;
      });
    });

    // Update positions
    const damping = 0.8;
    tagIds.forEach((tagId: string) => {
      positions[tagId].x += velocity[tagId].vx * damping;
      positions[tagId].y += velocity[tagId].vy * damping;

      // Boundary conditions
      positions[tagId].x = Math.max(50, Math.min(750, positions[tagId].x));
      positions[tagId].y = Math.max(50, Math.min(550, positions[tagId].y));
    });
  }

  return positions;
};

export const applyLayout = (
  algorithm: LayoutAlgorithm,
  tags: Record<string, DagTag>,
  getChildren: (tagId: string) => DagTag[],
  getParents: (tagId: string) => DagTag[]
): Record<string, NodePosition> => {
  switch (algorithm) {
    case 'hierarchical':
      return hierarchicalLayout(tags, getChildren, getParents);
    case 'circular':
      return circularLayout(tags);
    case 'radial':
      return radialLayout(tags, getChildren);
    case 'force-directed':
      return forceDirectedLayout(tags, getChildren);
    default:
      return hierarchicalLayout(tags, getChildren, getParents);
  }
};
