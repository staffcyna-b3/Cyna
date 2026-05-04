import { useEffect } from 'react';
import {
  fetchBackOfficeCategories,
  useBackOfficeCategoriesStore,
} from '@/stores/backoffice/backOfficeCategoriesStore';
import type { BackOfficeCategoryQuery } from '@/types/interfaces/backoffice/category';
import type { UseBackOfficeCategoriesOptions } from '@/types/interfaces/backoffice/hooks/UseBackOfficeCategoriesOptions';

export function useBackOfficeCategories(
  query: BackOfficeCategoryQuery = {},
  options: UseBackOfficeCategoriesOptions = {},
) {
  const { autoFetch = true } = options;
  const state = useBackOfficeCategoriesStore();

  async function refresh() {
    return fetchBackOfficeCategories(query);
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

