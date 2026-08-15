import { useEffect, useId, useState } from "react";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { allCategoriesOptions } from "../products.queries";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const routeAPI = getRouteApi("/_main/shop");

export function CategoriesFilter() {
  const id = useId();
  const searchParams = routeAPI.useSearch();
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.categories,
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

  useEffect(() => {
    setSelectedCategories(searchParams.categories);
  }, [searchParams.categories]);

  function updateURLWithCategories(updatedCategories: string[]) {
    navigate({
      to: "/shop",
      search: {
        ...searchParams,
        categories: updatedCategories,
      },
      resetScroll: false,
    });
  }

  function handleCategoryToggle(categorySlug: string, isChecked: boolean) {
    if (typeof isChecked !== "boolean") return;

    const updatedCategories = isChecked
      ? [...selectedCategories, categorySlug]
      : selectedCategories.filter((slug) => slug !== categorySlug);

    setSelectedCategories(updatedCategories);
    updateURLWithCategories(updatedCategories);
  }

  function handleAllProductsToggle(isChecked: boolean) {
    if (isChecked !== true) return;

    setSelectedCategories([]);
    updateURLWithCategories([]);
  }

  return (
    <AccordionItem
      value="category"
      className="border-b border-border last:border-b-0"
    >
      <AccordionTrigger
        className="
          py-4
          text-sm font-medium
          hover:no-underline
        "
      >
        Category
      </AccordionTrigger>

      <AccordionContent className="pb-5">
        <ul className="space-y-1">
          {/* All products */}
          <li>
            <label
              htmlFor={`${id}-all`}
              className="
                flex cursor-pointer items-center gap-3
                py-1.5
                text-sm
                text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              <Checkbox
                id={`${id}-all`}
                checked={selectedCategories.length === 0}
                onCheckedChange={handleAllProductsToggle}
                className="size-4"
              />

              <span>All Products</span>
            </label>
          </li>

          {categories.map(({ id: categoryId, name, slug }) => (
            <li key={categoryId}>
              <label
                htmlFor={`${id}-${slug}`}
                className="
                  flex cursor-pointer items-center gap-3
                  py-1.5
                  text-sm
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
              >
                <Checkbox
                  id={`${id}-${slug}`}
                  checked={selectedCategories.includes(slug)}
                  onCheckedChange={(isChecked) =>
                    handleCategoryToggle(slug, isChecked)
                  }
                  className="size-4"
                />

                <span>{name}</span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
