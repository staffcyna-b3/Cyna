import { useCallback, useEffect } from 'react';
import {
  fetchBackOfficeProducts,
  useBackOfficeProductsStore,
} from '@/stores/backoffice/backOfficeProductsStore';
import type { BackOfficeProductQuery } from '@/types/interfaces/backoffice/product';

type UseBackOfficeProductsOptions = {
  autoFetch?: boolean;
};

export function useBackOfficeProducts(
  query: BackOfficeProductQuery = {},
  options: UseBackOfficeProductsOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeProductsStore();

  const refresh = useCallback(async () => {
    return fetchBackOfficeProducts(query);
  }, [query]);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void refresh();
  }, [autoFetch, refresh]);

  return {
    items: state.items,
    current: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}

