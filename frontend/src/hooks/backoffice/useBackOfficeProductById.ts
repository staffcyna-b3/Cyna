import { useEffect } from 'react';
import {
  fetchBackOfficeProductById,
  useBackOfficeProductsStore,
} from '@/stores/backoffice/backOfficeProductsStore';
import type { UseBackOfficeProductByIdOptions } from '@/types/interfaces/backoffice/hooks/UseBackOfficeProductByIdOptions';

export function useBackOfficeProductById(
  productId: string | undefined,
  options: UseBackOfficeProductByIdOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeProductsStore();

  async function refresh() {
    if (!productId) {
      return null;
    }

    return fetchBackOfficeProductById(productId);
  }

  useEffect(() => {
    if (!autoFetch || !productId) {
      return;
    }

    void refresh();
  }, [autoFetch, productId]);

  return {
    item: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}
