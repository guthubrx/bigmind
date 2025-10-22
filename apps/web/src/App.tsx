/**
 * FR: Composant principal de l'application BigMind
 * EN: Main BigMind application component
 */

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMindmap } from './hooks/useMindmap';
import MainLayout from './layouts/MainLayout';
import SettingsPage from './pages/Settings';
import TagSyncInitializer from './components/TagSyncInitializer';
import { useAppSettings } from './hooks/useAppSettings';
import { useOpenFiles } from './hooks/useOpenFiles';
import { shouldIgnoreShortcut } from './utils/inputUtils';
import './App.css';

function App() {
  const { mindMap, actions } = useMindmap();
  const loadAppSettings = useAppSettings(s => s.load);
  const undo = useOpenFiles(s => s.undo);
  const redo = useOpenFiles(s => s.redo);

  // FR: Initialiser une nouvelle carte au chargement
  // EN: Initialize a new map on load
  useEffect(() => {
    if (!mindMap) {
      actions.createNewMap('Ma première carte');
    }
  }, [mindMap, actions]);

  // FR: Charger les paramètres (accent color, etc.) très tôt au démarrage
  // EN: Load persisted settings (accent color, etc.) early on startup
  useEffect(() => {
    loadAppSettings();
  }, [loadAppSettings]);

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
