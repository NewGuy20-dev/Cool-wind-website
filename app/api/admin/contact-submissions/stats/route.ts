import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get contact submission statistics by calculating from the table
    const { data: submissions, error: statsError } = await supabase
      .from('contact_submissions')
      .select('id, status, is_urgent, created_at, service')

    if (statsError) {
      console.error('Database error:', statsError)
      return NextResponse.json({ error: 'Failed to fetch submissions for stats' }, { status: 500 })
    }

    // Calculate stats from data
    const stats = {
      total_submissions: submissions.length,
      pending_count: submissions.filter(s => s.status === 'pending').length,
      contacted_count: submissions.filter(s => s.status === 'contacted').length,
      in_progress_count: submissions.filter(s => s.status === 'in_progress').length,
      completed_count: submissions.filter(s => s.status === 'completed').length,
      urgent_count: submissions.filter(s => s.is_urgent).length,
      today_count: submissions.filter(s => {
        const today = new Date().toDateString()
        return new Date(s.created_at).toDateString() === today
      }).length
    }

    // Get recent submissions (last 10)
    const { data: recentSubmissions, error: recentError } = await supabase
      .from('contact_submissions')
      .select('id, name, phone, service, is_urgent, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('Database error fetching recent submissions:', recentError)
      return NextResponse.json({ error: 'Failed to fetch recent submissions' }, { status: 500 })
    }

    // Calculate service breakdown from submissions data
    const serviceBreakdown = submissions.reduce((acc: any[], sub) => {
      const existing = acc.find(s => s.service === sub.service)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ service: sub.service, count: 1 })
      }
      return acc
    }, []).sort((a, b) => b.count - a.count)


    return NextResponse.json({
      stats,
      recentSubmissions,
      serviceBreakdown
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
