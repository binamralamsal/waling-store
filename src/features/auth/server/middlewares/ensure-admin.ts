import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

import { getCurrentUserFn } from "../functions/user";

export const ensureAdmin = createMiddleware().server(async ({ next }) => {
  const auth = await getCurrentUserFn();
  if (!auth || auth.user.role !== "admin") throw redirect({ to: "/" });

  return next({ context: { auth } });
});
