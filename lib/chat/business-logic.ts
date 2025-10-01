import { ChatResponse, ConversationContextData, QuickReply, ChatAction } from '@/lib/types/chat';

export class BusinessLogicProcessor {
  private static readonly BUSINESS_INFO = {
    name: "Cool Wind Services",
    phone: "+91 85472 29991",
    whatsapp: "918547229991", 
    email: "info@coolwindservices.com",
    location: "Thiruvalla, Pathanamthitta, Kerala, India",
    serviceAreas: ["Thiruvalla", "Pathanamthitta"],
    workingHours: "Mon-Sat 10:00 AM - 6:00 PM",
    emergencyService: "24/7 Emergency Service Available"
  };

  private static readonly PARTS_CATALOG = {
    ac_parts: [
      "Compressors", "Thermostats", "Capacitors", "Control Boards",
      "Evaporator Coils", "Condenser Coils", "Fans & Motors", 
      "Filters", "Remote Controls", "Gas Valves"
    ],
    fridge_parts: [
      "Compressors", "Thermostats", "Door Seals", "Defrost Timers",
      "Evaporator Fans", "Control Boards", "Water Filters",
      "Ice Makers", "Shelves & Drawers", "Lights"
    ],
    brands: [
      "Samsung", "LG", "Whirlpool", "Voltas", "Blue Star", 
      "Godrej", "Haier", "Carrier", "Daikin", "Panasonic"
    ]
  };

  private static readonly SERVICE_TYPES = {
    emergency: {
      description: "24/7 Emergency Repair Service",
      response_time: "Within 2-4 hours",
      coverage: "Thiruvalla and Pathanamthitta"
    },
    regular: {
      description: "Scheduled Service and Maintenance",
      response_time: "Same day or next working day",
      warranty: "6 months warranty on repairs"
    },
    installation: {
      description: "Professional Installation Service",
      includes: "Setup, testing, and demo",
      warranty: "1 year installation warranty"
    }
  };

  static enhanceResponse(geminiResponse: string, context: ConversationContextData): ChatResponse {
    let enhancedResponse = geminiResponse;
    let quickReplies: QuickReply[] = [];
    let actions: ChatAction[] = [];

    // Enhance based on intent
    const intent = context.currentIntent;

    switch (intent) {
      case 'SPARE_PARTS_INQUIRY':
        return this.enhancePartsInquiry(enhancedResponse, context);
      
      case 'SERVICE_REQUEST':
        return this.enhanceServiceRequest(enhancedResponse, context);
      
      case 'EMERGENCY':
        return this.enhanceEmergencyRequest(enhancedResponse, context);
      
      case 'SALES_INQUIRY':
        return this.enhanceSalesInquiry(enhancedResponse, context);
      
      case 'BUSINESS_INFO':
        return this.enhanceBusinessInfo(enhancedResponse, context);
      
      default:
        return this.enhanceGeneral(enhancedResponse, context);
    }
  }

  private static enhancePartsInquiry(response: string, context: ConversationContextData): ChatResponse {
    let enhancedResponse = response;
    let quickReplies: QuickReply[] = [];

    // Add contact info if not present
    if (!response.includes(this.BUSINESS_INFO.phone)) {
      enhancedResponse += `\n\n📞 For immediate parts availability: ${this.BUSINESS_INFO.phone}`;
    }

    // Add part catalog quick replies
    const applianceType = context.inquiryDetails.appliance_type;
    if (applianceType === 'ac' || applianceType === 'air conditioner') {
      quickReplies = [
        { text: "Compressor Parts", value: "ac_compressor" },
        { text: "Control Boards", value: "ac_control_board" },
        { text: "Coils & Fans", value: "ac_coils_fans" },
        { text: "Call for Parts", action: "tel:+918547229991" }
      ];
    } else if (applianceType === 'refrigerator' || applianceType === 'fridge') {
      quickReplies = [
        { text: "Compressor Parts", value: "fridge_compressor" },
        { text: "Door Seals", value: "fridge_door_seals" },
        { text: "Thermostat", value: "fridge_thermostat" },
        { text: "Call for Parts", action: "tel:+918547229991" }
      ];
    } else {
      quickReplies = [
        { text: "AC Parts", value: "ac_parts" },
        { text: "Fridge Parts", value: "fridge_parts" },
        { text: "Send Part Photo", value: "photo_upload" },
        { text: "Call Now", action: "tel:+918547229991" }
      ];
    }

    // Add same-day delivery info for Thiruvalla
    const location = context.customerInfo?.location;
    if (location && location.toLowerCase().includes('thiruvalla')) {
      enhancedResponse += "\n\n🚚 Same-day delivery available in Thiruvalla!";
    }

    return {
      text: enhancedResponse,
      quickReplies,
      metadata: {
        confidence: 0.9,
        category: 'spare_parts_inquiry',
        businessRelevance: 1.0
      }
    };
  }

