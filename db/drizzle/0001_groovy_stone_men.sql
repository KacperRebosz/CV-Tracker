CREATE TYPE "public"."application_status" AS ENUM('pending', 'archived');--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "date_applied" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DATA TYPE application_status;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "url" text;