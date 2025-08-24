import { NextRequest, NextResponse } from 'next/server';
import { autoCreateTaskFromChatWithAI, autoCreateTaskFromChat } from '../../../../lib/failed-calls-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phoneNumber, conversationContext, urgencyKeywords, customerInfo, useAI = true } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !conversationContext) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, phoneNumber, conversationContext' },
        { status: 400 }
      );
    }

    let newTask;
    
    // Use AI-powered priority analysis by default
    if (useAI) {
      try {
        newTask = await autoCreateTaskFromChatWithAI(
          customerName,
          phoneNumber,
          conversationContext,
          urgencyKeywords || [],
          customerInfo
        );
      } catch (aiError) {
        console.error('AI analysis failed, falling back to keyword-based:', aiError);
        // Fallback to keyword-based analysis
        newTask = autoCreateTaskFromChat(
          customerName,
          phoneNumber,
          conversationContext,
          urgencyKeywords || []
        );
      }
    } else {
      // Use legacy keyword-based method if AI is disabled
      newTask = autoCreateTaskFromChat(
        customerName,
        phoneNumber,
        conversationContext,
        urgencyKeywords || []
      );
    }

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create task from chat context' },
        { status: 500 }
      );
    }

    // Generate customer-friendly response based on AI priority
    let responseMessage = 'Failed call has been logged for follow-up';
    let responseTimeframe = 'soon';
    
    if (newTask.aiPriorityScore) {
      switch (newTask.aiPriorityScore) {
        case 1:
          responseMessage = 'Your urgent request has been logged for immediate attention';
          responseTimeframe = 'within the next few hours';
          break;
        case 2:
          responseMessage = 'Your service request has been logged for follow-up';
          responseTimeframe = 'within 24 hours';
          break;
        case 3:
          responseMessage = 'Your request has been logged and will be addressed';
          responseTimeframe = 'within 2-3 business days';
          break;
      }
    }

    // Return success without revealing internal task details (for chat agent)
    return NextResponse.json({
      success: true,
      message: responseMessage,
      responseTimeframe,
      taskId: newTask.id,
      priority: newTask.priority,
      // Include AI tags for debugging (won't be shown to customer)
      aiTags: newTask.aiTags,
      estimatedResponseTime: newTask.estimatedResponseTime
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