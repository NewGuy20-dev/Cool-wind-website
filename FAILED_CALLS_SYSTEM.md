# Failed Call Management System

A comprehensive system for Cool Wind Services to handle failed customer calls with a password-protected admin Kanban board and chat agent integration.

## 🎯 System Overview

The Failed Call Management System provides:
- **Password-protected admin panel** at `/admin`
- **5-column Kanban board** for task management
- **Auto-dial functionality** with phone number formatting
- **Drag-and-drop interface** for task status updates
- **Chat agent integration** for automatic task creation
- **Mobile-responsive design** for desktop and mobile use

## 🔐 Access & Authentication

### Admin Access
- Navigate to `/admin` to access the system
- Default password: `coolwind2024` (set in `.env.local`)
- Session persists until logout or browser close

### Password Configuration
Update the admin password by editing `.env.local`:
```env
ADMIN_PASSWORD=your_secure_password_here
```

## 📋 Kanban Board Structure

The system uses 5 columns to track failed call resolution:

### 1. New Failed Calls
- Fresh customer reports
- Unassigned tasks requiring attention
- Auto-created from chat agent

### 2. Customer Unavailable  
- Customer can't take calls at the moment
- Includes availability notes and preferences
- Shows attempt counter

### 3. Scheduled Callbacks
- Planned for specific times
- Shows scheduled callback time
- Customer confirmed availability

### 4. In Progress
- Currently attempting contact
- Active tasks being worked on
- Real-time status updates

### 5. Completed
- Successfully resolved calls
- Completed service requests
- Archive of finished tasks

## 📱 Task Card Features

Each task card displays:
- **Customer name** (prominent header)
- **Phone number** (clickable for auto-dial)
- **Problem description** (from conversation)
- **Timestamp** when reported
- **Priority indicator** (red=urgent, yellow=medium, green=low)
- **Customer availability notes**
- **Attempt counter** (tracks call attempts)
- **Edit/delete options** (menu dropdown)

## 📞 Auto-Dial Functionality

### How It Works
1. Click any phone number on a task card
2. System automatically opens phone dialer
3. Phone numbers are cleaned and formatted
4. Attempt counter increments automatically
5. Works on desktop and mobile browsers

### Phone Number Support
- Formats: (555) 123-4567, 555-123-4567, 5551234567
- International numbers with country codes
- Automatic cleaning removes formatting for dialing

## 🎯 Drag & Drop Interface

### Usage
1. **Drag** any task card to move between columns
2. **Drop** in target column to update status
3. **Visual feedback** during drag operations
4. **Auto-save** - changes persist immediately
5. **Mobile support** - touch-friendly interactions

### Status Changes
- Dragging automatically updates task status
- Changes are saved to database immediately
- No confirmation required for status updates

## 🤖 Chat Agent Integration with AI Priority Analysis

### Automatic Detection
The system automatically detects failed call mentions in chat:

**Trigger phrases:**
- "I tried calling but no answer"
- "Couldn't reach you"
- "Phone went to voicemail" 
- "No one picked up"
- "Called but didn't get through"

### 🧠 AI-Powered Priority Analysis
The system uses Google's Gemini AI to intelligently analyze customer problems:

**Priority Grading (1-3 Scale):**
- **Priority 1 (HIGH)**: Emergency situations requiring immediate response (2-4 hours)
  - Complete appliance breakdown in extreme conditions
  - Safety hazards (electrical issues, gas leaks, overheating)
  - Health-related concerns (medicines, elderly/children affected)
  - Business operations affected (commercial customers)

- **Priority 2 (MEDIUM)**: Important issues requiring same-day response (24 hours)
  - Partial functionality loss but appliance still working
  - Intermittent problems affecting daily routine
  - Service appointments and maintenance needs

- **Priority 3 (LOW)**: Routine issues that can wait (2-3 business days)
  - Routine maintenance requests
  - Cosmetic issues or minor repairs
  - Information inquiries and general questions

### Auto-Response Templates
Based on AI priority analysis, the agent responds:

