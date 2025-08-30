import { NextRequest, NextResponse } from 'next/server';
import { createTaskRaw } from "@/services/taskService";
import { envPresence } from "@/lib/env";
import { TaskService } from '@/lib/supabase/tasks';
import { TaskStatus, TaskPriority } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  console.log("[DEBUG] === API Route Start ===");
  console.log("[DEBUG] Method:", req.method);
  // For some reason req.headers is a Headers object, not a plain object
  const headersObject = {};
  req.headers.forEach((value, key) => {
    headersObject[key] = value;
  });
  console.log("[DEBUG] Headers:", JSON.stringify(headersObject, null, 2));

  let body;
  try {
    body = await req.json();
    console.log("[DEBUG] Body:", JSON.stringify(body, null, 2));
  } catch (e) {
    console.error("[DEBUG] Error parsing JSON body", e);
    body = {};
  }
  
  try {
    console.log("[DEBUG] ENV Status:", JSON.stringify(envPresence(), null, 2));
  } catch (e) {
    console.error("[DEBUG] Error getting env presence", e);
  }


  if (req.method !== "POST") {
    console.log("[DEBUG] Method not allowed:", req.method);
    return NextResponse.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
  }

  try {
    console.log("[DEBUG] About to call createTaskRaw...");
    const created = await createTaskRaw(body || {});
    console.log("[DEBUG] Task created successfully:", JSON.stringify(created, null, 2));
    return NextResponse.json({ data: created, source: "db" }, { status: 201 });
  } catch (err: any) {
    console.error("[ERROR] === Full Error Details ===");
    console.error("[ERROR] Error name:", err.name);
    console.error("[ERROR] Error message:", err.message);
    console.error("[ERROR] Error stack:", err.stack);
    console.error("[ERROR] Error details:", JSON.stringify(err.details, null, 2));
    const errorObject = {};
    for (const key of Object.getOwnPropertyNames(err)) {
        errorObject[key] = err[key];
    }
    console.error("[ERROR] Full error object:", JSON.stringify(errorObject, null, 2));
    
    // Return detailed error info for debugging (remove in production)
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        error: "DETAILED_DEBUG_ERROR",
        message: err.message,
        stack: err.stack,
        details: err.details,
        name: err.name
      }, { status: 500 });
    }
    
    if (err.message === "VALIDATION_FAILED") {
      return NextResponse.json({ error: "VALIDATION_FAILED", details: err.details }, { status: 400 });
    }
    if (err.message === "DB_INSERT_FAILED") {
      return NextResponse.json({ error: "DB_INSERT_FAILED", details: err.details ?? err.message }, { status: 500 });
    }
    return NextResponse.json({
      error: "TASK_CREATION_FAILED",
      message: err.message || "Unknown error",
      details: err.details || null
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // Get specific task
      const result = await TaskService.getTaskById(taskId);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error }, 
          { status: result.error === 'Task not found' ? 404 : 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        task: result.data
      });
    }

    // Get all tasks with optional filtering
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const limit = parseInt(searchParams.get('limit') || '100');

    const result = await TaskService.getAllTasks(
      status || undefined,
      priority || undefined,
      limit
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      tasks: result.data,
      count: result.data?.length || 0
    });

  } catch (error) {
    console.error('❌ Task retrieval error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve tasks'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}