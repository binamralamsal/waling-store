import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AdminPageWrapper pageTitle="Home">
      <></>
    </AdminPageWrapper>
  );
}
