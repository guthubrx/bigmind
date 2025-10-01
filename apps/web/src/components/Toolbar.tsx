/**
 * FR: Barre d'outils principale de BigMind
 * EN: Main BigMind toolbar
 */

import React from 'react';
import {
  Plus,
  Trash2,
  Undo,
  Redo,
  Save,
  FolderOpen,
  Download,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import { shouldIgnoreShortcut } from '../utils/inputUtils';

const Toolbar: React.FC = () => {
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive));
  const undo = useOpenFiles((state) => state.undo);
  const redo = useOpenFiles((state) => state.redo);
  const canUndoState = useOpenFiles((state) => state.canUndoValue);
  const canRedoState = useOpenFiles((state) => state.canRedoValue);
  const addChildToActive = useOpenFiles((state) => state.addChildToActive);
  const removeNodeFromActive = useOpenFiles((state) => state.removeNodeFromActive);
  const selectedNodeId = useSelection((state) => state.selectedNodeId);
  const setSelectedNodeId = useSelection((state) => state.setSelectedNodeId);

  console.log('🔧 Toolbar render:', { canUndoState, canRedoState });

  // FR: Gérer les raccourcis clavier
  // EN: Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // FR: Ignorer les raccourcis sans modificateurs si on tape dans un champ
      // EN: Ignore shortcuts without modifiers when typing in a field
      if (shouldIgnoreShortcut(e)) {
        return;
      }
      
      // FR: Ctrl/Cmd + Z pour annuler
      // EN: Ctrl/Cmd + Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        console.log('⌨️ Toolbar: Ctrl+Z pressed', { canUndoState });
        e.preventDefault();
        if (canUndoState) {
          console.log('✅ Toolbar: Calling undo()');
          undo();
        } else {
          console.warn('❌ Toolbar: Cannot undo');
        }
      }

      // FR: Ctrl/Cmd + Y ou Ctrl/Cmd + Shift + Z pour refaire
      // EN: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z to redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        console.log('⌨️ Toolbar: Ctrl+Y/Shift+Z pressed', { canRedoState });
        e.preventDefault();
        if (canRedoState) {
          console.log('✅ Toolbar: Calling redo()');
          redo();
        } else {
          console.warn('❌ Toolbar: Cannot redo');
        }
      }

      // FR: Ctrl/Cmd + S pour sauvegarder
      // EN: Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    console.log('🎯 Toolbar: Keyboard handler registered', { canUndoState, canRedoState });
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndoState, canRedoState, undo, redo]);

  // FR: Sauvegarder la carte
  // EN: Save the map
  const handleSave = () => {
    if (!activeFile) return;

    // FR: TODO: Implémenter la sauvegarde
    // EN: TODO: Implement saving
    console.log('Sauvegarde de la carte:', activeFile.name);
  };

  // FR: Ouvrir un fichier
  // EN: Open a file
  const handleOpen = () => {
    // FR: TODO: Implémenter l'ouverture de fichier
    // EN: TODO: Implement file opening
    console.log('Ouverture de fichier');
  };

  // FR: Exporter la carte
  // EN: Export the map
  const handleExport = () => {
    if (!activeFile) return;

    // FR: TODO: Implémenter l'export
    // EN: TODO: Implement export
    console.log('Export de la carte:', activeFile.name);
  };

  // FR: Supprimer les nœuds sélectionnés
  // EN: Delete selected nodes
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;

    const parentId = removeNodeFromActive(selectedNodeId);
    if (parentId) {
      setSelectedNodeId(parentId);
    }
  };

  // FR: Ajouter un nouveau nœud
  // EN: Add a new node
  const handleAddNode = () => {
    if (!activeFile?.content?.rootNode?.id) return;

    const parentId = selectedNodeId || activeFile.content.rootNode.id;
    const newId = addChildToActive(parentId, 'Nouveau nœud');
    if (newId) {
      setSelectedNodeId(newId);
    }
  };

  return (
    <div className="toolbar">
      {/* FR: Section gauche - Actions principales */}
      {/* EN: Left section - Main actions */}
      <div className="flex items-center space-x-2">
        {/* FR: Bouton Nouveau */}
        {/* EN: New button */}
        <button
          onClick={handleAddNode}
          className="action-button primary"
          title="Ajouter un nœud (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
          <span className="ml-1">Nouveau</span>
        </button>

        {/* FR: Bouton Supprimer */}
        {/* EN: Delete button */}
        <button
          onClick={handleDeleteSelected}
          className="action-button secondary"
          title="Supprimer la sélection (Suppr)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* FR: Séparateur */}
        {/* EN: Separator */}
        <div className="w-px h-6 bg-border" />

        {/* FR: Boutons Undo/Redo */}
        {/* EN: Undo/Redo buttons */}
        <button
          onClick={undo}
          disabled={!canUndoState}
          className="action-button secondary"
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedoState}
          className="action-button secondary"
          title="Refaire (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* FR: Section centrale - Titre de la carte */}
      {/* EN: Center section - Map title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          {activeFile?.name || 'BigMind'}
        </h1>
      </div>

      {/* FR: Section droite - Actions de fichier */}
      {/* EN: Right section - File actions */}
      <div className="flex items-center space-x-2">
        {/* FR: Bouton Ouvrir */}
        {/* EN: Open button */}
        <button
          onClick={handleOpen}
          className="action-button secondary"
          title="Ouvrir un fichier (Ctrl+O)"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        {/* FR: Bouton Sauvegarder */}
        {/* EN: Save button */}
        <button
          onClick={handleSave}
          className="action-button secondary"
          title="Sauvegarder (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* FR: Bouton Exporter */}
        {/* EN: Export button */}
        <button
          onClick={handleExport}
          className="action-button secondary"
          title="Exporter la carte"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* FR: Séparateur */}
        {/* EN: Separator */}
        <div className="w-px h-6 bg-border" />

        {/* FR: Bouton Paramètres */}
        {/* EN: Settings button */}
        <button
          className="action-button secondary"
          title="Paramètres"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* FR: Bouton Aide */}
        {/* EN: Help button */}
        <button
          className="action-button secondary"
          title="Aide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
