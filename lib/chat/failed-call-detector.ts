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
  /**
   * Detect if a message contains failed call indicators
   */
  static async detectFailedCall(message: string, context: ConversationContextData): Promise<FailedCallData> {
    console.log('🔍 Using AI to detect failed call and extract info from message:', message);

    const extractedInfo = await GeminiInformationExtractor.extractCustomerInfo(message);

    if (!extractedInfo.isFailedCall) {
      console.log('✅ AI analysis: Not a failed call scenario.');
      return {
        detected: false,
        customerData: {},
        missingFields: [],
      };
    }

    console.log('🚨 AI analysis: Failed call scenario detected.');

    const customerData: Partial<CustomerInfo> = {
      name: extractedInfo.name || context.customerInfo?.name,
      phone: extractedInfo.phone || context.customerInfo?.phone,
      location: extractedInfo.location || context.customerInfo?.location,
    };

    const missingFields = this.identifyMissingFields(customerData, extractedInfo.problem);

    // Map critical urgency to high to maintain compatibility
    const mappedUrgency: 'high' | 'medium' | 'low' = 
      extractedInfo.urgency === 'critical' ? 'high' : extractedInfo.urgency;

    return {
      detected: true,
      triggerPhrase: 'AI-detected failed call',
      customerData,
      missingFields,
      problemDescription: extractedInfo.problem,
      location: customerData.location,
      urgencyLevel: mappedUrgency,
    };
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
      location: location.trim()
    };
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