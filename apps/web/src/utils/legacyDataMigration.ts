/**
 * Legacy Data Migration
 * Automatically migrates legacy file format fields to plugin storage
 */

import type { ExtendedMindMapData } from './fileFormat';
import { pluginDataManager } from './pluginDataManager';

/**
 * Migrate legacy palette IDs to plugin storage
 */
async function migratePalettesData(fileData: ExtendedMindMapData): Promise<boolean> {
  const hasNodePalette = !!fileData.nodePaletteId;
  const hasTagPalette = !!fileData.tagPaletteId;

  // Nothing to migrate
  if (!hasNodePalette && !hasTagPalette) {
    return false;
  }

  try {
    // Get or create storage for palette-manager plugin
    const storage = pluginDataManager.getStorage('com.bigmind.palette-manager', '1.0.0', '1');

    // Migrate node palette
    if (hasNodePalette) {
      await storage.set('nodePaletteId', fileData.nodePaletteId);
      // eslint-disable-next-line no-console
      //   `[Migration] Migrated nodePaletteId: ${fileData.nodePaletteId} -> plugin storage`
      // );
      delete fileData.nodePaletteId;
    }

    // Migrate tag palette
    if (hasTagPalette) {
      await storage.set('tagPaletteId', fileData.tagPaletteId);
      // eslint-disable-next-line no-console
      delete fileData.tagPaletteId;
    }

    // Mark plugin as recommended (not required, as the data can work without it)
    storage.markAsRecommended('1.0.0');

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Migration] Failed to migrate palette data:', error);
    return false;
  }
}

/**
 * Migrate all legacy data in a file
 * Returns true if any migrations were performed
 */
export async function migrateAllLegacyData(fileData: ExtendedMindMapData): Promise<boolean> {
  const migrations: Array<() => Promise<boolean>> = [
    () => migratePalettesData(fileData),
    // Add more migration functions here as needed
  ];

  let anyMigrated = false;

  // eslint-disable-next-line no-restricted-syntax
  for (const migration of migrations) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const migrated = await migration();
      if (migrated) {
        anyMigrated = true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Migration] Migration failed:', error);
    }
  }

  if (anyMigrated) {
    // eslint-disable-next-line no-console
  }

  return anyMigrated;
}

/**
 * Check if file has legacy data that needs migration
 */
export function hasLegacyData(fileData: ExtendedMindMapData): boolean {
  return !!(fileData.nodePaletteId || fileData.tagPaletteId);
}
