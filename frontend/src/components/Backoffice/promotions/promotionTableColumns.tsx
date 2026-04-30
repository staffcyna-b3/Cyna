import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BackOfficePromotion } from '@/types/interfaces/backoffice/promotion';
import { formatDate } from '@/utils/formatDate';

function SortableHeader({
    label,
    sorted,
    onToggle,
}: {
    label: string;
    sorted: false | 'asc' | 'desc';
    onToggle: () => void;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
            onClick={onToggle}
        >
            <span>{label}</span>
            <ArrowUpDown
                className={sorted ? 'ml-1.5 size-3.5 text-indigo-600' : 'ml-1.5 size-3.5 text-gray-400'}
            />
        </Button>
    );
}

export function buildPromotionColumns(
    t: TFunction,
    onOpenPromotionEditor?: (promotionId: string) => void,
): Array<ColumnDef<BackOfficePromotion>> {
    return [
        {
            accessorKey: 'code',
            header: ({ column }) => (
                <SortableHeader
                    label={t('backoffice.code')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 font-medium text-gray-800"
                    onClick={() => onOpenPromotionEditor?.(row.original.id)}
                >
                    {row.original.code}
                </Button>
            ),
        },
        {
            accessorKey: 'discount_type',
            header: t('backoffice.discountType'),
            cell: ({ row }) => t(row.original.discount_type === 'service' ? 'service' : 'product'),
        },
        {
            accessorKey: 'discount_value',
            header: ({ column }) => (
                <SortableHeader
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

