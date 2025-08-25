import { NextRequest, NextResponse } from 'next/server';
import { TaskStorage, TaskData } from '@/lib/storage/task-storage';

// Simple admin authentication (in production, use proper auth)
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

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
    const tasks = TaskStorage.getAll();
    const analytics = TaskStorage.getAnalytics();

    return NextResponse.json({
      tasks,
      analytics,
      success: true
    });
  } catch (error) {
    console.error('Admin API error:', error);
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
    const { taskId, status } = await request.json();
    
    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Task ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update task status
    const updated = TaskStorage.update(taskId, { status });
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Admin updated task ${taskId} to status: ${status}`);
    
    return NextResponse.json({
      success: true,
      message: 'Task status updated'
    });
  } catch (error) {
    console.error('Admin task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}