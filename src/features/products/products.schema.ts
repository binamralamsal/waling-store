import { z } from "zod";

import { DATATABLE_PAGE_SIZE } from "#/config/constants";
import { coerceToNumberSchema } from "#/util/zod-coerce-to-number-schema";

const sortDirectionSchema = z.enum(["asc", "desc"]);

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      error: "Category name must be at least 2 characters long.",
    })
    .max(50, {
      error: "Category name must be less than 50 characters long.",
    })
    .regex(/^[a-zA-Z\s]*$/, {
      error: "Category name can only contain letters and spaces.",
    }),

  slug: z
    .string()
    .trim()
    .min(2, {
      error: "Slug must be at least 2 characters long.",
    })
    .max(50, {
      error: "Slug must be less than 50 characters long.",
    })
    .regex(/^[a-z0-9-]+$/, {
      error:
        "Slug can only contain lowercase letters, numbers, and hyphens. Spaces are not allowed.",
    }),
  imageId: z
    .number()
    .int({
      error: "Image that you uploaded is invalid.",
    })
    .positive({
      error: "Image that you uploaded is invalid.",
    }),
});

export type CategorySchema = z.infer<typeof categorySchema>;
export type CategorySchemaInput = z.input<typeof categorySchema>;

export const getAllCategoriesSchema = z.object({
  page: z.number().int().min(1).optional().default(1).catch(1),

  pageSize: z
    .number()
    .int()
    .min(5)
    .optional()
    .default(DATATABLE_PAGE_SIZE)
    .catch(DATATABLE_PAGE_SIZE),

  search: z.string().optional(),

  sort: z
    .partialRecord(
      z.enum(["id", "name", "slug", "createdAt", "updatedAt"]),
      sortDirectionSchema,
    )
    .default({ createdAt: "desc" })
    .catch({ createdAt: "desc" }),
});

export type GetAllCategoriesSchema = z.infer<typeof getAllCategoriesSchema>;

export const getAllProductsSchema = z.object({
  page: z.number().int().min(1).optional().default(1).catch(1),

  pageSize: z
    .number()
    .int()
    .min(5)
    .optional()
    .default(DATATABLE_PAGE_SIZE)
    .catch(DATATABLE_PAGE_SIZE),

  search: z.string().optional(),

  sort: z
    .partialRecord(
      z.enum([
        "id",
        "name",
        "slug",
        "price",
        "unit",
        "salePrice",
        "status",
        "category",
        "createdAt",
        "updatedAt",
      ]),
      sortDirectionSchema,
    )
    .default({ createdAt: "desc" })
    .catch({ createdAt: "desc" }),

  status: z
    .array(z.enum(["draft", "published", "archived"]))
    .optional()
    .default([])
    .catch([]),

  categories: z.array(z.string()).optional().default([]).catch([]),

  priceRange: z
    .tuple([z.number(), z.number()])
    .refine(([min, max]) => min < max, {
      error: "priceRange must be a tuple [number, number] with min < max",
    })
    .optional()
    .catch(undefined),
});

export type GetAllProductsSchema = z.infer<typeof getAllProductsSchema>;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, {
      error: "Product name must be at least 3 characters long.",
    })
    .max(255, {
      error: "Product name must be 255 characters or fewer.",
    })
    .describe("The name of the product."),

  slug: z
    .string()
    .trim()
    .min(2, {
      error: "Slug must be at least 2 characters long.",
    })
    .max(50, {
      error: "Slug must be less than 300 characters long.",
    })
    .regex(/^[a-z0-9-]+$/, {
      error:
        "Slug can only contain lowercase letters, numbers, and hyphens. Spaces are not allowed.",
    }),

  price: coerceToNumberSchema(
    z.number({
      error: (issue) =>
        issue.input === undefined
          ? "Price is required."
          : "Price must only include numbers or decimal.",
    }),
  ),

  salePrice: coerceToNumberSchema(
    z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? undefined
            : "Sale Price must only include numbers or decimal.",
      })
      .optional()
      .nullable()
      .default(null),
  ),

  unit: z.string().min(1, {
    error: "Unit is required.",
  }),

  description: z
    .string()
    .trim()
    .min(10, {
      error: "Description must be at least 10 characters long.",
    })
    .max(1000, {
      error: "Description must be 1000 characters or fewer.",
    })
    .describe("A brief description of the product."),

  status: z
    .enum(["draft", "published", "archived"], {
      error: "Status must be 'draft', 'published', or 'archived'.",
    })
    .default("draft")
    .describe("The current status of the product."),

  categoryId: z
    .number()
    .positive({
      error: "Category you entered is invalid.",
    })
    .int({
      error: "Category you entered is invalid.",
    })
    .nullable()
    .default(null)
    .describe("The category this product belongs to."),

  images: z
    .array(
      z
        .number()
        .positive({
          error: "Image that you uploaded is invalid.",
        })
        .int({
          error: "Image that you uploaded is invalid.",
        }),
    )
    .max(20, {
      error: "You can't upload more than twenty images.",
    })
    .describe("Images associated with the product."),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type ProductSchemaInput = z.input<typeof productSchema>;
