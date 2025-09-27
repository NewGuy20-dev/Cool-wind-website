import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';
import { TaskStatus, TaskPriority, TaskSearchParams, TaskUpdateRequest, TaskSource, TaskCreateRequest, Json } from '@/lib/types/database';
import { z } from 'zod';

// Simple admin authentication (in production, use proper auth)
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function authenticateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  const validTokens = [ADMIN_KEY, ADMIN_PASSWORD].filter((value): value is string => Boolean(value));
  return validTokens.includes(token);
}

// Strict Zod validation schema for task creation
const TaskCreateSchema = z.object({
  customer_name: z.string().trim().min(1, 'Customer name is required'),
  phone_number: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => /^[6-9]\d{9}$/.test(v), {
      message: 'Phone number must be a valid 10-digit Indian mobile number',
    }),
  problem_description: z.string().trim().min(1, 'Problem description is required'),
  title: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional().nullable(),
  description: z.string().trim().min(1).optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  source: z.enum(['chat-failed-call', 'admin-manual', 'api-direct', 'webhook', 'email', 'phone']).optional(),
  category: z.string().trim().min(1).optional().nullable(),
  due_date: z.string().optional().nullable(),
  ai_priority_reason: z.string().optional().nullable(),
  urgency_keywords: z.array(z.string()).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  chat_context: z.any().optional().nullable(),
}).strict();

