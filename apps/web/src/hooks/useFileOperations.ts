/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */

import { useCallback } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { FreeMindParser } from '../parsers/FreeMindParser';
import { XMindParser } from '../parsers/XMindParser';

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
          type: 'xmind',
          content: adaptedContent
        });
      } catch (standardError) {
        console.warn('Parser standard échoué, tentative avec le parser simple:', standardError.message);
        
        // FR: Essayer le parser de fallback
        // EN: Try fallback parser
        const xMindMap = await XMindParser.parseSimple(arrayBuffer);
        const bigMindData = XMindParser.convertToBigMind(xMindMap);
        
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

  return {
    openFile,
    openFreeMindFile,
    openXMindFile,
    createNew,
    openFileDialog
  };
};
