import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const establishments = sqliteTable("establishments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("Supermercado"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull().default("Feijó"),
  state: text("state").notNull().default("AC"),
  phone: text("phone"),
  brandColor: text("brand_color").notNull().default("#1473E6"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(true),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_establishments_slug").on(table.slug)]);

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  size: text("size").notNull(),
  unit: text("unit").notNull(),
  barcode: text("barcode"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_products_slug").on(table.slug),
  index("idx_products_search").on(table.normalizedName, table.category),
]);

export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => products.id),
  establishmentId: integer("establishment_id").notNull().references(() => establishments.id),
  value: real("value").notNull(),
  previousValue: real("previous_value"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(true),
  capturedAt: text("captured_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_prices_product_value").on(table.productId, table.value),
  index("idx_prices_establishment").on(table.establishmentId),
]);

export const userActions = sqliteTable("user_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: text("payload").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_user_action_unique").on(table.userId, table.action, table.entityType, table.entityId),
  index("idx_user_actions_user").on(table.userId, table.createdAt),
]);
