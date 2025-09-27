import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface Ticket {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  problem_description?: string;
  status?: string;
  source?: string;
  updated_by?: string;
}

function formatError(error: unknown) {
  const get = (key: 'message' | 'details' | 'hint' | 'code') => {
    if (error && typeof error === 'object' && key in error) {
      return (error as Record<string, unknown>)[key];
    }
    return undefined;
  };

  const message =
    error instanceof Error
      ? error.message
      : (get('message') as string) || String(error);

  if (process.env.NODE_ENV === 'production') {
    return { message };
  }

  return {
    message,
    details: get('details'),
    hint: get('hint'),
    code: get('code'),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    if (!since) {
      return NextResponse.json({ error: 'Since parameter is required' }, { status: 400 });
    }

    const sinceDate = new Date(since);
    if (Number.isNaN(sinceDate.getTime())) {
      return NextResponse.json({ error: 'Since parameter must be a valid ISO date string' }, { status: 400 });
    }

    const sinceIso = sinceDate.toISOString();

    // DEBUG: Log the Supabase URL being used
    console.log('[DEBUG] Supabase URL:', process.env.SUPABASE_URL);
    console.log('[DEBUG] Supabase Client URL:', (supabaseAdmin as any).supabaseUrl);
    
    // Check for new tasks created since the last check
    // Exclude tasks created via admin panel by checking source field
    const { data: newTickets, error } = await supabaseAdmin
      .from('tasks')
      .select('id, created_at, customer_name, problem_description, source')
      .gte('created_at', sinceIso)
      .neq('source', 'admin-manual') // Exclude admin-created tasks
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking notifications:', error);
      return NextResponse.json(
        {
          error: 'Failed to check notifications',
          info: formatError(error),
        },
        { status: 500 }
      );
    }

    // Check for task status updates that weren't made by admin
    const { data: updatedTickets, error: updateError } = await supabaseAdmin
      .from('tasks')
      .select('id, updated_at, customer_name, status')
      .gte('updated_at', sinceIso)
      .neq('source', 'admin-manual') // Exclude admin updates
      .order('updated_at', { ascending: false });

    if (updateError) {
      console.error('Error checking ticket updates:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to check ticket updates',
          info: formatError(updateError),
        },
        { status: 500 }
      );
    }

    // Combine and deduplicate notifications
    const allNotifications = [
      ...(newTickets || []).map((task: any) => ({
        type: 'new_task',
        id: task.id,
        timestamp: task.created_at,
        message: `New service request from ${task.customer_name}`,
        details: task.problem_description
      })),
      ...(updatedTickets || []).map((task: any) => ({
        type: 'task_update',
        id: task.id,
        timestamp: task.updated_at,
        message: `Task updated by ${task.customer_name}`,
        details: `Status changed to ${task.status}`
      }))
    ];

    // Remove duplicates and sort by timestamp
    const uniqueNotifications = allNotifications
      .filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id && n.type === notification.type)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      hasNew: uniqueNotifications.length > 0,
      count: uniqueNotifications.length,
      notifications: uniqueNotifications.slice(0, 10) // Return max 10 recent notifications
    });

  } catch (error: any) {
    console.error('Error in notifications check:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        info: formatError(error),
      },
      { status: 500 }
    );
  }
}
