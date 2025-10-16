import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateOrderSchema } from '@/lib/spare-parts/validation';
import { sendOrderStatusUpdate } from '@/lib/email/send';
import type { BulkOrder, OrderStatus } from '@/lib/spare-parts/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const { data: order, error } = await supabase
      .from('spare_parts_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/spare-parts/orders/[id] - Update order (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const validated = updateOrderSchema.parse(body);

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('spare_parts_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = currentOrder.status as OrderStatus;

    // Prepare update data
    const updateData: any = { ...validated };

    // Add timestamp for status changes
    if (validated.status) {
      if (validated.status === 'confirmed' && !currentOrder.confirmed_at) {
        updateData.confirmed_at = new Date().toISOString();
      }
      if (validated.status === 'delivered' && !currentOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
    }

    // Update in database
    const { data: order, error: updateError } = await supabase
      .from('spare_parts_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order', details: updateError.message },
        { status: 500 }
      );
    }

    // Send status update email if status changed
    if (validated.status && validated.status !== oldStatus) {
      try {
        await sendOrderStatusUpdate({
          order: order as BulkOrder,
          old_status: oldStatus,
          new_status: validated.status,
        });
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Order updated successfully',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/spare-parts/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}


// DELETE /api/spare-parts/orders/[id] - Delete order (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Check if order exists and is cancelled
    const { data: order, error: fetchError } = await supabase
      .from('spare_parts_orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of cancelled orders
    if (order.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Only cancelled orders can be deleted' },
        { status: 400 }
      );
    }

    // Delete the order
    const { error: deleteError } = await supabase
      .from('spare_parts_orders')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting order:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete order', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/spare-parts/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}
