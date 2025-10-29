/**
 * React hook for data fetching and subscription
 * Provides loading states and automatic refetch
 */

import { useState, useEffect, useCallback } from 'react';
import { bridge } from '../bridge';
import type { UseBigMindDataReturn } from '../types';

export function useBigMindData(path: string): UseBigMindDataReturn {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bridge.getData(path);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();

    // Subscribe to data changes at this path
    const unsubscribe = bridge.subscribe(`data.changed:${path}`, (newData: any) => {
      setData(newData);
    });

    return unsubscribe;
  }, [path, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
