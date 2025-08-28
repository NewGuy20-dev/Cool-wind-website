import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';
import { TaskStatus, TaskPriority, TaskSearchParams, TaskUpdateRequest } from '@/lib/types/database';
import { mapDbToApi } from '@/src/lib/mappers/tasks';

// Simple admin authentication (in production, use proper auth)
const ADMIN_KEY = process.env.ADMIN_KEY || 'coolwind2024';

function authenticateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === ADMIN_KEY;
}

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
      const result = await TaskService.getDashboardData();
      
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
      
      const result = await TaskService.getTaskStats(startDate, endDate);
      
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
    const searchParams_: TaskSearchParams = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as TaskStatus) || undefined,
      priority: (searchParams.get('priority') as TaskPriority) || undefined,
      source: searchParams.get('source') as any || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };
    
    // Use search function for filtering
    const result = await TaskService.searchTasks(searchParams_);

    // Map tasks to camelCase for frontend
    const apiTasks = result.tasks.map(mapDbToApi);

    return NextResponse.json({
      success: true,
      data: apiTasks,
      pagination: result.pagination,
      totalTasks: result.pagination.total
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
    
    // Handle bulk updates
    if (body.bulk && Array.isArray(body.taskIds)) {
      const { taskIds, updates } = body;
      
      if (!taskIds.length) {
        return NextResponse.json(
          { error: 'No task IDs provided' },
          { status: 400 }
        );
      }
      
      const result = await TaskService.bulkUpdateTasks(taskIds, updates);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      console.log(`✅ Admin bulk updated ${result.data?.length || 0} tasks`);
      
      return NextResponse.json({
        success: true,
        message: `${result.data?.length || 0} tasks updated successfully`,
        updatedTasks: result.data
      });
    }
    
    // Handle single task update
    const { taskId, ...updates } = body;
    
    if (!taskId) {
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
    const result = await TaskService.updateTask(taskId, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Task not found' ? 404 : 500 }
      );
    }

    console.log(`✅ Admin updated task ${taskId}:`, updates);
    
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
    
    // Create new task with admin source
    const taskData = {
      ...body,
      source: 'admin-manual' as const,
    };
    
    const result = await TaskService.createTask(taskData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ Admin created new task: ${result.data?.task_number}`);
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      task: result.data
    });

  } catch (error) {
    console.error('❌ Admin task creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
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