import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

/**
 * Tasks API Route
 * Native API for tasks without ticket compatibility layer
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;

    // Get tasks in native format
    const result = await TaskService.getAllTasks(status, priority, limit);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
      count: result.data?.length || 0
    });

  } catch (error) {
    console.error('❌ Tasks API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tasks' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create task with admin source
    const taskData = {
      ...body,
      source: 'admin-manual' as const,
    };
    
    const result = await TaskService.createTask(taskData);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('❌ Task creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create task' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Task ID is required' 
        },
        { status: 400 }
      );
    }

    const result = await TaskService.updateTask(id, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('❌ Task update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update task' 
      },
      { status: 500 }
    );
  }
}