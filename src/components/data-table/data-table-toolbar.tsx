import { SearchIcon } from "lucide-react";

import { Fragment, useEffect, useState, type SubmitEvent } from "react";

import type { RowData, StockFeatures, Table } from "@tanstack/react-table";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { FiltersType } from "./data-table";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData extends RowData> {
  table: Table<StockFeatures, TData>;
  dataKey?: string;
  filters?: FiltersType[];
}

export function DataTableToolbar<TData extends RowData>({
  table,
  dataKey = "data",
  filters,
}: DataTableToolbarProps<TData>) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const searchQuery = useSearch({
    strict: false,
    select: (state) => state.search,
  });

  useEffect(() => {
    setQuery(searchQuery ? searchQuery : "");
  }, [searchQuery]);

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({
      to: ".",
      search: (prev) => {
        return { ...prev, search: query ? query : undefined };
      },
    });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <form
        className="flex w-full items-center gap-2 lg:w-auto"
        onSubmit={handleSearchSubmit}
      >
        <Input
          placeholder={`Search ${dataKey}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full lg:w-75"
        />
        <Button size="icon">
          <SearchIcon />
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 lg:flex-nowrap lg:justify-end">
        <div className="flex flex-wrap gap-2">
          {filters?.map((filter) => (
            <Fragment key={filter.accessorKey}>
              {table.getColumn(filter.accessorKey) && (
                <DataTableFacetedFilter
                  column={table.getColumn(filter.accessorKey)}
                  title={filter.title}
                  options={filter.options}
                  queryKey={filter.queryKey}
                />
              )}
            </Fragment>
          ))}
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
