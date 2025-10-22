/**
 * FR: Templates prédéfinis pour BigMind
 * EN: Preset templates for BigMind
 */

import { Template, TemplateCategory, TemplateComplexity, NodeFactory } from '@bigmind/core';

/**
 * FR: Template Brainstorming
 * EN: Brainstorming Template
 */
function createBrainstormingTemplate(): Template {
  const root = NodeFactory.createNode('Idée Principale');

  return {
    metadata: {
      id: 'template-brainstorming',
      name: 'Brainstorming',
      description: 'Pour collecter et organiser les idées rapidement',
      category: TemplateCategory.BRAINSTORMING,
      complexity: TemplateComplexity.SIMPLE,
      isSystem: true,
      tags: ['brainstorming', 'idées', 'créativité', 'collecte'],
      author: 'BigMind',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mindMap: {
      id: 'map-brainstorming',
      rootId: root.id,
      nodes: {
        [root.id]: root,
      },
      meta: {
        name: 'Brainstorming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
    },
    instructions: 'Placez votre sujet principal au centre, puis ajoutez les idées autour en branches',
    suggestedThemeId: 'creative-colorful',
  };
}

/**
 * FR: Template Planification de Projet
 * EN: Project Planning Template
 */
function createProjectPlanningTemplate(): Template {
  const root = NodeFactory.createNode('Nom du Projet');
  const scope = NodeFactory.createNode('Scope', root.id);
  const timeline = NodeFactory.createNode('Timeline', root.id);
  const resources = NodeFactory.createNode('Ressources', root.id);
  const risks = NodeFactory.createNode('Risques', root.id);

  root.children = [scope.id, timeline.id, resources.id, risks.id];

  return {
    metadata: {
      id: 'template-project-planning',
      name: 'Planification de Projet',
      description: 'Structure complète pour planifier un projet',
      category: TemplateCategory.PROJECT_PLANNING,
      complexity: TemplateComplexity.MEDIUM,
      isSystem: true,
      tags: ['projet', 'planification', 'management', 'timeline'],
      author: 'BigMind',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mindMap: {
      id: 'map-project-planning',
      rootId: root.id,
      nodes: {
        [root.id]: root,
        [scope.id]: scope,
        [timeline.id]: timeline,
        [resources.id]: resources,
        [risks.id]: risks,
      },
      meta: {
        name: 'Planification de Projet',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
    },
    instructions: 'Complétez chaque branche : définissez le scope, établissez la timeline, identifiez les ressources et les risques',
    suggestedThemeId: 'corporate',
  };
}

/**
 * FR: Template SWOT Analysis
 * EN: SWOT Analysis Template
 */
function createSwotTemplate(): Template {
  const root = NodeFactory.createNode('SWOT Analysis');
  const strengths = NodeFactory.createNode('Forces (Strengths)', root.id);
  const weaknesses = NodeFactory.createNode('Faiblesses (Weaknesses)', root.id);
  const opportunities = NodeFactory.createNode('Opportunités (Opportunities)', root.id);
  const threats = NodeFactory.createNode('Menaces (Threats)', root.id);

  root.children = [strengths.id, weaknesses.id, opportunities.id, threats.id];

  return {
    metadata: {
      id: 'template-swot',
      name: 'SWOT Analysis',
      description: 'Analyse SWOT complète pour l\'évaluation stratégique',
      category: TemplateCategory.ANALYSIS,
      complexity: TemplateComplexity.MEDIUM,
      isSystem: true,
      tags: ['swot', 'analyse', 'stratégique', 'business'],
      author: 'BigMind',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mindMap: {
      id: 'map-swot',
      rootId: root.id,
      nodes: {
        [root.id]: root,
        [strengths.id]: strengths,
        [weaknesses.id]: weaknesses,
        [opportunities.id]: opportunities,
        [threats.id]: threats,
      },
      meta: {
        name: 'SWOT Analysis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
    },
    instructions: 'Remplissez chaque quadrant avec vos analyses SWOT spécifiques',
    suggestedThemeId: 'classic',
  };
}

/**
 * FR: Template Prise de Décision
 * EN: Decision Making Template
 */
function createDecisionMakingTemplate(): Template {
  const root = NodeFactory.createNode('Décision à Prendre');
  const question = NodeFactory.createNode('Question', root.id);
  const options = NodeFactory.createNode('Options', root.id);
  const pros = NodeFactory.createNode('Avantages', root.id);
  const cons = NodeFactory.createNode('Inconvénients', root.id);
  const decision = NodeFactory.createNode('Décision Finale', root.id);

  root.children = [question.id, options.id, pros.id, cons.id, decision.id];

  return {
    metadata: {
      id: 'template-decision-making',
      name: 'Prise de Décision',
      description: 'Structure pour analyser et prendre une décision éclairée',
      category: TemplateCategory.DECISION_MAKING,
      complexity: TemplateComplexity.SIMPLE,
      isSystem: true,
      tags: ['décision', 'analyse', 'choix', 'réflexion'],
      author: 'BigMind',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mindMap: {
      id: 'map-decision-making',
      rootId: root.id,
      nodes: {
        [root.id]: root,
        [question.id]: question,
        [options.id]: options,
        [pros.id]: pros,
        [cons.id]: cons,
        [decision.id]: decision,
      },
      meta: {
        name: 'Prise de Décision',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
    },
    instructions: 'Explorez la question, les options disponibles, puis pesez les avantages et inconvénients',
    suggestedThemeId: 'classic',
  };
}

/**
 * FR: Template Apprentissage
 * EN: Learning Template
 */
function createLearningTemplate(): Template {
  const root = NodeFactory.createNode('Sujet à Apprendre');
  const concepts = NodeFactory.createNode('Concepts Clés', root.id);
  const examples = NodeFactory.createNode('Exemples', root.id);
  const applications = NodeFactory.createNode('Applications', root.id);
  const questions = NodeFactory.createNode('Questions', root.id);

  root.children = [concepts.id, examples.id, applications.id, questions.id];

  return {
    metadata: {
      id: 'template-learning',
      name: 'Apprentissage',
      description: 'Structurez votre apprentissage avec concepts et exemples',
      category: TemplateCategory.LEARNING,
      complexity: TemplateComplexity.SIMPLE,
      isSystem: true,
      tags: ['apprentissage', 'éducation', 'étude', 'connaissance'],
      author: 'BigMind',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mindMap: {
      id: 'map-learning',
      rootId: root.id,
      nodes: {
        [root.id]: root,
        [concepts.id]: concepts,
        [examples.id]: examples,
        [applications.id]: applications,
        [questions.id]: questions,
      },
      meta: {
        name: 'Apprentissage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
    },
    instructions: 'Définissez les concepts clés, trouvez des exemples concrets et les applications pratiques',
    suggestedThemeId: 'ocean',
  };
}

/**
 * FR: Template Organigramme
 * EN: Organization Chart Template
 */
function createOrganizationTemplate(): Template {
  const root = NodeFactory.createNode('Direction Générale');
  const rh = NodeFactory.createNode('RH', root.id);
  const tech = NodeFactory.createNode('Tech', root.id);
  const marketing = NodeFactory.createNode('Marketing', root.id);

  root.children = [rh.id, tech.id, marketing.id];

  return {
    metadata: {
      id: 'template-organization',
      name: 'Organigramme',
      description: 'Structure organisationnelle et hiérarchie',
      category: TemplateCategory.ORGANIZATION,
      complexity: TemplateComplexity.MEDIUM,
      isSystem: true,
      tags: ['organisation', 'hiérarchie', 'structure', 'équipe'],
      author: 'BigMind',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mindMap: {
      id: 'map-organization',
      rootId: root.id,
      nodes: {
        [root.id]: root,
        [rh.id]: rh,
        [tech.id]: tech,
        [marketing.id]: marketing,
      },
      meta: {
        name: 'Organigramme',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
    },
    instructions: 'Adaptez le modèle à votre structure organisationnelle réelle',
    suggestedThemeId: 'corporate',
  };
}

/**
 * FR: Liste de tous les templates
 * EN: List of all templates
 */
export const PRESET_TEMPLATES: readonly Template[] = [
  createBrainstormingTemplate(),
  createProjectPlanningTemplate(),
  createSwotTemplate(),
  createDecisionMakingTemplate(),
  createLearningTemplate(),
  createOrganizationTemplate(),
] as const;

/**
 * FR: Obtient un template par son ID
 * EN: Gets a template by its ID
 */
export function getTemplateById(id: string): Template | undefined {
  return PRESET_TEMPLATES.find((template) => template.metadata.id === id);
}

/**
 * FR: Obtient les templates par catégorie
 * EN: Gets templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return PRESET_TEMPLATES.filter((template) => template.metadata.category === category);
}

/**
 * FR: Recherche des templates par texte
 * EN: Search templates by text
 */
export function searchTemplates(query: string): Template[] {
  const q = query.toLowerCase();
  return PRESET_TEMPLATES.filter(
    (template) =>
      template.metadata.name.toLowerCase().includes(q) ||
      template.metadata.description.toLowerCase().includes(q) ||
      template.metadata.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
