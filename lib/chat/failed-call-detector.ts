import { ChatMessage, CustomerInfo, ConversationContextData } from '@/lib/types/chat';
import { GeminiInformationExtractor } from '@/lib/gemini/information-extractor';

export interface FailedCallData {
  detected: boolean;
  triggerPhrase?: string;
  customerData: Partial<CustomerInfo>;
  missingFields: string[];
  problemDescription?: string;
  location?: string;
  urgencyLevel?: 'high' | 'medium' | 'low';
}

export interface TaskCreationRequest {
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new';
  source: 'chat-failed-call';
  chatContext: any[];
  location?: string;
  urgencyKeywords?: string[];
}

export class FailedCallDetector {
  // Comprehensive failed call trigger phrases
  private static readonly FAILED_CALL_TRIGGERS = [
    // Direct phrases from the issue
    "called number in this website but it didnt respond",
    "called number in this website but it didn't respond",
    "called but no response",
    "called number but didnt respond",
    "called number but didn't respond",
    "tried calling but no answer",
    "tried calling but didnt answer",
    "called but nobody picked up",
    "phone didn't respond",
    "phone didnt respond",
    "no one answered the phone",
    "called but went to voicemail",
    "couldn't reach you",
    "couldnt reach you",
    "tried to call but no response",
    
    // Additional variations
    "called your number but",
    "tried calling your number",
    "phone call didn't go through",
    "phone call didnt go through",
    "couldn't get through on the phone",
    "couldnt get through on the phone",
    "called multiple times but",
    "tried calling several times",
    "phone was not reachable",
    "number was not reachable",
    "call didn't connect",
    "call didnt connect",
    "line was busy",
    "phone was busy",
    "no answer when i called",
    "no answer",
    "didn't answer",
    "didnt answer",
    "tried reaching you by phone",
    "attempted to call but",
    "phone went straight to voicemail",
    "voicemail when i called",
    "couldn't connect the call",
    "couldnt connect the call"
  ];

  // Keywords that indicate urgency
  private static readonly URGENCY_KEYWORDS = {
    high: [
      'emergency', 'urgent', 'immediately', 'asap', 'quickly', 'right now',
      'broken down', 'completely dead', 'not working at all', 'stopped working',
      'no cooling', 'no power', 'leaking', 'sparking', 'burning smell'
    ],
    medium: [
      'soon', 'today', 'tomorrow', 'this week', 'not working well',
      'poor performance', 'strange noise', 'needs repair', 'service required'
    ],
    low: [
      'when possible', 'convenience', 'routine', 'maintenance', 'check up',
      'general inquiry', 'information'
    ]
  };

  /**
   * Detect if a message contains failed call indicators
   */
  static async detectFailedCall(message: string, context: ConversationContextData): Promise<FailedCallData> {
    const lowerMessage = message.toLowerCase();
    
    // Check for trigger phrases
    const triggerPhrase = this.FAILED_CALL_TRIGGERS.find(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );

    if (!triggerPhrase) {
      return {
        detected: false,
        customerData: {},
        missingFields: []
      };
    }

    console.log(`🔍 Failed call trigger detected: "${triggerPhrase}"`);

    // Extract customer data using Gemini AI
    const customerData = await this.extractCustomerDataWithGemini(message, context);
    const problemDescription = this.inferProblemFromContext(message, context);
    const missingFields = this.identifyMissingFields(customerData, problemDescription);
    const location = customerData.location || this.extractLocation(message, context);
    const urgencyLevel = this.assessUrgency(message);

    return {
      detected: true,
      triggerPhrase,
      customerData,
      missingFields,
      problemDescription,
      location,
      urgencyLevel
    };
  }

  /**
   * Extract customer information from message and context using Gemini AI
   */
  private static async extractCustomerDataWithGemini(message: string, context: ConversationContextData): Promise<Partial<CustomerInfo>> {
    const customerData: Partial<CustomerInfo> = { ...context.customerInfo };

    try {
      // Use Gemini AI for extraction
      const extracted = await GeminiInformationExtractor.extractCustomerInfo(message);
      
      // Merge with context data, prioritizing high-confidence extractions
      if (extracted.name && extracted.confidence.name >= 0.6 && !customerData.name) {
        customerData.name = extracted.name;
      }
      
      if (extracted.phone && extracted.confidence.phone >= 0.6 && !customerData.phone) {
        customerData.phone = extracted.phone;
      }
      
      if (extracted.location && extracted.confidence.location >= 0.6 && !customerData.location) {
        customerData.location = extracted.location;
      }
      
      console.log('🤖 Gemini extracted customer data for failed call:', customerData);
      
    } catch (error) {
      console.error('❌ Gemini extraction failed in failed call detector, using fallback:', error);
      // Fallback to original extraction
      return this.extractCustomerDataFallback(message, context);
    }

    return customerData;
  }

