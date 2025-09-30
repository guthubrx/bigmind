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
  updateActiveFileNode: (nodeId: string, patch: Partial<any>) => void;
  addChildToActive: (parentId: string, title?: string) => string | null;
  removeNodeFromActive: (nodeId: string) => string | null; // returns parentId if removed
  addSiblingToActive: (siblingOfId: string, title?: string) => string | null;
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
    console.warn('📂 Ouverture d\'un fichier:', file.name, file.type);
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
      
      console.warn('📁 Fichiers ouverts:', result.length);
      console.warn('📁 Nouveau fichier actif:', newFile.id, newFile.isActive);
      
      return {
        ...state,
        openFiles: result,
        activeFileId: newFile.id
      };
    });

    console.warn('✅ Fichier ouvert avec ID:', newFile.id);
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
    console.warn('🔍 getActiveFile - openFiles:', state.openFiles.length);
    console.warn('🔍 getActiveFile - activeFileId:', state.activeFileId);
    console.warn('🔍 getActiveFile - activeFile:', activeFile);
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
  },

  // FR: Mettre à jour un nœud du fichier actif et persister en localStorage
  // EN: Update a node of the active file and persist to localStorage
  updateActiveFileNode: (nodeId: string, patch: Partial<any>) => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[nodeId]) return;

    const updatedNode = { ...active.content.nodes[nodeId], ...patch };
    const updatedContent = {
      ...active.content,
      nodes: { ...active.content.nodes, [nodeId]: updatedNode }
    };

    // Persister overlay minimal (titre, notes, style)
    try {
      const key = `bigmind_overlay_${active.name}`;
      const overlay = JSON.parse(localStorage.getItem(key) || '{}');
      overlay.nodes = overlay.nodes || {};
      overlay.nodes[nodeId] = {
        title: updatedNode.title,
        notes: updatedNode.notes,
        style: updatedNode.style,
      };
      localStorage.setItem(key, JSON.stringify(overlay));
    } catch (e) {
      // Ignore errors
    }

    set((prev) => ({
      ...prev,
      openFiles: prev.openFiles.map(f => f.id === active.id ? { ...f, content: updatedContent } : f)
    }));
  }
  ,
  // FR: Ajouter un enfant au nœud parent dans le fichier actif
  // EN: Add a child to parent in the active file
  addChildToActive: (parentId: string, title: string = 'Nouveau nœud') => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[parentId]) return null;
    const newId = uuidv4();
    const nodes = { ...active.content.nodes };
    nodes[newId] = { id: newId, title, children: [], parentId };
    const parent = { ...nodes[parentId] };
    parent.children = [...(parent.children || []), newId];
    nodes[parentId] = parent;

    const updatedContent = { ...active.content, nodes };
    set((prev) => ({
      ...prev,
      openFiles: prev.openFiles.map(f => f.id === active.id ? { ...f, content: updatedContent } : f)
    }));
    return newId;
  }
  ,
  // FR: Supprimer un nœud (et son sous-arbre) du fichier actif
  // EN: Remove a node (and its subtree) from the active file
  removeNodeFromActive: (nodeId: string) => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[nodeId]) return null;
    const rootId = active.content.rootNode?.id || active.content.nodes?.root?.id;
    // Ne pas supprimer la racine
    if (nodeId === rootId) return null;

    const nodes = { ...active.content.nodes } as Record<string, any>;
    const toDelete: string[] = [];
    const collect = (id: string) => {
      toDelete.push(id);
      const n = nodes[id];
      const children: string[] = (n?.children) || [];
      children.forEach(collect);
    };
    collect(nodeId);

    const parentId: string | null = nodes[nodeId]?.parentId || null;
    // Retirer du parent
    if (parentId && nodes[parentId]) {
      nodes[parentId] = { ...nodes[parentId], children: (nodes[parentId].children || []).filter((cid: string) => cid !== nodeId) };
    }
    // Supprimer tous les nœuds collectés
    toDelete.forEach((id) => { delete nodes[id]; });

    const updatedContent = { ...active.content, nodes };
    set((prev) => ({
      ...prev,
      openFiles: prev.openFiles.map(f => f.id === active.id ? { ...f, content: updatedContent } : f)
    }));
    return parentId;
  }
  ,
  // FR: Ajouter un frère au nœud sélectionné (même parent)
  // EN: Add a sibling to selected node (same parent)
  addSiblingToActive: (siblingOfId: string, title: string = 'Nouveau nœud') => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[siblingOfId]) return null;
    const nodes = { ...active.content.nodes } as Record<string, any>;
    const parentId: string | null = nodes[siblingOfId]?.parentId || null;
    if (!parentId) {
      // pas de parent -> créer enfant du courant
      return get().addChildToActive(siblingOfId, title);
    }
    const newId = uuidv4();
    nodes[newId] = { id: newId, title, children: [], parentId };
    const list: string[] = [...(nodes[parentId]?.children || [])];
    const idx = list.indexOf(siblingOfId);
    if (idx >= 0) list.splice(idx + 1, 0, newId); else list.push(newId);
    nodes[parentId] = { ...nodes[parentId], children: list };

    const updatedContent = { ...active.content, nodes };
    set((prev) => ({
      ...prev,
      openFiles: prev.openFiles.map(f => f.id === active.id ? { ...f, content: updatedContent } : f)
    }));
    return newId;
  }
}));
