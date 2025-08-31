export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'escalation' | 'contact_info';
  metadata?: {
    category?: 'parts' | 'service' | 'sales' | 'general' | 'spare_parts_inquiry' | 'service_request' | 'sales_inquiry' | 'emergency' | 'business_info' | 'error_handling' | 'validation_error' | 'session_limit' | 'timeout_error' | 'rate_limit';
    confidence?: number;
    escalated?: boolean;
    aiAnalysis?: {
      isFailedCall?: boolean;
      needsTaskManagement?: boolean;
      urgencyLevel?: string;
      customerFrustration?: number;
      responseStrategy?: string;
    };
  };
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  location?: string;
  email?: string;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  context: {
    customerInfo?: CustomerInfo;
    inquiryType?: 'parts' | 'service' | 'sales' | 'complaint';
    resolved: boolean;
    escalated: boolean;
  };
}

export interface QuickReply {
  text: string;
  value?: string;
  action?: string;
}

export interface ChatAction {
  type: 'escalate' | 'priority_escalation' | 'contact' | 'lead_capture';
  data?: Record<string, any>;
  reason?: string;
}

export interface ChatResponse {
  text: string;
  quickReplies?: QuickReply[];
  actions?: ChatAction[];
  metadata?: {
    confidence?: number;
    category?: string;
    businessRelevance?: number;
  };
}

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, string>;
}

export interface ConversationContextData {
  customerInfo: Partial<CustomerInfo>;
  currentIntent: string;
  inquiryDetails: Record<string, any>;
  conversationStage: 'greeting' | 'inquiry' | 'details' | 'resolution' | 'escalation';
  previousMessages: ChatMessage[];
}

export interface ChatAnalytics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  userSatisfaction?: 1 | 2 | 3 | 4 | 5;
  resolutionStatus: 'resolved' | 'escalated' | 'abandoned';
  inquiryType: 'parts' | 'service' | 'sales' | 'general';
  leadGenerated: boolean;
  conversionAction?: 'called' | 'whatsapp' | 'form_submitted';
}

export interface APIMetrics {
  responseTime: number;
  tokensUsed: number;
  errorRate: number;
  userSatisfaction: number;
  escalationRate: number;
}