  /**
   * Fallback extraction method
   */
  private static extractCustomerDataFallback(message: string, context: ConversationContextData): Partial<CustomerInfo> {
    const customerData: Partial<CustomerInfo> = { ...context.customerInfo };

    // Improved name extraction
    if (!customerData.name) {
      const nameMatch = message.match(/(?:my name is|i am|i'm|call me)\s+([a-zA-Z]+)(?:\s|$|,|and)/i);
      if (nameMatch) {
        customerData.name = nameMatch[1].trim();
      }
    }

    // Improved phone number extraction
    if (!customerData.phone) {
      const phoneMatch = message.match(/(?:phone|number|no)\s*(?:is)?\s*([6-9]\d{9})/i);
      if (phoneMatch) {
        customerData.phone = phoneMatch[1];
      }
    }

    // Try to extract location
    if (!customerData.location) {
      customerData.location = this.extractLocation(message, context);
    }

    return customerData;
  }

  /**
   * Extract location from message and context
   */
  private static extractLocation(message: string, context: ConversationContextData): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    // Check context first
    if (context.inquiryDetails.location) {
      return context.inquiryDetails.location;
    }

    // Known service areas
    const locations = ['thiruvalla', 'pathanamthitta', 'kerala'];
    for (const location of locations) {
      if (lowerMessage.includes(location)) {
        return location;
      }
    }

    // Generic location patterns
    const locationPatterns = [
      /(?:in|at|from)\s+([a-zA-Z\s]{3,20})/i,
      /(?:i'm in|i am in|located in)\s+([a-zA-Z\s]{3,20})/i
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Infer problem description from chat context
   */
  private static inferProblemFromContext(message: string, context: ConversationContextData): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    // Check if appliance type is mentioned
    const applianceType = context.inquiryDetails.appliance_type || 'appliance';
    
    // Specific problem descriptions - these are meaningful
    if (lowerMessage.includes('not cooling') || lowerMessage.includes('no cooling')) {
      return `${applianceType} not cooling properly`;
    }
    
    if (lowerMessage.includes('not working') || lowerMessage.includes('broken')) {
      return `${applianceType} not working`;
    }
    
    if (lowerMessage.includes('leaking') || lowerMessage.includes('water leak')) {
      return `${applianceType} leaking water`;
    }
    
    if (lowerMessage.includes('making noise') || lowerMessage.includes('strange noise') || lowerMessage.includes('loud noise')) {
      return `${applianceType} making unusual noise`;
    }
    
    if (lowerMessage.includes('sparking') || lowerMessage.includes('burning smell')) {
      return `${applianceType} sparking or burning smell - emergency`;
    }
    
    if (lowerMessage.includes('temperature') && lowerMessage.includes('not')) {
      return `${applianceType} temperature issue`;
    }

    // Generic requests are NOT sufficient problem descriptions
    if (lowerMessage.includes('repair') || lowerMessage.includes('service')) {
      return undefined; // Need more specific problem details
    }
    
    if (lowerMessage.includes('parts') || lowerMessage.includes('spare')) {
      return undefined; // Need to know what part and why
    }

    // Only return undefined so the system will ask for specific problem description
    return undefined;
  }

  /**
   * Assess urgency level from message content
   */
  private static assessUrgency(message: string): 'high' | 'medium' | 'low' {
    const lowerMessage = message.toLowerCase();
    
    // Check for high urgency keywords
    if (this.URGENCY_KEYWORDS.high.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    }
    
    // Check for low urgency keywords
    if (this.URGENCY_KEYWORDS.low.some(keyword => lowerMessage.includes(keyword))) {
      return 'low';
    }
    
    // Default to medium
    return 'medium';
  }

  /**
   * Identify missing required fields for task creation
   */
  private static identifyMissingFields(customerData: Partial<CustomerInfo>, problemDescription?: string): string[] {
    const required = ['name', 'phone', 'location', 'problem'];
    const missing: string[] = [];

    if (!customerData.name) missing.push('name');
    if (!customerData.phone) missing.push('phone number');
    if (!customerData.location) missing.push('location');
    if (!problemDescription || problemDescription.trim().length < 5) missing.push('problem description');

    return missing;
  }

  /**
   * Generate natural language request for missing information
   */
  static generateMissingInfoRequest(missingFields: string[]): string {
    if (missingFields.length === 0) {
      return '';
    }

    const fieldMap: Record<string, string> = {
      'name': 'your name',
      'phone number': 'a 10-digit phone number',
      'location': 'your location',
      'problem description': 'the specific problem'
    };

    const mappedFields = missingFields.map(field => fieldMap[field] || field);
    
    if (mappedFields.length === 1) {
      const field = missingFields[0];
      if (field === 'name') return 'Got it. What's your name?';
      if (field === 'phone number') return 'Thanks. What's the best 10-digit number to reach you?';
      if (field === 'location') return 'Thanks. Which area are you in?';
      if (field === 'problem description') return 'What's the specific problem with your AC or refrigerator? Please describe what's happening - is it not cooling, making noise, leaking, or something else?';
      return `Could you share ${mappedFields[0]}?`;
    } else if (mappedFields.length === 2) {
      return `Could you share ${mappedFields[0]} and ${mappedFields[1]}?`;
    } else {
      const lastField = mappedFields.pop();
      return `Could you share ${mappedFields.join(', ')}, and ${lastField}?`;
    }
  }

  /**
   * Create task creation request object
   */
  static createTaskRequest(
    customerData: CustomerInfo, 
    problemDescription: string, 
    urgencyLevel: 'high' | 'medium' | 'low',
    location: string,
    chatContext: any[]
  ): TaskCreationRequest {
    // Validate required fields
    if (!customerData.name || customerData.name.trim().length < 2) {
      throw new Error('Customer name is required and must be at least 2 characters');
    }
    
    if (!customerData.phone || !/^[6-9]\d{9}$/.test(customerData.phone.replace(/[\s\-]/g, ''))) {
      throw new Error('Valid 10-digit phone number is required');
    }
    
    if (!location || location.trim().length < 3) {
      throw new Error('Location is required and must be at least 3 characters');
    }
    
    if (!problemDescription || problemDescription.trim().length < 5) {
      throw new Error('Problem description is required and must be at least 5 characters');
    }

    return {
      customerName: customerData.name.trim(),
      phoneNumber: customerData.phone.replace(/[\s\-]/g, ''),
      problemDescription: `${problemDescription.trim()} in ${location.trim()}`,
      priority: urgencyLevel,
      status: 'new',
      source: 'chat-failed-call',
      chatContext,
      location: location.trim(),
      urgencyKeywords: this.getUrgencyKeywords(urgencyLevel)
    };
  }

  /**
   * Get urgency keywords for the given level
   */
  private static getUrgencyKeywords(level: 'high' | 'medium' | 'low'): string[] {
    return this.URGENCY_KEYWORDS[level] || [];
  }

  /**
   * Create task via API
   */
  static async createTask(taskRequest: TaskCreationRequest): Promise<{
    success: boolean;
    taskId?: string;
    error?: string;
  }> {
    try {
      console.log('Creating task:', taskRequest);
      
      // Construct proper API URL - handle both client and server side
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/tasks/auto-create`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API returned error status:', response.status, errorText);
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`
        };
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Task created successfully:', result.taskId);
        return {
          success: true,
          taskId: result.taskId
        };
      } else {
        console.error('Task creation failed:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to create task'
        };
      }
    } catch (error: any) {
      console.error('Task creation request failed:', error);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to parse URL')) {
        return {
          success: false,
          error: 'Invalid API endpoint configuration'
        };
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network connection error - please check your internet connection'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error while creating task'
      };
    }
  }

  /**
   * Generate success response after task creation
   */
  static generateSuccessResponse(customerName: string, location?: string): string {
    const locationText = location ? ` in ${location}` : '';
    return `Thanks, ${customerName}. We’ll be in touch shortly about your service${locationText}.`;
  }
}