/**
 * React hook to access BigMind bridge
 * Provides access to all bridge APIs (data, UI, commands, storage, theme)
 */

import { useEffect, useState } from 'react';
import { bridge } from '../bridge';
import type { UseBigMindBridgeReturn } from '../types';

export function useBigMindBridge(): UseBigMindBridgeReturn {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bridge.waitForInit().then(() => setReady(true));
  }, []);

  if (!ready) {
    console.warn('BigMind bridge not yet initialized');
  }

  return bridge;
}
