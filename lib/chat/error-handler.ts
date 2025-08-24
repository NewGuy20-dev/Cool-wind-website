import { ChatResponse } from '@/lib/types/chat';

export class ChatErrorHandler {
  private static readonly BUSINESS_CONTACT = {
    phone: "+91 85472 29991",
    whatsapp: "https://wa.me/918547229991"
  };

  static handleGeminiError(error: any): ChatResponse {
    console.error('Gemini API Error:', error);
    
    // Rate limiting error
    if (error.status === 429) {
      return {
        text: "I'm experiencing high demand right now. Please call us directly at +91 85472 29991 for immediate assistance.",
        quickReplies: [
          { text: "📞 Call Now", action: "tel:+918547229991" },
          { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
          { text: "Try Again", value: "retry" }
        ],
        metadata: {
          confidence: 1.0,
          category: 'error_handling',
          businessRelevance: 1.0
        }
      };
    }
    
    // Server errors
    if (error.status >= 500) {
      return {
        text: "I'm having technical difficulties. Let me connect you with our team directly: +91 85472 29991",
        quickReplies: [
          { text: "📞 Call Now", action: "tel:+918547229991" },
          { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
        ],
        actions: [{ type: 'escalate', reason: 'technical_error' }],
        metadata: {
          confidence: 1.0,
          category: 'error_handling',
          businessRelevance: 1.0
        }
      };
    }
    
    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return {
        text: "There's a configuration issue with our chat system. Please contact us directly for assistance.",
        quickReplies: [
          { text: "📞 Call Now", action: "tel:+918547229991" },
          { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
        ],
        actions: [{ type: 'escalate', reason: 'auth_error' }],
        metadata: {
          confidence: 1.0,
          category: 'error_handling',
          businessRelevance: 1.0
        }
      };
    }
    
    // Bad request errors
    if (error.status === 400) {
      return {
        text: "I didn't understand that request properly. Could you please rephrase? Or call us directly for immediate help.",
        quickReplies: [
          { text: "📞 Call Now", action: "tel:+918547229991" },
          { text: "Start Over", value: "restart_chat" },
          { text: "Common Questions", value: "faq" }
        ],
        metadata: {
          confidence: 0.8,
          category: 'error_handling',
          businessRelevance: 0.9
        }
      };
    }
    
    // Network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return {
        text: "There seems to be a connection issue. Please check your internet or call us directly.",
        quickReplies: [
          { text: "📞 Call Now", action: "tel:+918547229991" },
          { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
          { text: "Retry", value: "retry" }
        ],
        metadata: {
          confidence: 1.0,
          category: 'error_handling',
          businessRelevance: 1.0
        }
      };
    }
    
    // Generic error fallback
    return this.getGenericErrorResponse();
  }
  
  static getGenericErrorResponse(): ChatResponse {
    return {
      text: "I apologize for the confusion. For immediate assistance with spare parts or repairs, please contact us at +91 85472 29991. Our team is always ready to help!",
      quickReplies: [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
        { text: "Start Over", value: "restart_chat" }
      ],
      metadata: {
        confidence: 1.0,
        category: 'error_handling',
        businessRelevance: 1.0
      }
    };
  }

  static handleValidationError(field: string, value: any): ChatResponse {
    const fieldMessages: Record<string, string> = {
      message: "Please enter a valid message (1-500 characters).",
      sessionId: "There was an issue with your chat session. Let's start fresh.",
      userId: "There was an issue identifying your session."
    };

    const message = fieldMessages[field] || "There was a validation error with your input.";

    return {
      text: `${message} For immediate assistance, please call us at +91 85472 29991.`,
      quickReplies: [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "Start New Chat", value: "restart_chat" }
      ],
      metadata: {
        confidence: 1.0,
        category: 'validation_error',
        businessRelevance: 1.0
      }
    };
  }

  static handleSessionLimitError(): ChatResponse {
    return {
      text: "Our conversation has reached its limit. Please call us at +91 85472 29991 for continued assistance, or start a new chat session.",
      quickReplies: [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
        { text: "New Chat", value: "new_session" }
      ],
      metadata: {
        confidence: 1.0,
        category: 'session_limit',
        businessRelevance: 1.0
      }
    };
  }

  static handleTimeoutError(): ChatResponse {
    return {
      text: "Your chat session has timed out due to inactivity. For immediate assistance, please contact us directly or start a new chat.",
      quickReplies: [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
        { text: "New Chat", value: "new_session" }
      ],
      metadata: {
        confidence: 1.0,
        category: 'timeout_error',
        businessRelevance: 1.0
      }
    };
  }

  static handleRateLimitError(): ChatResponse {
    return {
      text: "You're sending messages too quickly. Please wait a moment before trying again, or call us directly for immediate help.",
      quickReplies: [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "Wait & Retry", value: "wait_retry" }
      ],
      metadata: {
        confidence: 1.0,
        category: 'rate_limit',
        businessRelevance: 1.0
      }
    };
  }

  static logError(error: any, context: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      },
      context: {
        sessionId: context.sessionId,
        userId: context.userId,
        currentIntent: context.currentIntent,
        conversationStage: context.conversationStage
      },
      stack: error.stack
    };

    console.error('Chat System Error:', errorLog);

    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
    // Sentry.captureException(error, { contexts: { chat: errorLog } });
  }

  static isRetriableError(error: any): boolean {
    const retriableStatuses = [429, 502, 503, 504];
    const retriableNames = ['NetworkError', 'TimeoutError'];
    
    return retriableStatuses.includes(error.status) || 
           retriableNames.includes(error.name);
  }

  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    return Math.min(1000 * Math.pow(2, attemptNumber), 30000);
  }
}