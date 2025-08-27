import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/ticket-service';

// GET /api/tickets/[id] - Get a specific ticket
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

    const ticket = await TicketService.getTicketById(ticketId);
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
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

    const updatedTicket = await TicketService.updateTicket(ticketId, updates);
    
    if (!updatedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: `Ticket ${updatedTicket.ticketNumber} updated successfully`
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

    // Instead of deleting, mark as cancelled
    const cancelledTicket = await TicketService.updateTicket(ticketId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });
    
    if (!cancelledTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Add communication entry
    await TicketService.addCommunication(ticketId, {
      type: 'internal_note',
      direction: 'internal',
      content: 'Ticket cancelled via API',
      author: 'admin'
    });
    
    return NextResponse.json({
      success: true,
      data: cancelledTicket,
      message: `Ticket ${cancelledTicket.ticketNumber} cancelled successfully`
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