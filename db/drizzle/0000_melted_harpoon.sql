CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"date_applied" timestamp DEFAULT now(),
	"notes" text,
	"status" text DEFAULT 'Pending'
);
