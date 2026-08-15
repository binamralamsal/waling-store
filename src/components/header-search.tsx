import { useEffect, useState } from "react";

import { Search, X } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";
import { Skeleton } from "#/components/ui/skeleton";
import { allCategoriesOptions } from "#/features/products/products.queries";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

export function HeaderSearch() {
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const { location } = useRouterState();

  const searchParams =
    location.pathname === "/shop"
      ? (location.search as { query?: string })
      : undefined;

  const { data, isPending } = useQuery(
    allCategoriesOptions({
      values: {
        page: 1,
        pageSize: 10,
      },
    }),
  );

  // Keep the input synchronized with the shop URL.
  useEffect(() => {
    setQuery(searchParams?.query ?? "");
  }, [searchParams?.query]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        page: 1,
        query: trimmedQuery || undefined,
      }),
    });
  }

  function handleClear() {
    setQuery("");

    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        page: 1,
        query: undefined,
      }),
    });
  }

  return (
    <div className="grid grid-cols-[1fr_3.5fr] gap-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="border-input border-b">
              Categories
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <ul className="grid w-64 gap-1">
                {isPending ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <li key={i}>
                      <Skeleton className="h-8 w-full rounded-none" />
                    </li>
                  ))
                ) : data?.categories.length ? (
                  data.categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to="/shop"
                        search={(prev) => ({
                          ...prev,
                          categories: [category.slug],
                          page: 1,
                        })}
                        className="
                          flex items-center gap-3
                          px-3 py-2
                          text-sm
                          transition-colors
                          hover:bg-accent
                        "
                      >
                        <img
                          src={category.image.url}
                          alt={category.image.name}
                          className="h-6 w-6 object-cover"
                        />

                        <span>{category.name}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No categories found
                  </li>
                )}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <InputGroup className="rounded-none">
          <InputGroupAddon align="inline-start" className="pl-3 pr-1">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>

          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
          />

          {query && (
            <InputGroupAddon align="inline-end" className="pr-1">
              <InputGroupButton
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={handleClear}
                aria-label="Clear search"
              >
                <X className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          )}

          {!query && (
            <InputGroupAddon align="inline-end" className="pr-1">
              <InputGroupButton
                type="submit"
                size="icon-xs"
                variant="ghost"
                aria-label="Search"
              >
                <Search className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </form>
    </div>
  );
}
