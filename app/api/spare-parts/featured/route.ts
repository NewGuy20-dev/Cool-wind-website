import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { FeaturedParts, SparePart } from '@/lib/spare-parts/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts/featured - Get featured/popular parts
export async function GET() {
  try {
    // Get featured parts (lowest stock - implies popular)
    const { data: featured, error: featuredError } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .order('stock_quantity', { ascending: true })
      .limit(8);

    if (featuredError) {
      console.error('Error fetching featured parts:', featuredError);
    }

    // Get popular parts (with bulk pricing - implies high demand)
    const { data: popular, error: popularError } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('is_available', true)
      .not('bulk_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8);

    if (popularError) {
      console.error('Error fetching popular parts:', popularError);
    }

    // Get new arrivals
    const { data: newArrivals, error: newError } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (newError) {
      console.error('Error fetching new arrivals:', newError);
    }

    const response: FeaturedParts = {
      featured: (featured || []) as SparePart[],
      popular: (popular || []) as SparePart[],
      new_arrivals: (newArrivals || []) as SparePart[],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts/featured:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured parts', message: error.message },
      { status: 500 }
    );
  }
}
