import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AdminPageWrapper pageTitle="Orders">
      <></>
    </AdminPageWrapper>
  );
}
