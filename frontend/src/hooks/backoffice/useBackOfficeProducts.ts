import { useEffect } from 'react';
import {
  fetchBackOfficeProducts,
  useBackOfficeProductsStore,
} from '@/stores/backoffice/backOfficeProductsStore';
import type { BackOfficeProductQuery } from '@/types/interfaces/backoffice/product';
import type { UseBackOfficeProductsOptions } from '@/types/interfaces/backoffice/hooks/UseBackOfficeProductsOptions';

export function useBackOfficeProducts(
  query: BackOfficeProductQuery = {},
  options: UseBackOfficeProductsOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeProductsStore();

  async function refresh() {
    return fetchBackOfficeProducts(query);
  }

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void refresh();
  }, [autoFetch, query]);

  return {
    items: state.items,
    current: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}

