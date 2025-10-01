/**
 * FR: Hook pour gérer les fichiers ouverts et la navigation
 * EN: Hook to manage open files and navigation
 */

import { create } from 'zustand';
import { XMindParser } from '../parsers/XMindParser';
import { v4 as uuidv4 } from 'uuid';
import { HistoryManager } from '@bigmind/core/dist/commands/history';
import {
  AddNodeCommand,
  DeleteNodeCommand,
  UpdateNodeTitleCommand
} from '@bigmind/core/dist/commands';
import type { MindMap } from '@bigmind/core/dist/model';

export interface OpenFile {
  id: string;
  name: string;
  path?: string;
  type: 'xmind' | 'mm' | 'new';
  content?: any; // Contenu parsé du fichier
  lastModified: Date;
  isActive: boolean;
  // FR: Feuilles (onglets) pour XMind
  // EN: Sheets (tabs) for XMind
  sheets?: Array<{ id: string; title: string }>;
  activeSheetId?: string | null;
  sheetsData?: any[]; // JSON brut des feuilles pour re-swapper
  // FR: Palette de couleurs du thème pour l'inférence de couleurs par branche
  // EN: Theme color palette for branch color inference
  themeColors?: string[];
  // FR: Palette choisie pour cette carte (par onglet)
  // EN: Selected palette for this map (per tab)
  paletteId?: string;
  // FR: Style de la carte (couleur de fond, style des liens, motif de fond)
  // EN: Map style (background color, link style, background pattern)
  mapStyle?: {
    backgroundColor?: string;
    linkStyle?: 'straight' | 'curved' | 'rounded' | 'orthogonal';
    backgroundPattern?: 'none' | 'dots' | 'grid' | 'lines';
    backgroundPatternOpacity?: number;
  };
  // FR: Historique Undo/Redo
  // EN: Undo/Redo history
  history?: HistoryManager;
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
  setActiveSheet: (fileId: string, sheetId: string) => void;
  createNewFile: (name?: string) => string;
  updateActiveFileNode: (nodeId: string, patch: Partial<any>) => void;
  addChildToActive: (parentId: string, title?: string) => string | null;
  removeNodeFromActive: (nodeId: string) => string | null; // returns parentId if removed
  addSiblingToActive: (siblingOfId: string, title?: string) => string | null;
  // FR: Palette par carte
  // EN: Per-map palette
  setActiveFilePalette: (paletteId: string) => void;
  // FR: Style de la carte
  // EN: Map style
  updateActiveFileMapStyle: (styleUpdates: Partial<OpenFile['mapStyle']>) => void;
  // FR: Actions Undo/Redo
  // EN: Undo/Redo actions
  undo: () => void;
  redo: () => void;
  // FR: États dérivés pour Undo/Redo (valeurs, pas fonctions)
  // EN: Derived states for Undo/Redo (values, not functions)
  canUndoValue: boolean;
  canRedoValue: boolean;
  // FR: Copier/Coller
  // EN: Copy/Paste
  copiedNode: any | null;
  copyNode: (nodeId: string) => void;
  pasteNode: (parentId: string) => string | null;
  canPaste: () => boolean;
}

/**
 * FR: Hook pour gérer les fichiers ouverts
 * EN: Hook to manage open files
 */
