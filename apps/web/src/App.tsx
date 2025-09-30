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
import './App.css';

function App() {
  const { mindMap, actions } = useMindmap();
  const loadAppSettings = useAppSettings((s) => s.load);

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
