/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */

import { useCallback } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { FreeMindParser } from '../parsers/FreeMindParser';
import { XMindParser } from '@bigmind/core';
import JSZip from 'jszip';
import { useViewport } from './useViewport';
import { useCanvasOptions } from './useCanvasOptions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';

/**
 * FR: Générer du SVG à partir de la structure de carte mentale
 * EN: Generate SVG from mind map structure
 */
function generateSVGFromMindMap(content: any, mapStyle: any): string {
  if (!content || !content.nodes) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16">Carte mentale vide</text></svg>';
  }

  const { nodes } = content;
  const rootNodeId = content.rootNode?.id;

  if (!rootNodeId || !nodes[rootNodeId]) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16">Aucun nœud racine trouvé</text></svg>';
  }

  // FR: Calculer les positions et dimensions
  // EN: Calculate positions and dimensions
  const nodePositions = new Map();
  const nodeDimensions = new Map();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // FR: Parcourir tous les nœuds pour calculer les dimensions
  // EN: Traverse all nodes to calculate dimensions
  Object.values(nodes).forEach((node: any) => {
    const width = Math.max(node.title?.length * 8 || 100, 80);
    const height = 40;
    nodeDimensions.set(node.id, { width, height });

    // FR: Position approximative basée sur la hiérarchie
    // EN: Approximate position based on hierarchy
    const level = getNodeLevel(node.id, nodes, rootNodeId);
    const siblingIndex = getSiblingIndex(node.id, nodes);
    const x = level * 200 + 50;
    const y = siblingIndex * 60 + 50;

    nodePositions.set(node.id, { x, y });

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + height);
  });

  // FR: Ajouter des marges
  // EN: Add margins
  const margin = 50;
  const svgWidth = maxX - minX + margin * 2;
  const svgHeight = maxY - minY + margin * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;

  // FR: Arrière-plan
  // EN: Background
  const bgColor = mapStyle?.backgroundColor || '#ffffff';
  svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;

  // FR: Dessiner les connexions
  // EN: Draw connections
  Object.values(nodes).forEach((node: any) => {
    if (node.children && node.children.length > 0) {
      const parentPos = nodePositions.get(node.id);
      const parentDims = nodeDimensions.get(node.id);

      node.children.forEach((childId: string) => {
        const childPos = nodePositions.get(childId);
        if (parentPos && childPos) {
          const x1 = parentPos.x + parentDims.width - margin;
          const y1 = parentPos.y + parentDims.height / 2 - margin;
          const x2 = childPos.x - margin;
          const y2 = childPos.y + nodeDimensions.get(childId).height / 2 - margin;

          svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#666" stroke-width="2"/>`;
        }
      });
    }
  });

  // FR: Dessiner les nœuds
  // EN: Draw nodes
  Object.values(nodes).forEach((node: any) => {
    const pos = nodePositions.get(node.id);
    const dims = nodeDimensions.get(node.id);

    if (pos && dims) {
      const x = pos.x - margin;
      const y = pos.y - margin;
      const { width } = dims;
      const { height } = dims;

      // FR: Couleur du nœud basée sur le niveau
      // EN: Node color based on level
      const level = getNodeLevel(node.id, nodes, rootNodeId);
      const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec'];
      const fillColor = colors[level % colors.length];

      // FR: Rectangle du nœud
      // EN: Node rectangle
      svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="#333" stroke-width="1" rx="5"/>`;

      // FR: Texte du nœud
      // EN: Node text
      const textX = x + width / 2;
      const textY = y + height / 2 + 5;
      svg += `<text x="${textX}" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">${escapeXml(node.title || '')}</text>`;
    }
  });

  svg += '</svg>';
  return svg;
}

/**
 * FR: Échapper les caractères XML
 * EN: Escape XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * FR: Obtenir le niveau d'un nœud dans la hiérarchie
 * EN: Get node level in hierarchy
 */
function getNodeLevel(nodeId: string, nodes: any, rootId: string): number {
  if (nodeId === rootId) return 0;

  for (const node of Object.values(nodes) as any[]) {
    if (node.children && node.children.includes(nodeId)) {
      return 1 + getNodeLevel(node.id, nodes, rootId);
    }
  }
  return 0;
}

/**
 * FR: Obtenir l'index d'un nœud parmi ses frères
 * EN: Get node index among siblings
 */
function getSiblingIndex(nodeId: string, nodes: any): number {
  for (const node of Object.values(nodes) as any[]) {
    if (node.children && node.children.includes(nodeId)) {
      return node.children.indexOf(nodeId);
    }
  }
  return 0;
}

/**
 * FR: Générer du Markdown à partir de la structure de carte mentale
 * EN: Generate Markdown from mind map structure
 */
function generateMarkdownFromMindMap(content: any): string {
  if (!content || !content.nodes) {
    return '# Carte mentale vide\n\nAucun contenu à exporter.';
  }

  const { nodes } = content;
  const rootNodeId = content.rootNode?.id;

  if (!rootNodeId || !nodes[rootNodeId]) {
    return '# Carte mentale\n\nAucun nœud racine trouvé.';
  }

  let markdown = `# ${nodes[rootNodeId].title || 'Carte mentale'}\n\n`;

  // FR: Parcourir récursivement la structure
  // EN: Recursively traverse the structure
  markdown += generateMarkdownNode(nodes[rootNodeId], nodes, 1);

  return markdown;
}

/**
 * FR: Générer le Markdown pour un nœud et ses enfants
 * EN: Generate Markdown for a node and its children
 */
function generateMarkdownNode(node: any, nodes: any, level: number): string {
  let markdown = '';

  if (node.children && node.children.length > 0) {
    node.children.forEach((childId: string) => {
      const childNode = nodes[childId];
      if (childNode) {
        const indent = '  '.repeat(level - 1);
        const bullet = level === 1 ? '- ' : '  - ';
        markdown += `${indent}${bullet}${childNode.title || 'Sans titre'}\n`;

        // FR: Récursion pour les enfants
        // EN: Recursion for children
        markdown += generateMarkdownNode(childNode, nodes, level + 1);
      }
    });
  }

  return markdown;
}

/**
 * FR: Générer un document Word à partir de la structure de carte mentale
 * EN: Generate Word document from mind map structure
 */
function generateWordFromMindMap(content: any): Document {
  if (!content || !content.nodes) {
    return new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Carte mentale vide', bold: true })],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Aucun contenu à exporter.' })],
            }),
          ],
        },
      ],
    });
  }

  const { nodes } = content;
  const rootNodeId = content.rootNode?.id;

  if (!rootNodeId || !nodes[rootNodeId]) {
    return new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Carte mentale', bold: true })],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Aucun nœud racine trouvé.' })],
            }),
          ],
        },
      ],
    });
  }

  const children: Paragraph[] = [];

  // FR: Titre principal
  // EN: Main title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: nodes[rootNodeId].title || 'Carte mentale', bold: true })],
      heading: HeadingLevel.HEADING_1,
    })
  );

  // FR: Parcourir récursivement la structure
  // EN: Recursively traverse the structure
  children.push(...generateWordNodes(nodes[rootNodeId], nodes, 1));

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

/**
 * FR: Générer les paragraphes Word pour un nœud et ses enfants
 * EN: Generate Word paragraphs for a node and its children
 */
