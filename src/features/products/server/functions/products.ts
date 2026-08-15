import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import pg from "pg";
import { z } from "zod";

import { createServerFn } from "@tanstack/react-start";

import { getAllProductsSchema, productSchema } from "../../products.schema";

import { db } from "@/config/db";
import { ensureAdmin } from "@/features/auth/server/middlewares/ensure-admin";

const { DatabaseError } = pg;

export const saveProductFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.object({ values: productSchema, id: z.number().optional() }))
  .handler(async ({ data }) => {
    const {
      values: { images, ...values },
      id,
    } = data;
    try {
      if (id) {
        await db.transaction().execute(async (trx) => {
          await trx
            .updateTable("products")
            .where("id", "=", id)
            .set(values)
            .executeTakeFirstOrThrow();

          await trx
            .deleteFrom("productFiles")
            .where("productId", "=", id)
            .where("fileId", "not in", images)
            .executeTakeFirstOrThrow();

          await trx
            .insertInto("productFiles")
            .values(images.map((i) => ({ fileId: i, productId: id })))
            .onConflict((oc) => oc.columns(["fileId", "productId"]).doNothing())
            .executeTakeFirstOrThrow();
        });

        return { status: "SUCCESS", message: "Updated product successfully!" };
      } else {
        await db.transaction().execute(async (trx) => {
          const product = await trx
            .insertInto("products")
            .values(values)
            .returning("id")
            .executeTakeFirstOrThrow();

          const productFilesData = images.map((imageId) => ({
            productId: product.id,
            fileId: imageId,
          }));

          if (productFilesData.length > 0)
            await trx
              .insertInto("productFiles")
              .values(productFilesData)
              .executeTakeFirstOrThrow();
        });

        return { status: "SUCCESS", message: "Created product successfully!" };
      }
    } catch (err) {
      if (err instanceof DatabaseError && err.code === "23505") {
        return {
          status: "ERROR",
          message:
            "A product with this slug already exists. Please try a different slug.",
        };
      }

      return {
        status: "ERROR",
        message: "Internal server error occured while creating product!",
      };
    }
  });

function getProductBasicQuery() {
  return db
    .selectFrom("products as p")
    .leftJoin("categories", "categories.id", "p.categoryId")
    .select((eb) => [
      "p.id",
      "p.name",
      "p.price",
      "p.unit",
      "p.salePrice",
      "p.slug",
      "p.description",
      "p.unit",
      "p.status",
      "p.createdAt",
      "p.updatedAt",

      jsonObjectFrom(
        eb
          .selectFrom("categories as cat")
          .select(["cat.id", "cat.name", "cat.slug"])
          .whereRef("cat.id", "=", "p.categoryId")
          .limit(1),
      ).as("category"),

      jsonArrayFrom(
        eb
          .selectFrom("productFiles as pf")
          .innerJoin("uploadedFiles as uf", "pf.fileId", "uf.id")
          .select([
            "uf.id",
            "uf.name",
            "uf.url",
            "uf.fileType",
            "uf.uploadedAt",
          ])
          .whereRef("pf.productId", "=", "p.id")
          .orderBy("uf.id"),
      ).as("images"),
    ]);
}

export const getProductByIdFn = createServerFn({ method: "GET" })
  .validator(z.number().int().positive())
  .handler(async ({ data }) => {
    const result = await getProductBasicQuery()
      .where("p.id", "=", data)
      .executeTakeFirst();

    return result;
  });

export const getProductBySlugFn = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data }) => {
    const result = await getProductBasicQuery()
      .where("p.slug", "=", data)
      .executeTakeFirst();

    return result;
  });

export const getAllProductsFn = createServerFn({ method: "GET" })
  .validator(getAllProductsSchema)
  .handler(async ({ data }) => {
    const { sort, page, pageSize, search, status, categories, priceRange } =
      data;

    function createBaseQuery() {
      let query = getProductBasicQuery().groupBy(["p.id", "categories.name"]);

      if (search?.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb.or([
            eb("p.name", "ilike", searchTerm),
            eb("p.slug", "ilike", searchTerm),
          ]),
        );
      }

      if (status.length > 0) {
        query = query.where("p.status", "in", status);
      }

      if (categories.length > 0) {
        query = query.where("categories.slug", "in", categories);
      }

      if (priceRange) {
        query = query.where((eb) =>
          eb.or([
            eb.between("p.salePrice", priceRange[0], priceRange[1]),
            eb.between("p.price", priceRange[0], priceRange[1]),
          ]),
        );
      }

      return query;
    }

    let productsQuery = createBaseQuery();

    Object.entries(sort).forEach(([column, direction]) => {
      if (column === "category") {
        productsQuery = productsQuery.orderBy("categories.name", direction);
      } else {
        productsQuery = productsQuery.orderBy(
          `p.${column as Exclude<keyof (typeof data)["sort"], "category">}`,
          direction,
        );
      }
    });

    const offset = Math.max(0, (page - 1) * pageSize);
    productsQuery = productsQuery.limit(pageSize).offset(offset);

    const countQuery = createBaseQuery().select(db.fn.countAll().as("count"));

    const [products, countResult] = await Promise.all([
      productsQuery.execute(),
      countQuery.executeTakeFirst(),
    ]);

    const totalCount = Number(countResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      products,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: totalCount,
        totalPages,
      },
    };
  });

export const deleteProductFn = createServerFn()
  .middleware([ensureAdmin])
  .validator(z.number().int())
  .handler(async ({ data }) => {
    await db.deleteFrom("products").where("products.id", "=", data).execute();

    return { status: "SUCCESS", message: "Deleted product successfully!" };
  });
