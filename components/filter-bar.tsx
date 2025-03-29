"use client";

import type { DateFilter } from "@/types/types";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchTerm: string;
  dateFilter: DateFilter;
  onSearchChange: (value: string) => void;
  onDateFilterChange: (value: DateFilter) => void;
}

export default function FilterBar({
  searchTerm,
  dateFilter,
  onSearchChange,
  onDateFilterChange,
}: FilterBarProps) {
  const [showDateFilter, setShowDateFilter] = useState(false);

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-grow">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by company or position..."
            className="pr-9 pl-9 sm:pr-3"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={cn("gap-2", showDateFilter && "bg-blue-50 text-blue-700")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Date Filter</span>
          {dateFilter !== "all" && (
            <span className="ml-1 h-2 w-2 rounded-full bg-blue-500"></span>
          )}
        </Button>
      </div>

      {showDateFilter && (
        <div className="grid grid-cols-1">
          <Select
            value={dateFilter}
            onValueChange={(value) => onDateFilterChange(value as DateFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by date applied" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
