import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

/**
 * Failed Calls API Route
 * Provides compatibility with the existing admin dashboard by filtering tasks that originated from failed calls
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get tasks that originated from failed calls
    const searchParams_ = {
      source: 'chat-failed-call' as const,
      limit: limit,
      page: 1
    };

    const result = await TaskService.searchTasks(searchParams_);

    if (!result || !result.tasks) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch failed calls data' 
        },
        { status: 500 }
      );
    }

    // Map tasks to failed calls format (for backwards compatibility)
    const failedCalls = result.tasks.map(task => ({
      id: task.id,
      taskNumber: task.task_number,
      customerName: task.customer_name,
      phoneNumber: task.phone_number,
      problemDescription: task.problem_description,
      status: task.status,
      priority: task.priority,
      location: task.location,
      source: task.source,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      
      // Failed call specific fields
      triggerPhrase: extractTriggerPhrase(task),
      callbackRequested: true, // All failed call tasks are callback requests
      originalMessage: extractOriginalMessage(task),
      urgencyLevel: mapPriorityToUrgency(task.priority),
      urgencyKeywords: task.urgency_keywords || [],
      chatContext: task.chat_context,
      
      // Additional metadata
      title: task.title,
      description: task.description,
      category: task.category,
      aiPriorityReason: task.ai_priority_reason,
      metadata: task.metadata
    }));

    return NextResponse.json({
      success: true,
      data: failedCalls,
      count: failedCalls.length,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Failed calls API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch failed calls data' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create task with failed call source
    const taskData = {
      ...body,
      source: 'chat-failed-call' as const,
      // Map failed call fields to task fields
      customerName: body.customerName || body.customer_name,
      phoneNumber: body.phoneNumber || body.phone_number,
      problemDescription: body.problemDescription || body.problem_description || body.originalMessage,
      metadata: {
        ...body.metadata,
        triggerPhrase: body.triggerPhrase,
        callbackRequested: body.callbackRequested || true,
        originalMessage: body.originalMessage,
        urgencyLevel: body.urgencyLevel,
        created_by: 'failed-calls-api'
      }
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

    // Map back to failed call format
    const task = result.data!;
    const failedCall = {
      id: task.id,
      taskNumber: task.task_number,
      customerName: task.customer_name,
      phoneNumber: task.phone_number,
      problemDescription: task.problem_description,
      status: task.status,
      priority: task.priority,
      location: task.location,
      source: task.source,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      triggerPhrase: body.triggerPhrase,
      callbackRequested: true,
      originalMessage: body.originalMessage || task.problem_description,
      urgencyLevel: mapPriorityToUrgency(task.priority),
      urgencyKeywords: task.urgency_keywords || []
    };

    return NextResponse.json({
      success: true,
      data: failedCall,
      message: 'Failed call record created successfully'
    });

  } catch (error) {
    console.error('❌ Failed call creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create failed call record' 
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
          error: 'Failed call ID is required' 
        },
        { status: 400 }
      );
    }

    // Map failed call updates to task updates
    const taskUpdates = {
      ...updates,
      customer_name: updates.customerName || updates.customer_name,
      phone_number: updates.phoneNumber || updates.phone_number,
      problem_description: updates.problemDescription || updates.problem_description || updates.originalMessage,
      metadata: {
        ...updates.metadata,
        triggerPhrase: updates.triggerPhrase,
        callbackRequested: updates.callbackRequested,
        originalMessage: updates.originalMessage,
        urgencyLevel: updates.urgencyLevel,
        updated_by: 'failed-calls-api'
      }
    };

    const result = await TaskService.updateTask(id, taskUpdates);
    
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
      message: 'Failed call record updated successfully'
    });

  } catch (error) {
    console.error('❌ Failed call update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update failed call record' 
      },
      { status: 500 }
    );
  }
}

// Helper functions
function extractTriggerPhrase(task: any): string | null {
  // Try to extract trigger phrase from metadata or chat context
  if (task.metadata?.triggerPhrase) {
    return task.metadata.triggerPhrase;
  }
  
  if (task.metadata?.original_request?.triggerPhrase) {
    return task.metadata.original_request.triggerPhrase;
  }
  
  // Try to infer from chat context
  if (task.chat_context && Array.isArray(task.chat_context)) {
    const userMessages = task.chat_context.filter((msg: any) => msg.role === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content || '';
      
      // Common failed call patterns
      const patterns = [
        'called number in this website but it didn\'t respond',
        'called but no response',
        'phone didn\'t respond',
        'couldn\'t reach you',
        'tried calling but no answer'
      ];
      
      for (const pattern of patterns) {
        if (firstMessage.toLowerCase().includes(pattern)) {
          return pattern;
        }
      }
    }
  }
  
  return 'Failed call detected';
}

function extractOriginalMessage(task: any): string {
  // Try to extract original message from metadata or chat context
  if (task.metadata?.originalMessage) {
    return task.metadata.originalMessage;
  }
  
  if (task.metadata?.original_request?.originalMessage) {
    return task.metadata.original_request.originalMessage;
  }
  
  if (task.chat_context && Array.isArray(task.chat_context)) {
    const userMessages = task.chat_context.filter((msg: any) => msg.role === 'user');
    if (userMessages.length > 0) {
      return userMessages[0].content || task.problem_description;
    }
  }
  
  return task.problem_description;
}

function mapPriorityToUrgency(priority: string): 'high' | 'medium' | 'low' {
  switch (priority) {
    case 'urgent':
      return 'high';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}