/**
 * FR: Composant principal de l'application BigMind
 * EN: Main BigMind application component
 */

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMindmap } from './hooks/useMindmap';
import MainLayout from './layouts/MainLayout';
import './App.css';

const App: React.FC = () => {
  const { mindMap, actions } = useMindmap();

  // FR: Initialiser une nouvelle carte au chargement
  // EN: Initialize a new map on load
  useEffect(() => {
    if (!mindMap) {
      actions.createNewMap('Ma première carte');
    }
  }, [mindMap, actions]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/map/:id" element={<MainLayout />} />
      </Routes>
    </div>
  );
};

export default App;
