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
    // Phone call related triggers
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
    
    // Additional phone variations
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
    "couldnt connect the call",
    
    // Service appointment no-show triggers
    "technician never showed up",
    "technician didn't show up",
    "technician didnt show up",
    "no one came for the service",
    "missed my appointment",
    "missed the appointment",
    "nobody came for the service",
    "was scheduled but no one came",
    "had an appointment but no one came",
    "was supposed to have service but",
    "service was scheduled but",
    "appointment was missed",
    "service call was missed",
    "technician failed to arrive",
    "technician didn't arrive",
    "technician was a no-show",
    "technician never arrived",
    "service was not provided as scheduled",
    "service appointment was not kept",
    "technician didn't come as promised",
    "technician was supposed to come but"
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
    
    // Enhanced logging for debugging
    console.log('🔍 Checking for failed call triggers in message:', message);
    
    // Check for trigger phrases with more flexible matching
    let triggerPhrase: string | undefined;
    
    // First check for service appointment no-shows
    if (!triggerPhrase) {
      const noShowPhrases = [
        'technician never showed',
        'technician did not show',
        'technician didnt show',
        'missed my appointment',
        'missed the appointment',
        'no one came',
        'nobody came',
        'was scheduled but no one came',
        'had an appointment but no one came',
        'was supposed to have service but',
        'service was scheduled but',
        'appointment was missed',
        'service call was missed',
        'technician failed to arrive',
        'technician was a no-show',
        'technician never arrived',
        'service was not provided',
        'service appointment was not kept',
        'technician did not come',
        'technician was supposed to come but',
        'waited but no one came',
        'no one showed up',
        'technician was late',
        'missed service',
        'service was skipped',
        'forgot about my appointment',
        'missed the technician',
        'technician forgot',
        'service was forgotten',
        'technician missed',
        'was stood up by technician'
      ];

      const hasNoShow = noShowPhrases.some(phrase => lowerMessage.includes(phrase));
      
      if (hasNoShow) {
        triggerPhrase = 'technician no-show';
        console.log('🚨 [FailedCallDetector] Service appointment no-show detected');
      }
    }
    
    // Then check other trigger phrases if no no-show detected
    if (!triggerPhrase) {
      // Check for failed call patterns
      const failedCallPatterns = [
        'failed call',
        'missed call',
        'unanswered call',
        'could not reach',
        'no one answered',
        'call dropped',
        'call disconnected',
        'call failed',
        'tried calling',
        'called but',
        'no response',
        'busy signal',
        'call not going through',
        'unable to connect',
        'phone not answered',
        'called your number',
        'tried to call',
        'could not get through',
        'line was busy',
        'phone was busy',
        'no answer when i called',
        'no answer',
        'did not answer',
        'didnt answer',
        'tried reaching you',
        'attempted to call',
        'phone went to voicemail',
        'voicemail when i called',
        'could not connect the call',
        'couldnt connect the call',
        'phone rang and rang',
        'no one picked up',
        'call was not answered',
        'tried contacting you',
        'could not contact you',
        'phone was not answered',
        'tried your number',
        'called multiple times',
        'tried several times',
        'phone was not reachable',
        'number was not reachable',
        'call did not connect',
        'call would not go through',
        'unable to reach you',
        'could not get a hold of you',
        'tried getting through',
        'phone kept ringing',
        'call was unsuccessful',
        'attempted contact',
        'tried to reach out',
        'called earlier but',
        'tried calling earlier',
        'phone was off',
        'phone was switched off',
        'phone was unavailable',
        'line was dead',
        'phone was not working',
        'call got disconnected',
        'call was cut off',
        'call ended unexpectedly',
        'tried your contact number',
        'attempted to contact you',
        'tried your phone',
        'called your mobile',
        'tried your mobile',
        'called your office',
        'tried your office number',
        'called the number',
        'tried the number',
        'called but no reply',
        'tried calling but no reply',
        'called but no answer',
        'tried calling but no answer',
        'called but no one picked up',
        'tried calling but no one picked up',
        'called but it rang out',
        'tried calling but it rang out',
        'called but went to voicemail',
        'tried calling but went to voicemail',
        'called but got voicemail',
        'tried calling but got voicemail',
        'called but no one was there',
        'tried calling but no one was there',
        'called but no response',
        'tried calling but no response',
        'called but no luck',
        'tried calling but no luck',
        'called but no success',
        'tried calling but no success',
        'called but no one was available',
        'tried calling but no one was available',
        'called but no one could help',
        'tried calling but no one could help',
        'called but no one could assist',
        'tried calling but no one could assist',
        'called but no one could take my call',
        'tried calling but no one could take my call',
        'called but no one was around',
        'tried calling but no one was around',
        'called but no one was in',
        'tried calling but no one was in',
        'called but no one was there to answer',
        'tried calling but no one was there to answer',
        'called but no one was available to talk',
        'tried calling but no one was available to talk',
        'called but no one was available to help',
        'tried calling but no one was available to help',
        'called but no one was available to assist',
        'tried calling but no one was available to assist',
        'called but no one was available to take my call',
        'tried calling but no one was available to take my call'
      ];
      
      const hasFailedCallPattern = failedCallPatterns.some(pattern => lowerMessage.includes(pattern));
      
      if (hasFailedCallPattern) {
        triggerPhrase = 'failed call';
        console.log('🚨 [FailedCallDetector] Failed call pattern detected');
      }
    }
    
    // Finally, check the original trigger phrases if still no match
    if (!triggerPhrase) {
      triggerPhrase = this.FAILED_CALL_TRIGGERS.find(trigger => 
        lowerMessage.includes(trigger.toLowerCase())
      );
    }

    if (!triggerPhrase) {
      console.log('❌ [FailedCallDetector] No failed call triggers found in message');
      return {
        detected: false,
        customerData: {},
        missingFields: []
      };
    }

    console.log(`🚨 [FailedCallDetector] Failed call trigger detected: "${triggerPhrase}"`);

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
      if (field === 'name') return "Got it. What's your name?";
      if (field === 'phone number') return "Thanks. What's the best 10-digit number to reach you?";
      if (field === 'location') return "Thanks. Which area are you in?";
      if (field === 'problem description') return "What's the specific problem with your AC or refrigerator? Please describe what's happening - is it not cooling, making noise, leaking, or something else?";
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
   * Create task via API (updated for Supabase integration)
   */
  static async createTask(taskRequest: TaskCreationRequest): Promise<{
    success: boolean;
    taskId?: string;
    taskNumber?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 Creating task via Supabase API:', {
        customer: taskRequest.customerName,
        priority: taskRequest.priority,
        source: taskRequest.source
      });
      
      // Construct proper API URL - handle both client and server side
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/tasks/auto-create`;
      
      // Map old interface to new Supabase API format
      const apiPayload = {
        customerName: taskRequest.customerName,
        phoneNumber: taskRequest.phoneNumber,
        problemDescription: taskRequest.problemDescription,
        priority: taskRequest.priority,
        status: 'pending',
        source: taskRequest.source,
        location: taskRequest.location,
        urgencyKeywords: taskRequest.urgencyKeywords,
        chatContext: taskRequest.chatContext,
        title: `Service request: ${taskRequest.problemDescription.substring(0, 50)}${taskRequest.problemDescription.length > 50 ? '...' : ''}`,
        metadata: {
          created_by: 'failed-call-detector',
          original_request: taskRequest,
          detection_timestamp: new Date().toISOString()
        }
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        let errorText: string;
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorText = await response.text() || `HTTP ${response.status}`;
        }
        
        console.error('❌ API returned error status:', response.status, errorText);
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`
        };
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('🎉 Task created successfully in Supabase:', {
          taskId: result.taskId,
          taskNumber: result.taskNumber,
          priority: result.priority
        });
        
        return {
          success: true,
          taskId: result.taskId,
          taskNumber: result.taskNumber
        };
      } else {
        console.error('❌ Task creation failed:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to create task'
        };
      }
    } catch (error: any) {
      console.error('❌ Task creation request failed:', error);
      
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