  private static enhanceServiceRequest(response: string, context: ConversationContextData): ChatResponse {
    let enhancedResponse = response;
    let quickReplies: QuickReply[] = [];
    const actions: ChatAction[] = [];

    // Check for urgency
    const isUrgent = context.inquiryDetails.urgency === 'high' || 
                    this.hasUrgentKeywords(context.previousMessages[context.previousMessages.length - 1]?.text);

    if (isUrgent) {
      enhancedResponse = `🚨 **Emergency Service Available**\n\n${enhancedResponse}`;
      quickReplies = [
        { text: "📞 Call Emergency Line", action: "tel:+918547229991" },
        { text: "💬 WhatsApp Now", action: "https://wa.me/918547229991?text=Emergency%20repair%20needed" },
        { text: "Service Areas", value: "service_areas" }
      ];
      
      actions.push({
        type: 'priority_escalation',
        data: { urgency: 'high', reason: 'emergency_repair' }
      });
    } else {
      // Regular service request
      if (!response.includes(this.BUSINESS_INFO.phone)) {
        enhancedResponse += `\n\n📅 Schedule your service: ${this.BUSINESS_INFO.phone}`;
      }

      quickReplies = [
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
        { text: "Service Areas", value: "service_areas" },
        { text: "Warranty Info", value: "warranty_info" }
      ];
    }

    return {
      text: enhancedResponse,
      quickReplies,
      actions,
      metadata: {
        confidence: 0.9,
        category: 'service_request',
        businessRelevance: 1.0
      }
    };
  }

  private static enhanceEmergencyRequest(response: string, context: ConversationContextData): ChatResponse {
    const enhancedResponse = `🚨 **EMERGENCY SERVICE ALERT**\n\n${response}\n\n⚡ Available 24/7 in ${this.BUSINESS_INFO.serviceAreas.join(' & ')}\n📞 Call immediately: ${this.BUSINESS_INFO.phone}`;

    const quickReplies: QuickReply[] = [
      { text: "🚨 Call Emergency", action: "tel:+918547229991" },
      { text: "💬 WhatsApp Emergency", action: "https://wa.me/918547229991?text=EMERGENCY%20-%20" }
    ];

    const actions: ChatAction[] = [
      {
        type: 'priority_escalation',
        data: { urgency: 'critical', reason: 'emergency_request' }
      }
    ];

    return {
      text: enhancedResponse,
      quickReplies,
      actions,
      metadata: {
        confidence: 1.0,
        category: 'emergency',
        businessRelevance: 1.0
      }
    };
  }

  private static enhanceSalesInquiry(response: string, context: ConversationContextData): ChatResponse {
    let enhancedResponse = response;

    // Add contact for sales inquiries
    if (!response.includes(this.BUSINESS_INFO.phone)) {
      enhancedResponse += `\n\n💰 For best prices and availability: ${this.BUSINESS_INFO.phone}`;
    }

    const quickReplies: QuickReply[] = [
      { text: "New Appliances", value: "new_appliances" },
      { text: "Refurbished Units", value: "refurbished" },
      { text: "Price Inquiry", action: "tel:+918547229991" },
      { text: "WhatsApp Catalog", action: "https://wa.me/918547229991?text=Send%20me%20your%20catalog" }
    ];

    return {
      text: enhancedResponse,
      quickReplies,
      metadata: {
        confidence: 0.85,
        category: 'sales_inquiry',
        businessRelevance: 0.8
      }
    };
  }

