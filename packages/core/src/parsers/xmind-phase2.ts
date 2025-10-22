/**
 * FR: Extensions Phase 2 du parser XMind pour images, stickers et thèmes
 * EN: Phase 2 XMind parser extensions for images, stickers and themes
 */

import JSZip from 'jszip';
import { MindMap, MindNode, NodeFactory } from '../model';
import { ImageAsset, StickerAsset, NodeAsset, AssetLibrary, AssetUtils, AssetPosition } from '../assets';
import type { XMindMap } from './xmind';

/**
 * FR: Extension Phase 2 du parser XMind
 * EN: Phase 2 extension for XMind parser
 */
export class XMindPhase2Parser {
  /**
   * FR: Extrait les images d'une archive .xmind
   * EN: Extracts images from .xmind archive
   */
  static async extractImagesFromZip(zip: JSZip): Promise<Record<string, ImageAsset>> {
    const images: Record<string, ImageAsset> = {};

    // FR: Chercher les images dans le répertoire 'images' ou 'media'
    // EN: Look for images in 'images' or 'media' directories
    const imageFiles = Object.keys(zip.files).filter(
      (name) =>
        (name.startsWith('images/') || name.startsWith('media/')) &&
        /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)
    );

    for (const filePath of imageFiles) {
      try {
        const file = zip.file(filePath);
        if (!file) continue;

        const data = await file.async('base64');
        const size = data.length;
        const fileName = filePath.split('/').pop() || filePath;
        const mimeType = this.getMimeType(filePath);

        if (!mimeType) continue;

        const image: ImageAsset = {
          id: `img-${fileName}-${Date.now()}`,
          type: 'image',
          fileName,
          mimeType: mimeType as ImageAsset['mimeType'],
          data: `data:${mimeType};base64,${data}`,
          width: 0, // FR: À calculer depuis les métadonnées ou l'image elle-même
          height: 0,
          size,
          createdAt: new Date().toISOString(),
          alt: fileName,
        };

        images[image.id] = image;
      } catch (error) {
        console.warn(`Erreur lors de l'extraction de l'image ${filePath}:`, error);
      }
    }

