import z from "zod";
import { GalleryVerticalEndIcon } from "lucide-react";

import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { LoginForm } from "@/features/auth/components/login-form";
import { currentUserSessionOptions } from "#/features/auth/auth.queries";

export const Route = createFileRoute("/_main/login")({
  component: RouteComponent,
  validateSearch: z.object({
    redirect_url: z.string().startsWith("/").optional().catch(undefined),
  }),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      currentUserSessionOptions(),
    );
    if (session) throw redirect({ to: "/" });
  },
});

function RouteComponent() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Waling Store
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
