/**
 * FR: Hook pour exporter/importer le DAG
 * EN: Hook for DAG export/import
 */

import { useTagGraph } from './useTagGraph';
import { useNodeTags } from './useNodeTags';
import { DagTag, DagLink } from '../types/dag';

interface DagExportData {
  version: string;
  exportedAt: string;
  tags: Record<string, DagTag>;
  links: DagLink[];
  nodeTagMap: Record<string, string[]>;
}

export const useDagExportImport = () => {
  const tags = useTagGraph((state: any) => state.tags);
  const links = useTagGraph((state: any) => state.links);
  const initialize = useTagGraph((state: any) => state.initialize);
  const nodeTagMap = useNodeTags((state: any) => state.nodeTagMap);
  const initializeNodeTags = useNodeTags((state: any) => state.initialize);

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

      // Initialize both stores
      initialize(data.tags, data.links);
      if (data.nodeTagMap) {
        initializeNodeTags(data.nodeTagMap, {});
      }

      return true;
    } catch (error) {
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
