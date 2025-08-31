import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const toHttpStatus = (err?: string) => {
  if (!err) return 500;
  if (/not found/i.test(err)) return 404;
  if (/invalid|no valid|format|status|priority|payload|json/i.test(err)) return 400;
  return 500;
};

// Sanitize and map incoming updates (tickets map to tasks table)
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
  // read-only or disallowed keys (will be dropped)
  ticketNumber: 'task_number',
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

function sanitizeTicketUpdates(input: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!input || typeof input !== 'object') return out;

  // copy through allowed snake_case (except status/priority/assigned_to; handled separately below)
  for (const k of Object.keys(input)) {
    if (ALLOWED_FIELDS.has(k) && input[k] !== undefined) {
      if (k === 'status' || k === 'priority' || k === 'assigned_to') continue;
      out[k] = input[k];
    }
  }

  // map camelCase commonly used in admin UI
  for (const [camel, snake] of Object.entries(CAMEL_TO_SNAKE)) {
    if (Object.prototype.hasOwnProperty.call(input, camel) && input[camel] !== undefined) {
      if (ALLOWED_FIELDS.has(snake)) {
        out[snake] = input[camel];
      }
    }
  }

  // normalize source if present
  const normSource = normalizeSource(input.source);
  if (normSource) out.source = normSource;

  // normalize status/priority variants if present
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

  // drop read-only
  delete (out as any).id;
  delete (out as any).task_number;
  delete (out as any).created_at;
  delete (out as any).updated_at;
  delete (out as any).deleted_at;

  return out;
}

// GET /api/tickets/[id] - Get a specific ticket (mapped to task)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    if (!ticketId || !UUID_REGEX.test(ticketId)) {
      return NextResponse.json(
        { success: false, error: 'Valid ticket ID is required' },
        { status: 400 }
      );
    }

    const result = await TaskService.getTaskById(ticketId, { admin: true });
    
    if (!result.success || !result.data) {
      console.error('TaskService.getTaskById error for ticket:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Ticket not found' },
        { status: toHttpStatus(result.error) }
      );
    }

    // Map task to ticket format for backward compatibility
    const task = result.data;
    const ticket = {
      id: task.id,
      ticketNumber: task.task_number,
      customerName: task.customer_name,
      phoneNumber: task.phone_number,
      problemDescription: task.problem_description,
      status: task.status,
      priority: task.priority,
      location: task.location,
      source: task.source,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      title: task.title,
      description: task.description,
      category: task.category
    };
    
    return NextResponse.json({
      success: true,
      data: ticket
    });
    
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/tickets/[id] - Update a specific ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    let updates: any;
    try {
      updates = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    if (!ticketId || !UUID_REGEX.test(ticketId)) {
      return NextResponse.json(
        { success: false, error: 'Valid ticket ID is required' },
        { status: 400 }
      );
    }

    // Sanitize payload and map to tasks schema
    let safeUpdates: Record<string, any>;
    try {
      safeUpdates = sanitizeTicketUpdates(updates);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false,
          error: error instanceof Error ? error.message : 'Invalid payload format'
        },
        { status: 400 }
      );
    }

    const result = await TaskService.updateTask(ticketId, safeUpdates);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: toHttpStatus(result.error) }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Ticket updated successfully`
    });
    
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id] - Cancel a specific ticket (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    if (!ticketId || !UUID_REGEX.test(ticketId)) {
      return NextResponse.json(
        { success: false, error: 'Valid ticket ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the task
    const result = await TaskService.deleteTask(ticketId, 'Ticket cancelled via API');
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: toHttpStatus(result.error) }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Ticket cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}