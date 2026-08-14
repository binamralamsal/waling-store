import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DatabaseError } from "pg";
import { UAParser } from "ua-parser-js";
import { z } from "zod";

import { createServerFn } from "@tanstack/react-start";

import {
  getAllUsersSchema,
  newPasswordSchema,
  newUserSchema,
  updateUserSchema,
} from "../../auth.schema";
import { ensureAdmin } from "../middlewares/ensure-admin";
import { hashPassword } from "../use-cases/password";
import { invalidateSession } from "../use-cases/sessions";

import { db } from "@/config/db";

export const getAllUsersFn = createServerFn({ method: "GET" })
  .validator(getAllUsersSchema)
  .middleware([ensureAdmin])
  .handler(async ({ data }) => {
    const { sort, page, pageSize, search, role } = data;

    function createBaseQuery() {
      let query = db
        .selectFrom("users")
        .innerJoin("emails", "emails.userId", "users.id");

      if (search?.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb.or([
            eb("users.name", "ilike", searchTerm),
            eb("emails.email", "ilike", searchTerm),
          ]),
        );
      }

      if (role.length > 0) {
        query = query.where("users.role", "in", role);
      }

      return query;
    }

    let usersQuery = createBaseQuery().select([
      "users.id",
      "users.name",
      "users.role",
      "users.createdAt",
      "users.updatedAt",
      "emails.email",
    ]);

    Object.entries(sort).forEach(([column, direction]) => {
      if (column === "email") {
        usersQuery = usersQuery.orderBy("emails.email", direction);
      } else {
        const columnName = `users.${column}` as Exclude<
          keyof (typeof data)["sort"],
          "email"
        >;
        usersQuery = usersQuery.orderBy(columnName, direction);
      }
    });

    const offset = Math.max(0, (page - 1) * pageSize);
    usersQuery = usersQuery.limit(pageSize).offset(offset);

    const countQuery = createBaseQuery().select(db.fn.countAll().as("count"));

    const [users, countResult] = await Promise.all([
      usersQuery.execute(),
      countQuery.executeTakeFirst(),
    ]);

    const totalCount = Number(countResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      users,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: totalCount,
        totalPages,
      },
    };
  });

export const deleteUserFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.number().int())
  .handler(async ({ data }) => {
    await db.deleteFrom("users").where("users.id", "=", data).execute();

    return { status: "SUCCESS", message: "Deleted user successfully!" };
  });

export const terminateSessionFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.string())
  .handler(async ({ data }) => {
    await invalidateSession(data);

    return { status: "SUCCESS", message: "Terminated the given user session!" };
  });

export const createUserFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(newUserSchema)
  .handler(async ({ data }) => {
    const hashedPassword = await hashPassword(data.password);

    try {
      await db.transaction().execute(async (trx) => {
        const { id: userId } = await trx
          .insertInto("users")
          .values({
            name: data.name,
            password: hashedPassword,
            role: data.role,
          })
          .returning(["id"])
          .executeTakeFirstOrThrow();
        await trx
          .insertInto("emails")
          .values({ userId, email: data.email })
          .executeTakeFirstOrThrow();
      });
    } catch (err) {
      if (err instanceof DatabaseError && err.code === "23505") {
        return {
          status: "ERROR",
          message:
            "A user with this email address already exists. Please try a different email.",
        };
      }

      return {
        status: "ERROR",
        message: "Internal server error occured while creating user!",
      };
    }

    return { status: "SUCCESS", message: "User created successfully!" };
  });

export const getUserFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.number().int())
  .handler(async ({ data, context: { auth } }) => {
    const user = await db
      .selectFrom("users")
      .innerJoin("emails", "emails.userId", "users.id")
      .select((eb) => [
        "users.id",
        "users.name",
        "users.role",
        "emails.email",
        jsonArrayFrom(
          eb
            .selectFrom("sessions")
            .select([
              "sessions.id",
              "sessions.userAgent",
              "sessions.ip",
              "sessions.country",
              "sessions.region",
              "sessions.city",
            ])
            .whereRef("sessions.userId", "=", "users.id")
            .orderBy("sessions.createdAt", "desc"),
        ).as("sessions"),
      ])
      .where("users.id", "=", data)
      .executeTakeFirst();

    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      sessions: user.sessions.map((session) => {
        const { browser, os } = UAParser(session.userAgent);

        return {
          id: session.id,
          ip: session.ip,
          userAgent: session.userAgent,
          isCurrent: session.id === auth.session.id,
          browser: browser.name,
          os: os.name,
          country: session.country,
          region: session.region,
          city: session.city,
        };
      }),
    };
  });

export const updateUserFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(
    z.object({
      id: z.number().int(),
      data: updateUserSchema,
    }),
  )
  .handler(async ({ data }) => {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("users")
        .set({ name: data.data.name, role: data.data.role })
        .where("users.id", "=", data.id)
        .execute();

      await trx
        .updateTable("emails")
        .set({ email: data.data.email })
        .where("emails.userId", "=", data.id)
        .execute();
    });

    return { status: "SUCCESS", message: "User updated successfully!" };
  });

export const changeUserPasswordFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.object({ id: z.number().int(), newPassword: newPasswordSchema }))
  .handler(async ({ data }) => {
    const hashedPassword = await hashPassword(data.newPassword);

    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("users")
        .set({ password: hashedPassword })
        .where("users.id", "=", data.id)
        .execute();

      await trx
        .deleteFrom("sessions")
        .where("sessions.userId", "=", data.id)
        .execute();
    });

    return {
      status: "SUCCESS",
      message: "User password updated successfully!",
    };
  });
