import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

/**
 * Ticket Statistics API Route
 * Provides statistics for the admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Get task statistics from Supabase
    const result = await TaskService.getTaskStats(startDate, endDate);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }

    const stats = result.data;

    // Format stats for ticket-compatible response
    const ticketStats = {
      totalTickets: stats.total_tasks || 0,
      pendingTickets: stats.pending_tasks || 0,
      inProgressTickets: stats.in_progress_tasks || 0,
      completedTickets: stats.completed_tasks || 0,
      cancelledTickets: stats.cancelled_tasks || 0,
      completionRate: stats.completion_rate || 0,
      avgCompletionTime: stats.avg_completion_time || null,
      
      // Priority breakdown
      highPriorityTickets: stats.high_priority_count || 0,
      urgentPriorityTickets: stats.urgent_priority_count || 0,
      
      // Additional metrics
      todayCreated: 0, // Will be calculated separately if needed
      todayCompleted: 0, // Will be calculated separately if needed
      
      // Performance metrics
      performanceScore: stats.completion_rate || 0,
      avgResolutionHours: stats.avg_completion_time 
        ? Math.round(parseFloat(stats.avg_completion_time.replace(/[^\d.]/g, '')) / 3600)
        : 0,
      
      // Trends (placeholder for future implementation)
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      }
    };

    // Get additional real-time metrics
    try {
      const dashboardResult = await TaskService.getDashboardData();
      if (dashboardResult.success && dashboardResult.data?.overview) {
        const overview = dashboardResult.data.overview;
        ticketStats.todayCreated = overview.today_created || 0;
        ticketStats.todayCompleted = overview.today_completed || 0;
      }
    } catch (error) {
      console.warn('Could not fetch dashboard overview:', error);
    }

    return NextResponse.json({
      success: true,
      data: ticketStats
    });

  } catch (error) {
    console.error('❌ Ticket stats API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch ticket statistics' 
      },
      { status: 500 }
    );
  }
}