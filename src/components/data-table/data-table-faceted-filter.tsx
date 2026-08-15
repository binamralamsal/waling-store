import { Check, PlusCircle } from "lucide-react";

import { useMemo } from "react";

import type { Column, RowData, StockFeatures } from "@tanstack/react-table";
import { useNavigate, useSearch } from "@tanstack/react-router";

import type { FiltersOptionsType } from "./data-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "#/lib/utils";

interface DataTableFacetedFilterProps<TData extends RowData, TValue> {
  column?: Column<StockFeatures, TData, TValue>;
  title?: string;
  options: FiltersOptionsType[];
  queryKey: string;
}

export function DataTableFacetedFilter<TData extends RowData, TValue>({
  column,
  title,
  queryKey,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });

  const selectedValues = useMemo(() => {
    // @ts-expect-error -- dynamic key access
    const values = searchParams[queryKey] as string[] | undefined;
    return new Set(Array.isArray(values) ? values : []);
  }, [searchParams, queryKey]);

  function handleFilterItemChange(option: FiltersOptionsType) {
    if (!column) return;

    const newSelectedValues = new Set(selectedValues);
    const isSelected = newSelectedValues.has(option.value);

    if (isSelected) {
      newSelectedValues.delete(option.value);
    } else {
      newSelectedValues.add(option.value);
    }

    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        [queryKey]:
          newSelectedValues.size === 0
            ? undefined
            : Array.from(newSelectedValues),
      }),
    });
  }

  function handleClearFilters() {
    if (!column) return;

    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        [queryKey]: undefined,
      }),
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-10 border-dashed">
            <PlusCircle />
            {title}
            {selectedValues.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleFilterItemChange(option)}
                  >
                    <div
                      className={cn(
                        "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground fill-primary"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check
                        className={cn(isSelected && "text-primary-foreground")}
                      />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearFilters}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
