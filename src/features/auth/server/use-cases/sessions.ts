import crypto from "node:crypto";

import { deleteCookie, setCookie } from "@tanstack/react-start/server";

import { getCurrentLocation } from "./location";

import { db } from "@/config/db";
import {
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME,
  SESSION_REFRESH_TIME,
} from "@/config/constants";

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex").normalize();
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex").normalize();
}

interface CreateSessionData {
  token: string;
  userId: number;
  userAgent: string;
  ip: string;
}
export async function createSession({
  ip,
  userAgent,
  userId,
  token,
}: CreateSessionData) {
  const sessionId = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME);

  const location = await getCurrentLocation();

  const session = await db
    .insertInto("sessions")
    .values({
      ip,
      userAgent,
      userId,
      id: sessionId,
      expiresAt: expiresAt,
      city: location.city,
      region: location.region,
      country: location.country,
    })
    .returning([
      "id",
      "ip",
      "userAgent",
      "userId",
      "expiresAt",
      "createdAt",
      "updatedAt",
    ])
    .executeTakeFirst();

  return session;
}

export async function validateSessionToken(token: string) {
  const sessionId = hashToken(token);

  const session = await db
    .selectFrom("sessions")
    .selectAll()
    .where("id", "=", sessionId)
    .executeTakeFirst();

  if (!session) {
    return null;
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.deleteFrom("sessions").where("id", "=", sessionId).execute();
    return null;
  }
  if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_TIME) {
    await db
      .updateTable("sessions")
      .where("id", "=", sessionId)
      .set({
        expiresAt: new Date(Date.now() + SESSION_LIFETIME),
      })
      .execute();
  }

  return session;
}

export async function invalidateSession(sessionId: string) {
  await db.deleteFrom("sessions").where("id", "=", sessionId).execute();
}

export async function invalidateAllSessions(userId: number) {
  await db.deleteFrom("sessions").where("userId", "=", userId).execute();
}

export const sessionCookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: SESSION_LIFETIME,
} as const;

export function setSessionTokenCookie(token: string) {
  setCookie(SESSION_COOKIE_NAME, token, sessionCookieConfig);
}

export function deleteSessionTokenCookie() {
  deleteCookie(SESSION_COOKIE_NAME, sessionCookieConfig);
}
