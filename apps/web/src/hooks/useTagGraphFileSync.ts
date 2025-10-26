/**
 * FR: Hook pour synchroniser les tags avec le fichier actif
 * EN: Hook to sync tags with active file
 */

import { useEffect, useRef } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { useTagGraph } from './useTagGraph';

/**
 * FR: Hook qui synchronise les tags avec le fichier actif
 * EN: Hook that syncs tags with active file
 */
export function useTagGraphFileSync() {
  const activeFileId = useOpenFiles(state => state.activeFileId);
  const loadFileData = useTagGraph(state => state.loadFileData);
  const saveFileData = useTagGraph(state => state.saveFileData);
  const clear = useTagGraph(state => state.clear);
  const tags = useTagGraph(state => state.tags);
  const links = useTagGraph(state => state.links);
  const previousFileIdRef = useRef<string | null>(null);

  useEffect(() => {
    const previousFileId = previousFileIdRef.current;

    // FR: Sauvegarder les tags du fichier précédent si nécessaire
    // EN: Save tags from previous file if needed
    if (previousFileId) {
      saveFileData(previousFileId);
    }

    // FR: Charger les tags du nouveau fichier ou vider si aucun fichier
    // EN: Load tags for new file or clear if no file
    if (activeFileId) {
      console.log(`[TagGraphFileSync] Chargement des tags pour le fichier ${activeFileId}`);
      loadFileData(activeFileId);
    } else {
      console.log('[TagGraphFileSync] Aucun fichier actif, vidage des tags');
      clear();
    }

    // FR: Mettre à jour la référence
    // EN: Update reference
    previousFileIdRef.current = activeFileId;
  }, [activeFileId, loadFileData, saveFileData, clear]);

  // FR: Sauvegarder automatiquement quand les tags ou liens changent
  // EN: Auto-save when tags or links change
  useEffect(() => {
    if (!activeFileId) return;

    // FR: Debounce de 500ms pour éviter trop de sauvegardes
    // EN: Debounce 500ms to avoid too many saves
    const timeoutId = setTimeout(() => {
      saveFileData(activeFileId);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tags, links, activeFileId, saveFileData]);

  // FR: Sauvegarder avant de quitter
  // EN: Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeFileId) {
        saveFileData(activeFileId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeFileId, saveFileData]);
}
