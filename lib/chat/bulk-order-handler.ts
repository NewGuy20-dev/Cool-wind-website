// Chat-based bulk order handler
import type { CreateOrderData } from '@/lib/spare-parts/types';

export interface BulkOrderState {
  step: 'initial' | 'collecting_parts' | 'collecting_quantity' | 'collecting_contact' | 'confirming' | 'complete';
  parts: Array<{ 
    partId: string; 
    partName: string; 
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryLocation?: string;
}

/**
 * Extract contact information from natural language
 */
function extractContactInfo(message: string): {
  name?: string;
  phone?: string;
  email?: string;
} {
  const result: any = {};
  
  // Extract phone number (Indian format)
  const phoneRegex = /(\+91|0)?[\s-]?[6-9]\d{9}/;
  const phoneMatch = message.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/[\s-]/g, '');
  }
  
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = message.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }
  
  // Extract name (simple heuristic - words before "and" or first 2-3 words)
  const namePatterns = [
    /(?:name is|i'm|i am|this is|my name is)\s+([a-z\s\-]+?)(?:\s+and|\s+phone|\s+email|$)/i,
    /^([a-z\s\-]{2,30})(?:\s+and|\s+phone|\s+\d)/i,
    /(?:name|called):\s*([a-z\s\-]+?)(?:\s|$)/i,
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = message.match(pattern);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
      break;
    }
  }
  
  return result;
}

/**
 * Extract quantity from message
 */
function extractQuantity(message: string): number | null {
  // Look for patterns like "10 remote controls", "5 units", "20 pieces"
  const patterns = [
    /(\d+)\s*(?:units?|pieces?|pcs?|nos?)/i,
    /(\d+)\s+(?:remote|compressor|filter|thermostat|part)/i,
    /order\s+(\d+)/i,
    /need\s+(\d+)/i,
    /buy\s+(\d+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const qty = parseInt(match[1]);
      if (qty > 0 && qty < 1000) { // Sanity check
        return qty;
      }
    }
  }
  
  return null;
}

/**
 * Extract part name from message
 */
function extractPartName(message: string): string | null {
  const partKeywords = [
    'remote control',
    'remote',
    'compressor',
    'filter',
    'thermostat',
    'capacitor',
    'fan motor',
    'door seal',
    'gas',
    'refrigerant',
  ];
  
  const lowerMessage = message.toLowerCase();
  for (const keyword of partKeywords) {
    if (lowerMessage.includes(keyword)) {
      return keyword;
    }
  }
  
  return null;
}

/**
 * Detect if user message is about bulk ordering
 */
export function detectBulkOrderIntent(message: string): boolean {
  const bulkKeywords = [
    'bulk order',
    'bulk',
    'wholesale',
    'dealer price',
    'multiple units',
    'spare part',
    'spare parts',
    'compressor',
    'filter',
    'thermostat',
    'buy parts',
    'need parts',
    'order parts',
    'i want to order',
    'i need',
    'can i buy',
    'remote control',
  ];

  const lowerMessage = message.toLowerCase();
  
  // Check for bulk keywords
  const hasBulkKeyword = bulkKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Check for quantity (numbers)
  const hasQuantity = /\d+/.test(message);
  
  return hasBulkKeyword || (hasQuantity && lowerMessage.includes('order'));
}

/**
 * Generate response based on bulk order state
 * Note: This is a synchronous function, actual catalog search happens in the API route
 */
