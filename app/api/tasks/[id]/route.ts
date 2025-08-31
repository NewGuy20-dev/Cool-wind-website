import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const toHttpStatus = (err?: string) => {
  if (!err) return 500;
  if (/not found/i.test(err)) return 404;
  if (/invalid|no valid|format|status|priority|payload|json/i.test(err)) return 400;
  return 500;
};

// Whitelist and sanitize incoming updates to avoid DB errors
const ALLOWED_FIELDS = new Set([
  'customer_name',
  'phone_number',
  'location',
  'title',
  'description',
  'problem_description',
  'status',
  'priority',
  'category',
  'source',
  'estimated_duration',
  'actual_duration',
  'due_date',
  'completed_at',
  'assigned_to',
  'assigned_at',
  'ai_priority_reason',
  'urgency_keywords',
  'metadata',
  'chat_context',
]);

const CAMEL_TO_SNAKE: Record<string, string> = {
  customerName: 'customer_name',
  phoneNumber: 'phone_number',
  problemDescription: 'problem_description',
  aiPriorityReason: 'ai_priority_reason',
  urgencyKeywords: 'urgency_keywords',
  chatContext: 'chat_context',
  completedAt: 'completed_at',
  assignedTo: 'assigned_to',
  assignedAt: 'assigned_at',
  estimatedDuration: 'estimated_duration',
  actualDuration: 'actual_duration',
  dueDate: 'due_date',
  // read-only or disallowed (will be dropped if present)
  taskNumber: 'task_number',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
};

function normalizeSource(raw: any): string | undefined {
  if (raw == null) return undefined;
  const v = String(raw).trim().toLowerCase();
  const hyphened = v.replace(/_/g, '-');
  const valid = ['chat-failed-call', 'admin-manual', 'api-direct', 'webhook', 'email', 'phone'];
  return valid.includes(hyphened) ? hyphened : undefined;
}

function normalizeStatus(raw: any): string | undefined {
  if (raw == null) return undefined;
  const v = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
  const map: Record<string, string> = {
    pending: 'pending',
    in_progress: 'in_progress',
    inprogress: 'in_progress',
    completed: 'completed',
    done: 'completed',
    cancelled: 'cancelled',
    canceled: 'cancelled',
  };
  return map[v];
}

function normalizePriority(raw: any): string | undefined {
  if (raw == null) return undefined;
  const v = String(raw).trim().toLowerCase();
  const map: Record<string, string> = {
    low: 'low',
    medium: 'medium',
    normal: 'medium',
    high: 'high',
    urgent: 'urgent',
    critical: 'urgent',
  };
  return map[v];
}

function sanitizeTaskUpdates(input: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!input || typeof input !== 'object') return out;

  // Pass-through for allowed snake_case fields (except status/priority/assigned_to; handled separately below)
  for (const key of Object.keys(input)) {
    if (ALLOWED_FIELDS.has(key) && input[key] !== undefined) {
      if (key === 'status' || key === 'priority' || key === 'assigned_to') continue;
      out[key] = input[key];
    }
  }

  // Map known camelCase fields to snake_case
  for (const [camel, snake] of Object.entries(CAMEL_TO_SNAKE)) {
    if (Object.prototype.hasOwnProperty.call(input, camel) && input[camel] !== undefined) {
      if (ALLOWED_FIELDS.has(snake)) {
        out[snake] = input[camel];
      }
    }
  }

  // Normalize source if provided
  const normSource = normalizeSource(input.source);
  if (normSource) out.source = normSource;

  // Normalize status/priority if provided (accept common variants)
  const normStatus = normalizeStatus(input.status);
  if (normStatus) out.status = normStatus;
  const normPriority = normalizePriority(input.priority);
  if (normPriority) out.priority = normPriority;

  // Handle assigned_to field - must be UUID or null
  if (input.assigned_to !== undefined) {
    if (input.assigned_to === null || input.assigned_to === '') {
      out.assigned_to = null;
    } else if (typeof input.assigned_to === 'string' && UUID_REGEX.test(input.assigned_to)) {
      out.assigned_to = input.assigned_to;
    } else {
      throw new Error(`assigned_to must be a valid UUID or null. Received: "${input.assigned_to}". Text names are not supported - use user IDs.`);
    }
  }

  // Handle assignedTo camelCase variant
  if (input.assignedTo !== undefined) {
    if (input.assignedTo === null || input.assignedTo === '') {
      out.assigned_to = null;
    } else if (typeof input.assignedTo === 'string' && UUID_REGEX.test(input.assignedTo)) {
      out.assigned_to = input.assignedTo;
    } else {
      throw new Error(`assignedTo must be a valid UUID or null. Received: "${input.assignedTo}". Text names are not supported - use user IDs.`);
    }
  }

  // Remove read-only/disallowed fields defensively
  delete (out as any).id;
  delete (out as any).task_number;
  delete (out as any).created_at;
  delete (out as any).updated_at;
  delete (out as any).deleted_at;

  return out;
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid task ID is required' 
        },
        { status: 400 }
      );
    }

    const result = await TaskService.getTaskById(id, { admin: true });

    if (!result.success) {
      console.error('TaskService.getTaskById error:', result.error);
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Task not found'
        },
        { status: toHttpStatus(result.error) }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get task API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let updates: any;
    try {
      updates = await request.json();
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON payload' 
        },
        { status: 400 }
      );
    }

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid task ID is required' 
        },
        { status: 400 }
      );
    }

    // Sanitize and map payload to match DB schema
    let safeUpdates: Record<string, any>;
    try {
      safeUpdates = sanitizeTaskUpdates(updates);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false,
          error: error instanceof Error ? error.message : 'Invalid payload format'
        },
        { status: 400 }
      );
    }

    const result = await TaskService.updateTask(id, safeUpdates);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: toHttpStatus(result.error) }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error(' Update task error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update task' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a specific task (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid task ID is required' 
        },
        { status: 400 }
      );
    }

    // Proper soft delete via TaskService
    const result = await TaskService.deleteTask(id, 'Task deleted via API');

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: toHttpStatus(result.error) }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error(' Delete task error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cancel task' 
      },
      { status: 500 }
    );
  }
}