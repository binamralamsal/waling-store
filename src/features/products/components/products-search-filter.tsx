import { Search, X } from "lucide-react";

import { useEffect, useState } from "react";

import { getRouteApi } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";

const routeAPI = getRouteApi("/_main/shop");

export function ProductsSearchFilter() {
  const searchParams = routeAPI.useSearch();
  const navigate = routeAPI.useNavigate();

  const [value, setValue] = useState(searchParams.query ?? "");

  useEffect(() => {
    setValue(searchParams.query ?? "");
  }, [searchParams.query]);

  function updateSearch(v: string) {
    const query = v.trim();

    navigate({
      to: ".",
      search: {
        ...searchParams,
        page: 1,
        query: query || undefined,
      },
      resetScroll: false,
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateSearch(value);
  }

  function clearSearch() {
    setValue("");

    navigate({
      to: ".",
      search: {
        ...searchParams,
        page: 1,
        query: undefined,
      },
      resetScroll: false,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label
        htmlFor="product-search"
        className="mb-2 block text-sm font-medium"
      >
        Search the market
      </label>

      <div className="flex items-center gap-2 border-b border-border">
        <Search className="size-4 shrink-0 text-muted-foreground" />

        <Input
          id="product-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Try tomatoes"
          className="
            min-w-0
            flex-1
            rounded-none
            border-0
            bg-transparent
            px-0
            py-2
            shadow-none
            focus-visible:ring-0
          "
        />

        {value && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="
              flex size-6 shrink-0
              items-center justify-center
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
