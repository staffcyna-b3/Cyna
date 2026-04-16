import { useCallback, useEffect } from 'react';
import {
  fetchBackOfficePromotionById,
  useBackOfficePromotionsStore,
} from '@/stores/backoffice/backOfficePromotionsStore';

type UseBackOfficePromotionByIdOptions = {
  autoFetch?: boolean;
};

export function useBackOfficePromotionById(
  promotionId: string | undefined,
  options: UseBackOfficePromotionByIdOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficePromotionsStore();

  const refresh = useCallback(async () => {
    if (!promotionId) {
      return null;
    }

    return fetchBackOfficePromotionById(promotionId);
  }, [promotionId]);

  useEffect(() => {
    if (!autoFetch || !promotionId) {
      return;
    }

    void refresh();
  }, [autoFetch, promotionId, refresh]);

  return {
    item: state.current,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}
