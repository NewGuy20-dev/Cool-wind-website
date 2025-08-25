import { NextRequest, NextResponse } from 'next/server';

// Simple admin authentication (in production, use proper auth)
function isValidAdminRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY || 'admin123'; // Set this in production
  
  return authHeader === `Bearer ${adminKey}`;
}

export async function GET(request: NextRequest) {
  // Basic admin authentication
  if (!isValidAdminRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    // Get tasks from the task creation API
    const tasksResponse = await fetch(`${request.nextUrl.origin}/api/tasks/auto-create`);
    
    if (!tasksResponse.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasksData = await tasksResponse.json();
    
    // Add some analytics
    const tasks = tasksData.tasks || [];
    const analytics = {
      totalTasks: tasks.length,
      tasksByPriority: {
        high: tasks.filter((t: any) => t.priority === 'high').length,
        medium: tasks.filter((t: any) => t.priority === 'medium').length,
        low: tasks.filter((t: any) => t.priority === 'low').length
      },
      tasksByStatus: {
        new: tasks.filter((t: any) => t.status === 'new').length,
        in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
        cancelled: tasks.filter((t: any) => t.status === 'cancelled').length
      },
      recentTasks: tasks
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    };

    return NextResponse.json({
      success: true,
      analytics,
      tasks: tasks
    });

  } catch (error) {
    console.error('Admin tasks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks data' },
      { status: 500 }
    );
  }
}

// Update task status
export async function PATCH(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    const { taskId, status, notes } = await request.json();
    
    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Task ID and status are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the task in database
    // For now, just log the update
    console.log('📝 ADMIN TASK UPDATE:', {
      taskId,
      status,
      notes,
      updatedBy: 'admin',
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully'
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