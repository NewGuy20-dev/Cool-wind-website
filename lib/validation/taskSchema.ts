import { z } from "zod";

export const StatusEnum = z.enum(["open", "in_progress", "closed", "pending"]);
export const PriorityEnum = z.enum(["low", "medium", "high", "critical"]);

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
}).passthrough();

export function normalizeTaskPayload(raw: Record<string, any>) {
  console.log("[Validation] Normalizing payload:", raw);

  const normalized: Record<string, any> = { ...raw };

  // Handle common field name variations
  const fieldMappings = {
    Priority: 'priority',
    Status: 'status',
    priorityLevel: 'priority',
    taskTitle: 'title',
    task_name: 'title',
    task_title: 'title',
    desc: 'description',
    details: 'description'
  };

  Object.entries(fieldMappings).forEach(([oldKey, newKey]) => {
    if (raw[oldKey] && !raw[newKey]) {
      normalized[newKey] = raw[oldKey];
    }
  });

  // Normalize string values
  if (typeof normalized.status === "string") {
    normalized.status = normalized.status.toLowerCase().trim();
  }
  if (typeof normalized.priority === "string") {
    normalized.priority = normalized.priority.toLowerCase().trim();
  }
  if (typeof normalized.title === "string") {
    normalized.title = normalized.title.trim();
  }
  if (typeof normalized.description === "string") {
    normalized.description = normalized.description.trim();
  }

  console.log("[Validation] Normalized result:", normalized);
  return normalized;
}

export function coerceTaskValues(parsed: any) {
  const statusParse = StatusEnum.safeParse(parsed.status);
  const priorityParse = PriorityEnum.safeParse(parsed.priority);

  const result = {
    title: parsed.title || "Untitled Task",
    description: parsed.description || "",
    status: statusParse.success ? statusParse.data : "open",
    priority: priorityParse.success ? priorityParse.data : "medium",
    created_at: new Date().toISOString(),
    ...parsed,
  };

  console.log("[Validation] Coerced values:", result);
  return result;
}
