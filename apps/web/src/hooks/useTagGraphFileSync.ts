/**
 * FR: Hook pour synchroniser les tags avec le fichier actif
 * EN: Hook to sync tags with active file
 */

import { useEffect, useRef } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { useTagGraph } from './useTagGraph';

/**
 * FR: Hook qui vide les tags quand aucun fichier n'est actif
 * EN: Hook that clears tags when no file is active
 */
export function useTagGraphFileSync() {
  const activeFileId = useOpenFiles(state => state.activeFileId);
  const clear = useTagGraph(state => state.clear);
  const previousFileIdRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // FR: Au premier rendu, si aucun fichier n'est actif, vider les tags
    // EN: On first render, if no file is active, clear tags
    if (isFirstRender.current && activeFileId === null) {
      console.log('[TagGraphFileSync] Premier rendu sans fichier actif, vidage des tags');
      clear();
      isFirstRender.current = false;
      previousFileIdRef.current = null;
      return;
    }

    isFirstRender.current = false;

    // FR: Si on passe d'un fichier à aucun fichier, vider les tags
    // EN: If switching from a file to no file, clear tags
    if (previousFileIdRef.current !== null && activeFileId === null) {
      console.log('[TagGraphFileSync] Aucun fichier actif, vidage des tags');
      clear();
    }

    // FR: Mettre à jour la référence
    // EN: Update reference
    previousFileIdRef.current = activeFileId;
  }, [activeFileId, clear]);
}
