import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import type { RowData, StockFeatures, Table } from "@tanstack/react-table";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DATATABLE_PAGE_SIZE } from "@/config/constants";
import { cn } from "#/lib/utils";

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<StockFeatures, TData>;
}

export function DataTablePagination<TData extends RowData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageSize = useSearch({
    strict: false,
    select: (state) => state.pageSize,
  });
  const pageSearchValue = useSearch({
    strict: false,
    select: (state) => state.page,
  });
  const page = Math.max(1, pageSearchValue || 1);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-2">
      <div></div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSize?.toString()}
            defaultValue={DATATABLE_PAGE_SIZE.toString()}
            onValueChange={(value) => {
              navigate({
                to: ".",
                search: (prev) => ({ ...prev, pageSize: parseInt(value) }),
              });
            }}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 15, 20, 25, 30, 35, 40, 45, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-25 items-center justify-center text-sm font-medium">
          Page {page} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className={cn(
              "hidden h-8 w-8 p-0 lg:flex",
              page <= 1 && "opacity-50",
            )}
            disabled={page <= 1}
            render={
              <Link to="." search={(prev) => ({ ...prev, page: 1 })}>
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Link>
            }
            nativeButton={false}
          />
          <Button
            variant="outline"
            className={cn("h-8 w-8 p-0", page - 1 < 1 && "opacity-50")}
            disabled={page - 1 < 1}
            nativeButton={false}
            render={
              <Link to="." search={(prev) => ({ ...prev, page: page - 1 })}>
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Link>
            }
          />
          <Button
            variant="outline"
            className={cn(
              "h-8 w-8 p-0",
              page + 1 > table.getPageCount() && "opacity-50",
            )}
            disabled={page + 1 > table.getPageCount()}
            nativeButton={false}
            render={
              <Link to="." search={(prev) => ({ ...prev, page: page + 1 })}>
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Link>
            }
          />
          <Button
            variant="outline"
            className={cn(
              "hidden h-8 w-8 p-0 lg:flex",
              page >= table.getPageCount() && "opacity-50",
            )}
            disabled={page >= table.getPageCount()}
            nativeButton={false}
            render={
              <Link
                to="."
                search={(prev) => ({ ...prev, page: table.getPageCount() })}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
