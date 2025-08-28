import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';
import { mapApiToDb, mapDbToApi } from '@/src/lib/mappers/tasks';

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
    // Expect body in camelCase (from upstream webhooks)
    const { source, externalId } = body;
    if (!source) {
      return new NextResponse('Bad Request: missing source', { status: 400 });
    }

    // idempotency / loop protection: dedupe by source + external_id
    if (externalId) {
      const existing = await TaskService.findBySourceAndExternalId(source, externalId);
      if (existing) {
        return NextResponse.json({ data: mapDbToApi(existing) }, { status: 200 });
      }
    }

    // Create task with failed call source using the existing TaskService API
    const taskData = {
      customer_name: body.customerName || 'Unknown Customer',
      phone_number: body.phoneNumber || '0000000000',
      title: body.title ?? `Failed call: ${source}`,
      description: body.description ?? null,
      problem_description: body.originalMessage || body.description || `Failed call from ${source}`,
      status: 'pending' as const,
      priority: 'medium' as const,
      source: 'chat-failed-call' as const,
      metadata: {
        external_id: externalId,
        triggerPhrase: body.triggerPhrase,
        originalMessage: body.originalMessage,
        created_by: 'failed-calls-api'
      }
    };
    
    const result = await TaskService.createTask(taskData);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false,
        error: result.error 
      }, { status: 500 });
    }

    const apiOut = result.data ? mapDbToApi(result.data) : null;
    return NextResponse.json({ data: apiOut }, { status: 201 });
  } catch (err) {
    console.error('failed-calls POST error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
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