  private static enhanceBusinessInfo(response: string, context: ConversationContextData): ChatResponse {
    let enhancedResponse = response;

    // Ensure all business info is included
    const businessDetails = `
📍 Location: ${this.BUSINESS_INFO.location}
📞 Phone: ${this.BUSINESS_INFO.phone}
💬 WhatsApp: ${this.BUSINESS_INFO.phone}
📧 Email: ${this.BUSINESS_INFO.email}
🕒 Hours: ${this.BUSINESS_INFO.workingHours}
🚨 ${this.BUSINESS_INFO.emergencyService}
🗺️ Service Areas: ${this.BUSINESS_INFO.serviceAreas.join(', ')}`;

    if (!response.includes(this.BUSINESS_INFO.phone)) {
      enhancedResponse += `\n\n${businessDetails}`;
    }

    const quickReplies: QuickReply[] = [
      { text: "📞 Call Now", action: "tel:+918547229991" },
      { text: "💬 WhatsApp", action: "https://wa.me/918547229991" },
      { text: "📍 Get Directions", action: "https://maps.google.com/?q=Cool+Wind+Services+Thiruvalla" },
      { text: "Our Services", value: "our_services" }
    ];

    return {
      text: enhancedResponse,
      quickReplies,
      metadata: {
        confidence: 1.0,
        category: 'business_info',
        businessRelevance: 1.0
      }
    };
  }

  private static enhanceGeneral(response: string, context: ConversationContextData): ChatResponse {
    let enhancedResponse = response;

    // Add general contact info if not present
    if (!response.includes(this.BUSINESS_INFO.phone) && response.length < 200) {
      enhancedResponse += `\n\nℹ️ Need more help? Call us at ${this.BUSINESS_INFO.phone}`;
    }

    const quickReplies: QuickReply[] = [
      { text: "🔧 Repair Service", value: "repair_service" },
      { text: "📦 Spare Parts", value: "spare_parts" },
      { text: "📞 Contact Info", value: "business_info" },
      { text: "Emergency Help", value: "emergency" }
    ];

    return {
      text: enhancedResponse,
      quickReplies,
      metadata: {
        confidence: 0.7,
        category: 'general',
        businessRelevance: 0.6
      }
    };
  }

  private static hasUrgentKeywords(message?: string): boolean {
    if (!message) {
      return false;
    }

    const normalized = message.toLowerCase();
    const urgentKeywords = [
      'emergency',
      'urgent',
      'asap',
      'immediately',
      'right away',
      'leak',
      'not cooling',
      'no cooling',
      'not working',
      'stopped working',
      'breakdown',
      'broken',
      'critical'
    ];

    return urgentKeywords.some(keyword => normalized.includes(keyword));
  }

  static calculateBusinessRelevance(response: string): number {
    const businessKeywords = [
      'cool wind', 'thiruvalla', 'pathanamthitta', 'spare parts', 
      'repair', 'service', 'ac', 'refrigerator', 'compressor',
      'emergency', 'installation', 'warranty'
    ];
    
    const lowerResponse = response.toLowerCase();
    const matches = businessKeywords.filter(keyword => 
      lowerResponse.includes(keyword)
    ).length;
    
    return Math.min(matches / businessKeywords.length, 1);
  }

  static getPartsCatalog(category?: string): string[] {
    if (!category) {
      return [...this.PARTS_CATALOG.ac_parts, ...this.PARTS_CATALOG.fridge_parts];
    }
    
    return this.PARTS_CATALOG[category as keyof typeof this.PARTS_CATALOG] || [];
  }

  static getServiceInfo(serviceType?: string) {
    if (!serviceType) {
      return this.SERVICE_TYPES;
    }
    
    return this.SERVICE_TYPES[serviceType as keyof typeof this.SERVICE_TYPES];
  }

  static getBusinessInfo() {
    return this.BUSINESS_INFO;
  }
}