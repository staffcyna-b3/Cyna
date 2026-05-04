import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

function discountTypeLabel(t: TFunction, type: string) {
    if (type === 'service') return t('service');
    if (type === 'cart') return t('cart.title');
    return t('product');
}

export function buildPromotionColumns(
    t: TFunction,
): Array<ColumnDef<BackOfficePromotion>> {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
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
                <span className="font-medium text-gray-800">{row.original.code}</span>
            ),
        },
        {
            accessorKey: 'discount_type',
            header: t('backoffice.discountType'),
            cell: ({ row }) => discountTypeLabel(t, row.original.discount_type),
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

