import { useState, useCallback } from 'react';
import { CatalogApi } from '../api/CatalogApi';
import i18n from '@/i18n';
import { Category } from '@/types/interfaces/category/Category';

function sortCategories(items: Category[]): Category[] {
    return [...items].sort((a, b) => {
        const aPriority = a.priority ?? 0;
        const bPriority = b.priority ?? 0;

        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }

        return a.name.localeCompare(b.name);
    });
}

export const useCategories = () => {
    const service = CatalogApi.getInstance();

    const [data, setData] = useState<Category[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const listCategories = useCallback(
        async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await service.listCategories();
                const sorted = sortCategories(res);
                setData(sorted);
                return sorted;
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

export default useCategories;
