import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';
import { env, getEnvPresence } from '@/lib/env';
import { logDatabaseOperation } from '@/lib/supabase/server';

/**
 * Tasks API Route
 * Native API for tasks without ticket compatibility layer
 * No silent mock fallbacks - all errors are explicit
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const route = '/api/tasks';
  
  try {
    // Log environment status (no secrets)
    console.log(`[${route}] ENV status:`, getEnvPresence());
    
    // Handle explicit mock mode
    if (env.USE_MOCK_DATA) {
      const mockData = [
        {
          id: 'mock-1',
          task_number: 'MOCK-001',
          customer_name: 'Mock Customer',
          phone_number: '9999999999',
          title: 'Mock Task',
          problem_description: 'This is mock data',
          status: 'pending',
          priority: 'medium',
          source: 'mock',
          created_at: new Date().toISOString(),
        }
      ];
      
      console.warn(`[${route}] USE_MOCK_DATA=true, returning mock data`);
      logDatabaseOperation('getMockTasks', {
        success: true,
        duration: Date.now() - startTime,
        metadata: { source: 'mock', count: mockData.length }
      });
      
      return NextResponse.json({
        success: true,
        data: mockData,
        source: 'mock',
        count: mockData.length
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;

    // Attempt real database query
    const result = await TaskService.getAllTasks(status, priority, limit, { admin: true });

    // Handle database errors explicitly
    if (!result.success) {
      const duration = Date.now() - startTime;
      logDatabaseOperation('getAllTasks', {
        success: false,
        duration,
        error: result.error,
        metadata: { status, priority, limit }
      });
      
      return NextResponse.json(
        { 
          error: 'DB_ERROR',
          message: result.error,
          success: false
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logDatabaseOperation('getAllTasks', {
      success: true,
      duration,
      metadata: { 
        source: 'database',
        count: result.data?.length || 0,
        status,
        priority,
        limit
      }
    });

    return NextResponse.json({
      success: true,
      data: result.data || [],
      source: 'database',
      count: result.data?.length || 0
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logDatabaseOperation('getAllTasks', {
      success: false,
      duration,
      error,
      metadata: { route }
    });
    
    console.error(`[${route}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'UNEXPECTED',
        message: error.message || 'Unknown error occurred',
        success: false
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