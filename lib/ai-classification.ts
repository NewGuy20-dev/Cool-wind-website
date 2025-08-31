import { GoogleGenerativeAI } from '@google/generative-ai'

interface TaskClassificationResult {
  isFailedCall: boolean
  isServiceRequest: boolean
  confidence: number
  reasoning: string
  suggestedCategory: 'failed_call' | 'service_request' | 'mixed' | 'unclear'
  extractedInfo: {
    serviceType?: string
    urgencyLevel?: 'low' | 'medium' | 'high'
    customerSentiment?: 'positive' | 'neutral' | 'negative'
    requiresImmediate?: boolean
  }
}

export class AITaskClassifier {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for AI classification')
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async classifyTask(taskDescription: string, customerInfo?: {
    name?: string
    phone?: string
    previousInteractions?: number
  }): Promise<TaskClassificationResult> {
    try {
      const prompt = this.buildClassificationPrompt(taskDescription, customerInfo)
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseAIResponse(text)
    } catch (error) {
      console.error('AI Classification error:', error)
      // Fallback to rule-based classification
      return this.fallbackClassification(taskDescription)
    }
  }

  private buildClassificationPrompt(taskDescription: string, customerInfo?: any): string {
    return `
You are an AI assistant for Cool Wind Services, an AC and refrigerator repair company in Kerala, India. 
Analyze the following task/interaction and classify it as either a "failed call" or a "service request" or both.

CONTEXT:
- Cool Wind Services provides AC repair, refrigerator repair, spare parts supply, and electronics sales
- Failed calls are when customers couldn't reach the business or had communication issues
- Service requests are when customers need actual repair/service work

TASK DESCRIPTION: "${taskDescription}"

${customerInfo ? `CUSTOMER INFO:
- Name: ${customerInfo.name || 'Not provided'}
- Phone: ${customerInfo.phone || 'Not provided'}
- Previous interactions: ${customerInfo.previousInteractions || 0}` : ''}

Please analyze and respond with ONLY a valid JSON object in this exact format:
{
  "isFailedCall": boolean,
  "isServiceRequest": boolean,
  "confidence": number (0-100),
  "reasoning": "brief explanation",
  "suggestedCategory": "failed_call" | "service_request" | "mixed" | "unclear",
  "extractedInfo": {
    "serviceType": "ac_repair" | "refrigerator_repair" | "spare_parts" | "electronics" | "other" | null,
    "urgencyLevel": "low" | "medium" | "high",
    "customerSentiment": "positive" | "neutral" | "negative",
    "requiresImmediate": boolean
  }
}

CLASSIFICATION RULES:
- If mentions "couldn't reach", "no answer", "line busy", "callback" → likely failed call
- If mentions specific appliance issues, repair needs, service booking → likely service request
- If mentions both communication issues AND service needs → mark both as true
- Urgency indicators: "emergency", "urgent", "ASAP", "immediately", "not working" → high urgency
- Sentiment: positive (polite, patient), neutral (matter-of-fact), negative (frustrated, angry)
`
  }

  private parseAIResponse(responseText: string): TaskClassificationResult {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and sanitize the response
      return {
        isFailedCall: Boolean(parsed.isFailedCall),
        isServiceRequest: Boolean(parsed.isServiceRequest),
        confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 50)),
        reasoning: String(parsed.reasoning || 'AI classification completed'),
        suggestedCategory: this.validateCategory(parsed.suggestedCategory),
        extractedInfo: {
          serviceType: this.validateServiceType(parsed.extractedInfo?.serviceType),
          urgencyLevel: this.validateUrgencyLevel(parsed.extractedInfo?.urgencyLevel),
          customerSentiment: this.validateSentiment(parsed.extractedInfo?.customerSentiment),
          requiresImmediate: Boolean(parsed.extractedInfo?.requiresImmediate)
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return this.fallbackClassification(responseText)
    }
  }

  private fallbackClassification(taskDescription: string): TaskClassificationResult {
    const text = taskDescription.toLowerCase()
    
    // Rule-based fallback classification
    const failedCallKeywords = [
      'couldn\'t reach', 'no answer', 'line busy', 'callback', 'missed call',
      'not answering', 'unreachable', 'call failed', 'busy tone'
    ]
    
    const serviceRequestKeywords = [
      'repair', 'fix', 'service', 'maintenance', 'not working', 'broken',
      'issue', 'problem', 'cooling', 'heating', 'leak', 'noise', 'parts'
    ]
    
    const urgencyKeywords = [
      'emergency', 'urgent', 'asap', 'immediately', 'critical', 'stopped working'
    ]
    
    const isFailedCall = failedCallKeywords.some(keyword => text.includes(keyword))
    const isServiceRequest = serviceRequestKeywords.some(keyword => text.includes(keyword))
    const isUrgent = urgencyKeywords.some(keyword => text.includes(keyword))
    
    let category: 'failed_call' | 'service_request' | 'mixed' | 'unclear' = 'unclear'
    if (isFailedCall && isServiceRequest) category = 'mixed'
    else if (isFailedCall) category = 'failed_call'
    else if (isServiceRequest) category = 'service_request'
    
    return {
      isFailedCall,
      isServiceRequest,
      confidence: 60, // Lower confidence for rule-based
      reasoning: 'Classified using rule-based fallback system',
      suggestedCategory: category,
      extractedInfo: {
        serviceType: this.detectServiceType(text),
        urgencyLevel: isUrgent ? 'high' : 'medium',
        customerSentiment: 'neutral',
        requiresImmediate: isUrgent
      }
    }
  }

  private detectServiceType(text: string): string | undefined {
    if (text.includes('ac') || text.includes('air condition')) return 'ac_repair'
    if (text.includes('fridge') || text.includes('refrigerator')) return 'refrigerator_repair'
    if (text.includes('parts') || text.includes('spare')) return 'spare_parts'
    if (text.includes('electronics') || text.includes('appliance')) return 'electronics'
    return undefined
  }

  private validateCategory(category: any): 'failed_call' | 'service_request' | 'mixed' | 'unclear' {
    const validCategories = ['failed_call', 'service_request', 'mixed', 'unclear']
    return validCategories.includes(category) ? category : 'unclear'
  }

  private validateServiceType(serviceType: any): string | undefined {
    const validTypes = ['ac_repair', 'refrigerator_repair', 'spare_parts', 'electronics', 'other']
    return validTypes.includes(serviceType) ? serviceType : undefined
  }

  private validateUrgencyLevel(level: any): 'low' | 'medium' | 'high' {
    const validLevels = ['low', 'medium', 'high']
    return validLevels.includes(level) ? level : 'medium'
  }

  private validateSentiment(sentiment: any): 'positive' | 'neutral' | 'negative' {
    const validSentiments = ['positive', 'neutral', 'negative']
    return validSentiments.includes(sentiment) ? sentiment : 'neutral'
  }
}

// Export singleton instance
export const aiClassifier = new AITaskClassifier()
