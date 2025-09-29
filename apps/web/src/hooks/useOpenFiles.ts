/**
 * FR: Hook pour gérer les fichiers ouverts et la navigation
 * EN: Hook to manage open files and navigation
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface OpenFile {
  id: string;
  name: string;
  path?: string;
  type: 'xmind' | 'mm' | 'new';
  content?: any; // Contenu parsé du fichier
  lastModified: Date;
  isActive: boolean;
}

export interface MindMapData {
  id: string;
  name: string;
  rootNode: {
    id: string;
    title: string;
    children: any[];
  };
  nodes: Record<string, any>;
}

interface OpenFilesState {
  openFiles: OpenFile[];
  activeFileId: string | null;
  openFile: (file: Omit<OpenFile, 'id' | 'lastModified' | 'isActive'>) => string;
  closeFile: (fileId: string) => void;
  activateFile: (fileId: string) => void;
  getActiveFile: () => OpenFile | null;
  createNewFile: (name?: string) => string;
}

/**
 * FR: Hook pour gérer les fichiers ouverts
 * EN: Hook to manage open files
 */
export const useOpenFiles = create<OpenFilesState>((set, get) => ({
  openFiles: [],
  activeFileId: null,

  // FR: Ouvrir un nouveau fichier
  // EN: Open a new file
  openFile: (file: Omit<OpenFile, 'id' | 'lastModified' | 'isActive'>) => {
    console.log('📂 Ouverture d\'un fichier:', file.name, file.type);
    const newFile: OpenFile = {
      ...file,
      id: uuidv4(),
      lastModified: new Date(),
      isActive: true
    };

    set((state) => {
      // FR: Désactiver tous les autres fichiers et ajouter le nouveau
      // EN: Deactivate all other files and add the new one
      const updatedFiles = state.openFiles.map(f => ({ ...f, isActive: false }));
      const result = [...updatedFiles, newFile];
      
      console.log('📁 Fichiers ouverts:', result.length);
      console.log('📁 Nouveau fichier actif:', newFile.id, newFile.isActive);
      
      return {
        ...state,
        openFiles: result,
        activeFileId: newFile.id
      };
    });

    console.log('✅ Fichier ouvert avec ID:', newFile.id);
    return newFile.id;
  },

  // FR: Fermer un fichier
  // EN: Close a file
  closeFile: (fileId: string) => {
    set((state) => {
      const filteredFiles = state.openFiles.filter(f => f.id !== fileId);
      
      // FR: Si on ferme le fichier actif, activer le précédent
      // EN: If closing active file, activate the previous one
      let newActiveFileId = state.activeFileId;
      if (fileId === state.activeFileId) {
        if (filteredFiles.length > 0) {
          const lastFile = filteredFiles[filteredFiles.length - 1];
          lastFile.isActive = true;
          newActiveFileId = lastFile.id;
        } else {
          newActiveFileId = null;
        }
      }
      
      return {
        ...state,
        openFiles: filteredFiles,
        activeFileId: newActiveFileId
      };
    });
  },

  // FR: Activer un fichier
  // EN: Activate a file
  activateFile: (fileId: string) => {
    set((state) => ({
      ...state,
      openFiles: state.openFiles.map(f => ({ ...f, isActive: f.id === fileId })),
      activeFileId: fileId
    }));
  },

  // FR: Obtenir le fichier actif
  // EN: Get active file
  getActiveFile: () => {
    const state = get();
    const activeFile = state.openFiles.find(f => f.isActive) || null;
    console.log('🔍 getActiveFile - openFiles:', state.openFiles.length);
    console.log('🔍 getActiveFile - activeFileId:', state.activeFileId);
    console.log('🔍 getActiveFile - activeFile:', activeFile);
    return activeFile;
  },

  // FR: Créer un nouveau fichier
  // EN: Create a new file
  createNewFile: (name: string = 'Nouvelle carte') => {
    const newFileId = uuidv4();
    const newRootId = uuidv4();
    
    return get().openFile({
      name,
      type: 'new',
      content: {
        id: newFileId,
        name,
        rootNode: {
          id: newRootId,
          title: name,
          children: []
        },
        nodes: {
          [newRootId]: {
            id: newRootId,
            title: name,
            children: [],
            parentId: null
          }
        }
      }
    });
  }
}));
