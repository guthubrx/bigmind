/**
 * FR: Composant principal de l'application BigMind
 * EN: Main BigMind application component
 */

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMindmap } from './hooks/useMindmap';
import MainLayout from './layouts/MainLayout';
import SettingsPage from './pages/Settings';
import { useAppSettings } from './hooks/useAppSettings';
import { useTagGraphFileSync } from './hooks/useTagGraphFileSync';
import { clearTagsLocalStorage } from './utils/clearTagsLocalStorage';
import './App.css';

function App() {
  const { mindMap, actions } = useMindmap();
  const loadAppSettings = useAppSettings(s => s.load);

  // FR: Nettoyer le localStorage des anciens tags (une seule fois au démarrage)
  // EN: Clean localStorage of old tags (once on startup)
  useEffect(() => {
    clearTagsLocalStorage();
    // eslint-disable-next-line no-console
    console.log('[App] LocalStorage nettoyé - les tags sont maintenant dans bigmind.json');
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

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/map/:id" element={<MainLayout />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
