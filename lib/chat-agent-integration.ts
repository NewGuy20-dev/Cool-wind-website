// Chat Agent Integration for Failed Call Management System
// This module provides utilities for integrating failed call detection into chat agents

export interface ChatSession {
  customerName?: string;
  phoneNumber?: string;
  currentTopic?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface FailedCallDetectionResult {
  hasFailedCallIndicator: boolean;
  urgencyKeywords: string[];
  suggestedPriority: 'high' | 'medium' | 'low';
  extractedContext?: string;
}

/**
 * Analyzes a message for failed call indicators
 */
export async function analyzeMessageForFailedCall(messageText: string): Promise<FailedCallDetectionResult> {
  try {
    const response = await fetch('/api/failed-calls/auto-create', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageText }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to analyze message');
    }
  } catch (error) {
    console.error('Error analyzing message for failed call patterns:', error);
    return {
      hasFailedCallIndicator: false,
      urgencyKeywords: [],
      suggestedPriority: 'medium',
    };
  }
}

/**
 * Automatically creates a failed call task from chat context
 */
export async function autoCreateFailedCallTask(
  customerName: string,
  phoneNumber: string,
  conversationContext: string,
  urgencyKeywords: string[] = []
): Promise<{ success: boolean; taskId?: string; message?: string }> {
  try {
    const response = await fetch('/api/failed-calls/auto-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName,
        phoneNumber,
        conversationContext,
        urgencyKeywords,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        taskId: result.taskId,
        message: result.message,
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || 'Failed to create task',
      };
    }
  } catch (error) {
    console.error('Error creating failed call task:', error);
    return {
      success: false,
      message: 'Failed to process failed call report',
    };
  }
}

/**
 * Processes a chat session and detects failed call mentions
 * This function should be called when processing user messages
 */
export async function processMessageForFailedCall(
  message: string,
  chatSession: ChatSession
): Promise<{
  shouldCreateTask: boolean;
  detectionResult?: FailedCallDetectionResult;
  suggestedResponse?: string;
  taskCreated?: boolean;
  taskId?: string;
}> {
  // Analyze the message for failed call indicators
  const detectionResult = await analyzeMessageForFailedCall(message);

  if (!detectionResult.hasFailedCallIndicator) {
    return { shouldCreateTask: false };
  }

  // Extract customer information from chat session
  const customerName = chatSession.customerName || 'Unknown Customer';
  const phoneNumber = chatSession.phoneNumber || '';

  if (!phoneNumber) {
    return {
      shouldCreateTask: false,
      detectionResult,
      suggestedResponse: "I'd like to help with that callback. Could you please provide your phone number?",
    };
  }

  // Build conversation context from recent messages
  const recentMessages = chatSession.messages.slice(-5); // Last 5 messages
  const conversationContext = recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  // Auto-create the task
  const taskResult = await autoCreateFailedCallTask(
    customerName,
    phoneNumber,
    conversationContext,
    detectionResult.urgencyKeywords
  );

  // Generate appropriate response based on priority
  let suggestedResponse = '';
  if (taskResult.success) {
    const timeframe = detectionResult.suggestedPriority === 'high' 
      ? 'within the next few hours'
      : 'by tomorrow';
    
    suggestedResponse = `Thanks for letting me know, ${customerName}. I've logged this and you'll receive a callback ${timeframe} to help with your ${chatSession.currentTopic || 'request'}.`;
  } else {
    suggestedResponse = "I've noted your callback request. Someone from our team will reach out to you shortly.";
  }

  return {
    shouldCreateTask: true,
    detectionResult,
    suggestedResponse,
    taskCreated: taskResult.success,
    taskId: taskResult.taskId,
  };
}

/**
 * Response templates for different scenarios
 */
export const RESPONSE_TEMPLATES = {
  high_priority: (customerName: string, topic: string) => 
    `Thanks for letting me know, ${customerName}. I've logged this as urgent and you'll receive a callback within the next few hours about your ${topic}.`,
  
  medium_priority: (customerName: string, topic: string) => 
    `Noted! Someone will reach out to you via WhatsApp or phone call by tomorrow to help with your ${topic}.`,
  
  low_priority: (customerName: string, topic: string) => 
    `I've recorded this - expect a callback within 1-2 business days to help with your ${topic}.`,
  
  no_phone: () => 
    "I'd be happy to arrange a callback for you. Could you please provide your phone number?",
  
  generic: (customerName: string) => 
    `Thanks for letting me know, ${customerName}. I've noted this for follow-up and you'll receive a callback soon.`,
};

/**
 * Example integration function for existing chat agents
 * This shows how to integrate the failed call detection into your chat processing
 */
export async function integrateWithChatAgent(
  userMessage: string,
  chatSession: ChatSession
): Promise<string> {
  // Process the message for failed call indicators
  const result = await processMessageForFailedCall(userMessage, chatSession);

  if (result.shouldCreateTask && result.suggestedResponse) {
    // Log the task creation for admin visibility
    console.log(`Failed call task created: ${result.taskId} for ${chatSession.customerName}`);
    
    // Return the suggested response to the customer
    return result.suggestedResponse;
  }

  // If no failed call detected, continue with normal chat processing
  return '';
}

/**
 * Utility function to extract customer info from chat session or message
 */
export function extractCustomerInfo(message: string): {
  possibleName?: string;
  possiblePhone?: string;
} {
  // Simple regex patterns for phone numbers
  const phonePatterns = [
    /\b\d{3}-\d{3}-\d{4}\b/,  // 123-456-7890
    /\b\(\d{3}\)\s*\d{3}-\d{4}\b/,  // (123) 456-7890
    /\b\d{10}\b/,  // 1234567890
  ];

  let possiblePhone;
  for (const pattern of phonePatterns) {
    const match = message.match(pattern);
    if (match) {
      possiblePhone = match[0];
      break;
    }
  }

  // Simple name extraction (this would need to be more sophisticated in production)
  const namePatterns = [
    /my name is ([A-Za-z\s]+)/i,
    /i'm ([A-Za-z\s]+)/i,
    /this is ([A-Za-z\s]+)/i,
  ];

  let possibleName;
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      possibleName = match[1].trim();
      break;
    }
  }

  return { possibleName, possiblePhone };
}