/**
 * FR: Composant pour initialiser la synchronisation des tags au démarrage
 * EN: Component to initialize tag synchronization on startup
 */

import { useEffect } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { eventBus } from '../utils/eventBus';

export function TagSyncInitializer() {
  // FR: Initialiser le hook pour activer la synchronisation
  // EN: Initialize hook to enable synchronization
  const tagGraph = useTagGraph();

  useEffect(() => {
    console.log('✅ Synchronisation DAG-MindMap initialisée');
    console.log('📊 Nombre de tags au démarrage:', tagGraph.tags.length);
    console.log('👂 Listeners actifs:', {
      'node:tagged': eventBus.getListenerCount('node:tagged'),
      'node:untagged': eventBus.getListenerCount('node:untagged'),
      'tag:added': eventBus.getListenerCount('tag:added'),
      'tag:removed': eventBus.getListenerCount('tag:removed'),
    });
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}

export default TagSyncInitializer;