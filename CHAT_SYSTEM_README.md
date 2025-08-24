# Cool Wind Services - Gemini 2.0 AI Chat Support System

## 🚀 Overview

A production-ready AI chat support agent powered by **Google Gemini 2.0** specifically designed for Cool Wind Services - Kerala's leading AC & Refrigerator spare parts supplier and service provider in Thiruvalla and Pathanamthitta.

### 🎯 Key Features

- **Gemini 2.0 Integration**: Latest Google AI model with advanced conversation capabilities
- **Business-Specific Knowledge**: Tailored for AC & refrigerator spare parts and services
- **Intelligent Intent Recognition**: Automatically categorizes customer inquiries
- **Real-time Responses**: Fast, contextual responses with quick action buttons
- **Mobile-First Design**: Responsive chat widget that adapts to all devices
- **Emergency Escalation**: Automatic priority handling for urgent repair requests
- **Lead Generation**: Captures and converts inquiries into business contacts
- **Multi-language Support**: Ready for Malayalam and English customers
- **Security & Privacy**: Input sanitization and PII protection

## 🏗️ Architecture

### Tech Stack
```
Frontend: React 18 + TypeScript + Tailwind CSS
AI Model: Google Gemini 2.0 (gemini-2.0-flash-exp)
API: Next.js App Router API Routes
State Management: React Context + useReducer
UI Components: Framer Motion animations
Icons: Lucide React
```

### Core Components

```
📁 lib/
├── types/chat.ts              # TypeScript interfaces
├── gemini/client.ts           # Gemini API integration
├── chat/
│   ├── conversation-context.ts # Context management
│   ├── business-logic.ts      # Business-specific enhancements
│   └── error-handler.ts       # Comprehensive error handling
📁 components/chat/
├── ChatWidget.tsx             # Main chat widget
├── ChatMessage.tsx            # Individual message component
├── QuickReplies.tsx           # Interactive quick replies
└── TypingIndicator.tsx        # Typing animation
📁 app/api/chat/
└── route.ts                   # Chat API endpoint
```

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai uuid @types/uuid
```

### 2. Environment Configuration

Create `.env.local` with your configuration:

```env
# Gemini AI Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Business Configuration  
NEXT_PUBLIC_BUSINESS_PHONE=+918547229991
NEXT_PUBLIC_WHATSAPP_NUMBER=918547229991
NEXT_PUBLIC_BUSINESS_EMAIL=info@coolwindservices.com

# Chat Configuration
CHAT_SESSION_TIMEOUT=1800000
MAX_MESSAGES_PER_SESSION=50
ENABLE_CHAT_ANALYTICS=true
```

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or use existing
3. Generate an API key for Gemini 2.0
4. Add the key to your `.env.local` file

### 4. Add Chat Widget to Layout

The chat widget is already integrated in `app/[locale]/layout.tsx`:

```tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

