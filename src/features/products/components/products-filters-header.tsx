import { X } from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { allCategoriesOptions, allProductsOptions } from "../products.queries";

const routeAPI = getRouteApi("/_main/shop");

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Size = {
  id: number;
  name: string;
  slug: string;
};

type Color = {
  id: number;
  name: string;
  color: string;
  slug: string;
};

export function ProductsFiltersHeader() {
  const searchParams = routeAPI.useSearch();
  const navigate = routeAPI.useNavigate();

  const {
    data: { products },
  } = useSuspenseQuery(
    allProductsOptions({
      values: {
        categories: searchParams.categories,
        priceRange: searchParams.priceRange,
        page: searchParams.page,
        search: searchParams.query,
        status: ["published"],
      },
    }),
  );

  const {
    data: { categories },
  } = useSuspenseQuery(
    allCategoriesOptions({
      values: {
        page: 1,
        pageSize: 20,
      },
    }),
  );

  const appliedQuery = searchParams.query;
  const appliedCategories = searchParams.categories;
  const appliedPrice = searchParams.priceRange;

  const hasFilters =
    Boolean(appliedQuery) ||
    appliedCategories.length > 0 ||
    Boolean(appliedPrice);

  function getNameFromSlug(
    slug: string,
    items: Array<Category | Size | Color>,
  ) {
    return items.find((item) => item.slug === slug)?.name || slug;
  }

  function removeFilter(
    type: "query" | "categories" | "priceRange",
    value?: string,
  ) {
    const params = {
      ...searchParams,
      page: 1,
    };

    if (type === "query") {
      delete params.query;
    } else if (value) {
      const values = (params[type] || []).filter((v) => v !== value);

      if (values.length) {
        // @ts-expect-error -- Type depends on the filter type.
        params[type] = values;
      } else {
        delete params[type];
      }
    } else {
      delete params[type];
    }

    navigate({
      to: ".",
      search: params,
      resetScroll: false,
    });
  }

  function clearAllFilters() {
    navigate({
      to: ".",
      search: {},
      resetScroll: false,
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "result" : "results"}
        </p>

        {!hasFilters && (
          <span className="text-xs text-muted-foreground">All products</span>
        )}
      </div>

      <div
        className="flex min-h-8 flex-wrap items-center gap-2 pt-1"
        aria-live="polite"
      >
        {hasFilters ? (
          <>
            <span className="mr-1 text-sm text-muted-foreground">
              Filtering by:
            </span>

            {appliedQuery && (
              <FilterChip
                label={`“${appliedQuery}”`}
                onRemove={() => removeFilter("query")}
              />
            )}

            {appliedCategories.map((slug) => (
              <FilterChip
                key={`category-${slug}`}
                label={getNameFromSlug(slug, categories)}
                onRemove={() => removeFilter("categories", slug)}
              />
            ))}

            {appliedPrice && (
              <FilterChip
                label={`Rs. ${appliedPrice[0].toLocaleString()} – Rs. ${appliedPrice[1].toLocaleString()}`}
                onRemove={() => removeFilter("priceRange")}
              />
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="
                ml-1
                text-sm font-medium
                underline underline-offset-4
                transition-colors
                hover:text-muted-foreground
              "
            >
              Clear all
            </button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Showing all products
          </span>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className="
        inline-flex items-center gap-2
        rounded-full
        bg-secondary
        px-3 py-1.5
        text-xs
      "
    >
      <span>{label}</span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="
          flex size-4 items-center justify-center
          rounded-full
          transition-colors
          hover:bg-background
        "
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