export function generateBulkOrderResponse(state: BulkOrderState, userMessage: string, catalogPart?: any): {
  message: string;
  quickReplies?: string[];
  nextStep: BulkOrderState['step'];
  needsCatalogSearch?: boolean;
  searchQuery?: string;
  updatedState?: Partial<BulkOrderState>;
  needsOrderCreation?: boolean;
} {
  switch (state.step) {
    case 'initial':
      // Try to extract quantity and part name from the initial message
      const quantity = extractQuantity(userMessage);
      const partName = extractPartName(userMessage);
      
      if (quantity && partName) {
        // Validate quantity (reasonable limits for a local business)
        if (quantity > 1000) {
          return {
            message: `That's a very large order (${quantity} units)! 😊\n\nFor orders over 1000 units, please contact us directly:\n📞 +91 85472 29991\n💬 WhatsApp: +91 85472 29991\n📧 info@coolwind.co.in\n\nWe'll provide you with special pricing and delivery options.`,
            quickReplies: ['Call Now', 'WhatsApp', 'Smaller Order'],
            nextStep: 'initial',
          };
        }
        
        // If we have catalog data, use it
        if (catalogPart) {
          // Check stock availability
          const stockQuantity = catalogPart.stockQuantity || 0;
          
          if (stockQuantity === 0) {
            return {
              message: `Sorry, ${catalogPart.name} is currently out of stock. 😔\n\nWould you like to:\n• Order a different part\n• Get notified when it's back in stock\n• Contact us for alternatives`,
              quickReplies: ['View Catalog', 'Contact Support', 'Different Part'],
              nextStep: 'initial',
            };
          }
          
          if (quantity > stockQuantity) {
            return {
              message: `We currently have ${stockQuantity} units of ${catalogPart.name} in stock.\n\nYou requested ${quantity} units.\n\nWould you like to:\n• Order ${stockQuantity} units (available now)\n• Contact us for larger quantities\n• Choose a different part`,
              quickReplies: [
                `Order ${stockQuantity} Units`,
                'Contact for More',
                'Different Part'
              ],
              nextStep: 'initial',
            };
          }
          
          // Stock is available, proceed with order
          const isBulk = quantity >= 5;
          const unitPrice = isBulk && catalogPart.bulkPrice ? catalogPart.bulkPrice : catalogPart.price;
          const regularPrice = catalogPart.price;
          const totalPrice = quantity * unitPrice;
          const discount = isBulk && catalogPart.bulkPrice ? (quantity * (regularPrice - catalogPart.bulkPrice)) : 0;
          
          let message = `Great! ${quantity} × ${catalogPart.name}\n\n`;
          message += `💰 Price: ${quantity} × ₹${unitPrice.toLocaleString()} = ₹${totalPrice.toLocaleString()}`;
          
          if (discount > 0) {
            message += `\n🎉 Bulk discount applied! You save ₹${discount.toLocaleString()}`;
          }
          
          // Show stock status
          if (stockQuantity - quantity <= 5) {
            message += `\n⚠️ Only ${stockQuantity - quantity} units left after your order`;
          } else {
            message += `\n✅ In stock (${stockQuantity} available)`;
          }
          
          message += `\n\n📍 Pickup from our shop (ready in 2-4 hours)`;
          message += `\n\nTo confirm your order, please provide:\n📝 Name, Phone Number, and Email`;
          
          // Add part to state
          state.parts = [{
            partId: catalogPart.id,
            partName: catalogPart.name,
            quantity,
            unitPrice,
            totalPrice,
          }];
          
          return {
            message,
            nextStep: 'collecting_contact',
            updatedState: {
              parts: state.parts,
            },
          };
        }
        
        // Need to search catalog first - signal to API
        return {
          message: '', // Empty message - API will handle the search and regenerate
          nextStep: 'initial',
          needsCatalogSearch: true,
          searchQuery: partName,
        };
      }
      
      // Check if message contains multiple parts (commas, "and", etc.)
      const hasMultipleParts = userMessage.includes(',') || 
                              (userMessage.match(/\band\b/gi) || []).length > 1 ||
                              (userMessage.match(/\d+/g) || []).length > 2;
      
      if (hasMultipleParts) {
        return {
          message: "I can help you order multiple parts! 😊\n\nFor the best experience, let's order one part at a time.\n\nWhich part would you like to order first?",
          quickReplies: ['10 Remote Controls', '5 Compressors', '3 Door Seals', 'View Catalog'],
          nextStep: 'initial',
        };
      }
      
      // If not enough info, ask for details
      return {
        message: "Great! I can help you with bulk orders. 🎉\n\nWhat spare parts do you need and how many?\n\nExample: 'I need 10 remote controls'",
        quickReplies: ['10 Remote Controls', '5 Compressors', 'View Catalog'],
        nextStep: 'initial',
      };

    case 'collecting_contact':
      // Try to extract all info from the message
      const extractedInfo = extractContactInfo(userMessage);
      
      // Update state with extracted info
      if (extractedInfo.name && !state.customerName) {
        state.customerName = extractedInfo.name;
      }
      if (extractedInfo.phone && !state.customerPhone) {
        state.customerPhone = extractedInfo.phone;
      }
      if (extractedInfo.email && !state.customerEmail) {
        state.customerEmail = extractedInfo.email;
      }
      
      // Check what's still missing
      const missing = [];
      if (!state.customerName) missing.push('name');
      if (!state.customerPhone) missing.push('phone number');
      if (!state.customerEmail) missing.push('email');
      
      // If all collected, show pickup location and move to confirming
      if (missing.length === 0) {
        // ALWAYS set pickup location (this is pickup-only, no delivery)
        state.deliveryLocation = 'Thiruvalla, Kerala';
        
        return {
          message: `Perfect! ✅\n\n📍 Pickup Location:\nCool Wind Services\nPushpagiri Hospitals Rd\nThiruvalla, Kerala 689101\n\n⏱️ Your order will be ready in 2-4 hours\n\nConfirm this order?`,
          quickReplies: ['Yes, Place Order', 'Cancel'],
          nextStep: 'confirming',
          updatedState: {
            customerName: state.customerName,
            customerPhone: state.customerPhone,
            customerEmail: state.customerEmail,
            deliveryLocation: 'Thiruvalla, Kerala', // Always set to pickup location
            parts: state.parts, // Include parts in state
          },
        };
      }
      
      // Ask for missing info
      return {
        message: `Thanks${state.customerName ? ' ' + state.customerName : ''}! I still need: ${missing.join(', ')}\n\nPlease provide them in one message.`,
        nextStep: 'collecting_contact',
        updatedState: {
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          customerEmail: state.customerEmail,
        },
      };

    case 'confirming':
      // Check if user confirmed the order
      const lowerMessage = userMessage.toLowerCase();
      const isConfirmed = lowerMessage.includes('yes') || 
                         lowerMessage.includes('place order') || 
                         lowerMessage.includes('confirm');
      const isCancelled = lowerMessage.includes('cancel') || 
                         lowerMessage.includes('no');
      
      if (isConfirmed) {
        // Signal to create the order
        return {
          message: '', // Will be replaced after order creation
          nextStep: 'complete',
          needsOrderCreation: true,
        };
      }
      
      if (isCancelled) {
        return {
          message: "Order cancelled. Is there anything else I can help you with?",
          quickReplies: ['New Order', 'View Catalog', 'Contact Support'],
          nextStep: 'initial',
        };
      }
      
      // Show order summary again
      return {
        message: `📋 Order Summary\n\nItems: ${state.parts.map(p => `${p.partName} x ${p.quantity}`).join(', ')}\n\nCustomer: ${state.customerName}\nPhone: ${state.customerPhone}\nEmail: ${state.customerEmail}\n\n📍 Pickup Location:\nCool Wind Services\nPushpagiri Hospitals Rd\nThiruvalla, Kerala 689101\n\n⏱️ Ready in 2-4 hours\n\n✅ Confirm this order?`,
        quickReplies: ['Yes, Place Order', 'Edit Details', 'Cancel'],
        nextStep: 'confirming',
      };

    case 'complete':
      return {
        message: "✅ Order placed successfully! You'll receive a confirmation email shortly with pickup instructions.\n\n📍 Pickup Location:\nCool Wind Services\nPushpagiri Hospitals Rd\nThiruvalla, Kerala 689101\n\nReady in 2-4 hours!",
        quickReplies: ['View on Google Maps', 'Track Order', 'New Order'],
        nextStep: 'complete',
      };

    default:
      return {
        message: "I can help you place a bulk order. What parts do you need?",
        nextStep: 'initial',
      };
  }
}

