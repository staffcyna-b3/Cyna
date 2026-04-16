import { useCallback, useEffect } from 'react';
import {
  fetchBackOfficeProductById,
  useBackOfficeProductsStore,
} from '@/stores/backoffice/backOfficeProductsStore';

type UseBackOfficeProductByIdOptions = {
  autoFetch?: boolean;
};

export function useBackOfficeProductById(
  productId: string | undefined,
  options: UseBackOfficeProductByIdOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeProductsStore();

  const refresh = useCallback(async () => {
    if (!productId) {
      return null;
    }

    return fetchBackOfficeProductById(productId);
  }, [productId]);

  useEffect(() => {
    if (!autoFetch || !productId) {
      return;
    }

    void refresh();
  }, [autoFetch, productId, refresh]);

  return {
    item: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}