**AI Priority 1 (High):**
> "Thanks for letting me know, [Name]. I've logged this as urgent and you'll receive a callback within the next few hours about your [issue]."

**AI Priority 2 (Medium):**
> "Noted! I've logged your request and someone will reach out to you within 24 hours to help with your [issue]."

**AI Priority 3 (Low):**
> "I've recorded your request, [Name]. You'll receive a callback within 2-3 business days to help with your [issue]."

### Silent AI Operation
- **Customer Unaware**: All AI analysis happens in the background
- **No Interaction**: Customers don't know their problems are being analyzed
- **Automatic Processing**: Priority assignment happens instantly
- **Seamless Integration**: Works with existing chat flows

### Integration Example
```typescript
import { processMessageForFailedCall } from '../lib/chat-agent-integration';

// In your chat handler
const result = await processMessageForFailedCall(userMessage, chatSession);
if (result.shouldCreateTask) {
  return result.suggestedResponse;
}
```

## 🗄️ API Endpoints

### Task Management
- `GET /api/failed-calls` - Fetch all tasks
- `POST /api/failed-calls` - Create new task
- `GET /api/failed-calls/[id]` - Get specific task
- `PUT /api/failed-calls/[id]` - Update task
- `DELETE /api/failed-calls/[id]` - Delete task

### Chat Agent Integration with AI
- `POST /api/failed-calls/auto-create` - Auto-create from chat with AI analysis
- `PUT /api/failed-calls/auto-create` - Analyze message for patterns

### Authentication
- `POST /api/admin/auth` - Validate admin password

## 💾 Data Structure

### Task Schema
```typescript
interface FailedCallTask {
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
```

### Storage
- Uses JSON file storage (`/data/failed-calls.json`)
- Automatic database initialization
- Thread-safe read/write operations

## 📱 Mobile Optimization

### Responsive Design
- **Mobile**: Stacked column layout
- **Tablet**: 2-column grid
- **Desktop**: 5-column horizontal layout

### Touch Interactions
- 44px minimum touch targets
- Touch-friendly drag and drop
- Optimized button sizes
- Gesture-friendly interface

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access Admin Panel
- Navigate to `http://localhost:3000/admin`
- Enter password: `coolwind2024`

### 3. Seed Sample Data (Optional)
```bash
node scripts/seed-failed-calls.js
```

### 4. Test Auto-Dial
- Click any phone number on task cards
- Verify your browser/device opens dialer

## 🔧 Configuration

### Environment Variables
```env
# Required
ADMIN_PASSWORD=coolwind2024
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Optional
GEMINI_MODEL=gemini-2.0-flash-exp
DATABASE_URL=file:./failed-calls.db
```

### Customization
- Update password in `.env.local`
- Modify response templates in `chat-agent-integration.ts`
- Adjust column colors in `KanbanColumn.tsx`
- Configure priority levels in `failed-calls-db.ts`

## 🔍 Monitoring & Analytics

### Task Metrics
- Total tasks counter
- Tasks per status column
- Priority distribution
- Attempt tracking

### Performance Tracking
- Auto-dial click tracking
- Response time monitoring
- Agent integration success rates

## 🆘 Troubleshooting

### Common Issues

**Auto-dial not working:**
- Check browser permissions for phone access
- Verify phone number formatting
- Test on mobile device

**Drag & drop issues:**
- Clear browser cache
- Check for JavaScript errors
- Verify touch support on mobile

**Authentication problems:**
- Check `.env.local` file exists
- Verify `ADMIN_PASSWORD` is set correctly
- Clear session storage

### Support
For technical issues or questions:
1. Check browser console for errors
2. Verify all API endpoints are responding
3. Test with sample data using seed script

## 📈 Future Enhancements

Potential improvements:
- **Email notifications** for urgent tasks
- **Calendar integration** for scheduled callbacks  
- **Analytics dashboard** with metrics
- **Customer feedback** collection
- **WhatsApp integration** for notifications
- **Voice recording** for callback notes

---

**Cool Wind Services - Internal Use Only**  
Last Updated: December 2024