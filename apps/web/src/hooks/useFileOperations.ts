/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */

import { useCallback } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { FreeMindParser } from '../parsers/FreeMindParser';
import { XMindParser } from '../parsers/XMindParser';
import JSZip from 'jszip';
import { useViewport } from './useViewport';
import { useCanvasOptions } from './useCanvasOptions';
import { useTagStore } from './useTagStore';
import { adaptBigMindToContent } from '../utils/contentAdapter';
import { applyOverlayFromLocalStorage, applyOverlayFromZip } from '../utils/overlayLoader';

/**
 * FR: Limites de sécurité pour les archives ZIP
 * EN: Security limits for ZIP archives
 *
 * Note: La vérification de taille du fichier compressé (MAX_FILE_SIZE)
 * offre une protection de base contre les ZIP bombs. Une limite plus stricte
 * sur la taille décompressée nécessiterait de décompresser l'archive entière,
 * ce qui peut être coûteux en performance.
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * FR: Appliquer les couleurs XMind aux nœuds basé sur le thème
 * EN: Apply XMind colors to nodes based on theme
 */
function applyXMindColors(content: any, xmindTheme: any) {
  // FR: Essayer d'abord "multi-line-colors" (couleurs vives), sinon "color-list"
  // EN: Try "multi-line-colors" first (vivid colors), otherwise "color-list"
  const colorPalette =
    xmindTheme?.map?.properties?.['multi-line-colors'] ||
    xmindTheme?.map?.properties?.['color-list'];

  if (!colorPalette) {
    return;
  }

  // Extraire la palette de couleurs
  const palette = colorPalette.split(/\s+/).filter((c: string) => c.startsWith('#'));

  if (palette.length === 0) {
    return;
  }

  // Obtenir la couleur du topic central
  const centralColor = xmindTheme.centralTopic?.properties?.['svg:fill'] || palette[0] || '#000229';

  // Fonction pour calculer la luminance et déterminer la couleur de texte optimale
  function getOptimalTextColor(bgColor: string): string {
    try {
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luminance > 0.5 ? '#000000' : '#ffffff';
    } catch {
      return '#000000';
    }
  }

  // FR: Fonction pour éclaircir une couleur hex
  // EN: Function to lighten a hex color
  function lightenColor(hex: string, percent: number): string {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      /* eslint-disable no-bitwise */
      const r = (num >> 16) + Math.round(((255 - (num >> 16)) * percent) / 100);
      const g = ((num >> 8) & 0x00ff) + Math.round(((255 - ((num >> 8) & 0x00ff)) * percent) / 100);
      const b = (num & 0x0000ff) + Math.round(((255 - (num & 0x0000ff)) * percent) / 100);
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
      /* eslint-enable no-bitwise */
    } catch {
      return hex;
    }
  }

  // Fonction récursive pour appliquer la couleur à toute une branche avec variation
  function applyColorToBranch(
    nodes: Record<string, any>,
    nodeId: string,
    baseColor: string,
    level: number = 0
  ) {
    const node = nodes[nodeId];
    if (!node) return;

    // FR: Calculer la couleur en fonction du niveau
    // EN: Calculate color based on level
    // Niveau 0 (enfant direct de racine) : couleur de base
    // Niveau 1 : éclaircir de 35%
    // Niveau 2+ : éclaircir de 50% (fixe)
    // eslint-disable-next-line no-nested-ternary
    const lightenPercent = level === 0 ? 0 : level === 1 ? 35 : 50;
    const color = level === 0 ? baseColor : lightenColor(baseColor, lightenPercent);

    node.style = node.style || {};
    node.style.backgroundColor = color;
    node.style.textColor = getOptimalTextColor(color);

    // Appliquer récursivement à tous les descendants avec niveau incrémenté
    if (node.children) {
      node.children.forEach((childId: string) => {
        applyColorToBranch(nodes, childId, baseColor, level + 1);
      });
    }
  }

  // Appliquer la couleur au nœud racine
  const rootNode = content.nodes[content.rootNode.id];
  if (rootNode) {
    rootNode.style = rootNode.style || {};
    rootNode.style.backgroundColor = centralColor;
    rootNode.style.textColor = getOptimalTextColor(centralColor);
  }

  // Appliquer les couleurs aux enfants directs de la racine (main topics)
  // FR: XMind applique les couleurs dans l'ordre du tableau JSON
  // EN: XMind applies colors in JSON array order
  if (rootNode?.children) {
    rootNode.children.forEach((childId: string, index: number) => {
      const branchColor = palette[index % palette.length];
      applyColorToBranch(content.nodes, childId, branchColor);
    });
  }
}

