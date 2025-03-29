import { desc } from "drizzle-orm";
import { Archive as ArchiveIcon, Inbox } from "lucide-react";

import ApplicationDashboard from "@/components/application-dashboard";
import { db } from "@/db";
import { Application, applications } from "@/db/drizzle/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialApplications: Application[] = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.dateApplied));

  return <ApplicationDashboard initialApplications={initialApplications} />;
}
