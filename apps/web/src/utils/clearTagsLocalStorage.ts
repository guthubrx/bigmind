/**
 * FR: Nettoyer TOUTES les données de tags du localStorage
 * EN: Clear ALL tag data from localStorage
 */

export function clearTagsLocalStorage() {
  const keysToRemove: string[] = [];

  // Parcourir toutes les clés du localStorage
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key) {
      // Supprimer les clés relatives aux tags
      if (
        key.startsWith('bigmind-tags-') || // useTagGraph par fichier
        key === 'bigmind-node-tags' || // useNodeTags
        key.startsWith('bigmind_overlay_') // Overlays (contient parfois des tags)
      ) {
        keysToRemove.push(key);
      }
    }
  }

  // Supprimer toutes les clés identifiées
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    // eslint-disable-next-line no-console
    console.log(`[Storage] Supprimé: ${key}`);
  });

  if (keysToRemove.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`[Storage] Nettoyage terminé: ${keysToRemove.length} clé(s) de tags supprimée(s)`);
  } else {
    // eslint-disable-next-line no-console
    console.log('[Storage] Aucune clé de tags à nettoyer');
  }

  return keysToRemove.length;
}
