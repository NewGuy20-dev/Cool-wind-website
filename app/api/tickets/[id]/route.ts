import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

// GET /api/tickets/[id] - Get a specific ticket (mapped to task)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    const result = await TaskService.getTaskById(ticketId);
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Map task to ticket format for backward compatibility
    const task = result.data;
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
      completedAt: task.completed_at,
      title: task.title,
      description: task.description,
      category: task.category
    };
    
    return NextResponse.json({
      success: true,
      data: ticket
    });
    
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/tickets/[id] - Update a specific ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const updates = await request.json();
    
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
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

    const result = await TaskService.updateTask(ticketId, taskUpdates);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Ticket updated successfully`
    });
    
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id] - Cancel a specific ticket (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the task
    const result = await TaskService.deleteTask(ticketId, 'Ticket cancelled via API');
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Ticket cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}