import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductStatus } from '@/types/enums/product/ProductStatus';
import type { BackOfficeProduct } from '@/types/interfaces/backoffice/product';

function getReference(id: string): string {
    return id.replace(/-/g, '').slice(0, 10).toUpperCase();
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
}

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

export function buildProductColumns(
    t: TFunction,
): Array<ColumnDef<BackOfficeProduct>> {
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
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
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
                <SortableHeader
                    label={t('product')}
                    sorted={column.getIsSorted()}
                    onToggle={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            ),
            cell: ({ row }) => (
                <span className="font-medium text-gray-700">{row.original.name}</span>
            ),
        },
        {
            accessorKey: 'stock',
            header: ({ column }) => (
                <SortableHeader
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
                <SortableHeader
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

