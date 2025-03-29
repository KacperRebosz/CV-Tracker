"use client";

import React, { useEffect, useRef, useState } from "react";
import { format, formatISO } from "date-fns";
import { CalendarIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { addApplication } from "@/app/_actions/applicationAction";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ApplicationFormProps {
  isSubmitting: boolean;
}

export default function ApplicationForm({
  isSubmitting,
}: ApplicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [dateApplied, setDateApplied] = useState<Date | undefined>(new Date());

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const handleFormAction = async (formData: FormData) => {
    setErrors({});
    if (dateApplied) {
      formData.set(
        "dateApplied",
        formatISO(dateApplied, { representation: "date" }) + "T00:00:00.000Z",
      );
    } else {
      formData.delete("dateApplied");
    }

    const result = await addApplication(formData);

    if (result.success) {
      toast.success("Application added successfully!");
      formRef.current?.reset();
      setDateApplied(new Date());
    } else {
      toast.error("Failed to add application.");

      const newErrors: Record<string, string> = {};
      result.errors?.forEach((err) => {
        if (err.path && err.path[0]) {
          newErrors[err.path[0]] = err.message;
        } else if (err.code === "custom") {
          newErrors["form"] = err.message;
        }
      });
      setErrors(newErrors);
    }
  };

  useEffect(() => {
    setErrors({});
  }, [dateApplied]);

  return (
    <form
      ref={formRef}
      action={handleFormAction}
      className="space-y-4"
      onChange={() =>
        setErrors((prev) => ({
          ...prev,
          companyName: undefined,
          position: undefined,
          url: undefined,
        }))
      }
    >
      <div className="space-y-2">
        <Label htmlFor="company">Company Name</Label>
        <Input
          id="company"
          name="companyName"
          placeholder="e.g. Acme Inc."
          required
          aria-invalid={!!errors.companyName}
          aria-describedby="company-error"
        />
        {errors.companyName && (
          <p id="company-error" className="text-sm text-red-600">
            {errors.companyName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position Applied</Label>
        <Input
          id="position"
          name="position"
          placeholder="e.g. Frontend Developer"
          required
          aria-invalid={!!errors.position}
          aria-describedby="position-error"
        />
        {errors.position && (
          <p id="position-error" className="text-sm text-red-600">
            {errors.position}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Job URL</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LinkIcon className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="url"
            name="url"
            placeholder="e.g. https://company.com/jobs/123"
            className="pl-10"
            type="url"
            aria-invalid={!!errors.url}
            aria-describedby="url-error"
          />
        </div>
        {errors.url && (
          <p id="url-error" className="text-sm text-red-600">
            {errors.url}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date Applied</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateApplied && "text-muted-foreground",
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateApplied ? format(dateApplied, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateApplied}
              onSelect={setDateApplied}
              initialFocus
              disabled={isSubmitting}
            />
          </PopoverContent>
        </Popover>
        {errors.dateApplied && (
          <p className="text-sm text-red-600">{errors.dateApplied}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional details..."
          className="resize-none"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}
