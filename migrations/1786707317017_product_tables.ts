import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("product_status")
    .asEnum(["draft", "published", "archived"])
    .execute();

  await db.schema
    .createTable("categories")
    .addColumn("id", "integer", (col) =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("uploaded_files")
    .addColumn("id", "integer", (col) =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("file_type", "text", (col) => col.notNull())
    .addColumn("uploaded_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await db.schema
    .createTable("products")
    .addColumn("id", "integer", (col) =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("price", "integer", (col) => col.notNull())
    .addColumn("sale_price", "integer")
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("unit", "text", (col) => col.notNull())
    .addColumn("status", sql`product_status`, (col) =>
      col.defaultTo("draft").notNull(),
    )
    .addColumn("category_id", "integer", (col) =>
      col.references("categories.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("product_files")
    .addColumn("product_id", "integer", (col) =>
      col
        .notNull()
        .references("products.id")
        .onDelete("cascade")
        .onUpdate("cascade"),
    )
    .addColumn("file_id", "integer", (col) =>
      col
        .notNull()
        .references("uploaded_files.id")
        .onDelete("cascade")
        .onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("product_files_pk", ["product_id", "file_id"])
    .execute();

  await db.schema
    .createTable("contact_entries")
    .addColumn("id", "integer", (col) =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("phone", "text", (col) => col.notNull())
    .addColumn("message", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_contact_entries_updated_at
    BEFORE UPDATE ON contact_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("contact_entries").ifExists().execute();
  await db.schema.dropTable("product_files").ifExists().execute();
  await db.schema.dropTable("products").ifExists().execute();
  await db.schema.dropTable("uploaded_files").ifExists().execute();
  await db.schema.dropTable("categories").ifExists().execute();
  await db.schema.dropType("product_status").ifExists().execute();
}
