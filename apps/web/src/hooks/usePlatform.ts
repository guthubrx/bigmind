/**
 * FR: Hook pour détecter la plateforme et adapter les raccourcis clavier
 * EN: Hook to detect platform and adapt keyboard shortcuts
 */

import { useState, useEffect } from 'react';

export interface PlatformInfo {
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  modifierKey: string;
  modifierSymbol: string;
}

/**
 * FR: Hook pour détecter la plateforme et retourner les informations de raccourcis
 * EN: Hook to detect platform and return shortcut information
 */
export const usePlatform = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isMac: false,
    isWindows: false,
    isLinux: false,
    modifierKey: 'Ctrl',
    modifierSymbol: 'Ctrl'
  });

  useEffect(() => {
    // FR: Détecter la plateforme basée sur userAgent et navigator.platform
    // EN: Detect platform based on userAgent and navigator.platform
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    const isMac = platform.includes('mac') || userAgent.includes('mac');
    const isWindows = platform.includes('win') || userAgent.includes('windows');
    const isLinux = platform.includes('linux') || userAgent.includes('linux');
    
    setPlatformInfo({
      isMac,
      isWindows,
      isLinux,
      modifierKey: isMac ? 'Cmd' : 'Ctrl',
      modifierSymbol: isMac ? '⌘' : 'Ctrl'
    });
  }, []);

  return platformInfo;
};

/**
 * FR: Fonction utilitaire pour formater les raccourcis selon la plateforme
 * EN: Utility function to format shortcuts according to platform
 */
export const formatShortcut = (shortcut: string, platformInfo: PlatformInfo): string => {
  if (platformInfo.isMac) {
    return shortcut
      .replace(/Ctrl\+/g, '⌘')
      .replace(/Ctrl/g, '⌘')
      .replace(/Alt\+/g, '⌥')
      .replace(/Alt/g, '⌥')
      .replace(/Shift\+/g, '⇧')
      .replace(/Shift/g, '⇧');
  }
  
  return shortcut;
};

/**
 * FR: Fonction utilitaire pour obtenir le nom de la touche modificateur
 * EN: Utility function to get modifier key name
 */
export const getModifierKey = (platformInfo: PlatformInfo): string => {
  return platformInfo.modifierKey;
};

/**
 * FR: Fonction utilitaire pour obtenir le symbole de la touche modificateur
 * EN: Utility function to get modifier key symbol
 */
export const getModifierSymbol = (platformInfo: PlatformInfo): string => {
  return platformInfo.modifierSymbol;
};
