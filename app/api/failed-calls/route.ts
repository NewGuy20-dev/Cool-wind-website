import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '../../../lib/failed-calls-db';

export async function GET(request: NextRequest) {
  try {
    const tasks = getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phoneNumber, problemDescription, priority, status, callbackPreference, notes } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !problemDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, phoneNumber, problemDescription' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['high', 'medium', 'low'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be one of: high, medium, low' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['new', 'unavailable', 'scheduled', 'progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: new, unavailable, scheduled, progress, completed' },
        { status: 400 }
      );
    }

    const newTask = createTask({
      customerName,
      phoneNumber,
      problemDescription,
      priority: priority || 'medium',
      status: status || 'new',
      attemptCount: 0,
      callbackPreference,
      notes,
    });

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}