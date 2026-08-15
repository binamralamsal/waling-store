import { CategoryForm } from "#/features/products/components/category-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/product-categories_/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryForm />;
}
