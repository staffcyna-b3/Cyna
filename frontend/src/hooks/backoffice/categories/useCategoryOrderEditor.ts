import { useCallback, useEffect, useMemo, useState } from 'react';
import { reorderBackOfficeCategoriesPriority } from '@/stores/backoffice/backOfficeCategoriesStore';
import type { BackOfficeCategory } from '@/types/interfaces/backoffice/category';

function sortByPriority(items: BackOfficeCategory[]): BackOfficeCategory[] {
    return [...items].sort((a, b) => {
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }

        return a.name.localeCompare(b.name);
    });
}

function move(items: BackOfficeCategory[], fromIndex: number, toIndex: number): BackOfficeCategory[] {
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

export function useCategoryOrderEditor(sourceItems: BackOfficeCategory[]) {
    const serviceItems = useMemo(
        () => sourceItems.filter((item) => item.type === 'service'),
        [sourceItems],
    );
    const [orderedItems, setOrderedItems] = useState<BackOfficeCategory[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setOrderedItems(sortByPriority(serviceItems));
    }, [serviceItems]);

    const hasChanges = useMemo(() => {
        const sourceOrder = sortByPriority(serviceItems).map((item) => item.id);
        const currentOrder = orderedItems.map((item) => item.id);

        if (sourceOrder.length !== currentOrder.length) {
            return true;
        }

        return sourceOrder.some((id, index) => currentOrder[index] !== id);
    }, [orderedItems, serviceItems]);

    const moveUp = useCallback((index: number) => {
        if (index <= 0) {
            return;
        }

        setOrderedItems((prev) => move(prev, index, index - 1));
    }, []);

    const moveDown = useCallback((index: number) => {
        setOrderedItems((prev) => {
            if (index >= prev.length - 1) {
                return prev;
            }

            return move(prev, index, index + 1);
        });
    }, []);

    const save = useCallback(async () => {
        if (!hasChanges || orderedItems.length === 0) {
            return;
        }

        setSaving(true);
        try {
            const total = orderedItems.length;
            const items = orderedItems.map((category, index) => ({
                id: category.id,
                priority: total - index,
            }));

            await reorderBackOfficeCategoriesPriority({ items });
        } finally {
            setSaving(false);
        }
    }, [hasChanges, orderedItems]);

    return {
        orderedItems,
        hasChanges,
        saving,
        moveUp,
        moveDown,
        save,
    } as const;
}
