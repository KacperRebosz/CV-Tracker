import { desc, eq, sql } from "drizzle-orm";
import { Archive } from "lucide-react";

import ArchivedDashboard from "@/components/archived-dashboard";
import { db } from "@/db";
import { Application, applications } from "@/db/drizzle/schema";

export const dynamic = "force-dynamic";

export default async function ArchivedPage() {
  const initialArchivedApplications: Application[] = await db
    .select()
    .from(applications)
    .where(eq(applications.status, "archived"))
    .orderBy(desc(applications.dateApplied));

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(eq(applications.status, "archived"));
  const totalArchivedCount = totalCountResult[0]?.count ?? 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Archived Applications</h2>
          </div>

          <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {totalArchivedCount} Total
          </span>
        </div>

        <ArchivedDashboard
          initialArchivedApplications={initialArchivedApplications}
        />
      </div>
    </div>
  );
}
