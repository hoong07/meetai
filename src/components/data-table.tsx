"use client"

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

import { features, type DataTableFeatures } from "@/modules/agents/ui/components/data-table-features"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  onRowClick
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  })

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                onClick={() => onRowClick?.(row.original)}
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm p-4 ">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-19 text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}