/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */
export const useFileOperations = () => {
  const { openFile: addFileToOpenFiles, createNewFile } = useOpenFiles();

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
        const adaptedContent = adaptBigMindToContent(bigMindData);

        return addFileToOpenFiles({
          name: file.name,
          type: 'mm',
          content: adaptedContent,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
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
        // FR: Vérifier la taille du fichier avant lecture
        // EN: Check file size before reading
        if (file.size > MAX_FILE_SIZE) {
          const fileSizeMB = Math.round(file.size / 1024 / 1024);
          const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
          throw new Error(
            `Fichier trop volumineux (${fileSizeMB}MB). Maximum autorisé: ${maxSizeMB}MB`
          );
        }

        const arrayBuffer = await file.arrayBuffer();

        // FR: Charger le ZIP pour extraire les métadonnées XMind
        // EN: Load ZIP to extract XMind metadata
        const zip = await JSZip.loadAsync(arrayBuffer);

        // FR: Extraire les fichiers XMind originaux pour la compatibilité
        // EN: Extract original XMind files for compatibility
        const xmindOriginalData: any = {};
        try {
          // Extraire content.json pour le thème
          const contentFile = zip.file('content.json');
          if (contentFile) {
            const contentText = await contentFile.async('text');
            const contentJson = JSON.parse(contentText);
            // Le contenu peut être un tableau de sheets
            if (Array.isArray(contentJson) && contentJson.length > 0) {
              xmindOriginalData.theme = contentJson[0].theme;
              xmindOriginalData.extensions = contentJson[0].extensions;
              xmindOriginalData.structureClass = contentJson[0].structureClass;
            } else if (contentJson.theme) {
              xmindOriginalData.theme = contentJson.theme;
              xmindOriginalData.extensions = contentJson.extensions;
              xmindOriginalData.structureClass = contentJson.structureClass;
            }
          }

          // Extraire manifest.json
          const manifestFile = zip.file('manifest.json');
          if (manifestFile) {
            const manifestText = await manifestFile.async('text');
            xmindOriginalData.manifest = JSON.parse(manifestText);
          }

          // Extraire metadata.json
          const metadataFile = zip.file('metadata.json');
          if (metadataFile) {
            const metadataText = await metadataFile.async('text');
            xmindOriginalData.metadata = JSON.parse(metadataText);
          }
        } catch (e) {}

        // FR: Essayer d'abord le parser standard
        // EN: Try standard parser first
        try {
          const xMindMap = await XMindParser.parse(arrayBuffer);
          const bigMindData = XMindParser.convertToBigMind(xMindMap);

          // FR: Adapter la structure pour useOpenFiles
          // EN: Adapt structure for useOpenFiles
          const adaptedContent = adaptBigMindToContent(bigMindData);

          // FR: Appliquer les couleurs XMind si disponibles
          // EN: Apply XMind colors if available
          if (xmindOriginalData.theme) {
            // Debug: afficher l'ordre des enfants
            // const rootNode = adaptedContent.nodes[adaptedContent.rootNode.id];
            // rootNode?.children?.forEach((childId: string, index: number) => {
            //   const child = adaptedContent.nodes[childId];
            // });

            applyXMindColors(adaptedContent, xmindOriginalData.theme);
          }

          // FR: Appliquer overlay depuis localStorage
          // EN: Apply overlay from localStorage
          applyOverlayFromLocalStorage(adaptedContent, file.name);

          // FR: Appliquer overlay depuis ZIP si présent
          // EN: Apply overlay from ZIP if present
          let loadedTags: any = null;
          try {
            const { tags: zipTags } = await applyOverlayFromZip(adaptedContent, zip);
            // Tags can be an object with full structure or empty array
            if (zipTags && typeof zipTags === 'object' && !Array.isArray(zipTags)) {
              loadedTags = zipTags;
            } else if (Array.isArray(zipTags) && zipTags.length > 0) {
              loadedTags = zipTags;
            }
          } catch (e) {
            // Ignore errors
          }

          const fileId = addFileToOpenFiles({
            name: file.name,
            type: 'xmind',
            content: adaptedContent,
            sheets: xMindMap.sheetsMeta,
            sheetsData: xMindMap.sheetsData,
            activeSheetId:
              xMindMap.sheetsMeta && xMindMap.sheetsMeta.length > 0
                ? xMindMap.sheetsMeta[0].id
                : null,
            xmindOriginal: xmindOriginalData,
          });

          // FR: Charger les tags dans le store unifié
          // EN: Load tags into unified store
          if (loadedTags) {
            try {
              useTagStore.getState().initialize({
                tags: loadedTags.tags || {},
                links: loadedTags.links || [],
                nodeTags: loadedTags.nodeTags || {},
                tagNodes: loadedTags.tagNodes || {},
                hiddenTags: loadedTags.hiddenTags || [],
              });
              // const tagCount = Object.keys(loadedTags.tags || {}).length;
              // const assocCount = Object.keys(loadedTags.nodeTags || {}).length;
              // eslint-disable-next-line no-console
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('[FileOps] Erreur lors du chargement des tags:', err);
            }
          }

          return fileId;
        } catch (standardError) {
          // const stdMsg =
          //   standardError instanceof Error ? standardError.message : String(standardError);

          // FR: Essayer le parser de fallback
          // EN: Try fallback parser
          const xMindMap = await XMindParser.parseSimple(arrayBuffer);
          const bigMindData = XMindParser.convertToBigMind(xMindMap);

          // FR: Adapter la structure pour useOpenFiles
          // EN: Adapt structure for useOpenFiles
          const adaptedContent = adaptBigMindToContent(bigMindData);

          // FR: Appliquer les couleurs XMind si disponibles
          // EN: Apply XMind colors if available
          if (xmindOriginalData.theme) {
            // Debug: afficher l'ordre des enfants
            // const rootNode = adaptedContent.nodes[adaptedContent.rootNode.id];
            // rootNode?.children?.forEach((childId: string, index: number) => {
            //   const child = adaptedContent.nodes[childId];
            // });

            applyXMindColors(adaptedContent, xmindOriginalData.theme);
          }

          // FR: Appliquer overlay depuis localStorage
          // EN: Apply overlay from localStorage
          applyOverlayFromLocalStorage(adaptedContent, file.name);

          // FR: Appliquer overlay depuis ZIP si présent
          // EN: Apply overlay from ZIP if present
          let loadedTagsFallback: any = null;
          try {
            const { tags: zipTags } = await applyOverlayFromZip(adaptedContent, zip);
            // Tags can be an object with full structure or empty array
            if (zipTags && typeof zipTags === 'object' && !Array.isArray(zipTags)) {
              loadedTagsFallback = zipTags;
            } else if (Array.isArray(zipTags) && zipTags.length > 0) {
              loadedTagsFallback = zipTags;
            }
          } catch (e) {
            // Ignore errors
          }

          const fileIdFallback = addFileToOpenFiles({
            name: file.name,
            type: 'xmind',
            content: adaptedContent,
            xmindOriginal: xmindOriginalData,
          });

          // FR: Charger les tags dans le store unifié
          // EN: Load tags into unified store
          if (loadedTagsFallback) {
            try {
              useTagStore.getState().initialize({
                tags: loadedTagsFallback.tags || {},
                links: loadedTagsFallback.links || [],
                nodeTags: loadedTagsFallback.nodeTags || {},
                tagNodes: loadedTagsFallback.tagNodes || {},
                hiddenTags: loadedTagsFallback.hiddenTags || [],
              });
              // const fbTagCount = Object.keys(loadedTagsFallback.tags || {}).length;
              // eslint-disable-next-line no-console
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('[FileOps] Erreur lors du chargement des tags (fallback):', err);
            }
          }

          return fileIdFallback;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
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
  const exportActiveXMind = useCallback(async () => {
    const active = useOpenFiles.getState().getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content)
      throw new Error('Aucun fichier XMind actif');

    const zip = new JSZip();

    // FR: Recréer un content.json compatible XMind avec thème
    // EN: Recreate XMind-compatible content.json with theme
    const buildTopic = (id: string): any => {
      if (!active.content) return null;
      const n = active.content.nodes[id];
      if (!n) return null;
      const topic: any = {
        id: n.id,
        title: n.title,
      };

      // Ajouter les notes si présentes
      if (n.notes) {
        topic.notes = { plain: { content: n.notes } };
      }

      // Ajouter le style si présent
      if (n.style) {
        topic.style = n.style;
      }

      // Ajouter les enfants récursivement en préservant l'ordre
      if (n.children && n.children.length > 0) {
        topic.children = {
          attached: n.children.map(buildTopic).filter(Boolean),
        };
      }

      return topic;
    };

    const rootNode = active.content?.rootNode;
    if (!rootNode) {
      throw new Error('Nœud racine manquant dans le fichier actif');
    }

    const sheet: any = {
      id: active.activeSheetId || 'sheet-1',
      class: 'sheet',
      title: rootNode.title || active.name,
      rootTopic: buildTopic(rootNode.id),
    };

    // FR: Ajouter le thème XMind si disponible
    // EN: Add XMind theme if available
    if (active.xmindOriginal?.theme) {
      sheet.theme = active.xmindOriginal.theme;
    }

    // FR: Ajouter extensions et structureClass si disponibles
    // EN: Add extensions and structureClass if available
    if (active.xmindOriginal?.extensions) {
      sheet.extensions = active.xmindOriginal.extensions;
    }
    if (active.xmindOriginal?.structureClass) {
      sheet.structureClass = active.xmindOriginal.structureClass;
    }

    const json = [sheet];
    zip.file('content.json', JSON.stringify(json, null, 2));

    // FR: Sauvegarder manifest.json (requis par XMind)
    // EN: Save manifest.json (required by XMind)
    const manifest = active.xmindOriginal?.manifest || {
      'file-entries': {
        'content.json': {},
        'metadata.json': {},
        'Thumbnails/thumbnail.png': {},
      },
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // FR: Sauvegarder metadata.json (requis par XMind)
    // EN: Save metadata.json (required by XMind)
    const metadata = active.xmindOriginal?.metadata || {
      dataStructureVersion: '2',
      creator: {
        name: 'BigMind',
        version: '1.0.0',
      },
      activeSheetId: active.activeSheetId || sheet.id,
      layoutEngineVersion: '4',
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // FR: Ecrire le sidecar embarqué avec tags
    try {
      const overlay: any = { nodes: {} };
      Object.values(active.content.nodes).forEach((n: any) => {
        overlay.nodes[n.id] = { title: n.title, notes: n.notes, style: n.style };
      });
      overlay.options = {
        zoom: useViewport.getState().zoom,
        nodesDraggable: useCanvasOptions.getState().nodesDraggable,
      };

      // FR: Sauvegarder les tags depuis le store unifié
      // EN: Save tags from unified store
      overlay.tags = useTagStore.getState().export();

      zip.file('bigmind.json', JSON.stringify(overlay, null, 2));
    } catch (e) {
      // Ignore errors
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${active.name.replace(/\.xmind$/i, '')}.xmind`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }, []);

  return {
    openFile,
    openFreeMindFile,
    openXMindFile,
    createNew,
    openFileDialog,
    exportActiveXMind,
  };
};
