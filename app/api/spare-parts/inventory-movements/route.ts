import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts/inventory-movements - Get movement history
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const partId = searchParams.get('part_id');
    const movementType = searchParams.get('movement_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('inventory_movements')
      .select('*, spare_parts(name, part_code)', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (partId) {
      query = query.eq('part_id', partId);
    }
    if (movementType) {
      query = query.eq('movement_type', movementType);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: movements, error, count } = await query;

    if (error) {
      console.error('Error fetching movements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch movements', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      movements: movements || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts/inventory-movements:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}

// POST /api/spare-parts/inventory-movements - Create movement record
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
    const {
      part_id,
      movement_type,
      quantity_change,
      quantity_before,
      quantity_after,
      reason,
      notes,
      performed_by,
    } = body;

    // Validate required fields
    if (!part_id || !movement_type || quantity_change === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert movement record
    const { data: movement, error } = await supabase
      .from('inventory_movements')
      .insert([{
        part_id,
        movement_type,
        quantity_change,
        quantity_before: quantity_before || 0,
        quantity_after: quantity_after || 0,
        reason: reason || null,
        notes: notes || null,
        performed_by: performed_by || 'admin',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating movement:', error);
      return NextResponse.json(
        { error: 'Failed to create movement', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      movement,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/spare-parts/inventory-movements:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}
