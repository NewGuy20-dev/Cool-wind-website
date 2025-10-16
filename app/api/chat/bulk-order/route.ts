import { NextRequest, NextResponse } from 'next/server';
import { detectBulkOrderIntent, generateBulkOrderResponse, createOrderFromChat, searchPartsForChat, type BulkOrderState } from '@/lib/chat/bulk-order-handler';

// POST /api/chat/bulk-order - Handle bulk order conversation
export async function POST(request: NextRequest) {
  try {
    const { message, state, action } = await request.json();

    // Handle different actions
    if (action === 'detect_intent') {
      const isBulkOrder = detectBulkOrderIntent(message);
      return NextResponse.json({ isBulkOrder });
    }

    if (action === 'search_parts') {
      const parts = await searchPartsForChat(message);
      return NextResponse.json({ parts });
    }

    if (action === 'create_order') {
      const result = await createOrderFromChat(state as BulkOrderState, state.chatConversationId);
      return NextResponse.json(result);
    }

    if (action === 'generate_response') {
      // First generate response to check if catalog search is needed
      const initialResponse = generateBulkOrderResponse(state as BulkOrderState, message);
      
      // If order creation is needed, create the order
      if (initialResponse.needsOrderCreation) {
        const orderResult = await createOrderFromChat(state as BulkOrderState, state.chatConversationId);
        
        if (orderResult.success) {
          return NextResponse.json({
            message: `✅ Order placed successfully! Order #${orderResult.orderNumber}\n\nYou'll receive a confirmation email shortly with pickup instructions.\n\n📍 Pickup Location:\nCool Wind Services\nPushpagiri Hospitals Rd\nThiruvalla, Kerala 689101\n\nReady in 2-4 hours!`,
            quickReplies: ['View on Google Maps', 'New Order'],
            nextStep: 'complete',
            orderCreated: true,
            orderNumber: orderResult.orderNumber,
          });
        } else {
          return NextResponse.json({
            message: `Sorry, there was an error placing your order: ${orderResult.error}\n\nPlease try again or contact us directly.`,
            quickReplies: ['Try Again', 'Contact Support'],
            nextStep: 'confirming',
          });
        }
      }
      
      // If catalog search is needed, search and regenerate
      if (initialResponse.needsCatalogSearch && initialResponse.searchQuery) {
        const parts = await searchPartsForChat(initialResponse.searchQuery);
        const catalogPart = parts.length > 0 ? parts[0] : null;
        
        if (!catalogPart) {
          // Part not found in catalog
          return NextResponse.json({
            message: `Sorry, I couldn't find "${initialResponse.searchQuery}" in our catalog. Could you try a different part name or browse our catalog?`,
            quickReplies: ['View Catalog', 'AC Parts', 'Fridge Parts'],
            nextStep: 'initial',
          });
        }
        
        // Regenerate response with catalog data
        const finalResponse = generateBulkOrderResponse(state as BulkOrderState, message, catalogPart);
        
        // Remove the internal flags before sending to client
        delete finalResponse.needsCatalogSearch;
        delete finalResponse.searchQuery;
        
        return NextResponse.json(finalResponse);
      }
      
      return NextResponse.json(initialResponse);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in bulk order chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: error.message },
      { status: 500 }
    );
  }
}
