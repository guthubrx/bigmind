/**
 * FR: Hook pour la gestion des assets (images et stickers)
 * EN: Hook for asset management (images and stickers)
 */

import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  ImageAsset,
  StickerAsset,
  NodeAsset,
  AssetLibrary,
  AssetUtils,
  StickerCategory,
} from '@bigmind/core';
import { ALL_STICKERS, getStickersByCategory, searchStickersByTag } from '@bigmind/design';

interface AssetState {
  libraries: Record<string, AssetLibrary>;
  addImage: (mapId: string, image: ImageAsset) => boolean;
  removeImage: (mapId: string, imageId: string) => void;
  updateImage: (mapId: string, imageId: string, updates: Partial<ImageAsset>) => void;
  addStickerToLibrary: (mapId: string, sticker: StickerAsset) => void;
  removeStickerFromLibrary: (mapId: string, stickerId: string) => void;
  getLibrary: (mapId: string) => AssetLibrary;
}

// FR: Store Zustand pour l'état des assets
// EN: Zustand store for asset state
const useAssetStore = create<AssetState>()(
  persist(
    immer((set, get) => ({
      libraries: {},

      addImage: (mapId: string, image: ImageAsset): boolean => {
        const state = get();
        let library = state.libraries[mapId];

        // FR: Si la bibliothèque n'existe pas, la créer
        // EN: If library doesn't exist, create it
        if (!library) {
          library = AssetUtils.createEmptyLibrary();
        }

        // FR: Vérifier si on peut ajouter l'asset
        // EN: Check if we can add the asset
        if (!AssetUtils.canAddAsset(library, image.size)) return false;

        set((draft) => {
          if (!draft.libraries[mapId]) {
            draft.libraries[mapId] = AssetUtils.createEmptyLibrary();
          }
          draft.libraries[mapId].images[image.id] = image;
          draft.libraries[mapId].totalSize += image.size;
        });

        return true;
      },

      removeImage: (mapId: string, imageId: string) =>
        set((draft) => {
          const lib = draft.libraries[mapId];
          if (!lib || !lib.images[imageId]) return;

          const image = lib.images[imageId];
          draft.libraries[mapId].totalSize -= image.size;
          delete draft.libraries[mapId].images[imageId];
        }),

      updateImage: (mapId: string, imageId: string, updates: Partial<ImageAsset>) =>
        set((draft) => {
          const lib = draft.libraries[mapId];
          if (!lib || !lib.images[imageId]) return;

          draft.libraries[mapId].images[imageId] = {
            ...lib.images[imageId],
            ...updates,
          };
        }),

      addStickerToLibrary: (mapId: string, sticker: StickerAsset) =>
        set((draft) => {
          if (!draft.libraries[mapId]) {
            draft.libraries[mapId] = AssetUtils.createEmptyLibrary();
          }
          draft.libraries[mapId].stickers[sticker.id] = sticker;
        }),

      removeStickerFromLibrary: (mapId: string, stickerId: string) =>
        set((draft) => {
          const lib = draft.libraries[mapId];
          if (lib && lib.stickers[stickerId]) {
            delete draft.libraries[mapId].stickers[stickerId];
          }
        }),

      getLibrary: (mapId: string): AssetLibrary => {
        const state = get();
        return (
          state.libraries[mapId] || {
            images: {},
            stickers: {},
            totalSize: 0,
            sizeLimit: AssetUtils.DEFAULT_SIZE_LIMIT,
          }
        );
      },
    })),
    {
      name: 'bigmind-assets',
      version: 1,
    }
  )
);

/**
 * FR: Hook pour la gestion des assets d'une carte
 * EN: Hook for asset management of a mind map
 */
export function useAssets(mapId: string) {
  const { addImage, removeImage, updateImage, addStickerToLibrary, removeStickerFromLibrary } =
    useAssetStore();

  // FR: S'abonner directement au store pour recevoir les mises à jour
  // EN: Subscribe directly to store to receive updates
  const library = useAssetStore((state) =>
    state.libraries[mapId] || {
      images: {},
      stickers: {},
      totalSize: 0,
      sizeLimit: AssetUtils.DEFAULT_SIZE_LIMIT,
    }
  );

  // FR: Obtient toutes les images
  // EN: Gets all images
  const images = useMemo(() => Object.values(library.images), [library.images]);

  // FR: Obtient tous les stickers dans la bibliothèque
  // EN: Gets all stickers in library
  const customStickers = useMemo(() => Object.values(library.stickers), [library.stickers]);

  // FR: Obtient l'espace disponible
  // EN: Gets available space
  const availableSpace = useMemo(() => {
    return library.sizeLimit - library.totalSize;
  }, [library.sizeLimit, library.totalSize]);

  // FR: Calcule le pourcentage d'utilisation
  // EN: Calculates usage percentage
  const usagePercentage = useMemo(() => {
    return Math.round((library.totalSize / library.sizeLimit) * 100);
  }, [library.totalSize, library.sizeLimit]);

  // FR: Upload une image
  // EN: Uploads an image
  const uploadImage = useCallback(
    async (file: File): Promise<ImageAsset | null> => {
      try {
        // FR: Valider le type MIME
        // EN: Validate MIME type
        if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp'].includes(
          file.type
        )) {
          console.error('Invalid image format');
          return null;
        }

        // FR: Lire le fichier
        // EN: Read file
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // FR: Calculer les dimensions de l'image
        // EN: Calculate image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.src = data;
        });

        // FR: Créer l'asset image
        // EN: Create image asset
        const image: ImageAsset = {
          id: `img-${Date.now()}`,
          type: 'image',
          fileName: file.name,
          mimeType: file.type as ImageAsset['mimeType'],
          data,
          width: dimensions.width,
          height: dimensions.height,
          size: file.size,
          createdAt: new Date().toISOString(),
          alt: file.name,
        };

        // FR: Ajouter à la bibliothèque
        // EN: Add to library
        const added = addImage(mapId, image);
        return added ? image : null;
      } catch (error) {
        console.error('Failed to upload image:', error);
        return null;
      }
    },
    [mapId, addImage]
  );

  // FR: Ajoute un sticker à la bibliothèque
  // EN: Adds a sticker to library
  const addSticker = useCallback(
    (stickerId: string) => {
      const sticker = ALL_STICKERS.find((s) => s.id === stickerId);
      if (sticker) {
        addStickerToLibrary(mapId, sticker);
      }
    },
    [mapId, addStickerToLibrary]
  );

  // FR: Obtient les stickers d'une catégorie
  // EN: Gets stickers of a category
  const getStickersInCategory = useCallback((category: StickerCategory): StickerAsset[] => {
    return getStickersByCategory(category);
  }, []);

  // FR: Recherche des stickers par tag
  // EN: Searches stickers by tag
  const searchStickers = useCallback((tag: string): StickerAsset[] => {
    return searchStickersByTag(tag);
  }, []);

  return {
    // État
    library,
    images,
    customStickers,
    availableSpace,
    usagePercentage,

    // Actions
    uploadImage,
    removeImage: (imageId: string) => removeImage(mapId, imageId),
    updateImage: (imageId: string, updates: Partial<ImageAsset>) =>
      updateImage(mapId, imageId, updates),
    addSticker,
    removeSticker: (stickerId: string) => removeStickerFromLibrary(mapId, stickerId),
    getStickersInCategory,
    searchStickers,
  };
}
