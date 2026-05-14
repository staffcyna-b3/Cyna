import { useState, useCallback } from 'react';
import { CatalogApi } from '../api/CatalogApi';
import i18n from '@/i18n';
import { CatalogResponse } from '@/types/interfaces/catalog/CatalogResponse';

const service = CatalogApi.getInstance();

export function useSimilarProducts() {
    const [data, setData] = useState<CatalogResponse[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getSimilarProducts = useCallback(async (productId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await service.getSimilarProducts(productId);
            setData(res);
            return res;
        } catch (err: unknown) {
            let message: string;
            if (typeof err === 'object' && err !== null && 'message' in err) {
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
    }, []);

    return { data, loading, error, getSimilarProducts } as const;
}

export default useSimilarProducts;
