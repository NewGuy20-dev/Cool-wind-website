# 📚 API Documentation

## Task Management System API Reference

Complete API documentation for the Supabase-powered task management system.

---

## 🏗️ API Architecture

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Authentication
Most admin endpoints require authentication via bearer token:
```http
Authorization: Bearer your-admin-key
```

### Response Format
All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 🎯 Core API Endpoints

### Task Management

#### Create Task
Create a new task in the system.

**Endpoint**: `POST /api/tasks/auto-create`

**Request Body**:
```typescript
{
  customerName: string;          // Required: Customer name (min 2 chars)
  phoneNumber: string;           // Required: 10-digit Indian mobile number
  problemDescription: string;    // Required: Problem description (min 10 chars)
  title?: string;               // Optional: Task title
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  source?: 'chat-failed-call' | 'admin-manual' | 'api-direct';
  location?: string;            // Optional: Customer location
  description?: string;         // Optional: Additional description
  category?: string;            // Optional: Task category
  urgencyKeywords?: string[];   // Optional: AI-detected urgency keywords
  chatContext?: any[];          // Optional: Chat conversation context
  metadata?: Record<string, any>; // Optional: Additional metadata
}
```

**Response**:
```typescript
{
  success: true;
  message: "Task created successfully";
  taskId: string;               // UUID of created task
  taskNumber: string;           // Human-readable task number
  priority: string;             // Final AI-assessed priority
  priorityReason: string;       // AI reasoning for priority
  data: {
    id: string;
    taskNumber: string;
    customerName: string;
    phoneNumber: string;
    problemDescription: string;
    priority: string;
    status: string;
    location: string | null;
    source: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example**:
```bash
curl -X POST https://your-domain.com/api/tasks/auto-create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "phoneNumber": "9876543210",
    "problemDescription": "AC not cooling properly, very urgent",
    "location": "Thiruvalla",
    "source": "chat-failed-call"
  }'
```

#### Get Task by ID
Retrieve a specific task by its ID.

**Endpoint**: `GET /api/tasks/auto-create?taskId={id}`

**Response**:
```typescript
{
  success: true;
  task: {
    id: string;
    task_number: string;
    customer_name: string;
    phone_number: string;
    title: string;
    problem_description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    location: string | null;
    source: string;
    created_at: string;
    updated_at: string;
    // ... additional fields
  };
}
```

#### Get All Tasks
Retrieve all tasks with optional filtering.

**Endpoint**: `GET /api/tasks/auto-create`

**Query Parameters**:
- `status`: Filter by status
- `priority`: Filter by priority
- `limit`: Number of tasks to return (default: 100)

**Example**:
```bash
curl "https://your-domain.com/api/tasks/auto-create?status=pending&limit=50"
```

---

### Admin Task Management

#### Get Admin Tasks
Retrieve tasks with advanced filtering and analytics.

**Endpoint**: `GET /api/admin/tasks`
**Authentication**: Required

**Query Parameters**:
- `search`: Full-text search term
- `status`: Filter by status
- `priority`: Filter by priority
- `source`: Filter by source
- `dateFrom`: Start date (ISO string)
- `dateTo`: End date (ISO string)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `dashboard`: Set to 'true' for dashboard data
- `analytics`: Set to 'true' for analytics data

**Response**:
```typescript
{
  success: true;
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  analytics?: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    completion_rate: number;
    avg_completion_time: string;
  };
  urgentTasks?: Task[];
}
```

**Example**:
```bash
curl -H "Authorization: Bearer your-admin-key" \
  "https://your-domain.com/api/admin/tasks?search=AC&status=pending"
