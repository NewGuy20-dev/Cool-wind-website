import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GeminiClient } from '@/lib/gemini/client';
import { ConversationContext } from '@/lib/chat/conversation-context';
import { ChatMessage, ChatSession } from '@/lib/types/chat';

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
    const { message, sessionId, userId } = await request.json();

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
    if (!sessionData) {
      sessionData = createSession(userId || uuidv4());
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
    
    // Generate response using Gemini
    const response = await geminiClient.generateResponse(
      sanitizedMessage,
      session.messages,
      context.getContext()
    );

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
        hasPII: piiCheck.hasPhone || piiCheck.hasEmail
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

    return NextResponse.json(responseData);

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