# Chat Agent Integration Example

This document shows how to integrate the AI-powered Failed Call Management System with your existing chat agent.

## 🚀 Quick Integration

### Step 1: Install Dependencies
The system uses the existing Gemini API setup, so no additional dependencies are needed.

### Step 2: Basic Integration
```typescript
import { processMessageForFailedCall } from './lib/chat-agent-integration';

// In your chat message handler
async function handleChatMessage(userMessage: string, chatSession: any) {
  // Check for failed call mentions with AI analysis
  const failedCallResult = await processMessageForFailedCall(userMessage, {
    customerName: chatSession.customerName,
    phoneNumber: chatSession.phoneNumber,
    currentTopic: chatSession.currentTopic,
    messages: chatSession.messages
  });

  if (failedCallResult.shouldCreateTask) {
    // Task was automatically created with AI priority analysis
    console.log(`✅ Failed call task created: ${failedCallResult.taskId}`);
    
    // Return AI-generated response to customer
    return failedCallResult.suggestedResponse;
  }

  // Continue with normal chat flow
  return generateNormalResponse(userMessage);
}
```

## 🧠 Advanced Integration with Customer Context

### Enhanced Chat Session
```typescript
interface EnhancedChatSession {
  customerName: string;
  phoneNumber: string;
  currentTopic: string;
  customerType: 'residential' | 'commercial';
  isReturningCustomer: boolean;
  previousIssues: string[];
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

async function handleAdvancedChatMessage(
  userMessage: string, 
  session: EnhancedChatSession
) {
  // Enhanced AI analysis with customer context
  const result = await processMessageForFailedCall(userMessage, {
    ...session,
    customerInfo: {
      name: session.customerName,
      isReturningCustomer: session.isReturningCustomer,
      previousIssues: session.previousIssues,
      customerType: session.customerType
    }
  });

  if (result.shouldCreateTask && result.taskCreated) {
    // Log for admin dashboard
    console.log('📋 AI Analysis Result:', {
      taskId: result.taskId,
      priority: result.detectionResult?.suggestedPriority,
      reasoning: 'AI-powered priority assignment',
      customerAware: false // Customer doesn't know about the analysis
    });

    return result.suggestedResponse;
  }

  return generateNormalResponse(userMessage);
}
```

## 🎯 Real-World Examples

### Example 1: Emergency AC Failure
```typescript
// Customer message: "I tried calling but no answer. My AC is completely broken and it's really hot"
// AI Analysis: Priority 1 (High) - Emergency situation
// Response: "Thanks for letting me know, [Name]. I've logged this as urgent and you'll receive a callback within the next few hours about your AC issue."
// Task Created: Automatically with priority tags: ['emergency', 'ac-failure', 'heat-emergency']
```

### Example 2: Routine Maintenance
```typescript
// Customer message: "Couldn't reach you yesterday. Need routine maintenance when convenient"
// AI Analysis: Priority 3 (Low) - Routine request
// Response: "I've recorded your request, [Name]. You'll receive a callback within 2-3 business days to help with your maintenance."
// Task Created: Automatically with priority tags: ['routine', 'maintenance', 'flexible-timing']
```

### Example 3: Commercial Emergency
```typescript
// Customer message: "Called about our restaurant fridge. Food spoiling fast!"
// AI Analysis: Priority 1 (High) - Business impact + food safety
// Response: "Thanks for letting me know, [Business Name]. I've logged this as urgent and you'll receive a callback within the next few hours about your refrigerator issue."
// Task Created: Automatically with priority tags: ['commercial', 'food-safety', 'business-impact']
```

## 🔧 Configuration Options

### Enable/Disable AI Analysis
```typescript
// Use AI analysis (default)
const result = await autoCreateFailedCallTask(
  customerName,
  phoneNumber,
  conversationContext,
  urgencyKeywords,
  customerInfo,
  true // useAI = true
);

// Use keyword-based analysis (fallback)
const result = await autoCreateFailedCallTask(
  customerName,
  phoneNumber,
  conversationContext,
  urgencyKeywords,
  customerInfo,
  false // useAI = false
);
```

