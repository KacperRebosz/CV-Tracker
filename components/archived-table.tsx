"use client";

import type { Application } from "@/db/drizzle/schema";
import type { SortDirection } from "@/types/types";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Trash,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AppSortField = keyof Application;

interface ArchivedTableProps {
  applications: Application[];
  onUnarchive: (id: number, status: "pending") => void;
  onDelete: (id: number) => void;

  onSort: (field: AppSortField) => void;
  sortField: AppSortField;
  sortDirection: SortDirection;
  isUpdating: boolean;
}

export default function ArchivedTable({
  applications,
  onUnarchive,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  isUpdating,
}: ArchivedTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (applications.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        No archived applications found matching filters.{" "}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-1 gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className={cn(
              "overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md",
              isUpdating &&
                expandedId === app.id &&
                "cursor-not-allowed opacity-50",
            )}
          >
            <div className="p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  {app.url ? (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      {app.companyName}
                      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ) : (
                    <h3 className="font-medium text-gray-900">
                      {app.companyName}
                    </h3>
                  )}
                  <p className="text-sm text-gray-500">{app.position}</p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className="cursor-pointer text-xs hover:bg-gray-100"
                      onClick={() => !isUpdating && onSort("dateApplied")}
                    >
                      {app.dateApplied
                        ? format(app.dateApplied, "MMM d, yyyy")
                        : "N/A"}
                      {sortField === "dateApplied" && (
                        <ArrowUpDown
                          className={cn(
                            "ml-1 h-3 w-3",
                            sortDirection === "desc" ? "" : "rotate-180",
                          )}
                        />
                      )}
                    </Badge>
                  </div>

                  <Badge variant="secondary">Archived</Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isUpdating}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        disabled={isUpdating}
                      >
                        {isUpdating && expandedId === app.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        disabled={isUpdating}
                        onClick={() => {
                          setExpandedId(app.id);
                          onUnarchive(app.id, "pending");
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Unarchive</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                        disabled={isUpdating}
                        onClick={() => {
                          setExpandedId(app.id);
                          onDelete(app.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                        <span>Delete Permanently</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {app.notes && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 px-1 text-xs text-gray-500 hover:bg-gray-100"
                    onClick={() => toggleExpand(app.id)}
                    disabled={isUpdating}
                  >
                    {expandedId === app.id ? "Hide notes" : "Show notes"}
                  </Button>
                  {expandedId === app.id && (
                    <div className="mt-1 rounded-md bg-gray-50 p-3 text-sm break-words whitespace-pre-wrap text-gray-600">
                      {app.notes}
                    </div>
                  )}
                </>
              )}
              {!app.notes && (
                <p className="mt-2 text-xs text-gray-400 italic">
                  No notes added.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
