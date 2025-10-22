/**
 * FR: Système de gestion des assets (images, stickers) pour BigMind
 * EN: Asset management system (images, stickers) for BigMind
 */
// FR: Position d'un asset sur un nœud
// EN: Asset position on a node
export var AssetPosition;
(function (AssetPosition) {
    // FR: Icône à gauche du texte
    // EN: Icon left of text
    AssetPosition["ICON_LEFT"] = "icon-left";
    // FR: Icône à droite du texte
    // EN: Icon right of text
    AssetPosition["ICON_RIGHT"] = "icon-right";
    // FR: Au-dessus du texte
    // EN: Above text
    AssetPosition["ABOVE_TEXT"] = "above-text";
    // FR: En-dessous du texte
    // EN: Below text
    AssetPosition["BELOW_TEXT"] = "below-text";
    // FR: En fond (watermark)
    // EN: Background (watermark)
    AssetPosition["BACKGROUND"] = "background";
    // FR: Flottant (position absolue)
    // EN: Floating (absolute position)
    AssetPosition["FLOATING"] = "floating";
})(AssetPosition || (AssetPosition = {}));
// FR: Catégories de stickers
// EN: Sticker categories
export var StickerCategory;
(function (StickerCategory) {
    StickerCategory["PRIORITY"] = "priority";
    StickerCategory["STATUS"] = "status";
    StickerCategory["PROGRESS"] = "progress";
    StickerCategory["EMOTION"] = "emotion";
    StickerCategory["BUSINESS"] = "business";
    StickerCategory["TECH"] = "tech";
    StickerCategory["NATURE"] = "nature";
    StickerCategory["CUSTOM"] = "custom";
})(StickerCategory || (StickerCategory = {}));
// FR: Utilitaires pour la gestion des assets
// EN: Asset management utilities
export class AssetUtils {
    // FR: Taille maximale par défaut (50MB)
    // EN: Default maximum size (50MB)
    static DEFAULT_SIZE_LIMIT = 50 * 1024 * 1024;
    // FR: Dimensions maximales par défaut pour les images
    // EN: Default maximum dimensions for images
    static MAX_IMAGE_WIDTH = 4096;
    static MAX_IMAGE_HEIGHT = 4096;
    /**
     * FR: Valide qu'une image respecte les contraintes de taille
     * EN: Validates that an image respects size constraints
     */
    static isValidImageSize(width, height, fileSize) {
        return (width > 0 &&
            height > 0 &&
            width <= AssetUtils.MAX_IMAGE_WIDTH &&
            height <= AssetUtils.MAX_IMAGE_HEIGHT &&
            fileSize > 0);
    }
    /**
     * FR: Vérifie si on peut ajouter un asset à la bibliothèque
     * EN: Checks if an asset can be added to the library
     */
    static canAddAsset(library, assetSize) {
        return library.totalSize + assetSize <= library.sizeLimit;
    }
    /**
     * FR: Calcule le ratio largeur/hauteur
     * EN: Calculates aspect ratio
     */
    static calculateAspectRatio(width, height) {
        return width / height;
    }
    /**
     * FR: Calcule les dimensions pour un redimensionnement proportionnel
     * EN: Calculates dimensions for proportional resize
     */
    static calculateProportionalSize(originalWidth, originalHeight, targetWidth, targetHeight) {
        const aspectRatio = AssetUtils.calculateAspectRatio(originalWidth, originalHeight);
        if (targetWidth && !targetHeight) {
            return {
                width: targetWidth,
                height: Math.round(targetWidth / aspectRatio),
            };
        }
        if (targetHeight && !targetWidth) {
            return {
                width: Math.round(targetHeight * aspectRatio),
                height: targetHeight,
            };
        }
        // FR: Si les deux sont spécifiés, privilégier targetWidth
        // EN: If both specified, prefer targetWidth
        if (targetWidth && targetHeight) {
            return {
                width: targetWidth,
                height: Math.round(targetWidth / aspectRatio),
            };
        }
        return { width: originalWidth, height: originalHeight };
    }
    /**
     * FR: Convertit une taille en octets en format lisible
     * EN: Converts byte size to human-readable format
     */
    static formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / k ** i).toFixed(2))} ${units[i]}`;
    }
    /**
     * FR: Extrait le type MIME depuis une data URL
     * EN: Extracts MIME type from data URL
     */
    static extractMimeType(dataUrl) {
        const match = dataUrl.match(/^data:([^;]+);/);
        return match ? match[1] : null;
    }
    /**
     * FR: Vérifie si une chaîne est une data URL base64 valide
     * EN: Checks if string is a valid base64 data URL
     */
    static isValidDataUrl(str) {
        return /^data:image\/(png|jpeg|jpg|svg\+xml|gif|webp);base64,/.test(str);
    }
    /**
     * FR: Crée une bibliothèque d'assets vide
     * EN: Creates an empty asset library
     */
    static createEmptyLibrary() {
        return {
            images: {},
            stickers: {},
            totalSize: 0,
            sizeLimit: AssetUtils.DEFAULT_SIZE_LIMIT,
        };
    }
}
//# sourceMappingURL=assets.js.map