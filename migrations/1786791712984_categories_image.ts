import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("categories")
    .addColumn("image_id", "integer", (col) =>
      col
        .notNull()
        .references("uploaded_files.id")
        .onDelete("restrict")
        .onUpdate("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("categories").dropColumn("image_id").execute();
}
