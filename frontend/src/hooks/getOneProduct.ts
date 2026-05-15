import { useState, useCallback } from 'react';
import { CatalogApi } from '../api/CatalogApi';
import i18n from '@/i18n';
import { CatalogResponse } from '@/types/interfaces/catalog/CatalogResponse';

export const GetOneProduct = () => {
    const service = CatalogApi.getInstance();

    const [data, setData] = useState<CatalogResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getOne = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await service.getOne(id);
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
        [service]
    );

    return { data, loading, error, getOne } as const;
};

export default GetOneProduct;