// In your layout component
<ChatWidget />
```

## 💬 Usage Guide

### Basic Chat Flow

1. **Welcome Message**: Automatic greeting with service options
2. **Intent Recognition**: AI categorizes user inquiries automatically
3. **Contextual Responses**: Business-specific responses with relevant information
4. **Quick Actions**: One-click buttons for calls, WhatsApp, or specific inquiries
5. **Escalation**: Automatic escalation for complex or emergency requests

### Supported Inquiry Types

- **Spare Parts Inquiry** 🔧
  - AC parts: compressors, thermostats, coils, control boards
  - Refrigerator parts: compressors, door seals, defrost timers
  - Brand-specific parts for Samsung, LG, Whirlpool, etc.

- **Service Requests** 🛠️
  - Emergency repairs (24/7 availability)
  - Regular maintenance and service
  - Installation services

- **Sales Inquiries** 💰
  - New appliance purchases
  - Refurbished units
  - Price inquiries and quotes

- **Business Information** 📍
  - Contact details and location
  - Service areas and hours
  - Company information

### Emergency Handling

The system automatically detects emergency keywords and:
- Prioritizes the conversation
- Provides immediate contact options
- Escalates to human agents
- Shows emergency service availability

## 🎨 UI/UX Features

### Chat Widget Design

- **Floating Button**: Pulsing animation with notification badge
- **Responsive Window**: Adapts from 380px widget to full-screen on mobile
- **Professional Styling**: Cool Wind Services branding with blue gradient
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: ARIA labels and keyboard navigation

### Message Types

- **Text Messages**: Standard conversation
- **Quick Replies**: Interactive buttons for common actions
- **Contact Cards**: Direct call/WhatsApp integration
- **Emergency Alerts**: Priority highlighting for urgent requests
- **Escalation Notices**: Visual indicators when escalating to human agents

### Mobile Experience

- **Full-screen Mode**: Optimized mobile layout
- **Touch Gestures**: Swipe and tap interactions
- **Auto-focus**: Input field focus management
- **Network Handling**: Offline state management

## 🧠 AI Configuration

### Gemini 2.0 Model Settings

```typescript
const modelConfig = {
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,        // Balanced creativity
    topK: 40,               // Response diversity
    topP: 0.8,              // Nucleus sampling
    maxOutputTokens: 1000,  // Response length limit
  },
  safetySettings: [
    // Comprehensive content filtering
  ]
}
```

### System Prompt Engineering

The AI is trained with comprehensive business knowledge:

- **Company Profile**: Cool Wind Services details
- **Service Areas**: Thiruvalla and Pathanamthitta focus
- **Product Knowledge**: AC and refrigerator parts catalog
- **Service Types**: Emergency, regular, installation services
- **Brand Expertise**: All major appliance brands
- **Local Context**: Kerala-specific service approach

### Intent Recognition

Advanced pattern matching for:
- **Keywords**: Part names, service types, urgency indicators
- **Patterns**: Regex-based phrase detection
- **Entity Extraction**: Brands, appliance types, locations
- **Confidence Scoring**: Intent certainty measurement

## 🔒 Security & Privacy

### Input Sanitization
- **XSS Prevention**: Script tag removal and HTML sanitization
- **Length Limits**: 500 character message limit
- **Content Filtering**: Gemini's built-in safety settings

### PII Protection
- **Phone Detection**: Automatic masking of phone numbers
- **Email Detection**: Email address protection
- **Session Management**: Secure session handling

### Error Handling
- **Graceful Degradation**: Fallback responses for all error types
- **Rate Limiting**: Protection against abuse
- **Retry Logic**: Exponential backoff for failed requests
- **Escalation**: Automatic human handoff for persistent issues

## 📊 Analytics & Monitoring

### Chat Events Tracked
- Message sending and receiving
- Intent recognition accuracy
- Escalation rates and reasons
- User satisfaction indicators
- Conversion to calls/contacts

### Performance Metrics
- Response time monitoring
- Token usage tracking
- Error rate analysis
- User engagement metrics

### Business KPIs
- Lead generation rate
- Contact conversion
- Query resolution efficiency
- Customer satisfaction scores

## 🚀 Deployment

### Vercel Deployment

1. **Environment Variables**: Set all required env vars in Vercel dashboard
2. **Build Settings**: Standard Next.js configuration
3. **Function Timeout**: Set API routes to 30s for Gemini calls
4. **Domain Setup**: Configure custom domain if needed

### Production Checklist

- [ ] Gemini API key configured
- [ ] Environment variables set
- [ ] Business phone numbers verified
- [ ] WhatsApp links tested
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] Performance optimized

## 🔧 Customization

### Business Information

Update business details in `lib/chat/business-logic.ts`:

```typescript
private static readonly BUSINESS_INFO = {
  name: "Your Business Name",
  phone: "+91XXXXXXXXXX",
  location: "Your Location",
  serviceAreas: ["Area 1", "Area 2"],
  // ... other details
}
```

### Intent Recognition

Modify intent patterns in `lib/chat/conversation-context.ts`:

```typescript
const intentPatterns = {
  CUSTOM_INTENT: {
    keywords: ["keyword1", "keyword2"],
    patterns: [/pattern1/i, /pattern2/i],
    weight: 3
  }
}
```

### UI Styling

Customize appearance in chat components:
- Colors: Update Tailwind classes
- Animations: Modify Framer Motion configs
- Layout: Adjust responsive breakpoints

## 🐛 Troubleshooting

### Common Issues

**Chat Widget Not Appearing**
- Check if ChatWidget is imported in layout
- Verify environment variables are set
- Check browser console for errors

**Gemini API Errors**
- Verify API key is correct and active
- Check quota limits in Google AI Studio
- Review network connectivity

**Response Quality Issues**
- Adjust system prompt in `lib/gemini/client.ts`
- Modify temperature and sampling parameters
- Review intent recognition patterns

### Debug Mode

Enable detailed logging:
```typescript
// In conversation-context.ts
console.log('Intent recognized:', intent);
console.log('Context updated:', context);
```

## 📈 Performance Optimization

### Response Time
- Parallel component loading
- Optimized Gemini API calls
- Efficient state management
- Lazy loading of chat components

### Bundle Size
- Tree-shaking unused code
- Dynamic imports for heavy components
- Optimized dependencies
- Code splitting

### User Experience
- Instant UI feedback
- Optimistic message updates
- Smooth animations
- Offline handling

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Start development server: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📝 License

This project is proprietary software developed for Cool Wind Services.

## 🆘 Support

For technical support or questions:
- **Email**: technical@coolwindservices.com
- **Phone**: +91 85472 29991
- **Documentation**: See inline code comments

---

## 🎯 Business Impact

### Expected Results
- **15-25** qualified inquiries per month via chat
- **>85%** user satisfaction with bot responses
- **<25%** escalation rate to human agents
- **>40%** conversion rate to phone/WhatsApp contact
- **<3 seconds** average response time

### Success Metrics
- Lead generation increase
- Customer support efficiency
- Response time improvement
- User engagement growth
- Business conversion rates

---

*Built with ❤️ for Cool Wind Services by AI-powered development*