import { NextRequest, NextResponse } from 'next/server'
import { queryTestimonials, insertTestimonial } from '@/lib/supabase/direct-query'

// GET - Fetch testimonials
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const status = searchParams.get('status') || 'approved'
    const limit = parseInt(searchParams.get('limit') || '100')
    const featured = searchParams.get('featured') === 'true'
    const homepage = searchParams.get('homepage') === 'true'
    
    const { data, error } = await queryTestimonials({
      status,
      featured: featured || undefined,
      homepage: homepage || undefined,
      limit
    })
    
    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json(
        { error: 'Failed to fetch testimonials', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ testimonials: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customer_name,
      location,
      phone_number,
      email,
      review_text,
      rating,
      service_type,
      service_details,
      service_date
    } = body
    
    // Validation
    if (!customer_name || !review_text || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, review_text, rating' },
        { status: 400 }
      )
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    if (review_text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review text must be at least 10 characters' },
        { status: 400 }
      )
    }
    
    const { data, error } = await insertTestimonial({
      customer_name: customer_name.trim(),
      location: location?.trim(),
      phone_number: phone_number?.trim(),
      email: email?.trim(),
      review_text: review_text.trim(),
      rating,
      service_type: service_type?.trim(),
      service_details: service_details?.trim(),
      service_date,
      status: 'approved',
      approved_at: new Date().toISOString()
    })
    
    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json(
        { error: 'Failed to create testimonial' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ testimonial: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
