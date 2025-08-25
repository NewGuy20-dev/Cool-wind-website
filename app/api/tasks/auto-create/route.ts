import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Task creation schema
const TaskCreationSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  problemDescription: z.string().min(5, 'Problem description is required'),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['new', 'in_progress', 'completed', 'cancelled']).default('new'),
  source: z.string().default('chat-failed-call'),
  chatContext: z.array(z.any()).optional(),
  aiPriorityReason: z.string().optional(),
  location: z.string().optional(),
  urgencyKeywords: z.array(z.string()).optional()
});

export interface TaskData {
  id: string;
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  source: string;
  chatContext?: any[];
  aiPriorityReason?: string;
  location?: string;
  urgencyKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

// In-memory task storage (in production, use database)
const tasks = new Map<string, TaskData>();

// Generate task ID
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// AI Priority Assessment
async function assessPriorityWithAI(problemDescription: string, location?: string): Promise<{
  priority: 'high' | 'medium' | 'low';
  reason: string;
}> {
  const lowerProblem = problemDescription.toLowerCase();
  
  // Emergency/High Priority indicators
  const highPriorityKeywords = [
    'emergency', 'urgent', 'immediately', 'asap', 'broken down', 'completely dead',
    'not working at all', 'stopped working', 'no cooling', 'no power',
    'leaking water', 'making loud noise', 'sparking', 'burning smell',
    'health risk', 'food spoiling', 'extreme weather'
  ];

  // Medium Priority indicators
  const mediumPriorityKeywords = [
    'not cooling well', 'poor performance', 'strange noise', 'temperature issue',
    'intermittent problem', 'needs service', 'maintenance required',
    'part replacement', 'warranty issue'
  ];

  // Low Priority indicators
  const lowPriorityKeywords = [
    'routine maintenance', 'cleaning', 'minor issue', 'cosmetic',
    'preventive service', 'check up', 'general inquiry'
  ];

  // Check for high priority
  const highMatches = highPriorityKeywords.filter(keyword => lowerProblem.includes(keyword));
  if (highMatches.length > 0) {
    return {
      priority: 'high',
      reason: `Emergency/urgent situation detected: ${highMatches.join(', ')}`
    };
  }

  // Check for medium priority
  const mediumMatches = mediumPriorityKeywords.filter(keyword => lowerProblem.includes(keyword));
  if (mediumMatches.length > 0) {
    return {
      priority: 'medium',
      reason: `Service issue requiring attention: ${mediumMatches.join(', ')}`
    };
  }

  // Check for low priority
  const lowMatches = lowPriorityKeywords.filter(keyword => lowerProblem.includes(keyword));
  if (lowMatches.length > 0) {
    return {
      priority: 'low',
      reason: `Routine/maintenance request: ${lowMatches.join(', ')}`
    };
  }

  // Default to medium if no clear indicators
  return {
    priority: 'medium',
    reason: 'Unable to determine priority from description, defaulting to medium'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Task creation request received:', body);

    // Validate the task data
    const validatedData = TaskCreationSchema.parse(body);

    // AI Priority Assessment if not provided or if provided priority needs validation
    let finalPriority = validatedData.priority;
    let priorityReason = validatedData.aiPriorityReason || '';

    if (!validatedData.aiPriorityReason) {
      const aiAssessment = await assessPriorityWithAI(
        validatedData.problemDescription, 
        validatedData.location
      );
      finalPriority = aiAssessment.priority;
      priorityReason = aiAssessment.reason;
    }

    // Create task
    const taskId = generateTaskId();
    const now = new Date().toISOString();

    const taskData: TaskData = {
      id: taskId,
      customerName: validatedData.customerName,
      phoneNumber: validatedData.phoneNumber,
      problemDescription: validatedData.problemDescription,
      priority: finalPriority,
      status: validatedData.status,
      source: validatedData.source,
      chatContext: validatedData.chatContext,
      aiPriorityReason: priorityReason,
      location: validatedData.location,
      urgencyKeywords: validatedData.urgencyKeywords,
      createdAt: now,
      updatedAt: now
    };

    // Store task
    tasks.set(taskId, taskData);

    console.log('Task created successfully:', {
      taskId,
      customerName: taskData.customerName,
      priority: taskData.priority,
      reason: priorityReason
    });

    // Log for admin monitoring
    console.log(`🔔 NEW FAILED CALL TASK CREATED:
      ID: ${taskId}
      Customer: ${taskData.customerName}
      Phone: ${taskData.phoneNumber}
      Problem: ${taskData.problemDescription}
      Priority: ${taskData.priority} (${priorityReason})
      Location: ${taskData.location || 'Not specified'}
      Source: ${taskData.source}
      Created: ${now}`);

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      taskId,
      priority: finalPriority,
      priorityReason
    });

  } catch (error) {
    console.error('Task creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid task data', 
          details: error.issues,
          success: false 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create task. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (taskId) {
    // Get specific task
    const task = tasks.get(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ task });
  }

  // Get all tasks
  const allTasks = Array.from(tasks.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ 
    tasks: allTasks,
    count: allTasks.length
  });
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}