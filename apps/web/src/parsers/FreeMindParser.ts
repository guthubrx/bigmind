/**
 * FR: Parser pour les fichiers FreeMind .mm
 * EN: Parser for FreeMind .mm files
 */

export interface FreeMindNode {
  id: string;
  text: string;
  children?: FreeMindNode[];
  attributes?: {
    FOLDED?: string;
    COLOR?: string;
    STYLE?: string;
  };
}

export interface FreeMindMap {
  root: FreeMindNode;
  metadata: {
    version: string;
    name: string;
  };
}

/**
 * FR: Parser XML simple pour les fichiers .mm
 * EN: Simple XML parser for .mm files
 */
export class FreeMindParser {
  /**
   * FR: Parser un fichier .mm depuis le texte XML
   * EN: Parse a .mm file from XML text
   */
  static parse(xmlText: string): FreeMindMap {
    try {
      // FR: Parser XML simple (pour MVP, on utilise une approche basique)
      // EN: Simple XML parser (for MVP, using basic approach)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const mapElement = xmlDoc.querySelector('map');
      if (!mapElement) {
        throw new Error('Fichier .mm invalide : élément map manquant');
      }

      const rootNode = mapElement.querySelector('node');
      if (!rootNode) {
        throw new Error('Fichier .mm invalide : nœud racine manquant');
      }

      return {
        root: this.parseNode(rootNode),
        metadata: {
          version: mapElement.getAttribute('version') || '1.0',
          name: rootNode.getAttribute('TEXT') || 'Carte sans nom'
        }
      };
    } catch (error) {
      console.error('Erreur lors du parsing du fichier .mm:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Impossible de parser le fichier .mm: ${message}`);
    }
  }

  /**
   * FR: Parser un nœud XML récursivement
   * EN: Parse an XML node recursively
   */
  private static parseNode(nodeElement: Element): FreeMindNode {
    const text = nodeElement.getAttribute('TEXT') || '';
    const id = nodeElement.getAttribute('ID') || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const attributes: any = {};
    const folded = nodeElement.getAttribute('FOLDED');
    const color = nodeElement.getAttribute('COLOR');
    const style = nodeElement.getAttribute('STYLE');
    
    if (folded) attributes.FOLDED = folded;
    if (color) attributes.COLOR = color;
    if (style) attributes.STYLE = style;

    const children: FreeMindNode[] = [];
    const childNodes = nodeElement.querySelectorAll(':scope > node');
    
    childNodes.forEach(childNode => {
      children.push(this.parseNode(childNode));
    });

    return {
      id,
      text,
      children: children.length > 0 ? children : undefined,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined
    };
  }

  /**
   * FR: Convertir un BigMind vers le format FreeMind .mm
   * EN: Convert BigMind to FreeMind .mm format
   */
  static convertFromBigMind(bigMindData: any): string {
    const { content } = bigMindData;
    if (!content || !content.nodes || !content.rootNode) {
      throw new Error('Données BigMind invalides pour la conversion FreeMind');
    }

    const buildNodeXML = (nodeId: string, level: number = 0): string => {
      const node = content.nodes[nodeId];
      if (!node) return '';

      const indent = '  '.repeat(level);
      const text = node.title || '';
      const id = node.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // FR: Construire les attributs
      // EN: Build attributes
      const attributes: string[] = [`TEXT="${this.escapeXml(text)}"`, `ID="${id}"`];
      
      if (node.collapsed) {
        attributes.push('FOLDED="true"');
      }
      
      if (node.style?.backgroundColor) {
        attributes.push(`COLOR="${node.style.backgroundColor}"`);
      }

      const attributesStr = attributes.join(' ');
      
      // FR: Construire les enfants
      // EN: Build children
      let childrenXML = '';
      if (node.children && node.children.length > 0) {
        childrenXML = '\n' + node.children
          .map(childId => buildNodeXML(childId, level + 1))
          .join('\n') + '\n' + indent;
      }

      return `${indent}<node ${attributesStr}>${childrenXML}</node>`;
    };

    const rootNodeXML = buildNodeXML(content.rootId, 1);
    const mapName = content.name || 'Carte mentale';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
${rootNodeXML}
</map>`;
  }

  /**
   * FR: Échapper les caractères XML spéciaux
   * EN: Escape special XML characters
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * FR: Convertir un FreeMindMap vers le format interne BigMind
   * EN: Convert FreeMindMap to internal BigMind format
   */
  static convertToBigMind(freeMindMap: FreeMindMap): any {
    const nodes: Record<string, any> = {};

    const convertNode = (node: FreeMindNode, parentId: string | null = null): any => {
      const bigMindNode = {
        id: node.id,
        title: node.text,
        parentId,
        children: [] as string[],
        collapsed: node.attributes?.FOLDED === 'true',
        style: node.attributes?.COLOR ? { backgroundColor: node.attributes.COLOR } : undefined
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

    const rootId = convertNode(freeMindMap.root);

    return {
      id: `map_${Date.now()}`,
      name: freeMindMap.metadata.name,
      rootId,
      nodes,
      meta: {
        name: freeMindMap.metadata.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: 'fr'
      }
    };
  }
}
