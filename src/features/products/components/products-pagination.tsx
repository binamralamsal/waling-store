import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { allProductsOptions } from "../products.queries";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination";

const routeAPI = getRouteApi("/_main/shop");

export function ProductsPagination() {
  const searchParams = routeAPI.useSearch();
  const {
    data: {
      pagination: { currentPage, totalPages },
    },
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
  const paginationRange = generatePagination(currentPage, totalPages, 5);

  if (totalPages === 1) return null;

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              to="/shop"
              search={{ ...searchParams, page: Math.max(1, currentPage - 1) }}
            />
          </PaginationItem>
        )}
        {paginationRange.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              to="/shop"
              search={{ ...searchParams, page }}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > (paginationRange[paginationRange.length - 1] || 1) && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              to="/shop"
              search={{ ...searchParams, page: currentPage + 1 }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

function generatePagination(
  currentPage: number,
  totalPages: number,
  maxPages = 10,
) {
  let startPage, endPage;

  if (maxPages > totalPages) {
    maxPages = totalPages;
  }

  const halfWindow = Math.floor(maxPages / 2);

  if (currentPage <= halfWindow) {
    startPage = 1;
    endPage = Math.min(totalPages, maxPages);
  } else if (currentPage > totalPages - halfWindow) {
    startPage = totalPages - maxPages + 1;
    endPage = totalPages;
  } else {
    startPage = currentPage - halfWindow;
    endPage = currentPage + halfWindow - 1;
  }

  if (startPage < 1) {
    startPage = 1;
  }
  if (endPage > totalPages) {
    endPage = totalPages;
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}
