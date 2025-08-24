export interface FailedCallTask {
  id: string;
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'unavailable' | 'scheduled' | 'progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  callbackPreference?: string;
  attemptCount: number;
  notes?: string;
  scheduledCallbackTime?: string;
  // AI-powered fields
  aiPriorityScore?: 1 | 2 | 3; // AI-assigned priority (1=high, 2=medium, 3=low)
  aiReasoning?: string; // AI explanation for priority assignment
  aiTags?: string[]; // AI-generated tags for categorization
  estimatedResponseTime?: string; // AI-suggested response timeframe
}

// Utility function to clean phone numbers for dialing
export const cleanPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except + at the beginning
  return phoneNumber.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
};

// Utility function to format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Format US phone numbers (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format US phone numbers with country code (+1)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if it doesn't match common patterns
  return phoneNumber;
};