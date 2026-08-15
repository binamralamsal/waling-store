import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import { Button } from "#/components/ui/button";
import { CategoryForm } from "#/features/products/components/category-form";
import { categoryByIdOptions } from "#/features/products/products.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

export const Route = createFileRoute("/admin/product-categories_/$id/edit")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const data = await queryClient.ensureQueryData(
      categoryByIdOptions({ id: parseInt(id) }),
    );

    if (!data) throw notFound();
  },
  notFoundComponent: () => <CategoryNotFound />,
});

function RouteComponent() {
  const params = Route.useParams();
  const id = parseInt(params.id);
  const { data: category } = useSuspenseQuery(categoryByIdOptions({ id }));
  if (!category) return <CategoryNotFound />;

  return (
    <CategoryForm
      defaultValues={category}
      id={category.id}
      image={category.image}
    />
  );
}

function CategoryNotFound() {
  return (
    <AdminPageWrapper
      pageTitle="Edit Category"
      breadcrumbs={[
        { label: "All Categories", href: "/admin/product-categories" },
      ]}
    >
      <div className="grid min-h-[80vh] place-items-center px-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Category Not Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sorry, we couldn&apos;t find the category you&apos;re looking for.
              It may have been deleted or never existed.
            </p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link to="/admin/product-categories">
                <ArrowLeftIcon size={16} />
                Back to Categories
              </Link>
            }
          />
        </div>
      </div>
    </AdminPageWrapper>
  );
}
