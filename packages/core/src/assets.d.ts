/**
 * FR: Système de gestion des assets (images, stickers) pour BigMind
 * EN: Asset management system (images, stickers) for BigMind
 */
export declare enum AssetPosition {
    ICON_LEFT = "icon-left",
    ICON_RIGHT = "icon-right",
    ABOVE_TEXT = "above-text",
    BELOW_TEXT = "below-text",
    BACKGROUND = "background",
    FLOATING = "floating"
}
export interface ImageAsset {
    readonly id: string;
    readonly type: 'image';
    readonly fileName: string;
    readonly mimeType: 'image/png' | 'image/jpeg' | 'image/svg+xml' | 'image/gif' | 'image/webp';
    readonly data: string;
    readonly width: number;
    readonly height: number;
    readonly size: number;
    readonly createdAt: string;
    readonly alt?: string;
}
export interface StickerAsset {
    readonly id: string;
    readonly type: 'sticker';
    readonly name: string;
    readonly category: StickerCategory;
    readonly icon: string;
    readonly iconType: 'lucide' | 'svg' | 'emoji';
    readonly customizable: boolean;
    readonly defaultColor?: string;
    readonly tags: readonly string[];
}
export declare enum StickerCategory {
    PRIORITY = "priority",
    STATUS = "status",
    PROGRESS = "progress",
    EMOTION = "emotion",
    BUSINESS = "business",
    TECH = "tech",
    NATURE = "nature",
    CUSTOM = "custom"
}
export interface NodeAsset {
    readonly assetId: string;
    readonly position: AssetPosition;
    readonly displayWidth?: number;
    readonly displayHeight?: number;
    readonly offsetX?: number;
    readonly offsetY?: number;
    readonly opacity?: number;
    readonly customColor?: string;
}
export interface AssetLibrary {
    readonly images: Record<string, ImageAsset>;
    readonly stickers: Record<string, StickerAsset>;
    readonly totalSize: number;
    readonly sizeLimit: number;
}
export declare class AssetUtils {
    static readonly DEFAULT_SIZE_LIMIT: number;
    static readonly MAX_IMAGE_WIDTH = 4096;
    static readonly MAX_IMAGE_HEIGHT = 4096;
    /**
     * FR: Valide qu'une image respecte les contraintes de taille
     * EN: Validates that an image respects size constraints
     */
    static isValidImageSize(width: number, height: number, fileSize: number): boolean;
    /**
     * FR: Vérifie si on peut ajouter un asset à la bibliothèque
     * EN: Checks if an asset can be added to the library
     */
    static canAddAsset(library: AssetLibrary, assetSize: number): boolean;
    /**
     * FR: Calcule le ratio largeur/hauteur
     * EN: Calculates aspect ratio
     */
    static calculateAspectRatio(width: number, height: number): number;
    /**
     * FR: Calcule les dimensions pour un redimensionnement proportionnel
     * EN: Calculates dimensions for proportional resize
     */
    static calculateProportionalSize(originalWidth: number, originalHeight: number, targetWidth?: number, targetHeight?: number): {
        width: number;
        height: number;
    };
    /**
     * FR: Convertit une taille en octets en format lisible
     * EN: Converts byte size to human-readable format
     */
    static formatFileSize(bytes: number): string;
    /**
     * FR: Extrait le type MIME depuis une data URL
     * EN: Extracts MIME type from data URL
     */
    static extractMimeType(dataUrl: string): string | null;
    /**
     * FR: Vérifie si une chaîne est une data URL base64 valide
     * EN: Checks if string is a valid base64 data URL
     */
    static isValidDataUrl(str: string): boolean;
    /**
     * FR: Crée une bibliothèque d'assets vide
     * EN: Creates an empty asset library
     */
    static createEmptyLibrary(): AssetLibrary;
}
//# sourceMappingURL=assets.d.ts.map