```

#### Update Task
Update an existing task.

**Endpoint**: `PATCH /api/admin/tasks`
**Authentication**: Required

**Request Body**:
```typescript
{
  taskId: string;               // Required: Task ID to update
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  title?: string;
  description?: string;
  location?: string;
  assigned_to?: string;         // UUID of assigned user
  due_date?: string;            // ISO date string
  completed_at?: string;        // ISO date string
  metadata?: Record<string, any>;
}
```

**Bulk Update**:
```typescript
{
  bulk: true;
  taskIds: string[];            // Array of task IDs
  updates: {
    status?: string;
    priority?: string;
    // ... other fields
  };
}
```

**Response**:
```typescript
{
  success: true;
  message: "Task updated successfully";
  task?: Task;                  // Single update
  updatedTasks?: Task[];        // Bulk update
}
```

#### Create Admin Task
Create a new task through admin interface.

**Endpoint**: `POST /api/admin/tasks`
**Authentication**: Required

**Request Body**: Same as task creation, but `source` defaults to `'admin-manual'`

#### Delete Task
Soft delete a task (sets deleted_at timestamp).

**Endpoint**: `DELETE /api/admin/tasks?taskId={id}&reason={reason}`
**Authentication**: Required

**Query Parameters**:
- `taskId`: Required - ID of task to delete
- `reason`: Optional - Reason for deletion

---

### Tickets API (Backward Compatibility)

The tickets API provides backward compatibility by mapping tasks to the old ticket format.

#### Get Tickets
**Endpoint**: `GET /api/tickets`

**Response**: Maps tasks to ticket format for existing frontend components.

#### Get Ticket Statistics
**Endpoint**: `GET /api/tickets/stats`

**Response**:
```typescript
{
  success: true;
  data: {
    totalTickets: number;
    pendingTickets: number;
    inProgressTickets: number;
    completedTickets: number;
    cancelledTickets: number;
    completionRate: number;
    avgCompletionTime: string | null;
    highPriorityTickets: number;
    urgentPriorityTickets: number;
    todayCreated: number;
    todayCompleted: number;
    performanceScore: number;
    avgResolutionHours: number;
  };
}
```

---

### Failed Calls API (Backward Compatibility)

#### Get Failed Calls
**Endpoint**: `GET /api/failed-calls`

Retrieves tasks that originated from failed call detection.

**Response**: Maps failed-call tasks to failed call format.

---

## 🔍 Database Functions API

### Dashboard Data
Get comprehensive dashboard data including overview, recent tasks, and analytics.

**Endpoint**: `GET /api/admin/tasks?dashboard=true`
**Authentication**: Required

**Response**:
```typescript
{
  success: true;
  dashboard: {
    overview: {
      total_tasks: number;
      pending_count: number;
      in_progress_count: number;
      completed_count: number;
      cancelled_count: number;
      urgent_count: number;
      high_count: number;
      medium_count: number;
      low_count: number;
      today_created: number;
      today_completed: number;
      overdue_count: number;
      avg_completion_hours: number;
      last_updated: string;
    };
    recentTasks: Task[];
    urgentTasks: Task[];
    dailyStats: DailyStats[];
  };
}
```

### Task Search
Advanced task search with full-text search and filtering.

**Direct Database Call**:
```sql
SELECT * FROM search_tasks(
  search_term := 'AC not cooling',
  filter_status := 'pending',
  filter_priority := 'high',
  limit_count := 50
);
```

### Customer Insights
Get comprehensive customer insights and history.

**Direct Database Call**:
```sql
SELECT * FROM get_customer_insights('9876543210');
```

**Response Structure**:
```typescript
{
  customer_info: {
    phone_number: string;
    customer_name: string;
    location: string;
    total_tasks: number;
    first_service_date: string;
    last_service_date: string;
    customer_status: 'Active' | 'Recent' | 'Inactive';
    risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk';
  };
  task_history: Task[];
  satisfaction_metrics: {
    satisfaction_score: number;
    avg_resolution_hours: number;
    completion_rate: number;
  };
  recommendations: {
    priority_level: 'high' | 'medium' | 'standard';
    suggested_actions: string[];
  };
}
```

### System Health Check
Monitor system health and performance.

**Direct Database Call**:
```sql
SELECT * FROM check_system_health();
```

**Response**:
```typescript
[
  {
    check_name: 'overdue_urgent_tasks';
    status: 'OK' | 'WARNING' | 'CRITICAL';
    details: Record<string, any>;
  }
]
```

---

## 🚨 Error Handling

### Error Response Format
```typescript
{
  success: false;
  error: string;                // Human-readable error message
  details?: any;                // Additional error details
  code?: string;                // Error code for programmatic handling
}
```

### Common Error Codes

#### 400 Bad Request
- **Invalid input data**: Missing required fields or invalid format
- **Validation error**: Data doesn't meet validation requirements

```json
{
  "success": false,
  "error": "Invalid task data",
  "details": [
    {
      "field": "phoneNumber",
      "message": "Phone number must be exactly 10 digits"
    }
  ]
}
```

#### 401 Unauthorized
- **Missing authentication**: No bearer token provided
- **Invalid credentials**: Invalid admin key

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### 404 Not Found
- **Task not found**: Requested task doesn't exist or is deleted

```json
{
  "success": false,
  "error": "Task not found"
}
```

#### 500 Internal Server Error
- **Database error**: Connection issues or query failures
- **System error**: Unexpected server errors

```json
{
  "success": false,
  "error": "Failed to create task",
  "details": "Database connection timeout"
}
```

---

## 🔐 Authentication & Security

### Admin Authentication
Admin endpoints require bearer token authentication:

```http
Authorization: Bearer your-admin-key
```

Configure admin key in environment variables:
```bash
ADMIN_KEY=your-secure-admin-key
```

### Rate Limiting
API endpoints are rate-limited to prevent abuse:
- **Default**: 60 requests per minute per IP
- **Admin endpoints**: 100 requests per minute per authenticated user

### Input Validation
All inputs are validated and sanitized:
- **Phone numbers**: Must be 10-digit Indian mobile numbers (6-9 prefix)
- **Text fields**: HTML tags stripped, length limits enforced
- **SQL injection**: All queries use parameterized statements

### CORS Configuration
CORS is configured for cross-origin requests:
```javascript
{
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}
```

---

## 📊 Real-time Features

### WebSocket Subscriptions
Real-time updates are available via Supabase real-time subscriptions:

```typescript
import { supabase } from '@/lib/supabase/client';

