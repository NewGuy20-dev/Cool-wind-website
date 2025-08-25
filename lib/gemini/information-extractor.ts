import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - handle missing API key gracefully
const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ExtractedCustomerInfo {
  name?: string;
  phone?: string;
  location?: string;
  problem?: string;
  confidence: {
    name: number;
    phone: number;
    location: number;
    problem: number;
  };
}

export class GeminiInformationExtractor {
  private static model = genAI ? genAI.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.1, // Low temperature for consistent extraction
      maxOutputTokens: 500,
    }
  }) : null;

  /**
   * Extract customer information using Gemini AI with structured prompting
   */
  static async extractCustomerInfo(message: string): Promise<ExtractedCustomerInfo> {
    const prompt = `
You are an expert information extraction system. Extract customer information from the following message and return ONLY a valid JSON object.

EXTRACTION RULES:
1. NAME: Extract the customer's name (first name or full name). Stop at conjunctions like "and", "but", "phone", etc.
2. PHONE: Extract Indian phone numbers (10 digits, may have +91 prefix). Clean format: remove spaces/dashes.
3. LOCATION: Extract location/city names. Prioritize known Kerala locations like Thiruvalla, Pathanamthitta.
4. PROBLEM: Extract the main issue/problem described (AC, refrigerator, etc.).
5. CONFIDENCE: Rate extraction confidence 0.0-1.0 for each field.

MESSAGE TO ANALYZE: "${message}"

RESPOND WITH ONLY THIS JSON FORMAT (no other text):
{
  "name": "extracted_name_or_null",
  "phone": "cleaned_phone_or_null", 
  "location": "location_or_null",
  "problem": "problem_description_or_null",
  "confidence": {
    "name": 0.0,
    "phone": 0.0,
    "location": 0.0,
    "problem": 0.0
  }
}`;

    try {
      // Check if Gemini is available
      if (!this.model || !apiKey) {
        console.log('⚠️ Gemini API key not found, using fallback extraction');
        return this.getFallbackExtraction(message);
      }

      console.log('🤖 Gemini: Extracting customer info from:', message);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      console.log('🤖 Gemini raw response:', response);
      
      // Clean the response to extract just the JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ Gemini: No JSON found in response');
        return this.getFallbackExtraction(message);
      }
      
      const extractedData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the extracted data
      const cleaned: ExtractedCustomerInfo = {
        name: this.validateName(extractedData.name),
        phone: this.validatePhone(extractedData.phone),
        location: this.validateLocation(extractedData.location),
        problem: this.validateProblem(extractedData.problem),
        confidence: {
          name: Math.max(0, Math.min(1, extractedData.confidence?.name || 0)),
          phone: Math.max(0, Math.min(1, extractedData.confidence?.phone || 0)),
          location: Math.max(0, Math.min(1, extractedData.confidence?.location || 0)),
          problem: Math.max(0, Math.min(1, extractedData.confidence?.problem || 0))
        }
      };
      
      console.log('✅ Gemini extracted info:', cleaned);
      return cleaned;
      
    } catch (error) {
      console.error('❌ Gemini extraction failed:', error);
      return this.getFallbackExtraction(message);
    }
  }

  /**
   * Validate and clean extracted name
   */
  private static validateName(name: any): string | undefined {
    if (!name || typeof name !== 'string') return undefined;
    
    const cleaned = name.trim();
    
    // Filter out common false positives
    const invalidNames = ['and', 'phone', 'number', 'location', 'problem', 'is', 'no', 'my'];
    if (invalidNames.includes(cleaned.toLowerCase()) || cleaned.length < 2) {
      return undefined;
    }
    
    // Only allow alphabetic characters and spaces
    if (!/^[a-zA-Z\s]+$/.test(cleaned)) {
      return undefined;
    }
    
    return cleaned;
  }

  /**
   * Validate and clean extracted phone number
   */
  private static validatePhone(phone: any): string | undefined {
    if (!phone || typeof phone !== 'string') return undefined;
    
    // Clean phone number: remove spaces, dashes, parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Remove +91 prefix if present
    const withoutCountryCode = cleaned.replace(/^\+?91/, '');
    
    // Validate Indian mobile number (10 digits starting with 6-9)
    if (/^[6-9]\d{9}$/.test(withoutCountryCode)) {
      return withoutCountryCode;
    }
    
    return undefined;
  }

  /**
   * Validate and clean extracted location
   */
  private static validateLocation(location: any): string | undefined {
    if (!location || typeof location !== 'string') return undefined;
    
    const cleaned = location.trim().toLowerCase();
    
    // Known valid locations (prioritize these)
    const knownLocations = [
      'thiruvalla', 'pathanamthitta', 'kerala', 'kottayam', 'alappuzha', 
      'kollam', 'ernakulam', 'thrissur', 'palakkad', 'malappuram'
    ];
    
    // Check if it matches known locations
    for (const known of knownLocations) {
      if (cleaned.includes(known)) {
        return known.charAt(0).toUpperCase() + known.slice(1);
      }
    }
    
    // If not a known location, validate it looks like a place name
    if (cleaned.length >= 3 && /^[a-zA-Z\s]+$/.test(location.trim())) {
      // Filter out common false positives
      const invalidLocations = ['and', 'problem', 'phone', 'number', 'my', 'is'];
      if (!invalidLocations.includes(cleaned)) {
        return location.trim();
      }
    }
    
    return undefined;
  }

  /**
   * Validate and clean extracted problem description
   */
  private static validateProblem(problem: any): string | undefined {
    if (!problem || typeof problem !== 'string') return undefined;
    
    const cleaned = problem.trim();
    
    // Must be at least 3 characters and not just common words
    if (cleaned.length < 3) return undefined;
    
    const invalidProblems = ['and', 'my', 'is', 'the'];
    if (invalidProblems.includes(cleaned.toLowerCase())) return undefined;
    
    return cleaned;
  }

  /**
   * Fallback extraction using regex patterns when Gemini fails
   */
  private static getFallbackExtraction(message: string): ExtractedCustomerInfo {
    console.log('🔄 Using fallback regex extraction...');
    
    const extracted: ExtractedCustomerInfo = {
      confidence: { name: 0, phone: 0, location: 0, problem: 0 }
    };
    
    // Extract name with improved pattern
    const nameMatch = message.match(/(?:my name is|i am|i'm|call me)\s+([a-zA-Z]+)(?:\s|$|,|and)/i);
    if (nameMatch && nameMatch[1]) {
      extracted.name = nameMatch[1].trim();
      extracted.confidence.name = 0.7;
    }
    
    // Extract phone number
    const phoneMatch = message.match(/(?:phone|number|no)\s*(?:is)?\s*([6-9]\d{9})/i);
    if (phoneMatch && phoneMatch[1]) {
      extracted.phone = phoneMatch[1];
      extracted.confidence.phone = 0.8;
    }
    
    // Extract location (known locations first)
    const lowerMessage = message.toLowerCase();
    const knownLocations = ['thiruvalla', 'pathanamthitta', 'kerala'];
    for (const location of knownLocations) {
      if (lowerMessage.includes(location)) {
        extracted.location = location.charAt(0).toUpperCase() + location.slice(1);
        extracted.confidence.location = 0.9;
        break;
      }
    }
    
    // Extract problem
    const problemMatch = message.match(/(?:problem is|issue is|trouble with)\s+([^.!?]+)/i) ||
                         message.match(/(ac|refrigerator|fridge)\s+([^.!?]+)/i) ||
                         message.match(/(not working|broken|not cooling|leaking|burst)/i);
    if (problemMatch) {
      extracted.problem = problemMatch[1] || problemMatch[0];
      extracted.confidence.problem = 0.6;
    }
    
    return extracted;
  }

  /**
   * Batch extract information from multiple messages (conversation context)
   */
  static async extractFromConversation(messages: string[]): Promise<ExtractedCustomerInfo> {
    if (messages.length === 0) {
      return { confidence: { name: 0, phone: 0, location: 0, problem: 0 } };
    }
    
    if (messages.length === 1) {
      return this.extractCustomerInfo(messages[0]);
    }
    
    // Combine recent messages for context
    const combinedMessage = messages.slice(-3).join(' ');
    return this.extractCustomerInfo(combinedMessage);
  }
}