/**
 * FR: Hook pour synchroniser les tags avec le fichier actif
 * EN: Hook to sync tags with active file
 */

import { useEffect } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { useTagStore } from './useTagStore';

/**
 * FR: Hook qui synchronise les tags avec le fichier actif
 * EN: Hook that syncs tags with active file
 *
 * NOTE: Avec le nouveau système volatile, les tags sont sauvegardés uniquement
 * dans bigmind.json via useFileOperations lors de l'export. Ce hook vide
 * simplement le store quand aucun fichier n'est actif.
 */
export function useTagGraphFileSync() {
  const activeFileId = useOpenFiles(state => state.activeFileId);
  const clear = useTagStore(state => state.clear);

  useEffect(() => {
    // FR: Vider les tags quand il n'y a pas de fichier actif
    // EN: Clear tags when there's no active file
    if (!activeFileId) {
      // eslint-disable-next-line no-console
      // console.log('[TagGraphFileSync] Aucun fichier actif, vidage des tags');
      clear();
    }
  }, [activeFileId, clear]);
}
