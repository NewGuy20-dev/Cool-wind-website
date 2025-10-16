import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GeminiClient } from '@/lib/gemini/client';
import { ConversationContext } from '@/lib/chat/conversation-context';
import { ChatMessage, ChatSession } from '@/lib/types/chat';
import { FailedCallDetector } from '@/lib/chat/failed-call-detector';
import { ChatStateManager } from '@/lib/chat/chat-state';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, { context: ConversationContext; session: ChatSession }>();

// Session cleanup interval
const SESSION_TIMEOUT = parseInt(process.env.CHAT_SESSION_TIMEOUT || '1800000'); // 30 minutes
const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES_PER_SESSION || '50');

// Initialize Gemini client
const geminiClient = new GeminiClient();

// Input sanitization
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .slice(0, 500); // Limit input length
}

// PII Detection
function detectPII(text: string) {
  const phoneRegex = /(\+91|0)?[\s-]?[6-9]\d{9}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  return {
    hasPhone: phoneRegex.test(text),
    hasEmail: emailRegex.test(text),
    sanitized: text.replace(phoneRegex, '[PHONE]').replace(emailRegex, '[EMAIL]')
  };
}

// Session management
function createSession(userId: string): { context: ConversationContext; session: ChatSession } {
  const sessionId = uuidv4();
  const context = new ConversationContext();
  const session: ChatSession = {
    sessionId,
    userId,
    startTime: new Date(),
    messages: [],
    context: {
      resolved: false,
      escalated: false
    }
  };

  const sessionData = { context, session };
  sessions.set(sessionId, sessionData);
  
  // Schedule cleanup
  setTimeout(() => {
    sessions.delete(sessionId);
  }, SESSION_TIMEOUT);

  return sessionData;
}

