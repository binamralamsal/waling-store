import pg from "pg";
import { z } from "zod";

import { createServerFn } from "@tanstack/react-start";

import { categorySchema, getAllCategoriesSchema } from "../../products.schema";

import { db } from "@/config/db";
import { ensureAdmin } from "@/features/auth/server/middlewares/ensure-admin";
import { jsonObjectFrom } from "kysely/helpers/postgres";

const { DatabaseError } = pg;

export const saveCategoryFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.object({ values: categorySchema, id: z.number().optional() }))
  .handler(async ({ data }) => {
    try {
      if (data.id) {
        await db
          .updateTable("categories")
          .set(data.values)
          .where("categories.id", "=", data.id)
          .execute();
        return { status: "SUCCESS", message: "Updated category successfully!" };
      } else {
        await db.insertInto("categories").values(data.values).execute();
        return { status: "SUCCESS", message: "Created category successfully!" };
      }
    } catch (err) {
      if (err instanceof DatabaseError && err.code === "23505") {
        return {
          status: "ERROR",
          message:
            "A category with this slug already exists. Please try a different slug.",
        };
      }

      return {
        status: "ERROR",
        message: "Internal server error occured while creating category!",
      };
    }
  });

export const getAllCategoriesFn = createServerFn({ method: "GET" })
  .validator(getAllCategoriesSchema)
  .handler(async ({ data }) => {
    const { sort, page, pageSize, search } = data;

    function createBaseQuery() {
      let query = db.selectFrom("categories");

      if (search?.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb.or([
            eb("categories.name", "ilike", searchTerm),
            eb("categories.slug", "ilike", searchTerm),
          ]),
        );
      }

      return query;
    }

    let categoriesQuery = createBaseQuery()
      .select(["id", "name", "slug", "createdAt", "updatedAt"])
      .select((eb) =>
        jsonObjectFrom(
          eb
            .selectFrom("uploadedFiles")
            .select([
              "uploadedFiles.id",
              "uploadedFiles.name",
              "uploadedFiles.fileType",
              "uploadedFiles.url",
              "uploadedFiles.uploadedAt",
            ])
            .whereRef("uploadedFiles.id", "=", "categories.imageId"),
        )
          .$notNull()
          .as("image"),
      );

    Object.entries(sort).forEach(([column, direction]) => {
      if (Object.keys(sort).includes(column))
        categoriesQuery = categoriesQuery.orderBy(
          column as keyof typeof sort,
          direction,
        );
    });

    const offset = Math.max(0, (page - 1) * pageSize);
    categoriesQuery = categoriesQuery.limit(pageSize).offset(offset);

    const countQuery = createBaseQuery().select(db.fn.countAll().as("count"));

    const [categories, countResult] = await Promise.all([
      categoriesQuery.execute(),
      countQuery.executeTakeFirst(),
    ]);

    const totalCount = Number(countResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      categories,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: totalCount,
        totalPages,
      },
    };
  });

export const getCategoryByIdFn = createServerFn({ method: "GET" })
  .validator(z.number().int().positive())
  .handler(async ({ data }) => {
    const result = await db
      .selectFrom("categories")
      .selectAll()
      .select((eb) =>
        jsonObjectFrom(
          eb
            .selectFrom("uploadedFiles")
            .select([
              "uploadedFiles.id",
              "uploadedFiles.name",
              "uploadedFiles.fileType",
              "uploadedFiles.url",
              "uploadedFiles.uploadedAt",
            ])
            .whereRef("uploadedFiles.id", "=", "categories.imageId"),
        )
          .$notNull()
          .as("image"),
      )
      .where("id", "=", data)
      .executeTakeFirst();

    return result;
  });

export const deleteCategoryFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.number().int())
  .handler(async ({ data }) => {
    await db
      .deleteFrom("categories")
      .where("categories.id", "=", data)
      .execute();

    return { status: "SUCCESS", message: "Deleted category successfully!" };
  });
