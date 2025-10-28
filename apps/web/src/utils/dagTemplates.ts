/**
 * FR: Système de templates DAG avec registre (CORE - minimal)
 * EN: DAG template system with registry (CORE - minimal)
 */

import { DagTag, DagLink } from '../types/dag';

export interface DagTemplate {
  id: string;
  name: string;
  description: string;
  tags: DagTag[];
  links: DagLink[];
  isFavorite?: boolean;
}

/**
 * FR: Registre global des templates (alimenté par les plugins)
 * EN: Global template registry (populated by plugins)
 */
const templateRegistry: Map<string, DagTemplate> = new Map();

/**
 * FR: Enregistrer un template (utilisé par les plugins)
 * EN: Register a template (used by plugins)
 */
export function registerTemplate(template: DagTemplate): void {
  templateRegistry.set(template.id, template);
}

/**
 * FR: Désenregistrer un template (utilisé par les plugins)
 * EN: Unregister a template (used by plugins)
 */
export function unregisterTemplate(templateId: string): void {
  templateRegistry.delete(templateId);
}

/**
 * FR: Enregistrer plusieurs templates à la fois
 * EN: Register multiple templates at once
 */
export function registerTemplates(templates: DagTemplate[]): void {
  templates.forEach(template => registerTemplate(template));
}

/**
 * FR: Obtenir un template par son ID
 * EN: Get a template by its ID
 */
export function getTemplate(templateId: string): DagTemplate | undefined {
  return templateRegistry.get(templateId);
}

/**
 * FR: Obtenir la liste de tous les templates
 * EN: Get list of all templates
 */
export function getAllTemplates(): DagTemplate[] {
  return Array.from(templateRegistry.values());
}

/**
 * FR: Obtenir uniquement les templates favoris
 * EN: Get only favorite templates
 */
export function getFavoriteTemplates(): DagTemplate[] {
  return getAllTemplates().filter(t => t.isFavorite);
}

/**
 * FR: Vérifier si un template existe
 * EN: Check if a template exists
 */
export function hasTemplate(templateId: string): boolean {
  return templateRegistry.has(templateId);
}

/**
 * FR: Fonction utilitaire pour cloner profondément un tag
 * EN: Utility function to deeply clone a tag
 */
const deepCloneTag = (tag: DagTag): DagTag => ({
  ...tag,
  parentIds: [...tag.parentIds],
  children: tag.children ? [...tag.children] : [],
  relations: tag.relations ? [...tag.relations] : [],
});

/**
 * FR: Fonction utilitaire pour cloner profondément un lien
 * EN: Utility function to deeply clone a link
 */
const deepCloneLink = (link: DagLink): DagLink => ({
  ...link,
});

/**
 * FR: Appliquer un template en clonant profondément tous les objets
 * EN: Apply a template by deeply cloning all objects
 */
export const applyTemplate = (template: DagTemplate): { tags: DagTag[]; links: DagLink[] } => ({
  tags: template.tags.map(deepCloneTag),
  links: template.links.map(deepCloneLink),
});
