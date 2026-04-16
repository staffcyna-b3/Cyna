import { useMemo, useState } from 'react';
import {
    type CellContext,
    type ColumnDef,
    type RowSelectionState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type BackOfficeDataTableProps<TData extends object> = {
    data: TData[];
    columns: Array<ColumnDef<TData>>;
    getRowId?: (row: TData, index: number) => string;
    emptyLabel: string;
    loading?: boolean;
    enableRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    onRowClick?: (row: TData) => void;
};

function SelectionCell<TData extends object>({
    row,
}: CellContext<TData, unknown> & {
    row: {
        getIsSelected: () => boolean;
        getCanSelect: () => boolean;
        toggleSelected: (value: boolean) => void;
    };
}) {
    return (
        <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
            aria-label="Select row"
        />
    );
}

export function BackOfficeDataTable<TData extends object>({
    data,
    columns,
    getRowId,
    emptyLabel,
    loading = false,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    onRowClick,
}: BackOfficeDataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const selectionColumn: ColumnDef<TData> = {
        id: 'select',
        size: 44,
        header: ({ table }) => (
            <div onClick={(event) => event.stopPropagation()}>
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: (ctx) => <SelectionCell {...ctx} row={ctx.row} />,
        enableSorting: false,
        enableHiding: false,
    };

    const finalColumns = useMemo(() => {
        if (!enableRowSelection) {
            return columns;
        }
        return [selectionColumn, ...columns];
    }, [columns, enableRowSelection]);

    const table = useReactTable({
        data,
        columns: finalColumns,
        state: {
            sorting,
            rowSelection: rowSelection ?? {},
        },
        onSortingChange: setSorting,
        onRowSelectionChange: (updater) => {
            if (!onRowSelectionChange) {
                return;
            }

            const nextState =
                typeof updater === 'function' ? updater(rowSelection ?? {}) : updater;

            onRowSelectionChange(nextState);
        },
        getRowId,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableRowSelection,
    });

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50/70">
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{ width: header.getSize() === 150 ? undefined : header.getSize() }}
                                    className="px-3 py-3 text-left text-sm font-semibold text-gray-900"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={finalColumns.length}
                                className="px-3 py-10 text-center text-sm text-gray-500"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className={cn(
                                    'border-b border-gray-100 transition-colors',
                                    row.getIsSelected() ? 'bg-indigo-50/50' : 'hover:bg-gray-50/60',
                                    onRowClick && 'cursor-pointer',
                                )}
                                onClick={() => onRowClick?.(row.original)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-3 py-3 text-sm text-gray-700"
                                        onClick={
                                            cell.column.id === 'select'
                                                ? (event) => event.stopPropagation()
                                                : undefined
                                        }
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={finalColumns.length}
                                className="px-3 py-10 text-center text-sm text-gray-500"
                            >
                                {emptyLabel}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
