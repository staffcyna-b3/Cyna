import { useEffect } from 'react';
import {
  fetchBackOfficeCategoryOptions,
  useBackOfficeCategoriesStore,
} from '@/stores/backoffice/backOfficeCategoriesStore';
import type { BackOfficeCategoryQuery } from '@/types/interfaces/backoffice/category';
import type { UseBackOfficeCategoryOptionsOptions } from '@/types/interfaces/backoffice/hooks/UseBackOfficeCategoryOptionsOptions';

export function useBackOfficeCategoryOptions(
  query: BackOfficeCategoryQuery = {},
  options: UseBackOfficeCategoryOptionsOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeCategoriesStore();

  async function refresh() {
    return fetchBackOfficeCategoryOptions(query);
  }

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void refresh();
  }, [autoFetch, query]);

  return {
    options: state.options,
    loading: state.loading,
    error: state.error,
    refresh,
  } as const;
}

