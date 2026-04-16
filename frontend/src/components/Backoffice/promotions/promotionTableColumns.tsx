import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { SortHeader } from '@/components/Backoffice/data-table/SortHeader';
import type { BackOfficePromotion } from '@/types/interfaces/backoffice/promotion';
import { formatDate } from '@/utils/formatDate';

export function buildPromotionColumns(t: TFunction): Array<ColumnDef<BackOfficePromotion>> {
    return [
        {
            accessorKey: 'code',
            header: ({ column }) => (
                <SortHeader
                    label={t('backoffice.code')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => <span className="font-medium text-gray-800">{row.original.code}</span>,
        },
        {
            accessorKey: 'discount_type',
            header: t('backoffice.discountType'),
            cell: ({ row }) => t(row.original.discount_type === 'service' ? 'service' : 'product'),
        },
        {
            accessorKey: 'discount_value',
            header: ({ column }) => (
                <SortHeader
                    label={t('backoffice.discountValue')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => `${row.original.discount_value}%`,
        },
        {
            accessorKey: 'created_at',
            header: t('backoffice.createdAt'),
            cell: ({ row }) => formatDate(row.original.created_at),
        },
    ];
}

