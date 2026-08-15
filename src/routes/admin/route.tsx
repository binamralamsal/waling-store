import { AdminSidebar } from "#/components/admin-sidebar";
import { NotFound } from "#/components/not-found";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { currentUserOptions } from "#/features/auth/auth.queries";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { ThemeProvider } from "next-themes";

const getSidebarStateFn = createServerFn({ method: "GET" }).handler(() => {
  const sidebarState = getCookie("sidebar_state");
  const defaultOpen = sidebarState ? sidebarState === "true" : true;

  return { defaultOpen };
});

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  beforeLoad: async ({ context, location: { pathname } }) => {
    const response =
      await context.queryClient.ensureQueryData(currentUserOptions());
    if (response && response.user.role !== "admin") throw redirect({ to: "/" });
    if (!response)
      throw redirect({ to: "/login", search: { redirect_url: pathname } });
  },
  notFoundComponent: () => <NotFound />,
  loader: async () => {
    return await getSidebarStateFn();
  },
});

function RouteComponent() {
  const { defaultOpen } = Route.useLoaderData();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AdminSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
