import { NotFound } from "#/components/not-found";
import { SiteHeader } from "#/components/site-header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
  notFoundComponent: () => <NotFound />,
});

function RouteComponent() {
  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  );
}
