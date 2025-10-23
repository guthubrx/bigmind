/**
 * FR: Composant principal de l'application BigMind
 * EN: Main BigMind application component
 */

import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import SettingsPage from './pages/Settings';
import TagSyncInitializer from './components/TagSyncInitializer';
import { useAppSettings } from './hooks/useAppSettings';
import { useOpenFiles } from './hooks/useOpenFiles';
import { useFileOperations } from './hooks/useFileOperations';
import { shouldIgnoreShortcut } from './utils/inputUtils';
import { eventBus } from './utils/eventBus';
import './App.css';

function App() {
  const activeFile = useOpenFiles(s => s.openFiles.find(f => f.isActive) || null);
  const createNewFile = useOpenFiles(s => s.createNewFile);
  const loadAppSettings = useAppSettings(s => s.load);
  const undo = useOpenFiles(s => s.undo);
  const redo = useOpenFiles(s => s.redo);
  const { restoreLastOpenedFile } = useFileOperations();
  const [hasRestoredOrCreated, setHasRestoredOrCreated] = useState(false);

  // FR: Restaurer la dernière carte au chargement, sinon créer une nouvelle
  // EN: Restore last map on load, otherwise create a new one
  useEffect(() => {
    if (hasRestoredOrCreated) return;

    // FR: Essayer de restaurer la dernière carte ouverte
    // EN: Try to restore last opened map
    const restored = restoreLastOpenedFile();

    // FR: Si aucune carte n'a été restaurée, en créer une nouvelle
    // EN: If no map was restored, create a new one
    if (!restored) {
      createNewFile('Ma première carte');
    }

    setHasRestoredOrCreated(true);
  }, []); // Exécuter une seule fois au montage

  // FR: Charger les paramètres (accent color, etc.) très tôt au démarrage
  // EN: Load persisted settings (accent color, etc.) early on startup
  useEffect(() => {
    loadAppSettings();
  }, [loadAppSettings]);

  // FR: Émettre un événement quand la carte est chargée/mise à jour
  // EN: Emit event when map is loaded/updated
  const lastEmittedFileId = useRef<string | null>(null);

  useEffect(() => {
    if (activeFile && activeFile.id !== lastEmittedFileId.current) {
      console.log('🏷️ App: Carte détectée, émission de map:loaded');
      lastEmittedFileId.current = activeFile.id;
      setTimeout(() => {
        eventBus.emit('map:loaded', { map: activeFile }, 'system');
      }, 0);
    }
  }, [activeFile?.id]);

  // FR: Raccourcis globaux Undo/Redo (Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z ou Ctrl+Y)
  // EN: Global Undo/Redo shortcuts (Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z or Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // FR: Ignorer les raccourcis sans modificateurs si on tape dans un champ
      // EN: Ignore shortcuts without modifiers when typing in a field
      if (shouldIgnoreShortcut(e)) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      // Undo: Cmd/Ctrl + Z (without Shift)
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Cmd/Ctrl + Shift + Z OR Ctrl + Y
      if (
        (isMod && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        (e.ctrlKey && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="app">
      {/* FR: Initialiser la synchronisation des tags */}
      {/* EN: Initialize tag synchronization */}
      <TagSyncInitializer />

      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/map/:id" element={<MainLayout />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
