import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import { DataTable } from "#/components/data-table/data-table";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { categoriesTableColumns } from "#/features/products/components/categories-table-columns";
import { allCategoriesOptions } from "#/features/products/products.queries";
import { getAllCategoriesSchema } from "#/features/products/products.schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/product-categories")({
  component: RouteComponent,
  validateSearch: getAllCategoriesSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(allCategoriesOptions({ values: search }));
  },
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  const { data, isPending } = useQuery(
    allCategoriesOptions({ values: searchParams }),
  );

  return (
    <AdminPageWrapper pageTitle="All Categories">
      <Card className="container px-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">Categories</CardTitle>
            <CardDescription>
              <p>Here are the list of product categories</p>
            </CardDescription>
          </div>
          <Button
            nativeButton={false}
            render={<Link to="/admin/product-categories/new">Add new</Link>}
          />
        </CardHeader>
        <CardContent>
          <DataTable
            columns={categoriesTableColumns}
            data={data?.categories || []}
            isLoading={isPending}
            options={{
              pageCount: data?.pagination.totalPages,
              initialState: {
                columnVisibility: { updatedAt: false },
                sorting: Object.entries(searchParams.sort).map(
                  ([key, value]) => ({
                    desc: value === "desc",
                    id: key,
                  }),
                ),
              },
            }}
            skeletonColumnWidths={["9%", "30%", "30%", "20%"]}
          />
        </CardContent>
      </Card>
    </AdminPageWrapper>
  );
}
