import { ConversationContextData, ChatMessage, CustomerInfo, Intent } from '@/lib/types/chat';

export class ConversationContext {
  private context: ConversationContextData;

  constructor() {
    this.context = {
      customerInfo: {},
      currentIntent: '',
      inquiryDetails: {},
      conversationStage: 'greeting',
      previousMessages: []
    };
  }

  updateContext(key: keyof ConversationContextData, value: any) {
    if (typeof value === 'object' && value !== null && this.context[key] && typeof this.context[key] === 'object') {
      this.context = {
        ...this.context,
        [key]: { ...this.context[key] as any, ...value }
      };
    } else {
      this.context = {
        ...this.context,
        [key]: value
      };
    }
  }

  getContext(): ConversationContextData {
    return { ...this.context };
  }

  addMessage(message: ChatMessage) {
    this.context.previousMessages = [...this.context.previousMessages, message];
    
    // Keep only last 10 messages for performance
    if (this.context.previousMessages.length > 10) {
      this.context.previousMessages = this.context.previousMessages.slice(-10);
    }
  }

  shouldEscalate(): boolean {
    const escalationTriggers = [
      this.context.conversationStage === 'escalation',
      this.hasComplexTechnicalQuery(),
      this.hasCustomerComplaint(),
      this.hasExplicitHumanRequest(),
      this.hasRepeatedUnansweredQuestions()
    ];
    
    return escalationTriggers.some(trigger => trigger);
  }

  private hasComplexTechnicalQuery(): boolean {
    const complexKeywords = ['installation', 'warranty claim', 'bulk order', 'commercial', 'dispute'];
    const lastMessage = this.getLastUserMessage();
    
    if (!lastMessage) return false;
    
    return complexKeywords.some(keyword => 
      lastMessage.text.toLowerCase().includes(keyword)
    );
  }

  private hasCustomerComplaint(): boolean {
    const complaintKeywords = ['complaint', 'dissatisfied', 'unhappy', 'poor service', 'bad experience', 'unsatisfactory'];
    const lastMessage = this.getLastUserMessage();
    
    if (!lastMessage) return false;
    
    return complaintKeywords.some(keyword => 
      lastMessage.text.toLowerCase().includes(keyword)
    );
  }

  private hasExplicitHumanRequest(): boolean {
    const humanRequestKeywords = ['speak to human', 'talk to person', 'human agent', 'real person', 'human representative'];
    const lastMessage = this.getLastUserMessage();
    
    if (!lastMessage) return false;
    
    return humanRequestKeywords.some(keyword => 
      lastMessage.text.toLowerCase().includes(keyword)
    );
  }

  private hasRepeatedUnansweredQuestions(): boolean {
    // Only escalate if conversation is very long (12+ messages) and seems stuck
    return this.context.previousMessages.length > 12 && 
           this.context.conversationStage !== 'resolution';
  }

  private getLastUserMessage(): ChatMessage | null {
    const userMessages = this.context.previousMessages.filter(msg => msg.sender === 'user');
    return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
  }

