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

export async function archiveTask(taskId: string) {
  console.log("[TaskService] Starting archiveTask for ID:", taskId);

  try {
    if (!supabaseAdmin) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }

    // First, get the current task to validate it can be archived
    const { data: currentTask, error: fetchError } = await supabaseAdmin
      .from("tasks")
      .select("id, status, archived")
      .eq("id", taskId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !currentTask) {
      console.error("[TaskService] Task not found:", fetchError);
      throw new Error("TASK_NOT_FOUND");
    }

    // Check if task can be archived (not pending, open, or in_progress)
    if (
      currentTask.status === 'pending' ||
      currentTask.status === 'open' ||
      currentTask.status === 'in_progress'
    ) {
      throw new Error("CANNOT_ARCHIVE_ACTIVE_TASK");
    }

    if (currentTask.archived) {
      throw new Error("TASK_ALREADY_ARCHIVED");
    }

    // Use the database function to archive the task
    const { data, error } = await supabaseAdmin
      .rpc('archive_task', { task_id: taskId });

    if (error) {
      console.error("[TaskService] Archive function error:", error);
      throw Object.assign(new Error("ARCHIVE_FAILED"), { details: error });
    }

    console.log("[TaskService] Successfully archived task:", taskId);
    return { success: true, taskId };

  } catch (err: any) {
    console.error("[TaskService] Archive error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      details: err.details
    });
    throw err;
  }
}

export async function unarchiveTask(taskId: string) {
  console.log("[TaskService] Starting unarchiveTask for ID:", taskId);

  try {
    if (!supabaseAdmin) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }

    // Use the database function to unarchive the task
    const { data, error } = await supabaseAdmin
      .rpc('unarchive_task', { task_id: taskId });

    if (error) {
      console.error("[TaskService] Unarchive function error:", error);
      throw Object.assign(new Error("UNARCHIVE_FAILED"), { details: error });
    }

    console.log("[TaskService] Successfully unarchived task:", taskId);
    return { success: true, taskId };

  } catch (err: any) {
    console.error("[TaskService] Unarchive error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      details: err.details
    });
    throw err;
  }
}

export async function getActiveTasks() {
  try {
    if (!supabaseAdmin) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }

    const { data, error } = await supabaseAdmin
      .from("active_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[TaskService] Error fetching active tasks:", error);
      throw Object.assign(new Error("FETCH_ACTIVE_TASKS_FAILED"), { details: error });
    }

    return data || [];

  } catch (err: any) {
    console.error("[TaskService] Get active tasks error:", err);
    throw err;
  }
}

export async function getArchivedTasks() {
  try {
    if (!supabaseAdmin) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }

    const { data, error } = await supabaseAdmin
      .from("archived_tasks")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[TaskService] Error fetching archived tasks:", error);
      throw Object.assign(new Error("FETCH_ARCHIVED_TASKS_FAILED"), { details: error });
    }

    return data || [];

  } catch (err: any) {
    console.error("[TaskService] Get archived tasks error:", err);
    throw err;
  }
}
