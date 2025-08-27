/**
 * Chat State Management for handling multi-step conversations
 * Particularly for failed call information collection
 */

import { GeminiInformationExtractor } from '@/lib/gemini/information-extractor';

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
   * Extract customer information from user message using Gemini AI
   */
  static async extractCustomerInfoFromMessage(message: string): Promise<{
    name?: string;
    phone?: string;
    location?: string;
    problem?: string;
  }> {
    try {
      // Use Gemini AI for intelligent extraction
      const extracted = await GeminiInformationExtractor.extractCustomerInfo(message);
      
      // Convert to the expected format, only including fields with good confidence
      const result: any = {};
      
      if (extracted.name && extracted.confidence.name >= 0.5) {
        result.name = extracted.name;
      }
      
      if (extracted.phone && extracted.confidence.phone >= 0.5) {
        result.phone = extracted.phone;
      }
      
      if (extracted.location && extracted.confidence.location >= 0.5) {
        result.location = extracted.location;
      }
      
      if (extracted.problem && extracted.confidence.problem >= 0.5) {
        result.problem = extracted.problem;
      }
      
      // Backfill with fallback parser when Gemini returns low-confidence or missing fields
      if (!result.name || !result.phone || !result.location) {
        const fallback = this.extractCustomerInfoFromMessageFallback(message);
        if (!result.name && fallback.name) result.name = fallback.name;
        if (!result.phone && fallback.phone) result.phone = fallback.phone;
        if (!result.location && fallback.location) result.location = fallback.location;
        if (!result.problem && fallback.problem) result.problem = fallback.problem;
      }

      console.log('🤖 Gemini extracted customer info:', result);
      console.log('🎯 Confidence scores:', extracted.confidence);
      
      return result;
      
    } catch (error) {
      console.error('❌ Gemini extraction failed, using fallback:', error);
      return this.extractCustomerInfoFromMessageFallback(message);
    }
  }

  /**
   * Fallback extraction method using improved regex patterns
   */
  private static extractCustomerInfoFromMessageFallback(message: string): {
    name?: string;
    phone?: string;
    location?: string;
    problem?: string;
  } {
    const extracted: any = {};
    const lowerMessage = message.toLowerCase();

    // Improved name extraction - stop at conjunctions
    const namePatterns = [
      /(?:my name is|i am|i'm|call me)\s+([a-zA-Z]+)(?:\s|$|,|and|but|phone)/i,
      /(?:this is|here is)\s+([a-zA-Z]+)(?:\s|$|,|and|but|phone)/i,
      // Single-token reply that looks like a name (no digits, short)
      /^(?:name\s*is\s*)?([a-zA-Z]{2,20})$/i,
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate it looks like a name (not too generic)
        if (name.length >= 2 && !['yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'and', 'phone'].includes(name.toLowerCase())) {
          extracted.name = name;
          break;
        }
      }
    }

    // Improved phone number extraction
    const phonePatterns = [
      /(?:phone|number|no)\s*(?:is)?\s*([6-9]\d{9})/i, // Indian mobile pattern
      /([6-9]\d{9})/g // Direct 10-digit Indian mobile
    ];
    // Handle short replies that are only a phone number (e.g., "8848850922")
    if (!extracted.phone) {
      const onlyDigits = message.replace(/\D/g, '');
      if (/^[6-9]\d{9}$/.test(onlyDigits)) {
        extracted.phone = onlyDigits;
      }
    }


    for (const pattern of phonePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const phone = match[1].replace(/[\s\-]/g, '');
        if (/^[6-9]\d{9}$/.test(phone)) {
          extracted.phone = phone;
          break;
        }
      }
    }

    // Improved location extraction
    const knownLocations = ['thiruvalla', 'pathanamthitta', 'kerala'];
    for (const location of knownLocations) {
      if (lowerMessage.includes(location)) {
        extracted.location = location.charAt(0).toUpperCase() + location.slice(1);
        break;
      }
    }

    // If no known location found, try patterns
    if (!extracted.location) {
      const locationPatterns = [
        /(?:location is|in|at|from)\s+([a-zA-Z]+)(?:\s|$|,|and|but|problem)/i,
        // Single-token reply that looks like a place
        /^([a-zA-Z]{3,20})$/i,
      ];
      
      for (const pattern of locationPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          const location = match[1].trim();
          if (location.length >= 3 && !['and', 'problem', 'phone', 'is'].includes(location.toLowerCase())) {
            extracted.location = location;
            break;
          }
        }
      }
    }

    // Extract problem description
    const problemPatterns = [
      /(?:problem is|issue is|trouble with)\s+([^.!?]+)/i,
      /(?:ac|refrigerator|fridge)\s+([^.!?]+)/i,
      /(not working|broken|not cooling|leaking|burst|making noise)/i
    ];

    for (const pattern of problemPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        extracted.problem = match[1].trim();
        break;
      }
    }

    console.log('📝 Fallback extracted customer info:', extracted);
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
   * Check if all required fields are present and valid
   */
  static hasAllRequiredFields(customerData: Record<string, any>): boolean {
    const required = ['name', 'phone', 'location'];
    
    return required.every(field => {
      if (!customerData[field] || typeof customerData[field] !== 'string') {
        return false;
      }
      
      const value = customerData[field].trim();
      
      if (value.length === 0) {
        return false;
      }
      
      // Additional validation based on field type
      switch (field) {
        case 'phone':
          // Must be 10-digit Indian mobile number
          return /^[6-9]\d{9}$/.test(value.replace(/[\s\-]/g, ''));
        
        case 'name':
          // Must be at least 2 characters, only letters and spaces
          return value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
        
        case 'location':
          // Must be at least 3 characters, only letters and spaces
          return value.length >= 3 && /^[a-zA-Z\s]+$/.test(value);
        
        default:
          return true;
      }
    });
  }

  /**
   * Get still missing or invalid fields
   */
  static getStillMissingFields(customerData: Record<string, any>): string[] {
    const required = ['name', 'phone', 'location'];
    const missing: string[] = [];

    required.forEach(field => {
      let isValid = false;
      
      if (customerData[field] && typeof customerData[field] === 'string') {
        const value = customerData[field].trim();
        
        if (value.length > 0) {
          // Additional validation based on field type
          switch (field) {
            case 'phone':
              isValid = /^[6-9]\d{9}$/.test(value.replace(/[\s\-]/g, ''));
              break;
            case 'name':
              isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
              break;
            case 'location':
              isValid = value.length >= 3 && /^[a-zA-Z\s]+$/.test(value);
              break;
            default:
              isValid = true;
          }
        }
      }
      
      if (!isValid) {
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