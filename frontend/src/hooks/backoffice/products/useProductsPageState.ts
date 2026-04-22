import { useMemo, useState } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { ProductStatus } from '@/types/enums/product/ProductStatus';
import type { ProductStatusFilter } from '@/types/interfaces/backoffice/product/ProductStatusFilter';
import type { ProductTypeFilter } from '@/types/interfaces/backoffice/product/ProductTypeFilter';

export function useProductsPageState() {
    const [status, setStatus] = useState<ProductStatusFilter>('active');
    const [type, setType] = useState<ProductTypeFilter>('all');
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const query = useMemo(
        () => ({
            search: search.trim() || undefined,
            category_id: categoryId || undefined,
            status: status === 'active' ? ProductStatus.AVAILABLE : ProductStatus.UNAVAILABLE,
            is_service: type === 'all' ? undefined : type === 'service',
        }),
        [search, categoryId, status, type],
    );

    const selectedCount = Object.keys(rowSelection).length;

    function openProductEditor(productId: string) {
        setSelectedProductId(productId);
        setSheetOpen(true);
    }

    function closeProductEditor() {
        setSheetOpen(false);
        setSelectedProductId(null);
    }

    function resetFilters() {
        setSearch('');
        setCategoryId('');
        setType('all');
    }

    return {
        status,
        setStatus,
        type,
        setType,
        search,
        setSearch,
        categoryId,
        setCategoryId,
        isFilterOpen,
        setIsFilterOpen,
        resetFilters,
        rowSelection,
        setRowSelection,
        query,
        selectedProductId,
        selectedCount,
        sheetOpen,
        setSheetOpen,
        openProductEditor,
        closeProductEditor,
    } as const;
}
