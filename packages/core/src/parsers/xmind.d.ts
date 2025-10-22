/**
 * FR: Parser unifié pour les fichiers XMind .xmind
 * EN: Unified parser for XMind .xmind files
 *
 * Cette implémentation fonctionne à la fois dans Node.js et dans le navigateur
 * This implementation works both in Node.js and in the browser
 */
import { MindMap } from '../model';
export interface XMindNode {
    id: string;
    title: string;
    children?: XMindNode[];
    style?: {
        color?: string;
        backgroundColor?: string;
        fontSize?: number;
    };
}
export interface XMindMap {
    root: XMindNode;
    metadata: {
        name: string;
        creator: string;
        created: string;
    };
    sheetsMeta?: Array<{
        id: string;
        title: string;
    }>;
    sheetsData?: any[];
    themeColors?: string[];
}
/**
 * FR: Parser unifié pour les fichiers .xmind (format ZIP)
 * EN: Unified parser for .xmind files (ZIP format)
 */
export declare class XMindParser {
    /**
     * FR: Parser un fichier .xmind depuis un ArrayBuffer
     * EN: Parse a .xmind file from ArrayBuffer
     */
    static parse(arrayBuffer: ArrayBuffer): Promise<XMindMap>;
    /**
     * FR: Extraire la palette de couleurs du thème XMind
     * EN: Extract color palette from XMind theme
     */
    private static extractThemeColors;
    /**
     * FR: Parser le JSON contenu dans le fichier .xmind (versions récentes)
     * EN: Parse JSON content in .xmind file (recent versions)
     */
    private static parseJSON;
    /**
     * FR: Convertir une feuille JSON (sheet) en structure BigMind
     * EN: Convert a JSON sheet into BigMind structure
     */
    static convertSheetJSONToBigMind(sheetData: any): any;
    /**
     * FR: Parser un topic JSON récursivement
     * EN: Parse a JSON topic recursively
     */
    private static parseJSONTopic;
    /**
     * FR: Parser le XML contenu dans le fichier .xmind
     * EN: Parse XML content in .xmind file
     */
    private static parseXML;
    /**
     * FR: Parser un topic XMind récursivement
     * EN: Parse an XMind topic recursively
     */
    private static parseTopic;
    /**
     * FR: Parser de fallback pour fichiers .xmind simples
     * EN: Fallback parser for simple .xmind files
     */
    static parseSimple(arrayBuffer: ArrayBuffer): Promise<XMindMap>;
    /**
     * FR: Parser XML simple pour fichiers .xmind basiques
     * EN: Simple XML parser for basic .xmind files
     */
    private static parseXMLSimple;
    /**
     * FR: Convertir un XMindMap vers le format interne BigMind
     * EN: Convert XMindMap to internal BigMind format
     */
    static convertToBigMind(xMindMap: XMindMap): MindMap;
    /**
     * FR: Parser un fichier .xmind depuis une chaîne JSON (méthode de compatibilité)
     * EN: Parse a .xmind file from JSON string (compatibility method)
     *
     * Note: Pour le MVP, on suppose que le fichier a été extrait et converti en JSON
     * Dans une version complète, il faudrait parser le ZIP et les XML internes
     */
    static parseFromJSON(jsonContent: string): MindMap;
    /**
     * FR: Parser récursif des nœuds XMind (méthode de compatibilité)
     * EN: Recursive XMind node parser (compatibility method)
     */
    private static parseNodeRecursive;
    /**
     * FR: Sérialiser une MindMap vers JSON XMind (méthode de compatibilité)
     * EN: Serialize MindMap to XMind JSON (compatibility method)
     */
    static serialize(mindMap: MindMap): string;
    /**
     * FR: Sérialiser un nœud récursivement (méthode de compatibilité)
     * EN: Serialize a node recursively (compatibility method)
     */
    private static serializeNode;
}
//# sourceMappingURL=xmind.d.ts.map