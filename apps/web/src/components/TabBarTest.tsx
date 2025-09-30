/**
 * FR: Composant de test pour la barre d'onglets
 * EN: Test component for tab bar
 */

import React from 'react';
import FileTabs from './FileTabs.tsx';

function TabBarTest() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2>Test de la barre d'onglets</h2>
      <div style={{ height: '50px', border: '1px solid #ccc' }}>
        <FileTabs type="tab-bar" />
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        <p>Contenu de test pour la barre d'onglets</p>
        <p>Ouvrez plusieurs fichiers pour tester les fonctionnalités :</p>
        <ul>
          <li>Scroll horizontal</li>
          <li>Drag & drop des onglets</li>
          <li>Menu de débordement</li>
          <li>Animations</li>
          <li>Indicateurs de modification</li>
        </ul>
      </div>
    </div>
  );
}

export default TabBarTest;
