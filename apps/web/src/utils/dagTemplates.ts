/**
 * FR: Templates de structures DAG prédéfinies
 * EN: Predefined DAG structure templates
 */

import { DagTag, DagLink } from '../types/dag';

export interface DagTemplate {
  name: string;
  description: string;
  tags: DagTag[];
  links: DagLink[];
}

// Modèle: Taxonomie biologique
export const biologicalTaxonomyTemplate: DagTemplate = {
  name: 'Biological Taxonomy',
  description: 'Hierarchical biological classification',
  tags: [
    {
      id: 'kingdom-1',
      label: 'Animalia',
      parentIds: [],
      children: ['phylum-1', 'phylum-2'],
      relations: [],
      color: '#ef4444',
    },
    {
      id: 'phylum-1',
      label: 'Chordata',
      parentIds: ['kingdom-1'],
      children: ['class-1', 'class-2'],
      relations: [],
      color: '#f97316',
    },
    {
      id: 'phylum-2',
      label: 'Arthropoda',
      parentIds: ['kingdom-1'],
      children: ['class-3'],
      relations: [],
      color: '#f97316',
    },
    {
      id: 'class-1',
      label: 'Mammalia',
      parentIds: ['phylum-1'],
      children: [],
      relations: [],
      color: '#eab308',
    },
    {
      id: 'class-2',
      label: 'Aves',
      parentIds: ['phylum-1'],
      children: [],
      relations: [],
      color: '#eab308',
    },
    {
      id: 'class-3',
      label: 'Insecta',
      parentIds: ['phylum-2'],
      children: [],
      relations: [],
      color: '#eab308',
    },
  ],
  links: [],
};

// Modèle: Architecture logicielle
export const softwareArchitectureTemplate: DagTemplate = {
  name: 'Software Architecture',
  description: 'Layered software architecture',
  tags: [
    {
      id: 'arch-1',
      label: 'Application',
      parentIds: [],
      children: ['arch-2', 'arch-3'],
      relations: [],
      color: '#3b82f6',
    },
    {
      id: 'arch-2',
      label: 'Presentation Layer',
      parentIds: ['arch-1'],
      children: ['arch-4'],
      relations: [],
      color: '#06b6d4',
    },
    {
      id: 'arch-3',
      label: 'Business Logic Layer',
      parentIds: ['arch-1'],
      children: ['arch-5'],
      relations: [],
      color: '#06b6d4',
    },
    {
      id: 'arch-4',
      label: 'Data Access Layer',
      parentIds: ['arch-2', 'arch-3'],
      children: ['arch-6'],
      relations: [],
      color: '#8b5cf6',
    },
    {
      id: 'arch-5',
      label: 'Database',
      parentIds: ['arch-4'],
      children: [],
      relations: [],
      color: '#8b5cf6',
    },
    {
      id: 'arch-6',
      label: 'External Services',
      parentIds: ['arch-4'],
      children: [],
      relations: [],
      color: '#ec4899',
    },
  ],
  links: [],
};

// Modèle: Processus de projet
export const projectProcessTemplate: DagTemplate = {
  name: 'Project Process',
  description: 'Waterfall project phases',
  tags: [
    {
      id: 'phase-1',
      label: 'Concept',
      parentIds: [],
      children: ['phase-2'],
      relations: [],
      color: '#22c55e',
    },
    {
      id: 'phase-2',
      label: 'Design',
      parentIds: ['phase-1'],
      children: ['phase-3'],
      relations: [],
      color: '#16a34a',
    },
    {
      id: 'phase-3',
      label: 'Development',
      parentIds: ['phase-2'],
      children: ['phase-4'],
      relations: [],
      color: '#15803d',
    },
    {
      id: 'phase-4',
      label: 'Testing',
      parentIds: ['phase-3'],
      children: ['phase-5'],
      relations: [],
      color: '#166534',
    },
    {
      id: 'phase-5',
      label: 'Deployment',
      parentIds: ['phase-4'],
      children: [],
      relations: [],
      color: '#14532d',
    },
  ],
  links: [],
};

export const templates: DagTemplate[] = [
  biologicalTaxonomyTemplate,
  softwareArchitectureTemplate,
  projectProcessTemplate,
];

export const getTemplate = (name: string): DagTemplate | undefined =>
  templates.find(t => t.name === name);

/**
 * FR: Cloner profondément un tag pour éviter les mutations du template original
 * EN: Deep clone a tag to avoid mutations of the original template
 */
function deepCloneTag(tag: DagTag): DagTag {
  return {
    id: tag.id,
    label: tag.label,
    parentIds: [...tag.parentIds],
    children: [...tag.children],
    relations: tag.relations.map(rel => ({ ...rel })),
    color: tag.color,
  };
}

/**
 * FR: Cloner profondément un lien pour éviter les mutations du template original
 * EN: Deep clone a link to avoid mutations of the original template
 */
function deepCloneLink(link: DagLink): DagLink {
  return {
    id: link.id,
    sourceId: link.sourceId,
    targetId: link.targetId,
    type: link.type,
    metadata: link.metadata ? { ...link.metadata } : undefined,
  };
}

/**
 * FR: Appliquer un template en clonant profondément tous les objets
 * EN: Apply a template by deeply cloning all objects
 */
export const applyTemplate = (template: DagTemplate): { tags: DagTag[]; links: DagLink[] } => ({
  tags: template.tags.map(deepCloneTag),
  links: template.links.map(deepCloneLink),
});
