/**
 * Hook para consumir a API
 * Gerencia estado de carregamento, dados e erros
 */

import { useState, useEffect } from 'react';
import { api } from './client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(
  endpoint: string,
  dependencies: unknown[] = []
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await api.get<T>(endpoint);

        if (isMounted) {
          setState({
            data: response,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, ...dependencies]);

  return state;
}
