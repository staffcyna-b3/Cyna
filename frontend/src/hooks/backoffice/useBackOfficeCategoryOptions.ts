import { useCallback, useEffect } from 'react';
import {
  fetchBackOfficeCategoryOptions,
  useBackOfficeCategoriesStore,
} from '@/stores/backoffice/backOfficeCategoriesStore';
import type { BackOfficeCategoryQuery } from '@/types/interfaces/backoffice/category';

type UseBackOfficeCategoryOptionsOptions = {
  autoFetch?: boolean;
};

export function useBackOfficeCategoryOptions(
  query: BackOfficeCategoryQuery = {},
  options: UseBackOfficeCategoryOptionsOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeCategoriesStore();

  const refresh = useCallback(async () => {
    return fetchBackOfficeCategoryOptions(query);
  }, [query]);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void refresh();
  }, [autoFetch, refresh]);

  return {
    options: state.options,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}

