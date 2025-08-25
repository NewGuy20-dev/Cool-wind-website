/**
 * Chat State Management for handling multi-step conversations
 * Particularly for failed call information collection
 */

export interface ChatState {
  collecting_callback_info?: {
    missingFields: string[];
    originalMessage: string;
    triggerPhrase: string;
    customerData: Record<string, any>;
    attempts: number;
    startedAt: string;
  };
  [key: string]: any;
}

export class ChatStateManager {
  private static states = new Map<string, ChatState>();

  /**
   * Set chat state for a session
   */
  static setChatState(sessionId: string, stateKey: string, stateData: any): void {
    const currentState = this.states.get(sessionId) || {};
    currentState[stateKey] = stateData;
    this.states.set(sessionId, currentState);
    
    console.log(`Chat state set for session ${sessionId}:`, stateKey, stateData);
  }

  /**
   * Get chat state for a session
   */
  static getChatState(sessionId: string, stateKey?: string): any {
    const state = this.states.get(sessionId);
    if (!state) return null;
    
    if (stateKey) {
      return state[stateKey] || null;
    }
    
    return state;
  }

  /**
   * Clear specific chat state
   */
  static clearChatState(sessionId: string, stateKey: string): void {
    const state = this.states.get(sessionId);
    if (state && state[stateKey]) {
      delete state[stateKey];
      this.states.set(sessionId, state);
      console.log(`Chat state cleared for session ${sessionId}:`, stateKey);
    }
  }

  /**
   * Clear all chat state for a session
   */
  static clearAllChatState(sessionId: string): void {
    this.states.delete(sessionId);
    console.log(`All chat state cleared for session ${sessionId}`);
  }

  /**
   * Check if session has any active state
   */
  static hasActiveState(sessionId: string): boolean {
    const state = this.states.get(sessionId);
    return state ? Object.keys(state).length > 0 : false;
  }

  /**
   * Update callback info collection state
   */
  static updateCallbackInfoState(
    sessionId: string, 
    updates: Partial<ChatState['collecting_callback_info']>
  ): void {
    const currentState = this.getChatState(sessionId, 'collecting_callback_info') || {};
    const updatedState = { ...currentState, ...updates };
    this.setChatState(sessionId, 'collecting_callback_info', updatedState);
  }

  /**
   * Get callback info collection state
   */
  static getCallbackInfoState(sessionId: string): ChatState['collecting_callback_info'] | null {
    return this.getChatState(sessionId, 'collecting_callback_info');
  }

  /**
   * Extract customer information from user message
   */
  static extractCustomerInfoFromMessage(message: string): {
    name?: string;
    phone?: string;
    location?: string;
    problem?: string;
  } {
    const extracted: any = {};
    const lowerMessage = message.toLowerCase();

    // Extract name patterns
    const namePatterns = [
      /(?:my name is|i am|i'm|call me)\s+([a-zA-Z\s]{2,30})/i,
      /(?:this is|here is)\s+([a-zA-Z\s]{2,30})/i,
      /^([a-zA-Z\s]{2,30})(?:\s|,|$)/i // Name at beginning of message
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate it looks like a name (not too generic)
        if (name.length >= 2 && !['yes', 'no', 'ok', 'okay', 'sure', 'thanks'].includes(name.toLowerCase())) {
          extracted.name = name;
          break;
        }
      }
    }

    // Extract phone number patterns
    const phonePatterns = [
      /(?:my number is|phone is|call me at|contact me on)\s*([+]?[0-9\s\-]{10,15})/i,
      /(?:my phone|number)\s*[:is]*\s*([+]?[0-9\s\-]{10,15})/i,
      /([+]?[0-9]{10,15})/g // Any sequence of 10+ digits
    ];

    for (const pattern of phonePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const phone = match[1].replace(/[\s\-]/g, '');
        if (phone.length >= 10) {
          extracted.phone = phone;
          break;
        }
      }
    }

    // Extract location patterns
    const locationPatterns = [
      /(?:in|at|from|located in|i'm in|i am in)\s+([a-zA-Z\s]{3,20})/i,
      /(?:my location is|location)\s*[:is]*\s*([a-zA-Z\s]{3,20})/i
    ];

    // Known locations get priority
    const knownLocations = ['thiruvalla', 'pathanamthitta', 'kerala'];
    for (const location of knownLocations) {
      if (lowerMessage.includes(location)) {
        extracted.location = location;
        break;
      }
    }

    // If no known location found, try patterns
    if (!extracted.location) {
      for (const pattern of locationPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          extracted.location = match[1].trim();
          break;
        }
      }
    }

    // Extract problem description
    const problemPatterns = [
      /(?:problem is|issue is|trouble with)\s+([^.!?]+)/i,
      /(?:ac|refrigerator|fridge)\s+([^.!?]+)/i,
      /(not working|broken|not cooling|leaking|making noise)/i
    ];

    for (const pattern of problemPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        extracted.problem = match[1].trim();
        break;
      }
    }

    console.log('Extracted customer info from message:', extracted);
    return extracted;
  }

  /**
   * Merge extracted info with existing customer data
   */
  static mergeCustomerData(existing: Record<string, any>, extracted: Record<string, any>): Record<string, any> {
    const merged = { ...existing };
    
    // Only update if extracted value is not empty and existing is empty
    Object.keys(extracted).forEach(key => {
      if (extracted[key] && (!merged[key] || merged[key].trim() === '')) {
        merged[key] = extracted[key];
      }
    });

    return merged;
  }

  /**
   * Check if all required fields are present
   */
  static hasAllRequiredFields(customerData: Record<string, any>): boolean {
    const required = ['name', 'phone', 'location'];
    return required.every(field => 
      customerData[field] && 
      typeof customerData[field] === 'string' && 
      customerData[field].trim().length > 0
    );
  }

  /**
   * Get still missing fields
   */
  static getStillMissingFields(customerData: Record<string, any>): string[] {
    const required = ['name', 'phone', 'location'];
    const missing: string[] = [];

    required.forEach(field => {
      if (!customerData[field] || customerData[field].trim() === '') {
        missing.push(field === 'phone' ? 'phone number' : field);
      }
    });

    return missing;
  }

  /**
   * Generate follow-up request for still missing information
   */
  static generateFollowUpRequest(missingFields: string[]): string {
    if (missingFields.length === 0) {
      return '';
    }

    const fieldMap: Record<string, string> = {
      'name': 'your name',
      'phone number': 'your phone number', 
      'location': 'your location'
    };

    const mappedFields = missingFields.map(field => fieldMap[field] || field);

    if (mappedFields.length === 1) {
      return `Thank you! I still need ${mappedFields[0]} to set up the callback properly.`;
    } else if (mappedFields.length === 2) {
      return `Thank you! I still need ${mappedFields[0]} and ${mappedFields[1]} to set up the callback properly.`;
    } else {
      const lastField = mappedFields.pop();
      return `Thank you! I still need ${mappedFields.join(', ')}, and ${lastField} to set up the callback properly.`;
    }
  }

  /**
   * Clean up expired states (run periodically)
   */
  static cleanupExpiredStates(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, state] of this.states.entries()) {
      if (state.collecting_callback_info) {
        const startedAt = new Date(state.collecting_callback_info.startedAt).getTime();
        if (now - startedAt > maxAge) {
          this.clearChatState(sessionId, 'collecting_callback_info');
          console.log(`Expired callback info state cleared for session: ${sessionId}`);
        }
      }
    }
  }
}

// Clean up expired states every 10 minutes
setInterval(() => {
  ChatStateManager.cleanupExpiredStates();
}, 10 * 60 * 1000);