/**
 * FR: Tests pour le hook useThemes
 * EN: Tests for useThemes hook
 */

import { renderHook, act } from '@testing-library/react';
import { useThemes } from '../useThemes';
import { PRESET_THEMES, DEFAULT_THEME } from '@bigmind/design';

describe('useThemes', () => {
  it('FR: devrait charger les thèmes prédéfinis | EN: should load preset themes', () => {
    const { result } = renderHook(() => useThemes());

    expect(result.current.allThemes.length).toBeGreaterThan(0);
    expect(result.current.allThemes).toEqual(expect.arrayContaining(PRESET_THEMES));
  });

  it('FR: devrait avoir un thème actif par défaut | EN: should have default active theme', () => {
    const { result } = renderHook(() => useThemes());

    expect(result.current.activeThemeId).toBe(DEFAULT_THEME.id);
    expect(result.current.activeTheme).toEqual(DEFAULT_THEME);
  });

  it('FR: devrait changer le thème actif | EN: should change active theme', () => {
    const { result } = renderHook(() => useThemes());
    const targetTheme = PRESET_THEMES[1];

    act(() => {
      result.current.setActiveTheme(targetTheme.id);
    });

    expect(result.current.activeThemeId).toBe(targetTheme.id);
    expect(result.current.activeTheme.id).toBe(targetTheme.id);
  });

  it('FR: devrait ajouter un thème personnalisé | EN: should add custom theme', () => {
    const { result } = renderHook(() => useThemes());
    const initialCount = result.current.customThemes.length;

    act(() => {
      result.current.createCustomTheme('Mon Thème', {
        description: 'Mon thème personnalisé',
      });
    });

    expect(result.current.customThemes.length).toBe(initialCount + 1);
    expect(result.current.customThemes[initialCount].name).toBe('Mon Thème');
  });

  it('FR: devrait ajouter/retirer des favoris | EN: should toggle favorites', () => {
    const { result } = renderHook(() => useThemes());
    const themeId = PRESET_THEMES[0].id;

    expect(result.current.favoriteThemeIds).not.toContain(themeId);

    act(() => {
      result.current.toggleFavorite(themeId);
    });

    expect(result.current.favoriteThemeIds).toContain(themeId);

    act(() => {
      result.current.toggleFavorite(themeId);
    });

    expect(result.current.favoriteThemeIds).not.toContain(themeId);
  });

  it('FR: devrait exporter un thème en JSON | EN: should export theme to JSON', () => {
    const { result } = renderHook(() => useThemes());
    const themeId = PRESET_THEMES[0].id;

    const json = result.current.exportTheme(themeId);

    expect(json).not.toBeNull();
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json!)).not.toThrow();
  });

  it('FR: devrait importer un thème depuis JSON | EN: should import theme from JSON', () => {
    const { result } = renderHook(() => useThemes());
    const initialCount = result.current.customThemes.length;

    const json = result.current.exportTheme(PRESET_THEMES[0].id);
    if (!json) return;

    act(() => {
      result.current.importTheme(json);
    });

    expect(result.current.customThemes.length).toBe(initialCount + 1);
  });

  it('FR: devrait filtrer les thèmes par catégorie | EN: should filter themes by category', () => {
    const { result } = renderHook(() => useThemes());

    const lightThemes = result.current.getThemesByCategory('light');
    expect(lightThemes.length).toBeGreaterThan(0);
    expect(lightThemes.every((t) => t.category === 'light')).toBe(true);
  });
});
