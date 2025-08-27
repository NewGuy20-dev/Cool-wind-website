import { NextRequest, NextResponse } from 'next/server';
import { TicketService, TicketCreationRequest } from '@/lib/ticket-service';

// GET /api/tickets - Get all tickets with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters for filtering
    const filters = {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      serviceType: searchParams.get('serviceType') || undefined,
      assignedTechnician: searchParams.get('assignedTechnician') || undefined,
      customerName: searchParams.get('customerName') || undefined,
      phoneNumber: searchParams.get('phoneNumber') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') ? {
        start: searchParams.get('startDate')!,
        end: searchParams.get('endDate')!
      } : undefined
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    const tickets = await TicketService.getTickets(cleanFilters);
    
    return NextResponse.json({
      success: true,
      data: tickets,
      total: tickets.length
    });
    
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['customerName', 'phoneNumber', 'location', 'serviceType', 'appliance', 'problemDescription'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      );
    }

    // Create ticket creation request
    const ticketRequest: TicketCreationRequest = {
      customerName: body.customerName,
      phoneNumber: body.phoneNumber,
      email: body.email,
      location: body.location,
      serviceType: body.serviceType,
      appliance: body.appliance,
      problemDescription: body.problemDescription,
      urgency: body.urgency || 'medium',
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      source: body.source || 'website',
      customerNotes: body.customerNotes,
      relatedFailedCallId: body.relatedFailedCallId
    };

    const ticket = await TicketService.createTicket(ticketRequest);
    
    return NextResponse.json({
      success: true,
      data: ticket,
      message: `Ticket ${ticket.ticketNumber} created successfully`
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/tickets - Bulk update tickets (for admin operations)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketIds, updates } = body;
    
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ticketIds array is required' },
        { status: 400 }
      );
    }
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'updates object is required' },
        { status: 400 }
      );
    }

    const results = [];
    for (const ticketId of ticketIds) {
      try {
        const updatedTicket = await TicketService.updateTicket(ticketId, updates);
        results.push({ ticketId, success: true, data: updatedTicket });
      } catch (error) {
        results.push({ 
          ticketId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Update failed' 
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount}/${ticketIds.length} tickets updated successfully`,
      results
    });
    
  } catch (error) {
    console.error('Error bulk updating tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to bulk update tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}