/**
 * FR: Composant de debug pour afficher les informations de plateforme
 * EN: Debug component to display platform information
 */

import React from 'react';
import { usePlatform } from '../hooks/usePlatform';

const PlatformDebug: React.FC = () => {
  const platformInfo = usePlatform();

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div>
        Platform:{' '}
        {platformInfo.isMac
          ? 'Mac'
          : platformInfo.isWindows
            ? 'Windows'
            : platformInfo.isLinux
              ? 'Linux'
              : 'Unknown'}
      </div>
      <div>
        Modifier: {platformInfo.modifierKey} ({platformInfo.modifierSymbol})
      </div>
    </div>
  );
};

export default PlatformDebug;
