/**
 * FR: Système de gestion des assets (images, stickers) pour BigMind
 * EN: Asset management system (images, stickers) for BigMind
 */

// FR: Position d'un asset sur un nœud
// EN: Asset position on a node
export enum AssetPosition {
  // FR: Icône à gauche du texte
  // EN: Icon left of text
  ICON_LEFT = 'icon-left',

  // FR: Icône à droite du texte
  // EN: Icon right of text
  ICON_RIGHT = 'icon-right',

  // FR: Au-dessus du texte
  // EN: Above text
  ABOVE_TEXT = 'above-text',

  // FR: En-dessous du texte
  // EN: Below text
  BELOW_TEXT = 'below-text',

  // FR: En fond (watermark)
  // EN: Background (watermark)
  BACKGROUND = 'background',

  // FR: Flottant (position absolue)
  // EN: Floating (absolute position)
  FLOATING = 'floating',
}

// FR: Informations sur une image
// EN: Image information
export interface ImageAsset {
  // FR: Identifiant unique
  // EN: Unique identifier
  readonly id: string;

  // FR: Type d'asset
  // EN: Asset type
  readonly type: 'image';

  // FR: Nom du fichier
  // EN: File name
  readonly fileName: string;

  // FR: Format MIME
  // EN: MIME type
  readonly mimeType: 'image/png' | 'image/jpeg' | 'image/svg+xml' | 'image/gif' | 'image/webp';

  // FR: Données base64 ou URL
  // EN: Base64 data or URL
  readonly data: string;

  // FR: Largeur originale (pixels)
  // EN: Original width (pixels)
  readonly width: number;

  // FR: Hauteur originale (pixels)
  // EN: Original height (pixels)
  readonly height: number;

  // FR: Taille du fichier (bytes)
  // EN: File size (bytes)
  readonly size: number;

  // FR: Date d'ajout
  // EN: Added date
  readonly createdAt: string;

  // FR: Texte alternatif (accessibilité)
  // EN: Alternative text (accessibility)
  readonly alt?: string;
}

// FR: Configuration d'un sticker
// EN: Sticker configuration
export interface StickerAsset {
  // FR: Identifiant unique
  // EN: Unique identifier
  readonly id: string;

  // FR: Type d'asset
  // EN: Asset type
  readonly type: 'sticker';

  // FR: Nom du sticker
  // EN: Sticker name
  readonly name: string;

  // FR: Catégorie
  // EN: Category
  readonly category: StickerCategory;

  // FR: Icône (lucide-react icon name ou SVG inline)
  // EN: Icon (lucide-react icon name or inline SVG)
  readonly icon: string;

  // FR: Type d'icône
  // EN: Icon type
  readonly iconType: 'lucide' | 'svg' | 'emoji';

  // FR: Couleur personnalisable
  // EN: Customizable color
  readonly customizable: boolean;

  // FR: Couleur par défaut
  // EN: Default color
  readonly defaultColor?: string;

  // FR: Tags pour la recherche
  // EN: Tags for search
  readonly tags: readonly string[];
}

// FR: Catégories de stickers
// EN: Sticker categories
export enum StickerCategory {
  PRIORITY = 'priority',
  STATUS = 'status',
  PROGRESS = 'progress',
  EMOTION = 'emotion',
  BUSINESS = 'business',
  TECH = 'tech',
  NATURE = 'nature',
  CUSTOM = 'custom',
}

// FR: Asset attaché à un nœud
// EN: Asset attached to a node
export interface NodeAsset {
  // FR: Référence à l'asset
  // EN: Asset reference
  readonly assetId: string;

  // FR: Position sur le nœud
  // EN: Position on node
  readonly position: AssetPosition;

  // FR: Largeur affichée (pixels, optionnel)
  // EN: Display width (pixels, optional)
  readonly displayWidth?: number;

  // FR: Hauteur affichée (pixels, optionnel)
  // EN: Display height (pixels, optional)
  readonly displayHeight?: number;

  // FR: Décalage X pour position flottante
  // EN: X offset for floating position
  readonly offsetX?: number;

  // FR: Décalage Y pour position flottante
  // EN: Y offset for floating position
  readonly offsetY?: number;

  // FR: Opacité (0-1)
  // EN: Opacity (0-1)
  readonly opacity?: number;

  // FR: Couleur personnalisée (pour stickers)
  // EN: Custom color (for stickers)
  readonly customColor?: string;
}

// FR: Bibliothèque d'assets d'une carte
// EN: Mind map asset library
export interface AssetLibrary {
  // FR: Dictionnaire des images
  // EN: Images dictionary
  readonly images: Record<string, ImageAsset>;

  // FR: Dictionnaire des stickers
  // EN: Stickers dictionary
  readonly stickers: Record<string, StickerAsset>;

  // FR: Taille totale (bytes)
  // EN: Total size (bytes)
  readonly totalSize: number;

  // FR: Limite de taille (bytes, défaut 50MB)
  // EN: Size limit (bytes, default 50MB)
  readonly sizeLimit: number;
}

// FR: Utilitaires pour la gestion des assets
// EN: Asset management utilities
export class AssetUtils {
  // FR: Taille maximale par défaut (50MB)
  // EN: Default maximum size (50MB)
  static readonly DEFAULT_SIZE_LIMIT = 50 * 1024 * 1024;

  // FR: Dimensions maximales par défaut pour les images
  // EN: Default maximum dimensions for images
  static readonly MAX_IMAGE_WIDTH = 4096;
  static readonly MAX_IMAGE_HEIGHT = 4096;

  /**
   * FR: Valide qu'une image respecte les contraintes de taille
   * EN: Validates that an image respects size constraints
   */
  static isValidImageSize(width: number, height: number, fileSize: number): boolean {
    return (
      width > 0 &&
      height > 0 &&
      width <= AssetUtils.MAX_IMAGE_WIDTH &&
      height <= AssetUtils.MAX_IMAGE_HEIGHT &&
      fileSize > 0
    );
  }

  /**
   * FR: Vérifie si on peut ajouter un asset à la bibliothèque
   * EN: Checks if an asset can be added to the library
   */
  static canAddAsset(library: AssetLibrary, assetSize: number): boolean {
    return library.totalSize + assetSize <= library.sizeLimit;
  }

  /**
   * FR: Calcule le ratio largeur/hauteur
   * EN: Calculates aspect ratio
   */
  static calculateAspectRatio(width: number, height: number): number {
    return width / height;
  }

  /**
   * FR: Calcule les dimensions pour un redimensionnement proportionnel
   * EN: Calculates dimensions for proportional resize
   */
  static calculateProportionalSize(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
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
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(2))} ${units[i]}`;
  }

  /**
   * FR: Extrait le type MIME depuis une data URL
   * EN: Extracts MIME type from data URL
   */
  static extractMimeType(dataUrl: string): string | null {
    const match = dataUrl.match(/^data:([^;]+);/);
    return match ? match[1] : null;
  }

  /**
   * FR: Vérifie si une chaîne est une data URL base64 valide
   * EN: Checks if string is a valid base64 data URL
   */
  static isValidDataUrl(str: string): boolean {
    return /^data:image\/(png|jpeg|jpg|svg\+xml|gif|webp);base64,/.test(str);
  }

  /**
   * FR: Crée une bibliothèque d'assets vide
   * EN: Creates an empty asset library
   */
  static createEmptyLibrary(): AssetLibrary {
    return {
      images: {},
      stickers: {},
      totalSize: 0,
      sizeLimit: AssetUtils.DEFAULT_SIZE_LIMIT,
    };
  }
}
