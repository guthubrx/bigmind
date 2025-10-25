/**
 * FR: Panneau de statistiques du graphe DAG
 * EN: DAG graph statistics panel
 */

import React, { useMemo } from 'react';
import { useTagGraph } from '../hooks/useTagGraph';
import { DagTag } from '../types/dag';
import { Network, AlertCircle } from 'lucide-react';
import './DagStatsPanel.css';

function DagStatsPanel() {
  const tags = useTagGraph((state: any) => Object.values(state.tags) as DagTag[]);
  const links = useTagGraph((state: any) => state.links);
  const validateDAG = useTagGraph((state: any) => state.validateDAG);

  const stats = useMemo(() => {
    const validation = validateDAG();
    const rootTags = tags.filter((tag: DagTag) => !tag.parentIds || tag.parentIds.length === 0);
    const leafTags = tags.filter((tag: DagTag) => tag.children.length === 0);

    // Calculate average depth
    const depths = new Map<string, number>();

    const calculateDepth = (tagId: string): number => {
      if (depths.has(tagId)) return depths.get(tagId)!;
      const tag = tags.find((t: DagTag) => t.id === tagId);
      if (!tag || tag.parentIds.length === 0) {
        depths.set(tagId, 0);
        return 0;
      }
      const maxParentDepth = Math.max(...tag.parentIds.map(calculateDepth));
      depths.set(tagId, maxParentDepth + 1);
      return maxParentDepth + 1;
    };

    tags.forEach((tag: DagTag) => calculateDepth(tag.id));
    const avgDepth =
      tags.length > 0 ? Array.from(depths.values()).reduce((a, b) => a + b, 0) / tags.length : 0;

    // Count relation types
    const relationTypes = new Map<string, number>();
    links.forEach((link: any) => {
      const count = relationTypes.get(link.type) || 0;
      relationTypes.set(link.type, count + 1);
    });

    return {
      totalTags: tags.length,
      totalRelations: links.length,
      rootTags: rootTags.length,
      leafTags: leafTags.length,
      maxDepth: depths.size > 0 ? Math.max(...Array.from(depths.values())) : 0,
      avgDepth: avgDepth.toFixed(2),
      relationTypes: Object.fromEntries(relationTypes),
      isValid: validation.valid,
      errors: validation.errors,
    };
  }, [tags, links, validateDAG]);

  return (
    <div className="dag-stats-panel">
      <div className="stats-header">
        <Network size={20} />
        <h3>DAG Statistics</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tags</div>
          <div className="stat-value">{stats.totalTags}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Relations</div>
          <div className="stat-value">{stats.totalRelations}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Root Tags</div>
          <div className="stat-value">{stats.rootTags}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Leaf Tags</div>
          <div className="stat-value">{stats.leafTags}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Max Depth</div>
          <div className="stat-value">{stats.maxDepth}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg Depth</div>
          <div className="stat-value">{stats.avgDepth}</div>
        </div>
      </div>

      {Object.keys(stats.relationTypes).length > 0 && (
        <div className="relations-breakdown">
          <div className="breakdown-title">Relations by Type</div>
          {Object.entries(stats.relationTypes).map(([type, count]: [string, any]) => (
            <div key={type} className="breakdown-item">
              <span className="type-label">{type}</span>
              <span className="type-count">{count}</span>
            </div>
          ))}
        </div>
      )}

      {!stats.isValid && stats.errors.length > 0 && (
        <div className="validation-section">
          <div className="validation-header">
            <AlertCircle size={16} />
            <span>Validation Issues ({stats.errors.length})</span>
          </div>
          <div className="errors-list">
            {stats.errors.slice(0, 5).map((error: string) => (
              <div key={`error-${error}`} className="error-item">
                {error}
              </div>
            ))}
            {stats.errors.length > 5 && (
              <div className="error-more">+{stats.errors.length - 5} more</div>
            )}
          </div>
        </div>
      )}

      {stats.isValid && (
        <div className="validation-section valid">
          <div className="validation-header">
            <AlertCircle size={16} />
            <span>DAG is valid ✓</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DagStatsPanel;
