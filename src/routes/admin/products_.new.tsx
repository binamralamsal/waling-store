import { ProductForm } from "#/features/products/components/product-form";
import { allCategoriesOptions } from "#/features/products/products.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products_/new")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(
      allCategoriesOptions({ values: { page: 1, pageSize: 1000 } }),
    );
  },
});

function RouteComponent() {
  const {
    data: { categories },
  } = useSuspenseQuery(
    allCategoriesOptions({ values: { page: 1, pageSize: 1000 } }),
  );

  return <ProductForm categories={categories} />;
}