function generateWordNodes(node: any, nodes: any, level: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (node.children && node.children.length > 0) {
    node.children.forEach((childId: string) => {
      const childNode = nodes[childId];
      if (childNode) {
        const indent = level * 0.5; // Indentation en pouces
        const headingLevel =
          level === 1
            ? HeadingLevel.HEADING_2
            : level === 2
              ? HeadingLevel.HEADING_3
              : level === 3
                ? HeadingLevel.HEADING_4
                : HeadingLevel.HEADING_5;

        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: childNode.title || 'Sans titre' })],
            heading: headingLevel,
            indent: { left: indent * 1440 }, // Conversion en twips (1/20 de point)
          })
        );

        // FR: Récursion pour les enfants
        // EN: Recursion for children
        paragraphs.push(...generateWordNodes(childNode, nodes, level + 1));
      }
    });
  }

  return paragraphs;
}

/**
 * FR: Générer un classeur Excel à partir de la structure de carte mentale
 * EN: Generate Excel workbook from mind map structure
 */
function generateExcelFromMindMap(content: any): XLSX.WorkBook {
  if (!content || !content.nodes) {
    const ws = XLSX.utils.aoa_to_sheet([['Carte mentale vide'], ['Aucun contenu à exporter.']]);
    return XLSX.utils.book_new();
  }

  const { nodes } = content;
  const rootNodeId = content.rootNode?.id;

  if (!rootNodeId || !nodes[rootNodeId]) {
    const ws = XLSX.utils.aoa_to_sheet([['Carte mentale'], ['Aucun nœud racine trouvé.']]);
    return XLSX.utils.book_new();
  }

  // FR: Créer les données pour la feuille de calcul
  // EN: Create data for the spreadsheet
  const data: any[][] = [];

  // FR: En-têtes
  // EN: Headers
  data.push(['Niveau', 'Titre', 'ID', 'Parent', 'Enfants']);

  // FR: Parcourir récursivement la structure
  // EN: Recursively traverse the structure
  generateExcelRows(nodes[rootNodeId], nodes, 0, '', data);

  // FR: Créer la feuille de calcul
  // EN: Create the worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // FR: Ajuster la largeur des colonnes
  // EN: Adjust column widths
  ws['!cols'] = [
    { wch: 10 }, // Niveau
    { wch: 30 }, // Titre
    { wch: 20 }, // ID
    { wch: 20 }, // Parent
    { wch: 20 }, // Enfants
  ];

  // FR: Créer le classeur
  // EN: Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, 'Carte mentale');

  return workbook;
}

/**
 * FR: Générer les lignes Excel pour un nœud et ses enfants
 * EN: Generate Excel rows for a node and its children
 */
function generateExcelRows(
  node: any,
  nodes: any,
  level: number,
  parentId: string,
  data: any[][]
): void {
  // FR: Ajouter la ligne pour ce nœud
  // EN: Add row for this node
  data.push([
    level,
    node.title || 'Sans titre',
    node.id || '',
    parentId || '',
    node.children ? node.children.join(', ') : '',
  ]);

  // FR: Parcourir les enfants
  // EN: Traverse children
  if (node.children && node.children.length > 0) {
    node.children.forEach((childId: string) => {
      const childNode = nodes[childId];
      if (childNode) {
        generateExcelRows(childNode, nodes, level + 1, node.id, data);
      }
    });
  }
}

/**
 * FR: Fonction utilitaire pour télécharger un fichier dans le navigateur
 * EN: Utility function to download a file in the browser
 */
const downloadFile = (
  blob: Blob,
  fileName: string,
  mimeType: string = 'application/octet-stream'
) => {
  console.log(
    '🔄 downloadFile - Début du téléchargement:',
    fileName,
    'Type:',
    mimeType,
    'Taille:',
    blob.size
  );

  try {
    // FR: Créer un blob avec le bon type MIME
    // EN: Create blob with correct MIME type
    const fileBlob = new Blob([blob], { type: mimeType });
    const url = URL.createObjectURL(fileBlob);

    console.log('📎 URL blob créée:', url);

    // FR: Créer un lien de téléchargement
    // EN: Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    console.log('🔗 Lien de téléchargement créé:', a.href, 'Download:', a.download);

    // FR: Ajouter au DOM, déclencher le téléchargement, puis nettoyer
    // EN: Add to DOM, trigger download, then clean up
    document.body.appendChild(a);
    console.log('📄 Lien ajouté au DOM');

    // FR: Déclencher le téléchargement
    // EN: Trigger download
    a.click();
    console.log('👆 Clic sur le lien déclenché');

    // FR: Attendre un peu avant de nettoyer
    // EN: Wait a bit before cleaning up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('🧹 Nettoyage effectué');
    }, 1000);

    console.log('✅ Fichier téléchargé:', fileName);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    return false;
  }
};

