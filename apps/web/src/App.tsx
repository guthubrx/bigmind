/**
 * FR: Composant principal de l'application BigMind
 * EN: Main BigMind application component
 */

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMindmap } from './hooks/useMindmap';
import DockableLayout from './layouts/DockableLayout';
import SettingsPage from './pages/Settings';
import { useAppSettings } from './hooks/useAppSettings';
import { useOpenFiles } from './hooks/useOpenFiles';
import { useTagGraphFileSync } from './hooks/useTagGraphFileSync';
import { clearTagsLocalStorage } from './utils/clearTagsLocalStorage';
import './App.css';

function App() {
  const { mindMap, actions } = useMindmap();
  const loadAppSettings = useAppSettings(s => s.load);
  const reopenFilesOnStartup = useAppSettings(s => s.reopenFilesOnStartup);
  const restoreOpenFilesFromStorage = useOpenFiles(s => s.restoreOpenFilesFromStorage);

  // FR: Nettoyer le localStorage des anciens tags (une seule fois au démarrage)
  // EN: Clean localStorage of old tags (once on startup)
  useEffect(() => {
    clearTagsLocalStorage();
  }, []);

  // FR: Synchroniser les tags avec le fichier actif
  // EN: Sync tags with active file
  useTagGraphFileSync();

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

  // FR: Restaurer les fichiers ouverts si le paramètre est activé
  // EN: Restore open files if setting is enabled
  useEffect(() => {
    if (reopenFilesOnStartup) {
      restoreOpenFilesFromStorage();
    }
  }, [reopenFilesOnStartup, restoreOpenFilesFromStorage]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<DockableLayout />} />
        <Route path="/map/:id" element={<DockableLayout />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
