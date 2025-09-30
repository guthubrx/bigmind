/**
 * FR: Parser pour les fichiers XMind .xmind
 * EN: Parser for XMind .xmind files
 */

import JSZip from 'jszip';

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
  // FR: Métadonnées des feuilles (onglets) si présentes
  // EN: Sheets (tabs) metadata when present
  sheetsMeta?: Array<{ id: string; title: string }>;
  // FR: Données brutes des feuilles si JSON fourni en tableau
  // EN: Raw sheets data when JSON provided as an array
  sheetsData?: any[];
}

/**
 * FR: Parser pour les fichiers .xmind (format ZIP)
 * EN: Parser for .xmind files (ZIP format)
 */
export class XMindParser {
  /**
   * FR: Parser un fichier .xmind depuis un ArrayBuffer
   * EN: Parse a .xmind file from ArrayBuffer
   */
  static async parse(arrayBuffer: ArrayBuffer): Promise<XMindMap> {
    try {
      console.warn('🔍 XMindParser.parse - Début du parsing, taille:', arrayBuffer.byteLength);
      
      // FR: Les fichiers .xmind sont des archives ZIP
      // EN: .xmind files are ZIP archives
      const zip = await JSZip.loadAsync(arrayBuffer);
      console.warn('📦 Archive ZIP chargée');
      
      // FR: Lister tous les fichiers pour diagnostic
      // EN: List all files for diagnosis
      const allFiles = Object.keys(zip.files);
      console.warn('📁 Tous les fichiers dans l\'archive:', allFiles);
      
      // FR: Chercher le fichier content.xml dans l'archive
      // EN: Look for content.xml file in the archive
      let contentFile = zip.file('content.json'); // FR: Prioriser JSON pour les versions récentes
      
      // FR: Essayer différents chemins possibles
      // EN: Try different possible paths
      if (!contentFile) {
        contentFile = zip.file('content.xml') ||
                     zip.file('META-INF/content.xml') ||
                     zip.file('content/content.xml') ||
                     zip.file('document.xml') ||
                     zip.file('data.json');
      }

      if (!contentFile) {
        // FR: Lister tous les fichiers pour debug
        // EN: List all files for debug
        const fileNames = Object.keys(zip.files);
        console.warn('Fichiers trouvés dans l\'archive:', fileNames);
        throw new Error('Fichier .xmind invalide : content.xml manquant. Fichiers trouvés: ' + fileNames.join(', '));
      }

      console.warn('Fichier trouvé:', contentFile.name);
      const fileContent = await contentFile.async('text');
      // console.warn('Contenu lu, longueur:', fileContent.length);
      
      // FR: Détecter le format (XML ou JSON)
      // EN: Detect format (XML or JSON)
      if (contentFile.name.endsWith('.json') || fileContent.trim().startsWith('{')) {
        // console.warn('Format JSON détecté');
        return this.parseJSON(fileContent);
      } else {
        // console.warn('Format XML détecté');
        const result = this.parseXML(fileContent);
        // console.warn('Parsing XML réussi');
        return result;
      }
    } catch (error) {
      console.error('Erreur lors du parsing du fichier .xmind:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Impossible de parser le fichier .xmind: ${message}`);
    }
  }

  /**
   * FR: Parser le JSON contenu dans le fichier .xmind (versions récentes)
   * EN: Parse JSON content in .xmind file (recent versions)
   */
  private static parseJSON(jsonText: string): XMindMap {
    // console.warn('XMindParser.parseJSON - start');
    try {
      const jsonData = JSON.parse(jsonText);
      // console.warn('Structure JSON keys:', Object.keys(jsonData));
      
      // FR: Le JSON peut être un tableau de sheets ou un objet
      // EN: JSON can be an array of sheets or an object
      let sheetData;
      let sheetsMeta: Array<{ id: string; title: string }> | undefined;
      
      if (Array.isArray(jsonData)) {
        // console.warn('JSON array: taking first sheet');
        [sheetData] = jsonData;
        // FR: Conserver la liste des feuilles pour la barre d'onglets
        // EN: Keep list of sheets for tab bar
        sheetsMeta = jsonData.map((s, idx) => ({
          id: String(s.id || idx),
          title: s.title || s.rootTopic?.title || s.topic?.title || `Feuille ${idx + 1}`,
        }));
        // FR: Conserver les données des feuilles
        // EN: Keep raw sheets data
        const sheetsData = jsonData;
        
        // Construire le retour avec sheetsData plus bas
        const x = {
          root: this.parseJSONTopic(sheetData.rootTopic || sheetData.root || sheetData.topic),
          metadata: {
            name: (sheetData.rootTopic || sheetData).title || 'Carte XMind JSON',
            creator: sheetData.creator || 'XMind',
            created: sheetData.created || new Date().toISOString()
          },
          sheetsMeta,
          sheetsData,
        } as XMindMap;
        return x;
      } else if (jsonData.root || jsonData.topic) {
        // console.warn('JSON object with root/topic');
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
      
      // console.warn('RootTopic trouvé:', rootTopic.title);
      
      return {
        root: this.parseJSONTopic(rootTopic),
        metadata: {
          name: rootTopic.title || sheetData.title || 'Carte XMind JSON',
          creator: sheetData.creator || 'XMind',
          created: sheetData.created || new Date().toISOString()
        },
        sheetsMeta,
      };
    } catch (error) {
      console.error('❌ Erreur parsing JSON:', error);
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
    // console.warn('parseJSONTopic data');
    
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
    
    return {
      id,
      title,
      children: children.length > 0 ? children : undefined,
      style: topicData.style
    };
  }

  /**
   * FR: Parser le XML contenu dans le fichier .xmind
   * EN: Parse XML content in .xmind file
   */
  private static parseXML(xmlText: string): XMindMap {
    console.warn('🔍 XMindParser.parseXML - Début du parsing XML');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // FR: Vérifier s'il y a des erreurs de parsing
    // EN: Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('❌ Erreur de parsing XML:', parseError.textContent);
      throw new Error('Erreur de parsing XML : ' + parseError.textContent);
    }

    console.warn('📄 Document XML parsé, élément racine:', xmlDoc.documentElement.tagName);
    
    // FR: Essayer différentes structures possibles
    // EN: Try different possible structures
    let workbook = xmlDoc.querySelector('workbook');
    if (!workbook) {
      // FR: Essayer avec un namespace
      // EN: Try with namespace
      workbook = xmlDoc.querySelector('xmap-content') || 
                 xmlDoc.querySelector('map') ||
                 xmlDoc.querySelector('*[local-name()="workbook"]');
    }

    if (!workbook) {
      // FR: Debug : afficher la structure XML pour diagnostic
      // EN: Debug: display XML structure for diagnosis
      console.warn('📄 Structure XML trouvée:', xmlDoc.documentElement.tagName);
      console.warn('📄 Éléments racine:', Array.from(xmlDoc.documentElement.children).map(el => el.tagName));
      throw new Error('Fichier .xmind invalide : structure XML non reconnue. Éléments trouvés: ' + 
                     Array.from(xmlDoc.documentElement.children).map(el => el.tagName).join(', '));
    }

    console.warn('📄 Workbook trouvé:', workbook.tagName);
    const sheet = workbook.querySelector('sheet') || 
                 workbook.querySelector('topic') ||
                 workbook.querySelector('*[local-name()="sheet"]');

    if (!sheet) {
      console.error('❌ Aucun sheet/topic trouvé');
      throw new Error('Fichier .xmind invalide : élément sheet/topic manquant');
    }

    console.warn('📄 Sheet trouvé:', sheet.tagName);
    const topic = sheet.querySelector('topic') || sheet;
    if (!topic) {
      console.error('❌ Aucun topic trouvé');
      throw new Error('Fichier .xmind invalide : élément topic manquant');
    }

    console.warn('📄 Topic racine trouvé:', topic.getAttribute('title'));
    const result = {
      root: this.parseTopic(topic),
      metadata: {
        name: topic.getAttribute('title') || workbook.getAttribute('title') || 'Carte sans nom',
        creator: workbook.getAttribute('creator') || 'Inconnu',
        created: workbook.getAttribute('created') || new Date().toISOString()
      }
    };
    
    console.warn('✅ Parsing XML terminé avec succès');
    return result;
  }

  /**
   * FR: Parser un topic XMind récursivement
   * EN: Parse an XMind topic recursively
   */
  private static parseTopic(topicElement: Element): XMindNode {
    console.warn('🔍 parseTopic - Élément:', topicElement.tagName, 'attributs:', Array.from(topicElement.attributes).map(a => `${a.name}="${a.value}"`));
    
    // FR: Essayer différentes façons de récupérer le titre
    // EN: Try different ways to get the title
    let title = topicElement.getAttribute('title') || '';
    
    // FR: Si pas d'attribut title, chercher un élément title
    // EN: If no title attribute, look for title element
    if (!title) {
      const titleElement = topicElement.querySelector('title');
      if (titleElement) {
        title = titleElement.textContent || titleElement.getAttribute('text') || '';
        console.warn('📄 Titre trouvé dans élément title:', title);
      }
    }
    
    // FR: Si toujours pas de titre, essayer d'autres attributs
    // EN: If still no title, try other attributes
    if (!title) {
      title = topicElement.getAttribute('text') || 
              topicElement.getAttribute('label') || 
              topicElement.textContent?.trim() || '';
      console.warn('📄 Titre trouvé dans autres attributs:', title);
    }
    
    console.warn('📄 Titre final:', title);
    
    const id = topicElement.getAttribute('id') || `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const children: XMindNode[] = [];
    const childTopics = topicElement.querySelectorAll(':scope > children > topics > topic');
    
    childTopics.forEach(childTopic => {
      children.push(this.parseTopic(childTopic));
    });

    // FR: Extraire les styles si présents
    // EN: Extract styles if present
    const styleElement = topicElement.querySelector('style');
    let style: any = undefined;
    
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
      style: style && Object.keys(style).length > 0 ? style : undefined
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
        throw new Error('Aucun fichier XML trouvé dans l\'archive');
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
      console.error('Erreur lors du parsing simple du fichier .xmind:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Impossible de parser le fichier .xmind (mode simple): ${message}`);
    }
  }

  /**
   * FR: Parser XML simple pour fichiers .xmind basiques
   * EN: Simple XML parser for basic .xmind files
   */
  private static parseXMLSimple(xmlText: string): XMindMap {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
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
        created: new Date().toISOString()
      }
    };
  }

  /**
   * FR: Convertir un XMindMap vers le format interne BigMind
   * EN: Convert XMindMap to internal BigMind format
   */
  static convertToBigMind(xMindMap: XMindMap): any {
    const nodes: Record<string, any> = {};

    const convertNode = (node: XMindNode, parentId: string | null = null): any => {
      const bigMindNode = {
        id: node.id,
        title: node.title,
        parentId,
        children: [] as string[],
        style: node.style
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
      name: xMindMap.metadata.name,
      rootId,
      nodes,
      meta: {
        name: xMindMap.metadata.name,
        createdAt: xMindMap.metadata.created,
        updatedAt: new Date().toISOString(),
        locale: 'fr'
      }
    };
  }
}
