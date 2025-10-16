import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchSchema } from '@/lib/spare-parts/validation';
import type { SearchResults, SparePart } from '@/lib/spare-parts/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/spare-parts/search - Search parts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = searchSchema.parse(body);

    // Build search query
    let query = supabase
      .from('spare_parts')
      .select('*', { count: 'exact' })
      .eq('is_available', true);

    // Apply search
    query = query.or(
      `name.ilike.%${validated.query}%,` +
      `part_code.ilike.%${validated.query}%,` +
      `brand.ilike.%${validated.query}%,` +
      `description.ilike.%${validated.query}%`
    );

    // Apply additional filters
    if (validated.filters?.category) {
      query = query.eq('category', validated.filters.category);
    }
    if (validated.filters?.brand) {
      query = query.eq('brand', validated.filters.brand);
    }

    // Limit results
    query = query.limit(validated.limit);

    const { data: results, error, count } = await query;

    if (error) {
      console.error('Error searching parts:', error);
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }

    // Generate suggestions based on search query
    const { data: allParts } = await supabase
      .from('spare_parts')
      .select('name, brand, part_code')
      .eq('is_available', true)
      .limit(100);

    const suggestions = Array.from(
      new Set([
        ...allParts?.map(p => p.name) || [],
        ...allParts?.map(p => p.brand).filter(Boolean) || [],
        ...allParts?.map(p => p.part_code).filter(Boolean) || [],
      ])
    )
      .filter(s => s.toLowerCase().includes(validated.query.toLowerCase()))
      .slice(0, 5);

    const response: SearchResults = {
      results: results as SparePart[],
      suggestions,
      total: count || 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in POST /api/spare-parts/search:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}
