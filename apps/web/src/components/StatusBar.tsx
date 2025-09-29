/**
 * FR: Barre de statut de BigMind
 * EN: BigMind status bar
 */

import React, { useCallback } from 'react';
import { useViewport } from '../hooks/useViewport';
import { 
  Circle, 
  Wifi, 
  WifiOff,
  Save,
  Clock,
  User
} from 'lucide-react';
import './StatusBar.css';

const StatusBar: React.FC = () => {
  const isOnline = navigator.onLine;
  const zoom = useViewport((s) => s.zoom);
  const setZoom = useViewport((s) => s.setZoom);
  const onZoomInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0.1 && val <= 4) {
      setZoom(val / 100);
    }
  }, [setZoom]);
  const currentTime = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="status-bar">
      {/* FR: Section gauche - Statut de connexion */}
      {/* EN: Left section - Connection status */}
      <div className="status-left">
        <div className="status-item">
          {isOnline ? (
            <Wifi className="icon-small" />
          ) : (
            <WifiOff className="icon-small" />
          )}
          <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
        </div>
        
        <div className="status-item">
          <Circle className="icon-small status-dot" />
          <span>Prêt</span>
        </div>
      </div>

      {/* FR: Section centrale - Informations de session */}
      {/* EN: Center section - Session information */}
      <div className="status-center">
        <div className="status-item">
          <User className="icon-small" />
          <span>Utilisateur</span>
        </div>
        
        <div className="status-item">
          <Save className="icon-small" />
          <span>Dernière sauvegarde: {currentTime}</span>
        </div>
      </div>

      {/* FR: Section droite - Heure et informations système */}
      {/* EN: Right section - Time and system information */}
      <div className="status-right">
        <div className="status-item">
          <span>Zoom</span>
          <input
            type="number"
            min={10}
            max={400}
            step={5}
            value={Math.round(zoom * 100)}
            onChange={onZoomInput}
            style={{ width: 64 }}
          />
          <span>%</span>
        </div>
        <div className="status-item">
          <Clock className="icon-small" />
          <span>{currentTime}</span>
        </div>
        
        <div className="status-item">
          <span>BigMind v0.1.0</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
