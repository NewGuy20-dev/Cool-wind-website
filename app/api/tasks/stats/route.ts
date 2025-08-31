import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/supabase/tasks';

/**
 * Task Statistics API Route
 * Provides native task statistics for the admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Get task statistics from Supabase with admin privileges
    const result = await TaskService.getTaskStats(startDate, endDate, { admin: true });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }

    // Return native task stats format
    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Task stats API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch task statistics' 
      },
      { status: 500 }
    );
  }
}