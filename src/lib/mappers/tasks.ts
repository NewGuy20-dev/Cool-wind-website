import type { TaskApi, TaskDbRow } from '@/src/types/task';

export function mapDbToApi(db: TaskDbRow): TaskApi {
  return {
    id: db.id,
    taskNumber: db.task_number,
    customerName: db.customer_name,
    phoneNumber: db.phone_number,
    location: db.location,
    title: db.title,
    description: db.description,
    problemDescription: db.problem_description,
    // normalize status mapping if needed
    status: mapDbStatusToApiStatus(db.status),
    priority: db.priority,
    category: db.category,
    source: db.source,
    estimatedDuration: db.estimated_duration,
    actualDuration: db.actual_duration,
    dueDate: db.due_date,
    completedAt: db.completed_at,
    assignedTo: db.assigned_to,
    assignedAt: db.assigned_at,
    aiPriorityReason: db.ai_priority_reason,
    urgencyKeywords: db.urgency_keywords,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    deletedAt: db.deleted_at,
    metadata: db.metadata,
    chatContext: db.chat_context,
  };
}

export function mapApiToDb(api: Partial<TaskApi>): Partial<TaskDbRow> {
  const out: Partial<TaskDbRow> = {};
  if (api.taskNumber !== undefined) out.task_number = api.taskNumber;
  if (api.customerName !== undefined) out.customer_name = api.customerName;
  if (api.phoneNumber !== undefined) out.phone_number = api.phoneNumber;
  if (api.location !== undefined) out.location = api.location;
  if (api.title !== undefined) out.title = api.title;
  if (api.description !== undefined) out.description = api.description;
  if (api.problemDescription !== undefined) out.problem_description = api.problemDescription;
  if (api.status !== undefined) out.status = mapApiStatusToDbStatus(api.status);
  if (api.priority !== undefined) out.priority = api.priority as any;
  if (api.category !== undefined) out.category = api.category;
  if (api.source !== undefined) out.source = api.source as any;
  if (api.estimatedDuration !== undefined) out.estimated_duration = api.estimatedDuration;
  if (api.actualDuration !== undefined) out.actual_duration = api.actualDuration;
  if (api.dueDate !== undefined) out.due_date = api.dueDate;
  if (api.completedAt !== undefined) out.completed_at = api.completedAt;
  if (api.assignedTo !== undefined) out.assigned_to = api.assignedTo;
  if (api.assignedAt !== undefined) out.assigned_at = api.assignedAt;
  if (api.aiPriorityReason !== undefined) out.ai_priority_reason = api.aiPriorityReason;
  if (api.urgencyKeywords !== undefined) out.urgency_keywords = api.urgencyKeywords;
  if (api.metadata !== undefined) out.metadata = api.metadata;
  if (api.chatContext !== undefined) out.chat_context = api.chatContext;
  // created_at/updated_at are DB-managed unless seed script sets them.
  return out;
}

function mapDbStatusToApiStatus(s: string): TaskApi['status'] {
  // Map DB status to normalized frontend status
  if (s === 'urgent') return 'high';
  if (s === 'pending') return 'new';
  return (s as TaskApi['status']);
}

function mapApiStatusToDbStatus(s: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' {
  // Map frontend status to DB status
  if (s === 'high') return 'pending'; // treat 'high' as 'pending' for status
  if (s === 'new') return 'pending';
  if (s === 'in_progress') return 'in_progress';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'pending'; // default
}