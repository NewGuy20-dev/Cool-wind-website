import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

/**
 * Tickets API Route
 * This provides compatibility with the existing admin dashboard by mapping tasks to tickets
 * In the new architecture, tickets and tasks are unified into the tasks table
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;

    // Get tasks and map them to ticket format for backwards compatibility
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

    // Map tasks to ticket format (for backwards compatibility)
    const tickets = result.data?.map(task => ({
      id: task.id,
      ticketNumber: task.task_number,
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
      // Additional ticket-specific fields
      title: task.title,
      description: task.description,
      category: task.category,
      aiPriorityReason: task.ai_priority_reason,
      urgencyKeywords: task.urgency_keywords,
      metadata: task.metadata
    })) || [];

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length
    });

  } catch (error) {
    console.error('❌ Tickets API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tickets' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create task with ticket source
    const taskData = {
      ...body,
      source: 'admin-manual' as const,
      // Map ticket fields to task fields
      customerName: body.customerName || body.customer_name,
      phoneNumber: body.phoneNumber || body.phone_number,
      problemDescription: body.problemDescription || body.problem_description,
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

    // Map back to ticket format
    const task = result.data!;
    const ticket = {
      id: task.id,
      ticketNumber: task.task_number,
      customerName: task.customer_name,
      phoneNumber: task.phone_number,
      problemDescription: task.problem_description,
      status: task.status,
      priority: task.priority,
      location: task.location,
      source: task.source,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      title: task.title,
      description: task.description,
      category: task.category
    };

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    });

  } catch (error) {
    console.error('❌ Ticket creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create ticket' 
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
          error: 'Ticket ID is required' 
        },
        { status: 400 }
      );
    }

    // Map ticket updates to task updates
    const taskUpdates = {
      ...updates,
      customer_name: updates.customerName || updates.customer_name,
      phone_number: updates.phoneNumber || updates.phone_number,
      problem_description: updates.problemDescription || updates.problem_description,
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
      message: 'Ticket updated successfully'
    });

  } catch (error) {
    console.error('❌ Ticket update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update ticket' 
      },
      { status: 500 }
    );
  }
}