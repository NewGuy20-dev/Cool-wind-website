import { NextRequest, NextResponse } from 'next/server';
import { autoCreateTaskFromChat } from '../../../../lib/failed-calls-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phoneNumber, conversationContext, urgencyKeywords } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !conversationContext) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, phoneNumber, conversationContext' },
        { status: 400 }
      );
    }

    // Create task automatically based on conversation context
    const newTask = autoCreateTaskFromChat(
      customerName,
      phoneNumber,
      conversationContext,
      urgencyKeywords || []
    );

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create task from chat context' },
        { status: 500 }
      );
    }

    // Return success without revealing internal task details (for chat agent)
    return NextResponse.json({
      success: true,
      message: 'Failed call has been logged for follow-up',
      taskId: newTask.id,
      priority: newTask.priority
    }, { status: 201 });
  } catch (error) {
    console.error('Error auto-creating task from chat:', error);
    return NextResponse.json(
      { error: 'Failed to process failed call report' },
      { status: 500 }
    );
  }
}

// Helper endpoint to detect failed call patterns in text (for chat agent)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageText } = body;

    if (!messageText) {
      return NextResponse.json(
        { error: 'Missing messageText field' },
        { status: 400 }
      );
    }

    // Define patterns that indicate failed call attempts
    const failedCallPatterns = [
      /tried calling.*no answer/i,
      /couldn't reach you/i,
      /phone went to voicemail/i,
      /no one picked up/i,
      /called but didn't get through/i,
      /tried to call.*didn't answer/i,
      /attempted to call.*unsuccessful/i,
      /failed to reach/i,
      /unable to contact/i,
      /couldn't get through/i,
      /called.*no response/i,
      /dialed.*voicemail/i
    ];

    // Check if any pattern matches
    const hasFailedCallIndicator = failedCallPatterns.some(pattern => 
      pattern.test(messageText)
    );

    // Extract urgency keywords
    const urgencyKeywords = [];
    const highUrgencyWords = ['emergency', 'urgent', 'critical', 'asap', 'immediately'];
    const lowUrgencyWords = ['when convenient', 'no rush', 'whenever'];
    
    const messageLower = messageText.toLowerCase();
    
    for (const word of highUrgencyWords) {
      if (messageLower.includes(word)) {
        urgencyKeywords.push(word);
      }
    }
    
    for (const word of lowUrgencyWords) {
      if (messageLower.includes(word)) {
        urgencyKeywords.push(word);
      }
    }

    return NextResponse.json({
      hasFailedCallIndicator,
      urgencyKeywords,
      suggestedPriority: urgencyKeywords.some(word => 
        ['emergency', 'urgent', 'critical', 'asap', 'immediately'].includes(word)
      ) ? 'high' : urgencyKeywords.some(word => 
        ['when convenient', 'no rush', 'whenever'].includes(word)
      ) ? 'low' : 'medium'
    });
  } catch (error) {
    console.error('Error analyzing message for failed call patterns:', error);
    return NextResponse.json(
      { error: 'Failed to analyze message' },
      { status: 500 }
    );
  }
}