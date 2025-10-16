import { NextRequest, NextResponse } from 'next/server';
import { ChatStateManager } from '@/lib/chat/chat-state';

/**
 * Clear chat session and start fresh conversation
 * DELETE /api/chat/clear
 */
export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Clear all chat state for this session
    await ChatStateManager.clearAllChatState(sessionId);

    console.log(`✨ Chat session cleared: ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Chat session cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat session:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat session' },
      { status: 500 }
    );
  }
}
