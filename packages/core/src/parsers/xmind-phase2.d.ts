/**
 * FR: Extensions Phase 2 du parser XMind pour images, stickers et thèmes
 * EN: Phase 2 XMind parser extensions for images, stickers and themes
 */
import JSZip from 'jszip';
import { MindMap } from '../model';
import { ImageAsset, NodeAsset } from '../assets';
/**
 * FR: Extension Phase 2 du parser XMind
 * EN: Phase 2 extension for XMind parser
 */
export declare class XMindPhase2Parser {
    /**
     * FR: Extrait les images d'une archive .xmind
     * EN: Extracts images from .xmind archive
     */
    static extractImagesFromZip(zip: JSZip): Promise<Record<string, ImageAsset>>;
    /**
     * FR: Détermine le type MIME depuis l'extension
     * EN: Determines MIME type from file extension
     */
    private static getMimeType;
    /**
     * FR: Extrait les assets (images/stickers) d'un nœud XMind
     * EN: Extracts assets (images/stickers) from XMind node
     */
    static extractNodeAssets(topicData: any, imageLibrary: Record<string, ImageAsset>): NodeAsset[] | undefined;
    /**
     * FR: Ajoute les assets aux nœuds d'une MindMap
     * EN: Adds assets to nodes of a MindMap
     */
    static enrichMindMapWithAssets(mindMap: MindMap, images: Record<string, ImageAsset>): MindMap;
    /**
     * FR: Ajoute le thème appliqué à la MindMap
     * EN: Adds the applied theme to the MindMap
     */
    static enrichMindMapWithTheme(mindMap: MindMap, themeId: string): MindMap;
    /**
     * FR: Exporte une MindMap vers le format .xmind avec support Phase 2
     * EN: Exports a MindMap to .xmind format with Phase 2 support
     */
    static createXMindFromMindMap(mindMap: MindMap): Promise<Blob>;
    /**
     * FR: Convertit un nœud BigMind en topic XMind
     * EN: Converts BigMind node to XMind topic
     */
    private static convertMindNodeToXMindTopic;
    /**
     * FR: Convertit récursivement un nœud en topic XMind
     * EN: Recursively converts a node to XMind topic
     */
    private static nodeToXMindTopic;
    /**
     * FR: Enregistre une MindMap enrichie au format .xmind
     * EN: Saves an enriched MindMap to .xmind format
     */
    static exportMindMapAsXMind(mindMap: MindMap, fileName: string): Promise<void>;
    /**
     * FR: Valide la compatibilité Phase 2 d'une MindMap
     * EN: Validates Phase 2 compatibility of a MindMap
     */
    static validatePhase2Compatibility(mindMap: MindMap): {
        valid: boolean;
        warnings: string[];
    };
}
//# sourceMappingURL=xmind-phase2.d.ts.map