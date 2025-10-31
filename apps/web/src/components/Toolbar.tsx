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
  HelpCircle,
} from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';
import { useFileOperations } from '../hooks/useFileOperations';

function Toolbar() {
  const { mindMap, canUndo, canRedo, actions } = useMindmap();
  const { exportActiveXMind, openFileDialog, openFile } = useFileOperations();

  // FR: Sauvegarder la carte
  // EN: Save the map
  const handleSave = React.useCallback(async () => {
    try {
      await exportActiveXMind();
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde:', error);
    }
  }, [exportActiveXMind]);

  // FR: Ouvrir un fichier
  // EN: Open a file
  const handleOpen = React.useCallback(async () => {
    try {
      const file = await openFileDialog();
      if (file) {
        await openFile(file);
      }
    } catch (error) {
      console.warn("Erreur lors de l'ouverture:", error);
    }
  }, [openFileDialog, openFile]);

  // FR: Exporter la carte
  // EN: Export the map
  const handleExport = React.useCallback(async () => {
    try {
      await exportActiveXMind();
    } catch (error) {
      console.warn("Erreur lors de l'export:", error);
    }
  }, [exportActiveXMind]);

  // FR: Supprimer les nœuds sélectionnés
  // EN: Delete selected nodes
  const handleDeleteSelected = React.useCallback(() => {
    // FR: TODO: Implémenter la suppression des nœuds sélectionnés
    // EN: TODO: Implement deletion of selected nodes
  }, []);

  // FR: Gérer les raccourcis clavier
  // EN: Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // FR: Ctrl/Cmd + Z pour annuler
      // EN: Ctrl/Cmd + Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) actions.undo();
      }

      // FR: Ctrl/Cmd + Y ou Ctrl/Cmd + Shift + Z pour refaire
      // EN: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z to redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) actions.redo();
      }

      // FR: Ctrl/Cmd + S pour sauvegarder
      // EN: Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // FR: Supprimer pour effacer la sélection
      // EN: Delete to clear selection
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, actions, handleSave, handleDeleteSelected]);

  // FR: Ajouter un nouveau nœud
  // EN: Add a new node
  const handleAddNode = () => {
    if (!mindMap) return;

    actions.addNode(mindMap.rootId, 'Nouveau nœud', { x: 100, y: 100 });
  };

  return (
    <div className="toolbar">
      {/* FR: Section gauche - Actions principales */}
      {/* EN: Left section - Main actions */}
      <div className="flex items-center space-x-2">
        {/* FR: Bouton Nouveau */}
        {/* EN: New button */}
        <button
          type="button"
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
          type="button"
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
          type="button"
          onClick={actions.undo}
          disabled={!canUndo}
          className="action-button secondary"
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={actions.redo}
          disabled={!canRedo}
          className="action-button secondary"
          title="Refaire (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* FR: Section centrale - Titre de la carte */}
      {/* EN: Center section - Map title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-foreground">{mindMap?.meta.name || 'BigMind'}</h1>
      </div>

      {/* FR: Section droite - Actions de fichier */}
      {/* EN: Right section - File actions */}
      <div className="flex items-center space-x-2">
        {/* FR: Bouton Ouvrir */}
        {/* EN: Open button */}
        <button
          type="button"
          onClick={handleOpen}
          className="action-button secondary"
          title="Ouvrir un fichier (Ctrl+O)"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        {/* FR: Bouton Sauvegarder */}
        {/* EN: Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="action-button secondary"
          title="Sauvegarder (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* FR: Bouton Exporter */}
        {/* EN: Export button */}
        <button
          type="button"
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
        <button type="button" className="action-button secondary" title="Paramètres">
          <Settings className="w-4 h-4" />
        </button>

        {/* FR: Bouton Aide */}
        {/* EN: Help button */}
        <button type="button" className="action-button secondary" title="Aide">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
