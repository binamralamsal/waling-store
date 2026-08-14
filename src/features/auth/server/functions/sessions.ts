import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from "../use-cases/sessions";

import { SESSION_COOKIE_NAME } from "@/config/constants";

export const getCurrentSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getCookie(SESSION_COOKIE_NAME);
    if (!token) return null;

    const result = await validateSessionToken(token);
    if (!result) deleteSessionTokenCookie();
    else setSessionTokenCookie(token);

    return result;
  },
);
