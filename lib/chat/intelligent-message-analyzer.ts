import { GeminiClient } from '@/lib/gemini/client';
import { ConversationContextData } from '@/lib/types/chat';

export interface IntelligentAnalysisResult {
  // Failed call detection
  isFailedCallScenario: boolean;
  failedCallConfidence: number;
  failedCallReason: string;
  
  // Task management detection
  needsTaskManagement: boolean;
  taskType: 'create' | 'edit' | 'update' | 'status_check' | null;
  taskConfidence: number;
  
  // Intent analysis
  primaryIntent: string;
  secondaryIntents: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Context understanding
  customerFrustration: number; // 0-10 scale
  serviceExpectation: string;
  implicitNeeds: string[];
  
  // Response recommendations
  suggestedAction: string;
  responseStrategy: 'empathetic' | 'solution-focused' | 'escalation' | 'information-gathering';
}

export interface TaskManagementIntent {
  action: 'create' | 'edit' | 'update' | 'delete' | 'status' | 'list';
  confidence: number;
  taskDetails?: {
    customerName?: string;
    phoneNumber?: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: string;
    location?: string;
  };
  reasoning: string;
}

export class IntelligentMessageAnalyzer {
  private static geminiClient = new GeminiClient();

  /**
   * Analyze message using AI for intelligent pattern detection
   */
  static async analyzeMessage(
    message: string, 
    context: ConversationContextData,
    conversationHistory: any[] = []
  ): Promise<IntelligentAnalysisResult> {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(message, context, conversationHistory);
      
      const response = await this.geminiClient.generateResponse(
        analysisPrompt,
        [],
        { ...context, skipBusinessLogic: true }
      );

      return this.parseAnalysisResponse(response.text);
      
    } catch (error) {
      console.error('❌ Intelligent message analysis failed:', error);
      return this.getFallbackAnalysis(message);
    }
  }

  /**
   * Build comprehensive analysis prompt for Gemini
   */
  private static buildAnalysisPrompt(
    message: string, 
    context: ConversationContextData,
    conversationHistory: any[]
  ): string {
    return `
You are an expert customer service analyst for Cool Wind Services (AC & refrigerator repair company in Kerala). 
Analyze this customer message for multiple aspects:

CUSTOMER MESSAGE: "${message}"

CONVERSATION CONTEXT:
- Previous messages: ${conversationHistory.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n')}
- Customer info: ${JSON.stringify(context.customerInfo)}
- Current inquiry: ${JSON.stringify(context.inquiryDetails)}

ANALYZE FOR:

1. FAILED CALL SCENARIOS (without keyword matching):
   - Did customer attempt to contact but failed?
   - Signs of communication frustration?
   - Implicit mentions of unreachable service?
   - Expectations of callback/follow-up?

2. TASK MANAGEMENT NEEDS:
   - Does customer want to create/edit/update a service request?
   - Are they checking status of existing request?
   - Do they need task-related assistance?

3. CUSTOMER STATE ANALYSIS:
   - Urgency level (low/medium/high/critical)
   - Frustration level (0-10)
   - Service expectations
   - Hidden/implicit needs

4. RESPONSE STRATEGY:
   - Best approach (empathetic/solution-focused/escalation/information-gathering)
   - Suggested immediate action

Respond in this EXACT JSON format:
{
  "isFailedCallScenario": boolean,
  "failedCallConfidence": number (0-100),
  "failedCallReason": "explanation",
  "needsTaskManagement": boolean,
  "taskType": "create|edit|update|status_check|null",
  "taskConfidence": number (0-100),
  "primaryIntent": "main intent",
  "secondaryIntents": ["intent1", "intent2"],
  "urgencyLevel": "low|medium|high|critical",
  "customerFrustration": number (0-10),
  "serviceExpectation": "what customer expects",
  "implicitNeeds": ["need1", "need2"],
  "suggestedAction": "recommended action",
  "responseStrategy": "empathetic|solution-focused|escalation|information-gathering"
}

IMPORTANT: 
- Look for IMPLICIT signs, not just direct statements
- Consider cultural context (Kerala customer communication style)
- Detect frustration even when politely expressed
- Identify task management needs even without explicit requests
- Be sensitive to urgency indicators beyond obvious keywords
`;
  }

  /**
   * Parse AI response into structured result
   */
  private static parseAnalysisResponse(responseText: string): IntelligentAnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        isFailedCallScenario: parsed.isFailedCallScenario || false,
        failedCallConfidence: Math.min(100, Math.max(0, parsed.failedCallConfidence || 0)),
        failedCallReason: parsed.failedCallReason || 'No specific reason identified',
        needsTaskManagement: parsed.needsTaskManagement || false,
        taskType: parsed.taskType || null,
        taskConfidence: Math.min(100, Math.max(0, parsed.taskConfidence || 0)),
        primaryIntent: parsed.primaryIntent || 'general_inquiry',
        secondaryIntents: Array.isArray(parsed.secondaryIntents) ? parsed.secondaryIntents : [],
        urgencyLevel: ['low', 'medium', 'high', 'critical'].includes(parsed.urgencyLevel) 
          ? parsed.urgencyLevel : 'medium',
        customerFrustration: Math.min(10, Math.max(0, parsed.customerFrustration || 0)),
        serviceExpectation: parsed.serviceExpectation || 'Standard service response',
        implicitNeeds: Array.isArray(parsed.implicitNeeds) ? parsed.implicitNeeds : [],
        suggestedAction: parsed.suggestedAction || 'Provide general assistance',
        responseStrategy: ['empathetic', 'solution-focused', 'escalation', 'information-gathering']
          .includes(parsed.responseStrategy) ? parsed.responseStrategy : 'solution-focused'
      };
      
    } catch (error) {
      console.error('❌ Failed to parse AI analysis response:', error);
      return this.getFallbackAnalysis(responseText);
    }
  }

  /**
   * Fallback analysis when AI fails
   */
  private static getFallbackAnalysis(message: string): IntelligentAnalysisResult {
    const lowerMessage = message.toLowerCase();
    
    // Basic pattern matching as fallback
    const failedCallPatterns = [
      'tried calling', 'couldnt reach', 'no answer', 'voicemail', 'busy', 
      'not reachable', 'didnt pick up', 'phone', 'call'
    ];
    
    const taskPatterns = [
      'create', 'add', 'new', 'edit', 'update', 'change', 'modify', 
      'status', 'check', 'progress', 'cancel', 'delete'
    ];
    
    const urgencyPatterns = {
      critical: ['emergency', 'urgent', 'asap', 'immediately', 'broken down'],
      high: ['soon', 'quickly', 'today', 'not working'],
      low: ['when convenient', 'no rush', 'whenever']
    };
    
    const isFailedCall = failedCallPatterns.some(pattern => lowerMessage.includes(pattern));
    const needsTask = taskPatterns.some(pattern => lowerMessage.includes(pattern));
    
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    for (const [level, patterns] of Object.entries(urgencyPatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        urgency = level as any;
        break;
      }
    }

    return {
      isFailedCallScenario: isFailedCall,
      failedCallConfidence: isFailedCall ? 70 : 10,
      failedCallReason: isFailedCall ? 'Pattern-based detection' : 'No patterns detected',
      needsTaskManagement: needsTask,
      taskType: needsTask ? 'create' : null,
      taskConfidence: needsTask ? 60 : 10,
      primaryIntent: isFailedCall ? 'failed_call_callback' : 'general_inquiry',
      secondaryIntents: [],
      urgencyLevel: urgency,
      customerFrustration: isFailedCall ? 6 : 2,
      serviceExpectation: 'Quick response and resolution',
      implicitNeeds: isFailedCall ? ['callback', 'communication'] : [],
      suggestedAction: isFailedCall ? 'Initiate callback process' : 'Provide general assistance',
      responseStrategy: isFailedCall ? 'empathetic' : 'solution-focused'
    };
  }

  /**
   * Detect task management intents specifically
   */
  static async detectTaskManagementIntent(
    message: string,
    context: ConversationContextData
  ): Promise<TaskManagementIntent> {
    try {
      const taskPrompt = `
Analyze this message for task management intentions in a customer service context:

MESSAGE: "${message}"
CONTEXT: Customer service for AC/refrigerator repair company

Determine if the customer wants to:
1. CREATE a new service request/task
2. EDIT/UPDATE an existing request
3. CHECK STATUS of a request
4. DELETE/CANCEL a request
5. LIST their requests

Extract any task details mentioned (name, phone, description, priority, etc.)

Respond in JSON format:
{
  "action": "create|edit|update|delete|status|list|none",
  "confidence": number (0-100),
  "taskDetails": {
    "customerName": "if mentioned",
    "phoneNumber": "if mentioned", 
    "description": "if mentioned",
    "priority": "high|medium|low if indicated",
    "status": "if mentioned",
    "location": "if mentioned"
  },
  "reasoning": "explanation of decision"
}
`;

      const response = await this.geminiClient.generateResponse(
        taskPrompt,
        [],
        { ...context, skipBusinessLogic: true }
      );

      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action === 'none' ? null : parsed.action,
          confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
          taskDetails: parsed.taskDetails || {},
          reasoning: parsed.reasoning || 'AI analysis completed'
        };
      }
      
      throw new Error('No valid JSON response');
      
    } catch (error) {
      console.error('❌ Task management intent detection failed:', error);
      return {
        action: null,
        confidence: 0,
        reasoning: 'Analysis failed, using fallback'
      };
    }
  }

  /**
   * Generate contextual response based on analysis
   */
  static generateContextualResponse(
    analysis: IntelligentAnalysisResult,
    customerName?: string
  ): { text: string; quickReplies?: any[] } {
    const name = customerName || 'there';
    
    if (analysis.isFailedCallScenario && analysis.failedCallConfidence > 60) {
      return {
        text: this.generateFailedCallResponse(analysis, name),
        quickReplies: [
          { text: "📞 Call Now", action: "tel:+918547229991" },
          { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
          { text: "Schedule Callback", value: "schedule_callback" }
        ]
      };
    }
    
    if (analysis.needsTaskManagement && analysis.taskConfidence > 50) {
      return {
        text: this.generateTaskManagementResponse(analysis, name),
        quickReplies: [
          { text: "Create Request", value: "create_task" },
          { text: "Check Status", value: "check_status" },
          { text: "Call Support", action: "tel:+918547229991" }
        ]
      };
    }
    
    // Default contextual response
    return {
      text: `I understand, ${name}. ${this.getStrategyBasedResponse(analysis)}`,
      quickReplies: [
        { text: "📞 Call Us", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
      ]
    };
  }

  private static generateFailedCallResponse(analysis: IntelligentAnalysisResult, name: string): string {
    const frustrationLevel = analysis.customerFrustration;
    
    if (frustrationLevel >= 7) {
      return `I sincerely apologize for the inconvenience, ${name}. I can see you've been trying to reach us and that's frustrating. Let me make sure you get the immediate attention you deserve. I'm arranging for someone to call you back right away.`;
    } else if (frustrationLevel >= 4) {
      return `Thank you for reaching out, ${name}. I understand you tried calling us earlier. Let me help you get connected with our team right away so we can address your needs promptly.`;
    } else {
      return `Hi ${name}! I see you may have tried reaching us. No worries at all - I'm here to help you get the assistance you need. Let me connect you with our service team.`;
    }
  }

  private static generateTaskManagementResponse(analysis: IntelligentAnalysisResult, name: string): string {
    switch (analysis.taskType) {
      case 'create':
        return `I'd be happy to help you create a new service request, ${name}. Let me gather the necessary details to get this set up for you right away.`;
      case 'edit':
      case 'update':
        return `I can help you update your existing request, ${name}. Let me find your current details and make those changes for you.`;
      case 'status_check':
        return `Let me check the status of your request for you, ${name}. I'll get you an immediate update on where things stand.`;
      default:
        return `I'm here to help you with your service request, ${name}. What would you like me to assist you with today?`;
    }
  }

  private static getStrategyBasedResponse(analysis: IntelligentAnalysisResult): string {
    switch (analysis.responseStrategy) {
      case 'empathetic':
        return `I can understand your situation and I want to make sure we address your concerns properly.`;
      case 'escalation':
        return `This seems like something our senior team should handle directly. Let me connect you with them right away.`;
      case 'information-gathering':
        return `To help you in the best way possible, I'd like to gather a few more details about your specific needs.`;
      case 'solution-focused':
      default:
        return `Let me help you find the best solution for your AC or refrigerator service needs.`;
    }
  }
}