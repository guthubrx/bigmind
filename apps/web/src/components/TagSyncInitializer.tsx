/**
 * FR: Composant pour initialiser la synchronisation des tags au démarrage
 * EN: Component to initialize tag synchronization on startup
 */

import { useEffect } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { useMindMapDAGSync } from '../hooks/useMindMapDAGSync';

export function TagSyncInitializer() {
  // FR: Initialiser les hooks pour activer la synchronisation
  // EN: Initialize hooks to enable synchronization
  useTagGraph();
  useMindMapDAGSync();

  useEffect(() => {
    console.log('✅ Synchronisation DAG-MindMap initialisée');
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}

export default TagSyncInitializer;