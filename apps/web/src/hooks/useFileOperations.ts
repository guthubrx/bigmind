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

/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */
export const useFileOperations = () => {
  const { openFile: addFileToOpenFiles, createNewFile } = useOpenFiles();
  const getActiveFile = useOpenFiles.getState().getActiveFile;

  /**
   * FR: Ouvrir un fichier .mm (FreeMind)
   * EN: Open a .mm file (FreeMind)
   */
  const openFreeMindFile = useCallback(async (file: File) => {
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
          children: bigMindData.nodes[bigMindData.rootId]?.children || []
        },
        nodes: bigMindData.nodes
      };
      
      return addFileToOpenFiles({
        name: file.name,
        type: 'mm',
        content: adaptedContent
      });
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier .mm:', error);
      throw error;
    }
  }, [addFileToOpenFiles]);

  /**
   * FR: Ouvrir un fichier .xmind
   * EN: Open a .xmind file
   */
  const openXMindFile = useCallback(async (file: File) => {
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
            children: bigMindData.nodes[bigMindData.rootId]?.children || []
          },
          nodes: bigMindData.nodes
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
          activeSheetId: xMindMap.sheetsMeta && xMindMap.sheetsMeta.length > 0 ? xMindMap.sheetsMeta[0].id : null,
        });
        return fileId;
      } catch (standardError) {
        const stdMsg = standardError instanceof Error ? standardError.message : String(standardError);
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
            children: bigMindData.nodes[bigMindData.rootId]?.children || []
          },
          nodes: bigMindData.nodes
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
          }
        } catch (e) {
      // Ignore errors
    }
        
        return addFileToOpenFiles({
          name: file.name,
          type: 'xmind',
          content: adaptedContent
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier .xmind:', error);
      throw error;
    }
  }, [addFileToOpenFiles]);

  /**
   * FR: Ouvrir un fichier (détection automatique du type)
   * EN: Open a file (automatic type detection)
   */
  const openFile = useCallback(async (file: File) => {
    const extension = file.name.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'mm':
        return openFreeMindFile(file);
      case 'xmind':
        return openXMindFile(file);
      default:
        throw new Error(`Format de fichier non supporté: .${extension}`);
    }
  }, [openFreeMindFile, openXMindFile]);

  /**
   * FR: Créer un nouveau fichier
   * EN: Create a new file
   */
  const createNew = useCallback((name?: string) => {
    return createNewFile(name);
  }, [createNewFile]);

  /**
   * FR: Ouvrir un fichier via le sélecteur de fichiers
   * EN: Open a file via file picker
   */
  const openFileDialog = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mm,.xmind';
      input.multiple = false;
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  }, []);

  // FR: Exporter le fichier actif en .xmind en fusionnant l'overlay local dans content.json
  // EN: Export the active file to .xmind merging overlay into content.json
  const exportActiveXMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content) throw new Error('Aucun fichier XMind actif');

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
        children: n.children && n.children.length > 0 ? { attached: n.children.map(buildTopic).filter(Boolean) } : undefined,
      };
    };
    const json = [{ class: 'sheet', rootTopic: buildTopic(active.content.rootNode.id) }];
    zip.file('content.json', JSON.stringify(json, null, 2));

    // FR: Ecrire le sidecar embarqué
    try {
      const overlay: any = { nodes: {} };
      Object.values(active.content.nodes).forEach((n: any) => {
        overlay.nodes[n.id] = { title: n.title, notes: n.notes, style: n.style };
      });
      overlay.options = {
        zoom: useViewport.getState().zoom,
        nodesDraggable: useCanvasOptions.getState().nodesDraggable,
      };
      zip.file('bigmind.json', JSON.stringify(overlay, null, 2));
    } catch (e) {
      // Ignore errors
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = active.name.replace(/\.xmind$/i, '') + '.xmind';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }, []);

  return {
    openFile,
    openFreeMindFile,
    openXMindFile,
    createNew,
    openFileDialog,
    exportActiveXMind
  };
};
