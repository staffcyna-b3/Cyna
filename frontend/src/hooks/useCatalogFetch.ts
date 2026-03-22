import { useState, useCallback } from 'react';
import { CatalogContext } from '../contexts/CatalogContext';
import { useContext } from 'react';
import { CatalogService } from '../services/CatalogService';
import { CatalogListResponse } from '../types/interfaces/catalog/CatalogListResponse';
import { CatalogFilters } from '../types/interfaces/catalog/CatelogFilters';
import i18n from '@/i18n';

export const useCatalogFetch = () => {
    const ctx = useContext(CatalogContext);
    if (!ctx) {
        throw new Error(i18n.t('useCatalogFetchMustBeUsed'));
    }

    const service = CatalogService.getInstance();

    const [data, setData] = useState<CatalogListResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCatalog = useCallback(
        async (overrides: Partial<CatalogFilters> = {}) => {
            setLoading(true);
            setError(null);
            try {
                const payload: Partial<CatalogFilters> = {
                    ...ctx.getPayload(),
                    page: ctx.page,
                    limit: ctx.limit,
                    ...overrides,
                };
                const res = await service.getCatalogList(payload);
                setData(res);
                return res;
            } catch (err: unknown) {
                let message: string;
                if (
                    typeof err === 'object' &&
                    err !== null &&
                    'message' in err
                ) {
                    const maybeMessage = (err as { message?: unknown }).message;
                    message =
                        typeof maybeMessage === 'string'
                            ? maybeMessage
                            : String(maybeMessage ?? i18n.t('error'));
                } else {
                    message = String(err);
                }
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [ctx, service]
    );

    return { data, loading, error, fetchCatalog } as const;
};

export default useCatalogFetch;
