import { ArrowLeftIcon } from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import { Button } from "#/components/ui/button";

import { ProductForm } from "#/features/products/components/product-form";
import {
  allCategoriesOptions,
  productByIdOptions,
} from "#/features/products/products.queries";

export const Route = createFileRoute("/admin/products_/$id/edit")({
  component: RouteComponent,

  loader: async ({ context: { queryClient }, params: { id } }) => {
    await queryClient.prefetchQuery(
      allCategoriesOptions({
        values: {
          page: 1,
          pageSize: 1000,
        },
      }),
    );

    await queryClient.ensureQueryData(
      productByIdOptions({
        id: Number(id),
      }),
    );
  },
  notFoundComponent: () => <ProductNotFound />,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const productId = Number(id);

  const { data: product } = useSuspenseQuery(
    productByIdOptions({
      id: productId,
    }),
  );

  const {
    data: { categories },
  } = useSuspenseQuery(
    allCategoriesOptions({
      values: {
        page: 1,
        pageSize: 1000,
      },
    }),
  );

  return (
    <ProductForm
      id={product.id}
      categories={categories}
      images={product.images}
      defaultValues={{
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images.map((image) => image.id),
        price: product.price,
        salePrice: product.salePrice,
        unit: product.unit,
        status: product.status,
        categoryId: product.category?.id ?? null,
      }}
    />
  );
}

function ProductNotFound() {
  return (
    <AdminPageWrapper
      pageTitle="Edit Product"
      breadcrumbs={[
        {
          label: "All Products",
          href: "/admin/products",
        },
      ]}
    >
      <div className="grid min-h-[80vh] place-items-center px-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Product Not Found
            </h1>

            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the product you&apos;re looking for.
              It may have been deleted or never existed.
            </p>
          </div>

          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link to="/admin/products">
                <ArrowLeftIcon size={16} />
                Back to Products
              </Link>
            }
          />
        </div>
      </div>
    </AdminPageWrapper>
  );
}
