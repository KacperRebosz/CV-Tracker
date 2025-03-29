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
import { Archive as ArchiveIcon, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteApplication,
  updateApplicationStatus,
} from "@/app/_actions/applicationAction";
import ArchivedTable from "@/components/archived-table";
import FilterBar from "@/components/filter-bar";
import { type Application } from "@/db/drizzle/schema";

interface ArchivedDashboardProps {
  initialArchivedApplications: Application[];
}

type AppSortField = keyof Application;

export default function ArchivedDashboard({
  initialArchivedApplications,
}: ArchivedDashboardProps) {
  const applications = initialArchivedApplications;

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortField, setSortField] = useState<AppSortField>("dateApplied");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
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

    let sorted = [...filtered];
    sorted.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      let comparison = 0;

      if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else if (typeof valA === "string" && typeof valB === "string") {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else if (valA === null && valB !== null) {
        comparison = -1;
      } else if (valA !== null && valB === null) {
        comparison = 1;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [applications, searchTerm, dateFilter, sortField, sortDirection]);

  const totalArchivedCount = applications.length;
  const visibleArchivedCount = filteredAndSortedApplications.length;

  const handleUnarchive = useCallback((id: number, status: "pending") => {
    startTransition(async () => {
      const result = await updateApplicationStatus(id, status);
      if (result.success) {
        toast.success("Application unarchived.");
      } else {
        toast.error(
          `Failed to unarchive: ${result.message || "Unknown error"}`,
        );
      }
    });
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this archived application?",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteApplication(id);
      if (result.success) {
        toast.success("Archived application deleted.");
      } else {
        toast.error(`Failed to delete: ${result.message || "Unknown error"}`);
      }
    });
  }, []);
  const handleSort = useCallback(
    (field: AppSortField) => {
      setSortDirection((prev) =>
        sortField === field && prev === "desc" ? "asc" : "desc",
      );
      setSortField(field);
    },
    [sortField],
  );

  return (
    <div className="space-y-4">
      <FilterBar
        searchTerm={searchTerm}
        dateFilter={dateFilter}
        onSearchChange={setSearchTerm}
        onDateFilterChange={setDateFilter}
      />

      <div className="flex items-center justify-end text-sm text-gray-500">
        {isPending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <CalendarDays className="mr-1 h-4 w-4" />
        )}
        Showing {visibleArchivedCount} of {totalArchivedCount} archived
        application(s) matching filters.
      </div>

      <ArchivedTable
        applications={filteredAndSortedApplications}
        onUnarchive={handleUnarchive}
        onDelete={handleDelete}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        isUpdating={isPending}
      />
    </div>
  );
}
