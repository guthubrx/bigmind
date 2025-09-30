/**
 * FR: Barre de statut de BigMind
 * EN: BigMind status bar
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Lock, Unlock } from 'lucide-react';
import { useFlowInstance } from '../hooks/useFlowInstance';
import { useCanvasOptions } from '../hooks/useCanvasOptions';
import { useAppSettings } from '../hooks/useAppSettings';
import './StatusBar.css';

function StatusBar() {
  const inst = useFlowInstance((s) => s.instance);
  const nodesDraggable = useCanvasOptions((s) => s.nodesDraggable);
  const toggleNodesDraggable = useCanvasOptions((s) => s.toggleNodesDraggable);
  const followSelection = useCanvasOptions((s) => s.followSelection);
  const setFollowSelection = useCanvasOptions((s) => s.setFollowSelection);
  const accentColor = useAppSettings((s) => s.accentColor);

  const [zoomDraft, setZoomDraft] = useState<string>('100');

  useEffect(() => {
    const z = typeof inst?.getZoom === 'function' ? inst.getZoom() : 1;
    if (!isNaN(z)) setZoomDraft(String(Math.round(z * 100)));
  }, [inst]);

  const applyZoomDraft = () => {
    const num = parseFloat(zoomDraft);
    if (isNaN(num)) return;
    const z = Math.min(400, Math.max(10, num)) / 100;
    if (inst?.setViewport) inst.setViewport({ zoom: z });
    setZoomDraft(String(Math.round(z * 100)));
  };

  const gradientStyle = useMemo(() => {
    // hex -> rgb
    const hex = (accentColor || '#3b82f6').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 59;
    const g = parseInt(hex.substring(2, 4), 16) || 130;
    const b = parseInt(hex.substring(4, 6), 16) || 246;
    const grad = [
      `linear-gradient(90deg, rgba(${r},${g},${b},0.10) 0%`,
      `, rgba(${r},${g},${b},0.04) 40%`,
      `, rgba(${r},${g},${b},0.00) 100%)`,
    ].join('');
    return {
      background: grad,
      borderTop: `1px solid rgba(${r},${g},${b},0.25)`
    } as React.CSSProperties;
  }, [accentColor]);

  return (
    <div className="status-bar" style={gradientStyle}>
      <div className="status-left" />
      <div className="status-center" style={{ flex: 1 }} />
      <div className="status-right">
        <div className="zoom-group">
        <button type="button" className="btn" onClick={() => {
          const cur = inst?.getZoom?.() || 1;
          const nz = Math.max(0.1, cur / 1.2);
          inst?.setViewport?.({ zoom: nz });
          setZoomDraft(String(Math.round(nz * 100)));
        }} title="Zoom arrière">
          <ZoomOut className="icon-small" />
        </button>
        <input
          type="number"
          min={10}
          max={400}
          step={5}
          value={zoomDraft}
          onChange={(e) => setZoomDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') applyZoomDraft(); }}
          style={{ width: 64, margin: '0 8px' }}
          aria-label="Niveau de zoom en pourcentage"
        />
        <button type="button" className="btn" onClick={() => {
          const cur = inst?.getZoom?.() || 1;
          const nz = Math.min(4, cur * 1.2);
          inst?.setViewport?.({ zoom: nz });
          setZoomDraft(String(Math.round(nz * 100)));
        }} title="Zoom avant">
          <ZoomIn className="icon-small" />
        </button>
        </div>
        <button type="button" className="btn" onClick={() => inst?.fitView?.({ padding: 0.2 })} title="Centrer">
          <Maximize className="icon-small" />
        </button>
        <button type="button" className="btn" onClick={toggleNodesDraggable} title={nodesDraggable ? 'Verrouiller déplacement' : 'Déverrouiller déplacement'}>
          {nodesDraggable ? <Lock className="icon-small" /> : <Unlock className="icon-small" />}
        </button>
        {followSelection && (
          <button
            type="button"
            className="btn"
            onClick={() => setFollowSelection(false)}
            title="Follow actif – cliquer pour désactiver"
            style={{
              borderColor: 'var(--accent-color)',
              background: [
                'linear-gradient(90deg, ',
                'color-mix(in srgb, var(--accent-color) 22%, white) 0%, ',
                'color-mix(in srgb, var(--accent-color) 14%, white) 100%)',
              ].join(''),
              fontWeight: 600,
            }}
          >
            Follow
          </button>
        )}
      </div>
    </div>
  );
}

export default StatusBar;
