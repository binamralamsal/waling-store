import { ProductCard } from "#/features/products/components/product-card";
import { ProductsFilters } from "#/features/products/components/products-filters";
import { ProductsFiltersHeader } from "#/features/products/components/products-filters-header";
import { ProductsPagination } from "#/features/products/components/products-pagination";
import {
  allCategoriesOptions,
  allProductsOptions,
} from "#/features/products/products.queries";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import z, { string } from "zod";

export const Route = createFileRoute("/_main/shop")({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.number().int().min(1).optional().default(1).catch(1),
    categories: z.array(z.string()).optional().default([]).catch([]),
    accordion: z
      .array(z.enum(["category", "price"]))
      .optional()
      .default(["category", "price"])
      .catch(["category", "price"]),
    priceRange: z
      .tuple([z.number(), z.number()])
      .optional()
      .refine((val) => (val ? val[0] < val[1] : true), {
        message: "priceRange must be a tuple [number, number] with min < max",
      })
      .catch(undefined),
    query: z
      .string()
      .transform((v) => (v.trim().length === 0 ? undefined : v.trim()))
      .optional()
      .catch(undefined),
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    categories: search.categories,
    priceRange: search.priceRange,
    query: search.query,
  }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(
      allProductsOptions({
        values: {
          categories: deps.categories,
          priceRange: deps.priceRange,
          page: deps.page,
          search: deps.query,
          status: ["published"],
        },
      }),
    );

    await queryClient.ensureQueryData(
      allCategoriesOptions({ values: { page: 1, pageSize: 20 } }),
    );
  },
});

function RouteComponent() {
  const searchParams = Route.useSearch();
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

  return (
    <main>
      <section className="py-14 md:py-16 container grid  border-b border-border">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
          The market
        </p>
        <h1 className="font-serif text-5xl">Shop all</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Fresh food and everyday essentials, gathered from people we trust.
        </p>
      </section>

      <section className="container my-8 grid gap-6 md:my-12 md:grid-cols-2 lg:my-16 lg:grid-cols-[300px_1fr] lg:gap-12">
        <aside>
          <div className="lg:sticky lg:top-20">
            <ProductsFilters />
          </div>
        </aside>
        <div className="space-y-8">
          <ProductsFiltersHeader />

          <div className="grid gap-6 md:grid-cols-1 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                category={product.category?.name ?? null}
                slug={product.slug}
                price={product.price}
                salePrice={product.salePrice}
                images={product.images}
              />
            ))}
          </div>

          <ProductsPagination />
        </div>
      </section>
    </main>
  );
}