export async function GET(request: NextRequest) {
  // Authenticate admin
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Check if requesting dashboard data
    const dashboard = searchParams.get('dashboard');
    if (dashboard === 'true') {
      const result = await TaskService.getDashboardData({ admin: true });
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        dashboard: result.data
      });
    }
    
    // Check if requesting analytics/stats
    const requestAnalytics = searchParams.get('analytics');
    if (requestAnalytics === 'true') {
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;
      
      const result = await TaskService.getTaskStats(startDate, endDate, { admin: true });
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        analytics: result.data
      });
    }
    
    // Parse search parameters
    const rawSource = searchParams.get('source');
    let normalizedSource: TaskSource | undefined = undefined;
    if (rawSource) {
      const v = rawSource.trim().toLowerCase();
      const hyphened = v.replace(/_/g, '-');
      const collapsed = v.replace(/[^a-z]/g, '');
      const map: Record<string, TaskSource> = {
        'chat-failed-call': 'chat-failed-call',
        'chat_failed_call': 'chat-failed-call',
        'chatfailedcall': 'chat-failed-call',
        'admin-manual': 'admin-manual',
        'admin_manual': 'admin-manual',
        'adminmanual': 'admin-manual',
        'api-direct': 'api-direct',
        'api_direct': 'api-direct',
        'apidirect': 'api-direct',
        'webhook': 'webhook',
        'email': 'email',
        'phone': 'phone',
      };
      const validList: TaskSource[] = ['chat-failed-call','admin-manual','api-direct','webhook','email','phone'];
      normalizedSource = map[v] || map[hyphened] || map[collapsed] || ((validList as string[]).includes(hyphened) ? (hyphened as TaskSource) : undefined);
      if (!normalizedSource) {
        return NextResponse.json(
          { status: 400 }
        );
      }
    }

    const archivedOnly = searchParams.get('archived') === 'true';
    const searchParams_: TaskSearchParams = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as TaskStatus || undefined,
      priority: searchParams.get('priority') as TaskPriority || undefined,
      source: searchParams.get('source') as TaskSource || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      archived: archivedOnly ? true : undefined,
    };

    if (archivedOnly) {
      try {
        const archived = await TaskService.getArchivedTasks(searchParams_);

        const tasks = (archived || []).map((t: any) => ({
          ...t,
          archived: true,
        }));

        return NextResponse.json({
          success: true,
          tasks,
          pagination: {
            page: 1,
            limit: tasks.length,
            total: tasks.length,
            totalPages: 1,
          },
          analytics: null,
          urgentTasks: [],
          totalTasks: tasks.length,
          archived: true,
        });
      } catch (error) {
        console.error('❌ Admin archived tasks fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch archived tasks' },
          { status: 500 }
        );
      }
    }

    // Use search function for filtering
    const result = await TaskService.searchTasks(searchParams_, { admin: true });
    // Also get additional analytics data
    const analyticsResult = await TaskService.getTaskStats(undefined, undefined, { admin: true });
    const urgentTasksResult = await TaskService.getUrgentTasks({ admin: true });
    const dashboardResult = await TaskService.getDashboardData({ admin: true });

    // Map tasks to frontend camelCase format
    const tasks = (result.tasks || []).map((t: any) => ({
      id: t.id,
      customerName: t.customer_name,
      phoneNumber: t.phone_number,
      problemDescription: t.problem_description,
      priority: (t.priority === 'urgent' ? 'high' : t.priority) as 'high' | 'medium' | 'low',
      status: t.status as 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled',
      source: t.source,
      location: t.location || undefined,
      aiPriorityReason: t.ai_priority_reason || undefined,
      archived: t.archived || false,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    // Build analytics in expected shape
    const overview: any = (dashboardResult.success && (dashboardResult.data as any)?.overview) 
      ? (dashboardResult.data as any).overview 
      : null;

    const analytics = overview ? {
      totalTasks: overview.total_tasks ?? result.pagination.total ?? 0,
      tasksByPriority: {
        high: (overview.high_count ?? 0) + (overview.urgent_count ?? 0),
        medium: overview.medium_count ?? 0,
        low: overview.low_count ?? 0,
      },
      tasksByStatus: {
        pending: overview.pending_count ?? 0,
        open: overview.open_count ?? 0,
        in_progress: overview.in_progress_count ?? 0,
        completed: overview.completed_count ?? 0,
        cancelled: overview.cancelled_count ?? 0,
      },
      recentTasks: [],
    } : (analyticsResult.success ? {
      totalTasks: (analyticsResult.data as any)?.total_tasks ?? result.pagination.total ?? 0,
      tasksByPriority: {
        high: ((analyticsResult.data as any)?.high_priority_count ?? 0) + ((analyticsResult.data as any)?.urgent_priority_count ?? 0),
        medium: 0,
        low: 0,
      },
      tasksByStatus: {
        pending: (analyticsResult.data as any)?.pending_tasks ?? 0,
        open: (analyticsResult.data as any)?.open_tasks ?? 0,
        in_progress: (analyticsResult.data as any)?.in_progress_tasks ?? 0,
        completed: (analyticsResult.data as any)?.completed_tasks ?? 0,
        cancelled: (analyticsResult.data as any)?.cancelled_tasks ?? 0,
      },
      recentTasks: [],
    } : null);

    return NextResponse.json({
      success: true,
      tasks,
      pagination: result.pagination,
      analytics,
      urgentTasks: urgentTasksResult.success ? urgentTasksResult.data : [],
      totalTasks: (overview?.total_tasks ?? (analyticsResult.data as any)?.total_tasks ?? result.pagination.total) || 0,
    });

  } catch (error) {
    console.error('❌ Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Authenticate admin
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { taskId, status, action } = body;
    console.log('🔐 Admin PATCH payload:', { taskId, status, action });

    // Handle archive/unarchive actions
    if (action === 'archive') {
      const { archiveTask } = await import('@/services/taskService');
      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required for archive' },
          { status: 400 }
        );
      }
      try {
        const result = await archiveTask(taskId);
        console.log(`✅ Admin archived task: ${taskId}`);
        return NextResponse.json({
          success: true,
          message: 'Task archived successfully',
          result
        });
      } catch (error: any) {
        console.error('❌ Admin task archive error:', error);
        let errorMessage = 'Failed to archive task';
        let statusCode = 500;
        
        if (error.message === 'TASK_NOT_FOUND') {
          errorMessage = 'Task not found';
          statusCode = 404;
        } else if (error.message === 'CANNOT_ARCHIVE_ACTIVE_TASK') {
          errorMessage = 'Cannot archive task that is new or in progress. Complete or cancel the task first.';
          statusCode = 400;
        } else if (error.message === 'TASK_ALREADY_ARCHIVED') {
          errorMessage = 'Task is already archived';
          statusCode = 400;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode }
        );
      }
    }

    if (action === 'unarchive') {
      const { unarchiveTask } = await import('@/services/taskService');
      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required for unarchive' },
          { status: 400 }
        );
      }
      try {
        const result = await unarchiveTask(taskId);
        console.log(`✅ Admin unarchived task: ${taskId}`);
        return NextResponse.json({
          success: true,
          message: 'Task unarchived successfully',
          result
        });
      } catch (error: any) {
        console.error('❌ Admin task unarchive error:', error);
        let errorMessage = 'Failed to unarchive task';
        let statusCode = 500;
        
        if (error.message === 'TASK_NOT_FOUND') {
          errorMessage = 'Archived task not found';
          statusCode = 404;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode }
        );
      }
    }

    // Handle regular status updates
    const { taskId: id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (updates.priority) {
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(updates.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority' },
          { status: 400 }
        );
      }
    }

    // Update task using Supabase service
    const result = await TaskService.updateTask(id, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Task not found' ? 404 : 500 }
      );
    }

    console.log(`✅ Admin updated task ${id}:`, updates);
    
    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      task: result.data
    });

  } catch (error) {
    console.error('❌ Admin task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Authenticate admin
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate payload strictly
    const parsed = TaskCreateSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      }));
      console.warn('⚠️ Admin task creation validation failed', { issues });
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', issues },
        { status: 400 }
      );
    }

    // Enforce admin source and satisfy TaskCreateRequest types with safe defaults
    const taskData: TaskCreateRequest = {
      customer_name: parsed.data.customer_name,
      phone_number: parsed.data.phone_number,
      problem_description: parsed.data.problem_description,
      title: parsed.data.title || `Service request from ${parsed.data.customer_name}`,
      location: parsed.data.location ?? null,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? 'pending',
      priority: parsed.data.priority ?? 'medium',
      source: 'admin-manual',
      category: parsed.data.category ?? null,
      due_date: parsed.data.due_date ?? null,
      ai_priority_reason: parsed.data.ai_priority_reason ?? null,
      urgency_keywords: parsed.data.urgency_keywords ?? null,
      metadata: (parsed.data.metadata ?? {}) as unknown as Json,
      chat_context: (parsed.data.chat_context ?? null) as unknown as Json | null,
    };

    const result = await TaskService.createTask(taskData);

    if (!result.success) {
      console.error('❌ Admin task creation DB error', { error: result.error });
      return NextResponse.json(
        { error: 'DB_ERROR', message: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ Admin created new task: ${result.data?.task_number}`);

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      task: result.data,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Admin task creation unexpected error:', error);
    return NextResponse.json(
      { error: 'UNEXPECTED', message: (error as any)?.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Authenticate admin
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const reason = searchParams.get('reason') || 'Deleted by admin';

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const result = await TaskService.deleteTask(taskId, reason);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Task not found' ? 404 : 500 }
      );
    }

    console.log(`✅ Admin deleted task ${taskId}, reason: ${reason}`);
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('❌ Admin task deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}