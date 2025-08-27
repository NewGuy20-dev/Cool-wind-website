import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GeminiClient } from '@/lib/gemini/client';
import { ConversationContext } from '@/lib/chat/conversation-context';
import { ChatMessage, ChatSession } from '@/lib/types/chat';
import { FailedCallDetector } from '@/lib/chat/failed-call-detector';
import { ChatStateManager } from '@/lib/chat/chat-state';
import { IntelligentMessageAnalyzer } from '@/lib/chat/intelligent-message-analyzer';
import { TaskManagementAgent } from '@/lib/chat/task-management-agent';

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
    
    // ===== ENHANCED AI-POWERED MESSAGE ANALYSIS =====
    console.log('🧠 Starting intelligent message analysis...');
    
    // Analyze message with AI for comprehensive understanding
    const analysis = await IntelligentMessageAnalyzer.analyzeMessage(
      sanitizedMessage,
      context.getContext(),
      session.messages.slice(-5) // Last 5 messages for context
    );
    
    console.log('📊 Analysis result:', {
      isFailedCall: analysis.isFailedCallScenario,
      confidence: analysis.failedCallConfidence,
      needsTaskMgmt: analysis.needsTaskManagement,
      taskConfidence: analysis.taskConfidence,
      urgency: analysis.urgencyLevel,
      frustration: analysis.customerFrustration,
      strategy: analysis.responseStrategy
    });

    let response: any;
    let isEnhancedResponse = false;
    
    // Check if we're currently collecting callback information (legacy support)
    const collectingCallbackInfo = ChatStateManager.getCallbackInfoState(session.sessionId);
    
    if (collectingCallbackInfo) {
      console.log('📋 Handling legacy callback info collection...');
      // Keep existing callback info collection logic for backward compatibility
      const extractedInfo = await ChatStateManager.extractCustomerInfoFromMessage(sanitizedMessage);
      const updatedCustomerData = ChatStateManager.mergeCustomerData(
        collectingCallbackInfo.customerData,
        extractedInfo
      );
      
      ChatStateManager.updateCallbackInfoState(session.sessionId, {
        customerData: updatedCustomerData,
        attempts: collectingCallbackInfo.attempts + 1
      });
      
      if (ChatStateManager.hasAllRequiredFields(updatedCustomerData)) {
        const taskRequest = FailedCallDetector.createTaskRequest(
          updatedCustomerData as any,
          collectingCallbackInfo.originalMessage,
          analysis.urgencyLevel === 'critical' ? 'high' : analysis.urgencyLevel === 'low' ? 'low' : 'medium',
          updatedCustomerData.location || 'Not specified',
          session.messages.slice(-5)
        );
        
        const taskResult = await FailedCallDetector.createTask(taskRequest);
        
        if (taskResult.success) {
          ChatStateManager.clearChatState(session.sessionId, 'collecting_callback_info');
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
          isEnhancedResponse = true;
        }
      } else {
        const stillMissing = ChatStateManager.getStillMissingFields(updatedCustomerData);
        response = {
          text: ChatStateManager.generateFollowUpRequest(stillMissing),
          quickReplies: [
            { text: "📞 Call Instead", action: "tel:+918547229991" },
            { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
          ]
        };
        isEnhancedResponse = true;
      }
    }
    // PRIORITY 1: Handle Task Management Requests
    else if (analysis.needsTaskManagement && analysis.taskConfidence > 50) {
      console.log('🎯 Detected task management intent, processing...');
      
      const taskIntent = await IntelligentMessageAnalyzer.detectTaskManagementIntent(
        sanitizedMessage,
        context.getContext()
      );
      
      if (taskIntent.action && taskIntent.confidence > 40) {
        const taskResult = await TaskManagementAgent.handleTaskManagement(
          taskIntent,
          sanitizedMessage,
          context.getContext(),
          session.sessionId
        );
        
        response = {
          text: taskResult.message,
          quickReplies: taskResult.success ? [
            { text: "📞 Call Us", action: "tel:+918547229991" },
            { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
            { text: "More Help", value: "help" }
          ] : [
            { text: "📞 Call Support", action: "tel:+918547229991" },
            { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
            { text: "Try Again", value: "retry_task" }
          ]
        };
        isEnhancedResponse = true;
        
        // Log task management activity
        console.log('📊 TASK MANAGEMENT ACTIVITY:', {
          sessionId: session.sessionId,
          action: taskIntent.action,
          confidence: taskIntent.confidence,
          success: taskResult.success,
          taskId: taskResult.taskId
        });
      }
    }
    // PRIORITY 2: Handle Failed Call Scenarios with High Confidence
    else if (analysis.isFailedCallScenario && analysis.failedCallConfidence > 60) {
      console.log('🚨 High-confidence failed call scenario detected');
      
      // Use the intelligent analysis to create appropriate response
      const contextualResponse = IntelligentMessageAnalyzer.generateContextualResponse(
        analysis,
        context.getContext().customerInfo?.name
      );
      
      // Extract customer information for task creation
      const customerName = context.getContext().customerInfo?.name || 'Customer';
      const phoneNumber = context.getContext().customerInfo?.phone || '';
      
      if (phoneNumber && customerName !== 'Customer') {
        // Create failed call task automatically with AI insights
        const conversationContext = session.messages.slice(-3)
          .map(msg => `${msg.sender}: ${msg.text}`)
          .join('\n');
        
        try {
          const taskCreationResponse = await fetch('/api/failed-calls/auto-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName,
              phoneNumber,
              conversationContext,
              urgencyKeywords: analysis.implicitNeeds,
              customerInfo: {
                name: customerName,
                frustrationLevel: analysis.customerFrustration,
                urgencyLevel: analysis.urgencyLevel
              },
              useAI: true
            })
          });
          
          if (taskCreationResponse.ok) {
            const taskResult = await taskCreationResponse.json();
            
            // Enhanced response based on AI analysis and task creation
            let enhancedText = contextualResponse.text;
            if (analysis.customerFrustration >= 7) {
              enhancedText += ` I've marked this as urgent (Priority: ${taskResult.priority}) and you'll receive ${taskResult.responseTimeframe}.`;
            } else {
              enhancedText += ` I've logged this and you'll receive ${taskResult.responseTimeframe}.`;
            }
            
            response = {
              text: enhancedText,
              quickReplies: contextualResponse.quickReplies
            };
            
            console.log('🎉 Failed call task created with AI insights:', taskResult.taskId);
          } else {
            response = contextualResponse;
          }
        } catch (error) {
          console.error('❌ Failed to create task from AI analysis:', error);
          response = contextualResponse;
        }
      } else {
        // Missing information, start collection process
        response = {
          text: "I understand you tried reaching us. To ensure I get you the right callback, could you please share your name and phone number?",
          quickReplies: [
            { text: "📞 Call Now", action: "tel:+918547229991" },
            { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
          ]
        };
      }
      
      isEnhancedResponse = true;
    }
    // PRIORITY 3: Use Legacy Failed Call Detection as Fallback
    else {
      console.log('💬 Using legacy detection and generating normal response...');
      
      // Legacy failed call detection for backward compatibility
      const failedCallData = await FailedCallDetector.detectFailedCall(sanitizedMessage, context.getContext());
      
      if (failedCallData.detected) {
        console.log('🔍 Legacy failed call detection triggered');
        
        if (failedCallData.missingFields.length === 0) {
          const taskRequest = FailedCallDetector.createTaskRequest(
            failedCallData.customerData as any,
            failedCallData.problemDescription!,
            failedCallData.urgencyLevel!,
            failedCallData.location || 'Not specified',
            session.messages.slice(-3)
          );
          
          const taskResult = await FailedCallDetector.createTask(taskRequest);
          
          if (taskResult.success) {
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
            isEnhancedResponse = true;
          }
        } else {
          ChatStateManager.setChatState(session.sessionId, 'collecting_callback_info', {
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
          isEnhancedResponse = true;
        }
      }
    }
    
    // If no enhanced response was generated, use normal Gemini response
    if (!isEnhancedResponse) {
      console.log('💬 Generating standard Gemini response...');
      response = await geminiClient.generateResponse(
        sanitizedMessage,
        session.messages,
        context.getContext()
      );
      
      // Apply response strategy from analysis if available
      if (analysis.responseStrategy === 'empathetic' && analysis.customerFrustration > 5) {
        response.text = `I understand your concern. ${response.text}`;
      } else if (analysis.responseStrategy === 'escalation' && analysis.urgencyLevel === 'critical') {
        response.quickReplies = [
          { text: "📞 Urgent Call", action: "tel:+918547229991" },
          { text: "💬 WhatsApp Now", action: "https://wa.me/918547229991" },
          ...(response.quickReplies || [])
        ];
      }
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
        escalated: context.shouldEscalate(),
        // Enhanced metadata from AI analysis
        aiAnalysis: {
          isFailedCall: analysis.isFailedCallScenario,
          needsTaskManagement: analysis.needsTaskManagement,
          urgencyLevel: analysis.urgencyLevel,
          customerFrustration: analysis.customerFrustration,
          responseStrategy: analysis.responseStrategy
        }
      }
    };

    // Add bot message to context and session
    context.addMessage(botMessage);
    session.messages.push(botMessage);

    // Update conversation stage
    context.updateConversationStage(sanitizedMessage, response.text);

    // Check for escalation
    const shouldEscalate = context.shouldEscalate() || 
                          analysis.responseStrategy === 'escalation' ||
                          analysis.customerFrustration >= 8;
    if (shouldEscalate) {
      session.context.escalated = true;
    }

    // Enhanced analytics tracking
    if (process.env.ENABLE_CHAT_ANALYTICS === 'true') {
      trackChatEvent('enhanced_message_processed', {
        sessionId: session.sessionId,
        intentName: intent.name,
        confidence: intent.confidence,
        escalated: shouldEscalate,
        hasPII: piiCheck.hasPhone || piiCheck.hasEmail,
        // AI analysis metrics
        isFailedCallScenario: analysis.isFailedCallScenario,
        failedCallConfidence: analysis.failedCallConfidence,
        needsTaskManagement: analysis.needsTaskManagement,
        taskConfidence: analysis.taskConfidence,
        urgencyLevel: analysis.urgencyLevel,
        customerFrustration: analysis.customerFrustration,
        responseStrategy: analysis.responseStrategy,
        isEnhancedResponse,
        hasCallbackState: !!collectingCallbackInfo
      });
    }

    // Enhanced logging
    console.log('📊 ENHANCED CHAT METRICS:', {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      aiAnalysisUsed: true,
      isFailedCall: analysis.isFailedCallScenario,
      taskManagement: analysis.needsTaskManagement,
      urgency: analysis.urgencyLevel,
      frustration: analysis.customerFrustration,
      strategy: analysis.responseStrategy,
      enhancedResponse: isEnhancedResponse,
      timestamp: new Date().toISOString()
    });

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
      conversationStage: context.getContext().conversationStage,
      // Enhanced response metadata
      aiInsights: {
        analysisUsed: true,
        failedCallDetected: analysis.isFailedCallScenario,
        taskManagementDetected: analysis.needsTaskManagement,
        urgencyLevel: analysis.urgencyLevel,
        responseStrategy: analysis.responseStrategy,
        enhancedResponse: isEnhancedResponse
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Enhanced Chat API Error:', error);
    
    return NextResponse.json({
      response: {
        text: "I'm experiencing technical difficulties. Please call us directly at +91 85472 29991 for immediate assistance.",
        quickReplies: [
          { text: "Call Now", action: "tel:+918547229991" },
          { text: "WhatsApp", action: "https://wa.me/918547229991" }
        ]
      },
      error: true,
      aiInsights: {
        analysisUsed: false,
        error: true
      }
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