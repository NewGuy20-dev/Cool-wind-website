import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI using the same API key as the chat system
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface PriorityAnalysisResult {
  priority: 1 | 2 | 3; // 1 = high, 2 = medium, 3 = low
  reasoning: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  estimatedResponseTime: string;
  tags: string[];
}

export class AIPriorityAnalyzer {
  private model: any;
  
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent priority analysis
        topK: 10,
        topP: 0.8,
        maxOutputTokens: 500,
      },
    });
  }

  /**
   * Analyzes customer problem and assigns priority using AI
   */
  async analyzePriority(
    problemDescription: string,
    conversationContext?: string,
    customerInfo?: {
      name?: string;
      isReturningCustomer?: boolean;
      previousIssues?: string[];
    }
  ): Promise<PriorityAnalysisResult> {
    try {
      const prompt = this.buildPriorityAnalysisPrompt(
        problemDescription,
        conversationContext,
        customerInfo
      );

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parsePriorityResponse(response);
    } catch (error) {
      console.error('Error analyzing priority with AI:', error);
      // Fallback to keyword-based analysis
      return this.fallbackPriorityAnalysis(problemDescription);
    }
  }

  private buildPriorityAnalysisPrompt(
    problemDescription: string,
    conversationContext?: string,
    customerInfo?: any
  ): string {
    return `You are an expert customer service priority analyzer for Cool Wind Services, a leading AC and refrigerator service company in Kerala, India.

TASK: Analyze the customer's problem and assign a priority level from 1-3:
- Priority 1 (HIGH): Emergency situations requiring immediate response (within 2-4 hours)
- Priority 2 (MEDIUM): Important issues requiring same-day or next-day response (within 24 hours)  
- Priority 3 (LOW): Routine issues that can wait 2-3 business days

PRIORITY 1 (HIGH) INDICATORS:
- Complete breakdown of essential appliances (AC in summer heat, refrigerator food spoilage)
- Safety hazards (electrical issues, gas leaks, overheating)
- Water damage or flooding from appliances
- Customer explicitly states "emergency" or "urgent"
- Business operations affected (commercial customers)
- Extreme weather conditions (AC failure during heat wave)
- Health-related concerns (medicines in fridge, elderly/children affected)

PRIORITY 2 (MEDIUM) INDICATORS:
- Partial functionality loss but appliance still working
- Intermittent problems affecting daily routine
- Service appointments and maintenance
- Parts availability issues
- Customer has backup solutions available
- Non-critical electrical or cooling issues

PRIORITY 3 (LOW) INDICATORS:
- Routine maintenance requests
- Cosmetic issues or minor repairs
- Information inquiries and general questions
- Scheduled service appointments with flexible timing
- Non-urgent parts replacement
- Performance optimization requests

CUSTOMER PROBLEM:
"${problemDescription}"

${conversationContext ? `CONVERSATION CONTEXT:\n"${conversationContext}"\n` : ''}

${customerInfo ? `CUSTOMER INFO:\n${JSON.stringify(customerInfo, null, 2)}\n` : ''}

INSTRUCTIONS:
1. Analyze the problem severity and urgency
2. Consider local context (Kerala climate, typical customer needs)
3. Factor in business impact and customer safety
4. Return ONLY a JSON response in this exact format:

{
  "priority": 1,
  "reasoning": "Brief explanation of why this priority was assigned",
  "urgencyLevel": "high",
  "estimatedResponseTime": "2-4 hours",
  "tags": ["emergency", "ac-failure", "heat-wave"]
}

Ensure your response is valid JSON only, no additional text.`;
  }

  private parsePriorityResponse(response: string): PriorityAnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      const priority = this.validatePriority(parsed.priority);
      const urgencyLevel = this.mapPriorityToUrgency(priority);
      
      return {
        priority,
        reasoning: parsed.reasoning || 'AI analysis completed',
        urgencyLevel,
        estimatedResponseTime: parsed.estimatedResponseTime || this.getDefaultResponseTime(priority),
        tags: Array.isArray(parsed.tags) ? parsed.tags : this.generateDefaultTags(priority)
      };
    } catch (error) {
      console.error('Error parsing AI priority response:', error);
      // Return default medium priority
      return {
        priority: 2,
        reasoning: 'Default priority assigned due to parsing error',
        urgencyLevel: 'medium',
        estimatedResponseTime: '24 hours',
        tags: ['general-inquiry']
      };
    }
  }

  private validatePriority(priority: any): 1 | 2 | 3 {
    if (priority === 1 || priority === 2 || priority === 3) {
      return priority;
    }
    
    // If priority is a string, try to convert
    const num = parseInt(priority);
    if (num >= 1 && num <= 3) {
      return num as 1 | 2 | 3;
    }
    
    // Default to medium priority
    return 2;
  }

  private mapPriorityToUrgency(priority: 1 | 2 | 3): 'high' | 'medium' | 'low' {
    switch (priority) {
      case 1: return 'high';
      case 2: return 'medium';
      case 3: return 'low';
      default: return 'medium';
    }
  }

  private getDefaultResponseTime(priority: 1 | 2 | 3): string {
    switch (priority) {
      case 1: return '2-4 hours';
      case 2: return '24 hours';
      case 3: return '2-3 business days';
      default: return '24 hours';
    }
  }

  private generateDefaultTags(priority: 1 | 2 | 3): string[] {
    switch (priority) {
      case 1: return ['urgent', 'emergency'];
      case 2: return ['standard', 'service-request'];
      case 3: return ['routine', 'maintenance'];
      default: return ['general'];
    }
  }

  private fallbackPriorityAnalysis(problemDescription: string): PriorityAnalysisResult {
    const description = problemDescription.toLowerCase();
    
    // High priority keywords
    const highPriorityKeywords = [
      'emergency', 'urgent', 'immediately', 'asap', 'broken', 'not working',
      'no cooling', 'no power', 'sparks', 'smoke', 'burning smell',
      'water leak', 'gas leak', 'overheating', 'fire', 'shock'
    ];
    
    // Low priority keywords  
    const lowPriorityKeywords = [
      'maintenance', 'routine', 'cleaning', 'check', 'inspection',
      'when convenient', 'no rush', 'sometime', 'minor', 'cosmetic'
    ];
    
    // Check for high priority
    if (highPriorityKeywords.some(keyword => description.includes(keyword))) {
      return {
        priority: 1,
        reasoning: 'Keyword-based analysis detected emergency situation',
        urgencyLevel: 'high',
        estimatedResponseTime: '2-4 hours',
        tags: ['urgent', 'emergency']
      };
    }
    
    // Check for low priority
    if (lowPriorityKeywords.some(keyword => description.includes(keyword))) {
      return {
        priority: 3,
        reasoning: 'Keyword-based analysis detected routine request',
        urgencyLevel: 'low',
        estimatedResponseTime: '2-3 business days',
        tags: ['routine', 'maintenance']
      };
    }
    
    // Default to medium priority
    return {
      priority: 2,
      reasoning: 'Default medium priority assigned by fallback analysis',
      urgencyLevel: 'medium',
      estimatedResponseTime: '24 hours',
      tags: ['standard', 'service-request']
    };
  }

  /**
   * Batch analyze multiple problems for efficiency
   */
  async batchAnalyzePriority(
    problems: Array<{
      description: string;
      context?: string;
      customerInfo?: any;
    }>
  ): Promise<PriorityAnalysisResult[]> {
    const promises = problems.map(problem => 
      this.analyzePriority(problem.description, problem.context, problem.customerInfo)
    );
    
    return Promise.all(promises);
  }

  /**
   * Get priority recommendations based on time of day and customer type
   */
  getPriorityAdjustments(
    basePriority: 1 | 2 | 3,
    timeOfDay: Date,
    customerType: 'residential' | 'commercial' = 'residential'
  ): 1 | 2 | 3 {
    const hour = timeOfDay.getHours();
    
    // After hours (10 PM - 6 AM) - decrease priority unless emergency
    if ((hour >= 22 || hour <= 6) && basePriority > 1) {
      return Math.min(basePriority + 1, 3) as 1 | 2 | 3;
    }
    
    // Business hours boost for commercial customers
    if (customerType === 'commercial' && hour >= 9 && hour <= 17 && basePriority > 1) {
      return Math.max(basePriority - 1, 1) as 1 | 2 | 3;
    }
    
    return basePriority;
  }
}

// Export singleton instance
export const aiPriorityAnalyzer = new AIPriorityAnalyzer();