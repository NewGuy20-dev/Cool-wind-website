import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '../../../../lib/failed-calls-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const task = getTaskById(id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updates = body;

    // Validate priority if provided
    if (updates.priority) {
      const validPriorities = ['high', 'medium', 'low'];
      if (!validPriorities.includes(updates.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority. Must be one of: high, medium, low' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['new', 'unavailable', 'scheduled', 'progress', 'completed'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: new, unavailable, scheduled, progress, completed' },
          { status: 400 }
        );
      }
    }

    const updatedTask = updateTask(id, updates);
    
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const success = deleteTask(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Task not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}