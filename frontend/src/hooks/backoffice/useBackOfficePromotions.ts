import { useCallback, useEffect } from 'react';
import {
  fetchBackOfficePromotions,
  useBackOfficePromotionsStore,
} from '@/stores/backoffice/backOfficePromotionsStore';

type UseBackOfficePromotionsOptions = {
  autoFetch?: boolean;
};

export function useBackOfficePromotions(options: UseBackOfficePromotionsOptions = {}) {
  const { autoFetch = true } = options;
  const state = useBackOfficePromotionsStore();

  const refresh = useCallback(async () => {
    return fetchBackOfficePromotions();
  }, []);

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
