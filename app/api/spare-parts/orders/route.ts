import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createOrderSchema, orderFiltersSchema } from '@/lib/spare-parts/validation';
import { generateOrderNumber, calculatePrice, getUnitPrice } from '@/lib/spare-parts/utils';
import { sendBulkOrderEmails } from '@/lib/email/send';
import type { BulkOrder, OrdersResponse, SparePart } from '@/lib/spare-parts/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts/orders - List orders (Admin only)
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
    
    const filters = {
      status: searchParams.get('status') || undefined,
      customer_email: searchParams.get('customer_email') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };

    const validated = orderFiltersSchema.parse(filters);

    // Build query
    let query = supabase
      .from('spare_parts_orders')
      .select('*', { count: 'exact' })
      .eq('archived', false); // Exclude archived orders

    // Apply filters
    if (validated.status) {
      query = query.eq('status', validated.status);
    }
    if (validated.customer_email) {
      query = query.eq('customer_email', validated.customer_email);
    }
    if (validated.date_from) {
      query = query.gte('created_at', validated.date_from);
    }
    if (validated.date_to) {
      query = query.lte('created_at', validated.date_to);
    }

    // Sort by newest first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (validated.page - 1) * validated.limit;
    const to = from + validated.limit - 1;
    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    // Get stats
    const { data: allOrders } = await supabase
      .from('spare_parts_orders')
      .select('status, total_amount')
      .eq('archived', false); // Exclude archived orders from stats

    const stats = {
      pending: allOrders?.filter(o => o.status === 'pending').length || 0,
      confirmed: allOrders?.filter(o => o.status === 'confirmed').length || 0,
      processing: allOrders?.filter(o => o.status === 'processing').length || 0,
      delivered: allOrders?.filter(o => o.status === 'delivered').length || 0,
      cancelled: allOrders?.filter(o => o.status === 'cancelled').length || 0,
      total_value: allOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
    };

    const response: OrdersResponse = {
      orders: orders as BulkOrder[],
      total: count || 0,
      page: validated.page,
      pages: Math.ceil((count || 0) / validated.limit),
      stats,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts/orders:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}

// POST /api/spare-parts/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    // Get parts details
    const partIds = validated.items.map(item => item.part_id);
    const { data: parts, error: partsError } = await supabase
      .from('spare_parts')
      .select('*')
      .in('id', partIds);

    if (partsError || !parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'Parts not found' },
        { status: 404 }
      );
    }

    // Calculate order details
    const items = validated.items.map(item => {
      const part = parts.find(p => p.id === item.part_id) as SparePart;
      if (!part) {
        throw new Error(`Part ${item.part_id} not found`);
      }

      const unitPrice = getUnitPrice(part, item.quantity);
      const totalPrice = calculatePrice(part, item.quantity);

      return {
        part_id: item.part_id,
        part_name: part.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);
    const regularTotal = items.reduce((sum, item) => sum + (item.quantity * parts.find(p => p.id === item.part_id)!.price), 0);
    const discountAmount = regularTotal - totalAmount;
    const bulkDiscountApplied = discountAmount > 0;

    // Generate order number
    const { data: todayOrders } = await supabase
      .from('spare_parts_orders')
      .select('id')
      .gte('created_at', new Date().toISOString().split('T')[0]);
    
    const orderNumber = generateOrderNumber((todayOrders?.length || 0) + 1);

    // Create order
    const orderData = {
      order_number: orderNumber,
      customer_name: validated.customer_name,
      customer_phone: validated.customer_phone,
      customer_email: validated.customer_email,
      delivery_location: validated.delivery_location,
      items,
      total_amount: totalAmount,
      bulk_discount_applied: bulkDiscountApplied,
      discount_amount: discountAmount,
      status: 'pending',
      source: validated.source || 'form',
      chat_conversation_id: validated.chat_conversation_id,
      customer_notes: validated.customer_notes,
    };

    const { data: order, error: orderError } = await supabase
      .from('spare_parts_orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Send email notifications
    try {
      await sendBulkOrderEmails({
        order: order as BulkOrder,
        items_with_details: items.map(item => ({
          ...item,
          part: parts.find(p => p.id === item.part_id) as SparePart,
        })),
        whatsapp_link: `https://wa.me/918547229991?text=${encodeURIComponent(`Order ${orderNumber} - I'd like to discuss this order`)}`,
      });
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json(
      {
        success: true,
        order,
        order_number: orderNumber,
        whatsapp_link: `https://wa.me/918547229991?text=${encodeURIComponent(`Order ${orderNumber}`)}`,
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/spare-parts/orders:', error);
    return NextResponse.json(
      { error: 'Invalid request', message: error.message },
      { status: 400 }
    );
  }
}
