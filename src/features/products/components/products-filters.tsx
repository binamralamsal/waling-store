import { useEffect, useState } from "react";

import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { Accordion } from "@/components/ui/accordion";

import { CategoriesFilter } from "#/features/products/components/categories-filter";
import { PriceRangeFilter } from "#/features/products/components/price-range-filter";
import { ProductsSearchFilter } from "./products-search-filter";

const routeAPI = getRouteApi("/_main/shop");

export function ProductsFilters() {
  const searchParams = routeAPI.useSearch();

  const [openedAccordions, setOpenedAccordions] = useState(
    searchParams.accordion,
  );

  const navigate = useNavigate();

  useEffect(() => {
    setOpenedAccordions(searchParams.accordion);
  }, [searchParams.accordion]);

  const handleChange = (newOpenItems: string[]) => {
    setOpenedAccordions(newOpenItems as ("category" | "price")[]);

    navigate({
      to: "/shop",
      search: {
        ...searchParams,
        accordion: newOpenItems as ("category" | "price")[],
      },
      resetScroll: false,
    });
  };

  return (
    <div className="w-full">
      <ProductsSearchFilter />

      <Accordion
        multiple
        value={openedAccordions}
        onValueChange={handleChange}
        className="w-full"
      >
        <CategoriesFilter />
        <PriceRangeFilter />
      </Accordion>
    </div>
  );
}