/**
 * Create order from chat state - Direct database access (server-side only)
 */
export async function createOrderFromChat(state: BulkOrderState, chatConversationId?: string): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  try {
    if (!state.customerName || !state.customerPhone || !state.customerEmail || !state.deliveryLocation) {
      return { success: false, error: 'Missing customer information' };
    }

    if (state.parts.length === 0) {
      return { success: false, error: 'No parts in order' };
    }

    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate order number
    const orderNumber = `CW-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Calculate total amount
    const totalAmount = state.parts.reduce((sum, part) => sum + (part.totalPrice || 0), 0);

    // Create order
    // Prepare items JSONB for the order
    const itemsJson = state.parts.map(part => ({
      part_id: part.partId,
      part_name: part.partName,
      quantity: part.quantity,
      unit_price: part.unitPrice || 0,
      total_price: part.totalPrice || 0,
    }));

    const { data: order, error: orderError } = await supabase
      .from('spare_parts_orders')
      .insert({
        order_number: orderNumber,
        customer_name: state.customerName,
        customer_phone: state.customerPhone,
        customer_email: state.customerEmail,
        delivery_location: state.deliveryLocation,
        items: itemsJson, // Add items JSONB field
        total_amount: totalAmount,
        status: 'pending',
        source: 'chat',
        chat_conversation_id: chatConversationId,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { success: false, error: orderError.message };
    }

    console.log('✅ Order created successfully:', order.order_number);

    // Update stock quantities for each part using the database function
    for (const part of state.parts) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        part_id: part.partId,
        quantity_to_deduct: part.quantity,
      });

      if (stockError) {
        console.error('Error updating stock for part:', part.partId, stockError);
        // Continue anyway - don't fail the order if stock update fails
        // Admin can manually adjust stock if needed
      } else {
        console.log(`✅ Stock decremented for ${part.partName}: -${part.quantity} units`);
      }
    }

    // Send emails (import dynamically to avoid circular dependencies)
    try {
      const { sendBulkOrderEmails } = await import('@/lib/email/send');
      
      // Prepare email data matching BulkOrderEmailData type
      const emailData = {
        order: {
          ...order,
          items: state.parts.map(p => ({
            part_id: p.partId,
            part_name: p.partName,
            quantity: p.quantity,
            unit_price: p.unitPrice || 0,
            total_price: p.totalPrice || 0,
          })),
        },
        items_with_details: state.parts.map(p => ({
          part_id: p.partId,
          part_name: p.partName,
          quantity: p.quantity,
          unit_price: p.unitPrice || 0,
          total_price: p.totalPrice || 0,
        })),
        whatsapp_link: `https://wa.me/918547229991?text=Hi, I have a question about order ${orderNumber}`,
      };
      
      await sendBulkOrderEmails(emailData);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order if emails fail
    }

    return { success: true, orderNumber };
  } catch (error: any) {
    console.error('Error creating order from chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Search for parts by name - Direct database query (server-side only)
 */
export async function searchPartsForChat(query: string): Promise<Array<{ 
  id: string; 
  name: string; 
  price: number; 
  bulkPrice?: number;
  stockQuantity?: number;
}>> {
  try {
    // Import Supabase client dynamically to avoid issues
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Search for parts matching the query
    const { data, error } = await supabase
      .from('spare_parts')
      .select('id, name, price, bulk_price, stock_quantity')
      .eq('is_available', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,part_code.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error('Database error searching parts:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((part) => ({
      id: part.id,
      name: part.name,
      price: part.price,
      bulkPrice: part.bulk_price,
      stockQuantity: part.stock_quantity,
    }));
  } catch (error) {
    console.error('Error searching parts:', error);
    return [];
  }
}