export const useOpenFiles = create<OpenFilesState>((set, get) => ({
  openFiles: [],
  activeFileId: null,
  canUndoValue: false,
  canRedoValue: false,
  copiedNode: null,

  // FR: Ouvrir un nouveau fichier
  // EN: Open a new file
  openFile: (file: Omit<OpenFile, 'id' | 'lastModified' | 'isActive'>) => {
    console.warn("📂 Ouverture d'un fichier:", file.name, file.type);
    const newFile: OpenFile = {
      ...file,
      id: uuidv4(),
      lastModified: new Date(),
      isActive: true,
      paletteId: file.paletteId || 'vibrant',
      history: new HistoryManager(100),
    };

    set(state => {
      // FR: Désactiver tous les autres fichiers et ajouter le nouveau
      // EN: Deactivate all other files and add the new one
      const updatedFiles = state.openFiles.map(f => ({ ...f, isActive: false }));
      const result = [...updatedFiles, newFile];
      
      console.warn('📁 Fichiers ouverts:', result.length);
      console.warn('📁 Nouveau fichier actif:', newFile.id, newFile.isActive);
      
      return {
        ...state,
        openFiles: result,
        activeFileId: newFile.id,
      };
    });

    console.warn('✅ Fichier ouvert avec ID:', newFile.id);
    return newFile.id;
  },

  // FR: Définir la palette de la carte active
  // EN: Set active file's palette
  setActiveFilePalette: (paletteId: string) => {
    const state = get();
    const fileId = state.activeFileId;
    if (!fileId) return;
    set({
      openFiles: state.openFiles.map(f => f.id === fileId ? { ...f, paletteId } : f)
    });
  },

  // FR: Mettre à jour le style de la carte active
  // EN: Update active file's map style
  updateActiveFileMapStyle: (styleUpdates: Partial<OpenFile['mapStyle']>) => {
    const state = get();
    const fileId = state.activeFileId;
    if (!fileId) return;
    
    set({
      openFiles: state.openFiles.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              mapStyle: { 
                ...f.mapStyle, 
                ...styleUpdates 
              } 
            } 
          : f
      )
    });
  },

  // FR: Fermer un fichier
  // EN: Close a file
  closeFile: (fileId: string) => {
    set(state => {
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
        activeFileId: newActiveFileId,
      };
    });
  },

  // FR: Activer un fichier
  // EN: Activate a file
  activateFile: (fileId: string) => {
    set(state => ({
      ...state,
      openFiles: state.openFiles.map(f => ({ ...f, isActive: f.id === fileId })),
      activeFileId: fileId,
    }));
  },

  // FR: Définir la feuille active pour un fichier
  // EN: Set active sheet for a file
  setActiveSheet: (fileId: string, sheetId: string) => {
    set(state => {
      const file = state.openFiles.find(f => f.id === fileId);
      if (!file || !file.sheets || !file.sheetsData) {
        return state;
      }
      // FR: Retrouver l'index de la feuille et reconstruire le contenu
      const idx = file.sheets.findIndex(s => s.id === sheetId);
      if (idx < 0) return state;
      try {
        const sheetData = file.sheetsData[idx];
        const big = XMindParser.convertSheetJSONToBigMind(sheetData);
        const adaptedContent = {
          id: big.id,
          name: big.name,
          rootNode: {
            id: big.rootId,
            title: big.nodes[big.rootId]?.title || 'Racine',
            children: big.nodes[big.rootId]?.children || [],
          },
          nodes: big.nodes,
        } as any;
        return {
          ...state,
          openFiles: state.openFiles.map(f =>
            f.id === fileId ? { ...f, activeSheetId: sheetId, content: adaptedContent } : f
          ),
        };
      } catch (e) {
        return state;
      }
    });
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
          children: [],
        },
        nodes: {
          [newRootId]: {
            id: newRootId,
            title: name,
            children: [],
            parentId: null,
          },
        },
      },
    });
  },

  // FR: Mettre à jour un nœud du fichier actif et persister en localStorage
  // EN: Update a node of the active file and persist to localStorage
  updateActiveFileNode: (nodeId: string, patch: Partial<any>) => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[nodeId]) return;

    // FR: Si on change le titre, créer une commande pour l'historique
    // EN: If changing title, create a command for history
    if (patch.title !== undefined && patch.title !== active.content.nodes[nodeId].title) {
      const currentMap = active.content as MindMap;
      const command = new UpdateNodeTitleCommand(nodeId, patch.title);

      // FR: Important : execute() sauvegarde previousTitle automatiquement
      // EN: Important: execute() saves previousTitle automatically
      const newMap = command.execute(currentMap);

      if (active.history) {
        active.history.addCommand(command);
        console.log('📝 Command added: UpdateTitle', { nodeId, newTitle: patch.title, canUndo: active.history.canUndo() });
      }

      // Persister overlay minimal (titre, notes, style)
      try {
        const key = `bigmind_overlay_${active.name}`;
        const overlay = JSON.parse(localStorage.getItem(key) || '{}');
        overlay.nodes = overlay.nodes || {};
        overlay.nodes[nodeId] = {
          title: newMap.nodes[nodeId].title,
          notes: newMap.nodes[nodeId].notes,
          style: newMap.nodes[nodeId].style,
        };
        localStorage.setItem(key, JSON.stringify(overlay));
      } catch (e) {
        // Ignore errors
      }

      set(prev => ({
        ...prev,
        openFiles: prev.openFiles.map(f =>
          f.id === active.id ? { ...f, content: newMap } : f
        ),
        canUndoValue: active.history?.canUndo() ?? false,
        canRedoValue: active.history?.canRedo() ?? false,
      }));
      return;
    }

    // FR: Pour les autres modifications (collapsed, style, etc.), pas d'historique
    // EN: For other modifications (collapsed, style, etc.), no history
    const updatedNode = { ...active.content.nodes[nodeId], ...patch };
    const updatedContent = {
      ...active.content,
      nodes: { ...active.content.nodes, [nodeId]: updatedNode },
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

    set(prev => ({
      ...prev,
      openFiles: prev.openFiles.map(f =>
        f.id === active.id ? { ...f, content: updatedContent } : f
      ),
    }));
  },
  // FR: Ajouter un enfant au nœud parent dans le fichier actif
  // EN: Add a child to parent in the active file
  addChildToActive: (parentId: string, title: string = 'Nouveau nœud') => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[parentId]) return null;

    const newId = uuidv4();
    const command = new AddNodeCommand(newId, parentId, title, { x: 0, y: 0 });
    const currentMap = active.content as MindMap;
    const newMap = command.execute(currentMap);

    if (active.history) {
      active.history.addCommand(command);
      console.log('📝 Command added: AddNode', { nodeId: newId, canUndo: active.history.canUndo() });
    }

    set(prev => ({
      ...prev,
      openFiles: prev.openFiles.map(f =>
        f.id === active.id ? { ...f, content: newMap } : f
      ),
      canUndoValue: active.history?.canUndo() ?? false,
      canRedoValue: active.history?.canRedo() ?? false,
    }));
    return newId;
  },
  // FR: Supprimer un nœud (et son sous-arbre) du fichier actif
  // EN: Remove a node (and its subtree) from the active file
  removeNodeFromActive: (nodeId: string) => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[nodeId]) return null;
    const rootId = active.content.rootNode?.id || active.content.nodes?.root?.id;
    // Ne pas supprimer la racine
    if (nodeId === rootId) return null;

    const parentId: string | null = active.content.nodes[nodeId]?.parentId || null;

    const command = new DeleteNodeCommand(nodeId);
    const currentMap = active.content as MindMap;
    const newMap = command.execute(currentMap);

    if (active.history) {
      active.history.addCommand(command);
    }

    set(prev => ({
      ...prev,
      openFiles: prev.openFiles.map(f =>
        f.id === active.id ? { ...f, content: newMap } : f
      ),
      canUndoValue: active.history?.canUndo() ?? false,
      canRedoValue: active.history?.canRedo() ?? false,
    }));
    return parentId;
  },
  // FR: Ajouter un frère au nœud sélectionné (même parent)
  // EN: Add a sibling to selected node (same parent)
  addSiblingToActive: (siblingOfId: string, title: string = 'Nouveau nœud') => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.content || !active.content.nodes?.[siblingOfId]) return null;

    const parentId: string | null = active.content.nodes[siblingOfId]?.parentId || null;
    if (!parentId) {
      // pas de parent -> créer enfant du courant
      return get().addChildToActive(siblingOfId, title);
    }

    // FR: Utiliser addChildToActive qui gère déjà l'historique
    // EN: Use addChildToActive which already handles history
    return get().addChildToActive(parentId, title);
  },

  // FR: Annuler la dernière action
  // EN: Undo last action
  undo: () => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.history) {
      console.warn('❌ Undo: No active file or history');
      return;
    }

    if (!active.history.canUndo()) {
      console.warn('❌ Undo: Cannot undo (history empty)');
      return;
    }

    console.log('⏪ Undo: Attempting undo...');
    const currentMap = active.content as MindMap;
    const newMap = active.history.undo(currentMap);

    if (newMap) {
      console.log('✅ Undo: Success, updating state');
      set(prev => ({
        ...prev,
        openFiles: prev.openFiles.map(f =>
          f.id === active.id ? { ...f, content: newMap } : f
        ),
        canUndoValue: active.history?.canUndo() ?? false,
        canRedoValue: active.history?.canRedo() ?? false,
      }));
    } else {
      console.warn('❌ Undo: Failed to get new map');
    }
  },

  // FR: Refaire la dernière action annulée
  // EN: Redo last undone action
  redo: () => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active || !active.history || !active.history.canRedo()) return;

    console.log('⏩ Redo: Attempting redo...');
    const currentMap = active.content as MindMap;
    const newMap = active.history.redo(currentMap);

    if (newMap) {
      console.log('✅ Redo: Success, updating state');
      set(prev => ({
        ...prev,
        openFiles: prev.openFiles.map(f =>
          f.id === active.id ? { ...f, content: newMap } : f
        ),
        canUndoValue: active.history?.canUndo() ?? false,
        canRedoValue: active.history?.canRedo() ?? false,
      }));
    }
  },

  // FR: Copier un nœud
  // EN: Copy a node
  copyNode: (nodeId: string) => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active?.content?.nodes?.[nodeId]) return;

    const node = active.content.nodes[nodeId];
    // FR: Copier le nœud et tous ses descendants
    // EN: Copy node and all its descendants
    const copyNodeRecursive = (node: any): any => {
      const copied = { ...node };
      if (node.children && node.children.length > 0) {
        copied.children = node.children.map((childId: string) => 
          copyNodeRecursive(active.content.nodes[childId])
        );
      }
      return copied;
    };

    const copiedNode = copyNodeRecursive(node);
    set({ copiedNode });
    console.log('📋 Node copied:', nodeId);
  },

  // FR: Coller un nœud
  // EN: Paste a node
  pasteNode: (parentId: string) => {
    const state = get();
    const active = state.openFiles.find(f => f.isActive);
    if (!active?.content?.nodes?.[parentId] || !state.copiedNode) return null;

    // FR: Créer un nouveau nœud avec un ID unique
    // EN: Create new node with unique ID
    const createNewNodeId = (node: any): any => {
      const newNode = { ...node, id: uuidv4() };
      if (node.children && node.children.length > 0) {
        newNode.children = node.children.map((child: any) => createNewNodeId(child));
      }
      return newNode;
    };

    const newNode = createNewNodeId(state.copiedNode);
    
    // FR: Ajouter le nœud au parent
    // EN: Add node to parent
    const parentNode = active.content.nodes[parentId];
    if (!parentNode.children) {
      parentNode.children = [];
    }
    parentNode.children.push(newNode.id);

    // FR: Ajouter tous les nœuds descendants
    // EN: Add all descendant nodes
    const addNodeRecursive = (node: any) => {
      active.content.nodes[node.id] = node;
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => addNodeRecursive(child));
      }
    };

    addNodeRecursive(newNode);

    // FR: Mettre à jour l'historique
    // EN: Update history
    if (active.history) {
      const command = new AddNodeCommand(newNode.id, parentId, newNode.title);
      command.execute(active.content as MindMap);
      active.history.addCommand(command);
    }

    set(prev => ({
      ...prev,
      openFiles: prev.openFiles.map(f =>
        f.id === active.id ? { ...f, content: { ...active.content } } : f
      ),
      canUndoValue: active.history?.canUndo() ?? false,
      canRedoValue: active.history?.canRedo() ?? false,
    }));

    console.log('📋 Node pasted:', newNode.id, 'to parent:', parentId);
    return newNode.id;
  },

  // FR: Vérifier si on peut coller
  // EN: Check if can paste
  canPaste: () => {
    const state = get();
    return state.copiedNode !== null;
  },
}));
