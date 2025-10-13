// Direct PostgreSQL query helper to bypass PostgREST schema cache issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Direct query using URL:', supabaseUrl)

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    db: { schema: 'public' },
    auth: { persistSession: false, autoRefreshToken: false }
  }
)

export async function queryTestimonials(filters: {
  status?: string
  featured?: boolean
  homepage?: boolean
  limit?: number
}) {
  const { status = 'approved', featured, homepage, limit = 100 } = filters
  
  try {
    let query = supabase.from('testimonials').select('*')
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (featured) {
      query = query.eq('is_featured', true)
    }
    
    if (homepage) {
      query = query.eq('display_on_homepage', true)
    }
    
    const { data, error } = await query
      .order('approved_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function insertTestimonial(testimonial: any) {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function updateTestimonial(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)
    
    return { error }
  } catch (err) {
    return { error: err }
  }
}

export async function getTestimonialById(id: string) {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}
