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
  // Keep in-memory cache for performance, but use database as source of truth
  private static cache = new Map<string, { state: ChatState; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get Supabase client
   */
  private static async getSupabase() {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Set chat state for a session (async with database persistence)
   */
  static async setChatState(sessionId: string, stateKey: string, stateData: any): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      
      // Get current state from database
      const { data: existing } = await supabase
        .from('chat_states')
        .select('state')
        .eq('session_id', sessionId)
        .single();
      
      const currentState = existing?.state || {};
      currentState[stateKey] = stateData;
      
      // Upsert to database
      const { error } = await supabase
        .from('chat_states')
        .upsert({
          session_id: sessionId,
          state: currentState,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id'
        });
      
      if (error) {
        console.error('Error saving chat state to database:', error);
        // Fall back to in-memory if database fails
        const memState = this.cache.get(sessionId)?.state || {};
        memState[stateKey] = stateData;
        this.cache.set(sessionId, { state: memState, timestamp: Date.now() });
      } else {
        // Update cache
        this.cache.set(sessionId, { state: currentState, timestamp: Date.now() });
        console.log(`Chat state set for session ${sessionId}:`, stateKey, stateData);
      }
    } catch (error) {
      console.error('Error in setChatState:', error);
      // Fall back to in-memory
      const memState = this.cache.get(sessionId)?.state || {};
      memState[stateKey] = stateData;
      this.cache.set(sessionId, { state: memState, timestamp: Date.now() });
    }
  }

  /**
   * Get chat state for a session (async with database fallback)
   */
  static async getChatState(sessionId: string, stateKey?: string): Promise<any> {
    try {
      // Check cache first
      const cached = this.cache.get(sessionId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        const state = cached.state;
        if (stateKey) {
          return state[stateKey] || null;
        }
        return state;
      }
      
      // Fetch from database
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('chat_states')
        .select('state')
        .eq('session_id', sessionId)
        .single();
      
      if (error || !data) {
        console.log(`⚠️ No state found in database for session ${sessionId}`);
        return null;
      }
      
      // Update cache
      this.cache.set(sessionId, { state: data.state, timestamp: Date.now() });
      
      if (stateKey) {
        return data.state[stateKey] || null;
      }
      
      return data.state;
    } catch (error) {
      console.error('Error in getChatState:', error);
      // Fall back to cache
      const cached = this.cache.get(sessionId);
      if (cached) {
        const state = cached.state;
        if (stateKey) {
          return state[stateKey] || null;
        }
        return state;
      }
      return null;
    }
  }

  /**
   * Clear specific chat state
   */
  static async clearChatState(sessionId: string, stateKey: string): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      const { data: existing } = await supabase
        .from('chat_states')
        .select('state')
        .eq('session_id', sessionId)
        .single();
      
      if (existing?.state && existing.state[stateKey]) {
        delete existing.state[stateKey];
        await supabase
          .from('chat_states')
          .update({ state: existing.state })
          .eq('session_id', sessionId);
        
        // Update cache
        this.cache.set(sessionId, { state: existing.state, timestamp: Date.now() });
        console.log(`Chat state cleared for session ${sessionId}:`, stateKey);
      }
    } catch (error) {
      console.error('Error clearing chat state:', error);
    }
  }

  /**
   * Clear all chat state for a session
   */
  static async clearAllChatState(sessionId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      await supabase
        .from('chat_states')
        .delete()
        .eq('session_id', sessionId);
      
      this.cache.delete(sessionId);
      console.log(`All chat state cleared for session ${sessionId}`);
    } catch (error) {
      console.error('Error clearing all chat state:', error);
    }
  }

  /**
   * Check if session has any active state
   */
  static async hasActiveState(sessionId: string): Promise<boolean> {
    const state = await this.getChatState(sessionId);
    return state ? Object.keys(state).length > 0 : false;
  }

  /**
   * Update callback info collection state
   */
  static async updateCallbackInfoState(
    sessionId: string, 
    updates: Partial<ChatState['collecting_callback_info']>
  ): Promise<void> {
    const currentState = await this.getChatState(sessionId, 'collecting_callback_info') || {};
    const updatedState = { ...currentState, ...updates };
    await this.setChatState(sessionId, 'collecting_callback_info', updatedState);
  }

  /**
   * Get callback info collection state
   */
  static async getCallbackInfoState(sessionId: string): Promise<ChatState['collecting_callback_info'] | null> {
    return await this.getChatState(sessionId, 'collecting_callback_info');
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
    // Handle short replies that are only a phone number (e.g., "8848850922" or "1234567890")
    if (!extracted.phone) {
      const onlyDigits = message.replace(/\D/g, '');
      if (/^[6-9]\d{9}$/.test(onlyDigits)) {
        extracted.phone = onlyDigits;
      } else if (/^\d{10}$/.test(onlyDigits)) {
        // Accept any 10-digit number for non-Indian formats
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
    const required = ['name', 'phone', 'location', 'problem'];
    
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
          // First check for valid Indian mobile number (10 digits starting with 6-9)
          const cleaned = value.replace(/[\s\-]/g, '');
          if (/^[6-9]\d{9}$/.test(cleaned)) {
            return true;
          }
          // For non-Indian format, accept any 10-digit number
          return /^\d{10}$/.test(cleaned);
        
        case 'name':
          // Must be at least 2 characters, only letters and spaces
          return value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
        
        case 'location':
          // Must be at least 3 characters, only letters and spaces
          return value.length >= 3 && /^[a-zA-Z\s]+$/.test(value);
        
        case 'problem':
          // Must be at least 5 characters for meaningful problem description
          return value.length >= 5;
        
        default:
          return true;
      }
    });
  }

  /**
   * Get still missing or invalid fields
   */
  static getStillMissingFields(customerData: Record<string, any>): string[] {
    const required = ['name', 'phone', 'location', 'problem'];
    const missing: string[] = [];

    required.forEach(field => {
      let isValid = false;
      
      if (customerData[field] && typeof customerData[field] === 'string') {
        const value = customerData[field].trim();
        
        if (value.length > 0) {
          // Additional validation based on field type
          switch (field) {
            case 'phone':
              const cleanedPhone = value.replace(/[\s\-]/g, '');
              // First check for valid Indian mobile number (10 digits starting with 6-9)
              if (/^[6-9]\d{9}$/.test(cleanedPhone)) {
                isValid = true;
              } else {
                // For non-Indian format, accept any 10-digit number
                isValid = /^\d{10}$/.test(cleanedPhone);
              }
              break;
            case 'name':
              isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
              break;
            case 'location':
              isValid = value.length >= 3 && /^[a-zA-Z\s]+$/.test(value);
              break;
            case 'problem':
              isValid = value.length >= 5;
              break;
            default:
              isValid = true;
          }
        }
      }
      
      if (!isValid) {
        let fieldName = field;
        if (field === 'phone') fieldName = 'phone number';
        else if (field === 'problem') fieldName = 'problem description';
        missing.push(fieldName);
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
      'location': 'your location',
      'problem description': 'the specific problem'
    };

    const mappedFields = missingFields.map(field => fieldMap[field] || field);

    if (mappedFields.length === 1) {
      const field = missingFields[0];
      if (field === 'name') return "What's your name?";
      if (field === 'phone number') return "What's the best 10-digit number to reach you?";
      if (field === 'location') return "Which area are you in?";
      if (field === 'problem description') return "What's the specific problem with your AC or refrigerator? Please describe what's happening.";
      return `Could you share ${mappedFields[0]}?`;
    } else if (mappedFields.length === 2) {
      return `Could you share ${mappedFields[0]} and ${mappedFields[1]}?`;
    } else {
      const lastField = mappedFields.pop();
      return `Could you share ${mappedFields.join(', ')}, and ${lastField}?`;
    }
  }

  /**
   * Clean up expired states (run periodically)
   */
  static async cleanupExpiredStates(): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase.rpc('cleanup_old_chat_states');
      
      if (!error && data) {
        console.log(`🧹 Cleaned up ${data} expired chat states`);
      }
      
      // Also clean up cache
      const now = Date.now();
      for (const [sessionId, cached] of this.cache.entries()) {
        if (now - cached.timestamp > this.CACHE_TTL) {
          this.cache.delete(sessionId);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired states:', error);
    }
  }
}

// Clean up expired states every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ChatStateManager.cleanupExpiredStates();
  }, 10 * 60 * 1000);
}