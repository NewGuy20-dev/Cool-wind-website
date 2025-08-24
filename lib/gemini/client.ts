import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ChatMessage, ChatResponse, ConversationContextData } from '@/lib/types/chat';
import { BusinessLogicProcessor } from '@/lib/chat/business-logic';
import { ChatErrorHandler } from '@/lib/chat/error-handler';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Model configuration
const modelConfig = {
  model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 1000,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
};

// System prompt for Cool Wind Services
const SYSTEM_PROMPT = `You are a helpful customer service representative for Cool Wind Services, Kerala's leading AC and refrigerator spare parts supplier and service provider located in Thiruvalla, serving Thiruvalla and Pathanamthitta districts.

BUSINESS PROFILE:
- Company: Cool Wind Services  
- Location: Thiruvalla, Pathanamthitta, Kerala, India
- Phone: +91 85472 29991 (also WhatsApp)
- Main Services: 
  1. SPARE PARTS SUPPLY (PRIMARY) - Genuine AC/refrigerator parts, bulk orders, same-day delivery
  2. EXPERT SERVICING (PRIMARY) - All brands, emergency repairs, maintenance
  3. Sales & Second-hand (Secondary) - New/refurbished appliances

PERSONALITY & TONE:
- Professional yet warm and approachable
- Knowledgeable about technical aspects without being overwhelming
- Local and personal: "We're your neighborhood experts"
- Helpful and solution-oriented
- Emphasize reliability, genuine parts, and quick service

RESPONSE GUIDELINES:
1. Always greet customers warmly and identify yourself as Cool Wind Services assistant
2. Prioritize spare parts inquiries and service bookings (main business)
3. For technical questions: Provide helpful guidance but recommend professional inspection
4. For urgent repairs: Emphasize emergency service availability and quick response
5. For parts orders: Ask for appliance model, part needed, and quantity
6. Always provide contact details when appropriate: +91 85472 29991
7. For complex issues: Offer to connect with human technician
8. Keep responses concise but informative (max 150 words typically)
9. Use local context: mention Thiruvalla/Pathanamthitta service areas
10. End conversations by offering further assistance or human contact

KNOWLEDGE BASE TOPICS:
- AC parts: compressors, thermostats, filters, coils, control boards
- Refrigerator parts: compressors, door seals, thermostats, defrost timers
- Common problems: cooling issues, gas leaks, electrical faults, noise problems
- Service areas: Thiruvalla, Pathanamthitta and surrounding areas
- Brands serviced: Samsung, LG, Whirlpool, Voltas, Blue Star, Godrej, etc.
- Emergency service: Available 24/7 for urgent repairs
- Warranty: 6 months on repairs, genuine parts guarantee

ESCALATION TRIGGERS:
- Complex technical diagnosis needed
- Customer requests human agent
- Complaint or dissatisfaction
- Bulk/commercial orders
- Warranty claims or disputes
- Installation requirements

Remember: You represent a trusted local business with 15+ years of experience. Focus on building trust and converting inquiries into calls or WhatsApp contacts.`;

export class GeminiClient {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel(modelConfig);
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[],
    context: ConversationContextData
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Build conversation context
      const chatHistory = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Add system context
      const systemContext = this.buildSystemContext(context);
      const enhancedPrompt = `${SYSTEM_PROMPT}\n\n${systemContext}\n\nUser: ${userMessage}`;

      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: modelConfig.generationConfig,
      });

      const result = await chat.sendMessage(enhancedPrompt);
      const response = result.response.text();

      // Track performance
      this.trackAPICall(startTime, result.response.usageMetadata?.totalTokenCount || 0, true);

      // Process and enhance response
      return this.processGeminiResponse(response, context);

    } catch (error) {
      this.trackAPICall(startTime, 0, false);
      ChatErrorHandler.logError(error, context);
      return ChatErrorHandler.handleGeminiError(error);
    }
  }

  private buildSystemContext(context: ConversationContextData): string {
    const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    return `
Current conversation context:
- Customer inquiry type: ${context.currentIntent || 'Not determined'}
- Location: ${context.customerInfo?.location || 'Not specified'}
- Conversation stage: ${context.conversationStage}
- Previous context: ${JSON.stringify(context.inquiryDetails)}

Business information:
- Current time: ${currentTime} IST
- Service areas: Thiruvalla, Pathanamthitta
- Emergency service available 24/7
- Same-day parts delivery in Thiruvalla
- Phone/WhatsApp: +91 85472 29991
    `;
  }

  private processGeminiResponse(response: string, context: ConversationContextData): ChatResponse {
    // Use business logic processor to enhance response
    return BusinessLogicProcessor.enhanceResponse(response, context);
  }

  private generateQuickReplies(context: ConversationContextData): any[] {
    const stage = context.conversationStage;
    
    if (stage === 'greeting') {
      return [
        { text: "🔧 Need Repair Service", value: "repair_service" },
        { text: "📦 Order Spare Parts", value: "spare_parts" },
        { text: "🛒 Buy Appliances", value: "sales" },
        { text: "❓ General Question", value: "general" }
      ];
    }
    
    if (context.currentIntent === 'SERVICE_REQUEST') {
      return [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
      ];
    }
    
    if (context.currentIntent === 'SPARE_PARTS_INQUIRY') {
      return [
        { text: "AC Parts", value: "ac_parts" },
        { text: "Fridge Parts", value: "fridge_parts" },
        { text: "Send Part Photo", value: "photo_upload" }
      ];
    }
    
    return [];
  }

  private calculateBusinessRelevance(response: string): number {
    const businessKeywords = [
      'cool wind', 'thiruvalla', 'pathanamthitta', 'spare parts', 
      'repair', 'service', 'ac', 'refrigerator', 'compressor'
    ];
    
    const lowerResponse = response.toLowerCase();
    const matches = businessKeywords.filter(keyword => 
      lowerResponse.includes(keyword)
    ).length;
    
    return Math.min(matches / businessKeywords.length, 1);
  }

  private handleError(error: any): ChatResponse {
    if (error.status === 429) {
      return {
        text: "I'm experiencing high demand right now. Please call us directly at +91 85472 29991 for immediate assistance.",
        quickReplies: [
          { text: "Call Now", action: "tel:+918547229991" },
          { text: "Try Again", value: "retry" }
        ]
      };
    }
    
    if (error.status >= 500) {
      return {
        text: "I'm having technical difficulties. Let me connect you with our team directly: +91 85472 29991",
        quickReplies: [
          { text: "Call Now", action: "tel:+918547229991" },
          { text: "WhatsApp", action: "https://wa.me/918547229991" }
        ],
        actions: [{ type: 'escalate', reason: 'technical_error' }]
      };
    }
    
    return {
      text: "I apologize for the confusion. For immediate assistance with spare parts or repairs, please contact us at +91 85472 29991. Our team is always ready to help!",
      quickReplies: [
        { text: "Call Now", action: "tel:+918547229991" },
        { text: "WhatsApp", action: "https://wa.me/918547229991" }
      ]
    };
  }

  private trackAPICall(startTime: number, tokensUsed: number, success: boolean) {
    const responseTime = Date.now() - startTime;
    
    console.log({
      timestamp: new Date().toISOString(),
      responseTime,
      tokensUsed,
      success,
      model: modelConfig.model
    });
    
    if (responseTime > 3000) {
      console.warn('Slow Gemini response detected:', responseTime + 'ms');
    }
  }
}