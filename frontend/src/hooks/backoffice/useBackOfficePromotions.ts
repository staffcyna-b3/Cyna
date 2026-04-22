import { useEffect } from 'react';
import {
  fetchBackOfficePromotions,
  useBackOfficePromotionsStore,
} from '@/stores/backoffice/backOfficePromotionsStore';
import type { UseBackOfficePromotionsOptions } from '@/types/interfaces/backoffice/hooks/UseBackOfficePromotionsOptions';

export function useBackOfficePromotions(options: UseBackOfficePromotionsOptions = {}) {
  const { autoFetch = true } = options;
  const state = useBackOfficePromotionsStore();

  async function refresh() {
    return fetchBackOfficePromotions();
  }

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void refresh();
  }, [autoFetch]);

  return {
    items: state.items,
    current: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}
