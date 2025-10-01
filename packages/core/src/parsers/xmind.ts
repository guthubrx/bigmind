/**
 * FR: Parser unifié pour les fichiers XMind .xmind
 * EN: Unified parser for XMind .xmind files
 * 
 * Cette implémentation fonctionne à la fois dans Node.js et dans le navigateur
 * This implementation works both in Node.js and in the browser
 */

import JSZip from 'jszip';
import { MindMap, NodeFactory } from '../model';

// FR: Interface pour les nœuds XMind
// EN: Interface for XMind nodes
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

// FR: Interface pour les cartes XMind
// EN: Interface for XMind maps
export interface XMindMap {
  root: XMindNode;
  metadata: {
    name: string;
    creator: string;
    created: string;
  };
  // FR: Métadonnées des feuilles (onglets) si présentes
  // EN: Sheets (tabs) metadata when present
  sheetsMeta?: Array<{ id: string; title: string }>;
  // FR: Données brutes des feuilles si JSON fourni en tableau
  // EN: Raw sheets data when JSON provided as an array
  sheetsData?: any[];
  // FR: Palette de couleurs du thème pour l'inférence de couleurs par branche
  // EN: Theme color palette for branch color inference
  themeColors?: string[];
}

/**
 * FR: Parser unifié pour les fichiers .xmind (format ZIP)
 * EN: Unified parser for .xmind files (ZIP format)
 */
