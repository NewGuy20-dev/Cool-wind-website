import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation schemas
const UpdateSubmissionSchema = z.object({
  status: z.enum(['pending', 'contacted', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
})

const QuerySchema = z.object({
  status: z.enum(['pending', 'contacted', 'in_progress', 'completed', 'cancelled']).optional(),
  service: z.enum(['spare_parts', 'ac_servicing', 'refrigerator_servicing', 'sales', 'other']).optional(),
  urgent_only: z.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse({
      status: searchParams.get('status') || undefined,
      service: searchParams.get('service') || undefined,
      urgent_only: searchParams.get('urgent_only') === 'true',
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    })

    // Build query
    let supabaseQuery = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1)

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status)
    }
    if (query.service) {
      supabaseQuery = supabaseQuery.eq('service', query.service)
    }
    if (query.urgent_only) {
      supabaseQuery = supabaseQuery.eq('is_urgent', true)
    }

    const { data: submissions, error, count } = await supabaseQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      submissions,
      pagination: {
        total: totalCount || 0,
        limit: query.limit,
        offset: query.offset,
        hasMore: (query.offset + query.limit) < (totalCount || 0)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionIds, ...updateData } = body

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({ error: 'submissionIds array is required' }, { status: 400 })
    }

    // Validate update data
    const validatedData = UpdateSubmissionSchema.parse(updateData)

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Add contacted_at timestamp if status is being changed to 'contacted'
    const updateFields: any = { ...validatedData }
    if (validatedData.status === 'contacted') {
      updateFields.contacted_at = new Date().toISOString()
    }

    // Update submissions
    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updateFields)
      .in('id', submissionIds)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update submissions' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      submissions: data 
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