### Custom Priority Adjustments
```typescript
import { aiPriorityAnalyzer } from './lib/ai-priority-analyzer';

// Adjust priority based on time and customer type
const basePriority = await aiPriorityAnalyzer.analyzePriority(
  problemDescription,
  conversationContext
);

const adjustedPriority = aiPriorityAnalyzer.getPriorityAdjustments(
  basePriority.priority,
  new Date(), // current time
  'commercial' // customer type
);
```

## 📱 Direct API Usage

### Create Task with AI Analysis
```typescript
const response = await fetch('/api/failed-calls/auto-create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'John Doe',
    phoneNumber: '9876543210',
    conversationContext: 'Customer mentioned AC emergency during chat',
    urgencyKeywords: ['emergency', 'urgent'],
    customerInfo: {
      name: 'John Doe',
      isReturningCustomer: true,
      currentTopic: 'AC repair'
    },
    useAI: true // Enable AI analysis
  })
});

const result = await response.json();
// Returns: { success: true, message: "...", taskId: "...", priority: "high" }
```

### Analyze Message Patterns
```typescript
const response = await fetch('/api/failed-calls/auto-create', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messageText: 'I tried calling but got no answer'
  })
});

const analysis = await response.json();
// Returns: { hasFailedCallIndicator: true, urgencyKeywords: [...], suggestedPriority: "medium" }
```

## 🎨 UI Integration

### Show AI Analysis in Admin Panel
```tsx
// Task card component already includes AI analysis display
{task.aiPriorityScore && (
  <div className="ai-analysis-section">
    <span className="ai-priority">AI Priority: {task.aiPriorityScore}</span>
    <p className="ai-reasoning">{task.aiReasoning}</p>
    <div className="ai-tags">
      {task.aiTags?.map(tag => (
        <span key={tag} className="tag">{tag}</span>
      ))}
    </div>
  </div>
)}
```

## 🔍 Monitoring & Analytics

### Track AI Performance
```typescript
// Log AI decisions for analysis
function logAIDecision(taskId: string, aiAnalysis: any) {
  console.log('🤖 AI Decision Log:', {
    taskId,
    priority: aiAnalysis.priority,
    reasoning: aiAnalysis.reasoning,
    tags: aiAnalysis.tags,
    timestamp: new Date().toISOString(),
    model: 'gemini-2.0-flash-exp'
  });
}
```

### Performance Metrics
- **Accuracy**: Track how well AI predictions match human expectations
- **Response Time**: Monitor API response times for AI analysis
- **Customer Satisfaction**: Measure callback success rates by AI priority

## 🚀 Production Deployment

### Environment Setup
```env
# Required for AI functionality
GOOGLE_AI_API_KEY=your_actual_gemini_key
GEMINI_MODEL=gemini-2.0-flash-exp
ADMIN_PASSWORD=secure_production_password

# Optional optimizations
AI_ANALYSIS_TIMEOUT=5000
FALLBACK_TO_KEYWORDS=true
```

### Error Handling
```typescript
try {
  const aiResult = await autoCreateFailedCallTaskWithAI(/* ... */);
  return aiResult;
} catch (aiError) {
  console.error('AI analysis failed, using fallback:', aiError);
  // Automatically falls back to keyword-based analysis
  return autoCreateFailedCallTask(/* ... */);
}
```

## 📊 Success Metrics

After implementing AI priority analysis, expect:

- **80%+ Accuracy** in priority assignment
- **Faster Response Times** for high-priority issues
- **Better Customer Satisfaction** through appropriate response timeframes
- **Reduced Admin Overhead** with intelligent categorization
- **Zero Customer Awareness** of AI analysis (silent operation)

---

**Ready to deploy!** The AI system works completely behind the scenes, analyzing customer problems and assigning priorities without any customer interaction or awareness.