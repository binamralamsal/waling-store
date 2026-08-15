import { useEffect, useState } from "react";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { flexRender, useTable, stockFeatures } from "@tanstack/react-table";
import type {
  ColumnDef,
  RowData,
  SortingState,
  StockFeatures,
  TableOptions,
} from "@tanstack/react-table";

import { Skeleton } from "../ui/skeleton";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DATATABLE_PAGE_SIZE } from "@/config/constants";

export interface FiltersOptionsType {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FiltersType {
  accessorKey: string;
  queryKey: string;
  title: string;
  options: FiltersOptionsType[];
}

export interface DataTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<StockFeatures, TData, TValue>[];
  data: TData[];
  dataKey?: string;
  pageSize?: number;
  isLoading?: boolean;
  options?: Omit<
    TableOptions<StockFeatures, TData>,
    "data" | "columns" | "features"
  >;
  filters?: FiltersType[];
  skeletonColumnWidths?: string[];
  skeletonRowLength?: number;
}

export function DataTable<TData extends RowData, TValue>({
  columns,
  data,
  dataKey,
  options,
  isLoading,
  filters,
  skeletonColumnWidths,
  skeletonRowLength = DATATABLE_PAGE_SIZE,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    ...(options?.initialState?.sorting || []),
  ]);

  const table = useTable({
    features: stockFeatures,
    data,
    columns: columns as ColumnDef<StockFeatures, TData, unknown>[],
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    state: {
      sorting,
    },
    enableMultiSort: false,
    ...options,
  });

  const navigate = useNavigate();

  const sortQuery = useSearch({ strict: false, select: (state) => state.sort });

  useEffect(() => {
    table.setSorting(
      Object.entries(sortQuery || {}).map(([key, value]) => ({
        desc: value === "desc",
        id: key,
      })),
    );
  }, [sortQuery]);

  useEffect(() => {
    const sortValues: Record<string, "desc" | "asc"> = {};
    sorting.map((sortValue) => {
      sortValues[sortValue.id] = sortValue.desc ? "desc" : "asc";
    });

    if (Object.entries(sortValues).length === 0) return;

    navigate({
      to: ".",
      search: (prev) => ({ ...prev, sort: sortValues }),
    });
  }, [sorting]);

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} dataKey={dataKey} filters={filters} />
      <div className="relative w-full overflow-auto rounded-md border">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRowLength }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({
                    length: table.getVisibleFlatColumns().length,
                  }).map((_, j) => (
                    <TableCell
                      style={{
                        width: skeletonColumnWidths?.at(j)
                          ? skeletonColumnWidths[j]
                          : "auto",
                      }}
                      key={j}
                      className="p-2 pr-0"
                    >
                      <Skeleton className="h-7 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="pl-5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
