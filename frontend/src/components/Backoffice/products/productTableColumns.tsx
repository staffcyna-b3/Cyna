import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { SortHeader } from '@/components/Backoffice/data-table/SortHeader';
import { ProductStatus } from '@/types/enums/product/ProductStatus';
import type { BackOfficeProduct } from '@/types/interfaces/backoffice/product';

function getReference(id: string): string {
    return id.replace(/-/g, '').slice(0, 10).toUpperCase();
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
}

export function buildProductColumns(t: TFunction): Array<ColumnDef<BackOfficeProduct>> {
    return [
        {
            id: 'reference',
            accessorFn: (row) => getReference(row.id),
            header: t('backoffice.reference'),
            cell: ({ row }) => (
                <span className="font-medium text-gray-800">{getReference(row.original.id)}</span>
            ),
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <SortHeader
                    label={t('product')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => <span className="text-gray-700">{row.original.name}</span>,
        },
        {
            accessorKey: 'stock',
            header: ({ column }) => (
                <SortHeader
                    label={t('backoffice.stockQuantity')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => {
                if (!row.original.is_service) {
                    return row.original.stock;
                }

                return row.original.status === ProductStatus.UNAVAILABLE ? t('maintenance') : '-';
            },
        },
        {
            accessorKey: 'price',
            header: ({ column }) => (
                <SortHeader
                    label={t('price')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => formatPrice(Number(row.original.price)),
        },
    ];
}

export function getProductReference(product: BackOfficeProduct): string {
    return getReference(product.id);
}

