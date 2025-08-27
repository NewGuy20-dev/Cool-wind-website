import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/ticket-service';

// GET /api/tickets/stats - Get ticket statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await TicketService.getTicketStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ticket statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}