import { useCallback, useEffect } from 'react';
import {
  fetchBackOfficeCategories,
  useBackOfficeCategoriesStore,
} from '@/stores/backoffice/backOfficeCategoriesStore';
import type { BackOfficeCategoryQuery } from '@/types/interfaces/backoffice/category';

type UseBackOfficeCategoriesOptions = {
  autoFetch?: boolean;
};

export function useBackOfficeCategories(
  query: BackOfficeCategoryQuery = {},
  options: UseBackOfficeCategoriesOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeCategoriesStore();

  const refresh = useCallback(async () => {
    return fetchBackOfficeCategories(query);
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

