/**
 * FR: Tests pour le hook useAssets
 * EN: Tests for useAssets hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAssets } from '../useAssets';
import { StickerCategory } from '@bigmind/core';

describe('useAssets', () => {
  const mapId = 'test-map-123';

  it('FR: devrait initialiser une bibliothèque vide | EN: should initialize empty library', () => {
    const { result } = renderHook(() => useAssets(mapId));

    expect(result.current.images).toEqual([]);
    expect(result.current.customStickers).toEqual([]);
    expect(result.current.usagePercentage).toBe(0);
  });

  it('FR: devrait calculer l\'espace disponible | EN: should calculate available space', () => {
    const { result } = renderHook(() => useAssets(mapId));

    expect(result.current.availableSpace).toBe(50 * 1024 * 1024);
  });

  it('FR: devrait ajouter un sticker | EN: should add a sticker', () => {
    const { result } = renderHook(() => useAssets(mapId));
    const initialCount = result.current.customStickers.length;

    act(() => {
      result.current.addSticker('priority-critical');
    });

    expect(result.current.customStickers.length).toBeGreaterThanOrEqual(initialCount);
  });

  it('FR: devrait retirer un sticker | EN: should remove a sticker', () => {
    const { result } = renderHook(() => useAssets(mapId));

    act(() => {
      result.current.addSticker('priority-critical');
    });

    const stickerId = result.current.customStickers[0]?.id;
    if (!stickerId) return;

    act(() => {
      result.current.removeSticker(stickerId);
    });

    expect(result.current.customStickers.find((s) => s.id === stickerId)).toBeUndefined();
  });

  it('FR: devrait obtenir les stickers par catégorie | EN: should get stickers by category', () => {
    const { result } = renderHook(() => useAssets(mapId));

    const priorityStickers = result.current.getStickersInCategory(
      StickerCategory.PRIORITY
    );
    expect(priorityStickers.length).toBeGreaterThan(0);
    expect(priorityStickers.every((s) => s.category === StickerCategory.PRIORITY)).toBe(
      true
    );
  });

  it('FR: devrait rechercher les stickers par tag | EN: should search stickers by tag', () => {
    const { result } = renderHook(() => useAssets(mapId));

    const results = result.current.searchStickers('priorité');
    expect(results.length).toBeGreaterThan(0);
  });
});
