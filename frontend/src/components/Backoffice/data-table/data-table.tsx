import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { DataTablePagination } from "@/components/Backoffice/data-table/data-table-pagination"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { LucideSearch } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  onSelectionChange?: (rows: TData[]) => void
  filterColumn?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  onSelectionChange,
  filterColumn,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})

    
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        enableRowSelection: true,
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,

        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

  useEffect(() => {
    if (!onSelectionChange) return;
    const selected = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
    onSelectionChange(selected);
  }, [rowSelection]);

  return (
    <>
        {filterColumn && table.getColumn(filterColumn) && (
            <div className="flex items-center py-4">
                <InputGroup>
                    <InputGroupInput
                        placeholder="Rechercher..."
                        value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                        }
                    />
                    <InputGroupAddon><LucideSearch /></InputGroupAddon>
                </InputGroup>
            </div>
        )}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="text-right text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
        )}
        <div className="overflow-hidden rounded-md border bg-white">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )
                                }
                            </TableHead>
                        )
                    })}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={() => onRowClick?.(row.original)}
                            className={onRowClick ? "cursor-pointer" : undefined}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
        <DataTablePagination table={table} />
    </>
  )
}