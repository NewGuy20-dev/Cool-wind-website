import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    
    if (!since) {
      return NextResponse.json({ error: 'Since parameter is required' }, { status: 400 });
    }

    // Check for new tasks created since the last check
    // Exclude tasks created via admin panel by checking source field
    const { data: newTickets, error } = await supabase
      .from('tasks')
      .select('id, created_at, customer_name, problem_description, source')
      .gte('created_at', since)
      .neq('source', 'admin-manual') // Exclude admin-created tasks
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking notifications:', error);
      return NextResponse.json({ error: 'Failed to check notifications' }, { status: 500 });
    }

    // Check for task status updates that weren't made by admin
    const { data: updatedTickets, error: updateError } = await supabase
      .from('tasks')
      .select('id, updated_at, customer_name, status')
      .gte('updated_at', since)
      .neq('source', 'admin-manual') // Exclude admin updates
      .order('updated_at', { ascending: false });

    if (updateError) {
      console.error('Error checking ticket updates:', error);
      return NextResponse.json({ error: 'Failed to check ticket updates' }, { status: 500 });
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

  } catch (error) {
    console.error('Error in notifications check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
