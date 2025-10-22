/**
 * FR: Tests pour le hook useTemplates
 * EN: Tests for useTemplates hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTemplates } from '../useTemplates';
import { PRESET_TEMPLATES, TemplateCategory } from '@bigmind/design';
import { MindMap } from '@bigmind/core';

describe('useTemplates', () => {
  it('FR: devrait charger les templates prédéfinis | EN: should load preset templates', () => {
    const { result } = renderHook(() => useTemplates());

    expect(result.current.allTemplates.length).toBeGreaterThanOrEqual(PRESET_TEMPLATES.length);
  });

  it('FR: devrait obtenir un template par ID | EN: should get template by ID', () => {
    const { result } = renderHook(() => useTemplates());
    const templateId = PRESET_TEMPLATES[0].metadata.id;

    const template = result.current.getTemplateById(templateId);
    expect(template).toBeDefined();
    expect(template?.metadata.id).toBe(templateId);
  });

  it('FR: devrait créer une carte depuis un template | EN: should create mind map from template', () => {
    const { result } = renderHook(() => useTemplates());
    const templateId = PRESET_TEMPLATES[0].metadata.id;

    let mindMap: MindMap | null = null;
    act(() => {
      mindMap = result.current.createMindMapFromTemplate(templateId, 'Ma Nouvelle Carte');
    });

    expect(mindMap).not.toBeNull();
    expect(mindMap?.meta.name).toBe('Ma Nouvelle Carte');
  });

  it('FR: devrait ajouter un template aux récents | EN: should add template to recent', () => {
    const { result } = renderHook(() => useTemplates());
    const templateId = PRESET_TEMPLATES[0].metadata.id;

    act(() => {
      result.current.createMindMapFromTemplate(templateId);
    });

    expect(result.current.recentTemplateIds).toContain(templateId);
  });

  it('FR: devrait gérer les favoris | EN: should manage favorites', () => {
    const { result } = renderHook(() => useTemplates());
    const templateId = PRESET_TEMPLATES[0].metadata.id;

    expect(result.current.favoriteTemplateIds).not.toContain(templateId);

    act(() => {
      result.current.toggleFavorite(templateId);
    });

    expect(result.current.favoriteTemplateIds).toContain(templateId);
  });

  it('FR: devrait filtrer les templates par catégorie | EN: should filter templates by category', () => {
    const { result } = renderHook(() => useTemplates());

    const brainTemplates = result.current.getTemplatesByCategory(TemplateCategory.BRAINSTORMING);
    expect(brainTemplates.length).toBeGreaterThan(0);
  });

  it('FR: devrait rechercher les templates par texte | EN: should search templates by text', () => {
    const { result } = renderHook(() => useTemplates());

    const results = result.current.searchByText('Brainstorming');
    expect(results.length).toBeGreaterThan(0);
  });

  it('FR: devrait exporter un template en JSON | EN: should export template to JSON', () => {
    const { result } = renderHook(() => useTemplates());
    const templateId = PRESET_TEMPLATES[0].metadata.id;

    const json = result.current.exportTemplate(templateId);

    expect(json).not.toBeNull();
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json!)).not.toThrow();
  });

  it('FR: devrait créer un template personnalisé depuis une carte | EN: should create custom template from mind map', () => {
    const { result } = renderHook(() => useTemplates());
    const initialCount = result.current.customTemplates.length;

    // FR: Créer une carte de test
    // EN: Create test mind map
    const mindMap = result.current.createMindMapFromTemplate(
      PRESET_TEMPLATES[0].metadata.id
    );
    if (!mindMap) return;

    act(() => {
      result.current.createTemplateFromMindMap(
        mindMap,
        'Mon Template',
        TemplateCategory.BRAINSTORMING
      );
    });

    expect(result.current.customTemplates.length).toBe(initialCount + 1);
  });
});
