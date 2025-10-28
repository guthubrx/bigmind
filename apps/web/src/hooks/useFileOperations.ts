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
import {
  applyOverlayFromLocalStorage,
  applyOverlayFromZip,
} from '../utils/overlayLoader';

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
 * FR: Valider un overlay JSON avant fusion
 * EN: Validate JSON overlay before merging
 */
const validateOverlay = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;

  // FR: Vérifier que nodes est un objet avec des IDs valides
  // EN: Check that nodes is an object with valid IDs
  if (data.nodes) {
    if (typeof data.nodes !== 'object') return false;

    // FR: Limiter le nombre de nodes pour éviter les attaques
    // EN: Limit number of nodes to prevent attacks
    const nodeKeys = Object.keys(data.nodes);
    if (nodeKeys.length > 10000) return false;

    // FR: Vérifier que chaque node a une structure valide
    // EN: Check that each node has valid structure
    const allNodesValid = nodeKeys.every(key => {
      const node = data.nodes[key];
      if (typeof node !== 'object') return false;

      // FR: Vérifier les types des propriétés si présentes
      // EN: Check property types if present
      if (node.title !== undefined && typeof node.title !== 'string') return false;
      if (node.notes !== undefined && typeof node.notes !== 'string') return false;
      if (node.collapsed !== undefined && typeof node.collapsed !== 'boolean') return false;
      return true;
    });
    if (!allNodesValid) return false;
  }

  // FR: Valider les tags si présents
  // EN: Validate tags if present
  if (data.tags) {
    if (typeof data.tags !== 'object') return false;
    if (data.tags.tags && typeof data.tags.tags !== 'object') return false;
    if (data.tags.links && !Array.isArray(data.tags.links)) return false;
    if (data.tags.nodeTags && typeof data.tags.nodeTags !== 'object') return false;
    if (data.tags.tagNodes && typeof data.tags.tagNodes !== 'object') return false;
    if (data.tags.hiddenTags && !Array.isArray(data.tags.hiddenTags)) return false;
  }

  return true;
};

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

        // FR: Essayer d'abord le parser standard
        // EN: Try standard parser first
        try {
          const xMindMap = await XMindParser.parse(arrayBuffer);
          const bigMindData = XMindParser.convertToBigMind(xMindMap);

          // FR: Adapter la structure pour useOpenFiles
          // EN: Adapt structure for useOpenFiles
          let adaptedContent = adaptBigMindToContent(bigMindData);

          // FR: Appliquer overlay depuis localStorage
          // EN: Apply overlay from localStorage
          applyOverlayFromLocalStorage(adaptedContent, file.name);

          // FR: Appliquer overlay depuis ZIP si présent
          // EN: Apply overlay from ZIP if present
          let loadedTags: any = null;
          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
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
              const tagCount = Object.keys(loadedTags.tags || {}).length;
              const assocCount = Object.keys(loadedTags.nodeTags || {}).length;
              // eslint-disable-next-line no-console
              console.log(`[FileOps] Chargé ${tagCount} tags et ${assocCount} associations`);
            } catch (err) {
              console.error('[FileOps] Erreur lors du chargement des tags:', err);
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
          let adaptedContent = adaptBigMindToContent(bigMindData);

          // FR: Appliquer overlay depuis localStorage
          // EN: Apply overlay from localStorage
          applyOverlayFromLocalStorage(adaptedContent, file.name);

          // FR: Appliquer overlay depuis ZIP si présent
          // EN: Apply overlay from ZIP if present
          let loadedTagsFallback: any = null;
          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
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
              const fbTagCount = Object.keys(loadedTagsFallback.tags || {}).length;
              // eslint-disable-next-line no-console
              console.log(`[FileOps] Chargé ${fbTagCount} tags (fallback)`);
            } catch (err) {
              console.error('[FileOps] Erreur lors du chargement des tags (fallback):', err);
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
  const exportActiveXMind = useCallback(async () => {
    const active = useOpenFiles.getState().getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content)
      throw new Error('Aucun fichier XMind actif');

    const zip = new JSZip();
    // Recréer un content.json minimal pour la sauvegarde (topic tree à partir de nodes)
    // Ici, on sérialise simple: rootTopic avec children.attached récursifs
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
    const json = [{ class: 'sheet', rootTopic: buildTopic(active.content.rootNode.id) }];
    zip.file('content.json', JSON.stringify(json, null, 2));

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
