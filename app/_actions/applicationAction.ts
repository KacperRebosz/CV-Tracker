"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { applications, NewApplication } from "@/db/drizzle/schema";

const addSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  dateApplied: z.coerce.date({
    errorMap: (issue, { defaultError }) => ({
      message:
        issue.code === z.ZodIssueCode.invalid_date
          ? "Invalid date format"
          : defaultError,
    }),
  }),
  notes: z.string().trim().optional().nullable(),
  url: z
    .string()
    .trim()
    .url("Invalid URL format")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

const statusSchema = z.enum(["pending", "archived"]);

export async function addApplication(
  formData: FormData,
): Promise<{ success: boolean; errors?: z.ZodIssue[] }> {
  let urlValue = formData.get("url");

  if (urlValue === "") {
    urlValue = null;
  }

  const rawFormData = {
    companyName: formData.get("companyName"),
    position: formData.get("position"),
    dateApplied: formData.get("dateApplied"),
    notes: formData.get("notes"),
    url: urlValue,
  };

  const validatedFields = addSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error(
      "Validation Failed:",
      validatedFields.error.flatten().fieldErrors,
    );
    return {
      success: false,
      errors: validatedFields.error.issues,
    };
  }

  const dataToInsert: NewApplication = {
    companyName: validatedFields.data.companyName,
    position: validatedFields.data.position,
    dateApplied: validatedFields.data.dateApplied,
    notes: validatedFields.data.notes || null,
    url: validatedFields.data.url || null,
    status: "pending",
  };

  console.log("Data to Insert:", dataToInsert);

  try {
    await db.insert(applications).values(dataToInsert);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    let message = "Failed to add application to database.";

    if (error instanceof Error) {
      message = `Database error: ${error.message}`;
    }
    return {
      success: false,
      errors: [{ code: "custom", message: message, path: ["database"] }],
    };
  }
}

export async function updateApplicationStatus(
  id: number,
  newStatus: "pending" | "archived",
): Promise<{ success: boolean; message?: string }> {
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    return { success: false, message: "Invalid application ID." };
  }
  const validatedStatus = statusSchema.safeParse(newStatus);
  if (!validatedStatus.success) {
    return { success: false, message: "Invalid status provided." };
  }

  try {
    const result = await db
      .update(applications)
      .set({ status: validatedStatus.data })
      .where(eq(applications.id, id))
      .returning({ updatedId: applications.id });

    if (result.length === 0) {
      return { success: false, message: "Application not found." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error updating status:", error);
    return { success: false, message: "Database error updating status." };
  }
}

export async function deleteApplication(
  id: number,
): Promise<{ success: boolean; message?: string }> {
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    return { success: false, message: "Invalid application ID." };
  }
  try {
    const result = await db
      .delete(applications)
      .where(eq(applications.id, id))
      .returning({ deletedId: applications.id });

    if (result.length === 0) {
      return { success: false, message: "Application not found." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error deleting application:", error);
    return { success: false, message: "Database error deleting application." };
  }
}
