"use client";

import type { DateFilter, SortDirection } from "@/types/types";
import React, { useCallback, useMemo, useState, useTransition } from "react";
import {
  endOfDay,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import {
  Archive as ArchiveIcon,
  CalendarDays,
  Inbox,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteApplication,
  updateApplicationStatus,
} from "@/app/_actions/applicationAction";
import ApplicationForm from "@/components/application-form";
import ApplicationTable from "@/components/application-table";
import ArchivedTable from "@/components/archived-table";
import FilterBar from "@/components/filter-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Application } from "@/db/drizzle/schema"; // <-- CORRECT PATH to schema type

interface ApplicationDashboardProps {
  initialApplications: Application[];
}

export default function ApplicationDashboard({
  initialApplications,
}: ApplicationDashboardProps) {
  const applications = initialApplications;
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortField, setSortField] = useState<keyof Application>("dateApplied");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState<"pending" | "archived">("pending");
  const [isPending, startTransition] = useTransition();

  const filteredAndSortedApplications = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const last7DaysStart = startOfDay(subDays(now, 6));
    const last30DaysStart = startOfDay(subDays(now, 29));
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    let filtered = applications.filter((app) => {
      if (app.status !== activeTab) return false;

      const lowerSearchTerm = searchTerm.toLowerCase();
      if (
        searchTerm &&
        !app.companyName.toLowerCase().includes(lowerSearchTerm) &&
        !app.position.toLowerCase().includes(lowerSearchTerm)
      ) {
        return false;
      }

      if (dateFilter !== "all") {
        const appDate = app.dateApplied;
        let interval: Interval | null = null;

        switch (dateFilter) {
          case "today":
            interval = { start: todayStart, end: todayEnd };
            break;
          case "last7days":
            interval = { start: last7DaysStart, end: todayEnd };
            break;
          case "last30days":
            interval = { start: last30DaysStart, end: todayEnd };
            break;
          case "thisMonth":
            interval = { start: thisMonthStart, end: thisMonthEnd };
            break;
          case "lastMonth":
            interval = { start: lastMonthStart, end: lastMonthEnd };
            break;
        }
        if (!interval || !appDate || !isWithinInterval(appDate, interval)) {
          return false;
        }
      }
      return true;
    });

    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      let comparison = 0;

      if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else if (typeof valA === "string" && typeof valB === "string") {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    applications,
    searchTerm,
    dateFilter,
    sortField,
    sortDirection,
    activeTab,
  ]);

  const totalCount = applications.length;
  const pendingCount = useMemo(
    () => applications.filter((app) => app.status === "pending").length,
    [applications],
  );
  const archivedCount = useMemo(
    () => applications.filter((app) => app.status === "archived").length,
    [applications],
  );
  const visibleCount = filteredAndSortedApplications.length;

  const handleUpdateStatus = useCallback(
    (id: number, status: "pending" | "archived") => {
      startTransition(async () => {
        const result = await updateApplicationStatus(id, status);
        if (result.success) {
          toast.success(
            `Application ${status === "pending" ? "unarchived" : "archived"}.`,
          );
        } else {
          toast.error(
            `Failed to update status: ${result.message || "Unknown error"}`,
          );
        }
      });
    },
    [],
  );

  const handleDelete = useCallback((id: number) => {
    if (
      !confirm("Are you sure you want to permanently delete this application?")
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteApplication(id);
      if (result.success) {
        toast.success("Application deleted.");
      } else {
        toast.error(
          `Failed to delete application: ${result.message || "Unknown error"}`,
        );
      }
    });
  }, []);

  const handleSort = useCallback(
    (field: keyof Application) => {
      setSortDirection((prev) =>
        sortField === field && prev === "desc" ? "asc" : "desc",
      );
      setSortField(field);
    },
    [sortField],
  );

  const handleEdit = useCallback((id: number) => {
    toast.info(`Editing application ID: ${id}. Feature not implemented.`);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="sticky top-20">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <Inbox className="h-5 w-5 text-blue-500" />
                )}
                <h2 className="text-lg font-medium">Add Application</h2>
              </div>
              <ApplicationForm isSubmitting={isPending} />
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-medium">Applications</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {totalCount} Total
                </span>
                <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {pendingCount} Pending
                </span>
                <span className="rounded bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  {archivedCount} Archived
                </span>
              </div>
            </div>

            <FilterBar
              searchTerm={searchTerm}
              dateFilter={dateFilter}
              onSearchChange={setSearchTerm}
              onDateFilterChange={setDateFilter}
            />

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "pending" | "archived")
              }
              className="mt-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" disabled={isPending}>
                  <Inbox className="mr-2 h-4 w-4" /> Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="archived" disabled={isPending}>
                  <ArchiveIcon className="mr-2 h-4 w-4" /> Archived (
                  {archivedCount})
                </TabsTrigger>
              </TabsList>

              <div className="mt-2 mb-2 flex items-center justify-end text-sm text-gray-500">
                {isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <CalendarDays className="mr-1 h-4 w-4" />
                )}
                Showing {visibleCount} of{" "}
                {activeTab === "pending" ? pendingCount : archivedCount}{" "}
                {activeTab} application(s) matching filters.
              </div>

              <TabsContent value="pending">
                <ApplicationTable
                  applications={filteredAndSortedApplications}
                  onArchive={handleUpdateStatus}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  isUpdating={isPending}
                />
              </TabsContent>
              <TabsContent value="archived">
                <ArchivedTable
                  applications={filteredAndSortedApplications}
                  onUnarchive={handleUpdateStatus}
                  onDelete={handleDelete}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  isUpdating={isPending}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
