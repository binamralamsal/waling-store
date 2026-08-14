import { currentUserSessionOptions } from "#/features/auth/auth.queries";
import { RegisterForm } from "#/features/auth/components/register-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { GalleryVerticalEndIcon } from "lucide-react";
import z from "zod";

export const Route = createFileRoute("/_main/signup")({
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
        <RegisterForm />
      </div>
    </div>
  );
}
