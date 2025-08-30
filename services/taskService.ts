import { normalizeTaskPayload, CreateTaskSchema, coerceTaskValues } from "@/lib/validation/taskSchema";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function createTaskRaw(payload: Record<string, any>) {
  console.log("[TaskService] Starting createTaskRaw with payload:", JSON.stringify(payload, null, 2));

  try {
    // Check if supabaseAdmin is properly initialized
    if (!supabaseAdmin) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }

    console.log("[TaskService] Supabase client initialized, proceeding with normalization...");

    const normalized = normalizeTaskPayload(payload || {});
    console.log("[TaskService] Normalized payload:", JSON.stringify(normalized, null, 2));

    const parsed = CreateTaskSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("[TaskService] Validation failed:", JSON.stringify(parsed.error.format(), null, 2));
      throw Object.assign(new Error("VALIDATION_FAILED"), { details: parsed.error.format() });
    }

    console.log("[TaskService] Validation passed, coercing values...");
    const insertData = coerceTaskValues(parsed.data);
    console.log("[TaskService] Final insert data:", JSON.stringify(insertData, null, 2));

    console.log("[TaskService] Attempting Supabase insert...");
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[TaskService] Supabase error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw Object.assign(new Error("DB_INSERT_FAILED"), {
        details: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      });
    }

    if (!data) {
      console.error("[TaskService] No data returned from insert");
      throw new Error("NO_DATA_RETURNED");
    }

    console.log("[TaskService] Successfully created task:", JSON.stringify(data, null, 2));
    return data;

  } catch (err: any) {
    console.error("[TaskService] Uncaught error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      details: err.details
    });
    throw err;
  }
}
