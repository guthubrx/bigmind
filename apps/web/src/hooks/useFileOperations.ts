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
import { useTagGraph } from './useTagGraph';
import { useNodeTags } from './useNodeTags';

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
            name: bigMindData.name,
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
          let loadedTags: any = null;
          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const sidecar = zip.file('bigmind.json');
            if (sidecar) {
              const text = await sidecar.async('text');
              const data = JSON.parse(text);
              if (data?.nodes) {
                Object.entries(data.nodes).forEach(([id, patch]: any) => {
                  if (adaptedContent.nodes?.[id]) {
                    adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                  }
                });
              }
              // FR: Sauvegarder les tags pour les charger après
              // EN: Save tags to load them later
              if (data?.tags) {
                loadedTags = data.tags;
              }
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

          // FR: Charger les tags dans les stores
          // EN: Load tags into stores
          if (loadedTags) {
            try {
              // Charger dans useTagGraph
              if (loadedTags.tags || loadedTags.links) {
                useTagGraph.getState().initialize(loadedTags.tags || {}, loadedTags.links || []);
                const tagCount = Object.keys(loadedTags.tags || {}).length;
                // eslint-disable-next-line no-console
                console.log(`[FileOps] Chargé ${tagCount} tags pour ${fileId}`);
              }

              // Charger dans useNodeTags
              if (loadedTags.nodeTags || loadedTags.tagNodes) {
                useNodeTags
                  .getState()
                  .initialize(loadedTags.nodeTags || {}, loadedTags.tagNodes || {});
                const assocCount = Object.keys(loadedTags.nodeTags || {}).length;
                // eslint-disable-next-line no-console
                console.log(`[FileOps] Chargé ${assocCount} associations nœud→tag`);
              }
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
          const adaptedContent: any = {
            id: bigMindData.id,
            name: bigMindData.name,
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

          let loadedTagsFallback: any = null;
          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const sidecar = zip.file('bigmind.json');
            if (sidecar) {
              const text = await sidecar.async('text');
              const data = JSON.parse(text);
              if (data?.nodes) {
                Object.entries(data.nodes).forEach(([id, patch]: any) => {
                  if (adaptedContent.nodes?.[id]) {
                    adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                  }
                });
              }
              if (data?.tags) {
                loadedTagsFallback = data.tags;
              }
            }
          } catch (e) {
            // Ignore errors
          }

          const fileIdFallback = addFileToOpenFiles({
            name: file.name,
            type: 'xmind',
            content: adaptedContent,
          });

          // FR: Charger les tags dans les stores
          // EN: Load tags into stores
          if (loadedTagsFallback) {
            try {
              if (loadedTagsFallback.tags || loadedTagsFallback.links) {
                useTagGraph
                  .getState()
                  .initialize(loadedTagsFallback.tags || {}, loadedTagsFallback.links || []);
                const fbTagCount = Object.keys(loadedTagsFallback.tags || {}).length;
                // eslint-disable-next-line no-console
                console.log(`[FileOps] Chargé ${fbTagCount} tags (fallback)`);
              }
              if (loadedTagsFallback.nodeTags || loadedTagsFallback.tagNodes) {
                useNodeTags
                  .getState()
                  .initialize(loadedTagsFallback.nodeTags || {}, loadedTagsFallback.tagNodes || {});
              }
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

      // FR: Sauvegarder les tags et les associations
      // EN: Save tags and associations
      const tagGraphState = useTagGraph.getState();
      const nodeTagsState = useNodeTags.getState();

      overlay.tags = {
        tags: tagGraphState.tags,
        links: tagGraphState.links,
        nodeTags: Object.fromEntries(
          Object.entries(nodeTagsState.nodeTagMap).map(([nodeId, tagSet]) => [
            nodeId,
            Array.from(tagSet),
          ])
        ),
        tagNodes: Object.fromEntries(
          Object.entries(nodeTagsState.tagNodeMap).map(([tagId, nodeSet]) => [
            tagId,
            Array.from(nodeSet),
          ])
        ),
      };

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
