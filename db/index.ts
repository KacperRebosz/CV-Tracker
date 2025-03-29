import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/drizzle/schema";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// For migrations
export const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

// For query client
const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema }); // Pass schema here
