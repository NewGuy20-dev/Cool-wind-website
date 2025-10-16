import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPartSchema, partFiltersSchema } from '@/lib/spare-parts/validation';
import type { SparePart, PartsResponse } from '@/lib/spare-parts/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts - List parts with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate filters
    const filters = {
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      sub_category: searchParams.get('sub_category') || undefined,
      search: searchParams.get('search') || undefined,
      in_stock: searchParams.get('in_stock') === 'true' ? true : undefined,
      is_genuine: searchParams.get('is_genuine') === 'true' ? true : undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };

    const validated = partFiltersSchema.parse(filters);

    // Build query
    let query = supabase
      .from('spare_parts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (validated.category) {
      query = query.eq('category', validated.category);
    }
    if (validated.brand) {
      query = query.eq('brand', validated.brand);
    }
    if (validated.sub_category) {
      query = query.eq('sub_category', validated.sub_category);
    }
    if (validated.search) {
      query = query.or(`name.ilike.%${validated.search}%,part_code.ilike.%${validated.search}%,brand.ilike.%${validated.search}%`);
    }
    if (validated.in_stock) {
      query = query.gt('stock_quantity', 0);
    }
    if (validated.is_genuine !== undefined) {
      query = query.eq('is_genuine', validated.is_genuine);
    }
    if (validated.min_price) {
      query = query.gte('price', validated.min_price);
    }
    if (validated.max_price) {
      query = query.lte('price', validated.max_price);
    }

    // Only show available parts to public
    query = query.eq('is_available', true);

    // Apply sorting
    switch (validated.sort) {
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (validated.page - 1) * validated.limit;
    const to = from + validated.limit - 1;
    query = query.range(from, to);

    const { data: parts, error, count } = await query;

    if (error) {
      console.error('Error fetching parts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch parts', details: error.message },
        { status: 500 }
      );
    }

    // Get filter metadata
    const { data: allParts } = await supabase
      .from('spare_parts')
      .select('category, brand, price')
      .eq('is_available', true);

    const categories = Array.from(new Set(allParts?.map(p => p.category) || []));
    const brands = Array.from(new Set(allParts?.map(p => p.brand).filter(Boolean) || []));
    const prices = allParts?.map(p => p.price) || [];
    
    const response: PartsResponse = {
      parts: parts as SparePart[],
      total: count || 0,
      page: validated.page,
      pages: Math.ceil((count || 0) / validated.limit),
      filters: {
        categories: categories.map(cat => ({
          name: cat,
          count: allParts?.filter(p => p.category === cat).length || 0,
        })),
        brands: brands.map(brand => ({
          name: brand,
          count: allParts?.filter(p => p.brand === brand).length || 0,
        })),
        price_range: {
          min: Math.min(...prices, 0),
          max: Math.max(...prices, 0),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}

// POST /api/spare-parts - Create new part (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createPartSchema.parse(body);

    // Insert into database
    const { data: part, error } = await supabase
      .from('spare_parts')
      .insert([validated])
      .select()
      .single();

    if (error) {
      console.error('Error creating part:', error);
      return NextResponse.json(
        { error: 'Failed to create part', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, part, message: 'Part created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/spare-parts:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}