/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */
export const useFileOperations = () => {
  const { openFile: addFileToOpenFiles, createNewFile } = useOpenFiles();
  const { getActiveFile } = useOpenFiles.getState();

  /**
   * FR: Ouvrir un fichier .mm (FreeMind)
   * EN: Open a .mm file (FreeMind)
   */
  const openFreeMindFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const freeMindMap = FreeMindParser.parse(text);
        const bigMindData = FreeMindParser.convertToBigMind(freeMindMap);

        // FR: Adapter la structure pour useOpenFiles
        // EN: Adapt structure for useOpenFiles
        const adaptedContent = {
          id: bigMindData.id,
          name: bigMindData.name,
          rootNode: {
            id: bigMindData.rootId,
            title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
            children: bigMindData.nodes[bigMindData.rootId]?.children || [],
          },
          nodes: bigMindData.nodes,
        };

        return addFileToOpenFiles({
          name: file.name,
          type: 'mm',
          content: adaptedContent,
        });
      } catch (error) {
        console.error("Erreur lors de l'ouverture du fichier .mm:", error);
        throw error;
      }
    },
    [addFileToOpenFiles]
  );

  /**
   * FR: Ouvrir un fichier .xmind
   * EN: Open a .xmind file
   */
  const openXMindFile = useCallback(
    async (file: File) => {
      try {
        const arrayBuffer = await file.arrayBuffer();

        // FR: Essayer d'abord le parser standard
        // EN: Try standard parser first
        try {
          const xMindMap = await XMindParser.parse(arrayBuffer);
          const bigMindData = XMindParser.convertToBigMind(xMindMap);

          // FR: Adapter la structure pour useOpenFiles
          // EN: Adapt structure for useOpenFiles
          const adaptedContent: any = {
            id: bigMindData.id,
            name: bigMindData.meta.name,
            rootNode: {
              id: bigMindData.rootId,
              title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
              children: bigMindData.nodes[bigMindData.rootId]?.children || [],
            },
            nodes: bigMindData.nodes,
          };

          // FR: Appliquer un overlay local persisté (titre/notes/style par id)
          try {
            const key = `bigmind_overlay_${file.name}`;
            const raw = localStorage.getItem(key);
            if (raw) {
              const overlay = JSON.parse(raw);
              if (overlay?.nodes) {
                Object.entries(overlay.nodes).forEach(([id, patch]: any) => {
                  if (adaptedContent.nodes?.[id]) {
                    adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                  }
                });
                // Mettre à jour aussi le titre du root affiché si modifié
                const rid = adaptedContent.rootNode.id;
                if (overlay.nodes[rid]?.title) {
                  adaptedContent.rootNode.title = overlay.nodes[rid].title;
                }
              }
            }
          } catch (e) {
            // Ignore errors
          }

          // FR: Appliquer bigmind.json embarqué si présent dans l'archive
          let embeddedOverlay: any = null;
          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const sidecar = zip.file('bigmind.json');
            if (sidecar) {
              const text = await sidecar.async('text');
              embeddedOverlay = JSON.parse(text);
              if (embeddedOverlay?.nodes) {
                Object.entries(embeddedOverlay.nodes).forEach(([id, patch]: any) => {
                  if (adaptedContent.nodes?.[id]) {
                    adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                  }
                });
              }
            }
          } catch (e) {
            console.warn('Erreur lors de la lecture de bigmind.json:', e);
          }

          const fileId = addFileToOpenFiles({
            name: file.name,
            type: 'xmind',
            content: adaptedContent,
            sheets: xMindMap.sheetsMeta,
            sheetsData: xMindMap.sheetsData,
            themeColors: xMindMap.themeColors,
            activeSheetId:
              xMindMap.sheetsMeta && xMindMap.sheetsMeta.length > 0
                ? xMindMap.sheetsMeta[0].id
                : null,
            // FR: Restaurer les données personnalisées de l'overlay
            paletteId: embeddedOverlay?.paletteId,
            mapStyle: embeddedOverlay?.mapStyle,
          });

          // FR: Restaurer les options de canvas si présentes dans l'overlay
          if (embeddedOverlay?.options) {
            try {
              if (embeddedOverlay.options.zoom !== undefined) {
                useViewport.getState().setZoom(embeddedOverlay.options.zoom);
              }
              if (embeddedOverlay.options.nodesDraggable !== undefined) {
                const currentState = useCanvasOptions.getState();
                if (currentState.nodesDraggable !== embeddedOverlay.options.nodesDraggable) {
                  currentState.toggleNodesDraggable();
                }
              }
            } catch (e) {
              console.warn('Erreur lors de la restauration des options de canvas:', e);
            }
          }
          return fileId;
        } catch (standardError) {
          const stdMsg =
            standardError instanceof Error ? standardError.message : String(standardError);
          console.warn('Parser standard échoué, tentative avec le parser simple:', stdMsg);

          // FR: Essayer le parser de fallback
          // EN: Try fallback parser
          const xMindMap = await XMindParser.parseSimple(arrayBuffer);
          const bigMindData = XMindParser.convertToBigMind(xMindMap);

          // FR: Adapter la structure pour useOpenFiles
          // EN: Adapt structure for useOpenFiles
          const adaptedContent: any = {
            id: bigMindData.id,
            name: bigMindData.meta.name,
            rootNode: {
              id: bigMindData.rootId,
              title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
              children: bigMindData.nodes[bigMindData.rootId]?.children || [],
            },
            nodes: bigMindData.nodes,
          };
          try {
            const key = `bigmind_overlay_${file.name}`;
            const raw = localStorage.getItem(key);
            if (raw) {
              const overlay = JSON.parse(raw);
              if (overlay?.nodes) {
                Object.entries(overlay.nodes).forEach(([id, patch]: any) => {
                  if (adaptedContent.nodes?.[id]) {
                    adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                  }
                });
                const rid = adaptedContent.rootNode.id;
                if (overlay.nodes[rid]?.title) {
                  adaptedContent.rootNode.title = overlay.nodes[rid].title;
                }
              }
            }
          } catch (e) {
            // Ignore errors
          }

          // FR: Appliquer bigmind.json embarqué si présent dans l'archive (fallback)
          let embeddedOverlayFallback: any = null;
          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const sidecar = zip.file('bigmind.json');
            if (sidecar) {
              const text = await sidecar.async('text');
              embeddedOverlayFallback = JSON.parse(text);
              if (embeddedOverlayFallback?.nodes) {
                Object.entries(embeddedOverlayFallback.nodes).forEach(([id, patch]: any) => {
                  if (adaptedContent.nodes?.[id]) {
                    adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                  }
                });
              }
            }
          } catch (e) {
            console.warn('Erreur lors de la lecture de bigmind.json (fallback):', e);
          }

          const fileIdFallback = addFileToOpenFiles({
            name: file.name,
            type: 'xmind',
            content: adaptedContent,
            themeColors: bigMindData.themeColors,
            // FR: Restaurer les données personnalisées de l'overlay (fallback)
            paletteId: embeddedOverlayFallback?.paletteId,
            mapStyle: embeddedOverlayFallback?.mapStyle,
          });

          // FR: Restaurer les options de canvas si présentes dans l'overlay (fallback)
          if (embeddedOverlayFallback?.options) {
            try {
              if (embeddedOverlayFallback.options.zoom !== undefined) {
                useViewport.getState().setZoom(embeddedOverlayFallback.options.zoom);
              }
              if (embeddedOverlayFallback.options.nodesDraggable !== undefined) {
                const currentState = useCanvasOptions.getState();
                if (
                  currentState.nodesDraggable !== embeddedOverlayFallback.options.nodesDraggable
                ) {
                  currentState.toggleNodesDraggable();
                }
              }
            } catch (e) {
              console.warn('Erreur lors de la restauration des options de canvas (fallback):', e);
            }
          }

          return fileIdFallback;
        }
      } catch (error) {
        console.error("Erreur lors de l'ouverture du fichier .xmind:", error);
        throw error;
      }
    },
    [addFileToOpenFiles]
  );

  /**
   * FR: Ouvrir un fichier (détection automatique du type)
   * EN: Open a file (automatic type detection)
   */
  const openFile = useCallback(
    async (file: File) => {
      const extension = file.name.toLowerCase().split('.').pop();

      switch (extension) {
        case 'mm':
          return openFreeMindFile(file);
        case 'xmind':
          return openXMindFile(file);
        default:
          throw new Error(`Format de fichier non supporté: .${extension}`);
      }
    },
    [openFreeMindFile, openXMindFile]
  );

  /**
   * FR: Créer un nouveau fichier
   * EN: Create a new file
   */
  const createNew = useCallback((name?: string) => createNewFile(name), [createNewFile]);

  /**
   * FR: Ouvrir un fichier via le sélecteur de fichiers
   * EN: Open a file via file picker
   */
  const openFileDialog = useCallback(
    (): Promise<File | null> =>
      new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mm,.xmind';
        input.multiple = false;

        input.onchange = event => {
          const file = (event.target as HTMLInputElement).files?.[0] || null;
          resolve(file);
        };

        input.oncancel = () => resolve(null);
        input.click();
      }),
    []
  );

  // FR: Exporter le fichier actif en .xmind en fusionnant l'overlay local dans content.json
  // EN: Export the active file to .xmind merging overlay into content.json
  const exportActiveXMind = useCallback(async (customFileName?: string) => {
    console.log('🔄 exportActiveXMind - Début de la sauvegarde');
    const active = getActiveFile();
    console.log('📁 Fichier actif:', active);

    if (!active) {
      console.error('❌ Aucun fichier actif');
      throw new Error('Aucun fichier actif');
    }

    if (active.type !== 'xmind') {
      console.error("❌ Le fichier actif n'est pas un fichier XMind:", active.type);
      throw new Error("Le fichier actif n'est pas un fichier XMind");
    }

    if (!active.content) {
      console.error("❌ Le fichier actif n'a pas de contenu");
      throw new Error("Le fichier actif n'a pas de contenu");
    }

    console.log('✅ Fichier XMind valide, début de la génération...');

    // FR: Créer une nouvelle archive ZIP
    // EN: Create a new ZIP archive
    const zip = new JSZip();

    // FR: Si nous avons accès au fichier original, le copier pour préserver tous les fichiers
    // EN: If we have access to original file, copy it to preserve all files
    const originalZip: JSZip | null = null;
    if (active.path) {
      try {
        // FR: Essayer de charger le fichier original depuis le système de fichiers
        // EN: Try to load original file from filesystem
        // Note: Dans un navigateur, nous ne pouvons pas accéder directement au système de fichiers
        // Mais nous pouvons essayer de reconstruire l'archive avec les fichiers essentiels
      } catch (e) {
        console.warn('Impossible de charger le fichier original:', e);
      }
    }

    // FR: Préserver la structure originale du content.json pour la compatibilité XMind
    // EN: Preserve original content.json structure for XMind compatibility
    let contentJson: any;

    if (active.sheetsData && active.sheetsData.length > 0) {
      // FR: Utiliser les données originales des feuilles comme base
      // EN: Use original sheets data as base
      contentJson = [...active.sheetsData];

      // FR: Mettre à jour la feuille active avec nos modifications
      // EN: Update active sheet with our modifications
      const activeSheetIndex = active.sheets?.findIndex(s => s.id === active.activeSheetId) || 0;
      if (contentJson[activeSheetIndex]) {
        const buildTopic = (id: string): any => {
          const n = active.content.nodes[id];
          if (!n) return null;
          return {
            id: n.id,
            title: n.title,
            notes: n.notes ? { plain: n.notes } : undefined,
            style: n.style,
            children:
              n.children && n.children.length > 0
                ? { attached: n.children.map(buildTopic).filter(Boolean) }
                : undefined,
          };
        };

        // FR: Mettre à jour le rootTopic de la feuille active
        // EN: Update rootTopic of active sheet
        contentJson[activeSheetIndex] = {
          ...contentJson[activeSheetIndex],
          rootTopic: buildTopic(active.content.rootNode.id),
        };
      }
    } else {
      // FR: Fallback si pas de données originales - créer une structure minimale compatible
      // EN: Fallback if no original data - create minimal compatible structure
      const buildTopic = (id: string): any => {
        const n = active.content.nodes[id];
        if (!n) return null;
        return {
          id: n.id,
          title: n.title,
          notes: n.notes ? { plain: n.notes } : undefined,
          style: n.style,
          children:
            n.children && n.children.length > 0
              ? { attached: n.children.map(buildTopic).filter(Boolean) }
              : undefined,
        };
      };

      contentJson = [
        {
          id: active.activeSheetId || 'sheet-1',
          title: active.content.name || 'Carte mentale',
          class: 'sheet',
          rootTopic: buildTopic(active.content.rootNode.id),
          creator: 'BigMind',
          created: new Date().toISOString(),
        },
      ];
    }

    console.log('📄 Génération du content.json...');
    zip.file('content.json', JSON.stringify(contentJson, null, 2));
    console.log('✅ content.json généré');

    // FR: Ajouter les fichiers essentiels pour la compatibilité XMind
    // EN: Add essential files for XMind compatibility

    // FR: META-INF/manifest.xml (requis par XMind)
    // EN: META-INF/manifest.xml (required by XMind)
    const manifestXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.json" media-type="text/json"/>
  <file-entry full-path="META-INF/" media-type=""/>
  <file-entry full-path="styles.xml" media-type="text/xml"/>
  <file-entry full-path="theme.xml" media-type="text/xml"/>
</manifest>`;
    zip.file('META-INF/manifest.xml', manifestXml);

    // FR: styles.xml (styles par défaut)
    // EN: styles.xml (default styles)
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-styles xmlns="urn:xmind:xmap:xmlns:style:2.0" version="2.0">
  <styles>
    <style id="default" type="topic">
      <topic-properties border-line-width="1pt" line-color="#000000" line-pattern="solid"/>
    </style>
  </styles>
</xmap-styles>`;
    zip.file('styles.xml', stylesXml);

    // FR: theme.xml (thème par défaut)
    // EN: theme.xml (default theme)
    const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-themes xmlns="urn:xmind:xmap:xmlns:theme:2.0" version="2.0">
  <themes>
    <theme id="default" name="Default">
      <topic-styles>
        <topic-style id="default" type="topic">
          <topic-properties border-line-width="1pt" line-color="#000000" line-pattern="solid"/>
        </topic-style>
      </topic-styles>
    </theme>
  </themes>
</xmap-themes>`;
    zip.file('theme.xml', themeXml);

    // FR: Ecrire le sidecar embarqué avec toutes les données personnalisées
    try {
      const overlay: any = {
        nodes: {},
        // FR: Sauvegarder les styles de carte
        mapStyle: active.mapStyle,
        // FR: Sauvegarder la palette sélectionnée
        paletteId: active.paletteId,
        // FR: Sauvegarder les couleurs du thème
        themeColors: active.themeColors,
        // FR: Sauvegarder les options de canvas
        options: {
          zoom: useViewport.getState().zoom,
          nodesDraggable: useCanvasOptions.getState().nodesDraggable,
        },
      };

      // FR: Sauvegarder toutes les données des nœuds (y compris computedStyle, collapsed, etc.)
      Object.values(active.content.nodes).forEach((n: any) => {
        overlay.nodes[n.id] = {
          title: n.title,
          notes: n.notes,
          style: n.style,
          // FR: Sauvegarder les styles calculés (couleurs inférées)
          computedStyle: n.computedStyle,
          // FR: Sauvegarder l'état des nœuds
          collapsed: n.collapsed,
          // FR: Sauvegarder les enfants pour la structure
          children: n.children,
        };
      });

      zip.file('bigmind.json', JSON.stringify(overlay, null, 2));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des données personnalisées:', e);
    }

    console.log('📦 Génération du fichier ZIP...');
    const blob = await zip.generateAsync({ type: 'blob' });
    console.log('✅ ZIP généré, taille:', blob.size, 'bytes');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);

    // FR: Utiliser le nom personnalisé ou le nom original
    // EN: Use custom name or original name
    const fileName = customFileName || `${active.name.replace(/\.xmind$/i, '')}.xmind`;
    a.download = fileName;
    console.log('💾 Téléchargement du fichier:', fileName);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
    console.log('✅ Sauvegarde terminée avec succès');
  }, []);

  // FR: Sauvegarder sous avec dialogue de nom de fichier
  // EN: Save as with file name dialog
  const saveAsXMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content)
      throw new Error('Aucun fichier XMind actif');

    // FR: Demander le nouveau nom de fichier
    // EN: Ask for new file name
    const newFileName = prompt('Nom du fichier:', active.name.replace(/\.xmind$/i, ''));
    if (!newFileName) return; // FR: Annulé par l'utilisateur

    const fileName = newFileName.endsWith('.xmind') ? newFileName : `${newFileName}.xmind`;
    await exportActiveXMind(fileName);
  }, [exportActiveXMind]);

  // FR: Exporter vers le format FreeMind .mm
  // EN: Export to FreeMind .mm format
  const exportToFreeMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || !active.content) {
      alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
      throw new Error('Aucun fichier actif');
    }

    console.log("🔄 exportToFreeMind - Début de l'export vers .mm");
    console.log('📁 Fichier actif:', active);

    try {
      // FR: Convertir les données BigMind vers le format FreeMind
      // EN: Convert BigMind data to FreeMind format
      const freeMindXML = FreeMindParser.convertFromBigMind(active);
      console.log('✅ XML FreeMind généré, taille:', freeMindXML.length, 'caractères');

      // FR: Créer le blob et télécharger
      // EN: Create blob and download
      const blob = new Blob([freeMindXML], { type: 'application/xml' });
      const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
      const fileName = `${baseName}.mm`;

      console.log('💾 Téléchargement du fichier .mm:', fileName);

      // FR: Utiliser la fonction utilitaire de téléchargement
      // EN: Use utility download function
      const success = downloadFile(blob, fileName, 'application/xml');
      if (!success) {
        throw new Error('Échec du téléchargement du fichier .mm');
      }
      console.log('✅ Export .mm terminé avec succès');
    } catch (error) {
      console.error("❌ Erreur lors de l'export .mm:", error);
      throw error;
    }
  }, []);

  // FR: Exporter vers le format PDF
  // EN: Export to PDF format
  const exportToPDF = useCallback(async () => {
    const active = getActiveFile();
    if (!active || !active.content) {
      alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
      throw new Error('Aucun fichier actif');
    }

    console.log("🔄 exportToPDF - Début de l'export vers PDF");
    console.log('📁 Fichier actif:', active);

    try {
      // FR: Créer le PDF
      // EN: Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // FR: Vérifier si c'est un fichier XMind avec plusieurs feuilles
      // EN: Check if it's an XMind file with multiple sheets
      if (active.type === 'xmind' && active.sheets && active.sheets.length > 1) {
        console.log('📚 Export de toutes les feuilles XMind:', active.sheets.length);

        // FR: Sauvegarder la feuille originale
        // EN: Save original sheet
        const originalSheetId = active.activeSheetId;

        // FR: Exporter chaque feuille sur une page séparée
        // EN: Export each sheet on a separate page
        for (let i = 0; i < active.sheets.length; i++) {
          const sheet = active.sheets[i];
          console.log(`📄 Export de la feuille ${i + 1}/${active.sheets.length}: ${sheet.title}`);

          // FR: Basculer vers cette feuille temporairement
          // EN: Switch to this sheet temporarily
          const { setActiveSheet } = useOpenFiles.getState();

          if (active.sheetsData && active.sheetsData[i]) {
            // FR: Convertir les données de la feuille en format BigMind
            // EN: Convert sheet data to BigMind format
            const sheetData = active.sheetsData[i];
            const bigMindData = XMindParser.convertSheetJSONToBigMind(sheetData);

            // FR: Créer un contenu temporaire pour cette feuille
            // EN: Create temporary content for this sheet
            const tempContent = {
              id: bigMindData.id,
              name: bigMindData.meta.name || sheet.title,
              rootNode: {
                id: bigMindData.rootId,
                title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
                children: bigMindData.nodes[bigMindData.rootId]?.children || [],
              },
              nodes: bigMindData.nodes,
            };

            // FR: Mettre à jour temporairement le contenu actif
            // EN: Temporarily update active content
            const { openFiles } = useOpenFiles.getState();
            const updatedFiles = openFiles.map(f =>
              f.id === active.id ? { ...f, content: tempContent } : f
            );
            useOpenFiles.setState({ openFiles: updatedFiles });

            // FR: Attendre que React mette à jour l'affichage
            // EN: Wait for React to update the display
            await new Promise(resolve => setTimeout(resolve, 500));

            // FR: Masquer la mini-map et l'attribution pour l'export
            // EN: Hide mini-map and attribution for export
            const mindmapCanvas = document.querySelector('.mindmap-canvas');
            const reactFlowElement = document.querySelector('.react-flow');
            const minimap = document.querySelector('.react-flow__minimap');
            const attribution = document.querySelector('.react-flow__attribution');
            const panels = document.querySelectorAll('.react-flow__panel');

            // FR: Stocker les styles originaux pour les restaurer après
            // EN: Store original styles to restore them after
            const elementsToHide: Array<{ element: HTMLElement; originalDisplay: string }> = [];

            if (mindmapCanvas) {
              mindmapCanvas.classList.add('exporting');
            }
            if (reactFlowElement) {
              reactFlowElement.classList.add('exporting');
            }

            // FR: Masquer directement avec JavaScript pour être sûr
            // EN: Hide directly with JavaScript to be sure
            if (minimap) {
              const el = minimap as HTMLElement;
              elementsToHide.push({ element: el, originalDisplay: el.style.display });
              el.style.display = 'none';
            }

            if (attribution) {
              const el = attribution as HTMLElement;
              elementsToHide.push({ element: el, originalDisplay: el.style.display });
              el.style.display = 'none';
            }

            panels.forEach(panel => {
              const el = panel as HTMLElement;
              elementsToHide.push({ element: el, originalDisplay: el.style.display });
              el.style.display = 'none';
            });

            // FR: Attendre un peu pour que les changements prennent effet
            // EN: Wait a bit for changes to take effect
            await new Promise(resolve => setTimeout(resolve, 100));

            // FR: Capturer cette feuille
            // EN: Capture this sheet
            if (reactFlowElement) {
              let canvas;
              try {
                // FR: Calculer les dimensions optimales pour faire tenir la carte sur la page
                // EN: Calculate optimal dimensions to fit the map on the page
                const reactFlowRect = reactFlowElement.getBoundingClientRect();
                const reactFlowWidth = reactFlowElement.scrollWidth;
                const reactFlowHeight = reactFlowElement.scrollHeight;

                // FR: Dimensions de la page PDF (A4 paysage en mm, converties en pixels à 96 DPI)
                // EN: PDF page dimensions (A4 landscape in mm, converted to pixels at 96 DPI)
                const pdfWidthMM = 297; // A4 landscape width
                const pdfHeightMM = 210; // A4 landscape height
                const mmToPx = 96 / 25.4; // 96 DPI conversion
                const pdfWidthPx = pdfWidthMM * mmToPx;
                const pdfHeightPx = pdfHeightMM * mmToPx;

                // FR: Calculer le facteur d'échelle pour faire tenir la carte
                // EN: Calculate scale factor to fit the map
                const scaleX = pdfWidthPx / reactFlowWidth;
                const scaleY = pdfHeightPx / reactFlowHeight;
                const optimalScale = Math.min(scaleX, scaleY, 1); // Ne pas agrandir, seulement réduire

                console.log(`📐 Dimensions carte: ${reactFlowWidth}x${reactFlowHeight}px`);
                console.log(`📐 Dimensions PDF: ${pdfWidthPx}x${pdfHeightPx}px`);
                console.log(`📐 Échelle optimale: ${optimalScale.toFixed(3)}`);

                canvas = await html2canvas(reactFlowElement as HTMLElement, {
                  backgroundColor: active.mapStyle?.backgroundColor || '#ffffff',
                  scale: optimalScale,
                  useCORS: true,
                  allowTaint: true,
                  logging: false,
                  width: reactFlowWidth,
                  height: reactFlowHeight,
                });
              } catch (html2canvasError) {
                console.warn(
                  '⚠️ html2canvas échoué pour la feuille:',
                  sheet.title,
                  html2canvasError
                );
                // FR: Créer un canvas de fallback
                // EN: Create fallback canvas
                canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = active.mapStyle?.backgroundColor || '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.fillStyle = '#000000';
                  ctx.font = '24px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('Export PDF - BigMind', canvas.width / 2, canvas.height / 2);
                  ctx.fillText(`Feuille: ${sheet.title}`, canvas.width / 2, canvas.height / 2 + 40);
                }
              }

              // FR: Ajouter une nouvelle page si ce n'est pas la première
              // EN: Add new page if not the first one
              if (i > 0) {
                pdf.addPage();
              }

              // FR: Calculer les dimensions et centrer l'image
              // EN: Calculate dimensions and center image
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              const imgWidth = canvas.width;
              const imgHeight = canvas.height;
              const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
              const finalWidth = imgWidth * ratio;
              const finalHeight = imgHeight * ratio;
              const x = (pdfWidth - finalWidth) / 2;
              const y = (pdfHeight - finalHeight) / 2;

              // FR: Ajouter l'image à la page
              // EN: Add image to page
              pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);

              // FR: Ajouter le titre de la feuille en bas de page
              // EN: Add sheet title at bottom of page
              pdf.setFontSize(10);
              pdf.setTextColor(100, 100, 100);
              pdf.text(sheet.title, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
            }

            // FR: Restaurer les éléments masqués
            // EN: Restore hidden elements
            elementsToHide.forEach(({ element, originalDisplay }) => {
              element.style.display = originalDisplay;
            });

            // FR: Retirer la classe d'export pour réafficher la mini-map
            // EN: Remove export class to show mini-map again
            if (mindmapCanvas) {
              mindmapCanvas.classList.remove('exporting');
            }
            if (reactFlowElement) {
              reactFlowElement.classList.remove('exporting');
            }
          }
        }

        // FR: Restaurer la feuille originale
        // EN: Restore original sheet
        if (originalSheetId) {
          const { setActiveSheet } = useOpenFiles.getState();
          setActiveSheet(active.id, originalSheetId);
        }
      } else {
        // FR: Export simple pour un seul contenu (FreeMind ou XMind avec une seule feuille)
        // EN: Simple export for single content (FreeMind or XMind with single sheet)
        console.log('📄 Export simple (une seule feuille)');

        const reactFlowElement = document.querySelector('.react-flow');
        if (!reactFlowElement) {
          throw new Error('Élément React Flow non trouvé');
        }

        // FR: Masquer la mini-map et l'attribution pour l'export
        // EN: Hide mini-map and attribution for export
        const mindmapCanvas = document.querySelector('.mindmap-canvas');
        const minimap = document.querySelector('.react-flow__minimap');
        const attribution = document.querySelector('.react-flow__attribution');
        const panels = document.querySelectorAll('.react-flow__panel');

        // FR: Stocker les styles originaux pour les restaurer après
        // EN: Store original styles to restore them after
        const elementsToHide: Array<{ element: HTMLElement; originalDisplay: string }> = [];

        if (mindmapCanvas) {
          mindmapCanvas.classList.add('exporting');
        }
        if (reactFlowElement) {
          reactFlowElement.classList.add('exporting');
        }

        // FR: Masquer directement avec JavaScript pour être sûr
        // EN: Hide directly with JavaScript to be sure
        if (minimap) {
          const el = minimap as HTMLElement;
          elementsToHide.push({ element: el, originalDisplay: el.style.display });
          el.style.display = 'none';
        }

        if (attribution) {
          const el = attribution as HTMLElement;
          elementsToHide.push({ element: el, originalDisplay: el.style.display });
          el.style.display = 'none';
        }

        panels.forEach(panel => {
          const el = panel as HTMLElement;
          elementsToHide.push({ element: el, originalDisplay: el.style.display });
          el.style.display = 'none';
        });

        // FR: Attendre un peu pour que les changements prennent effet
        // EN: Wait a bit for changes to take effect
        await new Promise(resolve => setTimeout(resolve, 100));

        let canvas;
        try {
          // FR: Calculer les dimensions optimales pour faire tenir la carte sur la page
          // EN: Calculate optimal dimensions to fit the map on the page
          const reactFlowWidth = reactFlowElement.scrollWidth;
          const reactFlowHeight = reactFlowElement.scrollHeight;

          // FR: Dimensions de la page PDF (A4 paysage en mm, converties en pixels à 96 DPI)
          // EN: PDF page dimensions (A4 landscape in mm, converted to pixels at 96 DPI)
          const pdfWidthMM = 297; // A4 landscape width
          const pdfHeightMM = 210; // A4 landscape height
          const mmToPx = 96 / 25.4; // 96 DPI conversion
          const pdfWidthPx = pdfWidthMM * mmToPx;
          const pdfHeightPx = pdfHeightMM * mmToPx;

          // FR: Calculer le facteur d'échelle pour faire tenir la carte
          // EN: Calculate scale factor to fit the map
          const scaleX = pdfWidthPx / reactFlowWidth;
          const scaleY = pdfHeightPx / reactFlowHeight;
          const optimalScale = Math.min(scaleX, scaleY, 1); // Ne pas agrandir, seulement réduire

          console.log(`📐 Dimensions carte: ${reactFlowWidth}x${reactFlowHeight}px`);
          console.log(`📐 Dimensions PDF: ${pdfWidthPx}x${pdfHeightPx}px`);
          console.log(`📐 Échelle optimale: ${optimalScale.toFixed(3)}`);

          canvas = await html2canvas(reactFlowElement as HTMLElement, {
            backgroundColor: active.mapStyle?.backgroundColor || '#ffffff',
            scale: optimalScale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            width: reactFlowWidth,
            height: reactFlowHeight,
          });
        } catch (html2canvasError) {
          console.warn('⚠️ html2canvas échoué, tentative de fallback:', html2canvasError);
          canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = active.mapStyle?.backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Export PDF - BigMind', canvas.width / 2, canvas.height / 2);
            ctx.fillText(
              `Carte: ${active.name || 'Sans nom'}`,
              canvas.width / 2,
              canvas.height / 2 + 40
            );
          }
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);

        // FR: Restaurer les éléments masqués
        // EN: Restore hidden elements
        elementsToHide.forEach(({ element, originalDisplay }) => {
          element.style.display = originalDisplay;
        });

        // FR: Retirer la classe d'export pour réafficher la mini-map
        // EN: Remove export class to show mini-map again
        if (mindmapCanvas) {
          mindmapCanvas.classList.remove('exporting');
        }
        if (reactFlowElement) {
          reactFlowElement.classList.remove('exporting');
        }
      }

      // FR: Ajouter des métadonnées
      // EN: Add metadata
      pdf.setProperties({
        title: active.name || 'Carte mentale',
        subject: 'Export BigMind',
        author: 'BigMind',
        creator: 'BigMind',
      });

      // FR: Télécharger le PDF
      // EN: Download PDF
      const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
      const fileName = `${baseName}.pdf`;

      console.log('💾 Téléchargement du PDF:', fileName);

      const pdfBlob = pdf.output('blob');
      const success = downloadFile(pdfBlob, fileName, 'application/pdf');
      if (!success) {
        throw new Error('Échec du téléchargement du fichier PDF');
      }
      console.log('✅ Export PDF terminé avec succès');
    } catch (error) {
      console.error("❌ Erreur lors de l'export PDF:", error);
      throw error;
    } finally {
      // FR: S'assurer que la classe d'export est retirée même en cas d'erreur
      // EN: Ensure export class is removed even on error
      const mindmapCanvas = document.querySelector('.mindmap-canvas');
      const reactFlowElement = document.querySelector('.react-flow');
      if (mindmapCanvas) {
        mindmapCanvas.classList.remove('exporting');
      }
      if (reactFlowElement) {
        reactFlowElement.classList.remove('exporting');
      }
    }
  }, []);

  // FR: Exporter avec un nom suggéré (ajoute un suffixe) - DÉPRÉCIÉ
  // EN: Export with suggested name (adds suffix) - DEPRECATED
  const exportXMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content)
      throw new Error('Aucun fichier XMind actif');

    // FR: Ajouter un suffixe avec la date/heure pour l'export
    // EN: Add suffix with date/time for export
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    const baseName = active.name.replace(/\.xmind$/i, '');
    const exportFileName = `${baseName}_export_${timestamp}.xmind`;

    await exportActiveXMind(exportFileName);
  }, [exportActiveXMind]);

  // FR: Exporter vers PNG
  // EN: Export to PNG
  const exportToPNG = useCallback(async () => {
    const active = getActiveFile();
    if (!active || !active.content) {
      alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
      throw new Error('Aucun fichier actif');
    }

    console.log("🔄 exportToPNG - Début de l'export vers PNG");

    try {
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) {
        throw new Error('Élément React Flow non trouvé');
      }

      // FR: Masquer la mini-map et l'attribution pour l'export
      // EN: Hide mini-map and attribution for export
      const mindmapCanvas = document.querySelector('.mindmap-canvas');
      const minimap = document.querySelector('.react-flow__minimap');
      const attribution = document.querySelector('.react-flow__attribution');
      const panels = document.querySelectorAll('.react-flow__panel');

      const elementsToHide: Array<{ element: HTMLElement; originalDisplay: string }> = [];

      if (mindmapCanvas) {
        mindmapCanvas.classList.add('exporting');
      }
      if (reactFlowElement) {
        reactFlowElement.classList.add('exporting');
      }

      if (minimap) {
        const el = minimap as HTMLElement;
        elementsToHide.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      }

      if (attribution) {
        const el = attribution as HTMLElement;
        elementsToHide.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      }

      panels.forEach(panel => {
        const el = panel as HTMLElement;
        elementsToHide.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      let canvas;
      try {
        const reactFlowWidth = reactFlowElement.scrollWidth;
        const reactFlowHeight = reactFlowElement.scrollHeight;

        canvas = await html2canvas(reactFlowElement as HTMLElement, {
          backgroundColor: active.mapStyle?.backgroundColor || '#ffffff',
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: reactFlowWidth,
          height: reactFlowHeight,
        });
      } catch (html2canvasError) {
        console.warn('⚠️ html2canvas échoué, tentative de fallback:', html2canvasError);
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = active.mapStyle?.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Export PNG - BigMind', canvas.width / 2, canvas.height / 2);
          ctx.fillText(
            `Carte: ${active.name || 'Sans nom'}`,
            canvas.width / 2,
            canvas.height / 2 + 40
          );
        }
      }

      // FR: Restaurer les éléments masqués
      // EN: Restore hidden elements
      elementsToHide.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay;
      });

      if (mindmapCanvas) {
        mindmapCanvas.classList.remove('exporting');
      }
      if (reactFlowElement) {
        reactFlowElement.classList.remove('exporting');
      }

      // FR: Télécharger le PNG
      // EN: Download PNG
      const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
      const fileName = `${baseName}.png`;

      console.log('💾 Téléchargement du PNG:', fileName);

      // FR: Convertir data URL en Blob
      // EN: Convert data URL to Blob
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const success = downloadFile(blob, fileName, 'image/png');
      if (!success) {
        throw new Error('Échec du téléchargement du fichier PNG');
      }
      console.log('✅ Export PNG terminé avec succès');
    } catch (error) {
      console.error("❌ Erreur lors de l'export PNG:", error);
      throw error;
    } finally {
      // FR: S'assurer que la classe d'export est retirée même en cas d'erreur
      // EN: Ensure export class is removed even on error
      const mindmapCanvas = document.querySelector('.mindmap-canvas');
      if (mindmapCanvas) {
        mindmapCanvas.classList.remove('exporting');
      }
    }
  }, []);

  // FR: Exporter vers JPEG
  // EN: Export to JPEG
  const exportToJPEG = useCallback(async () => {
    const active = getActiveFile();
    if (!active || !active.content) {
      alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
      throw new Error('Aucun fichier actif');
    }

    console.log("🔄 exportToJPEG - Début de l'export vers JPEG");

    try {
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) {
        throw new Error('Élément React Flow non trouvé');
      }

      // FR: Masquer la mini-map et l'attribution pour l'export
      // EN: Hide mini-map and attribution for export
      const mindmapCanvas = document.querySelector('.mindmap-canvas');
      const minimap = document.querySelector('.react-flow__minimap');
      const attribution = document.querySelector('.react-flow__attribution');
      const panels = document.querySelectorAll('.react-flow__panel');

      const elementsToHide: Array<{ element: HTMLElement; originalDisplay: string }> = [];

      if (mindmapCanvas) {
        mindmapCanvas.classList.add('exporting');
      }
      if (reactFlowElement) {
        reactFlowElement.classList.add('exporting');
      }

      if (minimap) {
        const el = minimap as HTMLElement;
        elementsToHide.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      }

      if (attribution) {
        const el = attribution as HTMLElement;
        elementsToHide.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      }

      panels.forEach(panel => {
        const el = panel as HTMLElement;
        elementsToHide.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      let canvas;
      try {
        const reactFlowWidth = reactFlowElement.scrollWidth;
        const reactFlowHeight = reactFlowElement.scrollHeight;

        canvas = await html2canvas(reactFlowElement as HTMLElement, {
          backgroundColor: active.mapStyle?.backgroundColor || '#ffffff',
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: reactFlowWidth,
          height: reactFlowHeight,
        });
      } catch (html2canvasError) {
        console.warn('⚠️ html2canvas échoué, tentative de fallback:', html2canvasError);
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = active.mapStyle?.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Export JPEG - BigMind', canvas.width / 2, canvas.height / 2);
          ctx.fillText(
            `Carte: ${active.name || 'Sans nom'}`,
            canvas.width / 2,
            canvas.height / 2 + 40
          );
        }
      }

      // FR: Restaurer les éléments masqués
      // EN: Restore hidden elements
      elementsToHide.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay;
      });

      if (mindmapCanvas) {
        mindmapCanvas.classList.remove('exporting');
      }
      if (reactFlowElement) {
        reactFlowElement.classList.remove('exporting');
      }

      // FR: Télécharger le JPEG
      // EN: Download JPEG
      const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
      const fileName = `${baseName}.jpg`;

      console.log('💾 Téléchargement du JPEG:', fileName);

      // FR: Convertir data URL en Blob
      // EN: Convert data URL to Blob
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const success = downloadFile(blob, fileName, 'image/jpeg');
      if (!success) {
        throw new Error('Échec du téléchargement du fichier JPEG');
      }
      console.log('✅ Export JPEG terminé avec succès');
    } catch (error) {
      console.error("❌ Erreur lors de l'export JPEG:", error);
      throw error;
    } finally {
      // FR: S'assurer que la classe d'export est retirée même en cas d'erreur
      // EN: Ensure export class is removed even on error
      const mindmapCanvas = document.querySelector('.mindmap-canvas');
      if (mindmapCanvas) {
        mindmapCanvas.classList.remove('exporting');
      }
    }
  }, []);

  /**
   * FR: Restaurer la dernière carte ouverte depuis localStorage
   * EN: Restore last opened map from localStorage
   */
  const restoreLastOpenedFile = useCallback(() => {
    try {
      const lastFileJson = localStorage.getItem('bigmind_lastOpenedFile');
      if (!lastFileJson) {
        console.log('📂 Aucune carte précédente trouvée');
        return false;
      }

      const lastFileData = JSON.parse(lastFileJson);
      console.log('🔄 Restauration de la dernière carte:', lastFileData.name);

      // FR: Rouvrir le fichier avec les données sauvegardées
      // EN: Reopen file with saved data
      addFileToOpenFiles({
        name: lastFileData.name,
        path: lastFileData.path,
        type: lastFileData.type,
        content: lastFileData.content,
        sheets: lastFileData.sheets,
        activeSheetId: lastFileData.activeSheetId,
        sheetsData: lastFileData.sheetsData,
        themeColors: lastFileData.themeColors,
        paletteId: lastFileData.paletteId || 'vibrant',
        mapStyle: lastFileData.mapStyle,
      });

      console.log('✅ Dernière carte restaurée avec succès');
      return true;
    } catch (error) {
      console.warn('⚠️ Erreur lors de la restauration de la dernière carte:', error);
      // FR: En cas d'erreur, supprimer les données corrompues
      // EN: On error, remove corrupted data
      try {
        localStorage.removeItem('bigmind_lastOpenedFile');
      } catch (e) {
        // Ignore
      }
      return false;
    }
  }, [addFileToOpenFiles]);

  return {
    openFile,
    openFreeMindFile,
    openXMindFile,
    createNew,
    openFileDialog,
    restoreLastOpenedFile,
    exportActiveXMind,
    saveAsXMind,
    exportXMind,
    exportToFreeMind,
    exportToPDF,
    exportToPNG,
    exportToJPEG,
    exportToSVG: useCallback(async () => {
      const active = getActiveFile();
      if (!active || !active.content) {
        alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
        throw new Error('Aucun fichier actif');
      }

      console.log("🔄 exportToSVG - Début de l'export vers SVG");

      try {
        // FR: Générer le SVG à partir de la structure de la carte mentale
        // EN: Generate SVG from mind map structure
        const svgContent = generateSVGFromMindMap(active.content, active.mapStyle);

        // FR: Créer un Blob avec le contenu SVG
        // EN: Create Blob with SVG content
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });

        // FR: Télécharger le SVG
        // EN: Download SVG
        const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
        const fileName = `${baseName}.svg`;

        console.log('💾 Téléchargement du SVG:', fileName);

        saveAs(svgBlob, fileName);
        console.log('✅ Export SVG terminé avec succès');
      } catch (error) {
        console.error("❌ Erreur lors de l'export SVG:", error);
        throw error;
      }
    }, []),
    exportToMarkdown: useCallback(async () => {
      const active = getActiveFile();
      if (!active || !active.content) {
        alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
        throw new Error('Aucun fichier actif');
      }

      console.log("🔄 exportToMarkdown - Début de l'export vers Markdown");

      try {
        // FR: Générer le Markdown à partir de la structure de la carte mentale
        // EN: Generate Markdown from mind map structure
        const markdownContent = generateMarkdownFromMindMap(active.content);

        // FR: Créer un Blob avec le contenu Markdown
        // EN: Create Blob with Markdown content
        const markdownBlob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });

        // FR: Télécharger le Markdown
        // EN: Download Markdown
        const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
        const fileName = `${baseName}.md`;

        console.log('💾 Téléchargement du Markdown:', fileName);

        saveAs(markdownBlob, fileName);
        console.log('✅ Export Markdown terminé avec succès');
      } catch (error) {
        console.error("❌ Erreur lors de l'export Markdown:", error);
        throw error;
      }
    }, []),
    exportToWord: useCallback(async () => {
      const active = getActiveFile();
      if (!active || !active.content) {
        alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
        throw new Error('Aucun fichier actif');
      }

      console.log("🔄 exportToWord - Début de l'export vers Word");

      try {
        // FR: Générer le document Word à partir de la structure de la carte mentale
        // EN: Generate Word document from mind map structure
        const doc = generateWordFromMindMap(active.content);

        // FR: Générer le buffer du document
        // EN: Generate document buffer
        const buffer = await Packer.toBuffer(doc);

        // FR: Créer un Blob avec le contenu Word
        // EN: Create Blob with Word content
        const wordBlob = new Blob([new Uint8Array(buffer)], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // FR: Télécharger le Word
        // EN: Download Word
        const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
        const fileName = `${baseName}.docx`;

        console.log('💾 Téléchargement du Word:', fileName);

        saveAs(wordBlob, fileName);
        console.log('✅ Export Word terminé avec succès');
      } catch (error) {
        console.error("❌ Erreur lors de l'export Word:", error);
        throw error;
      }
    }, []),
    exportToExcel: useCallback(async () => {
      const active = getActiveFile();
      if (!active || !active.content) {
        alert("Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d'exporter.");
        throw new Error('Aucun fichier actif');
      }

      console.log("🔄 exportToExcel - Début de l'export vers Excel");

      try {
        // FR: Générer le classeur Excel à partir de la structure de la carte mentale
        // EN: Generate Excel workbook from mind map structure
        const workbook = generateExcelFromMindMap(active.content);

        // FR: Générer le buffer du classeur
        // EN: Generate workbook buffer
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // FR: Créer un Blob avec le contenu Excel
        // EN: Create Blob with Excel content
        const excelBlob = new Blob([new Uint8Array(buffer)], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // FR: Télécharger l'Excel
        // EN: Download Excel
        const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
        const fileName = `${baseName}.xlsx`;

        console.log("💾 Téléchargement de l'Excel:", fileName);

        saveAs(excelBlob, fileName);
        console.log('✅ Export Excel terminé avec succès');
      } catch (error) {
        console.error("❌ Erreur lors de l'export Excel:", error);
        throw error;
      }
    }, []),
  };
};
