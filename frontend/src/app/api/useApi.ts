/**
 * Hook para consumir a API
 * Gerencia estado de carregamento, dados e erros
 */

import { useState, useEffect } from 'react';
import { api } from './client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  endpoint: string,
  dependencies: unknown[] = [],
  refreshIntervalMs = 0
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    refreshing: false,
    error: null,
    refetch: async () => {},
  });

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchData = async (backgroundRefresh = false) => {
      try {
        if (!backgroundRefresh) {
          setState((prev) => ({ ...prev, loading: true, error: null }));
        } else {
          setState((prev) => ({ ...prev, refreshing: true, error: null }));
        }

        const response = await api.get<T>(endpoint);

        if (isMounted) {
          setState({
            data: response,
            loading: false,
            refreshing: false,
            error: null,
            refetch: async () => fetchData(true),
          });
        }
      } catch (err) {
        if (isMounted) {
          setState((prev) => ({
            data: prev.data,
            loading: false,
            refreshing: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
            refetch: async () => fetchData(true),
          }));
        }
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startPolling = () => {
      if (refreshIntervalMs <= 0 || intervalId || document.hidden) {
        return;
      }

      intervalId = setInterval(() => {
        void fetchData(true);
      }, refreshIntervalMs);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        return;
      }

      void fetchData(true);
      startPolling();
    };

    fetchData(false);

    if (refreshIntervalMs > 0) {
      startPolling();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      isMounted = false;

      if (refreshIntervalMs > 0) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }

      stopPolling();
    };
  }, [endpoint, refreshIntervalMs, ...dependencies]);

  return state;
}
