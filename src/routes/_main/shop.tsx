import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/shop")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_main/shop"!</div>;
}
