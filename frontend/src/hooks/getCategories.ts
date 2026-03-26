import { useState, useCallback } from 'react';
import { CatalogService } from '../services/CatalogService';
import i18n from '@/i18n';
import { Category } from '@/types/interfaces/category/Category';

export const GetCategories = () => {
    const service = CatalogService.getInstance();

    const [data, setData] = useState<Category[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const listCategories = useCallback(
        async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await service.listCategories();
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

    return { data, loading, error, listCategories } as const;
};

export default GetCategories;
