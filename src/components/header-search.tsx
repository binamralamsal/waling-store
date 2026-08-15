import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";

import { Skeleton } from "#/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
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

  const { data, isPending } = useQuery(
    allCategoriesOptions({ values: { page: 1, pageSize: 10 } }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    if (!query.trim()) return;

    e.preventDefault();
    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        q: query.trim(),
      }),
    });
  };

  return (
    <div className="grid grid-cols-[1fr_3.5fr] gap-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
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
                        })}
                        className="hover:bg-accent flex items-center gap-3 px-3 py-2 text-sm transition-colors"
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
                  <li className="text-muted-foreground px-3 py-2 text-sm">
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
          <InputGroupAddon
            align="inline-start"
            className="pr-0"
          ></InputGroupAddon>

          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
          />

          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" size="icon-xs" variant="ghost">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
