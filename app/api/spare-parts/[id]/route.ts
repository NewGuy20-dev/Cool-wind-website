import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updatePartSchema } from '@/lib/spare-parts/validation';
import type { SparePart, PartWithRelated } from '@/lib/spare-parts/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts/[id] - Get single part with related parts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Get the part
    const { data: part, error } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('id', id)
      .eq('is_available', true)
      .single();

    if (error || !part) {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      );
    }

    // Get related parts (same category and brand, or same sub_category)
    const { data: relatedParts } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('is_available', true)
      .neq('id', id)
      .or(`and(category.eq.${part.category},brand.eq.${part.brand}),sub_category.eq.${part.sub_category}`)
      .limit(6);

    const response: PartWithRelated = {
      part: part as SparePart,
      related_parts: (relatedParts || []) as SparePart[],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch part', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/spare-parts/[id] - Update part (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const validated = updatePartSchema.parse({ ...body, id });

    // Remove id from update data
    const { id: _, ...updateData } = validated;

    // Update in database
    const { data: part, error } = await supabase
      .from('spare_parts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating part:', error);
      return NextResponse.json(
        { error: 'Failed to update part', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      part,
      message: 'Part updated successfully',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/spare-parts/[id]:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/spare-parts/[id] - Delete part (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Delete from database
    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting part:', error);
      return NextResponse.json(
        { error: 'Failed to delete part', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Part deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/spare-parts/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete part', message: error.message },
      { status: 500 }
    );
  }
}
