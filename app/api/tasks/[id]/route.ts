import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Task ID is required' 
        },
        { status: 400 }
      );
    }

    const result = await TaskService.getTaskById(id);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: result.error === 'Task not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Get task error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch task' 
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
    const updates = await request.json();

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
        { status: result.error === 'Task not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('❌ Update task error:', error);
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

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Task ID is required' 
        },
        { status: 400 }
      );
    }

    // Soft delete by setting status to cancelled
    const result = await TaskService.updateTask(id, { 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: result.error === 'Task not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Task cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Delete task error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cancel task' 
      },
      { status: 500 }
    );
  }
}