    return images;
  }

  /**
   * FR: Détermine le type MIME depuis l'extension
   * EN: Determines MIME type from file extension
   */
  private static getMimeType(
    filePath: string
  ): string | null {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return mimeMap[ext || ''] || null;
  }

  /**
   * FR: Extrait les assets (images/stickers) d'un nœud XMind
   * EN: Extracts assets (images/stickers) from XMind node
   */
  static extractNodeAssets(
    topicData: any,
    imageLibrary: Record<string, ImageAsset>
  ): NodeAsset[] | undefined {
    const assets: NodeAsset[] = [];

    // FR: Chercher les images associées au nœud
    // EN: Look for images associated with the node
    if (topicData.href && typeof topicData.href === 'string') {
      // FR: href peut pointer vers une image locale
      // EN: href might point to a local image
      const hrefImage = Object.values(imageLibrary).find(
        (img) =>
          img.fileName === topicData.href ||
          img.data.includes(topicData.href)
      );

      if (hrefImage) {
        assets.push({
          assetId: hrefImage.id,
          position: AssetPosition.ICON_LEFT,
          displayWidth: 24,
          displayHeight: 24,
        });
      }
    }

    // FR: Chercher les stickers dans les propriétés personnalisées
    // EN: Look for stickers in custom properties
    if (topicData.markers && Array.isArray(topicData.markers)) {
      topicData.markers.forEach((marker: any) => {
        if (marker.markerId) {
          // FR: Les marqueurs XMind peuvent représenter des stickers
          // EN: XMind markers might represent stickers
          const stickerAsset: NodeAsset = {
            assetId: `sticker-${marker.markerId}`,
            position: AssetPosition.ICON_RIGHT,
          };
          assets.push(stickerAsset);
        }
      });
    }

    return assets.length > 0 ? assets : undefined;
  }

  /**
   * FR: Ajoute les assets aux nœuds d'une MindMap
   * EN: Adds assets to nodes of a MindMap
   */
  static enrichMindMapWithAssets(
    mindMap: MindMap,
    images: Record<string, ImageAsset>
  ): MindMap {
    return {
      ...mindMap,
      assetLibrary: {
        images,
        stickers: {},
        totalSize: Object.values(images).reduce((sum, img) => sum + img.size, 0),
        sizeLimit: AssetUtils.DEFAULT_SIZE_LIMIT,
      },
    };
  }

  /**
   * FR: Ajoute le thème appliqué à la MindMap
   * EN: Adds the applied theme to the MindMap
   */
  static enrichMindMapWithTheme(
    mindMap: MindMap,
    themeId: string
  ): MindMap {
    return {
      ...mindMap,
      themeId,
    };
  }

  /**
   * FR: Exporte une MindMap vers le format .xmind avec support Phase 2
   * EN: Exports a MindMap to .xmind format with Phase 2 support
   */
  static async createXMindFromMindMap(mindMap: MindMap): Promise<Blob> {
    const zip = new JSZip();

    // FR: Créer la structure du content.json
    // EN: Create content.json structure
    const contentData = {
      id: mindMap.id,
      version: '2.0',
      title: mindMap.meta.name,
      rootTopic: this.convertMindNodeToXMindTopic(mindMap),
      metadata: {
        creator: mindMap.meta.author || 'BigMind',
        created: mindMap.meta.createdAt,
        modified: mindMap.meta.updatedAt,
      },
      themeId: mindMap.themeId || 'default',
    };

    zip.file('content.json', JSON.stringify(contentData, null, 2));

    // FR: Ajouter les images à l'archive
    // EN: Add images to archive
    if (mindMap.assetLibrary?.images) {
      for (const [, image] of Object.entries(mindMap.assetLibrary.images)) {
        // FR: Extraire les données base64
        // EN: Extract base64 data
        const base64Data = image.data.split(',')[1];
        if (base64Data) {
          zip.file(`images/${image.fileName}`, base64Data, { base64: true });
        }
      }
    }

    // FR: Ajouter les métadonnées
    // EN: Add metadata
    const metadata = {
      version: '1.0',
      creator: 'BigMind Phase 2',
      created: new Date().toISOString(),
    };
    zip.file('metadata.json', JSON.stringify(metadata));

    // FR: Générer le blob final
    // EN: Generate final blob
    return zip.generateAsync({ type: 'blob' });
  }

  /**
   * FR: Convertit un nœud BigMind en topic XMind
   * EN: Converts BigMind node to XMind topic
   */
  private static convertMindNodeToXMindTopic(mindMap: MindMap): any {
    const root = mindMap.nodes[mindMap.rootId];
    if (!root) return null;

    return this.nodeToXMindTopic(root, mindMap);
  }

  /**
   * FR: Convertit récursivement un nœud en topic XMind
   * EN: Recursively converts a node to XMind topic
   */
  private static nodeToXMindTopic(node: MindNode, mindMap: MindMap): any {
    const topic: any = {
      id: node.id,
      title: node.title,
    };

    // FR: Ajouter le style si présent
    // EN: Add style if present
    if (node.style) {
      topic.style = {
        backgroundColor: node.style.backgroundColor,
        textColor: node.style.textColor,
        fontSize: node.style.fontSize,
      };
    }

    // FR: Ajouter les enfants récursivement
    // EN: Add children recursively
    if (node.children.length > 0) {
      topic.children = {
        attached: node.children
          .map((childId) => mindMap.nodes[childId])
          .filter((child): child is MindNode => !!child)
          .map((child) => this.nodeToXMindTopic(child, mindMap)),
      };
    }

    // FR: Ajouter les assets si présents
    // EN: Add assets if present
    if (node.assets && node.assets.length > 0) {
      topic.assets = node.assets;
    }

    // FR: Ajouter les notes si présentes
    // EN: Add notes if present
    if (node.notes) {
      topic.notes = { plain: { content: node.notes } };
    }

    return topic;
  }

  /**
   * FR: Enregistre une MindMap enrichie au format .xmind
   * EN: Saves an enriched MindMap to .xmind format
   */
  static async exportMindMapAsXMind(
    mindMap: MindMap,
    fileName: string
  ): Promise<void> {
    try {
      const blob = await this.createXMindFromMindMap(mindMap);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.xmind`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export XMind:', error);
      throw error;
    }
  }

  /**
   * FR: Valide la compatibilité Phase 2 d'une MindMap
   * EN: Validates Phase 2 compatibility of a MindMap
   */
  static validatePhase2Compatibility(mindMap: MindMap): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // FR: Vérifier les images
    // EN: Check images
    if (mindMap.assetLibrary?.images) {
      const totalSize = Object.values(mindMap.assetLibrary.images).reduce(
        (sum, img) => sum + img.size,
        0
      );
      if (totalSize > AssetUtils.DEFAULT_SIZE_LIMIT) {
        warnings.push(
          `Total des images (${AssetUtils.formatFileSize(totalSize)}) dépasse la limite`
        );
      }
    }

    // FR: Vérifier les assets des nœuds
    // EN: Check node assets
    for (const node of Object.values(mindMap.nodes)) {
      if (node.assets && node.assets.length > 10) {
        warnings.push(`Le nœud "${node.title}" a plus de 10 assets`);
      }
    }

    // FR: Vérifier le thème
    // EN: Check theme
    if (mindMap.themeId && mindMap.themeId.length > 100) {
      warnings.push('ID de thème anormalement long');
    }

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }
}
