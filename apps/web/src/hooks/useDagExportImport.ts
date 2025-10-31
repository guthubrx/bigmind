/**
 * FR: Hook pour exporter/importer le DAG
 * EN: Hook for DAG export/import
 */

import { useTagStore } from './useTagStore';
import { DagTag, DagLink } from '../types/dag';

interface DagExportData {
  version: string;
  exportedAt: string;
  tags: Record<string, DagTag>;
  links: DagLink[];
  nodeTagMap: Record<string, string[]>;
}

export const useDagExportImport = () => {
  const tags = useTagStore(state => state.tags);
  const links = useTagStore(state => state.links);
  const nodeTagMap = useTagStore(state => state.nodeTagMap);
  // eslint-disable-next-line prefer-destructuring
  const initialize = useTagStore.getState().initialize;

  const exportDag = (): string => {
    const nodeTagMapArray: Record<string, string[]> = {};
    Object.entries(nodeTagMap).forEach(([nodeId, tagSet]: [string, any]) => {
      nodeTagMapArray[nodeId] = Array.from(tagSet);
    });

    const exportData: DagExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tags,
      links,
      nodeTagMap: nodeTagMapArray,
    };

    return JSON.stringify(exportData, null, 2);
  };

  const importDag = (jsonData: string): boolean => {
    try {
      const data: DagExportData = JSON.parse(jsonData);

      if (!data.tags || !data.links) {
        throw new Error('Invalid DAG data: missing tags or links');
      }

      // FR: Convertir nodeTagMap en format attendu par useTagStore
      // EN: Convert nodeTagMap to format expected by useTagStore
      const nodeTags: Record<string, string[]> = data.nodeTagMap || {};

      // Initialize unified store
      initialize({
        tags: data.tags,
        links: data.links,
        nodeTags,
        tagNodes: {}, // Sera recalculé par initialize
        hiddenTags: [],
      });

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to import DAG:', error);
      return false;
    }
  };

  const downloadDag = (filename: string = 'dag-export.json'): void => {
    const data = exportDag();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportDag,
    importDag,
    downloadDag,
  };
};
