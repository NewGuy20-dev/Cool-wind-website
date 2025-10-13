import { NextRequest, NextResponse } from 'next/server'
import { getTestimonialById, updateTestimonial, deleteTestimonial } from '@/lib/supabase/direct-query'

// GET - Fetch single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { data, error } = await getTestimonialById(id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ testimonial: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update testimonial
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      service_date,
      status,
      is_featured,
      display_on_homepage
    } = body
    
    const updates: any = {}
    
    if (customer_name !== undefined) updates.customer_name = customer_name.trim()
    if (location !== undefined) updates.location = location?.trim()
    if (phone_number !== undefined) updates.phone_number = phone_number?.trim()
    if (email !== undefined) updates.email = email?.trim()
    if (review_text !== undefined) updates.review_text = review_text.trim()
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        )
      }
      updates.rating = rating
    }
    if (service_type !== undefined) updates.service_type = service_type?.trim()
    if (service_details !== undefined) updates.service_details = service_details?.trim()
    if (service_date !== undefined) updates.service_date = service_date
    if (status !== undefined) {
      updates.status = status
      if (status === 'approved' && !updates.approved_at) {
        updates.approved_at = new Date().toISOString()
      }
    }
    if (is_featured !== undefined) updates.is_featured = is_featured
    if (display_on_homepage !== undefined) updates.display_on_homepage = display_on_homepage
    
    const { data, error } = await updateTestimonial(id, updates)
    
    if (error) {
      console.error('Error updating testimonial:', error)
      return NextResponse.json(
        { error: 'Failed to update testimonial' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ testimonial: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { error } = await deleteTestimonial(id)
    
    if (error) {
      console.error('Error deleting testimonial:', error)
      return NextResponse.json(
        { error: 'Failed to delete testimonial' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
