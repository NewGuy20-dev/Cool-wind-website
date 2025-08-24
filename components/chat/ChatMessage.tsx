'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, AlertTriangle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  const isUser = message.sender === 'user';

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mb-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
        }`}
      >
        {/* Escalation Warning */}
        {message.metadata?.escalated && (
          <div className="flex items-center space-x-1 mb-2 text-orange-600">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-medium">Escalated to human agent</span>
          </div>
        )}

        {/* Message Text */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>

        {/* Message Metadata */}
        <div className="flex items-center justify-between mt-2">
          <div className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </div>
          
          {/* Confidence Indicator for Bot Messages */}
          {isBot && message.metadata?.confidence && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                message.metadata.confidence > 0.8 ? 'bg-green-500' :
                message.metadata.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-400">
                {Math.round(message.metadata.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        {isBot && message.metadata?.category && (
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              message.metadata.category === 'spare_parts_inquiry' ? 'bg-blue-100 text-blue-800' :
              message.metadata.category === 'service_request' ? 'bg-green-100 text-green-800' :
              message.metadata.category === 'sales_inquiry' ? 'bg-purple-100 text-purple-800' :
              message.metadata.category === 'emergency' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {message.metadata.category.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 mb-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};