import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TaskService } from '@/lib/supabase/tasks';
import { TaskCreateRequest, TaskPriority, TaskStatus, TaskSource } from '@/lib/types/database';

// Enhanced task creation schema with Supabase integration
const TaskCreationSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Valid 10-digit phone number is required'),
  problemDescription: z.string().min(10, 'Problem description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['open', 'pending', 'in_progress', 'completed', 'cancelled']).default('open'),
  source: z.enum(['chat-failed-call', 'admin-manual', 'api-direct', 'webhook', 'email', 'phone']).default('chat-failed-call'),
  chatContext: z.array(z.any()).optional(),
  aiPriorityReason: z.string().optional(),
  location: z.string().optional(),
  urgencyKeywords: z.array(z.string()).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  estimatedDuration: z.string().optional(),
  dueDate: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Enhanced AI Assessment for Priority and Status Detection
async function assessTaskWithAI(
  problemDescription: string, 
  location?: string,
  existingPriority?: TaskPriority,
  existingStatus?: TaskStatus
): Promise<{
  priority: TaskPriority;
  status: TaskStatus;
  priorityReason: string;
  statusReason: string;
}> {
  const lowerProblem = problemDescription.toLowerCase();
  
  // Emergency/Urgent Priority indicators (expanded)
  const urgentKeywords = [
    'emergency', 'urgent', 'immediately', 'asap', 'right now',
    'broken down', 'completely dead', 'not working at all', 'stopped working',
    'no cooling', 'no power', 'leaking water', 'sparking', 'burning smell',
    'health risk', 'food spoiling', 'extreme weather', 'elderly', 'infant',
    'making loud noise', 'smoke', 'electrical issue', 'gas leak'
  ];

  // High Priority indicators (expanded)
  const highPriorityKeywords = [
    'not cooling well', 'poor performance', 'temperature issue',
    'intermittent problem', 'needs service urgently', 'very hot weather',
    'important event'
  ];

  // Medium Priority indicators
  const mediumPriorityKeywords = [
    'maintenance required', 'part replacement', 'warranty issue',
    'not working properly', 'efficiency problem', 'noise complaint',
    'strange noise', 'odd sound', 'unusual noise'
  ];

  // Low Priority indicators
  const lowPriorityKeywords = [
    'routine maintenance', 'cleaning', 'minor issue', 'cosmetic',
    'preventive service', 'check up', 'general inquiry', 'information'
  ];

  // Context-based priority escalation
  const contextFactors = {
    weather: lowerProblem.includes('hot') || lowerProblem.includes('summer') || lowerProblem.includes('heat'),
    vulnerable: lowerProblem.includes('elderly') || lowerProblem.includes('baby') || lowerProblem.includes('infant') || lowerProblem.includes('sick'),
    business: lowerProblem.includes('shop') || lowerProblem.includes('restaurant') || lowerProblem.includes('business') || lowerProblem.includes('office'),
    food: lowerProblem.includes('food') || lowerProblem.includes('medicine') || lowerProblem.includes('spoiling'),
  };



  // Status Detection Logic
  // For AI support agent tasks, we want to intelligently detect status
  let detectedStatus: TaskStatus = 'open'; // Default for agent-created tasks
  let statusReason = 'AI Agent created task - set to open for immediate processing';

  // Analyze problem description for status indicators
  const inProgressKeywords = [
    'currently working on', 'technician assigned', 'in progress', 'being fixed',
    'repair in progress', 'service ongoing', 'work started'
  ];

  const pendingKeywords = [
    'waiting for', 'pending approval', 'need to schedule', 'awaiting parts',
    'on hold', 'delayed', 'postponed', 'scheduling required'
  ];

  const completedKeywords = [
    'fixed', 'repaired', 'completed', 'resolved', 'working now', 'problem solved',
    'issue resolved', 'back to normal', 'functioning properly'
  ];

  // Check for status indicators (only if they're very clear)
  const inProgressMatches = inProgressKeywords.filter(keyword => lowerProblem.includes(keyword));
  const pendingMatches = pendingKeywords.filter(keyword => lowerProblem.includes(keyword));
  const completedMatches = completedKeywords.filter(keyword => lowerProblem.includes(keyword));

  if (completedMatches.length > 0) {
    detectedStatus = 'completed';
    statusReason = `Task appears to be completed based on: ${completedMatches.join(', ')}`;
  } else if (inProgressMatches.length > 0) {
    detectedStatus = 'in_progress';
    statusReason = `Work appears to be in progress based on: ${inProgressMatches.join(', ')}`;
  } else if (pendingMatches.length > 0) {
    detectedStatus = 'pending';
    statusReason = `Task requires scheduling/preparation based on: ${pendingMatches.join(', ')}`;
  } else {
    // For most AI agent tasks, default to 'open' for immediate action
    detectedStatus = 'open';
    statusReason = 'New service request - set to open for immediate technician assignment';
  }

  // Priority Detection (existing logic)
  let detectedPriority: TaskPriority;
  let priorityReason: string;

  // Get keyword matches for priority detection
  const urgentMatches = urgentKeywords.filter(keyword => lowerProblem.includes(keyword));
  const highMatches = highPriorityKeywords.filter(keyword => lowerProblem.includes(keyword));
  const mediumMatches = mediumPriorityKeywords.filter(keyword => lowerProblem.includes(keyword));
  const lowMatches = lowPriorityKeywords.filter(keyword => lowerProblem.includes(keyword));

  // Check for urgent priority
  if (urgentMatches.length > 0 || (contextFactors.vulnerable && urgentMatches.length > 0)) {
    detectedPriority = 'urgent';
    priorityReason = `Emergency situation detected: ${urgentMatches.join(', ')}${contextFactors.vulnerable ? ' (vulnerable occupants)' : ''}`;
  }
  // Check for high priority with context escalation
  else if (highMatches.length > 0 || contextFactors.weather || contextFactors.food || 
           (contextFactors.business && (urgentMatches.length > 0 || highMatches.length > 0))) {
    const escalationReasons = [];
    if (highMatches.length > 0) escalationReasons.push(highMatches.join(', '));
    if (contextFactors.weather) escalationReasons.push('hot weather conditions');
    if (contextFactors.business && (urgentMatches.length > 0 || highMatches.length > 0)) {
      escalationReasons.push('business establishment with service issue');
    }
    if (contextFactors.food) escalationReasons.push('food preservation concern');
    
    detectedPriority = 'high';
    priorityReason = `High priority due to: ${escalationReasons.join(', ')}`;
  }
  // Check for medium priority
  else if (mediumMatches.length > 0) {
    detectedPriority = 'medium';
    priorityReason = `Standard service issue: ${mediumMatches.join(', ')}`;
  }
  // Check for low priority
  else if (lowMatches.length > 0) {
    detectedPriority = 'low';
    priorityReason = `Routine service request: ${lowMatches.join(', ')}`;
  }
  // Default to existing priority or medium
  else {
    detectedPriority = existingPriority || 'medium';
    priorityReason = existingPriority 
      ? `Retained existing priority: ${existingPriority}`
      : 'Standard priority assignment (no clear indicators found)';
  }

  return {
    priority: detectedPriority,
    status: detectedStatus,
    priorityReason,
    statusReason
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📋 Task creation request received:', {
      customerName: body.customerName,
      source: body.source,
      priority: body.priority
    });

    // Validate the task data
    const validationResult = TaskCreationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid task data', 
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Enhanced AI Assessment for Priority and Status
    let finalPriority = validatedData.priority;
    let finalStatus = validatedData.status;
    let priorityReason = validatedData.aiPriorityReason || '';
    let statusReason = '';

    // Always run AI assessment for agent-created tasks to ensure proper prioritization and status
    const aiAssessment = await assessTaskWithAI(
      validatedData.problemDescription, 
      validatedData.location,
      validatedData.priority,
      validatedData.status
    );
    
    // Use AI-detected values unless explicitly overridden
    finalPriority = aiAssessment.priority;
    finalStatus = aiAssessment.status;
    priorityReason = aiAssessment.priorityReason;
    statusReason = aiAssessment.statusReason;

    // Prepare task creation request
    const taskCreateRequest: TaskCreateRequest = {
      customer_name: validatedData.customerName,
      phone_number: validatedData.phoneNumber,
      problem_description: validatedData.problemDescription,
      title: validatedData.title || `Service request: ${validatedData.problemDescription.substring(0, 50)}...`,
      description: validatedData.description || null,
      priority: finalPriority,
      status: finalStatus,
      source: validatedData.source,
      location: validatedData.location || null,
      category: validatedData.category || null,
      ai_priority_reason: priorityReason,
      urgency_keywords: validatedData.urgencyKeywords || null,
      estimated_duration: validatedData.estimatedDuration || null,
      due_date: validatedData.dueDate || null,
      chat_context: validatedData.chatContext || null,
      metadata: validatedData.metadata || {},
    };

    // Create task using Supabase service
    const result = await TaskService.createTask(taskCreateRequest);

    if (!result.success) {
      console.error('❌ Task creation failed:', result.error);
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to create task'
        },
        { status: 500 }
      );
    }

    const task = result.data!;

    console.log(`🎉 Task created successfully in Supabase:
      ID: ${task.id}
      Task Number: ${task.task_number}
      Customer: ${task.customer_name}
      Phone: ${task.phone_number}
      Problem: ${task.problem_description}
      Priority: ${task.priority} (${priorityReason})
      Status: ${task.status} (${statusReason})
      Location: ${task.location || 'Not specified'}
      Source: ${task.source}
      Created: ${task.created_at}`);

    // Return success response matching original API format
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      taskId: task.id,
      taskNumber: task.task_number,
      priority: task.priority,
      status: task.status,
      priorityReason: priorityReason,
      statusReason: statusReason,
      data: {
        id: task.id,
        taskNumber: task.task_number,
        customerName: task.customer_name,
        phoneNumber: task.phone_number,
        problemDescription: task.problem_description,
        priority: task.priority,
        status: task.status,
        location: task.location,
        source: task.source,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Task creation error:', error);

    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid task data', 
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create task. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // Get specific task
      const result = await TaskService.getTaskById(taskId);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error }, 
          { status: result.error === 'Task not found' ? 404 : 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        task: result.data
      });
    }

    // Get all tasks with optional filtering
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const limit = parseInt(searchParams.get('limit') || '100');

    const result = await TaskService.getAllTasks(
      status || undefined,
      priority || undefined,
      limit
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      tasks: result.data,
      count: result.data?.length || 0
    });

  } catch (error) {
    console.error('❌ Task retrieval error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve tasks'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}