// Subscribe to task changes
const subscription = supabase
  .channel('task_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('Task changed:', payload);
    }
  )
  .subscribe();
```

### Real-time Events
Available real-time events:
- **Task created**: New task inserted
- **Task updated**: Task fields modified
- **Task deleted**: Task soft deleted
- **Status changed**: Task status updated
- **Priority escalated**: Task priority increased

---

## 🧪 Testing the API

### Development Testing
```bash
# Test task creation
curl -X POST http://localhost:3000/api/tasks/auto-create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "phoneNumber": "9876543210",
    "problemDescription": "Test AC not cooling issue"
  }'

# Test admin endpoints
curl -H "Authorization: Bearer admin123" \
  http://localhost:3000/api/admin/tasks
```

### Production Testing
```bash
# Health check
curl https://your-domain.com/api/health

# Test with valid data
curl -X POST https://your-domain.com/api/tasks/auto-create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Production Test",
    "phoneNumber": "9876543210",
    "problemDescription": "Production test task creation"
  }'
```

---

## 📈 Performance Considerations

### Response Times
Expected response times:
- **Task creation**: < 500ms
- **Task retrieval**: < 200ms
- **Search queries**: < 1s
- **Dashboard data**: < 2s
- **Analytics**: < 3s

### Caching Strategy
- **Database queries**: Cached for 5 minutes
- **Static data**: Cached for 1 hour
- **Real-time data**: No caching

### Pagination
Large datasets are paginated:
- **Default page size**: 50 items
- **Maximum page size**: 100 items
- **Cursor-based pagination**: Available for large datasets

---

## 🔧 SDK and Client Libraries

### TypeScript/JavaScript Client

```typescript
import { TaskService } from '@/lib/supabase/tasks';

// Create task
const result = await TaskService.createTask({
  customer_name: 'John Doe',
  phone_number: '9876543210',
  problem_description: 'AC not working'
});

// Get tasks
const tasks = await TaskService.getAllTasks('pending', 'high');

// Search tasks
const searchResult = await TaskService.searchTasks({
  search: 'AC cooling',
  status: 'pending'
});
```

### Direct Database Access

```sql
-- Create task
INSERT INTO tasks (customer_name, phone_number, problem_description, title)
VALUES ('John Doe', '9876543210', 'AC not working', 'Service Request');

-- Search tasks
SELECT * FROM search_tasks('AC cooling', 'pending', 'high');

-- Get dashboard data
SELECT * FROM get_dashboard_data();
```

---

## 📞 Support and Troubleshooting

### Common Issues

1. **Authentication errors**: Verify admin key is correct
2. **Validation errors**: Check required fields and formats
3. **Rate limiting**: Reduce request frequency
4. **Database errors**: Check Supabase connection and RLS policies

### Getting Help

- **Documentation**: Refer to this API documentation
- **Database Schema**: Check SQL files in `/sql` directory
- **Error Logs**: Check browser console and server logs
- **Supabase Dashboard**: Monitor database performance and logs

### API Status

Monitor API health at:
- **Health endpoint**: `/api/health`
- **System status**: `/api/admin/tasks?analytics=true`

---

## 🔄 API Versioning

Current API version: **v1**

Future versions will be released with backward compatibility:
- **v1**: Current implementation
- **v2**: Planned features (WebHooks, advanced analytics)

---

This documentation covers all available API endpoints and features. For implementation examples and advanced usage, refer to the codebase and additional documentation files.