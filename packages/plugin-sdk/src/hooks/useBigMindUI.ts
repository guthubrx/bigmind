/**
 * React hook for UI operations
 * Provides panel, command, and notification APIs
 */

import { useCallback } from 'react';
import { bridge } from '../bridge';
import type { UseBigMindUIReturn, PanelConfig, CommandConfig } from '../types';

export function useBigMindUI(): UseBigMindUIReturn {
  const registerPanel = useCallback(async (config: PanelConfig) => {
    await bridge.registerPanel(config);

    // Return unregister function
    return () => {
      bridge.unregisterPanel(config.id).catch((error) => {
        console.error(`Failed to unregister panel ${config.id}:`, error);
      });
    };
  }, []);

  const showPanel = useCallback(async (panelId: string) => {
    return bridge.showPanel(panelId);
  }, []);

  const registerCommand = useCallback(async (config: CommandConfig) => {
    await bridge.registerCommand(config);

    // Return unregister function
    return () => {
      bridge.unregisterCommand(config.id).catch((error) => {
        console.error(`Failed to unregister command ${config.id}:`, error);
      });
    };
  }, []);

  const showNotification = useCallback(
    async (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
      return bridge.showNotification(message, type);
    },
    []
  );

  return {
    registerPanel,
    showPanel,
    registerCommand,
    showNotification,
  };
}