export class XMindParser {
  /**
   * FR: Parser un fichier .xmind depuis un ArrayBuffer
   * EN: Parse a .xmind file from ArrayBuffer
   */
  static async parse(arrayBuffer: ArrayBuffer): Promise<XMindMap> {
    try {
      // FR: Les fichiers .xmind sont des archives ZIP
      // EN: .xmind files are ZIP archives
      const zip = await JSZip.loadAsync(arrayBuffer);

      // FR: Chercher le fichier content.xml dans l'archive
      // EN: Look for content.xml file in the archive
      let contentFile = zip.file('content.json'); // FR: Prioriser JSON pour les versions récentes

      // FR: Essayer différents chemins possibles
      // EN: Try different possible paths
      if (!contentFile) {
        contentFile =
          zip.file('content.xml') ||
          zip.file('META-INF/content.xml') ||
          zip.file('content/content.xml') ||
          zip.file('document.xml') ||
          zip.file('data.json');
      }

      if (!contentFile) {
        // FR: Lister tous les fichiers pour debug
        // EN: List all files for debug
        const fileNames = Object.keys(zip.files);
        throw new Error(
          `Fichier .xmind invalide : content.xml manquant. Fichiers trouvés: ${fileNames.join(
            ', '
          )}`
        );
      }

      const fileContent = await contentFile.async('text');

      // FR: Détecter le format (XML ou JSON)
      // EN: Detect format (XML or JSON)
      if (contentFile.name.endsWith('.json') || fileContent.trim().startsWith('{')) {
        return this.parseJSON(fileContent);
      }
      
      return this.parseXML(fileContent);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Impossible de parser le fichier .xmind: ${message}`);
    }
  }

  /**
   * FR: Extraire la palette de couleurs du thème XMind
   * EN: Extract color palette from XMind theme
   */
  private static extractThemeColors(themeData: any): string[] {
    if (!themeData || !themeData.map || !themeData.map.properties) {
      return [];
    }

    const multiLineColors = themeData.map.properties['multi-line-colors'];
    if (!multiLineColors || typeof multiLineColors !== 'string') {
      return [];
    }

    // FR: Parser les couleurs séparées par des espaces
    // EN: Parse colors separated by spaces
    return multiLineColors
      .split(' ')
      .map(color => color.trim())
      .filter(color => color.startsWith('#') && color.length >= 4);
  }

  /**
   * FR: Parser le JSON contenu dans le fichier .xmind (versions récentes)
   * EN: Parse JSON content in .xmind file (recent versions)
   */
  private static parseJSON(jsonText: string): XMindMap {
    try {
      const jsonData = JSON.parse(jsonText);

      // FR: Le JSON peut être un tableau de sheets ou un objet
      // EN: JSON can be an array of sheets or an object
      let sheetData;
      let sheetsMeta: Array<{ id: string; title: string }> | undefined;

      if (Array.isArray(jsonData)) {
        [sheetData] = jsonData;
        // FR: Conserver la liste des feuilles pour la barre d'onglets
        // EN: Keep list of sheets for tab bar
        sheetsMeta = jsonData.map((s, idx) => ({
          id: String(s.id || idx),
          title: s.title || s.rootTopic?.title || s.topic?.title || `Feuille ${idx + 1}`,
        }));

        // FR: Extraire la palette de couleurs du thème
        // EN: Extract theme color palette
        const themeColors = this.extractThemeColors(sheetData.theme);

        return {
          root: this.parseJSONTopic(sheetData.rootTopic || sheetData.root || sheetData.topic),
          metadata: {
            name: (sheetData.rootTopic || sheetData).title || 'Carte XMind JSON',
            creator: sheetData.creator || 'XMind',
            created: sheetData.created || new Date().toISOString(),
          },
          sheetsMeta,
          sheetsData: jsonData,
          themeColors,
        } as XMindMap;
      }
      
      if (jsonData.root || jsonData.topic) {
        sheetData = jsonData;
      } else {
        throw new Error('Structure JSON non reconnue');
      }

      // FR: Extraire le rootTopic du sheet
      // EN: Extract rootTopic from sheet
      const rootTopic = sheetData.rootTopic || sheetData.root || sheetData.topic;

      if (!rootTopic) {
        throw new Error('Aucun rootTopic trouvé dans le JSON');
      }

      // FR: Extraire la palette de couleurs du thème
      // EN: Extract theme color palette
      const themeColors = this.extractThemeColors(sheetData.theme);

      return {
        root: this.parseJSONTopic(rootTopic),
        metadata: {
          name: rootTopic.title || sheetData.title || 'Carte XMind JSON',
          creator: sheetData.creator || 'XMind',
          created: sheetData.created || new Date().toISOString(),
        },
        sheetsMeta,
        themeColors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Erreur parsing JSON: ${message}`);
    }
  }

  /**
   * FR: Convertir une feuille JSON (sheet) en structure BigMind
   * EN: Convert a JSON sheet into BigMind structure
   */
  static convertSheetJSONToBigMind(sheetData: any): any {
    const rootTopic = sheetData.rootTopic || sheetData.root || sheetData.topic;
    if (!rootTopic) {
      throw new Error('Sheet JSON invalide: rootTopic manquant');
    }
    const xmindRoot = this.parseJSONTopic(rootTopic);
    const map: XMindMap = {
      root: xmindRoot,
      metadata: {
        name: rootTopic.title || sheetData.title || 'Feuille',
        creator: sheetData.creator || 'XMind',
        created: sheetData.created || new Date().toISOString(),
      },
    };
    return this.convertToBigMind(map);
  }

  /**
   * FR: Parser un topic JSON récursivement
   * EN: Parse a JSON topic recursively
   */
  private static parseJSONTopic(topicData: any): XMindNode {
    const title = topicData.title || topicData.text || topicData.label || '';
    const id = topicData.id || `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const children: XMindNode[] = [];

    // FR: Gérer différentes structures d'enfants
    // EN: Handle different children structures
    if (topicData.children) {
      if (topicData.children.attached && Array.isArray(topicData.children.attached)) {
        // Structure: { children: { attached: [...] } }
        topicData.children.attached.forEach((child: any) => {
          children.push(this.parseJSONTopic(child));
        });
      } else if (Array.isArray(topicData.children)) {
        // Structure: { children: [...] }
        topicData.children.forEach((child: any) => {
          children.push(this.parseJSONTopic(child));
        });
      }
    }

    // FR: Normaliser les styles issus de XMind JSON (fill/background/bgColor, fontColor/color, fontSize)
    // EN: Normalize styles coming from XMind JSON (fill/background/bgColor, fontColor/color, fontSize)
    let style: any;
    if (topicData.style && typeof topicData.style === 'object') {
      const s = topicData.style as any;
      const backgroundColor = s.backgroundColor || s.fill || s.background || s.bgColor;
      const textColor = s.textColor || s.fontColor || s.color;
      const fontSize = s.fontSize || s.size;
      style = {} as any;
      if (backgroundColor) style.backgroundColor = backgroundColor;
      if (textColor) style.textColor = textColor;
      if (fontSize) style.fontSize = Number(fontSize);
    }

    return {
      id,
      title,
      children: children.length > 0 ? children : undefined,
      style,
    };
  }

  /**
   * FR: Parser le XML contenu dans le fichier .xmind
   * EN: Parse XML content in .xmind file
   */
  private static parseXML(xmlText: string): XMindMap {
    // FR: Utiliser DOMParser si disponible (navigateur) ou jsdom (Node.js)
    // EN: Use DOMParser if available (browser) or jsdom (Node.js)
    let xmlDoc: Document;
    
    if (typeof DOMParser !== 'undefined') {
      // Navigateur
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    } else {
      // Node.js - utiliser jsdom
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM(xmlText, { contentType: 'text/xml' });
      xmlDoc = dom.window.document;
    }

    // FR: Vérifier s'il y a des erreurs de parsing
    // EN: Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`Erreur de parsing XML : ${parseError.textContent}`);
    }

    // FR: Essayer différentes structures possibles
    // EN: Try different possible structures
    let workbook = xmlDoc.querySelector('workbook');
    if (!workbook) {
      // FR: Essayer avec un namespace
      // EN: Try with namespace
      workbook =
        xmlDoc.querySelector('xmap-content') ||
        xmlDoc.querySelector('map') ||
        xmlDoc.querySelector('*[local-name()="workbook"]');
    }

    if (!workbook) {
      // FR: Debug : afficher la structure XML pour diagnostic
      // EN: Debug: display XML structure for diagnosis
      const rootElements = Array.from(xmlDoc.documentElement.children).map(el => el.tagName);
      throw new Error(
        `Fichier .xmind invalide : structure XML non reconnue. Éléments trouvés: ${rootElements.join(', ')}`
      );
    }

    const sheet =
      workbook.querySelector('sheet') ||
      workbook.querySelector('topic') ||
      workbook.querySelector('*[local-name()="sheet"]');

    if (!sheet) {
      throw new Error('Fichier .xmind invalide : élément sheet/topic manquant');
    }

    const topic = sheet.querySelector('topic') || sheet;
    if (!topic) {
      throw new Error('Fichier .xmind invalide : élément topic manquant');
    }

    return {
      root: this.parseTopic(topic),
      metadata: {
        name: topic.getAttribute('title') || workbook.getAttribute('title') || 'Carte sans nom',
        creator: workbook.getAttribute('creator') || 'Inconnu',
        created: workbook.getAttribute('created') || new Date().toISOString(),
      },
    };
  }

  /**
   * FR: Parser un topic XMind récursivement
   * EN: Parse an XMind topic recursively
   */
  private static parseTopic(topicElement: Element): XMindNode {
    // FR: Essayer différentes façons de récupérer le titre
    // EN: Try different ways to get the title
    let title = topicElement.getAttribute('title') || '';

    // FR: Si pas d'attribut title, chercher un élément title
    // EN: If no title attribute, look for title element
    if (!title) {
      const titleElement = topicElement.querySelector('title');
      if (titleElement) {
        title = titleElement.textContent || titleElement.getAttribute('text') || '';
      }
    }

    // FR: Si toujours pas de titre, essayer d'autres attributs
    // EN: If still no title, try other attributes
    if (!title) {
      title =
        topicElement.getAttribute('text') ||
        topicElement.getAttribute('label') ||
        topicElement.textContent?.trim() ||
        '';
    }

    const id =
      topicElement.getAttribute('id') ||
      `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const children: XMindNode[] = [];
    const childTopics = topicElement.querySelectorAll(':scope > children > topics > topic');

    childTopics.forEach(childTopic => {
      children.push(this.parseTopic(childTopic));
    });

    // FR: Extraire les styles si présents
    // EN: Extract styles if present
    const styleElement = topicElement.querySelector('style');
    let style: any;

    if (styleElement) {
      style = {};
      const color = styleElement.getAttribute('color');
      const backgroundColor = styleElement.getAttribute('background-color');
      const fontSize = styleElement.getAttribute('font-size');

      if (color) style.color = color;
      if (backgroundColor) style.backgroundColor = backgroundColor;
      if (fontSize) style.fontSize = parseInt(fontSize, 10);
    }

    return {
      id,
      title,
      children: children.length > 0 ? children : undefined,
      style: style && Object.keys(style).length > 0 ? style : undefined,
    };
  }

  /**
   * FR: Parser de fallback pour fichiers .xmind simples
   * EN: Fallback parser for simple .xmind files
   */
  static async parseSimple(arrayBuffer: ArrayBuffer): Promise<XMindMap> {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      // FR: Chercher n'importe quel fichier XML
      // EN: Look for any XML file
      const xmlFiles = Object.keys(zip.files).filter(name => name.endsWith('.xml'));

      if (xmlFiles.length === 0) {
        throw new Error("Aucun fichier XML trouvé dans l'archive");
      }

      // FR: Essayer de parser le premier fichier XML trouvé
      // EN: Try to parse the first XML file found
      const xmlFile = zip.file(xmlFiles[0]);
      if (!xmlFile) {
        throw new Error('Impossible de lire le fichier XML');
      }

      const xmlText = await xmlFile.async('text');
      return this.parseXMLSimple(xmlText);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Impossible de parser le fichier .xmind (mode simple): ${message}`);
    }
  }

  /**
   * FR: Parser XML simple pour fichiers .xmind basiques
   * EN: Simple XML parser for basic .xmind files
   */
  private static parseXMLSimple(xmlText: string): XMindMap {
    // FR: Utiliser DOMParser si disponible (navigateur) ou jsdom (Node.js)
    // EN: Use DOMParser if available (browser) or jsdom (Node.js)
    let xmlDoc: Document;
    
    if (typeof DOMParser !== 'undefined') {
      // Navigateur
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    } else {
      // Node.js - utiliser jsdom
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM(xmlText, { contentType: 'text/xml' });
      xmlDoc = dom.window.document;
    }

    // FR: Chercher n'importe quel élément avec des topics
    // EN: Look for any element with topics
    const topics = xmlDoc.querySelectorAll('topic');

    if (topics.length === 0) {
      throw new Error('Aucun topic trouvé dans le fichier XML');
    }

    // FR: Prendre le premier topic comme racine
    // EN: Take the first topic as root
    const rootTopic = topics[0];

    return {
      root: this.parseTopic(rootTopic),
      metadata: {
        name: rootTopic.getAttribute('title') || 'Carte XMind',
        creator: 'XMind',
        created: new Date().toISOString(),
      },
    };
  }

  /**
   * FR: Convertir un XMindMap vers le format interne BigMind
   * EN: Convert XMindMap to internal BigMind format
   */
  static convertToBigMind(xMindMap: XMindMap): MindMap {
    const nodes: Record<string, any> = {};

    const convertNode = (node: XMindNode, parentId: string | null = null): string => {
      const bigMindNode = {
        id: node.id,
        title: node.title,
        parentId,
        children: [] as string[],
        style: node.style,
      };

      nodes[node.id] = bigMindNode;

      if (node.children) {
        node.children.forEach(child => {
          const childId = convertNode(child, node.id);
          bigMindNode.children.push(childId);
        });
      }

      return node.id;
    };

    const rootId = convertNode(xMindMap.root);

    return {
      id: `map_${Date.now()}`,
      rootId,
      nodes,
      meta: {
        name: xMindMap.metadata.name,
        createdAt: xMindMap.metadata.created,
        updatedAt: new Date().toISOString(),
        locale: 'fr',
        version: '1.0.0',
      },
      // FR: Inclure la palette de couleurs du thème pour l'inférence
      // EN: Include theme color palette for inference
      themeColors: xMindMap.themeColors,
    };
  }

  /**
   * FR: Parser un fichier .xmind depuis une chaîne JSON (méthode de compatibilité)
   * EN: Parse a .xmind file from JSON string (compatibility method)
   * 
   * Note: Pour le MVP, on suppose que le fichier a été extrait et converti en JSON
   * Dans une version complète, il faudrait parser le ZIP et les XML internes
   */
  static parseFromJSON(jsonContent: string): MindMap {
    try {
      const xmindData = JSON.parse(jsonContent);
      // FR: Créer la carte mentale
      // EN: Create mind map
      const mindMap = NodeFactory.createEmptyMindMap(xmindData.title || 'Carte XMind importée');
      // FR: Parser le nœud racine
      // EN: Parse root node
      if (xmindData.root) {
        this.parseNodeRecursive(xmindData.root, mindMap, mindMap.rootId, 0, 0);
      }
      return mindMap;
    } catch (error) {
      throw new Error(
        `Erreur lors du parsing XMind: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * FR: Parser récursif des nœuds XMind (méthode de compatibilité)
   * EN: Recursive XMind node parser (compatibility method)
   */
  private static parseNodeRecursive(
    xmindNode: any,
    mindMap: MindMap,
    parentId: string,
    x: number,
    y: number
  ): void {
    const nodeId = xmindNode.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // FR: Créer le nœud
    // EN: Create the node
    const node = NodeFactory.createNode(
      xmindNode.title || xmindNode.text || 'Nœud sans titre',
      parentId,
      xmindNode.style
    );
    
    // FR: Définir l'ID et la position
    // EN: Set ID and position
    node.id = nodeId;
    node.x = x;
    node.y = y;

    mindMap.nodes[nodeId] = node;

    // FR: Ajouter l'enfant au parent
    // EN: Add child to parent
    if (parentId && mindMap.nodes[parentId]) {
      mindMap.nodes[parentId].children.push(nodeId);
    }

    // FR: Parser récursivement les enfants
    // EN: Parse children recursively
    if (xmindNode.children && Array.isArray(xmindNode.children)) {
      xmindNode.children.forEach((child: any, index: number) => {
        const childX = x + (index - xmindNode.children.length / 2) * 200;
        const childY = y + 150;
        this.parseNodeRecursive(child, mindMap, nodeId, childX, childY);
      });
    }
  }

  /**
   * FR: Sérialiser une MindMap vers JSON XMind (méthode de compatibilité)
   * EN: Serialize MindMap to XMind JSON (compatibility method)
   */
  static serialize(mindMap: MindMap): string {
    const rootNode = mindMap.nodes[mindMap.rootId];
    if (!rootNode) {
      throw new Error('Nœud racine introuvable');
    }

    const xmindData = {
      title: mindMap.meta.name,
      root: this.serializeNode(rootNode, mindMap),
    };

    return JSON.stringify(xmindData, null, 2);
  }

  /**
   * FR: Sérialiser un nœud récursivement (méthode de compatibilité)
   * EN: Serialize a node recursively (compatibility method)
   */
  private static serializeNode(node: any, mindMap: MindMap): any {
    const xmindNode: any = {
      id: node.id,
      title: node.title,
      style: node.style,
    };

    if (node.children && node.children.length > 0) {
      xmindNode.children = node.children.map((childId: string) => {
        const childNode = mindMap.nodes[childId];
        return childNode ? this.serializeNode(childNode, mindMap) : null;
      }).filter(Boolean);
    }

    return xmindNode;
  }
}
