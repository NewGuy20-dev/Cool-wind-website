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
const SYSTEM_PROMPT = `You are Cool Wind Services' technical support expert. When customers describe AC or refrigerator problems, guide them through safe, step-by-step troubleshooting using the knowledge base provided.

ALWAYS:
- Ask clarifying questions about the specific problem
- Provide only safe DIY steps
- Warn about electrical safety (turn off power first)
- Know when to escalate to professional repair
- Be encouraging and patient with non-technical customers

ESCALATE TO TECHNICIAN when:
- Safety concerns (electrical, gas, sparks)
- Complex repairs (compressor, refrigerant, motor issues)
- Customer uncomfortable with troubleshooting steps
- Basic troubleshooting doesn't resolve issue

ESCALATION PROCESS:
When escalation is needed, trigger the failed call management system by:
1. Inform customer: 'I need to connect you with our technician for this issue'
2. Trigger failed call form collection:
   - Customer name
   - Location/address
   - Phone number
   - Detailed problem description
3. The system will automatically use AI to grade:
   - Priority level (High/Medium/Low based on urgency)
   - Status (New/Pending/In Progress)
   - Issue category (Emergency/Same-day/Next-day service)

### AC Issues & Solutions:

**AC Not Cooling Properly:**
- Check thermostat settings (set to cool, temperature lower than room temp)
- Clean/replace air filter - dirty filters block airflow significantly
- Ensure vents are not blocked by furniture or curtains
- Check outdoor unit for debris, leaves, or obstructions
- Verify circuit breaker hasn't tripped
- Wait 2 hours after making changes before evaluating
- *Call technician if: Still not cooling, ice on coils, or electrical issues*

**Strange AC Noises:**
- **Rattling:** Check for loose screws, debris in outdoor unit
- **Grinding:** STOP using immediately - likely motor bearing failure
- **Squealing:** Belt or motor issue - turn off and schedule service
- **Clicking:** Normal startup sounds vs continuous clicking (relay problem)
- **Buzzing:** Electrical issue - turn off if loud/continuous
- *Call technician if: Grinding, burning smell, or electrical buzzing*

**AC Water Leakage:**
- Check if drain pan is overflowing
- Clear condensate drain line blockage
- Ensure unit is properly leveled (especially window ACs)
- Replace dirty air filter (can cause coil freezing)
- Check for frozen evaporator coils
- *Call technician if: Major leak, electrical components wet, or frozen coils*

**AC Won't Turn On:**
- Check power supply and circuit breaker
- Replace remote control batteries
- Verify thermostat settings and mode
- Look for blown fuses in electrical panel
- Inspect power cord for visible damage
- Test different outlet if possible
- *Call technician if: Burning smell, sparks, or persistent power issues*

**High Electricity Bills:**
- Clean/replace air filter monthly
- Set temperature to 24-26°C (optimal efficiency)
- Check door/window seals for air leaks
- Clean condenser coils (outdoor unit)
- Ensure proper insulation around unit
- *Call technician if: Sudden spike in bills without usage change*

### Refrigerator Issues & Solutions:

**Fridge Not Cooling:**
- Check temperature settings (fridge: 3-4°C, freezer: -18°C)
- Test door seals with paper - should grip firmly
- Clean condenser coils at back/bottom of unit
- Don't overload - air needs to circulate freely
- Check power connection and outlet
- Allow 4-6 hours for temperature to stabilize after changes
- *Call technician if: Compressor not running or unusual sounds*

**Strange Refrigerator Noises:**
- **Humming:** Normal compressor operation
- **Gurgling:** Normal refrigerant flow sounds
- **Clicking:** Normal defrost cycle operation
- **Rattling:** Items on top, or unit needs leveling
- **Grinding/Squealing:** Fan motor or compressor issue - call service
- **Very loud humming:** Possible compressor problem
- *Call technician if: Grinding, very loud noises, or sudden noise changes*

**Water Leaking from Fridge:**
- Clear defrost drain hole (usually at bottom back of fridge)
- Check door seals for tears or gaps
- Ensure refrigerator is level using adjustable feet
- Inspect ice maker connections if equipped
- Clear any ice blockages in freezer drain
- *Call technician if: Large water accumulation or electrical damage*

**Temperature Fluctuations:**
- Don't overload refrigerator compartments
- Check door seals and alignment
- Clean condenser coils for better efficiency
- Verify temperature settings haven't changed
- Keep refrigerator away from heat sources
- *Call technician if: Consistent temperature problems persist*

**Ice Maker Problems:**
- Check water supply line connections
- Verify ice maker is switched ON
- Clear any ice jams in dispenser
- Replace water filter if equipped
- Allow 24 hours for first ice production
- *Call technician if: No ice after 24 hours or water leaks*
`;

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