function getSession(sessionId: string) {
  return sessions.get(sessionId);
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId: clientSessionId, userId } = await request.json();
    
    // Get sessionId from cookie (most reliable) or client
    let sessionId = request.cookies.get('chat_session_id')?.value || clientSessionId;
    
    console.log('🔐 Session management:', {
      fromCookie: request.cookies.get('chat_session_id')?.value,
      fromClient: clientSessionId,
      using: sessionId
    });

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    const piiCheck = detectPII(sanitizedMessage);

    // Get or create session
    let sessionData = sessionId ? getSession(sessionId) : null;
    
    // If not in memory but we have a sessionId, check if it exists in database
    if (!sessionData && sessionId) {
      // Check if session has state in database (means it's valid)
      const hasDbState = await ChatStateManager.getChatState(sessionId, 'bulk_order') || 
                         await ChatStateManager.getCallbackInfoState(sessionId);
      
      if (hasDbState) {
        // Session exists in DB, recreate in memory
        console.log('♻️ Restoring session from database:', sessionId);
        sessionData = {
          context: new ConversationContext(),
          session: {
            sessionId,
            userId: userId || uuidv4(),
            startTime: new Date(),
            messages: [],
            context: {
              resolved: false,
              escalated: false
            }
          }
        };
        sessions.set(sessionId, sessionData);
      }
    }
    
    // If still no session, create new one
    if (!sessionData) {
      sessionData = createSession(userId || uuidv4());
      sessionId = sessionData.session.sessionId; // Update sessionId to the new one
    }

    const { context, session } = sessionData;

    // Check message limits
    if (session.messages.length >= MAX_MESSAGES) {
      return NextResponse.json({
        response: {
          text: "Our conversation has reached its limit. Please call us at +91 85472 29991 for continued assistance.",
          quickReplies: [
            { text: "Call Now", action: "tel:+918547229991" },
            { text: "WhatsApp", action: "https://wa.me/918547229991" }
          ]
        },
        sessionId: session.sessionId,
        escalated: true
      });
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: sanitizedMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    // Add message to context and session
    context.addMessage(userMessage);
    session.messages.push(userMessage);

    // Recognize intent
    const intent = context.recognizeIntent(sanitizedMessage);
    
    // ===== PRIORITY CHECK: BULK ORDERS FIRST =====
    // Check for bulk orders BEFORE failed calls to avoid misclassification
    const existingBulkOrderState = await ChatStateManager.getChatState(session.sessionId, 'bulk_order');
    const isBulkOrderActive = !!existingBulkOrderState;
    let isBulkOrderDetected = isBulkOrderActive; // Declare at top level
    
    console.log('🔍 Bulk order state check:', {
      sessionId: session.sessionId,
      hasExistingState: !!existingBulkOrderState,
      stateStep: existingBulkOrderState?.step,
      isBulkOrderActive
    });
    
    // ===== FAILED CALL DETECTION & TASK CREATION =====
    console.log('🔍 Checking for failed call triggers in message:', sanitizedMessage);
    
    // Check if we're currently collecting callback information (but NOT if bulk order is active)
    const collectingCallbackInfo = !isBulkOrderActive ? await ChatStateManager.getCallbackInfoState(session.sessionId) : null;
    
    let response: any;
    let isFailedCallResponse = false;
    
    if (collectingCallbackInfo && !isBulkOrderActive) {
      console.log('📋 Currently collecting callback info, processing user response...');
      
      // Extract customer info from this message
      const extractedInfo = await ChatStateManager.extractCustomerInfoFromMessage(sanitizedMessage);
      
      // Merge with existing data
      const updatedCustomerData = ChatStateManager.mergeCustomerData(
        collectingCallbackInfo.customerData,
        extractedInfo
      );
      
      // Update the state
      ChatStateManager.updateCallbackInfoState(session.sessionId, {
        customerData: updatedCustomerData,
        attempts: collectingCallbackInfo.attempts + 1
      });
      
      // Check if we now have all required information
      if (ChatStateManager.hasAllRequiredFields(updatedCustomerData)) {
        console.log('✅ All required information collected, creating task...');
        
        // Create task
        let taskResult;
        try {
          const taskRequest = FailedCallDetector.createTaskRequest(
            updatedCustomerData as any,
            updatedCustomerData.problem || collectingCallbackInfo.originalMessage,
            'medium', // Default priority, will be assessed by AI
            updatedCustomerData.location || 'Not specified',
            session.messages.slice(-5) // Last 5 messages for context
          );
          
          taskResult = await FailedCallDetector.createTask(taskRequest);
        } catch (validationError: any) {
          console.error('❌ Task creation validation failed:', validationError.message);
          taskResult = {
            success: false,
            error: `Validation error: ${validationError.message}`
          };
        }
        
        if (taskResult.success) {
          console.log('🎉 Task created successfully:', taskResult.taskId);
          
          // Clear the collection state
          ChatStateManager.clearChatState(session.sessionId, 'collecting_callback_info');
          
          // Generate success response
          response = {
            text: FailedCallDetector.generateSuccessResponse(
              updatedCustomerData.name!,
              updatedCustomerData.location
            ),
            quickReplies: [
              { text: "📞 Call Now", action: "tel:+918547229991" },
              { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
              { text: "More Services", value: "our_services" }
            ]
          };
          isFailedCallResponse = true;
        } else {
          console.error('❌ Failed to create task:', taskResult.error);
          response = {
            text: "Thanks for the details. There was a technical issue on our side. Please call us at +91 85472 29991 for immediate help.",
            quickReplies: [
              { text: "📞 Call Now", action: "tel:+918547229991" },
              { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
            ]
          };
          isFailedCallResponse = true;
        }
      } else {
        // Still missing information
        const stillMissing = ChatStateManager.getStillMissingFields(updatedCustomerData);
        console.log('📝 Still missing information:', stillMissing);
        
        response = {
          text: ChatStateManager.generateFollowUpRequest(stillMissing),
          quickReplies: [
            { text: "📞 Call Instead", action: "tel:+918547229991" },
            { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
          ]
        };
        isFailedCallResponse = true;
      }
    } else {
      // ===== BULK ORDER DETECTION =====
      // We already checked for existing bulk order state at the top
      // isBulkOrderDetected is already set to isBulkOrderActive
      
      if (!isBulkOrderDetected) {
        // Check if message contains bulk order keywords
        const bulkOrderCheck = await fetch(`${request.nextUrl.origin}/api/chat/bulk-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'detect_intent',
            message: sanitizedMessage
          })
        });
        const { isBulkOrder } = await bulkOrderCheck.json();
        isBulkOrderDetected = isBulkOrder;
      }
      
      // Only check for failed calls if NOT a bulk order
      if (!isBulkOrderDetected) {
        // Check for failed call triggers in new messages
        const failedCallData = await FailedCallDetector.detectFailedCall(sanitizedMessage, context.getContext());
        
        if (failedCallData.detected) {
        console.log('🚨 Failed call detected!', failedCallData.triggerPhrase);
        
        if (failedCallData.missingFields.length === 0) {
          // All information available, create task immediately
          console.log('✅ All information available, creating task immediately...');
          
          let taskResult;
          try {
            const taskRequest = FailedCallDetector.createTaskRequest(
              failedCallData.customerData as any,
              failedCallData.problemDescription!,
              failedCallData.urgencyLevel!,
              failedCallData.location || 'Not specified',
              session.messages.slice(-3) // Last 3 messages for context
            );
            
            taskResult = await FailedCallDetector.createTask(taskRequest);
          } catch (validationError: any) {
            console.error('❌ Task creation validation failed:', validationError.message);
            taskResult = {
              success: false,
              error: `Validation error: ${validationError.message}`
            };
          }
          
          if (taskResult.success) {
            console.log('🎉 Task created immediately:', taskResult.taskId);
            response = {
              text: FailedCallDetector.generateSuccessResponse(
                failedCallData.customerData.name!,
                failedCallData.location
              ),
              quickReplies: [
                { text: "📞 Call Now", action: "tel:+918547229991" },
                { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
                { text: "More Services", value: "our_services" }
              ]
            };
            isFailedCallResponse = true;
          } else {
            console.error('❌ Failed to create task:', taskResult.error);
            response = {
              text: "I understand you tried calling but couldn't reach us. There was a technical issue—please call +91 85472 29991 for immediate help.",
              quickReplies: [
                { text: "📞 Call Now", action: "tel:+918547229991" },
                { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
                { text: "More Services", value: "our_services" }
              ]
            };
            isFailedCallResponse = true;
          }
        } else {
          // Missing information, start collection process
          console.log('📋 Missing information, starting collection process:', failedCallData.missingFields);
          
          // Set up collection state
          await ChatStateManager.setChatState(session.sessionId, 'collecting_callback_info', {
            missingFields: failedCallData.missingFields,
            originalMessage: failedCallData.problemDescription || 'Customer needs service assistance',
            triggerPhrase: failedCallData.triggerPhrase!,
            customerData: failedCallData.customerData,
            attempts: 0,
            startedAt: new Date().toISOString()
          });
          
          response = {
            text: FailedCallDetector.generateMissingInfoRequest(failedCallData.missingFields),
            quickReplies: [
              { text: "📞 Call Instead", action: "tel:+918547229991" },
              { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
            ]
          };
          isFailedCallResponse = true;
        }
        }
      }
    }
    
    // ===== BULK ORDER HANDLING =====
    let isBulkOrderResponse = false;
    
    if (!isFailedCallResponse && isBulkOrderDetected) {
      console.log('🛒 Bulk order flow active or detected!');
      console.log('🔍 Bulk order state check:', {
        sessionId: session.sessionId,
        hasExistingState: !!existingBulkOrderState,
        stateStep: existingBulkOrderState?.step,
        message: sanitizedMessage.substring(0, 50)
      });
      
      // Get or create bulk order state
      const bulkOrderState = existingBulkOrderState || {
        step: 'initial',
        parts: [],
      };
      
      console.log('📊 Current bulk order state:', bulkOrderState);
      
      // Generate bulk order response
      const bulkOrderResponse = await fetch(`${request.nextUrl.origin}/api/chat/bulk-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_response',
          message: sanitizedMessage,
          state: bulkOrderState
        })
      });
      
      const bulkOrderData = await bulkOrderResponse.json();
      
      console.log('📦 Bulk order response:', bulkOrderData);
      
      // Update state with all changes (including extracted contact info)
      await ChatStateManager.setChatState(session.sessionId, 'bulk_order', {
        ...bulkOrderState,
        step: bulkOrderData.nextStep,
        // Merge any updated state from the response
        ...(bulkOrderData.updatedState || {}),
      });
      
      response = {
        text: bulkOrderData.message,
        quickReplies: bulkOrderData.quickReplies?.map((text: string) => ({ text, value: text })) || []
      };
      
      isBulkOrderResponse = true;
      console.log('🎯 Using bulk order response, next step:', bulkOrderData.nextStep);
    }
    
    // If not a failed call or bulk order response, generate normal Gemini response
    if (!isFailedCallResponse && !isBulkOrderResponse) {
      console.log('💬 Generating normal Gemini response...');
      
      // Fetch spare parts catalog for AI context
      let sparePartsCatalog = null;
      try {
        const { data: parts } = await supabase
          .from('spare_parts')
          .select('id, name, part_code, category, price, bulk_price, is_genuine, warranty_months, stock_quantity, is_available')
          .eq('is_available', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true })
          .limit(50); // Limit to avoid token overflow
        
        sparePartsCatalog = parts;
        console.log(`📦 Loaded ${parts?.length || 0} spare parts for AI context`);
      } catch (error) {
        console.error('Error fetching spare parts catalog:', error);
      }
      
      // Check if we're in bulk order mode
      const inBulkOrderMode = !!ChatStateManager.getChatState(session.sessionId, 'bulk_order');
      
      response = await geminiClient.generateResponse(
        sanitizedMessage,
        session.messages,
        context.getContext(),
        sparePartsCatalog || undefined,
        inBulkOrderMode
      );
    } else if (isFailedCallResponse) {
      console.log('🎯 Using failed call response instead of Gemini');
    }

    // Create bot message
    const botMessage: ChatMessage = {
      id: uuidv4(),
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      type: response.quickReplies && response.quickReplies.length > 0 ? 'quick_reply' : 'text',
      metadata: {
        category: intent.name.toLowerCase() as any,
        confidence: intent.confidence,
        escalated: context.shouldEscalate()
      }
    };

    // Add bot message to context and session
    context.addMessage(botMessage);
    session.messages.push(botMessage);

    // Update conversation stage
    context.updateConversationStage(sanitizedMessage, response.text);

    // Check for escalation
    const shouldEscalate = context.shouldEscalate();
    if (shouldEscalate) {
      session.context.escalated = true;
    }

    // Track analytics (basic implementation)
    if (process.env.ENABLE_CHAT_ANALYTICS === 'true') {
      trackChatEvent('message_sent', {
        sessionId: session.sessionId,
        intentName: intent.name,
        confidence: intent.confidence,
        escalated: shouldEscalate,
        hasPII: piiCheck.hasPhone || piiCheck.hasEmail,
        isFailedCallResponse,
        isBulkOrderResponse,
        hasActiveCallbackState: !!collectingCallbackInfo
      });
    }

    // Additional logging for failed call system
    if (isFailedCallResponse) {
      console.log('📊 FAILED CALL SYSTEM METRICS:', {
        sessionId: session.sessionId,
        messageCount: session.messages.length,
        hasCallbackState: !!collectingCallbackInfo,
        timestamp: new Date().toISOString()
      });
    }

    // Prepare response
    const responseData = {
      response: {
        text: response.text,
        quickReplies: response.quickReplies || [],
        actions: response.actions || []
      },
      sessionId: session.sessionId,
      intent: {
        name: intent.name,
        confidence: intent.confidence
      },
      escalated: shouldEscalate,
      conversationStage: context.getContext().conversationStage
    };

    // Set session cookie to persist across requests
    const nextResponse = NextResponse.json(responseData);
    nextResponse.cookies.set('chat_session_id', session.sessionId, {
      httpOnly: false, // Allow client to read
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30, // 30 minutes
      path: '/',
    });
    
    console.log('🍪 Set session cookie:', session.sessionId);

    return nextResponse;

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json({
      response: {
        text: "I'm experiencing technical difficulties. Please call us directly at +91 85472 29991 for immediate assistance.",
        quickReplies: [
          { text: "Call Now", action: "tel:+918547229991" },
          { text: "WhatsApp", action: "https://wa.me/918547229991" }
        ]
      },
      error: true
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const sessionData = getSession(sessionId);
  if (!sessionData) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    session: sessionData.session,
    context: sessionData.context.getContext()
  });
}

// Analytics tracking function
function trackChatEvent(event: string, data: any) {
  // Basic console logging - in production, integrate with analytics service
  console.log(`Chat Event: ${event}`, {
    timestamp: new Date().toISOString(),
    ...data
  });

  // TODO: Integrate with Google Analytics, Mixpanel, or other analytics service
  // Example:
  // gtag('event', event, {
  //   event_category: 'chat_support',
  //   ...data
  // });
}

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, sessionData] of sessions.entries()) {
    const sessionAge = now - sessionData.session.startTime.getTime();
    if (sessionAge > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes