import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "archived",
]);

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  dateApplied: timestamp("date_applied", { mode: "date", withTimezone: false })
    .defaultNow()
    .notNull(),
  notes: text("notes"),
  status: applicationStatusEnum("status").default("pending").notNull(),
  url: text("url"),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
