import { useEffect } from 'react';
import {
  fetchBackOfficePromotionById,
  useBackOfficePromotionsStore,
} from '@/stores/backoffice/backOfficePromotionsStore';
import type { UseBackOfficePromotionByIdOptions } from '@/types/interfaces/backoffice/hooks/UseBackOfficePromotionByIdOptions';

export function useBackOfficePromotionById(
  promotionId: string | undefined,
  options: UseBackOfficePromotionByIdOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficePromotionsStore();

  async function refresh() {
    if (!promotionId) {
      return null;
    }

    return fetchBackOfficePromotionById(promotionId);
  }

  useEffect(() => {
    if (!autoFetch || !promotionId) {
      return;
    }

    void refresh();
  }, [autoFetch, promotionId]);

  return {
    item: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}
