'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Phone, MessageSquare, RefreshCw } from 'lucide-react';
import { ChatMessage, QuickReply } from '@/lib/types/chat';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { QuickReplies } from './QuickReplies';
import { TypingIndicator } from './TypingIndicator';

interface ChatWidgetProps {
  className?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // Try to restore sessionId from cookie first, then sessionStorage
    if (typeof window !== 'undefined') {
      // Check cookie first (most reliable)
      const cookieMatch = document.cookie.match(/chat_session_id=([^;]+)/);
      if (cookieMatch) {
        console.log('🍪 Restored sessionId from cookie:', cookieMatch[1]);
        return cookieMatch[1];
      }
      // Fallback to sessionStorage
      const stored = sessionStorage.getItem('chat_session_id');
      if (stored) {
        console.log('💾 Restored sessionId from sessionStorage:', stored);
        return stored;
      }
    }
    return null;
  });
  const [userId] = useState<string>(() => {
    // Try to restore userId from sessionStorage, or generate new one
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('chat_user_id');
      if (stored) return stored;
      const newId = 'user-' + Date.now();
      sessionStorage.setItem('chat_user_id', newId);
      return newId;
    }
    return 'user-' + Date.now();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string | null>(sessionId);

  // Clear chat and start new conversation
  const clearChat = async () => {
    const currentSessionId = sessionIdRef.current || sessionId;
    
    // Call API to clear server-side state
    if (currentSessionId) {
      try {
        await fetch('/api/chat/clear', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId })
        });
        console.log('🗑️ Server-side state cleared');
      } catch (error) {
        console.error('Failed to clear server state:', error);
      }
    }
    
    // Clear messages
    setMessages([]);
    setQuickReplies([]);
    
    // Clear session
    setSessionId(null);
    sessionIdRef.current = null;
    
    // Clear storage
    if (typeof window !== 'undefined') {
      // Clear cookie
      document.cookie = 'chat_session_id=; path=/; max-age=0';
      console.log('🗑️ Cleared session cookie');
      
      // Clear sessionStorage
      sessionStorage.removeItem('chat_session_id');
      sessionStorage.removeItem('chat_user_id');
      console.log('🗑️ Cleared sessionStorage');
    }
    
    // Show welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      text: "Hello! I'm here to help you with Cool Wind Services. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
    setQuickReplies([
      { text: "🔧 Need Repair Service", value: "repair_service" },
      { text: "📦 Order Spare Parts", value: "spare_parts" },
      { text: "🛒 Buy Appliances", value: "sales" },
      { text: "❓ General Question", value: "general" }
    ]);
    
    console.log('✨ Chat cleared, new conversation started');
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: "Hello! I'm here to help you with Cool Wind Services. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
      setQuickReplies([
        { text: "🔧 Need Repair Service", value: "repair_service" },
        { text: "📦 Order Spare Parts", value: "spare_parts" },
        { text: "🛒 Buy Appliances", value: "sales" },
        { text: "❓ General Question", value: "general" }
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    setQuickReplies([]);

    try {
      // Use ref to get the most current sessionId
      const currentSessionId = sessionIdRef.current || sessionId;
      
      console.log('📤 Sending message:', {
        message: message.substring(0, 50),
        sessionId: currentSessionId,
        userId
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: currentSessionId,
          userId // Use the persistent userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update session ID (always update to ensure we have the latest)
      if (data.sessionId) {
        console.log('📥 Received sessionId:', data.sessionId);
        setSessionId(data.sessionId);
        sessionIdRef.current = data.sessionId; // Update ref immediately
        
        // Persist to both cookie and sessionStorage for redundancy
        if (typeof window !== 'undefined') {
          // Set cookie (primary method)
          document.cookie = `chat_session_id=${data.sessionId}; path=/; max-age=${60 * 30}; SameSite=Lax`;
          console.log('🍪 Saved to cookie:', data.sessionId);
          
          // Also save to sessionStorage (backup)
          sessionStorage.setItem('chat_session_id', data.sessionId);
          console.log('💾 Saved to sessionStorage:', data.sessionId);
        }
      }

      // Add bot response
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        text: data.response.text,
        sender: 'bot',
        timestamp: new Date(),
        type: data.response.quickReplies?.length > 0 ? 'quick_reply' : 'text',
        metadata: {
          category: data.intent?.name?.toLowerCase(),
          confidence: data.intent?.confidence,
          escalated: data.escalated
        }
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Set quick replies if available
      if (data.response.quickReplies) {
        setQuickReplies(data.response.quickReplies);
      }

      // Handle actions
      if (data.response.actions) {
        handleActions(data.response.actions);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        text: "I'm having trouble connecting. Please call us at +91 85472 29991 for immediate assistance.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setQuickReplies([
        { text: "📞 Call Now", action: "tel:+918547229991" },
        { text: "💬 WhatsApp", action: "https://wa.me/918547229991" }
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (reply.action) {
      // Handle external actions
      if (reply.action.startsWith('tel:')) {
        window.open(reply.action);
      } else if (reply.action.startsWith('https://')) {
        window.open(reply.action, '_blank');
      }
    } else if (reply.value) {
      // Send as message
      sendMessage(reply.text);
    }
  };

  const handleActions = (actions: any[]) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'escalate':
          // Handle escalation - could trigger notification to human agents
          console.log('Escalation triggered:', action.reason);
          break;
        case 'lead_capture':
          // Handle lead capture
          console.log('Lead captured:', action.data);
          break;
        default:
          console.log('Unknown action:', action);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-44 right-4 md:bottom-44 md:right-6 z-50 ${className}`}>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              1
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                         className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col overflow-hidden border border-gray-200 md:w-96 md:h-[500px] chat-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Cool Wind Services</h3>
                  <p className="text-xs text-blue-100">Expert AC & Refrigerator Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                  aria-label="New conversation"
                  title="Start new conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <ChatMessageComponent key={message.id} message={message} />
              ))}
              
              {isTyping && <TypingIndicator />}
              
              {quickReplies.length > 0 && !isTyping && (
                <QuickReplies replies={quickReplies} onReplyClick={handleQuickReply} />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Emergency Contact */}
              <div className="mt-2 flex items-center justify-center space-x-4">
                <a
                  href="tel:+918547229991"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Now</span>
                </a>
                <a
                  href="https://wa.me/918547229991"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-700 flex items-center space-x-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile fullscreen overlay */}
      <style jsx>{`
        @media (max-width: 768px) {
          .chat-window {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 100px !important;
            width: 100% !important;
            height: calc(100vh - 100px) !important;
            border-radius: 0 !important;
            z-index: 60 !important;
          }
        }
      `}</style>
    </div>
  );
};