  recognizeIntent(message: string): Intent {
    const lowerMessage = message.toLowerCase();
    
    // Intent patterns for Cool Wind Services
    const intentPatterns = {
      SPARE_PARTS_INQUIRY: {
        keywords: ['part', 'parts', 'spare', 'component', 'compressor', 'thermostat', 'filter', 'coil', 'capacitor'],
        patterns: [
          /spare.*part/i,
          /.*part.*need/i,
          /.*part.*buy/i,
          /.*part.*order/i,
          /.*part.*available/i,
          /.*part.*price/i
        ],
        weight: 3
      },
      
      SERVICE_REQUEST: {
        keywords: ['repair', 'fix', 'service', 'not working', 'broken', 'maintenance', 'problem', 'issue', 'stopped working'],
        patterns: [
          /.*not cooling/i,
          /.*making noise/i,
          /need repair/i,
          /.*not working/i,
          /service.*required/i,
          /.*stopped working/i,
          /.*problem.*with/i,
          /needs.*fixing/i
        ],
        weight: 3
      },
      
      SALES_INQUIRY: {
        keywords: ['buy', 'purchase', 'price', 'cost', 'new', 'second hand', 'refurbished'],
        patterns: [
          /want to buy/i,
          /how much/i,
          /price of/i,
          /available.*ac/i,
          /available.*refrigerator/i
        ],
        weight: 2
      },
      
      BUSINESS_INFO: {
        keywords: ['location', 'address', 'hours', 'contact', 'phone', 'whatsapp', 'where'],
        patterns: [
          /where are you/i,
          /contact details/i,
          /phone number/i,
          /your location/i,
          /business hours/i
        ],
        weight: 1
      },
      
      EMERGENCY: {
        keywords: ['emergency', 'urgent', 'immediately', 'asap', 'critical', 'urgent repair'],
        patterns: [
          /emergency.*repair/i,
          /urgent.*repair/i,
          /immediately.*need/i,
          /as soon as possible/i,
          /critical.*repair/i,
          /emergency.*service/i
        ],
        weight: 4
      }
    };

    let bestIntent = { name: 'GENERAL', confidence: 0, entities: {} };
    
    for (const [intentName, config] of Object.entries(intentPatterns)) {
      let score = 0;
      const entities: Record<string, string> = {};
      
      // Check keywords
      const keywordMatches = config.keywords.filter(keyword => 
        lowerMessage.includes(keyword)
      ).length;
      score += keywordMatches * 0.5;
      
      // Check patterns
      const patternMatches = config.patterns.filter(pattern => 
        pattern.test(message)
      ).length;
      score += patternMatches * 1.0;
      
      // Apply weight
      score *= config.weight;
      
      // Extract entities (basic implementation)
      this.extractEntities(message, entities);
      
      // Calculate final confidence
      const confidence = Math.min(score / 5, 1); // Normalize to 0-1
      
      if (confidence > bestIntent.confidence) {
        bestIntent = { name: intentName, confidence, entities };
      }
    }
    
    // Update context with recognized intent
    this.updateContext('currentIntent', bestIntent.name);
    this.updateContext('inquiryDetails', bestIntent.entities);
    
    return bestIntent;
  }

  private extractEntities(message: string, entities: Record<string, string>) {
    const lowerMessage = message.toLowerCase();
    
    // Extract appliance types
    const applianceTypes = ['ac', 'air conditioner', 'refrigerator', 'fridge', 'freezer'];
    for (const appliance of applianceTypes) {
      if (lowerMessage.includes(appliance)) {
        entities.appliance_type = appliance;
        break;
      }
    }
    
    // Extract brands
    const brands = ['samsung', 'lg', 'whirlpool', 'voltas', 'blue star', 'godrej', 'haier'];
    for (const brand of brands) {
      if (lowerMessage.includes(brand)) {
        entities.brand = brand;
        break;
      }
    }
    
    // Extract urgency
    const urgencyKeywords = ['emergency', 'urgent', 'immediately', 'asap'];
    for (const urgency of urgencyKeywords) {
      if (lowerMessage.includes(urgency)) {
        entities.urgency = 'high';
        break;
      }
    }
    
    // Extract location references
    const locations = ['thiruvalla', 'pathanamthitta', 'kerala'];
    for (const location of locations) {
      if (lowerMessage.includes(location)) {
        entities.location = location;
        break;
      }
    }
  }

  updateConversationStage(userMessage: string, botResponse: string) {
    const intent = this.context.currentIntent;
    const currentStage = this.context.conversationStage;
    
    // Stage progression logic
    if (currentStage === 'greeting') {
      if (intent && intent !== 'GENERAL') {
        this.updateContext('conversationStage', 'inquiry');
      }
    } else if (currentStage === 'inquiry') {
      if (this.hasSpecificDetails()) {
        this.updateContext('conversationStage', 'details');
      }
    } else if (currentStage === 'details') {
      if (this.isReadyForResolution()) {
        this.updateContext('conversationStage', 'resolution');
      }
    }
    
    // Check for escalation triggers
    if (this.shouldEscalate()) {
      this.updateContext('conversationStage', 'escalation');
    }
  }

  private hasSpecificDetails(): boolean {
    const details = this.context.inquiryDetails;
    return Object.keys(details).length > 2; // Has multiple entity types
  }

  private isReadyForResolution(): boolean {
    const intent = this.context.currentIntent;
    
    // Different resolution criteria for different intents
    switch (intent) {
      case 'BUSINESS_INFO':
        return true; // Can be resolved immediately
        
      case 'SERVICE_REQUEST':
      case 'SPARE_PARTS_INQUIRY':
        return this.hasSpecificDetails();
        
      default:
        return false;
    }
  }

  reset() {
    this.context = {
      customerInfo: {},
      currentIntent: '',
      inquiryDetails: {},
      conversationStage: 'greeting',
      previousMessages: []
    };
  }
}