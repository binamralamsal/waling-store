import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { loginUserSchema, registerUserSchema } from "../../auth.schema";
import { getIPAddress } from "../use-cases/location";
import { hashPassword, verifyPassword } from "../use-cases/password";
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  invalidateSession,
  setSessionTokenCookie,
} from "../use-cases/sessions";
import { getCurrentSessionFn } from "./sessions";

import { db } from "@/config/db";
import { getRequestHeader } from "@tanstack/react-start/server";

export const loginUserFn = createServerFn({ method: "POST" })
  .validator(loginUserSchema)
  .handler(async (ctx) => {
    const { email, password } = ctx.data;

    const user = await db
      .selectFrom("users")
      .innerJoin("emails", "emails.userId", "users.id")
      .select([
        "users.id as id",
        "users.name",
        "users.password",
        "users.role",
        "emails.email",
      ])
      .where("email", "=", email)
      .executeTakeFirst();

    const errorMessage = "Oops! Incorrect email or password. Please try again";

    if (!user) return { status: "ERROR", message: errorMessage };

    const isPasswordValid = await verifyPassword({
      hashedPassword: user.password,
      password,
    });

    if (!isPasswordValid) return { status: "ERROR", message: errorMessage };

    const ip = getIPAddress() || "0.0.0.0";
    const userAgent = getRequestHeader("user-agent");

    if (!userAgent)
      return { status: "ERROR", message: "Invalid Login Attempt" };

    const token = generateSessionToken();
    await createSession({ token, userId: user.id, ip, userAgent });

    setSessionTokenCookie(token);

    return { status: "SUCCESS", message: "Login successful" };
  });

export const registerUserFn = createServerFn({ method: "POST" })
  .validator(registerUserSchema)
  .handler(async (ctx) => {
    const { email, password, name } = ctx.data;

    const existingEmail = await db
      .selectFrom("emails")
      .select("email")
      .where("email", "=", email)
      .executeTakeFirst();

    if (existingEmail) {
      return {
        status: "ERROR",
        message: "An account with this email already exists.",
      };
    }

    const ip = getIPAddress() || "0.0.0.0";
    const userAgent = getRequestHeader("user-agent");

    if (!userAgent) {
      return {
        status: "ERROR",
        message: "Unable to complete registration",
      };
    }

    const hashedPassword = await hashPassword(password);

    const user = await db
      .insertInto("users")
      .values({
        name,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    await db
      .insertInto("emails")
      .values({
        email,
        userId: user.id,
      })
      .execute();

    const token = generateSessionToken();
    await createSession({ token, userId: user.id, ip, userAgent });
    setSessionTokenCookie(token);

    return {
      status: "SUCCESS",
      message: "Registration successful. Welcome!",
      userId: user.id,
    };
  });

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const currentSesion = await getCurrentSessionFn();
    if (!currentSesion) return null;

    const currentUser = await db
      .selectFrom("users")
      .innerJoin("emails", "emails.userId", "users.id")
      .select([
        "users.id",
        "users.name",
        "users.createdAt",
        "users.updatedAt",
        "users.role",
        "emails.email",
      ])
      .where("users.id", "=", currentSesion.userId)
      .executeTakeFirst();

    if (!currentUser) return null;

    return { session: currentSesion, user: currentUser };
  },
);

export const logoutUserFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const currentSesion = await getCurrentSessionFn();
    if (currentSesion) {
      await invalidateSession(currentSesion.id);
      deleteSessionTokenCookie();
    }

    throw redirect({ to: "/login", search: { redirect_url: "/admin" } });
  },
);
